
import chalk from 'chalk'
import Log from '../helper/logHelper'
import FileHelper from '../helper/fileHelper'

if (FileHelper.isFileExists('load.log')) {
  FileHelper.deleteFile('load.log')
}

const log = Log.create('load.log')
import DbHelper from '../loadDatabase/dbHelper'
import PersonsAggr from '../loadDatabase/personsAggr'
import inetHelper from '../helper/inetHelper'

import ChronosJsonMediator from '../loadDatabase/chronosJsonMediator'
import ChronosChurchJsonMediator from '../loadDatabase/chronosChurchJsonMediator'
import PersonsJsonMediator from '../loadDatabase/personsJsonMediator'
import PersonsAggrJsonMediator from '../loadDatabase/personsAggrJsonMediator'
import UsersJsonMediator from '../loadDatabase/usersJsonMediator'
import TemplesJsonMediator from '../loadDatabase/templesJsonMediator'
import XlsGoogleParser from './xlsGoogleParser'
import XlsGoogleParserPersons from './xlsGoogleParserPersons'

const checkedCoordsPath = 'loadDatabase\\dataSources\\checkedCoords.json'

inetHelper.loadCoords(checkedCoordsPath)
inetHelper.trimNames()

const dbHelper = new DbHelper(undefined, log)
const xlsGoogleParser = new XlsGoogleParser(log)
const xlsGoogleParserPersons = new XlsGoogleParserPersons(log)
const personsAggr = new PersonsAggr()

Promise.resolve(true)
  .then(() => {
    return dbHelper.connect()
  })
  // .then(() => {
  //   return dbHelper.clearDb('users')
  // })
  // .then(() => {
  //   return dbHelper.saveFilesFrom({
  //     source: 'dataSources/secretUsers.json',
  //     procdir: 'out/out_user_process',
  //     errdir: 'out/out_user_errors',
  //     mediztor: UsersJsonMediator
  //   })
  // })
  // .then(() => {
  //   return dbHelper.clearDb('chronosReligion')
  // })
  // .then(() => {
  //   return dbHelper.saveFilesFrom({
  //     source: 'python/out_chronos_religion',
  //     procdir: 'out/out_chronos_religion_process',
  //     errdir: 'out/out_chronos_religion_errors',
  //     mediator: ChronosJsonMediator,
  //   })
  // })
  // .then(() => {
  //   return dbHelper.clearDb('chronosChurch')
  // })
  // .then(() => {
  //   return dbHelper.saveFilesFrom({
  //     source: 'python/out_chronos_church',
  //     procdir: 'out/out_chronos_church_process',
  //     errdir: 'out/out_chronos_church_errors',
  //     mediator: ChronosChurchJsonMediator,
  //   })
  // })
  // .then(() => {
  //   return dbHelper.clearDb('temples')
  // })
  // .then(() => {
  //   return dbHelper.saveFilesFrom({
  //     source: 'python/out_temples',
  //     procdir: 'out/out_temples_process',
  //     errdir: 'out/out_temples_errors',
  //     mediator: TemplesJsonMediator,
  //   })
  // })
  // .then(() => {
  //   return XlsParser.loadData({
  //     source: `${__dirname}/religion/temples_azbuka.xlsx`,
  //     mediator: TemplesJsonMediator
  //   })
  // })
  // .then(() => {
  //   return XlsGoogleParser.loadData(dbHelper)
  // })
  .then(() => {
    return dbHelper.clearDb('persons')
  })
  .then(() => {
    return xlsGoogleParserPersons.loadData(dbHelper)
  })
  // .then(() => {
  //   return DbHelper.saveFilesFrom({
  //     source: 'python/out_persons',
  //     procdir: 'out/out_person_process',
  //     errdir: 'out/out_person_errors',
  //     mediator: PersonsJsonMediator,
  //   })
  // })
  .then(() => {
    return dbHelper.clearDb('personsAggr')
  })
  .then(() => {
    log.info('аггрегация данных по персоналиям')
    return personsAggr.start()
  })
  .then(() => {
    log.success(chalk.cyan(`Окончание процесса загрузки`))
    personsAggr.free()
    dbHelper.free()
    // inetHelper.saveCoords(checkedCoordsPath)
  })
  .catch((err) => {
    personsAggr.free()
    dbHelper.free()
    // inetHelper.saveCoords(checkedCoordsPath)
    log.error(`Ошибка загрузки данных: ${err}`)
  })
