import EventEmitter from './eventEmitter'
import CookieHelper from './cookieHelper'

import {
  fromLonLat,
  toLonLat
} from 'ol/proj'

export class StateControl extends EventEmitter {
  constructor() {
    super() //first must

    window.stateControl = this

    const year = new Date().getFullYear()

    this.state = {
      'center': new fromLonLat([56.004, 54.695]), // ufa place 56.004,54.695
      'zoom': 5,
      'dateMode': 'year', // year | century
      'viewMode': 'map', // map | info
      'yearOrCentury': year,
      'isVisibleLegend': true, // true | false
      'isCheckArrLegend': [0, 1, 2, 3, 4, 5, 6, 7] // 0,1,2,3,4,5,6,7
    }

    setTimeout(() => {
      // console.log(`state default ${JSON.stringify(this.state)}`)
      this.fillStateFromCookies()
      // console.log(`state after cookies ${JSON.stringify(this.state)}`)
      this.fillStateFromUrl()
      // console.log(`state after url ${JSON.stringify(this.state)}`)
      this.emit('fillState', this.state)
    }, 10)

  }

  saveStateValue(stateKey, value) {
    this.state[stateKey] = value
    CookieHelper.setCookie(stateKey, value)
    this.renewStateUrl()
  }

  renewStateUrl() {
    let state = '?'
    let delim = ''
    for (const stateKey in this.state) {
      let value = this.state[stateKey]

      if (stateKey === 'center') {
        value = (new toLonLat(value)).map(c => c.toFixed(4))
      }

      if (stateKey === 'isCheckArrLegend') {
        value = this.state[stateKey].join(',')
      }

      state += `${delim}${stateKey}=${value}`
      delim = '&'
    }
    window.history.pushState(state, 'map', state)
    console.log(`renew Url with state ${JSON.stringify(this.state)}`)
  }

  getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }
    console.log('Query variable %s not found', variable);
  }

  fillStateInt(stateKey, maybeValue) {
    maybeValue = parseInt(maybeValue, 10)
    if (maybeValue) {
      this.state[stateKey] = maybeValue
    }
  }

  fillStateMode(stateKey, maybeValue, allowValues) {
    if (allowValues.includes(maybeValue))
      this.state[stateKey] = maybeValue
  }

  fillStateCenter(stateKey, maybeValue) {
    let twoNumbers = maybeValue.split(',')
    twoNumbers = twoNumbers.map(n => parseFloat(n))
    if (2 == twoNumbers.length)
      this.state[stateKey] = new fromLonLat(twoNumbers)
  }

  fillStateBoolean(stateKey, maybeValue) {
    if (['true', 'false'].includes(maybeValue))
      this.state[stateKey] = (maybeValue === 'true')
  }

  fillStateArray(stateKey, maybeValue, allowValues) {
    let numbers = maybeValue.split(',')
    numbers = numbers.map(n => parseInt(n))
    numbers = numbers.filter(n => allowValues.includes(n))
    if (numbers.length > 0)
      this.state[stateKey] = numbers
  }

  fillStateMaybe(stateKey, maybeValue) {

    if (!maybeValue) return

    switch (stateKey) {
      case 'zoom':
        this.fillStateInt(stateKey, maybeValue)
        break

      case 'yearOrCentury':
        this.fillStateInt(stateKey, maybeValue)
        break

      case 'dateMode':
        this.fillStateMode(stateKey, maybeValue, ['year', 'century'])
        break

      case 'center':
        this.fillStateCenter(stateKey, maybeValue)
        break

      case 'isVisibleLegend':
        this.fillStateBoolean(stateKey, maybeValue)
        break

      case 'isCheckArrLegend':
        const allowNumbers = [...Array(7).keys()];
        this.fillStateArray(stateKey, maybeValue, allowNumbers)
        break

      case 'viewMode':
        this.fillStateMode(stateKey, maybeValue, ['viewMode', 'map'])
        break
    }
  }

  fillStateFromUrl() {

    const location = window.location
    if (location.search == '') return
    const searchParams = new URLSearchParams(location.search.slice(1));
    if (!searchParams) return

    for (const stateKey in this.state) {
      if (!searchParams.has(stateKey)) continue

      const maybeValue = this.getQueryVariable(stateKey)
      this.fillStateMaybe(stateKey, maybeValue)
    }
  }

  fillStateFromCookies() {
    for (const stateKey in this.state) {
      const maybeValue = CookieHelper.getCookie(stateKey)
      this.fillStateMaybe(stateKey, maybeValue)
    }
  }

  savePermalink() {
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

  static create() {
    console.log('Создание компонента StateControl')
    return new StateControl()
  }
}

window.onpopstate = (event) => {
  // const map = window.map
  // map.isDisableSavePermalink = true
  // map.isDisableMoveend = true
  // event.state
  //   ? map.readViewFromState.call(map, event.state)
  //   : map.readViewFromPermalink.call(map)
  // map.updateView.call(map)
}