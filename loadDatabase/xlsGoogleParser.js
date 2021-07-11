const log = require('../helper/logHelper')
const chalk = require('chalk')
const { google } = require('googleapis');
const InetHelper = require('../helper/inetHelper')
const GeoHelper = require('../helper/geoHelper')
const DateHelper = require('../helper/dateHelper')
const StrHelper = require('../helper/strHelper')
const TemplesModel = require('../models/templesModel');
const ServiceModel = require('../models/serviceModel');
const readline = require('readline');
const fs = require('fs')

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

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

    async loadData(input) {
        this.log.info(`Start of processing Google sheet`)


        const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_DRIVE_ID, process.env.GOOGLE_DRIVE_SECRET, 'http://localhost:3000')
        let token = undefined

        try {
            token = fs.readFileSync(process.env.GOOGLE_DRIVE_TOKEN_FILE)
            token = JSON.parse(token)
        } catch (err) {
            console.log(err)
            return
            const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES })
            console.log('Authorize this app by visiting this url:', authUrl);
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
            const promice = new Promise((res, rej) => {
                rl.question('Enter the code from that page here: ', (code) => {
                    try {
                        token = oAuth2Client.getToken(code)
                        fs.writeFileSync(process.env.GOOGLE_DRIVE_TOKEN_FILE, JSON.stringify(token))
                    } catch (err) {
                        console.error(`Error token authorization ${err}`)
                        rej(false)
                    }

                    res(code)
                })
            })
            token = await promice
            rl.close();

        }
        if (!token) return
        console.log(token)
        const auth = oAuth2Client.setCredentials(token)
        console.log(auth)
        const drive = google.drive({ version: 'v3', auth: auth })
        // console.log(drive)
        const fileList = await drive.files.list({ pageSize: 10, fields: 'nextPageToken, files(id, name)' })
        const files = fileList.data.files
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
        return

        const sheets = google.sheets({ version: 'v4' });
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            key: process.env.GOOGLE_API_KEY,
            // range: 'A1:R',
            range: 'A1:A2',
        })

        console.log(JSON.stringify(sheetData))
        return

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

        let res = await TemplesModel.insertMany(insertObjects)

        if (res) {
            this.log.info(chalk.green(`Успешная загрузка: ${res.length}`))
        } else {
            this.log.error(`Ошибка при сохранении данных ${JSON.stringify(res)}`)
        }

        const totalLinesCount = rows.length - 1
        const savedCount = insertObjects.length
        const loadedTime = DateHelper.dateTimeToStr(new Date()) + ' МСК'
        const statusText = [checkedObjectCount, skipObjectCount, totalLinesCount].join(' / ')
        const serviceObjects = [
            { 'name': 'checkedObjectCount', 'kind': 'detailStatus', 'value': checkedObjectCount },
            { 'name': 'skipObjectCount', 'kind': 'detailStatus', 'value': skipObjectCount },
            { 'name': 'savedCount', 'kind': 'detailStatus', 'value': savedCount },
            { 'name': 'totalCount', 'kind': 'detailStatus', 'value': totalLinesCount },
            { 'name': 'statusText', 'kind': 'status', 'value': statusText },
            { 'name': 'loadedTime', 'kind': 'status', 'value': loadedTime }
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