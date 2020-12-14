const strHelper = require('../helper/strHelper')

//let value = strHelper.generatePageUrl(['важно', '-', 'не обламаться'])

// place = 'г. Бежецк , Тульская обл.'
// place = place.replace(',', '').replace('"', '')
// place = place.replace(/^\S{1,2}[.]+\s/g, '')

days = [{'dateStr': '20 января'}, {'dateStr': '5 августа'}]

value = days.map((item) => item.dateStr).join(', ')

console.log(`>>>>>>>> ${value}`)
