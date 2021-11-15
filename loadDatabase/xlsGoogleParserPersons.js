const log = require('../helper/logHelper')
const chalk = require('chalk')
const { google } = require('googleapis')
const InetHelper = require('../helper/inetHelper')
const GeoHelper = require('../helper/geoHelper')
const DateHelper = require('../helper/dateHelper')
const StrHelper = require('../helper/strHelper')
const PersonModel = require('../models/personsModel')
const ServiceModel = require('../models/serviceModel')

const readline = require('readline')
const fs = require('fs')

class XlsGoogleParserPersons {

    constructor(log) {
        this.log = log
    }

    getCoords(inputPlace, inputCoords) {
        if (!inputPlace && !inputCoords) {
            throw new Error(`getCoords empty inputs: ${inputPlace}, ${inputCoords}`)
        }

        const coords = InetHelper.getSavedCoords(inputPlace)
        if (coords) {
            const coordsStr = InetHelper.getLonLatSavedCoords(inputPlace).reverse()
            if (!inputCoords || !inputCoords.includes('_')) {
                this.log.warn(`Найдена координата для ${inputPlace}: ${coordsStr.join('_')}`)
            }
            return coords
        }

        if (!inputCoords) {
            throw new Error(`Не заполнена координата inputPlace ${inputPlace}`)
        }

        const arr = inputCoords.split('_')
        if (arr.length == 0 || arr.length > 2) {
            throw new Error(`Неизвестный формат координат ${inputCoords}`)
        }

        return GeoHelper.fromLonLat(arr.reverse().map(item => Number(item)))
    }

    fillHeaderColumns(headerRow) {
        let headerColumns = {}
        const colCorresponds = {
            'author': 'автор',
            'isChecked': 'проверено',
            'surname': 'фамилия',
            'middlename': 'отчество',
            'sitename': 'имя для сайта',
            'monkname': 'имя в монашестве',
            'name': 'имя',

            'birthday': 'дата рождения',
            'birthPlace': 'место рождения',
            'birthCoord': 'координаты места рождения',

            'templesLink': 'связь с храмом',

            'achievPlace_1': 'место подвига 1',
            'achievDate_1': 'время подвига 1',
            'achievCoord_1': 'координаты места подвига 1',

            'achievPlace_2': 'место подвига 2',
            'achievDate_2': 'время подвига 2',
            'achievCoord_2': 'координаты места подвига 2',

            'achievPlace_3': 'место подвига 3',
            'achievDate_3': 'время подвига 3',
            'achievCoord_3': 'координаты места подвига 3',

            'canonizationDate': 'дата канонизации',
            'status': 'статус святости',
            'groupStatus': 'общий статус',
            'worshipDays': 'даты почитания',
            'profession': 'сфера деятельности',
            'description': 'жизнеописание',
            'srcUrl': 'источник',
            'imgUrl': 'ссылка на фото',

            'deathDate': 'дата смерти',
            'deathPlace': 'похоронен / умер',
            'deathCoord': 'координаты смерти'
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

        try {

            json.author = row[headerColumns.author]
            json.isChecked = row[headerColumns.isChecked]

            json.surname = row[headerColumns.surname]
            json.name = row[headerColumns.name]
            json.middlename = row[headerColumns.middlename]
            json.sitename = row[headerColumns.sitename]
            json.monkname = row[headerColumns.monkname]

            const birthday = row[headerColumns.birthday]
            if (!birthday) {
                throw new Error('Пропуск пустого места рождения')
            }
            json.birth = DateHelper.getDateFromInput(birthday)
            const birthPlace = row[headerColumns.birthPlace]
            if (!birthPlace || birthPlace == 'неизвестно') {
                throw new Error('Пропуск пустого места рождения')
            }
            json.birth['place'] = birthPlace
            json.birth["placeCoord"] = this.getCoords(birthPlace, row[headerColumns.birthCoord])

            const achievs = [
                {
                    'place': row[headerColumns.achievPlace_1],
                    'coord': row[headerColumns.achievCoord_1],
                    'date': row[headerColumns.achievDate_1]
                },
                {
                    'place': row[headerColumns.achievPlace_2],
                    'coord': row[headerColumns.achievCoord_2],
                    'date': row[headerColumns.achievDate_2]
                },
                {
                    'place': row[headerColumns.achievPlace_3],
                    'coord': row[headerColumns.achievCoord_3],
                    'date': row[headerColumns.achievDate_3]
                },
            ]

            json.achievements = []
            for (let i = 0; i < achievs.length; i++) {
                let achiev = achievs[i]
                if (achiev.place == '' || achiev.date == '')
                    continue
                let achievModel = {}
                achievModel.place = achiev.place
                achievModel.placeCoord = this.getCoords(achiev.place, achiev.coord)
                achievModel.start = DateHelper.getDateFromInput(achiev.date)
                json.achievements.push(achievModel)
            }

            json.canonizationDate = row[headerColumns.canonizationDate]
            json.status = row[headerColumns.status]
            json.groupStatus = row[headerColumns.groupStatus]

            json.worships = row[headerColumns.worshipDays]
            json.profession = row[headerColumns.profession]
            json.description = row[headerColumns.description]
            json.srcUrl = row[headerColumns.srcUrl]
            json.imgUrl = row[headerColumns.imgUrl]
            json.pageUrl = ''

            const deathDate = row[headerColumns.deathDate]
            if (deathDate) {
                json.death = DateHelper.getDateFromInput(deathDate)
                const deathPlace = row[headerColumns.deathPlace]
                if (deathPlace && deathPlace != 'неизвестно') {
                    json.death['place'] = deathPlace
                    json.death['placeCoord'] = this.getCoords(deathPlace, row[headerColumns.deathCoord])
                }
            }

            json.isError = undefined

        } catch (e) {
            json.isError = '' + e
        }

        return json
    }

    async loadData(dbHelper) {
        this.log.info(`Start of processing Google sheet`)

        // обновляем время последней проверки
        const checkedTime = DateHelper.dateTimeToStr(new Date())
        let res = await ServiceModel.updateOne({ name: 'checkedTime' }, { value: checkedTime })

        const sheets = google.sheets({ version: 'v4' })

        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID_PERSON,
            key: process.env.GOOGLE_API_KEY,
            range: 'A1:AE'
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

        //start from row = 1, because we skip a header row
        for (let row = 1; row < rows.length; row++) {
            const json = this.getJsonFromRow(headerColumns, rows[row])

            if (json.isChecked === '0' || json.isError) {
                if (json.isError)
                    this.log.error(`Пропуск строки ${row} ${JSON.stringify(json)}: ${json.isError}`)
                else
                    this.log.info(`Пропуск строки ${json.name}`)
                skipObjectCount += 1
                //continue soli
                console.log(json.isError)
                if (json.isError == 'Error: Пропуск пустого места рождения') {
                    continue
                }
                break
            }

            let pageUrlArr = json.sitename ? json.sitename : [json.surname, json.name, json.middlename]
            json.pageUrl = StrHelper.generatePageUrl(pageUrlArr)
            if (pageUrls.includes(json.pageUrl)) {
                json.pageUrl = StrHelper.replaceEnd(json.pageUrl, '_' + Number(row))
            }
            pageUrls.push(json.pageUrl)
            insertObjects.push(json)

            if (json.isChecked.trim() != '') {
                checkedObjectCount += 1

            }
        }

        const totalLinesCount = rows.length - 1
        const savedCount = insertObjects.length
        const statusText = [checkedObjectCount, skipObjectCount, totalLinesCount].join(' / ')
        console.log(statusText)

        return true

        res = await PersonModel.insertMany(insertObjects)

        if (res) {
            this.log.info(chalk.green(`Успешная загрузка: ${res.length}`))
        } else {
            this.log.error(`Ошибка при сохранении данных ${JSON.stringify(res)}`)
        }

        res = await dbHelper.clearDb('service')

        const serviceObjects = [
            { name: 'checkedObjectCount', kind: 'detailStatus', value: checkedObjectCount },
            { name: 'skipObjectCount', kind: 'detailStatus', value: skipObjectCount },
            { name: 'savedCount', kind: 'detailStatus', value: savedCount },
            { name: 'totalCount', kind: 'detailStatus', value: totalLinesCount },
            { name: 'statusText', kind: 'status', value: statusText },
            // { name: 'lastUpdateSheet', kind: 'status', value: last_update },
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

module.exports = XlsGoogleParserPersons