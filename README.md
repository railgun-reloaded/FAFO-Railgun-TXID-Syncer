# Railgun TXID Syncer
FAFO R&D repo to explore syncing TXIDs directly from RPCs without call rtacing support

## Usage
FAFO scenarios are in `test` folder excluding `test/unit`.

Ethereum network tests use a default provider set in `test/constants.ts` that can be overridden by setting the ETHEREUM_PROVIDER environment variable (you can use a `.env` file if desired).

`test/exports` contains data exported from subsquid
