import Log from '../helper/logHelper'
const log = Log.create()
import XLSX from 'xlsx'
import chalk from 'chalk'
import geoHelper from '../helper/geoHelper'
import dateHelper from '../helper/dateHelper'
import strHelper from '../helper/strHelper'

export default class XlsParser {

    getValue(sheet, row, col) {
        const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
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

        return geoHelper.fromLonLat(arr.reverse().map(item => Number(item)))
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
        return json
    }

    async loadData(input) {
        log.info(`Начинаем обрабатывать файл ${chalk.cyan(input.source)}`)
        const mediator = input.mediator
        const workbook = XLSX.readFile(input.source)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const range = XLSX.utils.decode_range(sheet['!ref'])
        const maxCount = range.e.r + 1
        log.info(`Количество входящих строк: ${maxCount}`)
        let successCount = 0
        for (let row = 1; row <= maxCount; row++) {
            try {
                let json = this.getJsonFromRow(sheet, row)

                json.pageUrl = strHelper.generatePageUrl([json.name, json.place])
                const isExistObject = await mediator.isExistObject(json)
                if (isExistObject) {
                    json.pageUrl = strHelper.replaceEnd(json.pageUrl, '_' + Number(row))
                }

                const res = await mediator.addObjectToBase(json)
                if (res) {
                    successCount += 1
                    // if (successCount > 30) {
                    //     break
                    // }
                } else {
                    throw new Error(`Ошибка обработки ${res}`)
                }

            }
            catch (e) {
                log.error(`Не удалось обработать строку ${row}: ${e}`)
            }
        }

        if (successCount == maxCount) {
            log.info(chalk.green('Успешная загрузка'))
        } else {
            log.info(chalk.cyan(`Частичная загрузка ${successCount} из ${maxCount}`))
        }

        return true
    }
}