const ChronosChurchModel = require('../models/chronosChurchModel')
const inetHelper = require('../helper/inetHelper')
const StrHelper = require('../helper/strHelper')
const SuperJsonMediator = require('./superJsonMediator')
const moment = require('moment')

class ChronosChurchJsonMediator extends SuperJsonMediator {
  constructor() {
    super()
    this.equilFields = ['place', 'startDateStr', 'shortBrief']
    this.model = ChronosChurchModel
  }

  processJson(json) {
    return new Promise((resolve) => {
      if (json.hasOwnProperty('placeCoords')) {
        resolve(json)
      }

      inetHelper
        .getCoordsForCityOrCountry(json.place)
        .then((placeCoords) => {
          if (placeCoords.length == 0)
            resolve({ error: `не удалось определить координаты` })
          const newJson = {
            ...json,
            point: placeCoords[0],
            startIsOnlyYear: json.startIsOnlyYear == 'True' ? true : false,
            endIsOnlyYear: json.endIsOnlyYear == 'True' ? true : false,
            pageUrl: StrHelper.generatePageUrl([
              json.place,
              json.startDateStr,
              json.shortBrief,
            ]),
          }
          resolve(newJson)
        })
        .catch((err) => {
          resolve({ error: `ошибка в processJson: ${err}` })
        })
    })
  }
}

module.exports = new ChronosChurchJsonMediator()
