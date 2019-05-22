import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const home = () => import('@/components/common/Home.vue');
const config = () => import('@/components/page/Config.vue');
const costing = () => import('@/components/page/Costing.vue');
const income = () => import('../components/page/Income.vue');
const landTax = () => import('@/components/page/LandTax.vue');

export default new Router({
  routes: [
    {
      path: '/',
      component: home,
      name: "home",
      redirect: '/income',
      children: [
        {
          path: '/costing',
          name: "costing",
          component: costing
        },
        {
          path: '/config',
          name: "config",
          component: config
        },
        {
          path: '/income',
          name: "income",
          component: income
        },
        {
          path: '/landTax',
          name: "landTax",
          component: landTax
        }
      ]
    }
  ]
})
