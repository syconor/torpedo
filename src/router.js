import Vue from 'vue'
import Router from 'vue-router'
import Torpedo from './views/torpedo.vue'
import Korabbi from './views/korabbi.vue'


Vue.use(Router)

export default new Router({
  
  routes: [
    
    {
      path: '/',
      name: 'Torpedo',
      component: Torpedo
    },
    {
      path: '/Korabbi',
      name: 'Korabbi',
      component: Korabbi
    },
    
  ]
})
