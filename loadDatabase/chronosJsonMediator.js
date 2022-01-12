import chronosModel from '../models/chronosReligionModel'
import inetHelper from '../helper/inetHelper'
import StrHelper from '../helper/strHelper'
import SuperJsonMediator from './superJsonMediator'

export default class ChronosJsonMediator extends SuperJsonMediator {
  constructor() {
    super()
    this.equilFields = ['place', 'startDateStr', 'shortBrief']
    this.model = chronosModel
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
