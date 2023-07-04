
import chalk from 'chalk'
import Log from '../helper/logHelper.js'
import FileHelper from '../helper/fileHelper.js'
import templesModel from '../models/templesModel.js'
import personsModel from '../models/chronosTempleModel.js'
import chronosTempleModel from '../models/chronosTempleModel.js'
import chronosModel from '../models/chronosModel.js'
import DateHelper from '../helper/dateHelper.js'
import StrHelper from '../helper/strHelper.js'
import fs from 'fs'

import DbHelper from '../loadDatabase/dbHelper.js'

if (FileHelper.isFileExists('load.log')) {
    FileHelper.deleteFile('load.log')
}

const log = Log.create('load.log')
const dbHelper = new DbHelper(undefined, log)

function outputCounter(modelName, linkCounter, shortCaption, longCaption, isFileDelete = true) {
    const links = Object.keys(linkCounter)

    const outputFileName = FileHelper.composePath(`loadDatabase/dataSources/modelStat${modelName}.csv`)
    // if (isFileDelete && FileHelper.isFileExists(outputFileName)) {
    //     FileHelper.deleteFile(outputFileName)
    // }

    const logger = fs.createWriteStream(outputFileName, {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })
    logger.write('\ufeff')

    links.forEach(link => {
        logger.write([shortCaption, longCaption, link, linkCounter[link], '\n'].join(','))
    })
    logger.end()
}

let linkCounter = {}

async function getLinks(model, linkColumns, shortCaption, longCaption, isFileDelete = true) {
    let projectColumns = {}
    linkColumns.map(colName => projectColumns[colName] = 1)
    const docs = await model.find({}, projectColumns)
    let totalCount = 0
    for (let doc in docs) {
        for (let col in linkColumns) {
            const linkUrl = docs[doc][linkColumns[col]]
            if (!linkUrl || linkUrl.length < 2) continue
            const hostName = StrHelper.getHostName(linkUrl)
            if (!hostName) continue
            if (linkCounter[hostName]) {
                linkCounter[hostName] = linkCounter[hostName] + 1
            } else {
                linkCounter[hostName] = 1
            }
            totalCount += 1
        }
    }
    // const docsCount = docs.length
    console.log(`>>> Внешние ресурсы по коллекции ${shortCaption}, общее кол-во: ${totalCount}`)

    const modelName = model.collection.collectionName
    outputCounter(modelName, linkCounter, shortCaption, longCaption, isFileDelete)

}

Promise.resolve(true)
  .then(() => {
    return dbHelper.connect()
  })
  .then(async () => {
    await getLinks(templesModel, ['srcUrl'], 'Храмы', 'Ссылка на дополнительно', true)
  })
//   .then(async() => {
//     await getLinks(templesModel, ['templesUrl'], 'Храмы', 'Ссылка на храм (пока не используется)', false)
//   })
  .then(async() => {
    await getLinks(personsModel, ['srcUrl'], 'Святые', 'Ссылка на Подробнее...', true)
  })
  .then(async() => {
    await getLinks(chronosTempleModel, ['srcUrl'], 'События русской церкви', 'Ссылка на Подробнее...', true)
  })
  .then(async() => {
    await getLinks(chronosModel, ['srcUrl'], 'События Атласа', 'Ссылка на Подробнее...', true)
  })
  .then(() => {
    log.success(chalk.greenBright(`Окончание процесса загрузки ${DateHelper.nowToStr()}`))
    dbHelper.free()
  })
  .catch((err) => {
    dbHelper.free()
    log.error(`Ошибка загрузки данных: ${err}`)
  })



