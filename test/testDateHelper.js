import Log from '../helper/logHelper.js'
const log = Log.create()
import DateHelper from '../helper/dateHelper.js'
import StrHelper from '../helper/strHelper.js'
import assert from 'assert'
import moment from 'moment'

const it_name = (v) => {
  return `${v[0]} == ${v[1]}`
}

const check_equal = (v, func) => {
  if (Array.isArray(v[1])) {
    assert.strictEqual(func(v[0]).join(), v[1].join())
  } else if (v[1] && typeof v[1].isoWeekday === 'function') {
    if (!func(v[0]).isSame(v[1])) {
      log.warn(`${func(v[0])} ${v[1]}, result: ${func(v[0]).isSame(v[1])}`)
    }
    assert.strictEqual(true, func(v[0]).isSame(v[1]))
  } else {
    assert.strictEqual(func(v[0]), v[1])
  }
}

describe('without equal value', () => {
  const v = ['01(05). 05 . 23', '01. 05 . 23']
  it(it_name(v), () => {
    check_equal(v, StrHelper.ignoreEqualsValue)
  })
})

describe('without spaces', () => {
  const v = ['01(05). 05 . 23', '01(05).05.23']
  it(it_name(v), () => {
    check_equal(v, StrHelper.ignoreSpaces)
  })
})

describe('without multiple equals', () => {
  const v = ['01(05).05(10).24', '01.05.24']
  it(it_name(v), () => {
    check_equal(v, StrHelper.ignoreEqualsValue)
  })
})

describe('check getTwoStringByLastDelim', () => {
  const v = ['hello everybody. something', ['hello everybody', 'something']]
  it(it_name(v), () => {
    check_equal(v, StrHelper.getTwoStringByLastDelim)
  })
})

describe('check undefined alterDate', () => {
  const v = [undefined, undefined]
  it(it_name(v), () => {
    check_equal(v, DateHelper.ignoreAlterDate)
  })
})

describe('check  alterDate', () => {
  const v = ['01(05).05(10).24', moment.utc('01.05.1924', 'DD.MM.YYYY')]
  it(it_name(v), () => {
    check_equal(v, DateHelper.ignoreAlterDate)
  })

  const v2 = ['01.05(02.12).24', moment.utc('01.05.1924', 'DD.MM.YYYY')]
  it(it_name(v2), () => {
    check_equal(v2, DateHelper.ignoreAlterDate)
  })

  const v3 = ['01-05(02-12)-24', moment.utc('01.05.1924', 'DD.MM.YYYY')]
  it(it_name(v3), () => {
    check_equal(v3, DateHelper.ignoreAlterDate)
  })

  const v4 = ['1924', moment.utc('01.01.1924', 'DD.MM.YYYY')]
  it(it_name(v4), () => {
    check_equal(v4, DateHelper.ignoreAlterDate)
  })

  const v5 = ['1924', moment.utc('01.01.1954', 'DD.MM.YYYY')]
  it(`False equal dates ${it_name(v5)}`, () => {
    assert.equal(false, DateHelper.ignoreAlterDate(v5[0]).isSame(v5[1]))
  })
})

describe('test human date', () => {
  const v5 = ['авг 1924', moment.utc('01.08.1924', 'DD.MM.YYYY')]
  it(it_name(v5), () => {
    check_equal(v5, DateHelper.ignoreAlterDate)
  })
})

describe('test century date', () => {
  const v5 = ['авг 1924', moment.utc('01.08.1924', 'DD.MM.YYYY')]
  it(it_name(v5), () => {
    check_equal(v5, DateHelper.ignoreAlterDate)
  })
})


describe('test mocha test system', () => {
  it('test assert', () => {
    assert.equal(false, false)
    assert.equal(true, true)
    assert.equal(undefined, undefined)
  })
})
