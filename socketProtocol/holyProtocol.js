import ServerProtocol from '../libs/serverProtocol.js'
import chronosModel from '../models/chronosModel.js'
import chronosTempleModel from '../models/chronosTempleModel.js'
import personsModel from '../models/personsModel.js'
import personsAggrModel from '../models/personsAggrModel.js'
import templesModel from '../models/templesModel.js'
import serviceModel from '../models/serviceModel.js'

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

  constructor() {
    super()
    this.init()
  }

  init() {
    super.addHandler('clQueryDataByYear', this.getDataByYear)
    super.addHandler('clGetCurrentYear', this.getCurrentYear)
    super.addHandler('clGetTemples', this.getTemples)
    super.addHandler('clGetPersons', this.getPersons)
    super.addHandler('clGetPersonsMartyrs', this.getPersonsMartyrs)
    super.addHandler('clGetPersonsReverends', this.getPersonsReverends)
    super.addHandler('clGetPersonsHoly', this.getPersonsHoly)
    super.addHandler('clGetTempleItem', this.getTempleItem)
    super.addHandler('clGetPersonItem', this.getPersonItem)
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

      //special case for XXV century - show all items
      if (!data.isYearMode && intValue == 23) {
        defaultSearchParam = {}
        gteSearchParam = {}
        personSearchParam = {}
      }
      else
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
      const shortBriefSearchParam = { ...defaultSelectParam, 'shortBrief': 1 }

      const promices = [
        chronosModel.find(defaultSearchParam).select(shortBriefSearchParam),
        chronosTempleModel.find(defaultSearchParam).select(shortBriefSearchParam),
        templesModel.find(gteSearchParam).select(defaultSelectParam),
        personsAggrModel.find(personSearchParam)

        // personsAggrModel.find({...defaultSearchParam, "kind": "birth"}),
        // personsAggrModel.find({...defaultSearchParam, "kind": "death"}),
        // personsAggrModel.find({...defaultSearchParam, "kind": "achiev"})
      ]

      Promise.all(promices)
        .then((res) => {
          cb(
            JSON.stringify({
              chronos: res[0],
              chronosTemple: res[1],
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
      templesModel.find({})
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
      templesModel.find({ '_id': data.id })
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

  getPersonItem(socket, msg, cb) {

    let data = JSON.parse(msg)
    let res = {}
    try {
      personsModel.find({ '_id': data.id })
        .then(
          (res) => {
            if (res.length == 0) {
              throw new Error('Person by id is not Found')
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
      res.err = 'Ошибка возврата святого: ' + err
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
          model = chronosModel
          break
        case 'ChronosTempleFeature':
          model = chronosTempleModel
          break
        case 'TemplesFeature':
          model = templesModel
          break;
        case 'PersonAggrFeature':
          model = personsAggrModel
          break;
        case 'PersonFeature':
          model = personsModel
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
      serviceModel.find({ 'name': 'statusText', 'model': 'temples' }).select({ 'name': 1, 'value': 1, '_id': 0 })
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
      personsModel.find({})
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
  //   trycatch(personsModel.find({}), cb)
  // }

  getPersonsMartyrs(socket, msg, cb) {
    trycatch(personsModel.find({ "groupStatus": "мученик" }), cb)
  }

  getPersonsReverends(socket, msg, cb) {
    trycatch(personsModel.find({ "groupStatus": "преподобный" }), cb)
  }

  getPersonsHoly(socket, msg, cb) {
    trycatch(personsModel.find({ "groupStatus": "святой" }), cb)
  }
}

export default new HolyProtocol()
