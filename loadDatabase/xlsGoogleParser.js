// import FileHelper from '../helper/fileHelper.js'
import chalk from 'chalk'
import GeoHelper from '../helper/geoHelper.js'
import InetHelper from '../helper/inetHelper.js'
import DateHelper from '../helper/dateHelper.js'
import ServiceModel from '../models/serviceModel.js'
import StrHelper from '../helper/strHelper.js'
import XlsHelper from '../helper/xlsHelper.js'
import readline from 'readline'

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
        console.log('test after create oAuth2Client')

        try {
            token = fs.readFileSync(process.env.GOOGLE_DRIVE_TOKEN_FILE)
            token = JSON.parse(token)
        } catch (err) {
            // console.log(err)
            // return
            const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
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

        // this.log.info(`Сount rows ${rows.length} columns ${rows[0].length}`)

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

            let status = ''

            if (json.isChecked == '0' || json.isCatchError) {
                skipObjectCount += 1
                status = `Пропущено согласно флагу`
                continue
            }
            else if (json.isError) {
                status = json.errorArr.join('; ')
                if (errorTypes.hasOwnProperty(json.isError))
                    errorTypes[json.isError] += 1
                else
                    errorTypes[json.isError] = 1
            } else {
                successObjectCount += 1
                status = 'Успешно'
            }

            // this.log.info(`${row + 1}: ${status}`)
            json.status = status

            json.pageUrl = this.getPageUrl(json)
            if (pageUrlsGlobal.includes(json.pageUrl)) {
                json.pageUrl = StrHelper.replaceEnd(json.pageUrl, '_' + Number(row))
            }
            pageUrlsGlobal.push(json.pageUrl)
            insertObjects.push(json)
        }

        await this.getLastUpdateFromGoogleApi()

        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_DRIVE_ID,
            process.env.GOOGLE_DRIVE_SECRET,
            'http://localhost:3000'
        )

        const token = await oAuth2Client.getToken('ya29.a0ARrdaM8MzjzvKA6ZbF119-M7lUYYQWjyITmmxqJxYrP2FbfbfsjSjkA2dOuqlULqSLqjJrjLIJtj0qB9pk15qN4_Tc7drHokSwJPv7C58MZdB9JQcPw9GKlFGeQ8wl6SpQ80xEIAY0sKmQ2uZXDN3yeaC4J8","refresh_token":"1//0crwmtRbwEIVvCgYIARAAGAwSNwF-L9IrUDze_VFybDRUYbItu6Nzl1FHkHmDSd-GusxOvRLtHEQzUdminUoUi1lsVqxcgWtBgMg","scope":"https://www.googleapis.com/auth/drive.metadata.readonly","token_type":"Bearer","expiry_date":1631444971544},"res":{"config":{"method":"POST","url":"https://oauth2.googleapis.com/token","data":"code=4%2F0AX4XfWicdYp-b6Od3PzbR6f1xjHDjR3EEkrUwA0mDYQVkjexPoPdTa-YSg1ZeAuQk27stA%26scope%3Dhttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly&client_id=354745299259-0l2gb4nji5v636vh79mjj91vv10010s1.apps.googleusercontent.com&client_secret=a5N55J-rEUTxtmlN-5L8wk0f&redirect_uri=http%3A%2F%2Flocalhost%3A3000&grant_type=authorization_code&code_verifier=","headers":{"Content-Type":"application/x-www-form-urlencoded","User-Agent":"google-api-nodejs-client/3.1.2","Accept":"application/json"},"params":{},"body":"code=4%2F0AX4XfWicdYp-b6Od3PzbR6f1xjHDjR3EEkrUwA0mDYQVkjexPoPdTa-YSg1ZeAuQk27stA%26scope%3Dhttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly&client_id=354745299259-0l2gb4nji5v636vh79mjj91vv10010s1.apps.googleusercontent.com&client_secret=a5N55J-rEUTxtmlN-5L8wk0f&redirect_uri=http%3A%2F%2Flocalhost%3A3000&grant_type=authorization_code&code_verifier=","responseType":"json"},"data":{"access_token":"ya29.a0ARrdaM8MzjzvKA6ZbF119-M7lUYYQWjyITmmxqJxYrP2FbfbfsjSjkA2dOuqlULqSLqjJrjLIJtj0qB9pk15qN4_Tc7drHokSwJPv7C58MZdB9JQcPw9GKlFGeQ8wl6SpQ80xEIAY0sKmQ2uZXDN3yeaC4J8","refresh_token":"1//0crwmtRbwEIVvCgYIARAAGAwSNwF-L9IrUDze_VFybDRUYbItu6Nzl1FHkHmDSd-GusxOvRLtHEQzUdminUoUi1lsVqxcgWtBgMg","scope":"https://www.googleapis.com/auth/drive.metadata.readonly","token_type":"Bearer","expiry_date":1631444971544},"headers":{"alt-svc":"h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000,h3-T051=\":443\"; ma=2592000,h3-Q050=\":443\"; ma=2592000,h3-Q046=\":443\"; ma=2592000,h3-Q043=\":443\"; ma=2592000,quic=\":443\"; ma=2592000; v=\"46,43\"')
        oAuth2Client.setCredentials(token)

        const statuses = insertObjects.map(item => item.status)
        const statusColumnName = XlsHelper.getColumnNameByNumber(headerColumns.status)
        const statusRowStart = 2
        const statusRowEnd = statuses.length + 1
        const statusRange = `${statusColumnName}${statusRowStart}:${statusColumnName}${statusRowEnd}`

        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            auth: oAuth2Client,
            valueInputOption: "USER_ENTERED",
            data: [{
                range: statusRange,
                values: statuses
            }]
        }).data
        this.log.info(`response batch update: ${JSON.stringify(response)}`)


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
