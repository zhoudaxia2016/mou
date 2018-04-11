/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/mou.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/compile.js":
/*!************************!*\
  !*** ./src/compile.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return compile; });\n/* harmony import */ var _watcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./watcher */ \"./src/watcher.js\");\n\n\nfunction compile(node,data){\n  /**\n   * 模板编译函数\n   * \n   * @param {Node} node\n   * @param {Object} data\n   */\n\n\n  // 遍历属性节点\n  var attrs = node.attributes;\n  if (attrs){\n    [].slice.call(attrs).forEach(function(attr){\n      compileDirective(node,data,attr);\n    })\n  }\n\n  // 遍历所有子节点\n  var nodes = [].slice.call(node.childNodes).filter(item => item.nodeType === 1 || item.nodeType === 3);\n  nodes.forEach(function(child){\n    // 若是元素节点，递归编译\n    if (child.nodeType === 1){\n      compile(child,data);\n    }\n\n    // 若元素是文本节点，编译为更新函数，保存到data对应的属性里面\n    else if (child.nodeType === 3){\n      compileText(child,data);\n    }\n  });\n}\n\nfunction compileText(node,data){\n  /**\n   * 编译文本节点\n   *\n   * @param {Node} node\n   */\n\n  var p = /{{([^}]*)}}/g;\n  var text = node.nodeValue.replace(p,function(m,exp){\n    return \"`+(\" + exp + \")+`\";\n  });\n\n  var code = [\"var tmp = '';\"];\n  code.push(\"with(data){tmp = tmp + `\");\n  code.push(text + \"`};\");\n  code.push(\"return tmp;\");\n  code = code.join('');\n\n  var fn = new Function('data',code);\n  new _watcher__WEBPACK_IMPORTED_MODULE_0__[\"default\"](function(){node.nodeValue = fn(data);});\n}\n\nfunction compileDirective(node,data,prop){\n  if (/^m-show$/.test(prop.nodeName)){\n    compileSHOW(node,data,prop);\n  }\n  else if (/^m-on/.test(prop.nodeName)){\n    compileOn(node,data,prop);\n  }\n  else if (/^m-for/.test(prop.nodeName)){\n    compileFor(node,data,prop);\n  }\n}\n\nfunction compileSHOW(node,data,prop){\n  var value = prop.nodeValue;\n  var code = 'with(data){return ' + value + ';}';\n  var fn = new Function('data',code);\n  new _watcher__WEBPACK_IMPORTED_MODULE_0__[\"default\"](function(){\n    var show = fn(data);\n    node.style.display = show ? '' : 'none';\n  });\n}\n\nfunction compileOn(node,data,prop){\n  var p = /m-on:([^.]+)(.*)?/;\n  var match = p.exec(prop.nodeName);\n  var event;\n  if (match && (event = match[1])){\n    var value = prop.nodeValue;\n    var code = ['with(data){'];\n    code.push('node.addEventListener(\"');\n    code.push(event);\n    code.push('\",function($event){if (typeof ');\n    code.push(value);\n    code.push('=== \"function\"){');\n    code.push(value);\n    code.push('();}})}');\n    code = code.join('');\n    var fn = new Function('node','data',code)\n    new _watcher__WEBPACK_IMPORTED_MODULE_0__[\"default\"](function(){\n      fn(node,data);\n    });\n  }\n}\n\nfunction compileFor(node,data,prop){\n  var value = prop.nodeValue;\n  var p = /\\s*(\\S+)\\s+in\\s+(\\S+)\\s*/;\n  var item = p.exec(value)[1];\n  var list = p.exec(value)[2];\n  var code = ['var list = data.' + list + ';'];\n  code.push('for (var z = 0,len = list.length; z < len; z ++) {');\n  code.push('var newNode = node.cloneNode(true);');\n  code.push('newNode.removeAttribute(\"m-for\");');\n  code.push('var oldValue = data.' + item + ';');\n  code.push('data.' + item + ' = list[z];');\n  code.push('compile(newNode,data);');\n  code.push('data.' + item + ' = oldValue;');\n  var next = node.nextElementSibling;\n  if (next){\n    code.push('parent.insertBefore(newNode,next);}');\n  }\n  else {\n    code.push('parent.appendChild(newNode);}');\n  }\n  code = code.join('');\n  parent = node.parentNode;\n  node = node.parentNode.removeChild(node);\n  var fn = new Function('node','parent','data','next','compile',code);\n  new _watcher__WEBPACK_IMPORTED_MODULE_0__[\"default\"](function(){\n    fn(node,parent,data,next,compile);\n  });\n}\n\n\n//# sourceURL=webpack:///./src/compile.js?");

/***/ }),

/***/ "./src/mou.js":
/*!********************!*\
  !*** ./src/mou.js ***!
  \********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _observe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./observe */ \"./src/observe.js\");\n/* harmony import */ var _compile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./compile */ \"./src/compile.js\");\n//var observe = require('./observe.js')\n//var compile = require('./compile.js')\n\n\n\n\nfunction Mou(options){\n  /**\n   * Mou实例对象\n   *\n   * @param {Object} options\n   *                - {String} el\n   *                - {Object} data\n   *                - {Object} methods\n   */\n\n  this.el = options.el;\n  for (var fn in options.methods){\n    options.methods[fn] = options.methods[fn].bind(options.data);\n  }\n  this.data = Object.assign(options.data,options.methods);\n  Object(_observe__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(this.data);\n  Object(_compile__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(document.querySelector(this.el),this.data);\n}\n\nvar options = {\n  el: '#app',\n  data:{\n    title:'This is a title',\n    content:'This is content!!!',\n    number: 10,\n    ok: false,\n    color: ['red','blue','green', 'black'],\n    fruits: {apple:'apple',banana:'banana'},\n  },\n  methods:{\n    get: function(){return 'Great!';},\n    print: function(a){return a;},\n    add: function(){\n      this.number ++;\n    },\n    minus: function(n,e){console.log(e);this.number -= n;},\n  },\n}\n\nvar mou = new Mou(options);\n\nmou.data.title = 'title'\nmou.data.ok = true;\nmou.data.get = function(){return 'Bad!';}\nmou.data.add = function(){\n  this.number += 5;\n}\n\n\n//# sourceURL=webpack:///./src/mou.js?");

/***/ }),

/***/ "./src/observe.js":
/*!************************!*\
  !*** ./src/observe.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _watcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./watcher */ \"./src/watcher.js\");\n//var Watcher = require('./watcher')\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (function(data){\n  /**\n   * 遍历data，将大data所有属性设置为响应式的\n   * \n   * @param {Object} data\n   */\n\n  if (data && typeof data === 'object'){\n    Object.keys(data).forEach(function(key){\n      defineReactive(data,key,data[key]);\n    });\n  }\n});\n\n\nfunction defineReactive(data,key,val){\n  /**\n   * 响应式属性设置的主要函数\n   *\n   * @param {Object} data\n   * @param {String} key\n   * @param {-} val\n   */\n\n  var dep = new Dep();\n  Object.defineProperty(data,key,{\n    enumerable: true,\n    configurable: false,\n    get: function(){\n      if (_watcher__WEBPACK_IMPORTED_MODULE_0__[\"default\"].tmp){\n        dep.addCb(_watcher__WEBPACK_IMPORTED_MODULE_0__[\"default\"].tmp);\n      }\n      return val;\n    },\n    set: function(newVal){\n      val = newVal;\n      dep.notify();\n    }\n  });\n  if (val && typeof val === 'object'){\n    Object.keys(val).forEach(function(k){\n      defineReactive(val,k,val[k]);\n    });\n  }\n}\n\nfunction Dep(){\n  /**\n   * 保存更新函数数组\n   */\n\n  this.watchers = [];\n}\n\nDep.prototype.notify = function(){\n  /**\n   * 通知更新函数更新\n   */\n\n  this.watchers.forEach(function(watcher){\n    watcher.update();\n  });\n};\n\nDep.prototype.addCb = function(watcher){\n  /**\n   * 添加更新函数\n   */\n\n  this.watchers.push(watcher);\n}\n\n\n//# sourceURL=webpack:///./src/observe.js?");

/***/ }),

/***/ "./src/watcher.js":
/*!************************!*\
  !*** ./src/watcher.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Watcher; });\nfunction Watcher(update){\n  /**\n   * 监视器，通过get添加到dep\n   *\n   * @param {Function} update\n   */\n\n  this.update = update;\n  Watcher.tmp = this;\n  this.update();\n  Watcher.tmp = null;\n}\n\n\n\n//# sourceURL=webpack:///./src/watcher.js?");

/***/ })

/******/ });