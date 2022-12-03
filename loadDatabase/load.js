
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

// import ChronosJsonMediator from '../loadDatabase/chronosJsonMediator.js'
// import ChronosTempleJsonMediator from './chronosTempleJsonMediator.js'
// import PersonsJsonMediator from '../loadDatabase/personsJsonMediator.js'
// import PersonsAggrJsonMediator from '../loadDatabase/personsAggrJsonMediator.js'
// import UsersJsonMediator from '../loadDatabase/usersJsonMediator.js'
// import TemplesJsonMediator from '../loadDatabase/templesJsonMediator.js'
import XlsGoogleParserTemples from './xlsGoogleParserTemples.js'
import XlsGoogleParserPersons from './xlsGoogleParserPersons.js'
import XlsGoogleParserChronos from './xlsGoogleParserChronos.js'
import XlsGoogleParserChronosTemple from './xlsGoogleParserChronosTemple.js'

InetHelper.loadCoords()

const dbHelper = new DbHelper(undefined, log)
const xlsGoogleParserTemples = new XlsGoogleParserTemples(log)
const xlsGoogleParserPersons = new XlsGoogleParserPersons(log)
const xlsGoogleParserChronos = new XlsGoogleParserChronos(log)
const xlsGoogleParserChronosTemple = new XlsGoogleParserChronosTemple(log)
const personsAggr = new PersonsAggr()

Promise.resolve(true)
  .then(() => {
    return dbHelper.connect()
  })
  .then(() => {
    return xlsGoogleParserChronos.loadData(dbHelper)
  })
  // .then(() => {
  //   return xlsGoogleParserChronosTemple.loadData(dbHelper)
  // })
  // .then(() => {
  //   return xlsGoogleParserTemples.loadData(dbHelper)
  // })
  // .then(() => {
  //   return xlsGoogleParserPersons.loadData(dbHelper)
  // })
  // .then(() => {
  //   return dbHelper.clearDb('personsAggr')
  // })
  // .then(() => {
  //   log.info('аггрегация данных по персоналиям')
  //   return personsAggr.start()
  // })
  .then(() => {
    log.success(chalk.cyan(`Окончание процесса загрузки`))
    personsAggr.free()
    dbHelper.free()
    // InetHelper.saveCoords()
  })
  .catch((err) => {
    personsAggr.free()
    dbHelper.free()
    // InetHelper.saveCoords()
    log.error(`Ошибка загрузки данных: ${err}`)
  })
