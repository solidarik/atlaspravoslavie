import Log from '../helper/logHelper.js'
import XlsGoogleParserPersons from '../loadDatabase/xlsGoogleParserPersons.js'
import DbHelper from '../loadDatabase/dbHelper.js'
import InetHelper from '../helper/inetHelper.js'
import FileHelper from '../helper/fileHelper.js'
import DateHelper from '../helper/dateHelper.js'
import chalk from 'chalk'
import { exit } from 'shelljs'

const logFileName = 'debug.log'
if (FileHelper.isFileExists(logFileName)) {
  FileHelper.deleteFile(logFileName)
}

// const testDate = DateHelper.getDateFromInput('20 июня ( 2 июля ) 1863')
// console.log(JSON.stringify(testDate))
// exit(0)


InetHelper.loadCoords()

const log = Log.create(logFileName)
const dbHelper = new DbHelper(undefined, log)

const xlsGoogleParserPersons = new XlsGoogleParserPersons(log)

const lineNumber = 5759
const fieldName = 'birth'

Promise.resolve(true)
  .then(() => {
    return dbHelper.connect()
  })
  .then(() => {
    log.success(chalk.greenBright(`Окончание процесса отладки ${DateHelper.nowToStr()}`))
    dbHelper.free()
  })
  .then(() => {
    return xlsGoogleParserPersons.getDebugInfo(lineNumber, fieldName)
  })
  .then((res) => {
    console.log(`Результат отладки: ${JSON.stringify(res)}`)
  })
  .catch((err) => {
    dbHelper.free()
    log.error(`Ошибка: ${err}`)
  })

