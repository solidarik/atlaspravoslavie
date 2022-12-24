import personsModel from '../models/personsModel.js'
import StrHelper from '../helper/strHelper.js'
import inetHelper from '../helper/inetHelper.js'
import SuperJsonMediator from './superJsonMediator.js'
import GeoHelper from '../helper/geoHelper.js'

export default class PersonsJsonMediator extends SuperJsonMediator {
  constructor() {
    super()
    this.equilFields = ['surname', 'name', 'middlename']
    this.model = personsModel
  }

  checkJsonSync(json) {
    return json.placeBirthCoords.length > 0
  }

  deleteAbbrev(place) {
    if (!place)
      return undefined

    place = place.replace(',', '').replace('"', '')
    //по сути это контекст return place.replace(/^\S{1,2}[.]+\s/g, '')
    return `${place}`
  }

  processJson(json) {
    return new Promise((resolve, reject) => {

      let promises = [
        inetHelper.searchCoordsByName(json.birth.place),
        inetHelper.searchCoordsByName(json.death.place)
      ]

      json.achievements.forEach((achiev) => {
        promises.push(
          inetHelper.searchCoordsByName(achiev.place)
        )
      })

      Promise.all(promises)
        .then((coords) => {

          const birthCoords = GeoHelper.coordsToBaseFormat(coords[0])
          const deathCoords = GeoHelper.coordsToBaseFormat(coords[1])

          if (birthCoords && birthCoords.length < 2)
            resolve({
              error: `не удалось определить координаты рождения ${json.birth.place}`,
              errorPlace: json.birth.place
            })

          if (deathCoords && deathCoords.length < 2)
            resolve({
              error: `не удалось определить координаты смерти ${json.death.place}`,
              errorPlace: json.death.place
            })

          for (let i = 2; i < json.achievements.length + 2; i++) {
            if (coords[i] && coords[i].length < 2) {
              errorPlace = json.achievemnts[i - 2].place
              resolve({
                error: `не удалось определить координаты достижения для ${errorPlace}`,
                errorPlace: errorPlace
              })
            } else {
              json.achievements[i - 2] = {
                ...json.achievements[i - 2],
                placeCoord: GeoHelper.coordsToBaseFormat(coords[i])
              }
            }
          }

          json = {
            ...json,
            birth: {
              ...json.birth,
              placeCoord: birthCoords
            },
            death: {
              ...json.death,
              placeCoord: deathCoords
            },
            pageUrl: StrHelper.generatePageUrl([json.sitename, json.surname, json.name, json.middlename])
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
