const Log = require('../helper/logHelper')
const log = Log.create()
const ImageHelper = require('../helper/imageHelper')

class ImageSaver {

    async start(dbModel, saveFolder) {

        try {

            dbItems = await dbModel.find({})

            let promises = []
            dbItems.forEach(dbItem => {
                dbModel.getImageObjects(dbItem).forEach(saveObject => {
                    promises.push(ImageHelper.loadImageToFile(saveFolder, saveObject.url, saveObject.fileName))
                })
            })

            resArr = await Promise.all(promises)
            successCount = 0
            resArr.forEach(res => {
                if (res.status) {
                    successCount += 1
                    log.info(`Successful save image ${res.url}`)
                } else
                    res.error && log.error(res.error)
                res.warning && log.warn(res.warning)
            })
            log.info(`Количество успешно обработанных элементов: ${successCount} из ${resArr.length}`)

        } catch (err) {
            log.error(`Error by saving photo ${err}`)
        }
    }

    free() {
        //   log.info('Free ImageSaver')
    }
}

module.exports = ImageSaver
