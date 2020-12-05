const ServerProtocol = require('../libs/serverProtocol')
const ChronosModel = require('../models/chronosReligionModel')
const PersonsModel = require('../models/personsReligionModel')
const TemplesModel = require('../models/templesModel')

class HolyProtocol extends ServerProtocol {
  init() {
    super.addHandler('clQueryDataByYear', this.getDataByYear)
    super.addHandler('clGetCurrentYear', this.getCurrentYear)
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

      const promices = [
        ChronosModel.find(defaultSearchParam),
        TemplesModel.find(defaultSearchParam)
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
              temples: res[1]
              //personsBirth: res[1],
              //personsAchievement: res[2],
              //personsDeath: res[3],
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
}

module.exports = new HolyProtocol()
