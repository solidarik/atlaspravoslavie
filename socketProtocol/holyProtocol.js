const ServerProtocol = require('../libs/serverProtocol')
const ChronosModel = require('../models/chronosReligionModel')
const ChronosChurchModel = require('../models/chronosChurchModel')
const PersonsModel = require('../models/personsModel')
const PersonsAggrModel = require('../models/personsAggrModel')
const TemplesModel = require('../models/templesModel')
const ServiceModel = require('../models/serviceModel')

function trycatch(func, cb) {
  let res = {}
  try {
    func()
      .then(
        (res) => {
          cb(JSON.stringify({ persons: res }))
        })
      .catch((error) => {
        cb(JSON.stringify({ error: error }))
      })
  } catch (err) {
    res.err = 'Ошибка парсинга: ' + err
    res.events = ''
    cb(JSON.stringify(res))
  }
}

class HolyProtocol extends ServerProtocol {
  init() {
    super.addHandler('clQueryDataByYear', this.getDataByYear)
    super.addHandler('clGetCurrentYear', this.getCurrentYear)
    super.addHandler('clGetTemples', this.getTemples)
    super.addHandler('clGetPersons', this.getPersons)
    super.addHandler('clGetPersonsMartyrs', this.getPersonsMartyrs)
    super.addHandler('clGetPersonsReverends', this.getPersonsReverends)
    super.addHandler('clGetPersonsHoly', this.getPersonsHoly)
    super.addHandler('clGetTempleItem', this.getTempleItem)
    super.addHandler('clGetInfoItem', this.getInfoItem)
    super.addHandler('clGetLoadStatus', this.getLoadStatus)
  }

  getCurrentYear(socket, msg, cb) {
    let res = {}
    res.year = undefined // todo
    cb(JSON.stringify(res))
  }

  getDataByYear(socket, msg, cb) {
    let res = {}

    try {
      let data = JSON.parse(msg)

      const intValue = parseInt(data.value)

      let defaultSearchParam = {}
      let gteSearchParam = {}
      let personSearchParam = {}

      const searchDates = {
        $gte: intValue,
        $lt: intValue + 1,
      }
      const lteDates = {
        $lte: intValue // field <= value
      }

      const gteDates = {
        $gte: intValue // field >= value
      }

      if (data.isYearMode) {
        defaultSearchParam = {
          "start.year": searchDates
        }
        gteSearchParam = {
          "start.year": lteDates
        }
        personSearchParam = {
          $and: [
            { "startYear": { "$ne": -999 } },
            { "startYear": lteDates },
            { "endYear": gteDates }
          ]
        }
      } else {
        defaultSearchParam = {
          "start.century": searchDates
        }
        gteSearchParam = {
          "start.century": lteDates
        }
        personSearchParam = {
          $and: [
            { "startCentury": searchDates },
            { "kind": { $ne: "live" } }
          ]
        }
      }

      // const overDateParam = {
      //   $or: [
      //     { startYear: { $lt: parseInt(data.range[1]) } },
      //     { startYear: { $exists: false } }
      //   ]
      // }

      // db.getCollection('personsreligions').find({"achievements": {"$elemMatch": {"start.century": 19}}})

      const defaultSelectParam = { 'name': 1, 'point': 1 }

      const promices = [
        ChronosModel.find(defaultSearchParam).select(defaultSelectParam),
        ChronosChurchModel.find(defaultSearchParam).select(defaultSelectParam),
        TemplesModel.find(gteSearchParam).select(defaultSelectParam),
        PersonsAggrModel.find(personSearchParam)

        // PersonsAggrModel.find({...defaultSearchParam, "kind": "birth"}),
        // PersonsAggrModel.find({...defaultSearchParam, "kind": "death"}),
        // PersonsAggrModel.find({...defaultSearchParam, "kind": "achiev"})
      ]

      Promise.all(promices)
        .then((res) => {
          cb(
            JSON.stringify({
              chronos: res[0],
              chronosChurch: res[1],
              temples: res[2],
              persons: res[3]
            })
          )
        })
        .catch((error) => {
          cb(JSON.stringify({ error: error }))
        })
    } catch (err) {
      res.err = 'Ошибка парсинга даты: ' + err
      res.events = ''
      cb(JSON.stringify(res))
    }
  }

  getTemples(socket, msg, cb) {
    let res = {}

    try {
      TemplesModel.find({})
        .then(
          (res) => {
            cb(
              JSON.stringify({
                temples: res
              })
            )
          })
        .catch((error) => {
          cb(JSON.stringify({ error: error }))
        })
    } catch (err) {
      res.err = 'Ошибка возврата храмов: ' + err
      res.events = ''
      cb(JSON.stringify(res))
    }
  }

  getTempleItem(socket, msg, cb) {

    let data = JSON.parse(msg)
    let res = {}
    try {
      TemplesModel.find({ '_id': data.id })
        .then(
          (res) => {
            if (res.length == 0) {
              throw new Error('Temple by id is not Found')
            } else {
              cb(
                JSON.stringify(res[0])
              )
            }
          })
        .catch((error) => {
          cb(JSON.stringify({ error: error }))
        })
    } catch (err) {
      res.err = 'Ошибка возврата храма: ' + err
      res.events = ''
      cb(JSON.stringify(res))
    }
  }

  getInfoItem(socket, msg, cb) {

    let data = JSON.parse(msg)
    let res = {}
    try {
      let model = undefined
      switch (data.classFeature) {
        case 'ChronosFeature':
          model = ChronosModel
          break
        case 'ChronosChurchFeature':
          model = ChronosChurchModel
          break
        case 'TemplesFeature':
          model = TemplesModel
          break;
        case 'PersonAggrFeature':
          model = PersonsAggrModel
          break;
        case 'PersonFeature':
          model = PersonsModel
          break;
        default:
          throw new Error(`Undefined model by classFeature ${data.classFeature}`)
      }
      model.find({ '_id': data.id })
        .then(
          (res) => {
            if (res.length == 0) {
              throw new Error('Temple by id is not Found')
            } else {
              cb(
                JSON.stringify(res[0])
              )
            }
          })
        .catch((error) => {
          cb(JSON.stringify({ error: error }))
        })
    } catch (error) {
      res.error = 'Ошибка возврата данных: ' + error
      res.events = ''
      cb(JSON.stringify(res))
    }
  }

  getLoadStatus(socket, msg, cb) {
    let res = {}
    try {
      ServiceModel.find({ 'kind': 'status' }).select({ 'name': 1, 'value': 1, '_id': 0 })
        .then(
          (res) => {
            let outRes = {}
            for (let i = 0; i < res.length; i++) {
              outRes[res[i].name] = res[i].value
            }
            cb(JSON.stringify(outRes))
          })
    } catch (err) {
      res.err = `Ошибка получения статуса: ` + err
      res.msg = ''
      cb(JSON.stringify(res))
    }
  }

  getPersons(socket, msg, cb) {
    let res = {}

    try {
      PersonsModel.find({})
        .then(
          (res) => {
            cb(
              JSON.stringify({
                persons: res
              })
            )
          })
        .catch((error) => {
          cb(JSON.stringify({ error: error }))
        })
    } catch (err) {
      res.err = 'Ошибка возврата храмов: ' + err
      res.events = ''
      cb(JSON.stringify(res))
    }
  }
  // {
  //   trycatch(PersonsModel.find({}), cb)
  // }

  getPersonsMartyrs(socket, msg, cb) {
    trycatch(PersonsModel.find({ "groupStatus": "мученик" }), cb)
  }

  getPersonsReverends(socket, msg, cb) {
    trycatch(PersonsModel.find({ "groupStatus": "преподобный" }), cb)
  }

  getPersonsHoly(socket, msg, cb) {
    trycatch(PersonsModel.find({ "groupStatus": "святой" }), cb)
  }
}

module.exports = new HolyProtocol()
