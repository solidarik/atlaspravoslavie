const chalk = require('chalk')
const log = require('../helper/logHelper')

const DbHelper = require('../loadDatabase/dbHelper')
const inetHelper = require('../helper/inetHelper')
const chronosJsonMediator = require('../loadDatabase/chronosJsonMediator')
const personsJsonMediator = require('../loadDatabase/personsJsonMediator')
const usersJsonMediator = require('../loadDatabase/usersJsonMediator')
const templesJsonMediator = require('../loadDatabase/templesJsonMediator')
const checkedCoordsPath = 'loadDatabase\\dataSources\\checkedCoords.json'
inetHelper.loadCoords(checkedCoordsPath)

dbHelper = new DbHelper()

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
  //   return dbHelper.clearDb('temples')
  // })
  // .then(() => {
  //   return dbHelper.saveFilesFrom({
  //     source: 'python/out_temples',
  //     procdir: 'out/out_temples_process',
  //     errdir: 'out/out_temples_errors',
  //     mediator: templesJsonMediator,
  //   })
  // })
  .then(() => {
    return dbHelper.clearDb('persons')
  })
  .then(() => {
    return dbHelper.saveFilesFrom({
      source: 'python/out_persons',
      procdir: 'out/out_person_process',
      errdir: 'out/out_person_errors',
      mediator: personsJsonMediator,
    })
  })
  .then(() => {
    log.success(chalk.cyan(`окончание процесса загрузки`))
    dbHelper.free()
    inetHelper.saveCoords(checkedCoordsPath)
  })
  .catch((err) => {
    dbHelper.free()
    inetHelper.saveCoords(checkedCoordsPath)
    log.error(`ошибка загрузки данных: ${err}`)
  })
