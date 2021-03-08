import SuperFeature from './superFeature'
import DateHelper from '../../helper/dateHelper'
import StrHelper from '../../helper/strHelper'
import * as olStyle from 'ol/style'

class PersonFeature extends SuperFeature {
  static getIcon(kind) {
    return `images/persons_${kind}.png`
  }

  static getCaptionInfo(outerInfo) {
    return `${outerInfo.info.kind}. ${outerInfo.info.place}`
  }

  static getPopupInfo(feature) {
    const info = feature.get('info').info
    return {
      icon: this.getIcon(),
      date: info.startDate,
      caption: this.getCaptionInfo(info),
    }
  }

  static getStyleFeature(feature, zoom) {
    const style = new olStyle.Style({
      image: new olStyle.Icon({
        anchor: [0.5, 0.5],
        imgSize: [34, 34],
        src: feature.get('info').icon,
        //color: '#ff0000',
        // fill: new olStyle.Fill({ color: 'rgba(153,51,255,1)' }),
        scale: 1,
        radius: 7,
        opacity: 1,
      }),
    })
    return [style]
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

    let html = `<div class="person-info panel-info">
      <h1>${info.surname} ${info.name} ${info.middlename}</h1>
      ${monkname}
      <h2>${info.status}</h2>
      <table id='person-table' class='table table-borderless'>
        <thead>
          <tr>
            <th scope='col'></th>
            <th scope='col'>Место</th>
            <th scope='col'>Дата</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope='row'>Рождение</th>
            <td>${info.birth.place}</td>
            <td>${info.birth.dateStr}</td>
          </tr>`

    info.achievements.forEach(achiev => {
      if (achiev.dateStr) {
        html += `
          <tr><th scope='row'>Подвиг</th>
            <td>${achiev.place}</td>
            <td>${achiev.dateStr}</td>
          </tr>
        `
      }
    });

    if (info.death.dateStr) {
      html += `
        <tr><th scope='row'>Смерть</th>
          <td>${info.death.place}</td>
          <td>${info.death.dateStr}</td>
        </tr>
      `
    }

    html += '</tbody></table>'

    html += `
      <h2 class='worship-days'>${worshipStr}</h2>
      <p>${outerInfo.shortDescription}</p>
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
      const info = elem.info
      return {
        ...elem,
        icon: PersonFeature.getIcon(kind),
        oneLine: `${info.surname} ${info.name} ${info.middlename}`,
      }
    })

    return res
  }
}

module.exports = PersonFeature
