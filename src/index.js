import Mou from './mou.js'

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
    minus: function(n,e){this.number -= n;},
  },
}
var mou = new Mou(options);
mou.data.title = 'title'
mou.data.ok = true
mou.data.get = () => 'Bad!'
mou.data.add = function(){
  this.number += 5;
}

