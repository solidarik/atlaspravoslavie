class JsHelper {
  static fillArray(value, len) {
    if (len == 0) return []
    var a = [value]
    while (a.length * 2 <= len) a = a.concat(a)
    if (a.length < len) a = a.concat(a.slice(0, len - a.length))
    return a
  }

  static getMapSize(x) {
    let len = 0
    for (let count in x) {
      len++
    }

    return len
  }

  static arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

  static isNaN(x) {

  }
}

module.exports = JsHelper
