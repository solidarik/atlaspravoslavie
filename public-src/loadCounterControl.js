import EventEmitter from './eventEmitter'
import ClassHelper from '../helper/classHelper'

export class LoadCounterControl extends EventEmitter {
    constructor() {
        super() //first must
        this.isVisible = false
        this.loadStatusDiv = document.getElementById('load-status-div')
    }

    static create() {
        return new LoadCounterControl()
    }

    showStatus(statusText, loadedTime) {
        if (statusText && statusText.length > 0) {
            this.loadStatusDiv.innerHTML = statusText
            this.loadStatusDiv.title = loadedTime
            this.switchOn()
        }
    }

    switchOn() {
        if (this.isVisible) return
        this.isVisible = true
        ClassHelper.removeClass(this.loadStatusDiv, 'load-status-div-hide')
        ClassHelper.addClass(this.loadStatusDiv, 'load-status-div-show')
    }

    switchOff() {
        if (!this.isVisible) return
        this.isVisible = false
        ClassHelper.addClass(this.loadStatusDiv, 'load-status-div-hide')
        ClassHelper.removeClass(this.loadStatusDiv, 'load-status-div-show')
    }
}
