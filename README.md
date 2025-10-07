# Railgun TXID Syncer

FAFO R&D repo to explore syncing TXIDs directly from RPCs without call tracing support

## Usage

FAFO scenarios are in `test/live.test.ts`

Ethereum network tests use a default provider set in `test/constants.ts` that can be overridden by setting the ETHEREUM_PROVIDER environment variable (you can use a `.env` file if desired).

`test/exports/ethereum.json` contains a formatted data export from a subsquid indexer between blocks 23430000 - 23440000 to use as reference data
