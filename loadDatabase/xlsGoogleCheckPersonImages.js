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

export default class XlsGoogleCheckPersonImages {
    constructor(log, mainFolder) {
        this.log = log
        this.name = 'Святые'
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSON
        this.image_header_cols = ['Ссылка на фото']
        this.status_header_cols = ['Статус обработки фото']
        this.image_prefixes = ['main_photo']
        this.range = 'A1:AN'
        this.model = PersonModel
        // this.startRow = 25
        // this.maxRow = 30
        this.mainFolder = mainFolder
    }

    async processData() {
        this.log.info(
            chalk.yellow(`Загрузка изображений для класса ${this.name}`)
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

        const maxRow = this.maxRow ? this.maxRow : rows.length
        const startRow = this.startRow ? this.startRow : 1
        const startXlsRow = startRow + 1

        const headerRow = rows[0]
        const imageColumns = this.image_header_cols.map((headerName) =>
            XlsHelper.getColumnNameByHeader(headerRow, headerName)
        )
        const statusColumns = this.status_header_cols.map((headerName) =>
            XlsHelper.getColumnNameByHeader(headerRow, headerName)
        )

        let loadStatuses = []
        let errorCount = 0

        for (let col in imageColumns) {
            for (let row = startRow; row < maxRow; row++) {
                const colNumber =
                    XlsHelper.getColumnNumberByName(imageColumns[col]) - 1
                const imgUrl = rows[row][colNumber]
                let lineStatus = []
                let imgUrls = []
                if (imgUrl) {
                    imgUrls = imgUrl
                        .split('http')
                        .map((item) => {
                            return `http${item}`
                        })
                        .slice(1)
                        .map((item) =>
                            item[item.length - 1] == ','
                                ? item.slice(0, -1)
                                : item
                        )
                    const saveUrlPromises = imgUrls.map((oneImage) =>
                        ImageHelper.loadImageToFileByUrl(
                            oneImage,
                            this.mainFolder,
                            false
                        )
                    )
                    const results = await Promise.allSettled(saveUrlPromises)
                    results.forEach((res, num) => {
                        if (res.status == 'rejected') {
                            lineStatus.push(`Ошибка загрузки ${imgUrls[num]}`)
                        }
                    })
                }

                if (lineStatus.length) {
                    errorCount++
                }
                console.log(row)
                loadStatuses.push(lineStatus.join('; '))
            }

            console.log(`Количество ошибок: ${errorCount}`)

            let authClient = undefined
            try {
                authClient = await authentication.authenticate()
            } catch (err) {
                throw `auth client error ${err}`
            }

            const statusColumnName = statusColumns[col]
            const statusRowStart = startXlsRow
            const statusRowEnd = startXlsRow + loadStatuses.length - 1
            const statusRange = `${statusColumnName}${statusRowStart}:${statusColumnName}${statusRowEnd}`

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

        this.log.info(chalk.cyanBright(`Обновлено`))

        return true
    }
}
