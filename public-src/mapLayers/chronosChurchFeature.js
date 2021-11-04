import SuperFeature from './superFeature'
import StrHelper from '../../helper/strHelper'
import DateHelper from '../../helper/dateHelper'

class ChronosChurchFeature extends SuperFeature {
  static getIcon() {
    return '/images/eventChurch.png'
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
    window.CURRENT_ITEM = info
    const html = `<div class="chronos-info panel-info">
      <h1>${info.place}</h1>
      <h2>${DateHelper.ymdToStr(info.start)}</h2>
      <p>${info.shortBrief}</p>
      ${info.longBrief ? '<p>' + info.longBrief + '</p>' : ''}
      <div class="source-info">
        <a target='_blank' rel='noopener noreferrer' href=${info.srcUrl
      }>Источник информации</a>
      </div>
    </div>
    `
    return html
  }

  static fillChronosChurchFeature(info) {
    return info.chronosChurch.map((elem) => {
      return {
        ...elem,
        icon: ChronosChurchFeature.getIcon(),
        oneLine: StrHelper.ellipseLongString(elem.shortBrief),
      }
    })
  }
}

module.exports = ChronosChurchFeature
