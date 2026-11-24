# Soroswap Adapter

Adapter for the Soroswap V2 router (protocol id `0`). It implements the shared `AdapterTrait` swap
methods and enforces the caller-supplied deadline against the router.

Build from the workspace root:

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release -p soroswap-adapter
```
