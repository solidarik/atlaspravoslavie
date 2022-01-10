
const Log = require('../helper/logHelper')
const DateHelper = require('../helper/dateHelper')
const ImageHelper = require('../helper/imageHelper')
log = Log.create('load.log')

const ImageSaver = require('../loadDatabase/loadImagesIldar')
//const DbHelper = require('../loadDatabase/dbHelper')
//const dbHelper = new DbHelper(undefined, log)

const imageSaver = new ImageSaver()
const imagesFolder = '../loadDatabase/out/out_storage/persons'

const PersonsModel = require('../models/personsModel')
const TemplesModel = require('../models/templesModel')
const StrHelper = require('../helper/strHelper')
const GeoHelper = require('../helper/geoHelper')
const InetHelper = require('../helper/inetHelper')
const JsHelper = require('../helper/jsHelper')


const input = 'По еврейской традиции: 3138—2773 до н. э. По православной: 4387—4022 до н. э.'
const res = DateHelper.getDateFromInput(input)
console.log(res)
return


//"lat": 54.73333,
//"lon": 55.96667

const checkedCoordsPath = 'loadDatabase\\dataSources\\checkedCoords.json'

InetHelper.loadCoords(checkedCoordsPath)
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
setTimeout(() => InetHelper.saveCoords(checkedCoordsPath), 2000)
return

// const testUrl = 'https://balashovblag.ru/images/019_2017_9_6_22_10_32_1795892298.jpg'
// ImageHelper.loadImageToFile(testUrl, imagesFolder, 'test')
//   .then(res => console.log(`test is finished ${res}`))
//   .catch(err => {
//     console.log(`Error in loadImageToFile ${err}`)
//   })
// return


log.info(JSON.stringify(GeoHelper.fromLonLat(GeoHelper.getCoordsFromHumanCoords('37°47′11″ ю. ш. 29°15′35″ з. д.'))))

// dbHelper.free()
return

inetHelper.getWikiPageId('Агапит Печерский').then(
  res => console.log(res)
)

return

imageSaver.start(PersonsModel, imagesFolder)
  .then(
    () => {
      console.log('finish')
      dbHelper.free()
    }
  )

return