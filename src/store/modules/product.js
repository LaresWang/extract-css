import { SET_PROD, SET_TICKER, SET_PLINE } from '../types';
import Vue from 'vue';

export default {
  state: {
    productList: [],
    pline: [], // [时间，收盘价]
    ticker: [] // [编码,时间,买一,卖一,开盘价,最高价,最低价,最新价,上周期收盘价格,成交量,上周期成交量,成交量加权平均价]
  },
  getters: {
    productList: state => state.productList
  },
  actions: {
    async [SET_PROD]({ commit }, params = {}) {
      commit(SET_PROD, params);
    }
  },
  mutations: {
    [SET_PROD](state, payload) {
      let index = state.ticker.findIndex(item => {
        return item[0] == payload.code;
      });
      // Vue.set(state.productList, index, payload)
      Vue.set(state.ticker, index, payload.ticker);
    },
    [SET_TICKER](state, payload) {
      Vue.set(
        state,
        'ticker',
        payload.map(item => {
          return item.data;
        })
      );
    },
    [SET_PLINE](state, payload) {
      Vue.set(
        state,
        'pline',
        payload.map(item => {
          return item.data;
        })
      );
    }
  }
};
