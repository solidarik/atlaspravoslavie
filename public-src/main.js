import { StateControl } from './stateControl'
import { MapControl } from './mapControl'
import { LegendControl } from './legendControl'
import { LoadCounterControl } from './loadCounterControl'
import ClientProtocol from './clientProtocol'
import { InfoControl } from './infoControl'
import JsHelper from '../helper/jsHelper'

import $ from 'jquery'
window.app = {}

function fixMapHeight() {
  // console.log('fixMapHeight')
  var mapHeight = $(window).height() - 1
  var navbar = $("nav[data-role='navbar']:visible:visible")
  var mapDiv = $("div[data-role='map']:visible:visible")
  if (navbar.outerHeight()) mapHeight = mapHeight - navbar.outerHeight()

  mapDiv.height(mapHeight)
  if (window.map && window.map.fixMapHeight) window.map.fixMapHeight()
}

function changeWindowSize() {
  fixMapHeight()
}

window.onresize = fixMapHeight //changeWindowSize

function startApp() {
  const stateControl = StateControl.create()
  const protocol = ClientProtocol.create()
  const mapControl = MapControl.create()
  const infoControl = InfoControl.create()
  const legendControl = LegendControl.create()
  const loadCounterControl = LoadCounterControl.create()

  stateControl.subscribe('fillState', (state) => {
    console.log(`hello from fillstate: ${JSON.stringify(state)}`)

    console.log('timing, start showMap')
    mapControl.showMap(state.center, state.zoom)
    console.log('timing, finish showMap')

    console.log('timing, start showYearControl')
    mapControl.showYearControl(state.yearOrCentury, state.dateMode)
    console.log('timing, finish showYearControl')

    console.log('timing, start setPulseCoord')
    mapControl.setPulseCoord(state)
    console.log('timing, finish setPulseCoord')

    console.log('timing, start showHideLegend')
    legendControl.showHideLegend(state.isVisibleLegend)
    console.log('timing, finish showHideLegend')

    console.log('timing, start setActiveLegendLines')
    legendControl.setActiveLines(state.isCheckArrLegend)
    console.log('timing, finish setActiveLegendLines')
  })

  stateControl.subscribe('changeView', (states) => {
    const oldState = states.oldState
    const newState = states.newState

    stateControl.setEnableFillUrl(false)

    mapControl.updateView(newState.center, newState.zoom)
    if (oldState.yearOrCentury != newState.yearOrCentury && oldState.dateMode != newState.dateMode) {
      mapControl.showYearControl(newState.yearOrCentury, newState.dateMode)
    }

    if (!newState.hasOwnProperty('pulse')) {
      mapControl.hidePulse()
    } else {
      if (!JsHelper.arrayEquals(oldState.pulse, newState.pulse)) {
        mapControl.setPulseCoord(newState)
        mapControl.showSavedPulse()
      }
    }

    if (newState.viewMode == 'map') {
      infoControl.hide()
    }

    if (oldState.isVisibleLegend != newState.isVisibleLegend) {
      legendControl.showHideLegend(newState.isVisibleLegend)
    }

    if (!JsHelper.arrayEquals(oldState.isCheckArrLegend, newState.isCheckArrLegend)) {
      legendControl.setActiveLines(newState.isCheckArrLegend)
    }

    stateControl.setEnableFillUrl(true)
  })

  protocol.subscribe('setCurrentYear', (obj) => {
    mapControl.setCurrentYearFromServer(obj)
  })

  protocol.subscribe('refreshInfo', (info) => {
    //сначала данные проходят через одноименный фильтр контрола легенды
    console.log('timing, get info from server')
    legendControl.refreshInfo.call(legendControl, info)
    console.log('timing, finish processing data in legendcontrol')
  })

  legendControl.subscribe('isLineClick', (isCheckArrLegend) => {
    stateControl.saveStateValue({ 'isCheckArrLegend': isCheckArrLegend })
  })

  legendControl.subscribe('isVisibleClick', (isVisible) => {
    stateControl.saveStateValue({ 'isVisibleLegend': isVisible })
  })

  legendControl.subscribe('refreshInfo', (info) => {
    //...и потом поступают в контрол карты
    console.log('timing, recieve info from legend')
    mapControl.refreshInfo.call(mapControl, info)
    console.log('timing, finish processing data in mapcontrol')
  })

  protocol.subscribe('onGetLoadStatus', (info) => {
    if (info.err) {
      console.error(`Ошибка получения статуса: ${info.err}`)
    } else {
      console.log(`Статус загрузки ${JSON.stringify(info)}`)
      loadCounterControl.showStatus(info.statusText, info.loadedTime)
    }
  })


  legendControl.subscribe('legendClick', () => {
    mapControl.hidePopup()
    infoControl.hide()
  })

  mapControl.subscribe('changeYear', (dateObject) => {
    protocol.getDataByYear(dateObject)
    infoControl.hide()

    console.log(`changeYear: ${JSON.stringify(dateObject)}`)
    let yearOrCentury = dateObject.kind == 'year' ? dateObject.year : dateObject.century
    stateControl.saveStateValue({ 'dateMode': dateObject.kind, 'yearOrCentury': yearOrCentury })
  })

  mapControl.subscribe('moveEnd', (state) => {
    console.log(`state on moveend: ${JSON.stringify(state)}`)
    stateControl.saveStateValue(state)
  })

  infoControl.subscribe('hide', () => {
    mapControl.returnNormalMode()
    mapControl.hidePulse()
    stateControl.deleteFromState(['pulse', 'item'])
    stateControl.saveStateValue({ 'viewMode': 'map' })
  })

  infoControl.subscribe('showItem', (item) => {
    protocol.getInfoItem(item)
  })

  mapControl.subscribe('mapEmptyClick', () => {
    console.log('mapEmptyClick')
    mapControl.returnNormalMode()
    infoControl.hide()
    stateControl.deleteFromState(['pulse', 'item'])
    stateControl.saveStateValue({ 'viewMode': 'map' })
  })


  protocol.subscribe('onGetInfoItem', (info) => {
    stateControl.saveStateValue({ 'viewMode': 'info', 'item': info._id })
    infoControl.showItemInfo(info)
    mapControl.showAdditionalInfo(info)
    loadCounterControl.switchOff()
  })

  mapControl.subscribe('selectFeatures', info => {
    const items = info.items
    const pulseCoord = info.pulseCoord
    if (1 == items.length) {
      stateControl.saveStateValue({ 'pulse': pulseCoord, 'viewMode': 'info' })
      protocol.getInfoItem(items[0])
    } else {
      stateControl.saveStateValue({ 'pulse': pulseCoord, 'viewMode': 'click' })
      infoControl.showItemList(items)
      loadCounterControl.switchOff()
    }

  })

  mapControl.subscribe('showAdditionalInfo', () => {
    legendControl.switchOff()
    loadCounterControl.switchOff()
  })

  mapControl.subscribe('returnNormalMode', () => {
    legendControl.switchOn()
    loadCounterControl.switchOn()
  })

  mapControl.subscribe('completeShow', () => {
    console.log('complete show')
    protocol.getLoadStatus()
    stateControl.setEnableFillUrl(true)
  })

  $(
    document.getElementsByClassName(
      'ol-attribution ol-unselectable ol-control ol-collapsed'
    )
  ).remove()

  changeWindowSize()
}

export { startApp }
