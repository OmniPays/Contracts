# Aqua Adapter

Adapter for the Aqua liquidity-pool router (protocol id `2`). Each hop in `path` must have a
matching 32-byte pool hash in `bytes`; both swap directions are exposed through `AdapterTrait`.

Build from the workspace root:

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release -p aqua-adapter
```
