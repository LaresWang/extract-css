import VueI18n from 'vue-i18n';
import Vue from 'vue';

import zhCN from './zhCn';
import enUS from './enUs';
import enLocale from 'element-ui/lib/locale/lang/en';
import zhLocale from 'element-ui/lib/locale/lang/zh-CN';
import ElementLocale from 'element-ui/lib/locale';
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: localStorage.lang ? localStorage.lang : 'zh-cn', // 设置语言 
  fallbackLocale: 'en-us',
  messages: {
    'zh-cn': {
      ...zhCN,
      ...zhLocale
    },
    'en-us': {
      ...enUS,
      ...enLocale
    }
  }
});
ElementLocale.i18n((key, value) => i18n.t(key, value));

export default i18n;
