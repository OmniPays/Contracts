import { Address, nativeToScVal, scValToNative, xdr } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';
import { AddressBook } from './utils/address_book.js';
import { adapterVecToScVal, AdapterInput } from './utils/abi.js';
import { airdropAccount, deployContract, installContract, invokeContract } from './utils/contract.js';
import { config } from './utils/env_config.js';

export async function deployAdaptersAndAggregator(addressBook: AddressBook) {
  await airdropAccount(loadedConfig.admin);

  console.log('-------------------------------------------------------');
  console.log('Deploying Deployer');
  console.log('-------------------------------------------------------');
  await installContract('deployer', addressBook, loadedConfig.admin);
  await deployContract('deployer', 'deployer', addressBook, loadedConfig.admin);

  const soroswapRouter = soroswapAddressBook.getContractId('router');
  const aquaRouter = aquaAddressBook.getContractId('aqua_router');
  const phoenixMultihop = network === 'mainnet'
    ? phoenixAddressBook.getContractId('phoenix_multihop')
    : addressBook.getContractId('phoenix_multihop');
  const cometPool = addressBook.hasContractId('comet_pair')
    ? addressBook.getContractId('comet_pair')
    : undefined;

  console.log('-------------------------------------------------------');
  console.log('Deploying Aggregator');
  console.log('-------------------------------------------------------');
  console.log('Installing Aggregator Contract');
  await installContract('aggregator', addressBook, loadedConfig.admin);

  const adapters: AdapterInput[] = [
    { protocol_id: 0, router: soroswapRouter, paused: false },
    { protocol_id: 1, router: phoenixMultihop, paused: false },
    { protocol_id: 2, router: aquaRouter, paused: false },
  ];

  if (cometPool) {
    adapters.push({ protocol_id: 3, router: cometPool, paused: false });
  } else {
    console.log('Skipping Comet adapter: no comet_pair in the address book');
  }

  const initAggregatorArgs: xdr.ScVal[] = [
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    adapterVecToScVal(adapters),
  ];

  const aggregatorDeployParams: xdr.ScVal[] = [
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    nativeToScVal(Buffer.from(addressBook.getWasmHash('aggregator'), 'hex')),
    nativeToScVal(randomBytes(32)),
    xdr.ScVal.scvSymbol('initialize'),
    xdr.ScVal.scvVec(initAggregatorArgs),
  ];

  const response = await invokeContract(
    'deployer',
    addressBook,
    'deploy',
    aggregatorDeployParams,
    loadedConfig.admin
  );

  const aggregatorAddress = scValToNative(response.returnValue)[0];
  console.log('🚀 « aggregatorAddress:', aggregatorAddress);
  addressBook.setContractId('aggregator', aggregatorAddress);
  console.log('Aggregator initialized');
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);

const protocolDir = network === 'standalone' ? '.soroban' : 'public';
const soroswapAddressBook = AddressBook.loadFromFile(
  network,
  `../../protocols/soroswap/${protocolDir}`
);
const phoenixAddressBook = AddressBook.loadFromFile(
  network,
  '../../protocols/phoenix-addresses'
);
const aquaAddressBook = AddressBook.loadFromFile(
  network,
  '../../protocols/aqua-addresses'
);

const loadedConfig = config(network);

await deployAdaptersAndAggregator(addressBook);
addressBook.writeToFile();
