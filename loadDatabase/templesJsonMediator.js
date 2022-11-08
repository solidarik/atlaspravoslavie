import InetHelper from '../helper/inetHelper.js'
import StrHelper from '../helper/strHelper.js'
import SuperJsonMediator from './superJsonMediator.js'
import TempleModel from '../models/templesModel.js'

export default class TemplesJsonMediator extends SuperJsonMediator {
  constructor() {
    super()
    this.equilFields = ['pageUrl']
    this.model = TempleModel
  }

  processJson(json) {
    return new Promise((resolve) => {
      if (json.hasOwnProperty('placeCoords')) {
        resolve(json)
      }

      let geoName = json.name + ' ' + json.surPlace
      geoName = geoName.replace(',', '')

      InetHelper
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
          console.log('geoName', geoName)
          resolve({ error: `ошибка в processJson: ${err}` })
        })
    })
  }
}
