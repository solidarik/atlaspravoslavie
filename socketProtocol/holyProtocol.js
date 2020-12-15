const ServerProtocol = require('../libs/serverProtocol')
const ChronosModel = require('../models/chronosReligionModel')
const PersonsModel = require('../models/personsModel')
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
      let startDate = new Date(data.year, 0, 1).toISOString()
      let endDate = new Date(data.year, 11, 31).toISOString()

      const searchDates = {
        $gte: parseInt(data.year),
        $lt: parseInt(data.year) + 1,
      }

      const defaultSearchParam = {
        startYear: searchDates,
      }

      const overDateParam = {
        $or: [
          { startYear: { $lt: parseInt(data.year) } },
          { startYear: { $exists: false } }
        ]
      }

      const promices = [
        ChronosModel.find(defaultSearchParam),
        TemplesModel.find(overDateParam),
        PersonsModel.find({"groupStatus": "мученик", "birth.place": {$exists: true} }),
        PersonsModel.find({"groupStatus": "преподобный", "birth.place": {$exists: true}}),
        PersonsModel.find({"groupStatus": "святой", "birth.place": {$exists: true}})
        /*PersonsModel.find({
          dateBirth: searchDates,
        }),
        PersonsModel.find({
          dateAchievement: searchDates,
        }),
        PersonsModel.find({
          dateDeath: searchDates,
        }),
        /**/
      ]

      Promise.all(promices)
        .then((res) => {
          cb(
            JSON.stringify({
              chronos: res[0],
              temples: res[1],
              personsMartyrs: res[2],
              personsReverends: res[3],
              personsHoly: res[4],
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
      res.err = 'Ошибка парсинга даты: ' + err
      res.events = ''
      cb(JSON.stringify(res))
    }
  }

  getPersons(socket, msg, cb) {
    trycatch(PersonsModel.find({}), cb)
  }

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
