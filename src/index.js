import Mou from './mou'

let options = {
  el: '#app',
  data:{
    title:'This is a title',
    content:'This is content!!!',
    number: 10,
    ok: false,
    color: ['red','blue','green', 'black'],
    fruits: {apple: 'apple',banana: 'banana'},
    ok: true,
    a: 'hello'
  },
  methods:{
    get: function () { return 'Great!' },
    getNumber: function () { return this.number },
    methodTestCache () {
      console.log('Execute Method')
      return this.a
    },
    add: function () {
      this.number ++
    },
    minus: function (n) { this.number -= n },
  },
  computed: {
    computedTestCache () {
      console.log('Execute computed')
      return this.a
    }
  }
}

let mou = new Mou(options)
