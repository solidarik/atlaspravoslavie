const ServerProtocol = require('../libs/serverProtocol')
const ChronosModel = require('../models/chronosReligionModel')
const ChronosChurchModel = require('../models/chronosChurchModel')
const PersonsModel = require('../models/personsModel')
const PersonsAggrModel = require('../models/personsAggrModel')
const TemplesModel = require('../models/templesModel')

function trycatch(func, cb){
  let res = {}
  try {
    func()
      .then(
        (res) => {
          cb(JSON.stringify({persons: res}))
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
            {"startYear": {"$ne": -999}},
            {"startYear": lteDates},
            {"endYear": gteDates}
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
            {"startCentury": searchDates},
            {"kind": {$ne: "live"}}
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

      const defaultSelectParam = {'name': 1, 'point': 1}

      const promices = [
        ChronosModel.find(defaultSearchParam).select(defaultSelectParam),
        ChronosChurchModel.find(defaultSearchParam).select(defaultSelectParam),
        TemplesModel.find(gteSearchParam).select(defaultSelectParam),
        PersonsAggrModel.find(personSearchParam).select(defaultSelectParam),
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

  getPersons(socket, msg, cb)
  {
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
    trycatch(PersonsModel.find({"groupStatus": "мученик"}), cb)
  }

  getPersonsReverends(socket, msg, cb) {
    trycatch(PersonsModel.find({"groupStatus": "преподобный"}), cb)
  }

  getPersonsHoly(socket, msg, cb) {
    trycatch(PersonsModel.find({"groupStatus": "святой"}), cb)
  }
}

module.exports = new HolyProtocol()
