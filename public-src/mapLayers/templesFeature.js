import SuperFeature from './superFeature'
import strHelper from '../../helper/strHelper'
import dateHelper from '../../helper/dateHelper'

class TemplesFeature extends SuperFeature {
  static getIcon() {
    return 'images/temples.png'
  }

  static getCaptionInfo(info) {
    return `${info.name}`
  }

  static getPopupInfo(feature) {
    const info = feature.get('info')
    return {
      icon: this.getIcon(),
      caption: this.getCaptionInfo(info),
    }
  }

  static getHtmlInfo(info) {
    if (!info.startDateStr) {
      info.startDateStr = ''
    }

    if (!info.longBrief) {
      info.longBrief = ''
    }

    window.CURRENT_ITEM = info
    const html = `<div class="temples-info panel-info">
      <h1>${info.name}</h1>
      <h2>${info.place}</h2>
      <h2>${info.startDateStr}</h2>
      <p>${info.longBrief}</p>
      <div class="source-info">
        <a target='_blank' rel='noopener noreferrer' href=${
          info.eparchyUrl
        }>Митрополия/Эпархия</a>
      </div>
      <div class="source-info">
        <a target='_blank' rel='noopener noreferrer' href=${
          info.srcUrl
        }>Источник информации</a>
      </div>
    </div>
    `
    return html
  }

  static fillTemplesFeature(info) {
    return info.temples.map((elem) => {
      return {
        ...elem,
        icon: TemplesFeature.getIcon(),
        popupFirst: strHelper.ellipseLongString(elem.longBrief),
        popupSecond: dateHelper.twoDateToStr2(elem.startDateStr, elem.endDateStr)
        ,
        popupThird: elem.place,
        oneLine: strHelper.ellipseLongString(elem.name),
      }
    })
  }
}

module.exports = TemplesFeature
