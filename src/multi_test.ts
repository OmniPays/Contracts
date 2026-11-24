import { Address, nativeToScVal, scValToNative, xdr } from '@stellar/stellar-sdk';
import { AddressBook } from './utils/address_book.js';
import { distributionVecToScVal } from './utils/abi.js';
import { invokeContract, invokeCustomContract } from './utils/contract.js';
import { config } from './utils/env_config.js';
import { getCurrentTimePlusOneHour } from './utils/tx.js';

export async function testAggregator(addressBook: AddressBook) {
  console.log('-------------------------------------------------------');
  console.log('Testing OmniPays Aggregator with multiple routes');
  console.log('-------------------------------------------------------');

  const usdcAddress = 'CCGCRYUTDRP52NOPS35FL7XIOZKKGQWSP3IYFE6B66KD4YOGJMWVC5PR';
  const xtarAddress = 'CDPU5TPNUMZ5JY3AUSENSINOEB324WI65AHI7PJBUKR3DJP2ULCBWQCS';

  console.log('Getting adapters');
  const adapters = await invokeContract(
    'aggregator',
    addressBook,
    'get_adapters',
    [],
    loadedConfig.admin,
    true
  );
  console.log('🚀 « adapters:', scValToNative(adapters.result.retval));

  console.log('-------------------------------------------------------');
  console.log('Starting Balances');
  console.log('-------------------------------------------------------');
  let usdcUserBalance = await invokeCustomContract(
    usdcAddress,
    'balance',
    [new Address(loadedConfig.admin.publicKey()).toScVal()],
    loadedConfig.admin,
    true
  );
  console.log('USDC USER BALANCE:', scValToNative(usdcUserBalance.result.retval));
  let xtarUserBalance = await invokeCustomContract(
    xtarAddress,
    'balance',
    [new Address(loadedConfig.admin.publicKey()).toScVal()],
    loadedConfig.admin,
    true
  );
  console.log('XTAR USER BALANCE:', scValToNative(xtarUserBalance.result.retval));

  const distribution = distributionVecToScVal([
    {
      protocol_id: 0,
      path: [xtarAddress, usdcAddress],
      parts: 60,
    },
    {
      protocol_id: 1,
      path: [xtarAddress, usdcAddress],
      parts: 40,
    },
  ]);

  const swapParams: xdr.ScVal[] = [
    new Address(xtarAddress).toScVal(),
    new Address(usdcAddress).toScVal(),
    nativeToScVal(1000000000, { type: 'i128' }),
    nativeToScVal(0, { type: 'i128' }),
    distribution,
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    nativeToScVal(getCurrentTimePlusOneHour(), { type: 'u64' }),
  ];

  console.log('Swapping exact tokens for tokens');
  await invokeContract(
    'aggregator',
    addressBook,
    'swap_exact_tokens_for_tokens',
    swapParams,
    loadedConfig.admin
  );

  console.log('-------------------------------------------------------');
  console.log('Ending Balances');
  console.log('-------------------------------------------------------');
  usdcUserBalance = await invokeCustomContract(
    usdcAddress,
    'balance',
    [new Address(loadedConfig.admin.publicKey()).toScVal()],
    loadedConfig.admin,
    true
  );
  console.log('USDC USER BALANCE:', scValToNative(usdcUserBalance.result.retval));
  xtarUserBalance = await invokeCustomContract(
    xtarAddress,
    'balance',
    [new Address(loadedConfig.admin.publicKey()).toScVal()],
    loadedConfig.admin,
    true
  );
  console.log('XTAR USER BALANCE:', scValToNative(xtarUserBalance.result.retval));
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);

const loadedConfig = config(network);

await testAggregator(addressBook);
