const chalk = require('chalk')
const log = require('../helper/logHelper')

const DbHelper = require('../loadDatabase/dbHelper')
const PersonsAggr = require('../loadDatabase/personsAggr')
const inetHelper = require('../helper/inetHelper')

const chronosJsonMediator = require('../loadDatabase/chronosJsonMediator')
const chronosChurchJsonMediator = require('../loadDatabase/chronosChurchJsonMediator')
const personsJsonMediator = require('../loadDatabase/personsJsonMediator')
const personsAggrJsonMediator = require('../loadDatabase/personsAggrJsonMediator')
const usersJsonMediator = require('../loadDatabase/usersJsonMediator')
const templesJsonMediator = require('../loadDatabase/templesJsonMediator')
const xlsGoogleParser = require('./xlsGoogleParser')

const checkedCoordsPath = 'loadDatabase\\dataSources\\checkedCoords.json'

inetHelper.loadCoords(checkedCoordsPath)
inetHelper.trimNames()

const dbHelper = new DbHelper()
const personsAggr = new PersonsAggr()

Promise.resolve(true)
  // .then(() => {
  //   return dbHelper.clearDb('users')
  // })
  // .then(() => {
  //   return dbHelper.saveFilesFrom({
  //     source: 'dataSources/secretUsers.json',
  //     procdir: 'out/out_user_process',
  //     errdir: 'out/out_user_errors',
  //     mediator: usersJsonMediator
  //   })
  // })
  // .then(() => {
  //     return dbHelper.clearDb('chronosReligion')
  //   })
  // .then(() => {
  //   return dbHelper.saveFilesFrom({
  //     source: 'python/out_chronos_religion',
  //     procdir: 'out/out_chronos_religion_process',
  //     errdir: 'out/out_chronos_religion_errors',
  //     mediator: chronosJsonMediator,
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
  //     mediator: chronosChurchJsonMediator,
  //   })
  // })
  .then(() => {
    return dbHelper.clearDb('temples')
  })
  // .then(() => {
  //   return dbHelper.saveFilesFrom({
  //     source: 'python/out_temples',
  //     procdir: 'out/out_temples_process',
  //     errdir: 'out/out_temples_errors',
  //     mediator: templesJsonMediator,
  //   })
  // })
  // .then(() => {
  //   return XlsParser.loadData({
  //     source: `${__dirname}/religion/temples_azbuka.xlsx`,
  //     mediator: templesJsonMediator
  //   })
  // })
  .then(() => {
    return xlsGoogleParser.loadData()
  })
  // .then(() => {
  //   return dbHelper.clearDb('persons')
  // })
  // .then(() => {
  //   return dbHelper.saveFilesFrom({
  //     source: 'python/out_persons',
  //     procdir: 'out/out_person_process',
  //     errdir: 'out/out_person_errors',
  //     mediator: personsJsonMediator,
  //   })
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
    inetHelper.saveCoords(checkedCoordsPath)
  })
  .catch((err) => {
    personsAggr.free()
    dbHelper.free()
    inetHelper.saveCoords(checkedCoordsPath)
    log.error(`Ошибка загрузки данных: ${err}`)
  })
