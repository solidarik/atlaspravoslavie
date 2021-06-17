const log = require('../helper/logHelper')
const mongoose = require('mongoose')
const XLSX = require('xlsx')
const chalk = require('chalk')
const geoHelper = require('../helper/geoHelper')
const dateHelper = require('../helper/dateHelper')
const strHelper = require('../helper/strHelper')

class XlsParser {

    getValue(sheet, row, col) {
        const cell = sheet[XLSX.utils.encode_cell({r: row, c: col})];
        return cell ? cell.v.toString() : ''
    }

    getCoords(strValue) {
        if (strValue == '') {
            throw new Error(`Не заполнена координата`)
        }

        const arr = strValue.split('_')
        if (arr.length == 0 || arr.length > 2) {
            throw new Error(`Неизвестный формат координат ${strValue}`)
        }

        return geoHelper.fromLonLat([arr[1], arr[0]])
    }

    getDateValue(input) {
        let res = {}
        if (input == '') {
            throw new Error('Пропуск пустой даты основания')
        }
        if (input.length == 4) {
            res.year = Number(input)
            res.isOnlyYear = true
            res.century = dateHelper.yearToCentury(res.year)
            return res
        }
        throw new Error(`Пока не умеем обрабатывать дату ${input}`)
    }

    getJsonFromRow(sheet, row) {
        //cols from 0 to 8
        let json = {}
        json.name = this.getValue(sheet, row, 0)
        json.point = this.getCoords(this.getValue(sheet, row, 1))
        json.imgUrl = this.getValue(sheet, row, 2)
        json.place = this.getValue(sheet, row, 3)
        json.start = this.getDateValue(this.getValue(sheet, row, 4))
        json.longBrief = this.getValue(sheet, row, 5)
        json.srcUrl = this.getValue(sheet, row, 7)
        json.pageUrl = strHelper.generatePageUrl([json.name, json.place])
        return json
    }

    loadData(input) {
        return new Promise((resolve) => {
            log.info(`Начинаем обрабатывать файл ${chalk.cyan(input.source)}`)
            const mediator = input.mediator
            const workbook = XLSX.readFile(input.source)
            const sheet = workbook.Sheets[workbook.SheetNames[0]]
            const range = XLSX.utils.decode_range(sheet['!ref'])
            let promises = []
            for (let row = 1; row <= range.e.r + 1; row++) {
                try {
                    const json = this.getJsonFromRow(sheet, row)
                    promises.push(mediator.addObjectToBase(json))
                }
                catch (e) {
                    log.error(`Не удалось обработать строку ${row}: ${e}`)
                }
            }

            log.info(`Количество входящих элементов, промисов: ${promises.length}`)

            const countObjects = promises.length
            Promise.all(promises).then(
                (res) => {
                    const status = `Количество успешно обработанных элементов: ${countObjects} из ${res.length}`
                    log.info(status)
                    if (countObjects == res.length) {
                        log.info(chalk.green('успешная загрузка'))
                        resolve(status)
                    }},
                (err) => {
                    let msg = `Непредвиденная ошибка в процессе обработки ${err}`
                    log.error(msg)
                    resolve(msg)
                }
            )
            resolve(true)
        })
    }
}

module.exports = new XlsParser()