// import FileHelper from '../helper/fileHelper.js'
import chalk from 'chalk'
import GeoHelper from '../helper/geoHelper.js'
import InetHelper from '../helper/inetHelper.js'
import DateHelper from '../helper/dateHelper.js'
import ServiceModel from '../models/serviceModel.js'
import StrHelper from '../helper/strHelper.js'
import XlsHelper from '../helper/xlsHelper.js'
import readline from 'readline'
import fs from 'fs'
import authentication from '../loadDatabase/googleAuthentication.js'

import { google } from 'googleapis'

export default class XlsGoogleParser {

    async getCoords(inputPlace, inputCoords) {

        if (!inputPlace && !inputCoords) {
            return false
        }

        let coords = null

        if (inputCoords) {
            coords = GeoHelper.getCoordsFromHumanCoords(inputCoords)
            return GeoHelper.fromLonLat(coords)
        }

        coords = InetHelper.getLonLatSavedCoords(inputPlace)
        if (coords) {
            return GeoHelper.fromLonLat(coords)
        }

        // start search coordinates in wiki
        // const res = await InetHelper.getCoordsForCityOrCountry(inputPlace)
        // if (res && res.length > 0) {
        //     coords = res[0]
        //     return GeoHelper.fromLonLat(coords)
        // }
        // end search

        return false
    }


    getPageUrl(json) {
        const pageUrlsLocal = this.pageUrls.map((colName) => json[colName])
        return StrHelper.generatePageUrl(pageUrlsLocal)
    }

    async processData(dbHelper) {

        const modelName = this.model.collection.collectionName

        await dbHelper.clearModel(this.model)

        this.log.info(`Start of processing Google sheet for ${modelName}`)

        // обновляем время последней проверки
        const checkedTime = DateHelper.dateTimeToStr(new Date())
        let res = await ServiceModel.updateOne({ name: 'checkedTime' }, { value: checkedTime })

        const sheets = google.sheets({ version: 'v4' })

        this.log.info('Before getting Google data...')

        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            key: process.env.GOOGLE_API_KEY,
            range: this.range
        })

        if (!sheetData) return this.log.error('The Google API returned an error')

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
        for (let row = 1; row < maxRow; row++) {
            const json = await this.getJsonFromRow(headerColumns, rows[row])

            json.lineSource = row + 1
            json.isShowOnMap = (json.isChecked != 0) && (!json.isError)
            const isError = json.errorArr.length > 0

            let loadStatus = ''

            if (json.isChecked == '0') {
                skipObjectCount += 1
                loadStatus = `Пропущено согласно флагу`
            }
            else
            if (isError) {
                // this.log.error(`Ошибка обработки json: ${JSON.stringify(json)}`)
                loadStatus = json.errorArr.join('; ').replace('Error: ', '')
            } else {
                successObjectCount += 1
                loadStatus = 'Успешно'
                insertObjects.push(json)
            }

            // this.log.info(`${row + 1}: ${status}`)
            json.loadStatus = loadStatus
            json.pageUrl = this.getPageUrl(json)
            if (pageUrlsGlobal.includes(json.pageUrl)) {
                json.pageUrl = StrHelper.replaceEnd(json.pageUrl, '_' + Number(row))
            }
            pageUrlsGlobal.push(json.pageUrl)
            loadStatuses.push(loadStatus)
        }

        const statusColumnName = XlsHelper.getColumnNameByNumber(headerColumns.loadStatus + 1)
        const statusRowStart = 2
        const statusRowEnd = loadStatuses.length + 1
        const statusRange = `${statusColumnName}${statusRowStart}:${statusColumnName}${statusRowEnd}`

        const authClient = await authentication.authenticate()

        if (loadStatuses.length == 0) {
            this.log.error(`Ошибка получения статусов`)
        } else {

            const resource = {
                range: statusRange,
                majorDimension: "COLUMNS",
                values: [loadStatuses]
            }

            const sheetUpdateStatus = sheets.spreadsheets.values.update({
                auth: authClient,
                spreadsheetId: this.spreadsheetId,
                range: statusRange,
                valueInputOption: "USER_ENTERED",
                resource: resource
            })

            this.log.warn(`Статус обновления источника: ${JSON.stringify(sheetUpdateStatus)}`)
        }

        const totalLinesCount = rows.length - 1
        const savedCount = insertObjects.length
        const statusText = [successObjectCount, skipObjectCount, totalLinesCount].join(' / ')
        this.log.info(`Кол-во загруженных/пропущенных/всего: ${statusText}`)

        res = await this.model.insertMany(insertObjects)

        if (res) {
            this.log.info(chalk.green(`Успешная загрузка: ${res.length}`))
        } else {
            this.log.error(`Ошибка при сохранении данных ${JSON.stringify(res)}`)
        }

        let serviceObjects = [
            { name: 'successObjectCount', value: successObjectCount },
            { name: 'skipObjectCount', value: skipObjectCount },
            { name: 'savedCount', value: savedCount },
            { name: 'totalCount', value: totalLinesCount },
            { name: 'statusText', value: statusText },
            { name: 'checkedTime', value: checkedTime }
        ]

        serviceObjects = serviceObjects.map(obj => { return { ...obj, 'model': modelName } })

        res = await ServiceModel.deleteMany({'model': modelName})
        res = await ServiceModel.insertMany(serviceObjects)

        if (res) {
            this.log.info(chalk.green(`Успешное сохранение статуса`))
        } else {
            this.log.error(`Ошибка при сохранении статуса ${JSON.stringify(res)}`)
        }

        return true
    }

}
