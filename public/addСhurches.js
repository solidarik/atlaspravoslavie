export default class addСhurches {
  constructor(idTable, data) {
    this.idTable = idTable
    this.data = data
  }

  clearTable() {
    var dvTable = $('#' + this.idTable)
    dvTable.html('')
  }

  rowTableClickHandler(thisThis, thisTr) {
    //console.log("clicked " + $(thisTr).attr('id'));
    var _id = $(thisTr).attr('id');
    var cur = thisThis.data.temples[_id];
    //console.log(cur);
    $('#name').html(
      cur.name
    )
    $('#startDateStr').html(
      '<b>Дата основания</b> - ' +
      cur.startDateStr
    )
    $('#place').html(
      '<b>Место расположения</b> - ' + cur.placet
    )
    $('#eparchyUrl').html(
      '<b>Епархия</b> - ' +
      " <a target='_blank' rel='noopener noreferrer' href='" +
      cur.eparchyUrl +
      "'>" +
      'Перейти</a>'
    )
    $('#longBrief').html(
      cur.longBrief+
      " <a target='_blank' rel='noopener noreferrer' href='" +
      cur.srcUrl +
      "'>" +
      'Подробнее...</a>'
    )

    //$('#imgChurches').src = thisThis.data[id].PhotoUrl
    //$('#imgChurches').attr('src', thisThis.data[id].PhotoUrl)


    $(thisTr).addClass('event-active-row')
    $(thisTr).siblings().removeClass('event-active-row')
  }

  addDataToTable() {
    //console.log("addDataTotable");
    //console.log(JSON.stringify(this.data));
    var obj = this.data.temples;
    this.clearTable()
    var table = $('#' + this.idTable)
    //table[0].border = "1";
    var columns = Object.keys(obj[0])
    var columnCount = columns.length
    var row = $(table[0].insertRow(-1))
    for (var i = 0; i < columnCount; i++) {
      if (i == 5 || i == 7 || i == 8 ) {
        var headerCell = $('<th />')
        if (columns[i] == 'name') {
          headerCell.html('Название')
        } else if (columns[i] == 'startDateStr') {
          headerCell.html('Основание')
        } else if (columns[i] == 'place') {
          headerCell.html('Расположение')
        } else {
          headerCell.html('N/A')
        }
        row.append(headerCell)
      }
    }

    for (var i = 0; i < obj.length; i++) {
      row = $(table[0].insertRow(-1))
      row.addClass('hand-cursor')
      row.attr('id', i)
      for (var j = 0; j < columnCount; j++) {
        if (j == 5 || j == 7 || j == 8) {
          var cell = $('<td />')
          cell.html(obj[i][columns[j]])
          row.append(cell)
        }
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

    $('#churches-table tr:eq(0) td:first-child span').click()
    $('#0').trigger('click')
  }

  fillTable() {
    //console.log("fillTable");
    if (this.data == null) {
      console.log('data empty')
    } else {
      this.addDataToTable()
    }
  }
}
