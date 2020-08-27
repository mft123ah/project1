import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router'
import './assets/css/global.css'
import axios from 'axios'
//配置根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$axios = axios;
Vue.use(ElementUI);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
