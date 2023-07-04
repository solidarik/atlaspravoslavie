
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
import DateHelper from '../helper/dateHelper.js'
import { exit } from 'shelljs'
import chronosTempleModel from '../models/chronosTempleModel.js'

const linkUrl = 'https://azbyka.ru//palomnik/%D0%9A%D1%83%D0%BA%D0%BB%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80%D1%8C_%D1%81%D0%B2%D1%8F%D1%82%D1%8B%D1%85_%D0%9A%D0%BE%D1%81%D0%BC%D1%8B_%D0%B8_%D0%94%D0%B0%D0%BC%D0%B8%D0%B0%D0%BD%D0%B0'

const res = StrHelper.getHostName(linuUrl)
console.log(res)
exit(0)

// const dateBirth = DateHelper.getDateFromInput('Константинополь, 985 г.')
// console.log(dateBirth)
// exit(0)

// console.log(StrHelper.isEndingByOr('html png', ['png']))
// exit(0)

let groups = undefined
groups = GeoHelper.getCoordsFromHumanCoords('31.522856, 34.455904')
console.log(JSON.stringify(groups))

groups = GeoHelper.getCoordsFromHumanCoords('57° с. ш. 41° в. д.')
console.log(JSON.stringify(groups))
groups = GeoHelper.getCoordsFromHumanCoords('35°25\' с.ш. 23°38\' в.д.')
console.log(JSON.stringify(groups))
groups = GeoHelper.getCoordsFromHumanCoords('55°17\' с.ш. и 50°29\' в.д.')
console.log(JSON.stringify(groups))

groups = GeoHelper.getCoordsFromHumanCoords('55°45′13″ с. ш. 37°37′11″ в. д.')
console.log(JSON.stringify(groups))

exit(0)

// 55.792165, 37.763223
let coords = GeoHelper.getCoordsFromHumanCoords('55°38′30″ с. ш. 37°21′30″ в. д.')
console.log(coords)

// coords = GeoHelper.getCoordsFromHumanCoords('55.3830 37.2130')
// console.log(coords)

coords = GeoHelper.getCoordsFromHumanCoords('55.3830, 37.2130')
console.log(coords)

exit(0)

const testUrl = 'https://drevo-info.ru/pictures/18814.html'
ImageHelper.loadImageToFile(testUrl, 'tempImgUrl.png', true)
  .then(res => {
    console.log(`test is finished ${JSON.stringify(res)}`)
    exit(0)
  })
  .catch(err => {
    console.log(`Error in loadImageToFile ${err}`)
  })


// exit(0)

(async function() {

  console.log(`IsExistUrl: ${await inetHelper.isExistUrl('ya.ru')}`)

  // const d = DateHelper.getDateFromInput('-1035')
  // console.log(d)

  // const coords = GeoHelper.getCoordsFromHumanCoords('55°38′30″ с. ш. 37°21′30″ в. д.')
  // console.log(coords)

  // inetHelper.loadCoords()
  // const humanCoords = await GeoHelper.getCoordsFromHumanCoords('47°18′45″ с. ш. 28°35′31″ в. д.')
  // console.log(humanCoords)
  // const coords = await inetHelper.searchCoordsByName('село Луппа Полтавской губернии')
  // console.log(coords)
  exit(0)
}
)()



// dbHelper.free()

inetHelper.getWikiPageId('Агапит Печерский').then(
  res => console.log(res)
)

imageSaver.start(personsModel, imagesFolder)
  .then(
    () => {
      console.log('finish')
      dbHelper.free()
    }
  )