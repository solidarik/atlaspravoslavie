import * as d3 from './libs/d3.min.js';

export default class addHolyPersons {
  constructor(idTable, data) {
    this.idTable = idTable
    this.data = data
  }

  clearTable() {
    //console.log("clearTable");
    var dvTable = $('#' + this.idTable)
    dvTable.html('')
  }

  rowTableClickHandler(thisThis, thisTr) {
    //console.log("clicked " + $(thisTr).attr('id'));
    var id = parseInt($(thisTr).attr('id'))
    $('#FIO').html(
      ((typeof thisThis.data[id].surname !== 'undefined') ? thisThis.data[id].surname : '')
      +
      ' ' +
      ((typeof thisThis.data[id].name !== 'undefined') ? thisThis.data[id].name : '')
      +
      ' ' +
      ((typeof thisThis.data[id].middlename !== 'undefined') ? thisThis.data[id].middlename : '')
    )
    $('#LifeTime').html(
      '<b>Дата и место рождения</b> - ' +
      ((typeof thisThis.data[id].birth.dateStr !== 'undefined') ? thisThis.data[id].birth.dateStr : '')
      +
      ' ' +
      ((typeof thisThis.data[id].birth.place !== 'undefined') ? thisThis.data[id].birth.place : '')

    )

    if (typeof thisThis.data[id].achievements !== 'undefined' && thisThis.data[id].achievements.length > 0) {
      var str = '<b>Место и дата подвига</b> - '

      for (var i = 0; i < thisThis.data[id].achievements.length; i++) {
        str = str +
          ((typeof thisThis.data[id].achievements[i].place !== 'undefined') ? thisThis.data[id].achievements[i].place : '') +
          ' - ' +
          ((typeof thisThis.data[id].achievements[i].dateStr !== 'undefined') ? thisThis.data[id].achievements[i].dateStr : '') +
          ';'

        $('#AchievementPlace').html(str)
      }
    }
    $('#DeathTime').html(
      '<b>Дата смерти, захоронение</b> - ' +
      ((typeof thisThis.data[id].death.dateStr !== 'undefined') ? thisThis.data[id].death.dateStr : '') +
      ' ' +
      ((typeof thisThis.data[id].death.place !== 'undefined') ? thisThis.data[id].death.place : '')
    )
    $('#DateCanonization').html(
      '<b>Дата канонизации</b> - ' +
      ((typeof thisThis.data[id].canonizationDate !== 'undefined' && thisThis.data[id].canonizationDate.dateStr !== 'undefined') ? thisThis.data[id].canonizationDate.dateStr : '')
    )

    $('#HolinessStatus').html(
      '<b>Статус святости</b> - ' +
      ((typeof thisThis.data[id].status !== 'undefined') ? thisThis.data[id].status : '')
    )
    //цикл
    if (typeof thisThis.data[id].worshipDays !== 'undefined' && thisThis.data[id].worshipDays.length > 0) {
      var str = '<b>Дата почитания</b> - '
      for (var i = 0; i < thisThis.data[id].worshipDays.length; i++) {
        str = str +
          ((typeof thisThis.data[id].worshipDays[i].dateStr !== 'undefined') ? thisThis.data[id].worshipDays[i].dateStr : '') +
          ';'

        $('#DateVeneration').html(str)
      }
    }

    // $('#DateVeneration').html(
    //   '<b>Дата почитания</b> - ' +
    //     thisThis.data[id].DateVeneration
    // )
    $('#FieldActivity').html(
      '<b>Сфера деятельности</b> - ' +
      ((typeof thisThis.data[id].profession !== 'undefined') ? thisThis.data[id].profession : '')
    )

    console.log(JSON.stringify(thisThis.data[id]))

    $('#imgPerson').src = thisThis.data[id].photoUrl
    $('#imgPerson').attr('src', thisThis.data[id].photoUrl)
    // $('#description').html(
    //   thisThis.data[id].Description +
    //     " <a target='_blank' rel='noopener noreferrer' href='" +
    //     thisThis.data[id].Source +
    //     "'>" +
    //     'Подробнее...</a>'
    // )
    $('#fullDescription').html(
      thisThis.data[id].fullDescription +
      " <a target='_blank' rel='noopener noreferrer' href='" +
      thisThis.data[id].srcUrl +
      "'>" +
      'Подробнее...</a>'
    )
    $(thisTr).addClass('event-active-row')
    $(thisTr).siblings().removeClass('event-active-row')
  }

  addDataToTable(currPerson) {
    //console.log("addDataTotable");
    //console.log(JSON.stringify(this.data))
    var obj = this.data

    this.clearTable()
    var table = $('#' + this.idTable)
    //table[0].border = "1";
    var columns = Object.keys(obj[0])
    var columnCount = columns.length
    var row = $(table[0].insertRow(-1))
    for (var i = 0; i < columnCount; i++) {
      //if (i == 0 || i == 1 || i == 3 || i == 4|| i == 5) {
      var headerCell = $('<th />')
      if (columns[i] == 'surname') {
        headerCell.html('Фамилия')
        row.append(headerCell)
      } else if (columns[i] == 'name') {
        headerCell.html('Имя')
        row.append(headerCell)
      } else if (columns[i] == 'birth') {
        headerCell.html('Дата рождения')
        row.append(headerCell)
        headerCell = $('<th />')
        headerCell.html('Место рождения')
        row.append(headerCell)
      } else if (columns[i] == 'monkname') {
        headerCell.html('Имя в монашестве')
        row.append(headerCell)
      } else {
        //headerCell.html('N/A')
      }
      //row.append(headerCell)
      //}
    }
    var curId = -1;
    for (var i = 0; i < obj.length; i++) {
      row = $(table[0].insertRow(-1))
      row.addClass('hand-cursor')
      row.attr('id', i)
      for (var j = 0; j < columnCount; j++) {
        //if (j == 0 || j == 1 || j == 3 || j == 4|| j == 5) {
        var cell = $('<td />')

        if (columns[j] == 'surname') {
          cell.html(obj[i][columns[j]])
          row.append(cell)
        } else if (columns[j] == 'name') {
          cell.html(obj[i][columns[j]])
          row.append(cell)
        } else if (columns[j] == 'birth') {
          cell.html(obj[i][columns[j]].dateStr)
          row.append(cell)
          cell = $('<td />')
          cell.html(obj[i][columns[j]].place)
          row.append(cell)
        } else if (columns[j] == 'monkname') {
          cell.html(obj[i][columns[j]])
          row.append(cell)
        } else {
          //headerCell.html('N/A')
        }
        //}
      }
      if (currPerson != undefined && currPerson.pageUrl == obj[i]['pageUrl']) {
        curId = i;
      }
    }

    var getCellValue = function (tr, idx) {
      return tr.children[idx].innerText || tr.children[idx].textContent
    }

    var comparer = function (idx, asc) {
      return function (a, b) {
        return (function (v1, v2) {
          return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2)
            ? v1 - v2
            : v1.toString().localeCompare(v2)
        })(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx))
      }
    }

    // do the work...
    Array.prototype.slice
      .call(document.querySelectorAll('th'))
      .forEach(function (th) {
        th.addEventListener('click', function () {
          var table = th.parentNode
          while (table.tagName.toUpperCase() != 'TABLE')
            table = table.parentNode
          Array.prototype.slice
            .call(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(
              comparer(
                Array.prototype.slice.call(th.parentNode.children).indexOf(th),
                (this.asc = !this.asc)
              )
            )
            .forEach(function (tr) {
              table.appendChild(tr)
            })
        })
      })

    var thisThis = this

    document.querySelectorAll('#' + this.idTable + ' tr').forEach((e) =>
      e.addEventListener('click', function () {
        thisThis.rowTableClickHandler(thisThis, this)
      })
    )

    if (currPerson != undefined) {
      var str = '#' + curId;
      $(str).click();
    } else {
      $('#0').click();
    }
  }

  fillTable(currPerson) {
    if (this.data == null) {
      console.log('data empty')
    } else {
      this.addDataToTable(currPerson)
    }
  }
}
