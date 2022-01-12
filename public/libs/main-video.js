/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./public/main-video.js":
/*!******************************!*\
  !*** ./public/main-video.js ***!
  \******************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n\n\nwindow.app = {};\nvar app = window.app;\nvar slideIndex = 1; // Production steps of ECMA-262, Edition 5, 15.4.4.18\n// Reference: http://es5.github.io/#x15.4.4.18\n\nif (!Array.prototype.forEach) {\n  Array.prototype.forEach = function (callback\n  /*, thisArg*/\n  ) {\n    var T, k;\n\n    if (this == null) {\n      throw new TypeError('this is null or not defined');\n    } // 1. Let O be the result of calling toObject() passing the\n    // |this| value as the argument.\n\n\n    var O = Object(this); // 2. Let lenValue be the result of calling the Get() internal\n    // method of O with the argument \"length\".\n    // 3. Let len be toUint32(lenValue).\n\n    var len = O.length >>> 0; // 4. If isCallable(callback) is false, throw a TypeError exception.\n    // See: http://es5.github.com/#x9.11\n\n    if (typeof callback !== 'function') {\n      throw new TypeError(callback + ' is not a function');\n    } // 5. If thisArg was supplied, let T be thisArg; else let\n    // T be undefined.\n\n\n    if (arguments.length > 1) {\n      T = arguments[1];\n    } // 6. Let k be 0.\n\n\n    k = 0; // 7. Repeat while k < len.\n\n    while (k < len) {\n      var kValue; // a. Let Pk be ToString(k).\n      //    This is implicit for LHS operands of the in operator.\n      // b. Let kPresent be the result of calling the HasProperty\n      //    internal method of O with argument Pk.\n      //    This step can be combined with c.\n      // c. If kPresent is true, then\n\n      if (k in O) {\n        // i. Let kValue be the result of calling the Get internal\n        // method of O with argument Pk.\n        kValue = O[k]; // ii. Call the Call internal method of callback with T as\n        // the this value and argument list containing kValue, k, and O.\n\n        callback.call(T, kValue, k, O);\n      } // d. Increase k by 1.\n\n\n      k++;\n    } // 8. return undefined.\n\n  };\n}\n\nif (!Object.getOwnPropertyDescriptor(NodeList.prototype, 'forEach')) {\n  Object.defineProperty(NodeList.prototype, 'forEach', Object.getOwnPropertyDescriptor(Array.prototype, 'forEach'));\n} //////////////////////////////////////////////////\n\n\nfunction startApp() {}\n\n$(document).ready(function () {}); /////////////////////////////////////////////////\n\nfunction addEvent(evnt, elem, func) {\n  if (elem.addEventListener) // W3C DOM\n    {\n      elem.addEventListener(evnt, func, false); //console.log('addeventlistener');\n    } else if (elem.attachEvent) {\n    // IE DOM\n    elem.attachEvent(\"on\" + evnt, func); //console.log('attackEvent');\n  } else {\n    // No much to do\n    elem[\"on\" + evnt] = func;\n  }\n}\n\naddEvent('load', window, startApp);\n\n//# sourceURL=webpack://atlaspravoslavie/./public/main-video.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./public/main-video.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;