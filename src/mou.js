//var observe = require('./observe.js')
//var compile = require('./compile.js')

import observe from './observe'
import compile from './compile'

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
  observe(this.data);
  if (this.el) {
    compile(document.querySelector(this.el),this.data);
  }
}

Mou.prototype.mount = function (ele) {
  compile(ele, this.data)
}

export default Mou
