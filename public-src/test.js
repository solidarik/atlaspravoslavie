
const Log = require('../helper/logHelper')
const ImageHelper = require('../helper/imageHelper')
log = Log.create('load.log')

const ImageSaver = require('../loadDatabase/loadImagesIldar')
const DbHelper = require('../loadDatabase/dbHelper')

const imageSaver = new ImageSaver()
const dbHelper = new DbHelper(undefined, log)
const imagesFolder = '../loadDatabase/out/out_storage/persons'

const PersonsModel = require('../models/personsModel')
const TemplesModel = require('../models/templesModel')
const StrHelper = require('../helper/strHelper')

const inetHelper = require('../helper/inetHelper')

// const testUrl = 'https://balashovblag.ru/images/019_2017_9_6_22_10_32_1795892298.jpg'
// ImageHelper.loadImageToFile(testUrl, imagesFolder, 'test')
//   .then(res => console.log(`test is finished ${res}`))
//   .catch(err => {
//     console.log(`Error in loadImageToFile ${err}`)
//   })
// return

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