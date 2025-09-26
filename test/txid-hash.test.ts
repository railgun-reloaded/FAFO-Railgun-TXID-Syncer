import { test } from 'brittle'

import { txidHash } from '../src/txid-hash'

test('Should hash TXIDs', (assert) => {
  const vectors = [
    {
      commitments: [1n, 2n],
      nullifiers: [3n, 4n],
      boundParamsHash: 5n,
      txidHash: 14287123277508529327750979990773096097618894834009087566098724348137357265894n
    }
  ]

  for (const vector of vectors) {
    assert.is(
      txidHash(vector.nullifiers, vector.commitments, vector.boundParamsHash),
      vector.txidHash,
      'Calculate TXID hash correctly for this vector'
    )
  }
})
