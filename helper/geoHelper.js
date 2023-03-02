
export default class GeoHelper {
  static fromLonLat(input) {
    if (!input || input.length !== 2) {
      return undefined
    }

    const RADIUS = 6378137
    const HALF_SIZE = Math.PI * RADIUS
    const halfSize = HALF_SIZE
    const length = input.length
    const dimension = 2
    let output = []
    for (let i = 0; i < length; i += dimension) {
      output[i] = (halfSize * input[i]) / 180
      let y = RADIUS * Math.log(Math.tan((Math.PI * (input[i + 1] + 90)) / 360))

      if (y > halfSize) {
        y = halfSize
      } else if (y < -halfSize) {
        y = -halfSize
      }
      output[i + 1] = y
    }
    return output
  }

  static coordsToBaseFormat(coords) {
    if (coords.lon == undefined || coords.lat == undefined) {
      return undefined
    }
    if (coords.lon == 0 && coords.lat == 0) {
      return undefined
    }
    return this.fromLonLat([coords.lon, coords.lat])
  }

  static minutesCoordToDegreeCoord(matchOne) {
    if (matchOne.length < 2) {
      console.log(`Неизвестный формат координат: ${input}`)
      return undefined
    }

    let degrees = parseFloat(matchOne[1])
    let minutes = 0.
    let seconds = 0.
    if (matchOne.length > 2 && matchOne[2] != '') {
      minutes = parseFloat(matchOne[2]) / 60.
      if (matchOne.length > 3 && matchOne[3] != '') {
        seconds = parseFloat(matchOne[3]) / 3600.
      }
    }

    return degrees + parseFloat((minutes + seconds).toFixed(6))
  }

  static getCoordsFromHumanCoords(input) {
    //ширина возвращается первым аргументом lat
    //долгота возвращается вторым аргументом lon

    //сначала определяем минутные координаты
    const isMinSecCoords = (-1 < input.indexOf('°'))
    if (isMinSecCoords) {

      // const regStr = '(\\d+)[^°]*[°](\\d*)[^′\']*[′\']*(\\d*)'
      const regStr = '(\\d+)[^°]*[°](\\d*)[\'′]*(\\d*)[\'′]*(\\d*)\\D'
      const matches = [...input.matchAll(new RegExp(regStr, 'g'))];

      console.log(JSON.stringify(matches))

      if (matches.length != 2) {
        console.log(`Неизвестный формат координат: ${input}`)
        return undefined
      }

      let numbers = [0.0, 0.0]
      numbers[0] = this.minutesCoordToDegreeCoord(matches[0])
      numbers[1] = this.minutesCoordToDegreeCoord(matches[1])

      if (!numbers[0] || !numbers[1]) {
        console.log(`Не удалось распарсить дату: ${numbers}`)
        return undefined
      }

      if (input.includes('ю. ш.') || input.includes('ю.ш.') || input.includes('S')) {
        numbers[0] = -numbers[0]
      }
      if (input.includes('з. д.') || input.includes('з.д.') || input.includes('W')) {
        numbers[1] = -numbers[1]
      }

      return numbers.reverse()
    }

    //потом проверяем координаты типа x_y и в конце x y
    const isDelimCoords = (-1 < input.indexOf('_'))
    if (isDelimCoords) {
      const arr = input.split('_')
      if (arr.length == 2) {
        return arr.reverse().map(item => Number(item))
      }
    }

  }

  static getCenterCoord(ft) {
    let geom = ft.getGeometry()
    switch (geom.getType()) {
      case 'Point':
        return geom.getCoordinates()
        break
      case 'LineString':
        return this.getMedianXY(geom.getCoordinates())
        break
      case 'Polygon':
        return this.getMedianXY(geom.getCoordinates()[0])
        break
    }
    return kremlinLocation
  }

  static getMedianXY(coords) {
    var valuesX = []
    var valuesY = []
    coords.forEach((coord) => {
      valuesX.push(coord[0])
      valuesY.push(coord[1])
    })
    return [this.getMedian(valuesX), this.getMedian(valuesY)]
  }

  static getMedian(values) {
    values.sort((a, b) => a - b)

    var half = Math.floor(values.length / 2)

    if (values.length % 2) return values[half]
    else return (values[half - 1] + values[half]) / 2.0
  }
}
