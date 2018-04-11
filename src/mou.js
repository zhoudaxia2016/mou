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
  compile(document.querySelector(this.el),this.data);
}

var options = {
  el: '#app',
  data:{
    title:'This is a title',
    content:'This is content!!!',
    number: 10,
    ok: false,
    color: ['red','blue','green', 'black'],
    fruits: {apple:'apple',banana:'banana'},
  },
  methods:{
    get: function(){return 'Great!';},
    print: function(a){return a;},
    add: function(){
      this.number ++;
    },
    minus: function(n,e){console.log(e);this.number -= n;},
  },
}

var mou = new Mou(options);

mou.data.title = 'title'
mou.data.ok = true;
mou.data.get = function(){return 'Bad!';}
mou.data.add = function(){
  this.number += 5;
}
