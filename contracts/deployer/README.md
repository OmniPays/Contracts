# Aggregator Deployer

Minimal Soroban factory used to upload contract WASM and deploy/initialize the aggregator and
adapters with caller-supplied salts and arguments.

Build with:

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release -p soroswap-aggregator-deployer
```
