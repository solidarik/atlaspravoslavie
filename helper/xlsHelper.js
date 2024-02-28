export default class XlsHelper {
  static getColumnNameByNumber(columnNumber) {
    // 1 -> A, 2 -> B, 26 -> Z, 27 -> AA
    let res = ''
    while (columnNumber > 0) {
      const reminder = (columnNumber - 1) % 26
      res = String.fromCharCode(65 + reminder) + res
      columnNumber = Math.floor((columnNumber - 1) / 26)
    }

    return res
  }

  static getColumnNumberByName(columnName) {
    // A -> 1, B -> 2, Z -> 26, AA -> 27
    let columnNumber = 0
    for (let i = 0; i < columnName.length; i++) {
      columnNumber +=
        (columnName.charCodeAt(i) - 64) *
        Math.pow(26, columnName.length - i - 1)
    }
    return columnNumber
  }

  static getColumnNameByHeader(headerRow, headerName) {
    // Получение названия столбца по заголовку
    const index = headerRow.indexOf(headerName)
    if (index == -1) {
      return undefined
    }

    return XlsHelper.getColumnNameByNumber(index + 1)
  }
}
