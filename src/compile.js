import Watcher from './watcher'
import Directives from './directives'

export default function compile (node, data) {
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

      let Directive = Directives.find(dir => dir.prototype.name === name)
      if (Directive) {
	let code = 'with (data) { return ' + value + '}'
	let fn = new Function('data', '$event', code)
	let getVal = ($event) => fn(data, $event)
	if (Directive.prototype.name === 'm-for') {
	  getVal = () => value
	}
	let directive = new Directive(node, arg, getVal, data)
	new Watcher(directive.update.bind(directive))
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
  new Watcher(() => { node.nodeValue = fn(data) })
}

