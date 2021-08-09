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

    this.enableFillUrl = false

    this.state = {
      'center': new fromLonLat([56.004, 54.695]), // ufa place 56.004,54.695
      'pulse': undefined, // координаты выбранного элемента
      'zoom': 5,
      'item': undefined,
      'dateMode': 'year', // year | century
      'viewMode': 'map', // map | click | info
      'yearOrCentury': year,
      'isVisibleLegend': true, // true | false
      'isCheckArrLegend': [0, 1, 2, 3, 4, 5, 6, 7] // 0..7
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

  applyPopState(state) {
    const oldState = { ...this.state }
    this.fillStateFromUrl(state)
    const newState = this.state

    this.emit('changeView', { 'oldState': oldState, 'newState': newState })
  }

  deleteFromState(stateArr) {
    stateArr.forEach((item) => {
      if (this.state.hasOwnProperty(item))
        delete this.state[item]
    })
  }

  saveStateValue(stateObj) {
    for (const stateKey in stateObj) {
      let value = stateObj[stateKey]
      this.state[stateKey] = value
    }

    this.renewStateUrl()
  }

  setEnableFillUrl(value) {
    this.enableFillUrl = value
  }

  renewStateUrl() {

    if (!this.enableFillUrl) return

    let state = '?'
    let delim = ''
    for (const stateKey in this.state) {
      let value = this.state[stateKey]

      if (value === undefined)
        continue

      switch (stateKey) {
        case 'pulse':
        case 'center':
          value = (new toLonLat(value)).map(c => c.toFixed(4))
          break
        case 'isCheckArrLegend':
          value = this.state[stateKey].join(',')
          break
        default:
          break;
      }

      CookieHelper.setCookie(stateKey, value)

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

  fillStateText(stateKey, maybeValue) {
    if (maybeValue) {
      this.state[stateKey] = maybeValue
    }
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
      case 'yearOrCentury':
        this.fillStateInt(stateKey, maybeValue)
        break

      case 'item':
        this.fillStateText(stateKey, maybeValue)
        break

      case 'dateMode':
        this.fillStateMode(stateKey, maybeValue, ['year', 'century'])
        break

      case 'center':
      case 'pulse':
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
        this.fillStateMode(stateKey, maybeValue, ['info', 'map', 'click'])
        break
    }
  }

  fillStateFromUrl(url) {

    if (!url) {
      const location = window.location
      if (location.search == '') return
      url = location.search.slice(1)
    }

    url = url.slice(1)
    if (!url) return

    const searchParams = new URLSearchParams(url);

    if (!searchParams) return

    for (const stateKey in this.state) {
      if (!searchParams.has(stateKey)) continue

      const maybeValue = this.getQueryVariable(stateKey)
      this.fillStateMaybe(stateKey, maybeValue)
    }

    console.log(`state from url: ${JSON.stringify(this.state)}`)
  }

  fillStateFromCookies() {
    for (const stateKey in this.state) {
      const maybeValue = CookieHelper.getCookie(stateKey)
      this.fillStateMaybe(stateKey, maybeValue)
    }
  }

  static create() {
    console.log('Создание компонента StateControl')
    return new StateControl()
  }
}

window.onpopstate = (event) => {
  const stateControl = window.stateControl
  if (event.state) {
    console.log(JSON.stringify(event.state))
    stateControl.applyPopState(event.state)
  }
}