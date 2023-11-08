import DateHelper from '../helper/dateHelper.js'
import inetHelper from '../helper/inetHelper.js'
import JsHelper from '../helper/jsHelper.js'
import ImageHelper from '../helper/imageHelper.js'
import StrHelper from '../helper/strHelper.js'
import PersonModel from '../models/personsModel.js'
import XlsGoogleParser from './xlsGoogleParser.js'

const dateStopWords = [
  'посередине',
  'середина',
  'между',
  'или',
  '—',
  '-',
  '—',
  'первая',
  'вторая',
  'ранее',
  'традиции',
  'тексту',
  'мира',
  'неизвестно',
  'монастырь',
]

export default class XlsGoogleParserPersons extends XlsGoogleParser {
  constructor(log) {
    super()
    this.log = log
    this.name = 'Святые'
    this.pageUrls = ['sitename', 'surname', 'name']
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSON
    this.range = 'A1:AN'
    this.model = PersonModel
    // this.startRow = 2308
    // this.maxRow = 2309
  }

  getPageUrl(json) {
    const pageUrlsLocal = json.sitename
      ? json.sitename
      : [json.surname, json.name, json.middlename]
    return StrHelper.generatePageUrl(pageUrlsLocal)
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
      if (
        currLetter === '/' ||
        (StrHelper.isRussianLetter(prevLetter) &&
          StrHelper.isNumeric(currLetter))
      ) {
        worshipDates.push(input.substring(prevWordPos, pos))
        prevWordPos = currLetter === '/' ? pos + 1 : pos
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
        day: day,
        month: month,
        dateStr: `${Number(day)} ${DateHelper.getInducementTextOfMonth(month)}`,
      })
    })

    return worships
  }

  fillHeaderColumns(headerRow) {
    let headerColumns = {}
    const colCorresponds = {
      loadStatus: 'статус загрузки',
      author: 'автор',
      isChecked: 'проверено',
      surname: 'фамилия',
      middlename: 'отчество',
      sitename: 'имя для сайта',
      monkname: 'имя в монашестве',
      name: 'имя',

      birthDay: 'дата рождения',
      birthPlace: 'место рождения',
      birthCoord: 'координаты места рождения',

      templesLink: 'связь с храмом',

      achievPlace_1: 'место подвига 1',
      achievDate_1: 'время подвига 1',
      achievCoord_1: 'координаты места подвига 1',

      achievPlace_2: 'место подвига 2',
      achievDate_2: 'время подвига 2',
      achievCoord_2: 'координаты места подвига 2',

      achievPlace_3: 'место подвига 3',
      achievDate_3: 'время подвига 3',
      achievCoord_3: 'координаты места подвига 3',

      canonizationDate: 'дата канонизации',
      status: 'статус святости',
      groupStatus: 'общий статус',
      worshipDays: 'дата почитания',
      profession: 'сфера деятельности',
      description: 'жизнеописание',
      srcUrl: 'источник',
      imgUrl: 'ссылка на фото',

      deathDay: 'дата смерти',
      deathPlace: 'умер',
      buriedPlace: 'похоронен',
      deathCoord: 'координаты смерти',
    }

    for (let iCol = 0; iCol < headerRow.length; iCol++) {
      const xlsColName = headerRow[iCol].toLowerCase()
      for (let colModel in colCorresponds) {
        const colSearch = colCorresponds[colModel]
        if (xlsColName.startsWith(colSearch) && !headerColumns[colModel]) {
          headerColumns[colModel] = iCol
        }
      }
    }
    return headerColumns
  }

  async getJsonFromRow(headerColumns, row) {
    let json = { errorArr: [], warningArr: [], lineSource: 0 }

    try {
      json.author = row[headerColumns.author]
      json.isChecked = row[headerColumns.isChecked]

      json.surname = row[headerColumns.surname]
      json.name = row[headerColumns.name]
      json.middlename = row[headerColumns.middlename]
      json.sitename = row[headerColumns.sitename]
      json.monkname = row[headerColumns.monkname]

      if (!json.surname && !json.name && !json.middlename && !json.sitename) {
        json.errorArr.push('Пропуск пустых имён')
        return json
      }

      json.birth = {}
      json.death = {}

      //(json.sitename == 'Схиархимандрит Андроник')
      const isDebugLine = false

      const birthDay = row[headerColumns.birthDay]
      const deathDay = row[headerColumns.deathDay]
      if (!birthDay && !deathDay) {
        json.errorArr.push('Пропуск пустых дат рождения и смерти')
      } else {
        let maybeBirthDate = false
        let maybeDeathDate = false
        if (birthDay != '') {
          try {
            maybeBirthDate = DateHelper.getDateFromInput(
              birthDay,
              dateStopWords
            )
          } catch (e) {
            maybeBirthDate = false
          }
          if (maybeBirthDate) {
            json.birth = maybeBirthDate
            json.birth['isIndirectDate'] = false
          } else {
            json.warningArr.push(`Не определена дата рождения ${birthDay}`)
          }
        }

        if (deathDay != '') {
          try {
            maybeDeathDate = DateHelper.getDateFromInput(
              deathDay,
              dateStopWords
            )
          } catch (e) {
            maybeDeathDate = false
          }
          if (maybeDeathDate) {
            json.death = maybeDeathDate
            json.death['isIndirectDate'] = false
          } else {
            json.warningArr.push(`Не определена дата смерти ${deathDay}`)
          }
        }

        const deltaYear = 1

        if (maybeBirthDate && !maybeDeathDate) {
          json.death = { ...json.birth }
          json.death['year'] += deltaYear
          json.death['century'] += Math.round(deltaYear / 100)
          json.death['isIndirectDate'] = true
        }

        if (!maybeBirthDate && maybeDeathDate) {
          json.birth = { ...json.death }
          json.birth['year'] -= deltaYear
          json.birth['century'] -= Math.round(deltaYear / 100)
          json.birth['isIndirectDate'] = true
        }

        if (!maybeBirthDate && !maybeDeathDate) {
          json.errorArr.push(`Не определены даты рождения и смерти
                        ${birthDay} ${deathDay}`)
        }
      }

      let birthPlace = row[headerColumns.birthPlace]
      let deathPlace = row[headerColumns.deathPlace]

      if (!deathPlace || deathPlace.toLowerCase() == 'неизвестно')
        if (row[headerColumns.buriedPlace]) {
          deathPlace = row[headerColumns.buriedPlace]
        }

      if (birthPlace) birthPlace = (birthPlace + '').trim()

      if (deathPlace) deathPlace = (deathPlace + '').trim()

      if (isDebugLine) {
        console.log(`birth: ${birthPlace}, death: ${deathPlace}`)
      }

      if (
        (!birthPlace || birthPlace.toLowerCase() == 'неизвестно') &&
        (!deathPlace || deathPlace.toLowerCase() == 'неизвестно')
      ) {
        json.errorArr.push('Пропуск пустых мест рождения и смерти')
      } else {
        json.birth['isIndirectPlace'] = false
        json.death['isIndirectPlace'] = false

        if (
          birthPlace &&
          (!deathPlace || deathPlace.toLowerCase() == 'неизвестно')
        ) {
          deathPlace = birthPlace
          json.death['isIndirectPlace'] = true
        } else if (
          deathPlace &&
          (!birthPlace || birthPlace.toLowerCase() == 'неизвестно')
        ) {
          birthPlace = deathPlace
          json.birth['isIndirectPlace'] = true
        }

        json.birth['place'] = birthPlace
        let birthCoord = await this.getCoords(
          birthPlace,
          row[headerColumns.birthCoord]
        )
        if (birthCoord) {
          json.birth['placeCoord'] = birthCoord
        } else {
          if (row[headerColumns.birthCoord]) {
            console.log(
              `Не удалось распарсить координаты рождения ${birthPlace}, ${
                row[headerColumns.birthCoord]
              }`
            )
          }
          json.errorArr.push(`Не определена координата рождения ${birthPlace}`)
        }

        json.death['place'] = deathPlace
        let deathCoord = await this.getCoords(
          deathPlace,
          row[headerColumns.deathCoord]
        )
        if (deathCoord) {
          json.death['placeCoord'] = deathCoord
        } else {
          if (row[headerColumns.deathCoord]) {
            console.log(
              `Не удалось распарсить координаты смерти ${deathPlace}, ${
                row[headerColumns.deathCoord]
              }`
            )
          }
          json.errorArr.push(`Не определена координата смерти ${deathPlace}`)
        }
      }

      const achievs = [
        {
          place: row[headerColumns.achievPlace_1],
          coord: row[headerColumns.achievCoord_1],
          date: row[headerColumns.achievDate_1],
        },
        {
          place: row[headerColumns.achievPlace_2],
          coord: row[headerColumns.achievCoord_2],
          date: row[headerColumns.achievDate_2],
        },
        {
          place: row[headerColumns.achievPlace_3],
          coord: row[headerColumns.achievCoord_3],
          date: row[headerColumns.achievDate_3],
        },
      ]

      json.achievements = []
      for (let i = 0; i < achievs.length; i++) {
        let achiev = achievs[i]

        if (achiev.place == '' || achiev.date == '') continue

        let achievModel = {}
        if (achiev.place != '') {
          achievModel.place = achiev.place
          const achievPlaceCoord = await this.getCoords(
            achiev.place,
            achiev.coord
          )
          if (achievPlaceCoord) {
            achievModel.placeCoord = achievPlaceCoord
          } else {
            if (achiev.coord) {
              console.log(
                `Не удалось распарсить координаты подвига ${achiev.place}, ${achiev.coord}`
              )
            }
            json.warningArr.push(
              `Не определена координата подвига ${achiev.place}`
            )
          }
        }

        if (achiev.date != '') {
          if (achiev.date.includes('-')) {
            const arrDates = achiev.date.split('-')
            try {
              const startDate = DateHelper.getDateFromInput(
                arrDates[0],
                dateStopWords
              )
              const endDate = DateHelper.getDateFromInput(
                arrDates[1],
                dateStopWords
              )
              if (startDate && endDate) {
                achievModel.start = startDate
                achievModel.end = endDate
              } else {
                json.warningArr.push(
                  `Не определена дата подвига ${achiev.date}`
                )
              }
            } catch (e) {
              json.warningArr.push(`Не определена дата подвига ${achiev.date}`)
            }
          } else {
            try {
              let startDate = DateHelper.getDateFromInput(
                achiev.date,
                dateStopWords
              )
              if (startDate) {
                achievModel.start = startDate
              } else {
                json.warningArr.push(
                  `Не определена дата подвига ${achiev.date}`
                )
              }
            } catch (e) {
              json.warningArr.push(`Не определена дата подвига ${achiev.date}`)
            }
          }
        }

        json.achievements.push(achievModel)
      }

      try {
        const canonizationDate = DateHelper.getDateFromInput(
          row[headerColumns.canonizationDate],
          dateStopWords
        )
        if (canonizationDate) {
          json.canonizationDate = canonizationDate
        }
      } catch (e) {
        json.warningArr.push(`Не удалось распарсить дату канонизации
                    ${row[headerColumns.canonizationDate]}`)
      }

      if (row[headerColumns.status]) {
        json.status = row[headerColumns.status].trim()
      }

      if (row[headerColumns.groupStatus]) {
        json.groupStatus = row[headerColumns.groupStatus].trim()
      }

      if (!json.groupStatus && json.status) {
        json.groupStatus = json.status
      }

      let checkGroupStatus = json.groupStatus
      if (checkGroupStatus) {
        checkGroupStatus = json.groupStatus.toLowerCase()
      }

      if (checkGroupStatus.includes('муч')) json.groupStatus = 'мученик'
      else if (checkGroupStatus.includes('свят')) json.groupStatus = 'святой'
      else if (checkGroupStatus.includes('препод'))
        json.groupStatus = 'преподобный'
      else {
        json.groupStatus = 'святой'
        json.warningArr.push(`Не определена группа святости
                    ${row[headerColumns.status]}
                    ${row[headerColumns.groupStatus]}`)
      }

      try {
        json.worshipDays = this.getWorshipDates(row[headerColumns.worshipDays])
      } catch (err) {
        json.warningArr.push(err)
      }

      json.profession = row[headerColumns.profession]
      json.description = row[headerColumns.description]
      const srcUrl = row[headerColumns.srcUrl]
      if (inetHelper.isExistUrl(json.srcUrl)) {
        json.srcUrl = srcUrl
      } else {
        json.warningArr.push(`Невалидная ссылка-источник: ${json.srcUrl}`)
      }

      if (isDebugLine) {
        console.log(`item: ${JSON.stringify(json)}`)
      }

      const imgUrl = row[headerColumns.imgUrl]
      json.imgUrls = []
      let imgUrls = []
      if (imgUrl) {
        imgUrls = imgUrl
          .split('http')
          .map((item) => {
            return `http${item}`
          })
          .slice(1)
      } else {
        json.warningArr.push(`Нет ссылки на фотографию`)
      }

      for (let idxImg = 0; idxImg < imgUrls.length; idxImg++) {
        const imgUrl = imgUrls[idxImg]
        if (
          !inetHelper.isExistUrl(imgUrl) ||
          !StrHelper.isEndingByOr(imgUrl, ['png', 'jpg', 'jpeg', 'webm'])
        ) {
          json.warningArr.push(`Невалидная ссылка на фото: ${imgUrl}`)
        } else {
          json.imgUrls.push(imgUrl)
        }
      }

      json.pageUrl = ''

      // if (isDebugLine) {
      //     console.log(`item: ${JSON.stringify(json)}`)
      // }
    } catch (e) {
      json.errorArr.push('' + e)
    }

    return json
  }
}
