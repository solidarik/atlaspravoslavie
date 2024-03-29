"use strict";
import addHolyPersons from './addHolyPersons.js';
window.app = {};
var app = window.app;
var slideIndex = 1;

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function (callback/*, thisArg*/) {

    var T, k;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = arguments[1];
    }

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat while k < len.
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator.
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c.
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined.
  };
}

if (!Object.getOwnPropertyDescriptor(NodeList.prototype, 'forEach')) {
  Object.defineProperty(NodeList.prototype, 'forEach', Object.getOwnPropertyDescriptor(Array.prototype, 'forEach'));
}

function startApp() {
  var persons = window.state.persons;
  var person = window.state.person;
  var holyPersons = new addHolyPersons("persons-table", persons);
  holyPersons.clearTable();
  window.showSlides = showSlides
  window.plusSlides = plusSlides
  window.currentSlide = currentSlide

  if (persons && persons.length > 0) {
    holyPersons.fillTable(person);
  } else {
    $('#persons-info-container').hide()
    holyPersons.showItem(person)
  }
}

$(document).ready(function () {

  $('#collapse-person-button').on('click', function () {
    if ($('#collapse-person-button').children().hasClass('mdi-chevron-double-up')) {
      $('#collapse-person-button').children().removeClass('mdi-chevron-double-up').addClass('mdi-chevron-double-down');
    }
    else if ($('#collapse-person-button').children().hasClass('mdi-chevron-double-down')) {
      $('#collapse-person-button').children().removeClass('mdi-chevron-double-down').addClass('mdi-chevron-double-up');
    }
  });
});

// Next/previous controls
function plusSlides(n) {
  // console.log('plusSlides, n=' + n);
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  // console.log('currentSlide,n=' + n);
  showSlides(slideIndex = n);
}

function showSlides(n) {
  // console.log(n);
  var i;
  var slides = document.getElementsByClassName("mySlides");
  if (!slides.length) return
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) { slideIndex = 1 }
  else if (n < 1) { slideIndex = slides.length }
  else { slideIndex = n }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
    slides[i].className = slides[i].className.replace(" show", "");
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active-slide", "");
  }
  slides[slideIndex - 1].style.display = "block";
  slides[slideIndex - 1].className += " show";
  dots[slideIndex - 1].className += " active-slide";
}

function addEvent(evnt, elem, func) {
  if (elem.addEventListener)  // W3C DOM
  {
    elem.addEventListener(evnt, func, false);
    //console.log('addeventlistener');
  }
  else if (elem.attachEvent) { // IE DOM
    elem.attachEvent("on" + evnt, func);
    //console.log('attackEvent');
  }
  else { // No much to do
    elem["on" + evnt] = func;
  }
}

addEvent('load', window, startApp);