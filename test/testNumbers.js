import StrHelper from '../helper/strHelper.js'
import assert from 'assert'

describe('getNumber return number', () => {
  it('simple test', () => {
    assert.equal(0, StrHelper.getNumber('0'))
    assert.equal(10, StrHelper.getNumber('10'))
    assert.equal(10, StrHelper.getNumber('10 + 20'))
    assert.notEqual(10, StrHelper.getNumber('1000'))
  })

  it('mnemonic test', () => {
    assert.equal(10, StrHelper.getNumber('более 10'))
  })
})
