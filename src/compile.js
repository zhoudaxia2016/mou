import Watcher from './watcher'
import directives from './directives.js'

export default function compile(node,data){
  /**
   * 模板编译函数
   * 
   * @param {Node} node
   * @param {Object} data
   */


  // 编译指令
  compileDirectives(node, data)

  // 遍历所有子节点
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

      if (name in directives) {
	let cb = directives[name].callback
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
  new Watcher(function(){node.nodeValue = fn(data);});
}

