import ClientProtocol from '../public-src/clientProtocol.js'
import EventEmitter from '../public-src/eventEmitter.js'
import DateHelper from '../helper/dateHelper.js'

export default class addTemples extends EventEmitter {

  constructor(idTable, data) {
    super() //first must
    this.idTable = idTable
    this.data = data

    this.protocol = ClientProtocol.create()
    this.protocol.subscribe('onGetTempleItem', (item) => this.showItem(item))

    window.setActiveElement = (elem, b) => {
      const c = 'hover-on-text'
      if (!elem) return
      b
        ? elem.parentElement.classList.add(c)
        : elem.parentElement.classList.remove(c)
    }
  }

  showItem(item) {

    const cur = item

    $('#name').html(
      cur.name
    )
    $('#start').html(
      '<b>Дата основания</b> - ' +
      DateHelper.ymdToStr(cur.start)
    )
    $('#place').html(
      '<b>Место расположения</b> - ' + cur.place
    )
    $('#city').html(
      '<b>Город расположения</b> - ' + cur.city
    )
    $('#dedicated').html(
      '<b>Кому посвящен</b> - ' + cur.dedicated
    )
    $('#eparchyUrl').html(
      '<b>Епархия</b> - ' +
      " <a target='_blank' rel='noopener noreferrer' href='" +
      cur.eparchyUrl +
      "'>" +
      'Перейти</a>'
    )
    $('#longBrief').html(
      cur.longBrief +
      " <a target='_blank' rel='noopener noreferrer' href='" +
      cur.srcUrl +
      "'>" +
      'Подробнее...</a>'
    )

    let imgCount = cur.imgUrls.length;

    let elm = document.getElementById('image-cont');
    elm.innerHTML = '';
    let elemSC = document.createElement('div');
    elemSC.classList.add("slideshow-container");
    elm.appendChild(elemSC);

    for (let index = 0; index < cur.imgUrls.length; index++) {
      let elemMS = document.createElement('div');
      elemMS.classList.add("mySlides");
      elemMS.classList.add("fade");
      elemSC.appendChild(elemMS);
      let elemNT = document.createElement('div');
      elemNT.classList.add("numbertext");
      elemNT.innerHTML = index + ' / ' + imgCount;
      let img = document.createElement('img');
      img.classList.add("image-center");
      img.classList.add("img-rounded");
      img.classList.add("resized-image");
      img.src = cur.imgUrls[index];
      elemMS.appendChild(img);
    }

    let al = document.createElement('a');
    al.classList.add("prev");
    al.innerHTML = '&#10094;';
    al.onclick = function () { window.plusSlides(-1) };
    elemSC.appendChild(al);

    let ar = document.createElement('a');
    ar.classList.add("next");
    ar.innerHTML = '&#10095;';
    ar.onclick = function () { window.plusSlides(1) };
    elemSC.appendChild(ar);

    let elemBR = document.createElement('div');
    elemBR.classList.add("w-100");
    //<div class="w-100"></div>
    elm.appendChild(elemBR);

    let elemDD = document.createElement('div');
    elemDD.style = "margin-left: auto; margin-right: auto;"
    elm.appendChild(elemDD);

    for (let index = 0; index < imgCount; index++) {
      let elemD = document.createElement('span');
      elemD.classList.add("dot");
      elemD.onclick = function () { window.currentSlide(index + 1) };
      elemDD.appendChild(elemD);
    }

    window.showSlides(1);

    $(window.thisTr).addClass('event-active-row')
    $(window.thisTr).siblings().removeClass('event-active-row')
  }

  clearTable() {
    var dvTable = $('#' + this.idTable)
    dvTable.html('')
  }

  rowTableClickHandler(thisThis, thisTr) {
    var _id = $(thisTr).attr('id');

    if (!_id) return

    var cur = thisThis.data[_id];
    window.currentTr = thisTr
    this.protocol.getTempleItem(cur._id)
  }

  addDataToTable(currTemple) {
    var obj = this.data;

    this.clearTable();
    var table = $('#' + this.idTable);
    //table[0].border = "1";

    var row = $(table[0].insertRow(-1))
    const applyColumns = {
      'name': 'Название',
      'start': 'Дата основания',
      'place': 'Расположение',
      'city': 'Город',
      'dedicated': 'Кому посвящен'
    }
    const applyColumnNames = Object.keys(applyColumns)

    for (var i = 0; i < applyColumnNames.length; i++) {
      const columnName = applyColumnNames[i]
      const columnCaption = applyColumns[columnName]
      let headerCell = $('<th />')
      headerCell.html(columnCaption)
      row.append(headerCell)
    }

    var curId = -1;
    for (var i = 0; i < obj.length; i++) {
      row = $(table[0].insertRow(-1))
      row.addClass('hand-cursor')
      row.attr('id', i)
      for (var j = 0; j < applyColumnNames.length; j++) {
        const columnName = applyColumnNames[j]
        let columnValue = obj[i][columnName]
        let cell = $(`<td
          onmouseenter="window.setActiveElement(this, true);"
          onmouseleave="window.setActiveElement(this, false);">
        />`)
        if (columnName == 'start') {
          columnValue = DateHelper.ymdToStr(columnValue)
        }
        cell.html(columnValue)
        row.append(cell)
      }
      // console.log(currTemple);
      if (currTemple != undefined && currTemple.pageUrl == obj[i]['pageUrl']) {
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

    //$('#temples-table tr:eq(0) td:first-child span').click()
    if (currTemple != undefined) {
      var str = '#' + curId;
    } else {
      $('#0').click();
    }

    //$('#0').trigger('click')
  }

  fillTable(currTemple) {
    //console.log("fillTable");
    if (this.data == null) {
      console.log('data empty')
    } else {
      this.addDataToTable(currTemple)
    }
  }
}
