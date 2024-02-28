import chalk from 'chalk'
import GeoHelper from '../helper/geoHelper.js'
import inetHelper from '../helper/inetHelper.js'
import DateHelper from '../helper/dateHelper.js'
import ServiceModel from '../models/serviceModel.js'
import StrHelper from '../helper/strHelper.js'
import XlsHelper from '../helper/xlsHelper.js'
import authentication from '../loadDatabase/googleAuthentication.js'

import { google } from 'googleapis'

export default class XlsGoogleParser {
    constructor(withSaveLoadStatus) {
        this.withSaveLoadStatus = withSaveLoadStatus
    }

    async getCoords(inputPlace, inputCoords) {
        if (!inputPlace && !inputCoords) {
            return false
        }

        let coords

        if (inputCoords) {
            coords = GeoHelper.getCoordsFromHumanCoords(inputCoords)
            if (!coords) {
                return false
            }
            if (coords.length == 2) {
                inetHelper.addCoord(inputPlace, {
                    lat: coords[1],
                    lon: coords[0],
                })
                return GeoHelper.fromLonLat(coords)
            }
        }

        coords = inetHelper.getLonLatSavedCoords(inputPlace)
        if (coords) {
            return GeoHelper.coordsToBaseFormat(coords)
        }

        // start search coordinates in wiki
        // const res = await inetHelper.searchCoordsByName(inputPlace)
        // if (res) {
        //     coords = res
        //     return GeoHelper.fromLonLat(coords)
        // }
        // end search

        return false
    }

    getPageUrl(json) {
        const pageUrlsLocal = this.pageUrls.map((colName) => json[colName])
        return StrHelper.generatePageUrl(pageUrlsLocal)
    }

    async getDebugInfo(lineNumber, fieldName) {
        this.log.info(
            chalk.yellow(
                `Получение отладочной информации по строке ${lineNumber}`
            )
        )
        const sheets = google.sheets({ version: 'v4' })
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            key: process.env.GOOGLE_API_KEY,
            range: this.range,
        })
        if (!sheetData)
            return this.log.error('The Google API returned an error')

        const rows = sheetData.data.values
        if (!rows.length) return this.log.error('No data found')

        // this.log.info(`Сount rows ${rows.length} columns ${rows[0].length}`)
        const startRow = this.startRow ? this.startRow : 1
        const maxRow = this.maxRow ? this.maxRow : rows.length
        if (lineNumber < startRow || lineNumber > maxRow) {
            this.log.error(
                `Номер строки не входит в диапазон данных: [${startRow}, ${maxRow}]`
            )
            return ''
        }

        const headerColumns = this.fillHeaderColumns(rows[0])
        const json = await this.getJsonFromRow(
            headerColumns,
            rows[lineNumber - 1]
        )

        if (!json[fieldName]) {
            this.log.error(
                `В результирующих данных нет искомого столбца: ${fieldName}`
            )
            return ''
        }

        return json[fieldName]
    }

    async processData(dbHelper) {
        let res = undefined
        const modelName = this.model.collection.collectionName

        await dbHelper.clearModel(this.model)

        // обновляем время последней проверки
        const checkedTime = DateHelper.dateTimeToStr(new Date())
        res = await ServiceModel.updateOne(
            { name: 'checkedTime' },
            { value: checkedTime }
        )

        this.log.info(chalk.yellow(`Загрузка ${this.name}`))
        // this.log.info(chalk.gray('Получение данных из Google...'))

        const sheets = google.sheets({ version: 'v4' })
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            key: process.env.GOOGLE_API_KEY,
            range: this.range,
        })
        if (!sheetData)
            return this.log.error('The Google API returned an error')

        const rows = sheetData.data.values
        if (!rows.length) return this.log.error('No data found')

        // this.log.info(`Сount rows ${rows.length} columns ${rows[0].length}`)

        const headerColumns = this.fillHeaderColumns(rows[0])
        let insertObjects = []
        let successObjectCount = 0
        let skipObjectCount = 0
        let pageUrlsGlobal = []

        let loadStatuses = []
        let errorTypes = {}

        //start from row = 1, because we skip a header row
        // for (let row = 1; row < rows.length; row++) {
        const maxRow = this.maxRow ? this.maxRow : rows.length
        const startRow = this.startRow ? this.startRow : 1
        for (let row = startRow; row < maxRow; row++) {
            const json = await this.getJsonFromRow(headerColumns, rows[row])

            json.lineSource = row + 1
            const isSkip = json.isChecked == '0'

            const isError = json.errorArr.length > 0
            const errorStatus = json.errorArr
                .join('\r\n')
                .replace('Error: ', '')

            const isWarning = json.warningArr.length > 0
            const warningStatus =
                '\r\nЗамечания: ' +
                json.warningArr.join('\r\n').replace('Error: ', '')

            let loadStatus = ''

            if (isSkip) {
                skipObjectCount += 1
                loadStatus = `Пропущено согласно флагу`
            } else if (isError) {
                // this.log.error(`Ошибка обработки json: ${JSON.stringify(json)}`)
                loadStatus = errorStatus
            } else {
                successObjectCount += 1
                loadStatus = isWarning ? 'Успешно, с замечаниями' : 'Успешно'
            }

            if (isWarning) {
                loadStatus += warningStatus
            }

            loadStatus = loadStatus.replaceAll('undefined', 'Пусто')

            json.isOnMap = !isError && !isSkip
            json.pageUrl = this.getPageUrl(json)
            if (!isSkip && json.pageUrl) {
                if (pageUrlsGlobal.includes(json.pageUrl)) {
                    json.pageUrl = StrHelper.replaceEnd(
                        json.pageUrl,
                        '_' + Number(row)
                    )
                }
                pageUrlsGlobal.push(json.pageUrl)
                insertObjects.push(json)
            }

            // this.log.info(`${row + 1}: ${status}`)
            json.loadStatus = loadStatus
            loadStatuses.push(loadStatus)
        }

        const statusColumnName = XlsHelper.getColumnNameByNumber(
            headerColumns.loadStatus + 1
        )
        const statusRowStart = 2
        const statusRowEnd = statusRowStart + loadStatuses.length - 1
        const statusRange = `${statusColumnName}${statusRowStart}:${statusColumnName}${statusRowEnd}`

        if (this.withSaveLoadStatus) {
            let authClient = undefined
            try {
                authClient = await authentication.authenticate()
            } catch (err) {
                throw `auth client error ${err}`
            }

            if (loadStatuses.length == 0) {
                throw `Ошибка получения статусов`
            }

            const resource = {
                range: statusRange,
                majorDimension: 'COLUMNS',
                values: [loadStatuses],
            }

            try {
                const sheetUpdateStatus =
                    await sheets.spreadsheets.values.update({
                        auth: authClient,
                        spreadsheetId: this.spreadsheetId,
                        range: statusRange,
                        valueInputOption: 'USER_ENTERED',
                        resource: resource,
                    })

                // if (JSON.stringify(sheetUpdateStatus) != '{}') {
                //     this.log.warn(`Ответ от Google Sheet: ${JSON.stringify(sheetUpdateStatus)}`)
                // }
            } catch (err) {
                this.log.error(`Проблема обновления Google: ${err}`)
            }
        }

        const totalLinesCount = rows.length - 1
        const savedCount = insertObjects.length
        const statusText = [
            successObjectCount,
            savedCount,
            skipObjectCount,
            totalLinesCount,
        ].join(' / ')
        this.log.info(
            chalk.cyanBright(
                `Кол-во на карте/загруженных/пропущенных/всего: ${statusText}`
            )
        )

        /*
        for (let idxObj = 0; idxObj < insertObjects.length; idxObj++) {
            const insertObject = insertObjects[idxObj]
            // console.log(`${insertObject.birth.year} ${insertObject.name} ${insertObject.surname}`)
            await this.model.collection.insertOne(insertObject)
        }
        */

        res = await this.model.insertMany(insertObjects)

        if (!res) {
            this.log.error(
                chalk.red(`Ошибка при сохранении данных ${JSON.stringify(res)}`)
            )
        }

        let serviceObjects = [
            { name: 'successObjectCount', value: successObjectCount },
            { name: 'skipObjectCount', value: skipObjectCount },
            { name: 'savedCount', value: savedCount },
            { name: 'totalCount', value: totalLinesCount },
            { name: 'statusText', value: statusText },
            { name: 'checkedTime', value: checkedTime },
        ]

        serviceObjects = serviceObjects.map((obj) => {
            return { ...obj, model: modelName }
        })

        res = await ServiceModel.deleteMany({ model: modelName })
        res = await ServiceModel.insertMany(serviceObjects)

        if (!res) {
            this.log.error(
                chalk.red(
                    `Ошибка при сохранении статуса ${JSON.stringify(res)}`
                )
            )
        }

        return true
    }
}
