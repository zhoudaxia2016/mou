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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
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
/* harmony import */ var _directives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./directives */ "./src/directives.js");



function compile (node, data) {
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
  let nodes = [].slice.call(node.childNodes).filter(item => item.nodeType === 1 || item.nodeType === 3)
  nodes.forEach(function(child){
    // 若是元素节点，递归编译
    if (child.nodeType === 1) {
      compile(child, data)
    }

    // 若元素是文本节点，编译为更新函数，保存到data对应的属性里面
    else if (child.nodeType === 3) {
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

      let Directive = _directives__WEBPACK_IMPORTED_MODULE_1__["default"].find(dir => dir.prototype.name === name)
      if (Directive) {
	let code = 'with (data) { return ' + value + '}'
	let fn = new Function('data', '$event', code)
	let getVal = ($event) => fn(data, $event)
	if (Directive.prototype.name === 'm-for') {
	  getVal = () => value
	}
	let directive = new Directive(node, arg, getVal, data)
	new _watcher__WEBPACK_IMPORTED_MODULE_0__["default"](directive.update.bind(directive))
      }
    })
  }
}

function compileText (node, data) {
  /**
   * 编译文本节点
   *
   * @param {Node} node
   */

  let p = /{{([^}]*)}}/g
  let text = node.nodeValue.replace(p, (m, exp) => {
    return "`+(" + exp + ")+`"
  })

  let code = ["let tmp = '';"]
  code.push("with(data){tmp = tmp + `")
  code.push(text + "`};")
  code.push("return tmp;")
  code = code.join('')

  let fn = new Function('data',code)
  new _watcher__WEBPACK_IMPORTED_MODULE_0__["default"](() => { node.nodeValue = fn(data) })
}



/***/ }),

/***/ "./src/directives.js":
/*!***************************!*\
  !*** ./src/directives.js ***!
  \***************************/
/*! exports provided: default, genDirWithType, DirType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "genDirWithType", function() { return genDirWithType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DirType", function() { return DirType; });
/* harmony import */ var _compile__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./compile */ "./src/compile.js");


let dirTypes = []

// 指令类型构造函数
function DirType (name, bindFn, updateFn) {

  this.name = name

  // 若updateFn存在，则bindFn肯定存在，绑定bind
  if (updateFn) {
    this.bind = function () {
      bindFn(this.node, this.arg)
    }
  // 否则，bindFn是updateFn，没有bindFn
  } else {
    updateFn = bindFn
  }

  this.update = function () {
    updateFn(this.node, this.arg, this.getVal, this.data)
  }
}

// 由指令类型生成指令类型实例
function genDirWithType (dirType) {

  function Dir (node, arg, getVal, data) {
    this.node =node
    this.arg = arg
    this.getVal = getVal
    this.data = data

    if (this.bind) {
      this.bind()
    }
  }

  Dir.prototype = dirType

  return Dir
}

let dirType

dirType = new DirType('m-show', (node, arg, getVal, data) => {
  node.style.display = getVal() ? '' : 'none'
})

dirTypes.push(dirType)

dirType = new DirType('m-on',
  (node, arg) => {

    if (!arg) {
      throw new Error('m-on指令需要参数！')
    }
  },
  (node, arg, getVal, data) => {

    node.addEventListener(arg, $event => {

      // getVal里的匿名函数的$event参数需要传递进去
      let value = getVal($event)
      if (typeof value === 'function') {
	// 因为value是由new Function新建函数返回的，丢失了this，所以还要绑定this
	value.apply(data, [$event])
      }
    })
  }
)

dirTypes.push(dirType)

dirType = new DirType('m-for', 
  (node, arg) => {

    // 隐藏该节点。因为更新时要获取nextSibling，不能删除掉它
    node.style.display = 'none'
    node.removeAttribute('m-for')
  },
  (node, arg, getVal, data) => {

    // 获取循环对象和每项的标识符
    let value = getVal()
    let p = /\s*(\S+)\s+in\s+(\S+)\s*/
    let item = p.exec(value)[1]
    let list = data[p.exec(value)[2]]

    for (let z = 0, len = list.length; z < len; z ++) {

      // 克隆节点并编译
      let newNode = node.cloneNode(true)
      newNode.style.display = ''
      let oldVal = data[item]
      data[item] = list[z]
      Object(_compile__WEBPACK_IMPORTED_MODULE_0__["default"])(newNode, data)
      data[item] = oldVal
      
      // 插入节点
      let next = node.nextElementSibling
      if (next) {
        let a = node.parentNode.insertBefore(newNode, next)
      } else {
	let b = node.parentNode.appendChild(newNode)
      }
    }
  }
)

dirTypes.push(dirType)

let Directives = dirTypes.map(item => genDirWithType(item))

/* harmony default export */ __webpack_exports__["default"] = (Directives);



/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mou__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mou */ "./src/mou.js");


let options = {
  el: '#app',
  data:{
    title:'This is a title',
    content:'This is content!!!',
    number: 10,
    ok: false,
    color: ['red','blue','green', 'black'],
    fruits: {apple: 'apple',banana: 'banana'},
    ok: true,
    a: 'hello'
  },
  methods:{
    get: function () { return 'Great!' },
    getNumber: function () { return this.number },
    methodTestCache () {
      console.log('Execute Method')
      return this.a
    },
    add: function () {
      this.number ++
    },
    minus: function (n) { this.number -= n },
  },
  computed: {
    computedTestCache () {
      console.log('Execute computed')
      return this.a
    }
  }
}

let mou = new _mou__WEBPACK_IMPORTED_MODULE_0__["default"](options)


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
/* harmony import */ var _watcher__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./watcher */ "./src/watcher.js");
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

  this.el = options.el

  // 设置响应式数据
  Object(_observe__WEBPACK_IMPORTED_MODULE_0__["default"])(options.data)

  this.data = Object.assign(options.data, options.methods, options.computed)

  // 绑定methods的this为this.data
  for (let fn in options.methods){
    options.methods[fn] = options.methods[fn].bind(this.data)
  }
  for (let fn in options.computed){
    options.computed[fn] = options.computed[fn].bind(this.data)
  }
  observeComputed(options.computed)

  // 编译
  if (this.el) {
    Object(_compile__WEBPACK_IMPORTED_MODULE_1__["default"])(document.querySelector(this.el), this.data)
  }
}

Mou.prototype.mount = function (ele) {
  Object(_compile__WEBPACK_IMPORTED_MODULE_1__["default"])(ele, this.data)
}

function observeComputed (computed) {
  Object.keys(computed).forEach(key => {
    let value = computed[key]
    if (typeof value === 'function') {
      let updated = true
      let oldValue
      new _watcher__WEBPACK_IMPORTED_MODULE_2__["default"](() => {
	updated = true
      })
      console.log(computed, key)
      Object.defineProperty(computed, key, {
	enumerable: true,
	configurable: false,
	get () {
	  console.log(updated)
	  if (updated) {
	    let oldValue = value()
	    updated = false
	  }
	  return oldValue
	}
      })
    }
  })
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


/* harmony default export */ __webpack_exports__["default"] = (function (data) {
  /**
   * 遍历data，将大data所有属性设置为响应式的
   * 
   * @param {Object} data
   */

  if (data && typeof data === 'object'){
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
});


function defineReactive (data, key, val) {
  /**
   * 响应式属性设置的主要函数
   *
   * @param {Object} data
   * @param {String} key
   * @param {-} val
   */

  var dep = new Dep()
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: false,
    get () {
      if (_watcher__WEBPACK_IMPORTED_MODULE_0__["default"].tmp){
        dep.addCb(_watcher__WEBPACK_IMPORTED_MODULE_0__["default"].tmp)
	_watcher__WEBPACK_IMPORTED_MODULE_0__["default"].tmp = null
      }
      return val
    },
    set (newVal) {
      val = newVal
      dep.notify()
    }
  })
  if (val && typeof val === 'object'){
    Object.keys(val).forEach(k => {
      defineReactive(val, k, val[k])
    })
  }
}

function Dep () {
  /**
   * 保存更新函数数组
   */

  this.watchers = []
}

Dep.prototype.notify = function () {
  /**
   * 通知更新函数更新
   */

  this.watchers.forEach(watcher => {
    watcher.update()
  })
};

Dep.prototype.addCb = function (watcher) {
  /**
   * 添加更新函数
   */

  this.watchers.push(watcher)
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
function Watcher (update) {
  /**
   * 监视器，通过get添加到dep
   *
   * @param {Function} update
   */

  this.update = update
  Watcher.tmp = this
  this.update()
  //Watcher.tmp = null
}



/***/ })

/******/ });
//# sourceMappingURL=index.js.map