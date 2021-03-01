const PersonsAggrModel = require('../models/personsAggrModel')
const StrHelper = require('../helper/strHelper')
const DateHelper = require('../helper/dateHelper')
const InetHelper = require('../helper/inetHelper')
const SuperJsonMediator = require('./superJsonMediator')

class PersonsAggrJsonMediator extends SuperJsonMediator {
  constructor() {
    super()
    this.equilFields = ['caption', 'kindEvent', 'point']
    this.model = PersonsAggrModel
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

      let promises = [
        InetHelper.getCoordsForCityOrCountry(this.deleteAbbrev(json.place)),
      ]
      
      Promise.all(promises)
        .then((coords) => {
          const coords = coords[0]

          if (coords && coords.length == 0)
              resolve({
                error: `не удалось определить координаты`,
                errorPlace: json.place })

          json = {
            ...json,
            point: coords
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

module.exports = new PersonsAggrJsonMediator()
