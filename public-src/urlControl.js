import EventEmitter from './eventEmitter'
import ClassHelper from '../helper/classHelper'

export class UrlControl extends EventEmitter {
  constructor() {
    super() //first must

    window.urlControl = this

    this.readViewFromPermalink()
  }

  readViewFromPermalink() {

    const location = window.location

    if (location.search !== '') {
        const searchParams = new URLSearchParams(location.search.slice(1));
        console.log('current location search: ' + searchParams)

        if (searchParams.has('test')) {
          console.log('test is exist')
        }
    }
    if (location.hash !== '') {
      console.log('current location hash: ' + location.hash)
    //   var hash = location.hash.replace('#map=', '')
    //   var parts = hash.split('/')
    //   if (parts.length === 3) {
    //     this.zoom = parseInt(parts[0], 10)
    //     this.center = [parseFloat(parts[1]), parseFloat(parts[2])]
    //   }
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

  static create() {
    console.log('Создание компонента UrlControl')
    return new UrlControl()
  }
}