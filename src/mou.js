//var observe = require('./observe.js')
//var compile = require('./compile.js')

import observe from './observe'
import compile from './compile'
import Watcher from './watcher'

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
  observe(options.data)

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
    compile(document.querySelector(this.el), this.data)
  }
}

Mou.prototype.mount = function (ele) {
  compile(ele, this.data)
}

function observeComputed (computed) {
  Object.keys(computed).forEach(key => {
    let value = computed[key]
    if (typeof value === 'function') {
      let updated = true
      let oldValue
      new Watcher(() => {
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

export default Mou
