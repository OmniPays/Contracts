import { xdr } from '@stellar/stellar-sdk';
import { AddressBook } from './utils/address_book.js';
import { adapterVecToScVal, AdapterInput } from './utils/abi.js';
import { invokeContract } from './utils/contract.js';
import { config } from './utils/env_config.js';

export async function updateAdapters(addressBook: AddressBook, adapters: AdapterInput[]) {
  const adaptersVecScVal: xdr.ScVal = adapterVecToScVal(adapters);

  console.log('Updating Adapters');
  await invokeContract(
    'aggregator',
    addressBook,
    'update_adapters',
    [adaptersVecScVal],
    loadedConfig.admin
  );
}

const network = process.argv[2];
const loadedConfig = config(network);
