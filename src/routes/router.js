import Vue from 'vue';
import Router from 'vue-router';

import User from '@/routes/user.js';
import Chat from '@/routes/chat.js';
import GRoute from '@/routes/g-routes.js';
import WRoute from '@/routes/w-routes.js';
import YRoute from '@/routes/y-routes.js';
Vue.use(Router);

//
const routes = [
  {
    path: '/',
    redirect: '/user/login/qrcode'
  },
  ...User,
  {
    name: 'app',
    path: '/app',
    component: () => import('@/App'),
    meta: {
      requiresAuth: true
    },
    children: [Chat, ...GRoute, ...WRoute, ...YRoute]
  }
];
const router = new Router({
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  }
});

router.beforeEach((to, from, next) => {
  // 校验登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!window.localStorage.accessToken) {
      // 用户没登陆
      location.href = '/#/user/login/qrcode';
    } else {
      // 用户登录了
      next();
    }
  } else {
    // 无需登录的页面
    next();
  }
});

export default router;
//解决vue-router在3.0版本以上重复点击报错的问题

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
