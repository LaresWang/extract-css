import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';

import common from './modules/common';
import chat from './modules/chat';
import search from './modules/search';
import payment from './modules/payment';
import activetyAssistant from './modules/activetyAssistant';
import sessionAt from './modules/sessionAt';
// import newChat from './modules/newChat';

Vue.use(Vuex);

// const debug = process.env === 'development';
// const debug = process.env.NODE_ENV !== 'production';
const debug = false;

export default new Vuex.Store({
  state: common,
  modules: {
    common,
    chat,
    search,
    payment,
    activetyAssistant,
    sessionAt
    // newChat,
    // product
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
});
