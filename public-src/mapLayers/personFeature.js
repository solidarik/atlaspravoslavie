import SuperFeature from './superFeature'
import DateHelper from '../../helper/dateHelper'
import * as olStyle from 'ol/style'

class PersonFeature extends SuperFeature {
  static getIcon(kind) {
    return `/images/persons_${kind}.png`
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
        imgSize: [40, 40],
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

    let worshipStr = ''
    if (info.worshipDays.length > 0) {
      worshipStr = info.worshipDays.length == 1 ? 'День почитания' : 'Дни почитания'
      worshipStr += ': ' + info.worshipDays.map((item) => item.dateStr).join(', ')
    }

    let monkname = ''
    if (info.monkname && info.monkname != outerInfo.caption) {
      monkname = `<h2>Имя в монашестве: ${info.monkname}</h2>`
    }

    let fio = `${info.surname} ${info.name} ${info.middlename}`
    fio = fio.trim()
    if (fio == outerInfo.caption || info.surname == info.name
      || info.name == outerInfo.caption) {
      fio = ''
    } else {
      fio = `<h2>${fio}</h2>`
    }

    const imgUrls = info.imgUrls
    let imgHtml = ''
    if (imgUrls && imgUrls.length > 0) {
      imgHtml = `<img src="${imgUrls[0]}" class="rounded float-start imageFeatureInfo"></img>`
    }

    let html = `<div class="person-info panel-info">
      <div class="row">
        <div class="col-md-auto">
          ${imgHtml}
        </div>
        <div class="col">
          <h1>${outerInfo.caption}</h1>
          ${monkname}
          ${fio}
          <h2>${info.status}</h2>`


    if (worshipStr) {
      html += `<h2 class='worship-days'>${worshipStr}</h2>`
    }

    html += `<table id='person-table' class='table table-borderless'>
            <thead>
              <tr>
                <th scope='col'></th>
                <th scope='col'>Место</th>
                <th scope='col'>Дата</th>
              </tr>
            </thead>
            <tbody>`

    console.log(`Person Info: ${JSON.stringify(info)}`)

    if (info.birth.dateStr && !info.birth.isIndirectDate) {
        html += `
          <tr>
            <th scope='row'>Рождение</th>
            <td>${(info.birth.place && !info.birth.isIndirectPlace) ? info.birth.place : '-'}</td>
            <td>${DateHelper.ymdToStr(info.birth)}</td>
          </tr>`
    }

    info.achievements.forEach(achiev => {
      if (achiev.start.dateStr) {
        html += `
          <tr><th scope='row'>Подвиг</th>
            <td>${achiev.place ? achiev.place : '—'}</td>
            <td>${DateHelper.rangeYmdToStr(achiev.start, achiev.end)}</td>
          </tr>
        `
      }
    });

    if (info.death.dateStr && !info.death.isIndirectDate) {
      html += `
        <tr><th scope='row'>Смерть</th>
          <td>${(info.death.place && !info.death.isIndirectPlace) ? info.death.place : '—'}</td>
          <td>${DateHelper.ymdToStr(info.death)}</td>
        </tr>
      `
    }

    if (info.canonizationDate && info.canonizationDate.dateStr) {
      html += `<tr><th scope='row'>Канонизация</th>
        <td></td>
        <td>${DateHelper.ymdToStr(info.canonizationDate)}</td>
      </tr>`
    }

    html += '</tbody></table>'

    const personUrl = `person/${info.pageUrl}`

    if (outerInfo.shortDescription) {
      html += `<p>${outerInfo.shortDescription}</p>`
    }

    html += `
      <div class="source-info">
        <a rel='noopener noreferrer' title="Строка-Источник: ${info.lineSource}"
          href="${personUrl}">Подробнее</a>
      </div>
    </div></div></div>
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

  static fillPersonForInfo(info) {

  }

  static fillPersonItems(info, kind) {
    let res = []
    if (!info.persons) return res

    res = info.persons.filter(item => { return item.kindAndStatus == kind })
    res = res.map((elem) => {
      return {
        ...elem,
        icon: PersonFeature.getIcon(kind),
        oneLine: `${elem.caption}`,
      }
    })

    return res
  }
}

module.exports = PersonFeature
