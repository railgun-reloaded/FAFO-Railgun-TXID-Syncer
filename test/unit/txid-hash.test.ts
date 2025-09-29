import { test } from 'brittle'

import { txidHash } from '../../src/txid-hash'

test('Should hash TXIDs', (assert) => {
  const vectors = [
    {
      commitments: [
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000000000000000000000000000002',
      ],
      nullifiers: [
        '0x0000000000000000000000000000000000000000000000000000000000000003',
        '0x0000000000000000000000000000000000000000000000000000000000000004',
      ],
      boundParamsHash: '0x0000000000000000000000000000000000000000000000000000000000000005',
      txidHash: '0x1f9639a75d9aa09f959fb0f347da9a3afcbb09851c5cb398100d1721b5ed4be6'
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
