import StrHelper from '../helper/strHelper.js'
import assert from 'assert'

const f = (input) => StrHelper.generatePageUrl(input)
const f2 = (input) => StrHelper.getMaxLenNumber(input)
const f3 = StrHelper.replaceEnd

describe('replaceEnd', () => {
  it('simple replaceEnd', () => {
    assert.strictEqual(f3('hello my world', '_12345678'), 'hello_12345678')
  })
})

describe('getMaxNumbers', () => {
  it('simple number', () => {
    assert.equal('1924', f2('1924'))
  })

  it('simple two numbers', () => {
    assert.equal('19245', f2('25 19245 234'))
  })

  it('numbers in sample date', () => {
    assert.equal('19245', f2('2 авг. 19245'))
  })
})

describe('translit url', () => {
  it('simple string', () => {
    assert.equal('hello_world', f('hello world'))
  })

  it('array string', () => {
    assert.equal('hello_world_strana', f(['HELLO', 'World', 'страна']))
  })

  it('spec symbols', () => {
    assert.equal('da_zdravstvuet_mirnyiy_atom', f('да%здравствует%мирный%атом'))
  })

  it('unicode symbols', () => {
    assert.equal(
      'unicode_character_u_263a_',
      f(' Unicode Character “☺” (U+263A)')
    )
  })
})