import { MapControl } from './mapControl'
import { LegendControl } from './legendControl'
import ClientProtocol from './clientProtocol'
import { InfoControl } from './infoControl'
import { UrlControl } from './urlControl'

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
  const protocol = ClientProtocol.create()
  const mapControl = MapControl.create()
  const legendControl = LegendControl.create()
  const infoControl = InfoControl.create()
  const urlControl = UrlControl.create()

  urlControl.subscribe('initUrl', (state) => {
    mapControl.updateState(state)
    intoControl.updateState(state)
  })

  protocol.subscribe('setCurrentYear', (obj) => {
    mapControl.setCurrentYearFromServer(obj)
  })

  protocol.subscribe('refreshInfo', (info) => {
    //сначала данные проходят через одноименный фильтр контрола легенды
    legendControl.refreshInfo.call(legendControl, info)
  })

  legendControl.subscribe('refreshInfo', (info) => {
    //...и потом поступают в контрол карты
    mapControl.refreshInfo.call(mapControl, info)
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

  protocol.subscribe('getItem', (item) => {
    
  })

  infoControl.subscribe('hide', () => {
    mapControl.returnNormalMode()
    mapControl.hidePulse()
  })

  infoControl.subscribe('showItem', (item) => {
    mapControl.showAdditionalInfo(item)
  })

  mapControl.subscribe('mapEmptyClick', () => {
    console.log('mapEmptyClick')
    mapControl.returnNormalMode()
    infoControl.hide()
  })

  mapControl.subscribe('selectFeatures', (items) => {
    infoControl.updateItems(items)
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
