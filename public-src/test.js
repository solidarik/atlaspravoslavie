const StrHelper = require('../helper/strHelper')
const DateHelper = require('../helper/dateHelper')

const DbHelper = require('../loadDatabase/dbHelper')
const TemplesModel = require('../models/templesModel')

const dbHelper = new DbHelper()

  ; (async function f() {
    let temples = await TemplesModel.find({})
    for (let temple in temples) {
      console.log('')
    }
    dbHelper.free()
  })()

return

const urlValue = '1,34,abc'
let numbers = urlValue.split(',')

const allowNumbers = [...Array(7).keys()];
console.log(allowNumbers)
numbers = numbers.map(n => parseInt(n))
numbers = numbers.filter(n => allowNumbers.includes(n))
console.log(numbers)
return numbers

const testValue = StrHelper.replaceEnd('hello my world', '_12345678')
console.log(testValue)

return

const InetHelper = require('../helper/inetHelper')

function deleteAbbrev(place) {
  if (!place)
    return undefined

  place = place.replace(',', '').replace('"', '')
  //по сути это контекст return place.replace(/^\S{1,2}[.]+\s/g, '')
  return place
}



InetHelper.getLocalCoordsForName(deleteAbbrev('Фессалия'))
  .then(res => {
    console.log(`result  ${res}`)
  })
  .catch(err => console.log(`error ${err}`))

