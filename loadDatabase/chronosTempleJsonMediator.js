import chronosTempleModel from '../models/chronosTempleModel.js'
import inetHelper from '../helper/inetHelper.js'
import StrHelper from '../helper/strHelper.js'
import SuperJsonMediator from './superJsonMediator.js'
import GeoHelper from '../helper/geoHelper.js'

export default class ChronosTempleJsonMediator extends SuperJsonMediator {
  constructor() {
    super()
    this.equilFields = ['place', 'startDateStr', 'shortBrief']
    this.model = chronosTempleModel
  }

  processJson(json) {
    return new Promise((resolve) => {
      if (json.hasOwnProperty('placeCoords')) {
        resolve(json)
      }

      inetHelper
        .searchCoordsByName(json.place)
        .then((placeCoords) => {
          if (!placeCoords)
            resolve({ error: `не удалось определить координаты` })
          const newJson = {
            ...json,
            point: GeoHelper.coordsToBaseFormat(placeCoords),
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