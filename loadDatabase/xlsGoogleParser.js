// import FileHelper from '../helper/fileHelper.js'
import chalk from 'chalk'
import GeoHelper from '../helper/geoHelper.js'
import InetHelper from '../helper/inetHelper.js'
import DateHelper from '../helper/dateHelper.js'
import ServiceModel from '../models/serviceModel.js'
import StrHelper from '../helper/strHelper.js'

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

    async getLastUpdateFromGoogleApi() {
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_DRIVE_ID,
            process.env.GOOGLE_DRIVE_SECRET,
            'http://localhost:3000')

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

    getPageUrl(json) {
        const pageUrlsLocal = this.pageUrls.map((colName) => json[colName])
        return StrHelper.generatePageUrl(pageUrlsLocal)
    }

    async loadData(dbHelper) {

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

        this.log.info(`Сount rows ${rows.length} columns ${rows[0].length}`)

        const headerColumns = this.fillHeaderColumns(rows[0])
        let insertObjects = []
        let successObjectCount = 0
        let skipObjectCount = 0
        let pageUrlsGlobal = []

        let errorTypes = {}

        //start from row = 1, because we skip a header row
        // for (let row = 1; row < rows.length; row++) {
        const maxRow = this.maxRow ? this.maxRow : rows.length
        for (let row = 1; row < maxRow; row++) {
            const json = await this.getJsonFromRow(headerColumns, rows[row])

            json.lineSource = row + 1
            json.isShowOnMap = (json.isChecked != 0) && (!json.isError)

            if (json.isChecked == '0' || json.isCatchError) {
                skipObjectCount += 1
                this.log.info(`${row + 1}: Skipped`)
                continue
            }
            else if (json.isError) {
                this.log.info(`${row + 1}: ${json.errorArr.join('; ')}`)

                if (errorTypes.hasOwnProperty(json.isError))
                    errorTypes[json.isError] += 1
                else
                    errorTypes[json.isError] = 1
            } else {
                successObjectCount += 1
                this.log.info(`${row + 1}: Success`)
            }

            json.pageUrl = this.getPageUrl(json)
            if (pageUrlsGlobal.includes(json.pageUrl)) {
                json.pageUrl = StrHelper.replaceEnd(json.pageUrl, '_' + Number(row))
            }
            pageUrlsGlobal.push(json.pageUrl)
            insertObjects.push(json)
        }

        const totalLinesCount = rows.length - 1
        const savedCount = insertObjects.length
        const statusText = [successObjectCount, skipObjectCount, totalLinesCount].join(' / ')
        this.log.info(statusText)

        res = await this.model.insertMany(insertObjects)

        if (res) {
            this.log.info(chalk.green(`Успешная загрузка: ${res.length}`))
        } else {
            this.log.error(`Ошибка при сохранении данных ${JSON.stringify(res)}`)
        }

        return true

        res = await dbHelper.clearDb('service')

        let serviceObjects = [
            { name: 'successObjectCount', value: successObjectCount },
            { name: 'skipObjectCount', value: skipObjectCount },
            { name: 'savedCount', value: savedCount },
            { name: 'totalCount', value: totalLinesCount },
            { name: 'statusText', value: statusText },
            { name: 'checkedTime', value: checkedTime }
        ]

        serviceObjects = serviceObjects.map(obj => { return { ...obj, 'model': modelName } })
        res = await ServiceModel.insertMany(serviceObjects)
        if (res) {
            this.log.info(chalk.green(`Успешное сохранение статуса`))
        } else {
            this.log.error(`Ошибка при сохранении статуса ${JSON.stringify(res)}`)
        }

        return true
    }

}
