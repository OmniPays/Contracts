#!/usr/bin/env bash

set -euo pipefail

NETWORK="${1:-}"

if [ -z "$NETWORK" ]; then
    echo "Error: Network name must be provided."
    echo "Usage: $0 <network>"
    exit 1
fi

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$SCRIPT_DIR/../protocols/soroswap"

yarn
yarn build && yarn deploy "$NETWORK"
