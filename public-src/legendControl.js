import EventEmitter from './eventEmitter'
import ClassHelper from '../helper/classHelper'
import JsHelper from '../helper/jsHelper'
import ChronosFeature from './mapLayers/chronosFeature'
import ChronosTempleFeature from './mapLayers/chronosTempleFeature'
import TemplesFeature from './mapLayers/templesFeature'
import PersonFeature from './mapLayers/personFeature'

export class LegendControl extends EventEmitter {
  constructor() {
    super() //first must

    this.legendButton = document.getElementById('legend-button')
    this.legendButton.addEventListener('click', this.legendButtonClick)

    this.legendSpan = document.getElementById('legend-span')
    this.legendDiv = document.getElementById('legend-div')
    this.isVisible = false
    this.showHideLegend()

    this.lines = this.addLines()
    this.linesCount = 7
    this.isCheckArr = JsHelper.fillArray(true, this.linesCount)

    this.items = JsHelper.fillArray([], this.linesCount)
    this.uniqueItemsForVisibleOnMap = {}
    this.uniqueItemsForLegend = {}

    window.legend = this
    window.legendOnLineClick = (element) => {
      window.legend.legendOnLineClick.call(window.legend, element)
    }
  }

  static create() {
    return new LegendControl()
  }

  pointFilter(res) {
    return res.filter(
      (item) => item.point && item.point.length === 2 && item.point[0] !== 0
    )
  }

  fillPersonsFeature(info) {
    let res = []

    res = res.concat(PersonFeature.fillPersonItems(info, 'birth_martyrs'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'live_martyrs'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'death_martyrs'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'achiev_martyrs'))

    res = res.concat(PersonFeature.fillPersonItems(info, 'birth_holy'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'live_holy'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'death_holy'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'achiev_holy'))

    res = res.concat(PersonFeature.fillPersonItems(info, 'birth_reverends'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'live_reverends'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'death_reverends'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'achiev_reverends'))
    return res
  }

  fillPersonMartyrsFeature(info) {
    let res = []
    res = res.concat(PersonFeature.fillPersonItems(info, 'birth_martyrs'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'live_martyrs'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'death_martyrs'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'achiev_martyrs'))
    return res
  }

  fillPersonHolyFeature(info) {
    let res = []
    res = res.concat(PersonFeature.fillPersonItems(info, 'birth_holy'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'live_holy'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'death_holy'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'achiev_holy'))
    return res
  }

  fillPersonReverendsFeature(info) {
    let res = []
    res = res.concat(PersonFeature.fillPersonItems(info, 'birth_reverends'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'live_reverends'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'death_reverends'))
    res = res.concat(PersonFeature.fillPersonItems(info, 'achiev_reverends'))
    return res
  }

  addLines() {
    let lines = []

    lines.push({
      id: 0,
      caption: 'События',
      classFeature: ChronosFeature,
      fillFunction: ChronosFeature.fillChronosFeature,
      icon: ChronosFeature.getIcon(),
    })

    lines.push({
      id: 1,
      caption: 'События Церкви',
      classFeature: ChronosTempleFeature,
      fillFunction: ChronosTempleFeature.fillChronosTempleFeature,
      icon: ChronosTempleFeature.getIcon(),
    })

    lines.push({
      id: 2,
      caption: 'Храмы',
      classFeature: TemplesFeature,
      fillFunction: TemplesFeature.fillTemplesFeature,
      icon: TemplesFeature.getIcon(),
    })

    lines.push({
      id: 3,
      caption: 'Лики',
      classFeature: PersonFeature,
      fillFunction: this.fillPersonsFeature,
      // icon: PersonFeature.getIcon(),
      childs: [
        {
          id: 4,
          caption: 'Мученики',
          classFeature: PersonFeature,
          fillFunction: this.fillPersonMartyrsFeature,
          fillFunctionKind: 'birth_martyrs',
          icon: PersonFeature.getIcon('birth_martyrs'),
          isHide: false,
        },
        {
          id: 5,
          caption: 'Преподобные',
          classFeature: PersonFeature,
          fillFunction: this.fillPersonReverendsFeature,
          fillFunctionKind: 'birth_reverends',
          icon: PersonFeature.getIcon('birth_reverends'),
          isHide: false,
        },
        {
          id: 6,
          caption: 'Святые',
          classFeature: PersonFeature,
          fillFunction: this.fillPersonHolyFeature,
          fillFunctionKind: 'birth_holy',
          icon: PersonFeature.getIcon('birth_holy'),
          isHide: false,
        },
      ]
    })

    return lines
  }

  showHideLegend(isShow = undefined) {
    if (isShow !== undefined) {
      this.isVisible = isShow
    }

    if (this.isVisible) {
      ClassHelper.removeClass(this.legendDiv, 'legend-div-hide')
      ClassHelper.addClass(this.legendDiv, 'legend-div-show')
      // this.legendSpan.className = 'mdi mdi-close mdi-24px'
    } else {
      ClassHelper.removeClass(this.legendDiv, 'legend-div-show')
      ClassHelper.addClass(this.legendDiv, 'legend-div-hide')
      // this.legendSpan.className = 'mdi mdi-format-list-bulleted mdi-24px'
    }
  }

  legendButtonClick(event) {
    const legend = window.legend
    legend.isVisible = !legend.isVisible
    legend.showHideLegend.call(legend)
    legend.emit('isVisibleClick', legend.isVisible)
  }

  getIcons(line) {
    let icons = []

    if (line.icon) {
      icons.push(line.icon)
    } else {
      if (line.childs) {
        line.childs.forEach((child) => {
          const subIcons = this.getIcons(child)
          subIcons.forEach((icon) => icons.push(icon))
        })
      }
    }

    return icons
  }

  getHTMLIcons(line) {
    let htmlIcon = ''
    if (line.icon) htmlIcon += `<img src="${line.icon}" alt="${line.caption}">`
    else {
      this.getIcons(line).forEach((icon) => {
        htmlIcon += `<img src="${icon}" alt="${line.caption}">`
      })
    }
    return htmlIcon
  }

  searchLinesById(id, lines = undefined) {
    let maybeLine = undefined
    !lines && (lines = this.lines)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (id === line.id) {
        maybeLine = line
        break
      }

      if (line.childs) {
        maybeLine = this.searchLinesById(id, line.childs)
        if (maybeLine) {
          break
        }
      }
    }
    return maybeLine
  }

  repaintLegend() {
    let html = `
    <h1>Легенда</h1>
    <table class="table table-borderless">
    <tbody>`

    this.lines.forEach((line) => {
      if (!line.isHide)
        html += this.getHTMLOneLineLegend(line, 0, this.isCheckArr[line.id])
    })

    html += '</tbody></table>'
    this.legendDiv.innerHTML = html
  }

  setActiveLines(isCheckArr) {
    for (let iRow = 0; iRow < this.linesCount; iRow++) {
      this.isCheckArr[iRow] = isCheckArr.includes(iRow)
    }
    this.repaintLegend()
  }

  legendOnLineClick(elem) {

    this.emit('legendClick', null)

    let tr = elem
    while (!tr.hasAttribute('data-href')) {
      tr = tr.parentElement
    }

    const rowId = parseInt(tr.getAttribute('data-href'))
    //const line = this.searchLinesById.call(this, rowId)

    this.isCheckArr[rowId] = !this.isCheckArr[rowId]

    let numbers = []
    const localCheckArr = this.getActiveLines()
    for (let iRow = 0; iRow < localCheckArr.length; iRow++) {
      if (localCheckArr[iRow]) {
        numbers.push(iRow)
      }
    }
    this.emit('isLineClick', numbers)

    this.repaintLegend()
    this.filterInfo()
  }

  clickSpan(content) {
    return `<span>${content}</span>`
  }

  getActiveLine(line, isCheckParent) {
    let checkArr = []

    checkArr.push(this.isCheckArr[line.id] && isCheckParent)

    if (line.childs) {
      line.childs.forEach((child) => {
        if (!child.isHide) {
          const localCheckArr = this.getActiveLine(
            child, isCheckParent && this.isCheckArr[child.id]
          )
          checkArr = checkArr.concat(localCheckArr)
        }
      })
    }
    return checkArr
  }

  getActiveLines() {
    let checkArr = []

    this.lines.forEach((line) => {
      const localCheckArr = this.getActiveLine(line, this.isCheckArr[line.id])
      checkArr = checkArr.concat(localCheckArr)
    })
    return checkArr
  }

  getHTMLOneLineLegend(line, level, isCheckParent) {
    let html = ''
    const leftImagePosition =
      level > 0 ? `style="left: ${level * 5}px;z-index: ${level}"` : ''
    const leftCaptionPosition =
      level > 0 ? `style="padding-left: ${level * 30}px"` : ''

    const classTr =
      this.isCheckArr[line.id] && isCheckParent
        ? ''
        : 'class="legend-filter-grayscale"'

    html += `<tr data-href=${line.id} ${classTr} onclick=legendOnLineClick(this)>
      <td ${leftImagePosition}>${this.clickSpan(this.getHTMLIcons(line))}</td>
      <td ${leftCaptionPosition}>${this.clickSpan(line.caption)}</td>
      <td>${Object.keys(this.uniqueItemsForLegend[line.id]).length}</td>
    </tr>`

    if (line.childs) {
      line.childs.forEach((child) => {
        if (!child.isHide) {
          html += this.getHTMLOneLineLegend(
            child,
            level + 1,
            isCheckParent && this.isCheckArr[child.id]
          )
        }
      })
    }
    return html
  }

  updateCounter(rawInfo) {
    this.items = JsHelper.fillArray([], this.linesCount)
    this.uniqueItemsForVisibleOnMap = {}
    this.uniqueItemsForLegend = {}
    for (let id = 0; id < this.linesCount; id++) {
      const line = this.searchLinesById(id)
      //injection classFeature property to every item
      let fillResult = line.fillFunction.call(
        this,
        rawInfo,
        line.fillFunctionKind
      )
      this.items[id] = []
      this.uniqueItemsForLegend[id] = {}
      if (fillResult) {
        fillResult = this.pointFilter(fillResult)
        this.items[id] = fillResult.map((elem) => {
          return { ...elem, classFeature: line.classFeature }
        })
        this.items[id].forEach((item) => {
          this.uniqueItemsForLegend[id][item.lineSource] = item
          this.uniqueItemsForVisibleOnMap[item._id] = item
        })
      } else {
        console.log(`Не удалось инициализировать массив для ${line.caption}`)
      }
    }
  }

  filterInfo() {
    let visible = {}
    for (let id in this.uniqueItemsForVisibleOnMap) {
      visible[id] = true
    }

    //loop all layer items and set visible to unique items
    for (let id = 0; id < this.linesCount; id++) {
      const isVisibleLayer = this.isCheckArr[id]
      this.items[id].forEach((item) => {
        visible[item._id] = visible[item._id] && isVisibleLayer
      })
    }

    let res = []
    for (let id in this.uniqueItemsForVisibleOnMap) {
      visible[id] && res.push(this.uniqueItemsForVisibleOnMap[id])
    }

    this.emit('refreshInfo', res)
  }

  refreshInfo(rawInfo) {
    this.rawInfo = rawInfo
    this.updateCounter(this.rawInfo)
    this.repaintLegend()
    this.filterInfo()
  }

  switchOff() {
    ClassHelper.removeClass(this.legendDiv, 'legend-div-show')
    ClassHelper.addClass(this.legendDiv, 'legend-div-hide')
    ClassHelper.addClass(this.legendButton, 'hide-element')
  }

  switchOn() {
    ClassHelper.removeClass(this.legendButton, 'hide-element')
    this.showHideLegend()
  }
}
