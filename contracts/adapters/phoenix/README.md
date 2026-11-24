# Phoenix Adapter

Adapter for the Phoenix multihop router (protocol id `1`). It converts the common token path into
Phoenix swap operations and checks deadlines and amounts before dispatch.

Build from the workspace root:

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release -p phoenix-adapter
```
