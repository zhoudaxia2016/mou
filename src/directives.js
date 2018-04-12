import Watcher from './watcher'
import compile from './compile'

let directives = {}

// m-show指令
directives['m-show'] = {

  callback (node, arg, value, data) {

    let code = 'with(data){return ' + value + ';}';
    var fn = new Function('data',code);

    new Watcher(function(){
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
      new Watcher(() => fn(node, data))
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
    new Watcher(() => fn(node, parent, data, next, compile))
  }
}

export default directives
