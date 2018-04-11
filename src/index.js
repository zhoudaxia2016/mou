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

function observe(data){
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
}


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
      if (Watcher.tmp){
        dep.addCb(Watcher.tmp);
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
function compile(node,data){
  /**
   * 模板编译函数
   * 
   * @param {Node} node
   * @param {Object} data
   */


  // 遍历属性节点
  var attrs = node.attributes;
  if (attrs){
    [].slice.call(attrs).forEach(function(attr){
      compileDirective(node,data,attr);
    })
  }

  // 遍历所有子节点
  var nodes = node.childNodes;
  console.log(nodes)
  nodes.forEach(function(child){
    // 若是元素节点，递归编译
    if (child.nodeType === 1){
      compile(child,data);
    }

    // 若元素是文本节点，编译为更新函数，保存到data对应的属性里面
    else if (child.nodeType === 3){
      compileText(child,data);
    }
  });
}


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
  new Watcher(function(){node.nodeValue = fn(data);});
}

function compileDirective(node,data,prop){
  if (/^m-show$/.test(prop.nodeName)){
    compileSHOW(node,data,prop);
  }
  else if (/^m-on/.test(prop.nodeName)){
    compileOn(node,data,prop);
  }
  else if (/^m-for/.test(prop.nodeName)){
    compileFor(node,data,prop);
  }
}

function compileSHOW(node,data,prop){
  var value = prop.nodeValue;
  var code = 'with(data){return ' + value + ';}';
  var fn = new Function('data',code);
  new Watcher(function(){
    var show = fn(data);
    node.style.display = show ? '' : 'none';
  });
}

function compileOn(node,data,prop){
  var p = /m-on:([^.]+)(.*)?/;
  var match = p.exec(prop.nodeName);
  var event;
  if (match && (event = match[1])){
    var value = prop.nodeValue;
    var code = ['with(data){'];
    code.push('node.addEventListener("');
    code.push(event);
    code.push('",function($event){if (typeof ');
    code.push(value);
    code.push('=== "function"){');
    code.push(value);
    code.push('();}})}');
    code = code.join('');
    var fn = new Function('node','data',code)
    new Watcher(function(){
      fn(node,data);
    });
  }
}

function compileFor(node,data,prop){
  var value = prop.nodeValue;
  var p = /\s*(\S+)\s+in\s+(\S+)\s*/;
  var item = p.exec(value)[1];
  var list = p.exec(value)[2];
  var code = ['var list = data.' + list + ';'];
  code.push('for (var z = 0,len = list.length; z < len; z ++) {');
  code.push('var newNode = node.cloneNode(true);');
  code.push('newNode.removeAttribute("m-for");');
  code.push('var oldValue = data.' + item + ';');
  code.push('data.' + item + ' = list[z];');
  code.push('compile(newNode,data);');
  code.push('data.' + item + ' = oldValue;');
  var next = node.nextElementSibling;
  if (next){
    code.push('parent.insertBefore(newNode,next);}');
  }
  else {
    code.push('parent.appendChild(newNode);}');
  }
  code = code.join('');
  parent = node.parentNode;
  node = node.parentNode.removeChild(node);
  var fn = new Function('node','parent','data','next','compile',code);
  new Watcher(function(){
    fn(node,parent,data,next,compile);
  });
}
