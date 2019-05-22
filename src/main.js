import 'babel-polyfill';
import Vue from 'vue';
import router from './router';
import "../src/assets/common.less";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';

Vue.use(ElementUI, { size: 'mini', zIndex: 3000 });
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  render: h => h(App)
});
