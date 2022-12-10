import DateHelper from '../helper/dateHelper.js'
import ChronosTempleModel from '../models/chronosTempleModel.js'
import XlsGoogleParser from './xlsGoogleParser.js'

export default class XlsGoogleParserChronosTemple extends XlsGoogleParser {

    constructor(log) {
        super()
        this.log = log
        this.pageUrls = ['place', 'shortBrief']
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID_CHRONOS_TEMPLE
        this.range = 'A1:K'
        this.model = ChronosTempleModel
    }

    fillHeaderColumns(headerRow) {
        let headerColumns = {}
        const colCorresponds = {
            'loadStatus': 'статус загрузки',
            'author': 'автор',
            'isChecked': 'проверено',
            'place': 'город',
            'start': 'дата события',
            'end': 'дата оконч',

            'shortBrief': 'краткое описание',
            'longBrief': 'событие',
            'srcUrl': 'источник',
            'remark': 'примечание',

            'comment': 'комментарий'
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
        json.errorArr = []
        json.shortBrief = row[headerColumns.shortBrief].trim()
        json.longBrief = row[headerColumns.longBrief].trim()
        json.srcUrl = row[headerColumns.srcUrl]
        json.remark = row[headerColumns.remark]
        json.comment = row[headerColumns.comment]

        json.place = row[headerColumns.place].trim()

        try {

            let dateInput = row[headerColumns.start]
            if (!dateInput) {
                throw new Error('Пропуск пустой даты основания')
            }
            json.start = DateHelper.getDateFromInput(dateInput)

            dateInput = row[headerColumns.end]
            if (dateInput) {
                json.end = DateHelper.getDateFromInput(dateInput)
            }


            let place = row[headerColumns.place]
            if (place)
                place = place.trim()

            if (!place || place.toLowerCase() == 'неизвестно') {
                json.errorArr.push('Пропуск пустого города')
            } else {

                json.place = place
                let coords = await this.getCoords(place, row[headerColumns.point])
                if (coords) {
                    json.point = coords
                } else {
                    json.errorArr.push(`Не определена координата события "${place}"`)
                }

            }

        } catch (e) {
            json.errorArr.push('' + e)
        }

        return json
    }

}