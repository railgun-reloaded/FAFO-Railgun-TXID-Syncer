import { test } from 'brittle'

import { TokenType, commitmentHash } from '../../src/commitment-hash'

test('Should hash commitments', (assert) => {
  const vectors = [
    {
      npk: '0x4025ee6512dbbda97049bcf5aa5d38c54af6be8a',
      token: {
        type: TokenType.ERC20,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        subID: 0n
      },
      value: 41892345877756933n,
      hash: '0x05b4bce8aa21c2488839c68432c9ac969f4ee05d7649abd5d3b65e3b694e25d1'
    },
    {
      npk: '0x130ad793d9c19337ca0bf6981494f76ffcd6d2dd',
      token: {
        type: TokenType.ERC20,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        subID: 0n
      },
      value: 3000000000n,
      hash: '0x1277a760074b90c2de51ae6e8c677d07b6aa735158f791cacecbdd805a8e45da'
    }
  ]

  for (const vector of vectors) {
    assert.is(
      commitmentHash(vector.npk, vector.token, vector.value),
      vector.hash,
      'Calculate commitment hash correctly for this vector'
    )
  }
})
