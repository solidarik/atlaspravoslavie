import SuperFeature from './superFeature'
import StrHelper from '../../helper/strHelper'
import DateHelper from '../../helper/dateHelper'

export default class TemplesFeature extends SuperFeature {
  static getIcon() {
    return '/images/temples.png'
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

    if (!info.longBrief) {
      info.longBrief = ''
    }

    const templeUrl = `church/${info.pageUrl}`

    const imgUrls = info.imgUrls
    let imgHtml = ''
    if (imgUrls && imgUrls.length > 0) {
      imgHtml = `<img src="${imgUrls[0]}" class="rounded float-start imageFeatureInfo"></img>`
    }

    window.CURRENT_ITEM = info
    const html = `<div class="temples-info panel-info">
      <div class="row">
        <div class="col-md-auto">
          ${imgHtml}
        </div>
        <div class="col">
          <h1>${info.name}</h1>
          <h2>${info.place}</h2>
          <h2>${DateHelper.ymdToStr(info.start)}</h2>
          <p>${StrHelper.ellipseLongString(info.longBrief, 500)}</p>
          <div class="source-info">
            <a rel='noopener noreferrer' href="${templeUrl}">Подробнее</a>
          </div>
        </div>
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
        oneLine: StrHelper.ellipseLongString(elem.name),
      }
    })
  }
}
