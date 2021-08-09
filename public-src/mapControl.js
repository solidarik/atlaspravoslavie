import { Map as olMap, View as olView } from 'ol'
import * as olStyle from 'ol/style'
import * as olGeom from 'ol/geom'
import { default as olFeature } from 'ol/Feature'
import {
  toLonLat, fromLonLat,
  get as getProjection,
} from 'ol/proj'
import * as olControl from 'ol/control'
import { default as olLayer } from 'ol/layer/Tile'
import { default as olLayerVector } from 'ol/layer/Vector'
import * as olSource from 'ol/source'
import * as olTilegrid from 'ol/tilegrid'
import * as olInteraction from 'ol/interaction'
import EventEmitter from './eventEmitter'
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4'
//import { default as olPopup } from 'ol-ext/overlay/Popup'
import { default as olAnimatedCluster } from 'ol-ext/layer/AnimatedCluster'
import { default as olFeatureAnimationZoom } from 'ol-ext/featureanimation/Zoom'
import { easeOut } from 'ol/easing'
import ClassHelper from '../helper/classHelper'
import DateHelper from '../helper/dateHelper'
import GeoHelper from '../helper/geoHelper'

const MAP_PARAMS = {
  min_year: 1914,
  max_year: 1965,
  isEnableAnimate: false,
  isEnableMoveAnimate: true,
  clusterDistance: 40
}

const yaex = [
  -20037508.342789244,
  -20037508.342789244,
  20037508.342789244,
  20037508.342789244,
]

export class MapControl extends EventEmitter {
  constructor() {
    super() //first must

    window.map = this


    proj4.defs(
      'EPSG:3395',
      '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
    )
    register(proj4)
    let projection = getProjection('EPSG:3395')
    projection.setExtent(yaex)

    this.isEnableAnimate = MAP_PARAMS.isEnableAnimate
    this.isEnableMoveAnimate = MAP_PARAMS.isEnableMoveAnimate
    this.clusterDistance = MAP_PARAMS.clusterDistance
    this.isDisableSavePermalink = true
    this.isDisableMoveend = false
    this.isCheckPulse = false
    this.activeItem = undefined
    this.activeFeature = undefined
    this.pulseCoord = false
    this.map = undefined
  }

  showMap(center, zoom) {

    const view = new olView({
      center: center,
      zoom: zoom,
    })

    const rasterLayer = new olLayer({
      preload: 5,
      zIndex: 0,
      source: new olSource.OSM(),
      // source: this.getYandexSourceMap()
    })

    const map = new olMap({
      interactions: olInteraction.defaults({
        altShiftDragRotate: false,
        pinchRotate: false,
      }),
      controls: olControl.defaults({ attribution: false, zoom: false }).extend([
        //new olControl.FullScreen()
      ]),
      layers: [rasterLayer],
      //disable-popup overlays: [this.popup],
      target: 'map',
      view: view,
    })

    function getStyleSimple(feature, _) {
      const classFeature = feature.get('classFeature')
      const style = classFeature.getStyleFeature(
        feature,
        window.map.view.getZoom()
      )
      return style
    }

    function getStyleCluster(feature, _) {
      const size = feature.get('features').length
      if (size == 1) {
        const oneFeature = feature.get('features')[0]
        const classFeature = oneFeature.get('classFeature')
        const style = classFeature.getStyleFeature(
          oneFeature,
          window.map.view.getZoom()
        )
        return style
      }
      const redColor = '255,0,51'
      const cyanColor = '0,162,232'
      const greenColor = '34,177,76'
      const color = size > 10 ? redColor : size > 5 ? greenColor : cyanColor
      const radius = Math.max(8, Math.min(size, 20)) + 5
      let dash = (2 * Math.PI * radius) / 6
      dash = [0, dash, dash, dash, dash, dash, dash]
      const style = new olStyle.Style({
        image: new olStyle.Circle({
          radius: radius,
          stroke: new olStyle.Stroke({
            color: 'rgba(' + color + ',0.6)',
            width: 15,
            lineDash: dash,
            lineCap: 'butt',
          }),
          fill: new olStyle.Fill({
            color: 'rgba(' + color + ',0.9)',
          }),
        }),
        text: new olStyle.Text({
          text: size.toString(),
          font: '14px Helvetica',
          //textBaseline: 'top',
          fill: new olStyle.Fill({
            color: '#fff',
          }),
        }),
      })
      return style
    }

    // Simple Source
    let simpleSource = new olSource.Vector()
    let simpleLayer = new olLayerVector({
      source: simpleSource,
      zIndex: 1,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      style: getStyleSimple,
    })
    this.simpleLayer = simpleLayer
    this.simpleSource = simpleSource
    map.addLayer(simpleLayer)

    // Sub Source, Additional info
    let subSource = new olSource.Vector()
    let subLayer = new olLayerVector({
      source: subSource,
      zIndex: 100,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      style: getStyleSimple,
    })
    this.subLayer = subLayer
    this.subSource = subSource
    map.addLayer(subLayer)

    // Line Source, Additional info
    let lineSource = new olSource.Vector()
    let lineLayer = new olLayerVector({
      source: lineSource,
      zIndex: 10,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      style: [
        new olStyle.Style({
          stroke: new olStyle.Stroke({
            color: [255, 255, 255, 0.6],
            width: 2,
            lineDash: [4, 8],
            lineDashOffset: 6
          })
        }),
        new olStyle.Style({
          stroke: new olStyle.Stroke({
            color: [0, 0, 0, 0.6],
            width: 2,
            lineDash: [4, 8]
          })
        })
      ]
    })
    this.lineLayer = lineLayer
    this.lineSource = lineSource
    map.addLayer(lineLayer)

    // Cluster Source
    let clusterSource = new olSource.Cluster({
      distance: this.clusterDistance ? this.clusterDistance : 40,
      source: new olSource.Vector(),
    })
    let clusterLayer = new olAnimatedCluster({
      name: 'Cluster',
      source: clusterSource,
      animationDuration: this.isEnableAnimate ? 400 : 0,
      style: getStyleCluster,
    })
    this.clusterLayer = clusterLayer
    map.addLayer(clusterLayer)

    this.clusterSource = clusterSource

    this.isShowInfoMode = false

    map.on('click', (event) => {
      // disable-popup window.map.popup.hide()
      this.emit('mapclick', undefined)

      const coordinates = event.coordinate
      const lonLatCoords = new toLonLat(coordinates)

      const fromLonLat = GeoHelper.fromLonLat(lonLatCoords)

      console.log(`clicked on map: ${coordinates}; WGS: ${lonLatCoords}; testCoord: ${fromLonLat}`)
      this.onClickMap(event.pixel)

      return
    })

    map.on('moveend', () => {
      if (this.isDisableMoveend) {
        this.isDisableMoveend = false
        return
      }

      const state = {
        zoom: this.view.getZoom(),
        center: this.view.getCenter(),
      }

      this.emit('moveEnd', state)
      // window.map.savePermalink.call(window.map)
    })

    map.on('pointermove', (event) => {
      const feature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature, _) => {
          return feature
        },
        { hitTolerance: 5 }
      )

      const isHit = feature ? true : false
      if (isHit) {
        map.getTargetElement().style.cursor = 'pointer'
      } else {
        map.getTargetElement().style.cursor = ''
      }
    })

    this.map = map
    this.view = view
  }

  static create() {
    return new MapControl()
  }

  onClickMap(pixelCoord) {

    let featureEvent = undefined
    const isHit = this.map.forEachFeatureAtPixel(
      pixelCoord,
      (feature, _) => {
        featureEvent = feature
        return feature.get('kind')
      },
      { hitTolerance: 5 }
    )

    if (!featureEvent) {
      this.emit('mapEmptyClick', undefined)
      return
    }

    if (this.isShowInfoMode) {
      return
    }

    //simple feature
    let features = featureEvent.get('features')
    if (!features) {
      features = []
      features[0] = featureEvent
    }

    const featureCoord = featureEvent.getGeometry().getFirstCoordinate()
    this.currentFeatureCoord = featureCoord

    if (features.length > 0) {
      this.emit('selectFeatures', { 'items': features, 'pulseCoord': featureCoord })
    }

    this.showPulse()
  }

  setPulseCoord(state) {
    console.log(`setPulseCoord: ${JSON.stringify(state)}`)
    if (!['click', 'info'].includes(state.viewMode)) return

    this.isCheckPulse = true
    this.pulseCoord = state.pulse

    if (state.viewMode == 'info' && state.item) {
      this.activeItem = state.item
    }
  }

  createGeom(mo) {
    let geom
    switch (mo.kind) {
      case 'Point':
        geom = new ol.geom.Point(mo.coords)
        break
      case 'LineString':
        geom = new ol.geom.LineString(mo.coords)
        break
      case 'Polygon':
        geom = new ol.geom.Polygon(mo.coords)
        break
    }
    return geom
  }

  showAdditionalInfo(info) {

    const classFeature = window.classFeature

    if (!info.hasOwnProperty('livePoints') || !info.livePoints)
      return

    this.isShowInfoMode = true

    this.subSource.clear()
    this.lineSource.clear()
    let prevPoint = undefined
    let currentPoint = undefined

    info.livePoints.forEach((item) => {
      item.icon = classFeature.getIcon(item.kindAndStatus)
      const ft = new olFeature({
        info: item,
        classFeature: classFeature,
        icon: item.icon,
        geometry: new olGeom.Point(item.point),
      })
      this.subSource.addFeature(ft)

      currentPoint = item.point
      if (prevPoint) {
        const ft = new olFeature({
          geometry: new olGeom.LineString([prevPoint, currentPoint])
        })
        this.lineSource.addFeature(ft)
      }

      prevPoint = item.point

    })

    this.emit('showAdditionalInfo', undefined)
    this.hidePulse()
    this.simpleLayer.setVisible(false)
    this.clusterLayer.setVisible(false)
    this.subLayer.setVisible(true)
    this.lineLayer.setVisible(true)
    ClassHelper.addClass(
      document.getElementById('year-control'),
      'hide-element'
    )
  }

  returnNormalMode() {
    this.emit('returnNormalMode', undefined)
    this.isShowInfoMode = false

    ClassHelper.removeClass(
      document.getElementById('year-control'),
      'hide-element'
    )

    this.showPulse()
    this.subLayer.setVisible(false)
    this.lineLayer.setVisible(false)
    this.simpleLayer.setVisible(true)
    this.clusterLayer.setVisible(true)
  }

  pulseFeature(coord) {
    const f = new olFeature(new olGeom.Point(coord))
    f.setStyle(
      new olStyle.Style({
        image: new olStyle.Circle({
          radius: 26,
          stroke: new olStyle.Stroke({ color: 'red', width: 3 }),
        }),
        // image: new olStyle.RegularShape({
        //   fill: new olStyle.Fill({
        //     color: '#fff',
        //   }),
        //   stroke: new olStyle.Stroke({ color: 'black', width: 3 }),
        //   points: 4,
        //   radius: 80,
        //   radius2: 0,
        //   angle: 0,
        // }),
      })
    )
    this.map.animateFeature(
      f,
      new olFeatureAnimationZoom({
        fade: easeOut,
        duration: 1500,
        easing: easeOut,
      })
    )
  }

  showYearControl(yearOrCentury, dateMode) {
    let obj = {}
    if (dateMode === 'century') {
      obj.century = yearOrCentury
      obj.year = DateHelper.getMiddleOfCentury(yearOrCentury)
      obj.kind = 'century'
    } else {
      obj.year = yearOrCentury
      obj.century = DateHelper.yearToCentury(yearOrCentury)
      obj.kind = 'year'
    }

    this.currentYear = obj.year
    this.currentCentury = obj.century
    this.currentKind = obj.kind

    this.addYearLayer()
    this.addYearControl()
  }

  addYearControl() {
    this.map.addControl(
      new YearControl({
        caption: 'Выбрать год событий',
        year: this.currentYear,
        century: this.currentCentury,
        kind: this.currentKind,
        handler: (dateObj) => {
          this.changeYear({
            'year': dateObj.year,
            'century': dateObj.century,
            'kind': dateObj.kind
          })
        },
      })
    )
  }

  addYearLayer() {
    const yearLayer = new olLayer({
      preload: 5,
      opacity: 0.2,
      zIndex: 2,
      source: new olSource.XYZ({
        tileUrlFunction: (tileCoord, pixelRatio, projection) => {
          return this.getGeacronLayerUrl.call(
            this,
            tileCoord,
            pixelRatio,
            projection
          )
        },
      }),
    })

    this.yearLayer = yearLayer
    this.map.addLayer(yearLayer)
  }

  fixMapHeight() {
    this.isDisableMoveend = true
    if (this.map) this.map.updateSize()
  }

  updateView(center, zoom) {
    if (this.isEnableMoveAnimate) {
      this.view.animate({
        center: center,
        zoom: zoom,
        duration: 200,
      })
    } else {
      this.view.setCenter(center)
      this.view.setZoom(zoom)
    }
  }

  getGeacronLayerUrl(tileCoord, pixelRatio, projection) {
    if (!this.currentYear) return

    let year = this.currentYear
    if (this.currentKind == 'century') {
      const range = DateHelper.getCenturyRange(this.currentCentury)
      year = (range[0] + range[1]) / 2
      year = Math.round(year)
    }

    let ano = year
    let anow = '' + ano
    anow = anow.replace('-', 'B')

    anow = anow == '1951' ? '1950' : anow == '1960' ? '1959' : anow

    let z = tileCoord[0]
    let x = tileCoord[1]
    let y = tileCoord[2]

    if (z == 0 || z > 6) return

    let url = `http://cdn.geacron.com/tiles/area/${anow}/Z${z}/${y}/${x}.png`
    return url
  }

  getYandexSourceMap() {
    return new olSource.XYZ({
      projection: 'EPSG:3395',
      tileGrid: olTilegrid.createXYZ({
        extent: yaex,
      }),
      url: 'http://vec0{1-4}.maps.yandex.net/tiles?l=map&v=4.55.2&z={z}&x={x}&y={y}&scale=2&lang=ru_RU',
    })
  }

  getYandexLayerUrl(tileCoord, pixelRatio, projection) {
    let z = tileCoord[0]
    let x = tileCoord[1]
    let y = -tileCoord[2] - 1

    let url = `http://vec01.maps.yandex.net/tiles?l=map&v=4.55.2&z=${z}&x=${x}&y=${y}&scale=2&lang=ru_RU`
    return url
  }

  hidePopup() {
    /* disable-popup
    window.map.popup.hide()
    */
  }

  hidePulse() {
    clearInterval(window.pulse)
  }

  showPulse() {
    clearInterval(window.pulse)
    window.pulse = setInterval(() => {
      this.pulseFeature(this.currentFeatureCoord)
    }, 1000)
  }

  changeYear(obj) {
    this.hidePopup()
    this.hidePulse()

    this.currentYear = obj.year
    this.currentCentury = obj.century
    this.currentKind = obj.kind
    this.yearLayer.getSource().refresh()
    this.emit('changeYear', {
      'year': obj.year,
      'century': obj.century,
      'kind': obj.kind
    })
  }

  createGeom(mo) {
    let geom
    switch (mo.kind) {
      case 'Point':
        geom = new olGeom.Point(mo.coords)
        break
      case 'LineString':
        geom = new olGeom.LineString(mo.coords)
        break
      case 'Polygon':
        geom = new olGeom.Polygon(mo.coords)
        break
    }
    return geom
  }

  addFeature(item) {
    const ft = new olFeature({
      info: item,
      classFeature: item.classFeature,
      geometry: new olGeom.Point(item.point),
    })

    let source = item.simple
      ? this.simpleSource
      : this.clusterSource.getSource()

    source.addFeature(ft)
  }

  refreshInfo(info) {
    this.simpleSource.clear()
    this.clusterSource.getSource().clear()

    let simpleSourceFeatures = []
    let clusterSourceFeatures = []

    //оптимизация для ускорения добавления на карту
    info.forEach((item) => {
      const ft = new olFeature({
        info: item,
        classFeature: item.classFeature,
        geometry: new olGeom.Point(item.point),
      })

      if (item.simple) {
        simpleSourceFeatures.push(ft)
      } else {
        clusterSourceFeatures.push(ft)
      }

      if (this.activeItem && this.activeItem === item._id) {
        this.activeItem = ft
      }
    })

    // console.log('timing, before add features')
    this.simpleSource.addFeatures(simpleSourceFeatures)
    this.clusterSource.getSource().addFeatures(clusterSourceFeatures)

    const context = this
    setTimeout(() => {
      context.showSavedPulse()
      context.emit('completeShow', undefined)
    }, 10)

    // console.log('timing, after add features')
  }

  showSavedPulse() {
    if (this.isCheckPulse) {
      const pixel = this.map.getPixelFromCoordinate(this.pulseCoord)
      this.onClickMap(pixel)
      this.isCheckPulse = false

      if (this.activeItem) {
        this.emit('selectFeatures', { 'items': [this.activeItem], 'pulseCoord': this.pulseCoord })
        this.activeItem = undefined
      }

    }
  }
}

class SuperCustomControl extends olControl.Control {
  constructor(inputParams) {
    super(inputParams)
  }

  getBSIconHTML(name) {
    return '<span class="' + name + '"></span>'
  }
}

class YearControl extends SuperCustomControl {
  static get min_year() {
    return Number.MIN_SAFE_INTEGER
    return MAP_PARAMS.min_year
  }

  static get max_year() {
    return Number.MAX_SAFE_INTEGER
    return MAP_PARAMS.max_year
  }

  constructor(inputParams) {

    super(inputParams)

    const caption = inputParams.caption
    const hint = inputParams.hint || caption

    this.century = inputParams.century
    this.year = inputParams.year
    this.kind = inputParams.kind

    this.handler = inputParams.handler


    let yearInput = document.createElement('input')
    yearInput.className = 'input-without-focus'
    yearInput.title = hint
    yearInput.setAttribute('id', 'year-input')
    yearInput.value = (this.kind == 'year') ? this.year : DateHelper.intCenturyToStr(this.century)
    yearInput.addEventListener('keyup', (event) => {
      if (event.keyCode == 13) {
        this.inputKeyUp()
        event.preventDefault()
      }
    })

    let yearLabel = document.createElement('label')
    yearLabel.setAttribute('id', 'year-label')
    yearLabel.addEventListener('click', () => {
      this.yearCenturyClick()
    }, false)

    this.yearInput = yearInput
    this.yearLabel = yearLabel
    this.kind == 'year' ? this.changeKind('year') : this.changeKind('century')

    let yearLeftButton = document.createElement('button')
    yearLeftButton.innerHTML = this.getBSIconHTML('mdi mdi-step-backward-2')
    yearLeftButton.title = 'Предыдущий год/век'
    yearLeftButton.setAttribute('id', 'year-left-button')
    yearLeftButton.addEventListener(
      'click',
      () => {
        this.leftButtonClick()
      },
      false
    )
    // yearLeftButton.addEventListener('touchstart', () => { this.leftButtonClick(); }, false);

    let yearRightButton = document.createElement('button')
    yearRightButton.innerHTML = this.getBSIconHTML('mdi mdi-step-forward-2')
    yearRightButton.title = 'Следующий год/век'
    yearRightButton.setAttribute('id', 'year-right-button')
    yearRightButton.addEventListener(
      'click',
      () => {
        this.rightButtonClick()
      },
      false
    )
    // yearRightButton.addEventListener('touchstart', () => { this.rightButtonClick(); }, false);

    let parentDiv = document.createElement('div')
    parentDiv.className = 'ol-control'
    parentDiv.setAttribute('id', 'year-control')

    parentDiv.appendChild(yearLeftButton)
    parentDiv.appendChild(yearInput)
    parentDiv.appendChild(yearLabel)
    parentDiv.appendChild(yearRightButton)

    this.element = parentDiv

    olControl.Control.call(this, {
      label: 'test',
      hint: 'test',
      tipLabel: caption,
      element: parentDiv,
      // target: get(inputParams, "target")
    })
  }

  changeKind(kind) {
    this.kind = kind

    if (kind == 'century') {
      this.century = DateHelper.yearToCentury(this.year)
      this.yearInput.value = DateHelper.intCenturyToStr(this.century)
      this.yearLabel.innerHTML = 'ВЕК / год'
    } else {
      this.yearInput.value = this.year
      this.yearLabel.innerHTML = 'ГОД / век'
    }

    this.handler({
      'year': this.year,
      'century': this.century,
      'kind': kind
    })
  }

  yearCenturyClick() {
    if (this.kind == 'year') {
      this.changeKind('century')
    } else {
      this.changeKind('year')
    }
  }

  leftButtonClick() {
    let input = this.yearInput.value
    if (this.kind == 'century') {
      input = this.century
    }
    this.checkAndChangeYearCentury(input, -1)
  }

  rightButtonClick() {
    let input = this.yearInput.value
    if (this.kind == 'century') {
      input = this.century
    }
    this.checkAndChangeYearCentury(input, +1)
  }

  inputKeyUp() {
    const input = this.yearInput.value
    this.checkAndChangeYearCentury(input, 0)
  }

  checkAndChangeYearCentury(input, incr) {

    let allowToChange = false

    // предполагаем, что год и век вводится числом
    const reg = /^[-]*\d+$/
    allowToChange = reg.test(input)

    let newValue = parseInt(input) + incr
    let oldValue = 0

    if (allowToChange) {
      if (this.kind == 'year') {
        oldValue = this.year

        allowToChange = newValue < YearControl.max_year
        allowToChange = newValue > YearControl.min_year

      } else {
        oldValue = this.century
        const dateRange = DateHelper.getCenturyRange(newValue)
        allowToChange = (dateRange) && (dateRange.length == 2)
        allowToChange = dateRange[0] < YearControl.max_year
        allowToChange = dateRange[1] > YearControl.min_year

      }
    }

    allowToChange = allowToChange && (oldValue != newValue)
    if (allowToChange) {
      if (this.kind == 'year') {
        this.year = newValue
        this.yearInput.value = this.year
      } else {
        this.century = newValue
        this.yearInput.value = DateHelper.intCenturyToStr(this.century)
      }
      this.handler({
        'year': this.year,
        'century': this.century,
        'kind': this.kind
      })
    } else {
      if (this.kind == 'year')
        this.yearInput.value = this.year
      else
        this.yearInput.value = DateHelper.intCenturyToStr(this.century)
    }
  }
}
