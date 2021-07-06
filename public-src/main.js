import { StateControl } from './stateControl'
import { MapControl } from './mapControl'
import { LegendControl } from './legendControl'
import ClientProtocol from './clientProtocol'
import { InfoControl } from './infoControl'

import $ from 'jquery'
window.app = {}

function fixMapHeight() {
  console.log('fixMapHeight')
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

  stateControl.subscribe('fillState', (state) => {
    mapControl.showMap(state.center, state.zoom)
    mapControl.showYearControl(state.yearOrCentury, state.dateMode)
    legendControl.showHideLegend(state.isVisibleLegend)
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
    stateControl.saveStateValue('isCheckArrLegend', isCheckArrLegend)
  })

  legendControl.subscribe('isVisibleClick', (isVisible) => {
    stateControl.saveStateValue('isVisibleLegend', isVisible)
  })

  legendControl.subscribe('refreshInfo', (info) => {
    //...и потом поступают в контрол карты
    console.log('timing, recieve info from legend')
    mapControl.refreshInfo.call(mapControl, info)
    console.log('timing, finish processing data in mapcontrol')
  })

  legendControl.subscribe('legendClick', () => {
    mapControl.hidePopup()
    infoControl.hide()
  })

  mapControl.subscribe('changeYear', (dateObject) => {
    protocol.getDataByYear(dateObject)
    infoControl.hide()
  })

  mapControl.subscribe('clickItem', (item) => {

  })

  infoControl.subscribe('hide', () => {
    mapControl.returnNormalMode()
    mapControl.hidePulse()
  })

  infoControl.subscribe('showItem', (item) => {
    protocol.getInfoItem(item)
  })

  mapControl.subscribe('mapEmptyClick', () => {
    console.log('mapEmptyClick')
    mapControl.returnNormalMode()
    infoControl.hide()
  })


  protocol.subscribe('onGetInfoItem', (info) => {
    infoControl.showItemInfo(info)
    mapControl.showAdditionalInfo(info)
  })

  mapControl.subscribe('selectFeatures', (items) => {
    if (1 == items.length) {
      protocol.getInfoItem(items[0])
    } else {
      infoControl.showItemList(items)
    }
  })

  mapControl.subscribe('showAdditionalInfo', () => {
    legendControl.switchOff()
  })

  mapControl.subscribe('returnNormalMode', () => {
    legendControl.switchOn()
  })

  $(
    document.getElementsByClassName(
      'ol-attribution ol-unselectable ol-control ol-collapsed'
    )
  ).remove()

  changeWindowSize()
}

export { startApp }
