import compile from './compile'

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
      compile(newNode, data)
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

export default Directives
export { genDirWithType, DirType }
