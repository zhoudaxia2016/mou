import Watcher from './watcher'

export default function compile(node,data){
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
  if (!node.childNodes) {
    return
  }
  var nodes = [].slice.call(node.childNodes).filter(item => item.nodeType === 1 || item.nodeType === 3);
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
