import FileHelper from '../helper/fileHelper.js'
import Log from '../helper/logHelper.js'

import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

import config from 'config'
import chalk from 'chalk'
import path from 'path'

export default class DbHelper {
  async connect() {
    if (process.env.MONGOOSE_DEBUG) {
      mongoose.set('debug', true)
    }

    mongoose.set('strictQuery', true)

    mongoose.Promise = global.Promise
    this.db = await mongoose.connect(config.mongoose.uri, config.mongoose.options)

  }

  clearModel(model) {
    return new Promise((resolve, reject) => {
      model.deleteMany({}, (err) => {
        if (err) reject(err)

        resolve(true)
        this.log.info(chalk.gray(`Удаление коллекции: ${model.collection.collectionName}`))
      })
    })
  }

  clearDb(filter = '') {
    return new Promise((resolve, reject) => {
      const modelDirectory = FileHelper.composePath('models')
      let modelFiles = FileHelper.getFilesFromDir(modelDirectory, '.js')
      let promises = []
      modelFiles.forEach((modelFilePath) => {
        if ('' == filter || modelFilePath.includes(filter)) {
          promises.push(
            new Promise((resolve, reject) => {
              modelFilePath = 'file:///' + modelFilePath.replace(/[\\]+/g, '/')
              import(modelFilePath)
                .then(
                  model => {
                    model.default.deleteMany({}, (err) => {
                      if (err) reject(err)

                      resolve(true)
                      this.log.info(chalk.gray(`Удаление коллекции: ${modelFilePath}`))
                    })
                  }
                )

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
    this.db = db
    if (!log) {
      log = Log.create()
    }
    this.log = log
  }

  free() {
    if (this.isOuter) return
    setTimeout(() => {
      this.db && this.db.disconnect()
      this.log.info(chalk.gray('Отключение от базы'))
    }, 100)
  }

  saveFilesFrom(input) {
    return new Promise((resolve, reject) => {
      let mediator = input.mediator

      let files = []

      let source = FileHelper.composePath(input.source)
      let procdir = FileHelper.composePath(input.procdir)
      let errdir = FileHelper.composePath(input.errdir)

      FileHelper.clearDirectory(procdir)
      FileHelper.clearDirectory(errdir)

      let dataTypeStr = 'файл'
      if (FileHelper.isDirectory(source)) {
        dataTypeStr = 'директорию'
        files = FileHelper.getFilesFromDir(source)
      } else {
        files.push(source)
      }

      this.log.info(`Начинаем обрабатывать ${dataTypeStr} ${chalk.cyan(input.source)}`)

      let promises = []

      files.forEach((filePath) => {
        let json = FileHelper.getJsonFromFile(filePath)
        let filename = FileHelper.getFileNameFromPath(filePath)
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
              if (!mediator.processJson) {
                throw `ошибка неинициализации processJson`
              }
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
                  FileHelper.saveJsonToFileSync(newJsonItem, procpath)
                  resolve(true)
                })
                .catch((err) => {
                  let msg = `ошибка при обработке файла ${filename}: ${err} элемент ${JSON.stringify(
                    jsonItem
                  )}`
                  FileHelper.saveJsonToFileSync(newJsonItem, errpath)
                  this.log.error(msg)
                  resolve({ error: new Error(msg) })
                })
            })
          )
        })
      })
      this.log.info(`Количество входящих элементов, промисов: ${promises.length}`)

      Promise.all(promises).then(
        (res) => {
          let countObjects = 0
          res.forEach((r) => {
            countObjects += r.hasOwnProperty('error') ? 0 : 1
            if (r.hasOwnProperty('errorPlace')) {
              this.log.warn(r.errorPlace)
            }
          })
          const status = `Количество успешно обработанных элементов: ${countObjects} из ${res.length}`
          this.log.info(status)
          if (countObjects == res.length) {
            this.log.info(chalk.green('Успешная загрузка'))
          } else {
            this.log.warn('Не все файлы были обработаны успешно')
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
    const filePath = FileHelper.composePath(
      'samara',
      'data',
      'countries_centroid.json'
    )
    let obj = FileHelper.getJsonFromFile(filePath)
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
