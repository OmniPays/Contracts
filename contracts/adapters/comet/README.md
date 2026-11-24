# Comet Adapter

Adapter for Comet concentrated-liquidity pools (protocol id `3`). It implements `AdapterTrait`
against a single Comet pool and checks the deadline before swapping.

Build from the workspace root:

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release -p comet-adapter
```
