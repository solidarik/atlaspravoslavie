import chalk from 'chalk'
import { google } from 'googleapis'
import inetHelper from '../helper/inetHelper'
import GeoHelper from '../helper/geoHelper'
import DateHelper from '../helper/dateHelper'
import JsHelper from '../helper/jsHelper'
import StrHelper from '../helper/strHelper'
import personModel from '../models/personsModel'
import serviceModel from '../models/serviceModel'

const checkedCoordsPath = 'loadDatabase\\dataSources\\checkedCoords.json'
inetHelper.loadCoords(checkedCoordsPath)

const dateStopWords = ['посередине', 'середина', 'между', 'или',
    '—', '-', '—', 'первая', 'вторая', 'ранее', 'традиции', 'тексту', 'мира',
    'неизвестно', 'монастырь']

export default class XlsGoogleParserPersons {

    constructor(log) {
        this.log = log
    }

    async getCoords(inputPlace, inputCoords) {

        if (!inputPlace && !inputCoords) {
            return false
        }

        let coords = null

        if (inputCoords) {
            coords = GeoHelper.getCoordsFromHumanCoords(inputCoords)
            return GeoHelper.fromLonLat(coords)
        }

        coords = inetHelper.getLonLatSavedCoords(inputPlace)
        if (coords) {
            return GeoHelper.fromLonLat(coords)
        }

        // start search coordinates in wiki
        // const res = await inetHelper.getCoordsForCityOrCountry(inputPlace)
        // if (res && res.length > 0) {
        //     coords = res[0]
        //     return GeoHelper.fromLonLat(coords)
        // }
        // end search

        return false
    }

    getWorshipDates(input) {
        let worshipDates = []
        if (!input) {
            return worshipDates
        }

        input = StrHelper.ignoreSpaces(input)
        let prevWordPos = 0
        for (let pos = 1; pos < input.length; pos++) {
            const prevLetter = input[pos - 1]
            const currLetter = input[pos]
            if ((currLetter === '/') ||
                (StrHelper.isRussianLetter(prevLetter)
                    && StrHelper.isNumeric(currLetter))) {
                worshipDates.push(input.substring(prevWordPos, pos))
                prevWordPos = (currLetter === '/') ? pos + 1 : pos
            }
        }

        //last word
        worshipDates.push(input.substring(prevWordPos, input.length))

        worshipDates = JsHelper.onlyUniqueInArray(worshipDates)

        let worships = []

        worshipDates.forEach((worship) => {
            const numbers = StrHelper.getAllIntegerNumbers(worship)

            if (numbers.length < 1 || numbers.length > 2) {
                throw `Неожиданный формат даты канонизации ${worship}`
            }

            let day = numbers[0]
            let month = -1
            if (numbers.length == 1) {
                month = DateHelper.getMonthNum(worship)
            } else if (numbers.length == 2) {
                month = numbers[1]
            }
            if (month == -1) {
                throw `Неожиданный формат даты канонизации ${worship}`
            }
            worships.push({
                "day": day,
                "month": month,
                "dateStr": `${Number(day)} ${DateHelper.getInducementTextOfMonth(month)}`
            })
        })

        return worships
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

            'birthDay': 'дата рождения',
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
            'worshipDays': 'дата почитания',
            'profession': 'сфера деятельности',
            'description': 'жизнеописание',
            'srcUrl': 'источник',
            'imgUrl': 'ссылка на фото',

            'deathDay': 'дата смерти',
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

    async getJsonFromRow(headerColumns, row) {
        let json = {}

        json.lineSource = 0
        json.isError = false
        json.isCatchError = false
        json.errorArr = []

        try {

            json.author = row[headerColumns.author]
            json.isChecked = row[headerColumns.isChecked]

            json.surname = row[headerColumns.surname]
            json.name = row[headerColumns.name]
            json.middlename = row[headerColumns.middlename]
            json.sitename = row[headerColumns.sitename]
            json.monkname = row[headerColumns.monkname]

            const birthDay = row[headerColumns.birthDay]
            const deathDay = row[headerColumns.deathDay]
            if (!birthDay && !deathDay) {
                json.errorArr.push('Пропуск пустых дат рождения и смерти')
            } else {
                let maybeBirthDate = false
                let maybeDeathDate = false
                if (birthDay != '') {
                    maybeBirthDate = DateHelper.getDateFromInput(birthDay, dateStopWords)
                    if (maybeBirthDate) {
                        json.birth = maybeBirthDate
                        json.birth['isIndirectDate'] = false
                    } else {
                        json.errorArr.push(`Не определена дата рождения ${birthDay}`)
                    }
                }

                if (deathDay != '') {
                    maybeDeathDate = DateHelper.getDateFromInput(deathDay, dateStopWords)
                    if (maybeDeathDate) {
                        json.death = maybeDeathDate
                        json.death['isIndirectDate'] = false
                    }
                    else {
                        json.errorArr.push(`Не определена дата смерти ${deathDay}`)
                    }
                }

                if (maybeBirthDate && !maybeDeathDate) {
                    json.death = { ...json.birth }
                    json.death['year'] += 100
                    json.death['century'] += 1
                    json.death['isIndirectDate'] = true
                }

                if (!maybeBirthDate && maybeDeathDate) {
                    json.birth = { ...json.death }
                    json.birth['year'] -= 100
                    json.birth['century'] -= 1
                    json.birth['isIndirectDate'] = true
                }
            }

            let birthPlace = row[headerColumns.birthPlace]
            let deathPlace = row[headerColumns.deathPlace]

            if (birthPlace)
                birthPlace = birthPlace.trim()

            if (deathPlace)
                deathPlace = deathPlace.trim()

            if ((!birthPlace || birthPlace.toLowerCase() == 'неизвестно')
                && (!deathPlace || deathPlace.toLowerCase() == 'неизвестно')) {
                json.errorArr.push('Пропуск пустых мест рождения и смерти')
            } else {
                json.birth['isIndirectPlace'] = false
                json.death['isIndirectPlace'] = false

                if (birthPlace && (!deathPlace || deathPlace.toLowerCase() == 'неизвестно')) {
                    deathPlace = birthPlace
                    json.death['isIndirectPlace'] = true
                } else
                    if (deathPlace && (!birthPlace || birthPlace.toLowerCase() == 'неизвестно')) {
                        birthPlace = deathPlace
                        json.birth['isIndirectPlace'] = true
                    }

                json.birth['place'] = birthPlace
                let birthCoord = await this.getCoords(birthPlace, row[headerColumns.birthCoord])
                if (birthCoord) {
                    json.birth["placeCoord"] = birthCoord
                } else {
                    json.errorArr.push(`Не определена координата рождения для "${birthPlace}"`)
                }

                json.death['place'] = deathPlace
                let deathCoord = await this.getCoords(deathPlace, row[headerColumns.deathCoord])
                if (deathCoord) {
                    json.death['placeCoord'] = deathCoord
                } else {
                    json.errorArr.push(`Не определена координата смерти для "${deathPlace}"`)
                }
            }

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

                if (achiev.place != '') {
                    achievModel.place = achiev.place
                    const achievPlaceCoord = await this.getCoords(achiev.place, achiev.coord)
                    if (achievPlaceCoord) {
                        achievModel.placeCoord = achievPlaceCoord
                    } else {
                        json.errorArr.push(`Не определена координата подвига для "${achiev.place}"`)
                    }
                }

                if (achiev.date != '') {
                    if (achiev.date.includes('-')) {
                        const arrDates = achiev.date.split('-')
                        const startDate = DateHelper.getDateFromInput(arrDates[0], dateStopWords)
                        const endDate = DateHelper.getDateFromInput(arrDates[1], dateStopWords)
                        if (startDate && endDate) {
                            achievModel.start = startDate
                            achievModel.end = endDate
                        } else {
                            json.errorArr.push(`Не определена дата подвига ${achiev.date}`)
                        }
                    }
                    else if (achiev.date.includes('—')) {
                        const arrDates = achiev.date.split('—')
                        const startDate = DateHelper.getDateFromInput(arrDates[0], dateStopWords)
                        const endDate = DateHelper.getDateFromInput(arrDates[1], dateStopWords)
                        if (startDate && endDate) {
                            achievModel.start = startDate
                            achievModel.end = endDate
                        } else {
                            json.errorArr.push(`Не определена дата подвига ${achiev.date}`)
                        }
                    } else {
                        const startDate = DateHelper.getDateFromInput(achiev.date, dateStopWords)
                        if (startDate) {
                            achievModel.start = startDate
                        } else {
                            json.errorArr.push(`Не определена дата подвига ${achiev.date}`)
                        }
                    }
                }

                json.achievements.push(achievModel)
            }

            const canonizationDate = DateHelper.getDateFromInput(row[headerColumns.canonizationDate], dateStopWords)
            if (canonizationDate) {
                json.canonizationDate = canonizationDate
            }

            json.status = row[headerColumns.status]
            json.groupStatus = row[headerColumns.groupStatus]

            if (json.groupStatus.includes('муч'))
                json.groupStatus = 'мученик'
            else if (json.groupStatus.includes('свят'))
                json.groupStatus = 'святой'
            else if (json.groupStatus.includes('препод'))
                json.groupStatus = 'преподобный'
            else json.groupStatus = 'святой'

            json.worshipDays = this.getWorshipDates(row[headerColumns.worshipDays])
            json.profession = row[headerColumns.profession]
            json.description = row[headerColumns.description]
            json.srcUrl = row[headerColumns.srcUrl]
            json.imgUrls = row[headerColumns.imgUrl].split('http').map(item => {
                return `http${item}`
            }).slice(1)
            json.pageUrl = ''

            json.isError = json.errorArr.length > 0

        } catch (e) {
            json.isError = true
            json.isCatchError = true
            json.errorArr.push('' + e)
        }

        return json
    }

    async loadData(dbHelper) {
        this.log.info(`Start of processing Google sheet`)

        // обновляем время последней проверки
        const checkedTime = DateHelper.dateTimeToStr(new Date())
        let res = await serviceModel.updateOne({ name: 'checkedTime' }, { value: checkedTime })

        const sheets = google.sheets({ version: 'v4' })

        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID_PERSON,
            key: process.env.GOOGLE_API_KEY,
            range: 'A1:AF'
        })

        if (!sheetData) return this.log.error('The Google API returned an error')

        const rows = sheetData.data.values
        if (!rows.length) return this.log.error('No data found')

        this.log.info(`Сount rows ${rows.length} columns ${rows[0].length}`)
        let pageUrls = []

        const headerColumns = this.fillHeaderColumns(rows[0])
        let insertObjects = []
        let successObjectCount = 0
        let skipObjectCount = 0

        let errorTypes = {}

        //start from row = 1, because we skip a header row
        for (let row = 1; row < rows.length; row++) {
            // for (let row = 1; row < 1500; row++) {
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

            let pageUrlArr = json.sitename ? json.sitename : [json.surname, json.name, json.middlename]
            json.pageUrl = StrHelper.generatePageUrl(pageUrlArr)
            if (pageUrls.includes(json.pageUrl)) {
                json.pageUrl = StrHelper.replaceEnd(json.pageUrl, '_' + Number(row))
            }
            pageUrls.push(json.pageUrl)
            insertObjects.push(json)
        }

        const totalLinesCount = rows.length - 1
        const savedCount = insertObjects.length
        const statusText = [successObjectCount, skipObjectCount, totalLinesCount].join(' / ')
        this.log.info(statusText)

        inetHelper.saveCoords(checkedCoordsPath)

        res = await personModel.insertMany(insertObjects)

        if (res) {
            this.log.info(chalk.green(`Успешная загрузка: ${res.length}`))
        } else {
            this.log.error(`Ошибка при сохранении данных ${JSON.stringify(res)}`)
        }

        return true

        res = await dbHelper.clearDb('service')

        const serviceObjects = [
            { name: 'successObjectCountPersons', kind: 'detailStatus', value: successObjectCount },
            { name: 'skipObjectCountPersons', kind: 'detailStatus', value: skipObjectCount },
            { name: 'savedCountPersons', kind: 'detailStatus', value: savedCount },
            { name: 'totalCountPersons', kind: 'detailStatus', value: totalLinesCount },
            { name: 'statusTextPersons', kind: 'status', value: statusText },
            // { name: 'lastUpdateSheet', kind: 'status', value: last_update },
            { name: 'checkedTimePersons', kind: 'status', value: checkedTime }
        ]

        res = await serviceModel.insertMany(serviceObjects)
        if (res) {
            this.log.info(chalk.green(`Успешное сохранение статуса`))
        } else {
            this.log.error(`Ошибка при сохранении статуса ${JSON.stringify(res)}`)
        }

        return true
    }
}