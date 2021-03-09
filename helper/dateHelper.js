const strHelper = require('../helper/strHelper')
const moment = require('moment')

const ROMAN_KEYS = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"]

class DateHelper {
  static ignoreAlterDate(input) {
    if (!input) {
      return input
    }
    let procDate = strHelper.shrinkStringBeforeDelim(input)
    procDate = strHelper.ignoreEqualsValue(input)
    procDate = strHelper.ignoreSpaces(procDate)
    procDate = procDate.replace(/-/g, '.')
    if (procDate.length == 4) {
      procDate = `01.01.${procDate}`
    } else if (procDate.split('.').length !== 3) {
      const months = [
        'янв',
        'фев',
        'март',
        'апр',
        'май',
        'июнь',
        'июль',
        'авг',
        'сен',
        'окт',
        'ноя',
        'дек',
      ]
      let year = strHelper.getMaxLenNumber(input)
      let month = 1
      year = year.length == 2 ? '19' + year : year
      for (let i = 0; i < months.length; i++) {
        if (-1 < input.indexOf(months[i])) {
          month = i + 1
          break
        }
      }
      procDate = `01.${month}.${year}`
    }
    const dmy = procDate.split('.')
    let d = parseInt(dmy[0])
    d = d < 10 ? '0' + d : d.toString()
    let m = parseInt(dmy[1])
    m = m < 10 ? '0' + m : m.toString()
    let y = parseInt(dmy[2])
    if (y < 100) {
      y = '19' + y.toString()
    }
    return moment.utc(`${d}.${m}.${y}`, 'DD.MM.YYYY')
  }

  static rangeYmdToStr(firstDate, secondDate) {
    const ymdFirst = this.ymdToStr(firstDate)
    const ymdSecond = this.ymdToStr(secondDate)
    if (ymdFirst == ymdSecond) return ymdFirst
    if (!ymdFirst && !ymdSecond) return ''
    if (ymdFirst && !ymdSecond) return ymdFirst
    return ymdFirst + ' – ' + ymdSecond
  }

  static ymdToStr(inputDate) {
    const delim = '.'
    if (!inputDate) return ''
    if (inputDate.isOnlyYear) return inputDate.year + ''
    if (inputDate.isOnlyCentury) return inputDate.century + ' в.'
    if (inputDate.year == -999) return ''

    res = '' + inputDate.year
    if (inputDate.month != -1) {
      res = ('0' + inputDate.month).slice(-2) + delim + res
    }
    if (inputDate.day != -1) {
      res = ('0' + inputDate.day).slice(-2) + delim + res
    }
    return res
  }

  static dateToStr(inputDate, isWithoutYear = true) {
    if (!inputDate) return undefined
    let date = new Date(inputDate)
    const day = ('0' + date.getDate()).slice(-2)
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const year = date.getFullYear()
    return isWithoutYear && day == '01' && month == '01' ? year : `${day}.${month}.${year}`
  }

  static getYearStr(inputDate) {
    if (!inputDate) return ''

    let date = new Date('' + inputDate)
    return '' + date.getFullYear()
  }

  static twoDateToStr(startDate, endDate, isOnlyYear = false) {
    const startDateStr = DateHelper.dateToStr(startDate)
    const endDateStr = DateHelper.dateToStr(endDate)
    return endDateStr != undefined && startDateStr != endDateStr
      ? `${startDateStr} - ${endDateStr}`
      : isOnlyYear
      ? this.getYearStr(startDate)
      : startDateStr
  }

  static twoDateToStr2(startDateStr, endDateStr) {
    return endDateStr != undefined && startDateStr != endDateStr
      ? `${startDateStr} - ${endDateStr}`
      : startDateStr
  }

  static betweenYearTwoDates(startDate, endDate, isEndText = true) {
    const startDateMoment = this.ignoreAlterDate(startDate)
    const endDateMoment = this.ignoreAlterDate(endDate)

    if (!startDateMoment || !endDateMoment) return undefined

    const diffYear = endDateMoment.diff(startDateMoment, 'years')

    if (!isEndText) return diffYear

    if (diffYear % 10 === 1 && diffYear !== 11) return diffYear + ' год'
    else
      return (diffYear >= 5 && diffYear <= 19) ||
        diffYear % 10 > 4 ||
        diffYear % 10 === 0
        ? diffYear + ' лет'
        : diffYear + ' года'
  }

  static yearToCentury(year) {
    let century = 0
    if (year >= 0) {
        century = Math.floor(year / 100) + 1
    } else {
        century = Math.trunc(year / 100) - 1
    }
    return Number(century)
  }

  static intCenturyToStr(intCentury) {
    const isMinus = intCentury < 0
    if (intCentury == 0) {
      intCentury = 1
    }
    const romanize = DateHelper.arabicToRoman(intCentury)
    if (isMinus) {
      return `-${romanize}`
    }
    return romanize
  }

  static arabicToRoman(num) {
    if (isNaN(num))
        return NaN;
    let digits = String(+num).split("")
    let roman = ""
    let i = 3
    while (i--)
        roman = (ROMAN_KEYS[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
  }

  static romanToArabic(roman) {

    var reg = /^[IVXLCDM]+$/
    if (!reg.test(roman)) return undefined

    //https://stackoverflow.com/questions/48946083/convert-roman-number-to-arabic-using-javascript
    if (roman == null)
        return undefined;

    let totalValue = 0
    let value = 0
    let prev = 0

    for(let i = 0; i<roman.length; i++) {
        let current = DateHelper.romanToInt(roman.charAt(i));
        if (current > prev) {
            // Undo the addition that was done, turn it into subtraction
            totalValue -= 2 * value;
        }
        if (current !== prev) { // Different symbol?
            value = 0; // reset the sum for the new symbol
        }
        value += current // keep adding same symbols
        totalValue += current
        prev = current
    }
    return totalValue
  }

  static romanToInt(character) {
    switch(character){
        case 'I': return 1;
        case 'V': return 5;
        case 'X': return 10;
        case 'L': return 50;
        case 'C': return 100;
        case 'D': return 500;
        case 'M': return 1000;
        default: return -1;
    }
  }

  static getCenturyRange(century) {

    if (century == 0) {
      century = 1
    }

    const isMinus = century < 0
    let startYear = 0
    let endYear = 0

    if (isMinus) {
      century = Math.abs(century)
    }

    startYear = (century - 1) * 100
    endYear = century * 100 - 1

    if (isMinus)
      return [-endYear, -startYear]
    else
      return [startYear, endYear]
  }
}

module.exports = DateHelper
