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

// import ChronosJsonMediator from '../loadDatabase/chronosJsonMediator.js'
// import ChronosTempleJsonMediator from './chronosTempleJsonMediator.js'
// import PersonsJsonMediator from '../loadDatabase/personsJsonMediator.js'
// import PersonsAggrJsonMediator from '../loadDatabase/personsAggrJsonMediator.js'
// import UsersJsonMediator from '../loadDatabase/usersJsonMediator.js'
// import TemplesJsonMediator from '../loadDatabase/templesJsonMediator.js'
import XlsGoogleParserTemples from './xlsGoogleParserTemples.js'
import XlsGoogleParserPersons from './xlsGoogleParserPersons.js'
import XlsGoogleFixPersonUrls from './xlsGoogleFixPersonUrls.js'
import XlsGoogleLoadPersonImages from './xlsGoogleLoadPersonImages.js'
import XlsGoogleParserChronos from './xlsGoogleParserChronos.js'
import XlsGoogleParserChronosTemple from './xlsGoogleParserChronosTemple.js'

log.success(
  chalk.greenBright(`Запуск процесса загрузки ${DateHelper.nowToStr()}`)
)

InetHelper.loadCoords()

const dbHelper = new DbHelper(undefined, log)
const xlsGoogleParserTemples = new XlsGoogleParserTemples(log)
const xlsGoogleParserPersons = new XlsGoogleParserPersons(log)
const xlsGoogleFixPersonUrls = new XlsGoogleFixPersonUrls(log)
const xlsGoogleLoadPersonImages = new XlsGoogleLoadPersonImages(log)
const xlsGoogleParserChronos = new XlsGoogleParserChronos(log)
const xlsGoogleParserChronosTemple = new XlsGoogleParserChronosTemple(log)
const personsAggr = new PersonsAggr()

Promise.resolve(true)
  .then(() => {
    return dbHelper.connect()
  })
  // .then(() => {
  //   return xlsGoogleParserChronos.processData(dbHelper)
  // })
  // .then(() => {
  //   return xlsGoogleParserChronosTemple.processData(dbHelper)
  // })
  // .then(() => {
  //   return xlsGoogleParserTemples.processData(dbHelper)
  // })
  // .then(() => {
  //   return xlsGoogleFixPersonUrls.processData()
  // })
  // .then(() => {
  //   return xlsGoogleLoadPersonImages.processData()
  // })
  .then(() => {
    return xlsGoogleParserPersons.processData(dbHelper)
  })
  .then(() => {
    return dbHelper.clearDb('personsAggr')
  })
  .then(() => {
    return personsAggr.start()
  })
  .then(() => {
    log.success(
      chalk.greenBright(`Окончание процесса загрузки ${DateHelper.nowToStr()}`)
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
