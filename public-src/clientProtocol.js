import io from 'socket.io-client'
import EventEmitter from './eventEmitter'
import CookieHelper from './cookieHelper'

export default class ClientProtocol extends EventEmitter {
  constructor() {
    super()
    let socket = io()

    this.lang = 'rus'
    this.dict = new Map() //key - hash (tobject), value {объект}

    socket.on('error', (message) => {
      console.error(message)
    })

    socket.on('logout', (data) => {
      socket.disconnect()
      window.location.reload()
    })

    this.socket = socket
  }

  //Получение данных за определенный год
  _getInfoByDate(year) {
    this.socket.emit('clGetCurrentYear', '', (msg) => {
      const server = JSON.parse(msg)
      const client = {
        'year': CookieHelper.getCookie('year'),
        'century': CookieHelper.getCookie('century'),
        'kind': CookieHelper.getCookie('kind')
      }

      this.emit(
        'setCurrentYear', {
        'year': server.year ? server.year : client.year ? client.year : 1945,
        'century': server.century ? server.century : client.century ? client.century : 20,
        'kind': server.kind ? server.kind : client.kind ? client.kind : 'year',
      }
      )
    })
  }

  _getStrDateFromEvent(inputDate) {
    let date = new Date(inputDate)
    return (
      ('0' + date.getDate()).slice(-2) +
      '.' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '.' +
      date.getFullYear()
    )
  }

  _getDictName(id) {
    if (!this.dict.has(id)) return
    let obj = this.dict.get(id)
    if (!obj) return
    return obj[this.lang]
  }

  getSocket() {
    return this.socket
  }

  setCurrentLanguage(lang) {
    this.lang = lang
  }

  getTemples() {
    this.socket.emit(
      'clGetTemples',
      JSON.stringify({}),
      (msg) => {
        this.emit('temples', JSON.parse(msg))
      }
    )
  }

  getPersons() {
    this.socket.emit(
      'clGetPersons',
      JSON.stringify({}),
      (msg) => {
        this.emit('persons', JSON.parse(msg))
      }
    )
  }

  getDataByYear(dateObject) {
    if (undefined === dateObject.year) {
      return
    }

    const year = dateObject.year
    const century = dateObject.century
    const kind = dateObject.kind

    CookieHelper.setCookie('year', year)
    CookieHelper.setCookie('century', century)
    CookieHelper.setCookie('kind', kind)

    let searchData = {}
    if (kind == 'year') {
      searchData = { isYearMode: true, value: year }
    } else {
      searchData = { isYearMode: false, value: century }
    }

    this.socket.emit(
      'clQueryDataByYear',
      JSON.stringify(searchData),
      (msg) => {
        this.emit('refreshInfo', JSON.parse(msg))
      }
    )
  }

  static create() {
    return new ClientProtocol()
  }
}
