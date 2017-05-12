function assign(){
  /** 
   * 将第二个参数至最后的参数浅复制到第一个参数，然后返回它
   */

  var ret = arguments[0];
  var l = arguments.length;
  for (var i=1; i<l; i++){
    for (var key in arguments[i]){
      ret[key] = arguments[i][key];
      console.log(arguments[i][key])
    }
  }
  return ret;
}

export {assign};
