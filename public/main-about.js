"use strict";
import d3 from 'd3'

window.app = {};
var app = window.app;


$(document).ready(function () {

    var urlQuote = 'data/quote.json';

    d3.json(urlQuote, function (error, quote) {
        // console.log('data/hints.json - finish load');
        quote.sort(function () { return .5 - Math.random(); });

        $('#quote').html(quote[0].quote);
        $('#quotePerson').html(quote[0].person);
    });

});

/////////////////////////////////////////////////
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