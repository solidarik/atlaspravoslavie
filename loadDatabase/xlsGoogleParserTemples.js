import DateHelper from '../helper/dateHelper.js'
import TempleModel from '../models/templesModel.js'
import XlsGoogleParser from './xlsGoogleParser.js'

export default class XlsGoogleParserTemples extends XlsGoogleParser {

    constructor(log) {
        super()
        this.log = log
        this.pageUrls = ['name']
        this.model = TempleModel
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID_TEMPLES
        this.range = 'A1:T'
    }

    fillHeaderColumns(headerRow) {
        let headerColumns = {}
        const colCorresponds = {
            'loadStatus': 'статус загрузки',
            'author': 'автор',
            'isChecked': 'проверено',
            'name': 'название',
            'point': 'коорд',
            'city': 'город',
            'place': 'место',
            'start': 'дата основа',
            'longBrief': 'описание',
            'dedicated': 'посвящен',
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

    async getJsonFromRow(headerColumns, row) {
        let json = {}
        json.author = row[headerColumns.author]
        json.isChecked = row[headerColumns.isChecked]
        json.name = row[headerColumns.name].trim()
        json.city = row[headerColumns.city].trim()
        json.place = row[headerColumns.place].trim()
        json.errorArr = []

        try {

            const placeForCoords = `${json.name} ${json.place}`
            json.point = await this.getCoords(placeForCoords, row[headerColumns.point])

            const dateInput = row[headerColumns.start]
            if (!dateInput) {
                throw new Error('Пропуск пустой даты основания')
            }

            json.start = DateHelper.getDateFromInput(dateInput)
            json.longBrief = row[headerColumns.longBrief]
            json.dedicated = row[headerColumns.dedicated]
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
            json.errorArr.push(e + '')
        }

        return json
    }
}