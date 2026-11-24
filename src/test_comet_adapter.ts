import { Address, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { AddressBook } from './utils/address_book.js';
import { invokeContract } from './utils/contract.js';
import { config } from './utils/env_config.js';
import { TokensBook } from './utils/tokens_book.js';
import { getCurrentTimePlusOneHour } from './utils/tx.js';

export async function testCometAdapter(addressBook: AddressBook) {
  console.log('-------------------------------------------------------');
  console.log('Testing Comet Adapter');
  console.log('-------------------------------------------------------');

  const tokens = TokensBook.loadFromFile().getTokensByNetwork(network);
  if (!tokens || tokens.length < 2) {
    throw new Error(`Need at least two ${network} tokens to test the Comet adapter`);
  }

  const path = [tokens[0].contract, tokens[1].contract];

  const swapParams: xdr.ScVal[] = [
    nativeToScVal(1000000000, { type: 'i128' }),
    nativeToScVal(0, { type: 'i128' }),
    xdr.ScVal.scvVec(path.map((token) => new Address(token).toScVal())),
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    nativeToScVal(getCurrentTimePlusOneHour(), { type: 'u64' }),
    xdr.ScVal.scvVoid(),
  ];

  await invokeContract(
    'comet_adapter',
    addressBook,
    'swap_exact_tokens_for_tokens',
    swapParams,
    loadedConfig.admin
  );
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);

const loadedConfig = config(network);

await testCometAdapter(addressBook);
