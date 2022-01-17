import { get_search_see } from '@/server';
import { GET_SEARCH_GROUP, SET_SEARCH_GROUP, GET_SEARCH_FRIENDS, SET_SEARCH_FRIENDS } from '../types';

import Vue from 'vue';
export default {
  state: {
    friends: [],
    groups: [],
    seeings: [],
    keyword: '',
    total: 0,
    seeing: false,
    membList: []
  },
  getters: {
    friends: state => state.friends,
    groups: state => state.groups,
    seeings: state => state.seeings,
    keyword: state => state.keyword,
    total: state => state.total,
    seeing: state => state.seeing,
    membList: state => state.membList
  },
  actions: {
    // async [SET_TOKEN]({ commit }, params = {}) {
    //   commit(SET_TOKEN, params);
    // }
    // 看点
    async GET_SEARCH_SEEING({ commit }, params = {}) {
      let res = await get_search_see(params);
      let arr = res.data.rows;
      let num = res.data.totalRow;
      commit('SHOW_SEEING', { arr, num });
    },
    // 群
    async [GET_SEARCH_GROUP]({ commit }, params = {}) {
      // let res = await get_groupquery_code(params)
      console.log(params);
      let res = await window.vm
        .$knex('t_groups')
        .where({})
        // .where(params)
        .select();
      // console.log("t_groups=======", res);
      commit('SET_SEARCH_GROUP', res);
    },
    // 个人
    async [GET_SEARCH_FRIENDS]({ commit }, params = {}) {
      // let res = await get_query_code(params)
      console.log(params);
      let res = await window.vm
        .$knex('t_contacts')
        .where({})
        // .where(params)
        .select();
      // console.log("t_contacts=======", res);
      commit('SET_SEARCH_FRIENDS', res);
    },
    async GET_MEM_LIST({ commit }, params) {
      let group_id = params;
      const SELECT_SQL =
        'select m.*, c.friend_id, c.friend_nick_name, c.friend_nick_name_pinyin, c.friend_head_img, ' +
        'c.friend_friendNotes, c.friend_friendNotes_pinyin ' +
        'from t_groups_member m ' +
        'left join t_contacts c on m.id = c.friend_id ' +
        "where m.group_id='" +
        group_id +
        "' order by m.auth_status, m.joinTime";
      let res = await window.vm.$knex.raw(SELECT_SQL);
      // console.warn('~~SET_GROUP_MEMBER~~')
      commit('SET_GROUP_MEMBER', res);
    }
  },
  mutations: {
    [SET_SEARCH_FRIENDS](state, payload = {}) {
      state.searchFriends = payload;
      state.friends = payload;
    },
    [SET_SEARCH_GROUP](state, payload = {}) {
      state.searchGroup = payload;
    },
    SHOW_SEEING(state, payload = {}) {
      // state.seeings = payload;
      Vue.set(state, 'seeings', payload.arr);
      Vue.set(state, 'total', payload.num);
    },
    // SHOW_GROUP(state,payload = {}) {
    //   // state.seeings = payload;
    //   Vue.set(state,'groups',payload)
    // },
    // SHOW_FRIENDS(state,payload = {}) {
    //   // state.seeings = payload;
    //   Vue.set(state,'friends',payload)
    // },
    SET_SEEING(state, payload) {
      state.seeing = payload;
    },
    SET_GROUP_MEMBER(state, payload = []) {
      if (payload.length > 0) {
        payload.map(item => {
          item.userId = item.id;
          let memberNotes = item['member_notes'] ? '['.concat(item.member_notes).concat(']') : '';
          let friendNotes = item.friend_friendNotes || '';
          let nickName = item.nick_name;
          let names = [memberNotes.concat(friendNotes), memberNotes.concat(nickName), friendNotes, nickName];
          if (friendNotes) {
            item.group_member_name = names[0];
            item.group_member_friend_name = names[2];
          } else {
            item.group_member_name = names[1];
            item.group_member_friend_name = names[3];
          }
        });
      }
      state.membList = payload;
    }
  }
};
