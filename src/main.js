/*
 * @Description:
 * @Author: 龙春雨
 * @Date: 2020-06-04 13:41:17
 */
import Vue from 'vue';
import Auth from './Auth.vue';
import ElementUI from 'element-ui';
import i18n from './i18n';
import store from './store/index';
import router from './routes/router';
import baseStyle from './sytles/common.less';
import VueClipboard from 'vue-clipboard2';
import index from './components/index.js';
import mixin from './mixin';
import VueQuillEditor from 'vue-quill-editor';
import "../lib/quill-mention/quill.mention"
// import Mention from "quill-mention"
// Quill.register("modules/mention", Mention, true);
import VueImageSwipe from 'vue-image-swipe';
import 'vue-image-swipe/dist/vue-image-swipe.css';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
// import "quill-mention/dist/quill.mention.css";
import { ipcRenderer, remote } from 'electron';
import { paymentId } from "./utils/const"
import Viewer from 'v-viewer';
import 'viewerjs/dist/viewer.css';
import { getConnection } from '@/knex';
// import { Model } from "objection";

import * as urls from '@/config/env';
import { loadStyle } from './utils/util';
import { iconfontUrl, iconfontVersion } from '@/config/env';
import VueCropper from 'vue-cropper';
import './utils/directives.js';
import Ws from '@/utils/ws';
import SignalProtocolStore from '@/services/signal-store.js'
const signalStore = new SignalProtocolStore();
import AsyncComputed from 'vue-async-computed';
Vue.use(AsyncComputed);
Vue.use(VueCropper);
Vue.use(VueImageSwipe);
Vue.use(VueQuillEditor);
Vue.use(index);
Vue.use(VueClipboard);
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
});
Vue.use(baseStyle);

Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 9999
  }
});

Vue.prototype.signalStore = signalStore;
Vue.prototype.$paymentId=paymentId;//DiDi Payment ID
Vue.prototype.$bus = new Vue();
// 暂时不定义多开窗口的问题
ipcRenderer.on('loginedToAddKnex', (event, arg) => {
  console.log('[已登录，发起数据库连接请求]', arg);
  const knex = getConnection(arg);
  Vue.prototype.$knex = knex;
  ipcRenderer.send('databaseIsFinished', arg);
});

ipcRenderer.on('sysResume', () => {
  if(/^\/app/.test(router.currentRoute['path'])){
    Ws.reConnect();
  }
})

if (process.env.IS_ELECTRON) {
  Vue.prototype.winControl = require('./electron/windowControl').default;
} else {
  Vue.prototype.winControl = require('./electron/webControl').default;
}

// 右键
Vue.prototype.$remote = remote;
const { Menu, MenuItem } = remote;

//日志上传
import Logan from 'logan-web';
Vue.use(Logan);
// Vue.config.errorHandler = function (err, vm, info) {
//   // handle error
//   // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
//   // 只在 2.2.0+ 可用
//   console.log('handle error')
// }
const globalRightClick = arr => {
  const menu = new Menu();
  for (let lab of arr) {
    lab.fun = lab.fun
      ? lab.fun
      : () => {
        console.log(lab.name);
      };
    lab.enabled = String(lab.enabled) ? lab.enabled : true;
    menu.append(
      new MenuItem({
        label: lab.name,
        enabled: lab.enabled,
        click: lab.fun
      })
    );
  }
  return menu;
};
Vue.prototype.$RightClick = globalRightClick;

Vue.config.productionTip = false;

// Vue.filter('timeCulmulate', timeCulmulate)
import * as custom from './filter/filters';
// 导出的是对象，可以直接通过 key 和 value 来获得过滤器的名和过滤器的方法
Object.keys(custom).forEach(key => {
  Vue.filter(key, custom[key]);
});

Vue.mixin(mixin);

// 加载相关url地址
Object.keys(urls).forEach(key => {
  Vue.prototype[key] = urls[key];
});

// 动态加载阿里云字体库
iconfontVersion.forEach(ele => {
  loadStyle(iconfontUrl.replace('$key', ele));
});
const vm = new Vue({
  router,
  i18n,
  store,
  render: h => h(Auth)
}).$mount('#app');
window.vm = vm;
