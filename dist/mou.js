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
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return compile; });
/* harmony import */ var _watcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./watcher */ "./src/watcher.js");
/* harmony import */ var _directives_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./directives.js */ "./src/directives.js");



function compile(node,data){
  /**
   * 模板编译函数
   * 
   * @param {Node} node
   * @param {Object} data
   */


  // 编译指令
  compileDirectives(node, data)

  // 遍历所有子节点
  if (!node.childNodes) {
    return
  }
  var nodes = [].slice.call(node.childNodes).filter(item => item.nodeType === 1 || item.nodeType === 3);
  nodes.forEach(function(child){
    // 若是元素节点，递归编译
    if (child.nodeType === 1){
      compile(child, data)
    }

    // 若元素是文本节点，编译为更新函数，保存到data对应的属性里面
    else if (child.nodeType === 3){
      compileText(child, data)
    }
  });
}

function compileDirectives (node, data) {
  let attrs = node.attributes
  if (attrs) {

    [].slice.call(attrs).forEach(attr => {

      let [name, arg] = attr.nodeName.split(':')
      let value = attr.nodeValue

      if (name in _directives_js__WEBPACK_IMPORTED_MODULE_1__["default"]) {
	let cb = _directives_js__WEBPACK_IMPORTED_MODULE_1__["default"][name].callback
	if (cb) {
	  cb(node, arg, value, data)
	}
      }
    })
  }
}

function compileText(node,data){
  /**
   * 编译文本节点
   *
   * @param {Node} node
   */

  var p = /{{([^}]*)}}/g;
  var text = node.nodeValue.replace(p,function(m,exp){
    return "`+(" + exp + ")+`";
  });

  var code = ["var tmp = '';"];
  code.push("with(data){tmp = tmp + `");
  code.push(text + "`};");
  code.push("return tmp;");
  code = code.join('');

  var fn = new Function('data',code);
  new _watcher__WEBPACK_IMPORTED_MODULE_0__["default"](function(){node.nodeValue = fn(data);});
}



/***/ }),

/***/ "./src/directives.js":
/*!***************************!*\
  !*** ./src/directives.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _watcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./watcher */ "./src/watcher.js");
/* harmony import */ var _compile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./compile */ "./src/compile.js");



let directives = {}

// m-show指令
directives['m-show'] = {

  callback (node, arg, value, data) {

    let code = 'with(data){return ' + value + ';}';
    var fn = new Function('data',code);

    new _watcher__WEBPACK_IMPORTED_MODULE_0__["default"](function(){
      let show = fn(data);
      node.style.display = show ? '' : 'none';
    })
  }
}

// m-on指令，事件绑定
directives['m-on'] = {

  callback (node, arg, value, data) {

    let p = /m-on:([^.]+)(.*)?/

    if (arg){

      let code = ['with(data){']
      code.push('node.addEventListener("')
      code.push(arg)
      code.push('",function($event){if (typeof ')
      code.push(value)
      code.push('=== "function"){')
      code.push(value)
      code.push('();}})}')
      code = code.join('')

      let fn = new Function('node','data',code)
      new _watcher__WEBPACK_IMPORTED_MODULE_0__["default"](() => fn(node, data))
    }
  }
}

// m-for指令
directives['m-for'] = {
  callback (node, arg, value, data) {
    let p = /\s*(\S+)\s+in\s+(\S+)\s*/
    let item = p.exec(value)[1]
    let list = p.exec(value)[2]

    let code = ['var list = data.' + list + ';']
    code.push('for (var z = 0,len = list.length; z < len; z ++) {')
    code.push('var newNode = node.cloneNode(true);')
    code.push('newNode.removeAttribute("m-for");')
    code.push('var oldValue = data.' + item + ';')
    code.push('data.' + item + ' = list[z];')
    code.push('compile(newNode, data);')
    code.push('data.' + item + ' = oldValue;')

    var next = node.nextElementSibling
    if (next){
      code.push('parent.insertBefore(newNode, next);}')
    }
    else {
      code.push('parent.appendChild(newNode);}')
    }

    code = code.join('')
    parent = node.parentNode
    node = node.parentNode.removeChild(node)

    let fn = new Function('node', 'parent', 'data', 'next', 'compile', code)
    new _watcher__WEBPACK_IMPORTED_MODULE_0__["default"](() => fn(node, parent, data, next, _compile__WEBPACK_IMPORTED_MODULE_1__["default"]))
  }
}

/* harmony default export */ __webpack_exports__["default"] = (directives);


/***/ }),

/***/ "./src/mou.js":
/*!********************!*\
  !*** ./src/mou.js ***!
  \********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _observe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./observe */ "./src/observe.js");
/* harmony import */ var _compile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./compile */ "./src/compile.js");
//var observe = require('./observe.js')
//var compile = require('./compile.js')




function Mou(options){
  /**
   * Mou实例对象
   *
   * @param {Object} options
   *                - {String} el
   *                - {Object} data
   *                - {Object} methods
   */

  this.el = options.el;
  for (var fn in options.methods){
    options.methods[fn] = options.methods[fn].bind(options.data);
  }
  this.data = Object.assign(options.data,options.methods);
  Object(_observe__WEBPACK_IMPORTED_MODULE_0__["default"])(this.data);
  if (this.el) {
    Object(_compile__WEBPACK_IMPORTED_MODULE_1__["default"])(document.querySelector(this.el),this.data);
  }
}

Mou.prototype.mount = function (ele) {
  Object(_compile__WEBPACK_IMPORTED_MODULE_1__["default"])(ele, this.data)
}

/* harmony default export */ __webpack_exports__["default"] = (Mou);


/***/ }),

/***/ "./src/observe.js":
/*!************************!*\
  !*** ./src/observe.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _watcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./watcher */ "./src/watcher.js");
//var Watcher = require('./watcher')


/* harmony default export */ __webpack_exports__["default"] = (function(data){
  /**
   * 遍历data，将大data所有属性设置为响应式的
   * 
   * @param {Object} data
   */

  if (data && typeof data === 'object'){
    Object.keys(data).forEach(function(key){
      defineReactive(data,key,data[key]);
    });
  }
});


function defineReactive(data,key,val){
  /**
   * 响应式属性设置的主要函数
   *
   * @param {Object} data
   * @param {String} key
   * @param {-} val
   */

  var dep = new Dep();
  Object.defineProperty(data,key,{
    enumerable: true,
    configurable: false,
    get: function(){
      if (_watcher__WEBPACK_IMPORTED_MODULE_0__["default"].tmp){
        dep.addCb(_watcher__WEBPACK_IMPORTED_MODULE_0__["default"].tmp);
      }
      return val;
    },
    set: function(newVal){
      val = newVal;
      dep.notify();
    }
  });
  if (val && typeof val === 'object'){
    Object.keys(val).forEach(function(k){
      defineReactive(val,k,val[k]);
    });
  }
}

function Dep(){
  /**
   * 保存更新函数数组
   */

  this.watchers = [];
}

Dep.prototype.notify = function(){
  /**
   * 通知更新函数更新
   */

  this.watchers.forEach(function(watcher){
    watcher.update();
  });
};

Dep.prototype.addCb = function(watcher){
  /**
   * 添加更新函数
   */

  this.watchers.push(watcher);
}


/***/ }),

/***/ "./src/watcher.js":
/*!************************!*\
  !*** ./src/watcher.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Watcher; });
function Watcher(update){
  /**
   * 监视器，通过get添加到dep
   *
   * @param {Function} update
   */

  this.update = update;
  Watcher.tmp = this;
  this.update();
  Watcher.tmp = null;
}



/***/ })

/******/ });
//# sourceMappingURL=mou.js.map