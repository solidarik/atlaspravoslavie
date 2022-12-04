import XlsHelper from '../helper/xlsHelper.js'
import assert from 'assert'

describe('check excel functions', () => {

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