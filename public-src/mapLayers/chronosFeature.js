import SuperFeature from './superFeature'
import StrHelper from '../../helper/strHelper'
import DateHelper from '../../helper/dateHelper'

class ChronosFeature extends SuperFeature {
  static getIcon() {
    return '/images/event.png'
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

  static fillChronosFeature(info) {
    return info.chronos.map((elem) => {
      return {
        ...elem,
        icon: ChronosFeature.getIcon(),
        oneLine: StrHelper.ellipseLongString(elem.shortBrief),
      }
    })
  }
}

module.exports = ChronosFeature
