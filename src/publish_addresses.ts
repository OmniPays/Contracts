import { copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const sorobanDir = path.resolve(process.env.SOROBAN_ADDRESS_DIR || path.join(repoRoot, '.soroban'));
const publicDir = path.resolve(process.env.PUBLIC_ADDRESS_DIR || path.join(repoRoot, 'public'));

const supportedNetworks = ['mainnet', 'testnet', 'futurenet', 'standalone'];

function copyFile(source: string, destination: string) {
  copyFileSync(source, destination);
  console.log(`Copied ${path.basename(source)} to ${destination}`);
}

function main(network: string) {
  if (!existsSync(publicDir)) {
    console.log('Creating public directory...');
    mkdirSync(publicDir, { recursive: true });
  } else {
    console.log('Public directory already exists...');
  }

  const file = `${network}.contracts.json`;
  const sourcePath = path.join(sorobanDir, file);
  const destPath = path.join(publicDir, file);

  if (existsSync(sourcePath)) {
    copyFile(sourcePath, destPath);
  } else {
    console.warn(`Warning: File ${file} does not exist and cannot be copied.`);
  }
}

const network = process.argv[2];

if (!network) {
  console.error('Error: Network parameter is required.');
  process.exit(1);
}

if (!supportedNetworks.includes(network)) {
  console.error(`Error: Unsupported network '${network}'.`);
  process.exit(1);
}

main(network);
