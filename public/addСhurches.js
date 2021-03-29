export default class addСhurches {
  constructor(idTable, data) {
    this.idTable = idTable
    this.data = data
  }

  clearTable() {
    var dvTable = $('#' + this.idTable)
    dvTable.html('')
  }

  rowTableClickHandler(thisThis, thisTr, showSlides, plusSlides, currentSlide) {
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
      '<b>Место расположения</b> - ' + cur.place
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

    //$('#imgChurches').src = '/images/temples/'+cur.pageUrl+'.jpg'
    //$('#imgChurches').attr('src', '/images/temples/'+cur.pageUrl+'.jpg')
    let imgCount = 5;

    let elm = document.getElementById('image-cont');
    elm.innerHTML = '';
    let elemSC = document.createElement('div');
    elemSC.classList.add("slideshow-container");
    elm.appendChild(elemSC);
    for (let index = 0; index <= imgCount; index++) {

      let iUFN;
      if (index > 0) {
        iUFN = 'imgUrl' + '_' + index;
      }
      else {
        iUFN = 'imgUrl';
      }
      if (cur.hasOwnProperty(iUFN)) {
        let pu;
        if (index > 0) {
          pu = cur.pageUrl + '_' + index
        } else {
          pu = cur.pageUrl;
        }
        console.log(cur[iUFN]);
        if (cur[iUFN] !== 'undefined'&&cur[iUFN]!==null&&cur[iUFN]!=='') {
          console.log('if');
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
          img.src = '/images/temples/' + pu + '.jpg';
          elemMS.appendChild(img);
        }

      }
    }
    let al = document.createElement('a');
    al.classList.add("prev");
    al.innerHTML = '&#10094;';
    al.onclick = function () { plusSlides(-1) };
    elemSC.appendChild(al);

    let ar = document.createElement('a');
    ar.classList.add("next");
    ar.innerHTML = '&#10095;';
    ar.onclick = function () { plusSlides(1) };
    elemSC.appendChild(ar);

    let elemBR = document.createElement('div');
    elemBR.classList.add("w-100");
    //<div class="w-100"></div>
    elm.appendChild(elemBR);

    let elemDD = document.createElement('div');
    elemDD.style = "margin-left: auto; margin-right: auto;"
    elm.appendChild(elemDD);

    for (let index = 0; index <= imgCount; index++) {
      let elemD = document.createElement('span');
      elemD.classList.add("dot");
      elemD.onclick = function () { currentSlide(index) };
      elemDD.appendChild(elemD);
    }

    showSlides(1);


    // $('#image-cont').html(
    //   '<!-- Slideshow container --> ' +
    //   '<div class="slideshow-container"> ' +

    //   '  <!-- Full-width images with number and caption text --> ' +
    //   '  <div class="mySlides fade"> ' +
    //   '    <div class="numbertext">1 / 3</div> ' +
    //   '    <img calss="image-center img-rounded resized-image" src="/images/temples/' + cur.pageUrl + '.jpg" > ' +
    //   '    <div class="text">Caption Text</div> ' +
    //   '  </div> ' +

    //   '  <div class="mySlides fade"> ' +
    //   '    <div class="numbertext">2 / 3</div> ' +
    //   '    <img calss="image-center img-rounded resized-image" src="/images/temples/' + cur.pageUrl + '.jpg" style="width:100%"> ' +
    //   '    <div class="text">Caption Two</div> ' +
    //   '  </div> ' +

    //   '  <div class="mySlides fade"> ' +
    //   '    <div class="numbertext">3 / 3</div> ' +
    //   '    <img calss="image-center img-rounded resized-image" src="/images/temples/' + cur.pageUrl + '.jpg" style="width:100%"> ' +
    //   '    <div class="text">Caption Three</div> ' +
    //   '  </div> ' +

    //   '  <!-- Next and previous buttons --> ' +
    //   '  <a class="prev" onclick="plusSlides(-1)">&#10094;</a> ' +
    //   '  <a class="next" onclick="plusSlides(1)">&#10095;</a> ' +
    //   '</div> ' +
    //   '<br> ' +

    //   '<!-- The dots/circles --> ' +
    //   '<div style="text-align:center"> ' +
    //   '  <span class="dot" onclick="currentSlide(1)"></span> ' +
    //   '  <span class="dot" onclick="currentSlide(2)"></span> ' +
    //   '  <span class="dot" onclick="currentSlide(3)"></span> ' +
    //   '</div> '
    // );

    $(thisTr).addClass('event-active-row')
    $(thisTr).siblings().removeClass('event-active-row')


  }

  addDataToTable(showSlides, plusSlides, currentSlide) {
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
      //if (i == 5 || i == 7 || i == 8 )
      {
        if (columns[i] == 'name') {
          var headerCell = $('<th />')
          headerCell.html('Название')
          row.append(headerCell)
        } else if (columns[i] == 'startYear') {
          var headerCell = $('<th />')
          headerCell.html('Основание')
          row.append(headerCell)
        } else if (columns[i] == 'place') {
          var headerCell = $('<th />')
          headerCell.html('Расположение')
          row.append(headerCell)
        } else {
          //headerCell.html('N/A')
        }

      }
    }

    for (var i = 0; i < obj.length; i++) {
      row = $(table[0].insertRow(-1))
      row.addClass('hand-cursor')
      row.attr('id', i)
      for (var j = 0; j < columnCount; j++) {
        //if (j == 5 || j == 7 || j == 8)
        if (columns[j] == 'name' || columns[j] == 'startYear' || columns[j] == 'place') {
          var cell = $('<td />')
          if (columns[j] == 'startYear' && obj[i][columns[j]] == -999) {
            cell.html(obj[i]['startCentury'] * 100 - 100)
          }
          else {
            cell.html(obj[i][columns[j]])
          }
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
        thisThis.rowTableClickHandler(thisThis, this, showSlides, plusSlides, currentSlide)
      })
    )

    $('#churches-table tr:eq(0) td:first-child span').click()
    $('#0').trigger('click')
  }

  fillTable(showSlides, plusSlides, currentSlide) {
    //console.log("fillTable");
    if (this.data == null) {
      console.log('data empty')
    } else {
      this.addDataToTable(showSlides, plusSlides, currentSlide)
    }
  }
}
