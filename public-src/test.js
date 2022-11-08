
import Log from '../helper/logHelper'
import DateHelper from '../helper/dateHelper'
import ImageHelper from '../helper/imageHelper'
const log = Log.create('load.log')

import ImageSaver from '../loadDatabase/loadImagesIldar'
const imageSaver = new ImageSaver()
const imagesFolder = '../loadDatabase/out/out_storage/persons'

import googleParser from '../loadDatabase/xlsGoogleParserPersons'

import personsModel from '../models/personsModel'
import StrHelper from '../helper/strHelper'
import GeoHelper from '../helper/geoHelper'
import inetHelper from '../helper/inetHelper'
import JsHelper from '../helper/jsHelper'
import { exit } from 'shelljs'

const input = '17 сентября17 сентября/23 декабря17 сентября17 сентября/23 декабря/19 июля17 сентября17 сентября/23 декабря17 сентября17 сентября/23 декабря/19 июля/1 августа'
const worshipDays = googleParser.getWorshipDates(input)
console.log(JSON.stringify(worshipDays))
exit(0)


//"lat": 54.73333,
//"lon": 55.96667

InetHelper.loadCoords()
InetHelper.trimNames()

const testAsync = async function testAsync() {

  const geo = GeoHelper.getCoordsFromHumanCoords('54°73′ с. ш. 55°96′ в. д.')
  const geo2 = GeoHelper.getCoordsFromHumanCoords('54.73333_55.96667')
  const geo3 = InetHelper.getLonLatSavedCoords('Уфа')

  console.log('Координата до вики')
  const geo4 = await InetHelper.getCoordsForCityOrCountry('или 1715 Тобольск  Русское царство')
  if (geo4) {
    console.log(`Координата из вики: ${JSON.stringify(geo4)}`)
  }
  console.log('Координата после вики')

  console.log(geo)
  console.log(geo2)
  console.log(geo3)

  console.log(GeoHelper.fromLonLat(geo))
  console.log(GeoHelper.fromLonLat(geo2))
  console.log(GeoHelper.fromLonLat(geo3))

}

testAsync()
setTimeout(() => InetHelper.saveCoords(), 2000)

// const testUrl = 'https://balashovblag.ru/images/019_2017_9_6_22_10_32_1795892298.jpg'
// ImageHelper.loadImageToFile(testUrl, imagesFolder, 'test')
//   .then(res => console.log(`test is finished ${res}`))
//   .catch(err => {
//     console.log(`Error in loadImageToFile ${err}`)
//   })


log.info(JSON.stringify(GeoHelper.fromLonLat(GeoHelper.getCoordsFromHumanCoords('37°47′11″ ю. ш. 29°15′35″ з. д.'))))

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