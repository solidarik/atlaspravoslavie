import inetHelper from '../helper/inetHelper.js'
import JsHelper from '../helper/jsHelper.js'
import ImageHelper from '../helper/imageHelper.js'
import StrHelper from '../helper/strHelper.js'
import PersonModel from '../models/personsModel.js'
import XlsGoogleParser from './xlsGoogleParser.js'
import XlsHelper from '../helper/xlsHelper.js'
import chalk from 'chalk'
import { google } from 'googleapis'
import authentication from './googleAuthentication.js'

export default class XlsGoogleLoadPersonImages {

    constructor(log) {
        this.log = log
        this.name = 'Святые'
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSON
        this.image_header_cols = ['Ссылка на фото']
        this.status_header_cols = ['Статус обработки фото']
        this.range = 'A1:AN'
        this.model = PersonModel
        this.startRow = 152
        this.maxRow = 153
    }

    async updateUrls(colName, startRow, fixUrls) {
        const startXlsRow = startRow + 1
        const endXlsRow = startXlsRow + fixUrls.length - 1
        const updateRange = `${colName}${startXlsRow}:${colName}${endXlsRow}`

        let authClient = undefined
        try {
            authClient = await authentication.authenticate()
        } catch(err) {
            throw `auth client error ${err}`
        }

        const resource = {
            range: updateRange,
            majorDimension: "COLUMNS",
            values: [fixUrls]
        }

        const sheets = google.sheets({ version: 'v4' })
        try {
            const sheetUpdateStatus = await sheets.spreadsheets.values.update({
                auth: authClient,
                spreadsheetId: this.spreadsheetId,
                range: updateRange,
                valueInputOption: "USER_ENTERED",
                resource: resource
            })

            // if (JSON.stringify(sheetUpdateStatus) != '{}') {
            //     this.log.warn(`Ответ от Google Sheet: ${JSON.stringify(sheetUpdateStatus)}`)
            // }
        } catch(err) {
            this.log.error(`Проблема обновления Google: ${err}`)
        }
    }

    async changeUrl(url) {
        if (!url || !url.includes('https://azbyka.ru')) {
            return url
        }
        if (await inetHelper.isSuccessStatusCode(url)) {
            return url
        }
        const newUrl = url.replace('https://azbyka.ru/days/assets/img/saints',
            'https://azbyka.ru/days/storage/images/icons-of-saints')
        if (inetHelper.isSuccessStatusCode(newUrl)) {
            return newUrl
        }
        return url
    }

    async processData() {

        this.log.info(chalk.yellow(`Исправление ссылок модели ${this.name}`))

        const sheets = google.sheets({ version: 'v4' })
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            key: process.env.GOOGLE_API_KEY,
            range: this.range
        })
        if (!sheetData) return this.log.error('The Google API returned an error')

        const rows = sheetData.data.values
        if (!rows.length) return this.log.error('No data found')

        const maxRow = this.maxRow ? this.maxRow : rows.length
        const startRow = this.startRow ? this.startRow : 1

        const headerRow = rows[0]
        const image_cols = this.image_header_cols.map(
            headerName => XlsHelper.getColumnNameByHeader(headerRow, headerName))

        console.log(image_cols)

        // await Promise.all(this.url_cols.map(async (colName) => {
        //     let fixUrls = []
        //     let isChanged = false
        //     const colNumber = XlsHelper.getColumnNumberByName(colName)
        //     for (let row = startRow; row < maxRow; row++) {
        //         const url = rows[row][colNumber]
        //         const changedUrl = await this.changeUrl(url)
        //         isChanged = isChanged || (url != changedUrl)
        //         fixUrls.push(changedUrl)
        //     }
        //     if (isChanged) {
        //         await this.updateUrls(colName, startRow, fixUrls)
        //     }
        // }))


        this.log.info(chalk.cyanBright(`Обновлено`))

        return true
    }

}