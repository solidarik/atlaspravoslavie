import XlsHelper from '../helper/xlsHelper.js'
import assert from 'assert'

describe('check excel function getColumnNameByNumber', () => {
  const func = XlsHelper.getColumnNameByNumber

  it('simple char A,B,Z', () => {
    assert.strictEqual(func(1), 'A')
    assert.strictEqual(func(2), 'B')
    assert.strictEqual(func(26), 'Z')
  })

  it('double char AA,BB,ZZ', () => {
    assert.strictEqual(func(27), 'AA')
    assert.strictEqual(func(54), 'BB')
    assert.strictEqual(func(702), 'ZZ')
  })
})

describe('check excel function getColumnNameByNumber', () => {
  const func = XlsHelper.getColumnNumberByName

  it('simple char A,B,Z', () => {
    assert.strictEqual(func('A'), 1)
    assert.strictEqual(func('B'), 2)
    assert.strictEqual(func('Z'), 26)
  })

  it('double char AA,BB,ZZ', () => {
    assert.strictEqual(func('AA'), 27)
    assert.strictEqual(func('BB'), 54)
    assert.strictEqual(func('ZZ'), 702)
  })
})
