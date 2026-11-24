import { Address, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { AddressBook } from './utils/address_book.js';
import { invokeContract } from './utils/contract.js';
import { config } from './utils/env_config.js';
import { getCurrentTimePlusOneHour } from './utils/tx.js';

export async function testPhoenixAdapter(addressBook: AddressBook) {
  console.log('-------------------------------------------------------');
  console.log('Testing Phoenix Adapter');
  console.log('-------------------------------------------------------');

  const path = [
    'CDPU5TPNUMZ5JY3AUSENSINOEB324WI65AHI7PJBUKR3DJP2ULCBWQCS',
    'CCGCRYUTDRP52NOPS35FL7XIOZKKGQWSP3IYFE6B66KD4YOGJMWVC5PR',
  ];

  const swapParams: xdr.ScVal[] = [
    nativeToScVal(1000000000, { type: 'i128' }),
    nativeToScVal(0, { type: 'i128' }),
    xdr.ScVal.scvVec(path.map((token) => new Address(token).toScVal())),
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    nativeToScVal(getCurrentTimePlusOneHour(), { type: 'u64' }),
    xdr.ScVal.scvVoid(),
  ];

  await invokeContract(
    'phoenix_adapter',
    addressBook,
    'swap_exact_tokens_for_tokens',
    swapParams,
    loadedConfig.admin
  );
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);

const loadedConfig = config(network);

await testPhoenixAdapter(addressBook);
