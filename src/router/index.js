import Vue from 'vue'
import Router from 'vue-router'
import Login from "../components/Login.vue";
import Home from '@/components/Home'
Vue.use(Router)

 const router = new Router({
    routes: [
        {path: '/', redirect: '/login'},
        {path: '/login',component: Login},
        {path: '/home',component: Home}
    ]
});
//给路由对象添加路由守卫方法，控制资源访问权限
router.beforeEach((to,from,next)=>{
    if (to.path === '/login') {
        return next();
    }else {
        //获取token
        const tokenstr = window.sessionStorage.getItem('token');
        if (!tokenstr) {
            //token不存在则跳转到登陆页面
            return next('/login');
        }else {
            //token存在则放行
            next();
        }
    }
});
export default router;