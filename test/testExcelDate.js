const dateHelper = require('../helper/dateHelper')
const assert = require('assert')

describe('check date input from excel', () => {
    const func = dateHelper.getDateFromInput


    it('17.04.1636', () => {
        const res = func('17.04.1636')
        assert.strictEqual(res['ymd'][0], 1636)
        assert.strictEqual(res['ymd'][1], 4)
        assert.strictEqual(res['ymd'][2], 17)
    })

    it('283', () => {
        const res = func('283')
        assert.strictEqual(res["ymd"][0], 283)
        assert.strictEqual(res["ymd"][1], -1)
        assert.strictEqual(res["ymd"][2], -1)
        assert.strictEqual(res["outputStr"], '283')
        assert.strictEqual(res["isOnlyYear"], true)
    })

    it('07.08.0626', () => {
        const res = func('07.08.0626')
        assert.strictEqual(res['ymd'][0], 626)
        assert.strictEqual(res['ymd'][1], 8)
        assert.strictEqual(res['ymd'][2], 7)
    })

    it('15 августа 1219 года', () => {
        const res = func('15 августа 1219 года')
        assert.strictEqual(res["ymd"][0], 1219)
        assert.strictEqual(res["ymd"][1], 8)
        assert.strictEqual(res["ymd"][2], 15)
    })

    it('24 июля 1330', () => {
        const res = func('24 июля 1330')
        assert.strictEqual(res["ymd"][0], 1330)
        assert.strictEqual(res["ymd"][1], 7)
        assert.strictEqual(res["ymd"][2], 24)
        assert.strictEqual(res["outputStr"], '24.07.1330')
    })

    it('19/02/1878', () => {
        const res = func('19/02/1878')
        assert.strictEqual(res["ymd"][0], 1878)
        assert.strictEqual(res["ymd"][1], 2)
        assert.strictEqual(res["ymd"][2], 19)
        assert.strictEqual(res["outputStr"], '19.02.1878')
    })

    it('1924', () => {
        const res = func('1924')
        assert.strictEqual(res["ymd"][0], 1924)
        assert.strictEqual(res["ymd"][1], -1)
        assert.strictEqual(res["ymd"][2], -1)
        assert.strictEqual(res["outputStr"], '1924')
        assert.strictEqual(res["isOnlyYear"], true)
    })

    it('100 до н.э.     ', () => {
        const res = func('100 до н.э.     ')
        assert.strictEqual(res["ymd"][0], -100)
        assert.strictEqual(res["century"], -2)
        assert.strictEqual(res["ymd"][1], -1)
        assert.strictEqual(res["ymd"][2], -1)
        assert.strictEqual(res["isOnlyYear"], true)
        assert.strictEqual(res["isUserText"], true)
    })

    it('5в', () => {
        const res = func('5в')
        assert.strictEqual(res['ymd'][0], -999)
        assert.strictEqual(res["ymd"][1], -1)
        assert.strictEqual(res["ymd"][2], -1)
        assert.strictEqual(res["isOnlyCentury"], true)
        assert.strictEqual(res["century"], 5)
    })

    it('100', () => {
        const res = func('100')
        assert.strictEqual(res['ymd'][0], 100)
        assert.strictEqual(res["ymd"][1], -1)
        assert.strictEqual(res["ymd"][2], -1)
        assert.strictEqual(res["isOnlyCentury"], false)
        assert.strictEqual(res["century"], 2)
    })
})
