import personsAggrModel from '../models/personsAggrModel.js'
import inetHelper from '../helper/inetHelper.js'
import GeoHelper from '../helper/geoHelper.js'
import SuperJsonMediator from './superJsonMediator.js'

export default class PersonsAggrJsonMediator extends SuperJsonMediator {
  constructor() {
    super()
    this.equilFields = ['caption', 'kindEvent', 'point']
    this.model = personsAggrModel
  }

  checkJsonSync(json) {
    return json.point.length > 0
  }

  deleteAbbrev(place) {
    if (!place)
      return undefined

    place = place.replace(',', '').replace('"', '')
    //по сути это контекст return place.replace(/^\S{1,2}[.]+\s/g, '')
    return place
  }

  processJson(json) {
    return new Promise((resolve, reject) => {

      inetHelper
      .searchCoordsByName(this.deleteAbbrev(json.place))
      .then((coords) => {
        if (!coords)
          resolve({
            error: `не удалось определить координаты`,
            errorPlace: json.place
          })

        json = {
          ...json,
          point: GeoHelper.coordsToBaseFormat(coords)
        }

        resolve(json)
      })
      .catch((err) => reject(`ошибка в processJson: ${err}`))
    })
  }

  afterProcessJson(json) {
    console.log(json.name, json.middlename)
  }
}