# Railgun TXID Syncer
FAFO R&D repo to explore syncing TXIDs directly from RPCs without call rtacing support

## Usage
FAFO scenarios are in `test` folder excluding `test/unit`.
Ethereum network tests expect the following to be set (you can use a `.env` file if desired):
```bash
PROVIDER="https://..... or ws://...."
PROXY_ADDRESS="0xDeployment_Proxy_Address"
```
