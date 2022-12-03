import Log from '../helper/logHelper.js'
const log = Log.create()
import DateHelper from '../helper/dateHelper.js'
import assert from 'assert'

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
    check_equal(v, DateHelper.yearToCentury)
  })
})

describe('-1933 year = -20 century ', () => {
  const v = ['-1933', -20]
  it(it_name(v), () => {
    check_equal(v, DateHelper.yearToCentury)
  })
})

describe('100 year = 2 century ', () => {
  const v = ['100', 2]
  it(it_name(v), () => {
    check_equal(v, DateHelper.yearToCentury)
  })
})

describe('-100 year = -2 century ', () => {
  const v = ['-100', -2]
  it(it_name(v), () => {
    check_equal(v, DateHelper.yearToCentury)
  })
})

describe('-44 year = -1 century ', () => {
  const v = ['-44', -1]
  it(it_name(v), () => {
    check_equal(v, DateHelper.yearToCentury)
  })
})

describe('-122 year = -2 century ', () => {
  const v = ['-122', -2]
  it(it_name(v), () => {
    check_equal(v, DateHelper.yearToCentury)
  })
})

describe('2 century = II century ', () => {
  const v = ['2', 'II']
  it(it_name(v), () => {
    check_equal(v, DateHelper.intCenturyToStr)
  })
})

describe('5 century = V century ', () => {
  const v = ['5', 'V']
  it(it_name(v), () => {
    check_equal(v, DateHelper.intCenturyToStr)
  })
})

describe('-5 century = -V century ', () => {
  const v = ['-5', '-V']
  it(it_name(v), () => {
    check_equal(v, DateHelper.intCenturyToStr)
  })
})

describe('-1933 year = -XX', () => {
  it('check double function', () => {
    const century = DateHelper.yearToCentury('-1933')
    const centuryStr = DateHelper.intCenturyToStr(century)
    assert.deepStrictEqual(centuryStr, '-XX')
  })
})

describe('check roman to arabic', () => {
  it('check century roman to arabic', () => {
    assert.deepStrictEqual(DateHelper.romanToArabic('II'), 2)
    assert.deepStrictEqual(DateHelper.romanToArabic('blablalba'), undefined)
    assert.deepStrictEqual(DateHelper.romanToArabic('IV'), 4)
  })

  it('check getCenturyRange', () => {
    assert.deepStrictEqual(DateHelper.getCenturyRange(20), [1900, 1999])
    assert.deepStrictEqual(DateHelper.getCenturyRange(1), [0, 99])
    assert.deepStrictEqual(DateHelper.getCenturyRange(0), [0, 99])
  })

  it('check 1571 year to 16 century', () => {
    assert.deepStrictEqual(DateHelper.yearToCentury('1571'), 16)
  })

  it('check negative century', () => {
    assert.deepStrictEqual(DateHelper.getCenturyRange(-1), [-99, -0])
    assert.deepStrictEqual(DateHelper.getCenturyRange(-2), [-199, -100])
  })

  it('check zero century', () => {
    assert.deepStrictEqual(DateHelper.intCenturyToStr(0), 'I')
  })
})

