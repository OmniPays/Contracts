import { Address, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { PROTOCOL_IDS, Protocol } from './types.js';

export interface AdapterInput {
  protocol_id: number | Protocol;
  router: Address | string;
  paused: boolean;
}

export interface DexDistributionInput {
  protocol_id: number | Protocol;
  path: (Address | string)[];
  parts: number;
  bytes?: string[] | null;
}

export function protocolId(protocol: number | Protocol): number {
  return typeof protocol === 'number' ? protocol : PROTOCOL_IDS[protocol];
}

function asAddress(value: Address | string): Address {
  return typeof value === 'string' ? new Address(value) : value;
}

function asScVal(value: Address | string): xdr.ScVal {
  return asAddress(value).toScVal();
}

export function adapterToScVal(adapter: AdapterInput): xdr.ScVal {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('paused'),
      val: nativeToScVal(adapter.paused),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('protocol_id'),
      val: nativeToScVal(protocolId(adapter.protocol_id), { type: 'u32' }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('router'),
      val: asScVal(adapter.router),
    }),
  ]);
}

export function dexDistributionToScVal(distribution: DexDistributionInput): xdr.ScVal {
  let bytes = xdr.ScVal.scvVoid();
  if (distribution.bytes) {
    const hashes = distribution.bytes.map((hash) => {
      const decoded = Buffer.from(hash.replace(/^0x/, ''), 'hex');
      if (decoded.length !== 32) {
        throw new Error(`Expected a 32-byte pool hash, got ${hash}`);
      }
      return xdr.ScVal.scvBytes(decoded);
    });
    bytes = xdr.ScVal.scvVec(hashes);
  }

  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('bytes'),
      val: bytes,
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('parts'),
      val: nativeToScVal(distribution.parts, { type: 'u32' }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('path'),
      val: xdr.ScVal.scvVec(distribution.path.map(asScVal)),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('protocol_id'),
      val: nativeToScVal(protocolId(distribution.protocol_id), { type: 'u32' }),
    }),
  ]);
}

export function adapterVecToScVal(adapters: AdapterInput[]): xdr.ScVal {
  return xdr.ScVal.scvVec(adapters.map(adapterToScVal));
}

export function distributionVecToScVal(distributions: DexDistributionInput[]): xdr.ScVal {
  return xdr.ScVal.scvVec(distributions.map(dexDistributionToScVal));
}
