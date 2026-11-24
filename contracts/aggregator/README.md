# Soroswap Aggregator

Core Soroban aggregator contract. It stores the protocol adapter registry, splits an exact-input
or exact-output swap across DEXes by `parts`, validates paths and deadlines, and enforces aggregate
slippage limits.

Build and test from the workspace root:

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release -p soroswap-aggregator
cargo test -p soroswap-aggregator
```
