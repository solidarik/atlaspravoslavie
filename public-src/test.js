const strHelper = require('../helper/strHelper')
const dateHelper = require('../helper/dateHelper')
const inetHelper = require('../helper/inetHelper')
const fileHelper = require('../helper/fileHelper')

const res0 = dateHelper.getDateFromInput('5.07.1898')
console.log(res0)

return

let input = 'Храм в честь иконы Пресвятой Богородицы "Всех скорбящих Радость" Омск, Омская обл.'

const res1 = strHelper.removeShortStrings(input, '', true)
const res2 = strHelper.removeShortStrings(input, '', false)

const checkedCoordsPath = fileHelper.composePath('..\\loadDatabase\\dataSources\\checkedCoords.json')

inetHelper.loadCoords(checkedCoordsPath)
const res3 = inetHelper.getSavedCoords(input)

console.log(checkedCoordsPath)
console.log(`res1 ${JSON.stringify(res1)}`)
console.log(`res2 ${JSON.stringify(res2)}`)
console.log(`res3 ${JSON.stringify(res3)}`)

return

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

