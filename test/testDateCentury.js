const Log = require('../helper/logHelper')
const log = Log.create()
const strHelper = require('../helper/strHelper')
const dateHelper = require('../helper/dateHelper')
const assert = require('assert')
const moment = require('moment')

const it_name = (v) => {
  return `${v[0]} == ${v[1]}`
}

const check_equal = (v, func) => {
  if (Array.isArray(v[1])) {
    assert.deepStrictEqual(func(v[0]).join(), v[1].join())
  } else if (v[1] && typeof v[1].isoWeekday === 'function') {
    if (!func(v[0]).isSame(v[1])) {
      log.warn(`${func(v[0])} ${v[1]}, result: ${func(v[0]).isSame(v[1])}`)
    }
    assert.deepStrictEqual(true, func(v[0]).isSame(v[1]))
  } else {
    assert.deepStrictEqual(func(v[0]), v[1])
  }
}

describe('1933 year = 20 century ', () => {
  const v = ['1933', 20]
  it(it_name(v), () => {
    check_equal(v, dateHelper.yearToCentury)
  })
})

describe('-1933 year = -20 century ', () => {
  const v = ['-1933', -20]
  it(it_name(v), () => {
    check_equal(v, dateHelper.yearToCentury)
  })
})

describe('100 year = 2 century ', () => {
  const v = ['100', 2]
  it(it_name(v), () => {
    check_equal(v, dateHelper.yearToCentury)
  })
})

describe('-100 year = -2 century ', () => {
  const v = ['-100', -2]
  it(it_name(v), () => {
    check_equal(v, dateHelper.yearToCentury)
  })
})

describe('-44 year = -1 century ', () => {
  const v = ['-44', -1]
  it(it_name(v), () => {
    check_equal(v, dateHelper.yearToCentury)
  })
})

describe('-122 year = -2 century ', () => {
  const v = ['-122', -2]
  it(it_name(v), () => {
    check_equal(v, dateHelper.yearToCentury)
  })
})

describe('2 century = II century ', () => {
  const v = ['2', 'II']
  it(it_name(v), () => {
    check_equal(v, dateHelper.intCenturyToStr)
  })
})

describe('5 century = V century ', () => {
  const v = ['5', 'V']
  it(it_name(v), () => {
    check_equal(v, dateHelper.intCenturyToStr)
  })
})

describe('-5 century = -V century ', () => {
  const v = ['-5', '-V']
  it(it_name(v), () => {
    check_equal(v, dateHelper.intCenturyToStr)
  })
})

describe('-1933 year = -XX', () => {
  it('check double function', () => {
    const century = dateHelper.yearToCentury('-1933')
    const centuryStr = dateHelper.intCenturyToStr(century)
    assert.deepStrictEqual(centuryStr, '-XX')
  })
})

describe('check roman to arabic', () => {
  it('check century roman to arabic', () => {
    assert.deepStrictEqual(dateHelper.romanToArabic('II'), 2)
    assert.deepStrictEqual(dateHelper.romanToArabic('blablalba'), undefined)
    assert.deepStrictEqual(dateHelper.romanToArabic('IV'), 4)
  })

  it('check getCenturyRange', () => {
    assert.deepStrictEqual(dateHelper.getCenturyRange(20), [1900, 1999])
    assert.deepStrictEqual(dateHelper.getCenturyRange(1), [0, 99])
    assert.deepStrictEqual(dateHelper.getCenturyRange(0), [0, 99])
  })

  it('check 1571 year to 16 century', () => {
    assert.deepStrictEqual(dateHelper.yearToCentury('1571'), 16)
  })

  it('check negative century', () => {
    assert.deepStrictEqual(dateHelper.getCenturyRange(-1), [-99, -0])
    assert.deepStrictEqual(dateHelper.getCenturyRange(-2), [-199, -100])
  })

  it('check zero century', () => {
    assert.deepStrictEqual(dateHelper.intCenturyToStr(0), 'I')
  })
})

