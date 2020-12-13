import SuperFeature from './superFeature'
import DateHelper from '../../helper/dateHelper'
import StrHelper from '../../helper/strHelper'

class PersonFeature extends SuperFeature {
  static getIcon() {
    return 'images/faces.png'
  }

  static getMartyrsIcon() {
    return 'images/persons_martyrs.png'
  }

  static getReverendsIcon() {
    return 'images/persons_reverends.png'
  }

  static getHolyIcon() {
    return 'images/persons_holy.png'
  }

  static getCaptionInfo(info) {
    return `${info.kind}. ${info.place}`
  }

  static getPopupInfo(feature) {
    const info = feature.get('info')
    return {
      icon: this.getIcon(),
      date: info.startDate,
      caption: this.getCaptionInfo(info),
    }
  }

  static getHtmlInfo(info) {
    window.CURRENT_ITEM = info
    const delimSymbol = '<br/>'
    const html = `<div class="person-info panel-info">
      <h1>${info.surname} ${info.name} ${info.middlename} ${info.monkname}</h1>
      <h2>${info.status}</h2>
      <h2>Место рождения: ${info.birth.place}</h2>
      <h2>Дата рождения: ${info.birth.dateStr}
      <p>${info.fullDescription}</p>
      <div class="source-info">
        <a target='_blank' rel='noopener noreferrer' href=${
          info.pageUrl
        }>Подробнее</a>
      </div>
    </div>
    `
    return html
  }

  static getFio(info) {
    let res = []
    info.surname && res.push(info.surname)
    info.name && res.push(info.name)
    info.middlename && res.push(info.middlename)
    return res.join(' ')
  }

  static fillPersonItems(info, kind) {
    let res = []
    console.log(JSON.stringify(info.personsMartyrs))
    switch (kind) {
      case 'martyrs':
        if (!info.personsMartyrs) return res
        res = info.personsMartyrs.map((elem) => {
          return {
            ...elem,
            point: elem.birth.placeCoord[0],
            icon: PersonFeature.getMartyrsIcon()
          }
        })
        break
      case 'reverends':
        if (!info.personsReverends) return res
        res = info.personsReverends.map((elem) => {
          return {
            ...elem,
            point: elem.birth.placeCoord[0],
            icon: PersonFeature.getReverendsIcon()
          }
        })
        break
      case 'holy':
        if (!info.personsHoly) return res
        res = info.personsHoly.map((elem) => {
          return {
            ...elem,
            point: elem.birth.placeCoord[0],
            icon: PersonFeature.getHolyIcon()
          }
        })
        break
      default:
        throw console.error(`fillPersonItems, некорректный kind ${kind}`)
    }
    res = res.map((elem) => {
      return { ...elem, oneLine: `${PersonFeature.getFio(elem)}` }
    })
    return res
  }
}

module.exports = PersonFeature
