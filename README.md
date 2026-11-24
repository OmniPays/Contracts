# OmniPays Contracts

Soroban contracts for the OmniPays cross-DEX aggregator. The aggregator splits a swap across
multiple liquidity venues according to a caller-supplied distribution and delegates each hop to a
protocol-specific adapter.

## Architecture

- **`contracts/aggregator`** holds the adapter registry (`Adapter { protocol_id, router, paused }`),
  validates swap parameters, splits amounts by `parts`, calls adapters, and checks aggregate input
  and output limits. Its public enum is `Protocol { Soroswap = 0, Phoenix = 1, Aqua = 2, Comet = 3 }`.
- **`contracts/adapters/*`** implement the shared `AdapterTrait` (`initialize`, both swap
  directions, and read-only accessors). Each adapter translates the common swap call into the
  target DEX's router or pool interface. `DexDistribution` carries `protocol_id`, `path`, `parts`,
  and optional `bytes` (pool hashes for Aqua).
- **`contracts/deployer`** installs WASM and deploys/initializes contracts deterministically.
- **`contracts/test-utils`** provides shared Phoenix test fixtures for Rust tests.
- **`src/`** contains the TypeScript deployment, configuration, and manual integration scripts.

## Supported protocols

| ID | Protocol | Adapter | Underlying entry point | Published deployments |
| --- | --- | --- | --- | --- |
| 0 | Soroswap | `soroswap_adapter` | Soroswap router | Mainnet and testnet |
| 1 | Phoenix | `phoenix_adapter` | Phoenix multihop | Mainnet and testnet |
| 2 | Aqua | `aqua_adapter` | Aqua liquidity pool router | Mainnet |
| 3 | Comet | `comet_adapter` | Comet pool | Not published in `public/` |

Deadlines passed to the aggregator and to adapters are **Unix timestamps in seconds**, not
milliseconds. The aggregator requires `deadline > ledger timestamp` and validates that every path
has at least two tokens before dispatching swaps.

## Deployed contracts

Source of truth: [`public/mainnet.contracts.json`](./public/mainnet.contracts.json) and
[`public/testnet.contracts.json`](./public/testnet.contracts.json).

| Contract | Mainnet | Testnet |
| --- | --- | --- |
| deployer | `CALUZAZZ6FHENZJBQLSTPBZBZOZMACRIHMAEGSCGJYRC35RA5ZDXTKP2` | `CBY6WKJ2V2PSBZG5RVRSGC2VCZFFVZKHCGYXBLJ2HEOZJNXJ3SI7TOZB` |
| aggregator | `CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO` | `CC74XDT7UVLUZCELKBIYXFYIX6A6LGPWURJVUXGRPQO745RWX7WEURMA` |
| soroswap_adapter | `CC6KQUATUBCIFZRDJL5X5PHCYGOHLPHKZQPUOTZTQTASGU5AUQ6DS7SC` | `CCFXCAP7GT7XFTKGPENDZFN6MZ5VMPFONUHH46VKVN7E75C7FWA7NQ66` |
| phoenix_adapter | `CCEBUGFV3D73OMV7MUXXA43AREY53MUHVD5SMUM7YZODNGY4NZBA2TSC` | `CBQBQXFQAQ5BQH5RATLBVYE5OTRJFRFPC6WBQNPENI22UODKPL2BZZB5` |
| aqua_adapter | `CDHDUKHFZB6FORHEBZCNYI3GGVNVOLEITSGI7OKU4UIQND5QG75KGSRR` | not published |
| phoenix_multihop | not published | `CBAMPJTMNDXBBYYQ77C7WX2MTBR3XZHERDJ7NQMXLEZHMWUFQBQMFTOC` |
| phoenix_factory | not published | `CB6JW45DDEPUDUQI63AVYXD6UB72HMBGDAW7MZDZKZZIKAB7HL4LTNWO` |

## Setup

```bash
git clone --recurse-submodules https://github.com/OmniPays/Contracts.git
cd Contracts
cp .env.example .env
```

Fill in the RPC URLs and secret keys in `.env` before running any deployment script. Submodules are
only needed when rebuilding or redeploying the underlying DEX protocols.

## Build and test

Rust contracts:

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
cargo test
cargo fmt --all --check
```

The repository's Soroban SDK version predates current Rust releases; use the toolchain pinned by
the deployment environment if `cargo test` fails in a newer compiler.

TypeScript tooling:

```bash
npm install
npm run build
npx tsc --noEmit
```

`./test` and `./test.sh` only run a local TypeScript build and typecheck; they never deploy or
contact a network. Live integration tests are manual and must be invoked explicitly with
`npm run test:manual`.

## Deployment (manual)

`npm run deploy <network>` deploys the deployer and aggregator and registers the adapter addresses
already present in the local address book. Supported network names are `mainnet`, `testnet`,
`futurenet`, and `standalone`; RPC endpoints come from `configs.json` and `.env`. The Comet adapter
is registered only when `comet_pair` is present in the address book. Adapter contracts must be
deployed separately with `npm run deploy-{phoenix,aqua,comet}-adapter mainnet`; the Soroswap adapter
uses the core router address.

Deployment and live integration scripts submit real transactions. Check the target network and
funded accounts before running them; `yarn`/`npm` build scripts do not deploy on their own.

Supporting scripts:

```bash
bash scripts/quickstart.sh standalone   # or futurenet/testnet
bash scripts/run.sh                     # enter the preview container
bash scripts/deploySoroswap.sh testnet  # deploy the Soroswap submodule (optional)
npm run publish_addresses testnet       # copy .soroban addresses into public/
```

## Audits

- [Runtime Verification audit report](./audits/2024-08-31_Soroswap_Aggregator_Audit_by_RuntimeVerification.pdf)
- [Runtime Verification audit summary](./audits/2024-08-31_Soroswap_Aggregator_Audit_Summary_by_RuntimeVerification.pdf)

These reports cover the earlier aggregator release; review them together with the current contract
code before a production deployment.

## Security notes

- The admin can replace adapters and pause or remove protocols; protect the admin key accordingly.
- Never commit secret keys. `env_config.ts` does not print them, and errors should be reported by
  public key only.
- Swaps require authorization from the recipient (`to`), enforce per-swap deadlines, and check
  aggregate output/input limits after all adapter calls.
- Aqua routes require one 32-byte pool hash per hop in `bytes`; missing or mismatched hashes are
  rejected.
- Both swap entrypoints reject empty or single-token paths before dispatch.

## License

Apache License 2.0. See [LICENSE](./LICENSE).
