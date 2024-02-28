import chalk from 'chalk'
import Log from '../helper/logHelper.js'
import FileHelper from '../helper/fileHelper.js'

if (FileHelper.isFileExists('load.log')) {
    FileHelper.deleteFile('load.log')
}

const log = Log.create('load.log')
import DbHelper from '../loadDatabase/dbHelper.js'
import PersonsAggr from '../loadDatabase/personsAggr.js'
import InetHelper from '../helper/inetHelper.js'
import DateHelper from '../helper/dateHelper.js'

import XlsGoogleParserTemples from './xlsGoogleParserTemples.js'
import XlsGoogleParserPersons from './xlsGoogleParserPersons.js'
import XlsGoogleFixPersonUrls from './xlsGoogleFixPersonUrls.js'
import XlsGoogleCheckPersonImages from './xlsGoogleCheckPersonImages.js'
import XlsGoogleParserChronos from './xlsGoogleParserChronos.js'
import XlsGoogleParserChronosTemple from './xlsGoogleParserChronosTemple.js'

log.success(
    chalk.greenBright(`Запуск процесса загрузки ${DateHelper.nowToStr()}`)
)

InetHelper.loadCoords()

const dbHelper = new DbHelper(undefined, log)

const xlsGoogleParserTemples = new XlsGoogleParserTemples(log, false)
const xlsGoogleParserPersons = new XlsGoogleParserPersons(log, false)
const xlsGoogleParserChronos = new XlsGoogleParserChronos(log, false)
const xlsGoogleParserChronosTemple = new XlsGoogleParserChronosTemple(
    log,
    false
)

const xlsGoogleFixPersonUrls = new XlsGoogleFixPersonUrls(log)
const xlsGoogleCheckPersonImages = new XlsGoogleCheckPersonImages(log, 'store')

const personsAggr = new PersonsAggr()

// let loadMode = ['persons', 'chronos', 'temples', 'fixUrls', 'checkImages']
// let loadMode = ['checkImages']
let loadMode = ['persons', 'chronos', 'temples']

Promise.resolve(true)
    .then(async () => {
        await dbHelper.connect()

        if (loadMode.indexOf('chronos') > -1) {
            await xlsGoogleParserChronos.processData(dbHelper)
            await xlsGoogleParserChronosTemple.processData(dbHelper)
            await xlsGoogleParserTemples.processData(dbHelper)
        }

        if (loadMode.indexOf('fixUrls') > -1) {
            await xlsGoogleFixPersonUrls.processData()
        }

        if (loadMode.indexOf('persons') > -1) {
            await xlsGoogleParserPersons.processData(dbHelper)
            await dbHelper.clearDb('personsAggr')
            await personsAggr.start()
        }

        if (loadMode.indexOf('checkImages') > -1) {
            await xlsGoogleCheckPersonImages.processData()
        }

        return Promise.resolve(true)
    })
    .then(() => {
        log.success(
            chalk.greenBright(
                `Окончание процесса загрузки ${DateHelper.nowToStr()}`
            )
        )
        personsAggr.free()
        dbHelper.free()
        // InetHelper.saveCoords()
    })
    .catch((err) => {
        personsAggr.free()
        dbHelper.free()
        InetHelper.saveCoords()
        log.error(`Ошибка загрузки данных: ${err}`)
    })
