import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../homepage.vue')
  },
]

const router = new VueRouter({
  mode:'hash',
  routes
})

export default router
