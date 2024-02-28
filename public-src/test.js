import Log from '../helper/logHelper.js'
import XlsHelper from '../helper/xlsHelper.js'
import ImageHelper from '../helper/imageHelper.js'
const log = Log.create('load.log')

import ImageSaver from '../loadDatabase/loadImagesIldar.js'
const imageSaver = new ImageSaver()
const imagesFolder = '../loadDatabase/out/out_storage/persons'

import personsModel from '../models/personsModel.js'
import StrHelper from '../helper/strHelper.js'
import GeoHelper from '../helper/geoHelper.js'
import inetHelper from '../helper/inetHelper.js'
import JsHelper from '../helper/jsHelper.js'
import DateHelper from '../helper/dateHelfper.js'
import { exit } from 'shelljs'
import chronosTempleModel from '../models/chronosTempleModel.js'

// const linkUrl = 'https://azbyka.ru/days/assets/img/saints/5023/p1avbbk87h1im49ta53gur7tkm3.png'

// inetHelper.checkUrlStatusCode(linkUrl).then(res => {
//   console.log('test')
//   console.log(res)
//   exit(0)
// })

const dates = DateHelper.getWorshipDates('(2)15.12.')
console.log(dates)
// exit(0)

exit(0)

let groups = undefined
groups = GeoHelper.getCoordsFromHumanCoords('37.855088, 15.291087')
console.log(JSON.stringify(groups))

// const res = XlsHelper.getColumnNameByNumber(255)
// console.log(res)
// console.log(XlsHelper.getColumnNumberByName(res))
exit(0)

// const dateBirth = DateHelper.getDateFromInput('Константинополь, 985 г.')
// console.log(dateBirth)
// exit(0)

// console.log(StrHelper.isEndingByOr('html png', ['png']))
// exit(0)

// let groups = undefined
// groups = GeoHelper.getCoordsFromHumanCoords('31.522856, 34.455904')
// console.log(JSON.stringify(groups))

// groups = GeoHelper.getCoordsFromHumanCoords('57° с. ш. 41° в. д.')
// console.log(JSON.stringify(groups))
// groups = GeoHelper.getCoordsFromHumanCoords('35°25\' с.ш. 23°38\' в.д.')
// console.log(JSON.stringify(groups))
// groups = GeoHelper.getCoordsFromHumanCoords('55°17\' с.ш. и 50°29\' в.д.')
// console.log(JSON.stringify(groups))

// groups = GeoHelper.getCoordsFromHumanCoords('55°45′13″ с. ш. 37°37′11″ в. д.')
// console.log(JSON.stringify(groups))

// exit(0)

// // 55.792165, 37.763223
// let coords = GeoHelper.getCoordsFromHumanCoords('55°38′30″ с. ш. 37°21′30″ в. д.')
// console.log(coords)

// // coords = GeoHelper.getCoordsFromHumanCoords('55.3830 37.2130')
// // console.log(coords)

// coords = GeoHelper.getCoordsFromHumanCoords('55.3830, 37.2130')
// console.log(coords)

// exit(0)

// const testUrl = 'https://drevo-info.ru/pictures/18814.html'
// ImageHelper.loadImageToFile(testUrl, 'tempImgUrl.png', true)
//   .then(res => {
//     console.log(`test is finished ${JSON.stringify(res)}`)
//     exit(0)
//   })
//   .catch(err => {
//     console.log(`Error in loadImageToFile ${err}`)
//   })

// // exit(0)

// (async function() {

//   console.log(`IsExistUrl: ${await inetHelper.isExistUrl('ya.ru')}`)

//   // const d = DateHelper.getDateFromInput('-1035')
//   // console.log(d)

//   // const coords = GeoHelper.getCoordsFromHumanCoords('55°38′30″ с. ш. 37°21′30″ в. д.')
//   // console.log(coords)

//   // inetHelper.loadCoords()
//   // const humanCoords = await GeoHelper.getCoordsFromHumanCoords('47°18′45″ с. ш. 28°35′31″ в. д.')
//   // console.log(humanCoords)
//   // const coords = await inetHelper.searchCoordsByName('село Луппа Полтавской губернии')
//   // console.log(coords)
//   exit(0)
// }
// )()

// // dbHelper.free()

// inetHelper.getWikiPageId('Агапит Печерский').then(
//   res => console.log(res)
// )

// imageSaver.start(personsModel, imagesFolder)
//   .then(
//     () => {
//       console.log('finish')
//       dbHelper.free()
//     }
//   )
