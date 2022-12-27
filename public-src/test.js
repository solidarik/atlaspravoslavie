
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


// const testUrl = 'https://balashovblag.ru/images/019_2017_9_6_22_10_32_1795892298.jpg'
// ImageHelper.loadImageToFile(testUrl, imagesFolder, 'test')
//   .then(res => console.log(`test is finished ${res}`))
//   .catch(err => {
//     console.log(`Error in loadImageToFile ${err}`)
//   })

(async function() {
  inetHelper.loadCoords()
  const humanCoords = await GeoHelper.getCoordsFromHumanCoords('47°18′45″ с. ш. 28°35′31″ в. д.')
  console.log(humanCoords)
  const coords = await inetHelper.searchCoordsByName('село Луппа Полтавской губернии')
  console.log(coords)
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