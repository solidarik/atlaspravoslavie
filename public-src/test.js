const strHelper = require('../helper/strHelper')

//let value = strHelper.generatePageUrl(['важно', '-', 'не обламаться'])

place = 'г. Бежецк , Тульская обл.'
place = place.replace(',', '').replace('"', '')
place = place.replace(/^\S{1,2}[.]+\s/g, '')

console.log(`>>>>>>>> ${place}`)
