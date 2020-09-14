import Vue from 'vue';
import ElementUI from 'element-ui';
import ZkTable from 'vue-table-with-tree-grid'
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
//配置根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem('token')
      return config
})
Vue.prototype.$axios = axios;
Vue.use(ElementUI);
Vue.use(ZkTable);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
