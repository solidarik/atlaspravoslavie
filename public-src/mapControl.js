import { Map as olMap, View as olView } from 'ol'
import * as olStyle from 'ol/style'
import * as olGeom from 'ol/geom'
import { default as olFeature } from 'ol/Feature'
import {
  fromLonLat,
  toLonLat,
  get as getProjection,
  //transformExtent,
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

const MAP_PARAMS = {
  min_year: 1914,
  max_year: 1965,
  isEnableAnimate: true,
}

export class MapControl extends EventEmitter {
  constructor() {
    super() //first must

    window.map = this

    const yaex = [
      -20037508.342789244,
      -20037508.342789244,
      20037508.342789244,
      20037508.342789244,
    ]
    proj4.defs(
      'EPSG:3395',
      '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
    )
    register(proj4)
    let projection = getProjection('EPSG:3395')
    projection.setExtent(yaex)

    const rasterLayer = new olLayer({
      preload: 5,
      zIndex: 0,
      // source: new olSource.OSM(),
      source: new olSource.XYZ({
        projection: 'EPSG:3395',
        tileGrid: olTilegrid.createXYZ({
          extent: yaex,
        }),
        url:
          'http://vec0{1-4}.maps.yandex.net/tiles?l=map&v=4.55.2&z={z}&x={x}&y={y}&scale=2&lang=ru_RU',
      }),
    })

    this.isEnableAnimate = MAP_PARAMS.isEnableAnimate
    this.isDisableSavePermalink = true
    this.isDisableMoveend = false
    this.readViewFromPermalink()

    const view = new olView({
      center: this.center ? this.center : new fromLonLat([56.004, 54.695]), // ufa place
      zoom: this.zoom ? this.zoom : 3,
      // projection: 'EPSG:4326',
      // projection: 'EPSG:3857',
      // projection: 'EPSG:3395',
    })

    /* temporarily disable-popup
    this.popup = new olPopup({
      popupClass: 'default shadow', //"default shadow", "tooltips", "warning" "black" "default", "tips", "shadow",
      closeBox: true,
      onshow: function () {
        // console.log('You opened the box')
      },
      onclose: function () {
        // console.log('You close the box')
      },
      positioning: 'auto',
      autoPan: true,
      autoPanAnimation: { duration: this.isEnableAnimate ? 250 : 0 },
    })
    */

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

    // Cluster Source
    let clusterSource = new olSource.Cluster({
      distance: 10,
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

    map.on('click', (event) => {
      // disable-popup window.map.popup.hide()
      this.emit('mapclick', undefined)

      const coordinates = event.coordinate
      const lonLatCoords = new toLonLat(coordinates)
      console.log(`clicked on map: ${coordinates}; WGS: ${lonLatCoords}`)

      let featureEvent = undefined
      const isHit = map.forEachFeatureAtPixel(
        event.pixel,
        (feature, _) => {
          featureEvent = feature
          return feature.get('kind')
        },
        { hitTolerance: 5 }
      )

      if (!featureEvent) return

      //simple feature
      let features = featureEvent.get('features')
      if (!features) {
        features = []
        features[0] = featureEvent
      }

      if (features.length > 0) {
        this.emit('selectFeatures', features)
      }

      const featureCoord = featureEvent.getGeometry().getFirstCoordinate()
      this.currentFeatureCoord = featureCoord
      this.showPulse()

      return
    })

    map.on('moveend', () => {
      if (this.isDisableMoveend) {
        this.isDisableMoveend = false
        return
      }
      window.map.savePermalink.call(window.map)
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

    setTimeout(() => {
      this.addYearLayer()
    }, 10)
  }

  static create() {
    return new MapControl()
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
    this.emit('showAdditionalInfo', undefined)
    this.hidePulse()
    this.simpleLayer.setVisible(false)
    this.clusterLayer.setVisible(false)
    ClassHelper.addClass(
      document.getElementById('year-control'),
      'hide-element'
    )
  }

  returnNormalMode() {
    this.emit('returnNormalMode', undefined)
    ClassHelper.removeClass(
      document.getElementById('year-control'),
      'hide-element'
    )

    this.showPulse()
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

  setCurrentYearFromServer(obj) {
    this.changeYear(obj)
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
    this.map.updateSize()
  }

  updateView() {
    if (this.isEnableAnimate) {
      this.view.animate({
        center: this.center,
        zoom: this.zoom,
        duration: 200,
      })
    } else {
      this.view.setCenter(this.center)
      this.view.setZoom(this.zoom)
    }
  }

  readViewFromState(state) {
    this.center = state.center
    this.zoom = state.zoom
  }

  readViewFromPermalink() {
    if (window.location.hash !== '') {
      var hash = window.location.hash.replace('#map=', '')
      var parts = hash.split('/')
      if (parts.length === 3) {
        this.zoom = parseInt(parts[0], 10)
        this.center = [parseFloat(parts[1]), parseFloat(parts[2])]
      }
    }
  }

  savePermalink() {
    if (this.isDisableSavePermalink) {
      this.isDisableSavePermalink = false
    }

    const center = this.view.getCenter()
    const hash =
      '#map=' +
      Math.round(this.view.getZoom()) +
      '/' +
      Math.round(center[0] * 100) / 100 +
      '/' +
      Math.round(center[1] * 100) / 100
    const state = {
      zoom: this.view.getZoom(),
      center: this.view.getCenter(),
    }

    window.history.pushState(state, 'map', hash)
  }

  getGeacronLayerUrl(tileCoord, pixelRatio, projection) {
    if (!this.currentYear) return

    let year = this.currentYear
    if (this.currentKind == 'century') {
      const range = DateHelper.getCenturyRange(this.currentCentury)
      year = (range[0] + range[1]) / 2
      year = Math.round(year)
      console.log(`>>>>>>>> year by round century ${year}`)
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
    info.forEach((item) => this.addFeature(item))
  }
}

window.onpopstate = (event) => {
  const map = window.map
  map.isDisableSavePermalink = true
  map.isDisableMoveend = true
  event.state
    ? map.readViewFromState.call(map, event.state)
    : map.readViewFromPermalink.call(map)
  map.updateView.call(map)
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
    yearLabel.innerHTML = this.kind == 'year' ? 'год' : 'век'
    yearLabel.addEventListener('click', () => {
      this.yearCenturyClick()
    }, false)

    this.yearInput = yearInput
    this.yearLabel = yearLabel

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

  changeKind(kind, caption) {
    this.kind = kind
    this.yearLabel.innerHTML = caption

    if (kind == 'century') {
      this.century = DateHelper.yearToCentury(this.year)
      this.yearInput.value = DateHelper.intCenturyToStr(this.century)
    } else {
      this.yearInput.value = this.year

    }

    this.handler({
      'year': this.year,
      'century': this.century,
      'kind': kind
    })
  }

  yearCenturyClick() {
    if (this.kind == 'year') {
      this.changeKind('century', 'век')
    } else {
      this.changeKind('year', 'год')
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
    const reg = /^\d+$/
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
        allowToChange=  dateRange[1] > YearControl.min_year

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
        'kind': this.kind})
    } else {
      if (this.kind == 'year')
        this.yearInput.value = this.year
      else
        this.yearInput.value = DateHelper.intCenturyToStr(this.century)
    }
  }
}
