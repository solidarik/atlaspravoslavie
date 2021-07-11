const log = require('../helper/logHelper')
const chalk = require('chalk')
const { google } = require('googleapis')
const InetHelper = require('../helper/inetHelper')
const GeoHelper = require('../helper/geoHelper')
const DateHelper = require('../helper/dateHelper')
const StrHelper = require('../helper/strHelper')
const TemplesModel = require('../models/templesModel')
const ServiceModel = require('../models/serviceModel')

const readline = require('readline')
const fs = require('fs')

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']


class XlsGoogleParser {

    constructor(log) {
        this.log = log
    }

    getCoords(placeForCoords, inputValue) {
        if (!placeForCoords && !inputValue) {
            throw new Error(`getCoords empty inputs: ${placeForCoords}, ${inputValue}`)
        }

        const coords = InetHelper.getSavedCoords(placeForCoords)
        if (coords) {
            const coordsStr = InetHelper.getLonLatSavedCoords(placeForCoords).reverse()
            if (!inputValue.includes('_')) {
                this.log.warn(`Найдена координата для ${placeForCoords}: ${coordsStr.join('_')}`)
            }
            return coords
        }

        if (!inputValue) {
            throw new Error(`Не заполнена координата placeForCoords ${placeForCoords}`)
        }

        const arr = inputValue.split('_')
        if (arr.length == 0 || arr.length > 2) {
            throw new Error(`Неизвестный формат координат ${inputValue}`)
        }

        return GeoHelper.fromLonLat(arr.reverse().map(item => Number(item)))
    }

    fillHeaderColumns(headerRow) {
        let headerColumns = {}
        const colCorresponds = {
            'author': 'автор',
            'isChecked': 'проверено',
            'name': 'название',
            'point': 'коорд',
            'city': 'город',
            'place': 'место',
            'start': 'дата основа',
            'longBrief': 'описание',
            'abbots': 'настоятели',
            'eparhy': 'митропология',
            'templesUrl': 'ссылка на храм',
            'srcUrl': 'ссылка на источник',
            'imgUrl': 'изображение 1',
            'imgUrl_1': 'изображение 2',
            'imgUrl_2': 'изображение 3',
            'imgUrl_3': 'изображение 4',
            'imgUrl_4': 'изображение 5',
            'imgUrl_5': 'изображение 6',
        }
        for (let iCol = 0; iCol < headerRow.length; iCol++) {
            const xlsColName = headerRow[iCol].toLowerCase()
            for (let colModel in colCorresponds) {
                const colSearch = colCorresponds[colModel]
                if (xlsColName.includes(colSearch)) {
                    headerColumns[colModel] = iCol
                }
            }
        }
        return headerColumns
    }

    getJsonFromRow(headerColumns, row) {
        let json = {}
        json.author = row[headerColumns.author]
        json.isChecked = row[headerColumns.isChecked]
        json.name = row[headerColumns.name].trim()
        json.city = row[headerColumns.city].trim()
        json.place = row[headerColumns.place].trim()
        json.isError = undefined

        try {

            const placeForCoords = `${json.name} ${json.place}`
            json.point = this.getCoords(placeForCoords, row[headerColumns.point])

            const dateInput = row[headerColumns.start]
            if (!dateInput) {
                throw new Error('Пропуск пустой даты основания')
            }

            json.start = DateHelper.getDateFromInput(dateInput)
            json.longBrief = row[headerColumns.longBrief]
            json.abbots = row[headerColumns.abbots]
            json.eparhy = row[headerColumns.eparhy]
            json.templesUrl = row[headerColumns.templesUrl]
            json.srcUrl = row[headerColumns.srcUrl]

            const imgUrls = [
                row[headerColumns.imgUrl],
                row[headerColumns.imgUrl_1],
                row[headerColumns.imgUrl_2],
                row[headerColumns.imgUrl_3],
                row[headerColumns.imgUrl_4],
                row[headerColumns.imgUrl_5]
            ]
            json.imgUrls = imgUrls.filter(item => (item && item != ''))

        } catch (e) {
            json.isError = e
        }

        return json
    }

    async getLastUpdateFromSheet() {
        const sheets = google.sheets({ version: 'v4' });
        const lastUpdateSheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            key: process.env.GOOGLE_API_KEY,
            range: 'Z1:Z1',
        })

        if (!lastUpdateSheetData) return false

        return lastUpdateSheetData.data.values[0][0]
    }

    async getLastUpdateFromGoogleApi() {
        const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_DRIVE_ID, process.env.GOOGLE_DRIVE_SECRET, 'http://localhost:3000')

        let token = undefined

        try {
            token = fs.readFileSync(process.env.GOOGLE_DRIVE_TOKEN_FILE)
            token = JSON.parse(token)
        } catch (err) {
            // console.log(err)
            // return
            const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES })
            console.log('Authorize this app by visiting this url:', authUrl);
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
            const codePromise = new Promise(res => {
                rl.question('Enter the code from that page here: ', (code) => {
                    console.log(code)
                    res(code)
                })
            })
            const code = await codePromise
            token = await oAuth2Client.getToken(code)
            fs.writeFileSync(process.env.GOOGLE_DRIVE_TOKEN_FILE, JSON.stringify(token))
            rl.close()


        }
        if (!token) return

        oAuth2Client.setCredentials(token)

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
        const fileList = await drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name, modifiedTime)',
        })

        console.log(JSON.stringify(fileList))

        const files = fileList.data.files;
        for (let ifile = 0; ifile < files.length; ifile++) {
            const file = files[ifile]
            if (file.id === process.env.GOOGLE_SHEET_ID) {
                return DateHelper.dateTimeToStr(new Date(file.modifiedTime))
            }
        }

        return false
    }

    async loadData(dbHelper) {
        this.log.info(`Start of processing Google sheet`)

        // обновляем время последней проверки
        const checkedTime = DateHelper.dateTimeToStr(new Date())
        let res = await ServiceModel.updateOne({ name: 'checkedTime' }, { value: checkedTime })

        // проверяем изменились ли данные
        const last_update = await this.getLastUpdateFromGoogleApi()
        console.log(last_update)
        if (!last_update) {
            return this.log.error('Don\'t found last update time from Google API')
        }
        res = await ServiceModel.find({ name: 'lastUpdateSheet' })
        console.log(res)
        if (res && res.length > 0 && res[0].value === last_update) {
            this.log.info(`Don\'t update info from last loading: ${last_update}`)
            return
        }

        //  обрабатываем данные
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            key: process.env.GOOGLE_API_KEY,
            range: 'A1:R'
        })

        if (!sheetData) return this.log.error('The Google API returned an error')

        const rows = sheetData.data.values
        if (!rows.length) return this.log.error('No data found')

        this.log.info(`Сount rows ${rows.length} columns ${rows[0].length}`)
        let pageUrls = []

        const headerColumns = this.fillHeaderColumns(rows[0])
        let insertObjects = []
        let checkedObjectCount = 0
        let skipObjectCount = 0

        //start from row = 1, because skip header row
        for (let row = 1; row < rows.length; row++) {
            const json = this.getJsonFromRow(headerColumns, rows[row])

            if (json.isChecked === '0' || json.isError) {
                if (json.isError)
                    this.log.error(`Пропуск строки ${row} ${json.name}: ${json.isError}`)
                else
                    this.log.info(`Пропуск строки ${json.name}`)
                skipObjectCount += 1
                continue
            }

            json.pageUrl = StrHelper.generatePageUrl([json.name, json.place])
            if (pageUrls.includes(json.pageUrl)) {
                json.pageUrl = StrHelper.replaceEnd(json.pageUrl, '_' + Number(row))
            }
            pageUrls.push(json.pageUrl)
            insertObjects.push(json)

            if (json.isChecked.trim() != '') {
                checkedObjectCount += 1
            }
        }

        res = await TemplesModel.insertMany(insertObjects)

        if (res) {
            this.log.info(chalk.green(`Успешная загрузка: ${res.length}`))
        } else {
            this.log.error(`Ошибка при сохранении данных ${JSON.stringify(res)}`)
        }

        const totalLinesCount = rows.length - 1
        const savedCount = insertObjects.length
        const statusText = [checkedObjectCount, skipObjectCount, totalLinesCount].join(' / ')

        res = await dbHelper.clearDb('service')

        const serviceObjects = [
            { name: 'checkedObjectCount', kind: 'detailStatus', value: checkedObjectCount },
            { name: 'skipObjectCount', kind: 'detailStatus', value: skipObjectCount },
            { name: 'savedCount', kind: 'detailStatus', value: savedCount },
            { name: 'totalCount', kind: 'detailStatus', value: totalLinesCount },
            { name: 'statusText', kind: 'status', value: statusText },
            { name: 'lastUpdateSheet', kind: 'status', value: last_update },
            { name: 'checkedTime', kind: 'status', value: checkedTime }
        ]

        res = await ServiceModel.insertMany(serviceObjects)
        if (res) {
            this.log.info(chalk.green(`Успешное сохранение статуса`))
        } else {
            this.log.error(`Ошибка при сохранении статуса ${JSON.stringify(res)}`)
        }

        return true
    }
}

module.exports = XlsGoogleParser