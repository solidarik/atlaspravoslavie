const inetHelper = require('../helper/inetHelper')
const StrHelper = require('../helper/strHelper')
const SuperJsonMediator = require('./superJsonMediator')
const TemplesModel = require('../models/templesModel');

class TemplesJsonMediator extends SuperJsonMediator {
  constructor() {
    super()
    this.equilFields = ['name', 'place']
    this.model = TemplesModel
  }

  processJson(json) {
    return new Promise((resolve) => {
      if (json.hasOwnProperty('placeCoords')) {
        resolve(json)
      }

      let geoName = json.name + ' ' + json.surPlace
      geoName = geoName.replace(',', '')

      inetHelper
        .getCoordsForCityOrCountry(geoName)
        .then((placeCoords) => {
          if (placeCoords.length == 0)
            resolve({ error: `не удалось определить координаты` })

          const newJson = {
            ...json,
            point: placeCoords[0],
            pageUrl: StrHelper.generatePageUrl([
              json.name,
              json.place
            ]),
          }
          resolve(newJson)
        })
        .catch((err) => {
          console.log(geoName)
          resolve({ error: `ошибка в processJson: ${err}` })
        })
    })
  }
}

module.exports = new TemplesJsonMediator()
