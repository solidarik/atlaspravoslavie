const fileHelper = require('../helper/fileHelper')
const mongoose = require('mongoose')
const Log = require('../helper/logHelper')
const dotenv = require('dotenv')
dotenv.config()

const config = require('config')
const chalk = require('chalk')
const path = require('path')

class DbHelper {
  getLocalDb() {
    if (process.env.MONGOOSE_DEBUG) {
      mongoose.set('debug', true)
    }

    mongoose.Promise = global.Promise
    mongoose.connect(config.mongoose.uri, config.mongoose.options)
    return mongoose
  }

  clearDb(filter = '') {
    return new Promise((resolve, reject) => {
      const modelDirectory = fileHelper.composePath('../models/')
      let modelFiles = fileHelper.getFilesFromDir(modelDirectory, '.js')
      let promises = []
      modelFiles.forEach((modelFilePath) => {
        if ('' == filter || modelFilePath.includes(filter)) {
          promises.push(
            new Promise((resolve, reject) => {
              let model = require(modelFilePath)
              model.deleteMany({}, (err) => {
                if (err) reject(err)

                resolve(true)
                this.log.info(`removed collection: ${modelFilePath}`)
              })
            })
          )
        }
      })

      Promise.all(promises)
        .then((res) => resolve(true))
        .catch((err) => reject(err))
    })
  }

  constructor(db = undefined, log = undefined) {
    this.isOuter = db != undefined
    this.db = db != undefined ? db : this.getLocalDb()
    if (!log) {
      log = Log.create()
    }
    this.log = log
  }

  free() {
    if (this.isOuter) return
    setTimeout(() => {
      this.db.disconnect()
      this.log.info(chalk.yellow('db disconnected'))
    }, 100)
  }

  saveFilesFrom(input) {
    return new Promise((resolve, reject) => {
      let mediator = input.mediator

      let files = []

      let source = fileHelper.composePath(input.source)
      let procdir = fileHelper.composePath(input.procdir)
      let errdir = fileHelper.composePath(input.errdir)

      fileHelper.clearDirectory(procdir)
      fileHelper.clearDirectory(errdir)

      let dataTypeStr = 'файл'
      if (fileHelper.isDirectory(source)) {
        dataTypeStr = 'директорию'
        files = fileHelper.getFilesFromDir(source)
      } else {
        files.push(source)
      }

      this.log.info(`начинаем обрабатывать ${dataTypeStr} ${chalk.cyan(input.source)}`)

      let promises = []

      files.forEach((filePath) => {
        let json = fileHelper.getJsonFromFile(filePath)
        let filename = fileHelper.getFileNameFromPath(filePath)
        let procpath = path.join(procdir, filename)
        let errpath = path.join(errdir, filename)

        //обход на случай отсутствия массивов (ex persons)
        if (!Array.isArray(json)) {
          json = [json]
        }

        json.forEach((jsonItem) => {
          promises.push(
            new Promise((resolve) => {
              let newJsonItem = undefined
              mediator
                .processJson(jsonItem)
                .then((jsonItem) => {
                  if (jsonItem.hasOwnProperty('error')) {
                    throw `ошибка на предварительном этапе обработки ${jsonItem.error}`
                  }
                  newJsonItem = jsonItem
                  return mediator.isExistObject(newJsonItem)
                })
                .then((isExistObject) => {
                  if (isExistObject) resolve(true)
                  return mediator.addObjectToBase(newJsonItem)
                })
                .then((res) => {
                  fileHelper.saveJsonToFileSync(newJsonItem, procpath)
                  resolve(true)
                })
                .catch((err) => {
                  let msg = `ошибка при обработке файла ${filename}: ${err} элемент ${JSON.stringify(
                    jsonItem
                  )}`
                  fileHelper.saveJsonToFileSync(newJsonItem, errpath)
                  this.log.error(msg)
                  resolve({ error: new Error(msg) })
                })
            })
          )
        })
      })
      this.log.info(`количество входящих элементов, промисов: ${promises.length}`)

      Promise.all(promises).then(
        (res) => {
          let countObjects = 0
          res.forEach((r) => {
            countObjects += r.hasOwnProperty('error') ? 0 : 1
            if (r.hasOwnProperty('errorPlace')) {
              this.log.warn(r.errorPlace)
            }
          })
          const status = `количество успешно обработанных элементов: ${countObjects} из ${res.length}`
          this.log.info(status)
          if (countObjects == res.length) {
            this.log.info(chalk.green('успешная загрузка'))
          } else {
            this.log.warn('не все файлы были обработаны успешно')
          }
          resolve(status)
        },
        (err) => {
          let msg = `непредвиденная ошибка в процессе обработки ${err}`
          this.log.error(msg)
          resolve(msg)
        }
      )
    })
  }

  fillDictCountries() {
    const filePath = fileHelper.composePath(
      'samara',
      'data',
      'countries_centroid.json'
    )
    let obj = fileHelper.getJsonFromFile(filePath)
    obj.forEach((item, i, arr) => {
      if (i == 0) {
        this.log.info(fromLonLat([56.004, 54.695]))
        let country = {
          iso: item['ISO3'],
          eng: item['NAME'],
          region: item['REGION'],
          subregion: item['SUBREGION'],
        }
        this.log.info('iso: ' + item['ISO3'])
        this.log.info(JSON.stringify(item))
      }
    })
    this.log.info(obj.length)
  }

  getSamaraSource() {
    const firstSource = new DictSourcesModel({
      sourceCode: 'samara_json',
      sourceNameRus: 'Данные, предоставленные коллегами из Самары',
      sourceNameEng: 'Data from Samara colleagues',
    })

    let query = DictSourcesModel.findOne({
      sourceCode: firstSource.sourceCode,
    })
    query.then((doc) => {
      if (!doc) {
        firstSource.save((err) => {
          if (!err) success('object created')
          else error('object did not create', err)
        })
      }
    })
  }
}

module.exports = DbHelper
