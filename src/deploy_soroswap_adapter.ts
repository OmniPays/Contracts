import { Address, nativeToScVal, scValToNative, xdr } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';
import { AddressBook } from './utils/address_book.js';
import { installContract, invokeContract } from './utils/contract.js';
import { config } from './utils/env_config.js';
import { updateAdapters } from './update_protocols.js';

export async function deploySoroswapAdapter(addressBook: AddressBook) {
  console.log('-------------------------------------------------------');
  console.log('Deploying Soroswap Adapter using the deployer');
  console.log('-------------------------------------------------------');
  await installContract('soroswap_adapter', addressBook, loadedConfig.admin);

  const soroswapRouterAddress = soroswapAddressBook.getContractId('router');
  const initArgs = xdr.ScVal.scvVec([
    xdr.ScVal.scvString('soroswap'),
    new Address(soroswapRouterAddress).toScVal(),
  ]);
  const deployParams: xdr.ScVal[] = [
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    nativeToScVal(Buffer.from(addressBook.getWasmHash('soroswap_adapter'), 'hex')),
    nativeToScVal(randomBytes(32)),
    xdr.ScVal.scvSymbol('initialize'),
    initArgs,
  ];

  const response = await invokeContract(
    'deployer',
    addressBook,
    'deploy',
    deployParams,
    loadedConfig.admin
  );
  const adapterAddress = scValToNative(response.returnValue)[0];
  console.log('🚀 « soroswapAdapterAddress:', adapterAddress);
  addressBook.setContractId('soroswap_adapter', adapterAddress);

  console.log('Updating adapters on aggregator.. adding Soroswap');
  await updateAdapters(addressBook, [
    { protocol_id: 0, router: soroswapRouterAddress, paused: false },
  ]);
}

const network = process.argv[2];
if (network !== 'mainnet') throw new Error('Only Mainnet is Supported');

const addressBook = AddressBook.loadFromFile(network);
const soroswapAddressBook = AddressBook.loadFromFile(
  network,
  '../../protocols/soroswap/public'
);
const loadedConfig = config(network);

await deploySoroswapAdapter(addressBook);
addressBook.writeToFile();
