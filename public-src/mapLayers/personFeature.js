import SuperFeature from './superFeature'
import DateHelper from '../../helper/dateHelper'
import StrHelper from '../../helper/strHelper'

class PersonFeature extends SuperFeature {
  static getIcon(kind) {
    return `images/persons_${kind}.png`
  }

  static getCaptionInfo(info) {
    return `${info.kind}. ${info.place}`
  }

  static getPopupInfo(feature) {
    const info = feature.get('info').info
    return {
      icon: this.getIcon(),
      date: info.startDate,
      caption: this.getCaptionInfo(info),
    }
  }

  static getHtmlInfo(outerInfo) {
    let info = outerInfo.info
    window.CURRENT_ITEM = info

    let worshipStr = info.worshipDays.length == 1 ? 'День почитания' : 'Дни почитания'
    worshipStr += ': ' + info.worshipDays.map((item) => item.dateStr).join(', ')

    let monkname = ''
    if (info.monkname) {
      monkname = `<h1>Имя в монашестве: ${info.monkname}</h1>`
    }


    const html = `<div class="person-info panel-info">
      <h1>${info.surname} ${info.name} ${info.middlename}</h1>
      ${monkname}
      <h2>${info.status}</h2>
      <h2>Место рождения: ${info.birth.place}</h2>
      <h2>Дата рождения: ${info.birth.dateStr}</h2>
      <h2>${worshipStr}</h2>
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
    if (!info.persons) return res

    res = info.persons.filter( item => { return item.kindAndStatus == kind })
    res = res.map((elem) => {
      return {
        ...elem,
        icon: PersonFeature.getIcon(kind)
      }
    })

    return res
  }
}

module.exports = PersonFeature
