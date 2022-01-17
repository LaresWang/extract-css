const { ipcRenderer } = require('electron');
const log = require('electron-log');
import os from 'os';
import store from '@/store';
import {
  UPDATE_CHAT_SEND_STATUS,
  HIDE_LOADING,
  SHOW_LOADING,
  SET_LOGIN_FINISHED,
  LOGIN_FINISHED,
  WILL_SYNC_DATA,
  SYNC_DATA_PROGRESS, // 同步数据进度
  SET_USERINFO,
  SET_LOGININFO, //设置登录信息，主要为toekn
  LOGIN_OUT,
  LOGOUT,
  GET_USER_INFO,
  GET_BIND_USER_INFO,
  SET_BIND_USER_INFO,
  WEB_CODE_LOGIN,
  WEB_LOGIN,
  CHECK_LOGIN, //获取到最新的用户登录信息就更新
  USER_CHECK_LOGIN, //登录不成功时调用
  GET_FRIENDS_LIST,
  SET_FRIENDS_LIST,
  FIND_USER_RSA_INFO,
  FIND_LATEST_USER_RSA,
  SET_USER_RSA_INFO,
  SET_USER_PRIVATE_KEY,
  GET_PUB_KEY_AND_SAVE,
  UPDATE_CACHE,
  SET_TRANSFER_ITEM,
  SET_DOWNLOAD_FILE_INFO,
  SOCKET_STATUS,
  NET_STATUS,
  GET_GROUP_LIST,
  SET_GROUP_LIST,
  SET_DISCUSSION_LIST,
  SET_SCREEN_SELECT,
  SET_NO_NOTICE_SESSION,
  GET_NEW_MEG,
  SET_NEW_MESSAGE_SOUND_REMIND,
  GET_USER_SIG,
  SET_USER_SIG,
  REMOVE_ALL_LISTENERS,
  SET_AUDIO_WINDOW_DISPLAY,
  NOTIFY_UPDATE_VERSION,
  VIEW_PERSONAL_APPEAL,//获取用户限制信息
  CLEAR_PERSONAL_APPEAL,//解除用户限制信息
  UPDATE_PERSONAL_APPEAL,//离线更新用户限制信息
  IS_IN_SYNCDATA_PAGE,
  IS_SHOW_CLOSE_SYNCDATA,
  WIN_ACTIVE,
  UPDATE_MESSAGE_DISABLE
} from '../types';

import { setSelfUserId, getSelfUserId, parseUniqueCode } from '@/utils/const';
import { instance } from '@/utils/axios';
import Ws from '@/utils/ws';
import { getSyncDataStatus, updateLastModify, getMachineId } from '@/utils/index';
import { sqliteFindOne, sqliteUpsert, sqliteFind, sqliteUpdate, sqliteDelete } from '@/services/sqliteDao';
import SQLUtils from '@/components/db/sqlite.js';
import GeneratorUserSig from '@/utils/GeneratorUserSig';
import userLogin from '@/services/userLogin';
// import { versionManager } from '@/sqlite3DbVersionManager';

import {
  // user_web_login,
  user_web_login_v1,
  // user_login_web_scan_login,
  user_login_web_scan_login_v1,
  get_user_info,
  get_bind_user_info,
  user_web_code_login,
  get_use_rsa,
  user_login_logout,
  view_personal_appeal,
  user_login_data
} from '@/server';

export default {
  state: {
    loading: false,
    loginfinished: false,
    loginInfo: {},
    userInfo: {},
    bindUserInfo: {},
    discussionList:[],
    friendsList: [],
    groupList: {},
    userRsaInfo: {},
    userPrivateKey: '',
    transferItem: [],
    socketStatus: '',
    netStatus: '',
    downloadFile: {},
    screenSelect: true,
    noNoticeSessions: [],
    newMessageSoundRemind: true,
    userSig: {},
    isAudioWindowDisplay: false,
    didiServiceIcons: [],
    versionUpdateInfo: {},
    personalAppealInfo: {},//个人限制信息
    personalLoginLimitInfo: {},//个人登录限制信息
    syncDataProgress: 0,
    willSyncData: false,
    isInSyncDataPage: false,
    isShowCloseSyncData: false,
    winActive: true
  },
  getters: {
    loading: (state) => state.loading,
    loginInfo: (state) => state.userInfo,
    userInfo: (state) => state.userInfo,
    bindUserInfo: (state) => state.bindUserInfo,
    friendsList: (state) => state.friendsList,
    groupList: (state) => state.groupList,
    discussionList: (state) => state.discussionList,
    userRsaInfo: (state) => state.userRsaInfo,
    userPrivateKey: (state) => state.userPrivateKey,
    transferItem: (state) => state.transferItem,
    socketStatus: (state) => state.socketStatus,
    netStatus: (state) => state.netStatus,
    downloadFile: (state) => state.downloadFile,
    screenSelect: (state) => state.screenSelect,
    noNoticeSessions: (state) => state.noNoticeSessions,
    userSig: (state) => state.userSig,
    isAudioWindowDisplay: (state) => state.isAudioWindowDisplay,
    newMessageSoundRemind: (state) => state.newMessageSoundRemind,
    didiServiceIcons: (state) => state.didiServiceIcons,
    personalAppealInfo: (state) => state.personalAppealInfo,
    personalLoginLimitInfo: (state) => state.personalLoginLimitInfo,
    syncDataProgress: (state) => state.syncDataProgress,
    willSyncData: (state) => state.willSyncData,
    isInSyncDataPage: (state) => state.isInSyncDataPage,
    isShowCloseSyncData: (state) => state.isShowCloseSyncData,
    winActive: (state) => state.winActive,
  },

  actions: {
    async [SOCKET_STATUS]({ commit }, params = {}) {
      if (!params.socketStatus) {
        await this.dispatch(UPDATE_MESSAGE_DISABLE);
      }
      commit(SOCKET_STATUS, params);
    },
    async [NET_STATUS]({ commit }, params = {}) {
      if (!params.netStatus) {
        await this.dispatch(UPDATE_MESSAGE_DISABLE);
      }
      commit(NET_STATUS, params);
    },
    async [UPDATE_MESSAGE_DISABLE]() {
      try {
        const sendingMessageList = await sqliteFind('t_messages', {});
        if (sendingMessageList.length) {
          return;
        }
        for (let item of sendingMessageList) {
          await sqliteUpdate(`${item.tableName}`, {
            req_id: item.req_id
          }, {
            status: -1
          });
          await sqliteDelete('t_messages', { req_id: item.req_id });
          if (item.targetId == JSON.parse(localStorage.currentChat)?.id) {
            await this.dispatch(UPDATE_CHAT_SEND_STATUS, {
              ...item,
              sendStatus: -1,
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    async [WEB_LOGIN]({ commit,rootState }, params = {}) {
      try {
        let res;
        if (params.isScan) {
          const value = {
            uuid: params.uuid
          };
          if (params.googleCode) {
            value.googleCode = params.googleCode;
          }
          res = await user_login_web_scan_login_v1(value);
          if (res.data.step == 0) {
            window.vm
              .$confirm(window.vm.$t('login_pc_0017'), window.vm.$t('Universal_0059'), {
                confirmButtonText: window.vm.$t('login_pc_0006'),
                cancelButtonText: window.vm.$t('Universal_0063'),
                type: 'warning',
                customClass: 'timeOutBox'
              })
              .then(() => {
                window.vm.$router.push({
                  path: '/user/login/qrcode'
                });
              });
          }
        } else {
          res = await user_web_login_v1(params);
        }
        //如果没有token 则说明没有userid，跳转到userid选择页面
        if (!res.data.accessToken) {
          if (res.data.code == '010606' || res.data.code == '010604') {
            commit(USER_CHECK_LOGIN, {
              code: res.data.code,
              json: params
            });
            return res;
          } else {
            window.vm.$message.error(res.data.msg);
          }
          return res;
        }
        setSelfUserId(res.data.userId);
        //查询登录限制信息需要token验证故将此操作前置
        let result = Object.assign(res.data, params);
        commit(CHECK_LOGIN, result);
        //登录结束后查询用户是否存在限制登录信息
        let personalAppealInfo = await view_personal_appeal({userId:res.data.userId});
        let impeachInfo = personalAppealInfo.data.impeachInfo;
        if(personalAppealInfo.code === "200" && impeachInfo.length > 0){
          const personalLoginLimitInfo = impeachInfo.filter(item => item.limitType === 1);
          const personalAppealInfo = impeachInfo.filter(item => item.limitType === 2);
          rootState.state.personalAppealInfo = personalAppealInfo.length !== 0? personalAppealInfo[0]:{};
          rootState.state.personalLoginLimitInfo = personalLoginLimitInfo.length !== 0? personalLoginLimitInfo[0]:{};
        }else{
          rootState.state.personalAppealInfo = {}
          rootState.state.personalLoginLimitInfo = {}
        }
        //如果存在限制登录信息则弹窗拦截
        if(rootState.state.personalLoginLimitInfo.createTime){
          let time = `${rootState.state.personalLoginLimitInfo.createTime} -
          ${rootState.state.personalLoginLimitInfo.endTime}`;
          window.vm.$confirm(window.vm.$t('appeal_0004', {time}), window.vm.$t('Universal_0059'),{
            confirmButtonText: window.vm.$t('book_group_0019'),
            center: true,
            showClose: false,
            showCancelButton:false
          }).then(() => {
          }).catch(() => {
          });
          return;
        }
        
        return new Promise((resolve) => {
          ipcRenderer.send('logined', res.data.userId);
          log.info('read databaseIsFinishedToIPC', params);
          ipcRenderer.on('databaseIsFinishedToIPC', async (event, arg) => {
            console.log('可以发起数据库调用', arg);
            // let result = Object.assign(res.data, params);
            // commit(CHECK_LOGIN, result);
            await SQLUtils.deleteMessageByRealtype();
            // SQLUtils.deleteMessageByRealtype();//清除过期消息
            const syncInfos = await getSyncDataStatus(res.data.userId);
            console.log('是否扫码登录',params.isScan, '参数： ', params)
            const userIsSigns = await window.vm.$knex('t_userInfo').where({ id: res.data.userId });
            console.log('settings-->',userIsSigns);
            sessionStorage.setItem("isSign",userIsSigns?.[0]?.isSign||0)//发送消息 autoSendMessage / 可以解密消息 msgType 45
            if (userIsSigns.length && userIsSigns[0] && userIsSigns[0].isSign) {
              const userLoginFun = new userLogin(res.data.userId);
              await userLoginFun.saveTokenAndSignalData({
                refreshToken: res.data.refreshToken,
                identityData: params.identityData,
                privKey: params.privKey
              });
            } else {
              await sqliteUpsert('t_userInfo', { id: res.data.userId }, {
                refreshToken: res.data.refreshToken,
                udid: `didi.pc-${getMachineId()}`
              });
            }
            // const syncInfos = await getSyncDataStatus(res.data.userId);
            await user_login_data({
              systemType:'pc',
              systemVersion:os.version(),
              userId:rootState.state.userInfo.id,
              userName:rootState.state.userInfo.nickName,
              dataType:2,
              deviceCode:'deviceCode',
              channelName:'organic'
            });
            await this.dispatch(GET_USER_INFO);
            commit(WILL_SYNC_DATA, true);
            ipcRenderer.send('syncDataMain', syncInfos);
            setTimeout(()=>resolve(res),100);
            // if(syncInfos.isFirstLogin || syncInfos.longtermOffline){
            //   commit(WILL_SYNC_DATA, true);
            //   ipcRenderer.send('syncDataMain', syncInfos);
            //   setTimeout(()=>resolve(res),100);
            // } else {
            //   await this.dispatch(LOGIN_FINISHED, true);
            //   resolve(res);
            // }
          });
        });
      } catch (err) {
        commit(USER_CHECK_LOGIN, {
          code: err.data.code,
          json: params
        });
      }
    },
    async [WEB_CODE_LOGIN]({ commit }, params = {}) {
      try {
        let res = await user_web_code_login(params);
        ipcRenderer.send('logined', res.data.userId);
        setSelfUserId(res.data.userId);
        setTimeout(async () => {
          commit(CHECK_LOGIN, res.data);
        }, 3000);
        if (params.isRegister) {
          window.vm.$router.push({
            path: '/user/register',
            query: {
              step: 2,
              email: params.email
            }
          });
          return;
        }
        commit(CHECK_LOGIN, res.data);
        let resData = await get_user_info();
        let data = resData.data.id;
        if (localStorage.getItem(data) == null) {
          window.vm.$router.push({
            path: '/user/login/leadinkey'
          });
          return;
        }
      } catch (err) {
        commit(USER_CHECK_LOGIN, {
          code: err.data.code,
          json: params
        });
      }
    },
    async [LOGIN_FINISHED]({ dispatch, commit }) {
      console.log('============Login-finished')
      await dispatch(SET_LOGIN_FINISHED, true);
      commit(GET_USER_SIG);
    },
    async [SET_LOGIN_FINISHED]({ dispatch, commit }, params = {}) {
      // let inviteCode = rootState.state.userInfo.inviteCode;
      // if (!inviteCode) {
      //   window.vm.$router.push({
      //     path: '/user/login/invitecode'
      //   });
      // } else {
      // await dispatch('GET_LAST_MSG_LIST');//会话列表数据量级比较大时，进入会话列表空白
      dispatch('GET_LAST_MSG_LIST');//会话列表数据量级比较大时，进入会话列表空白
      this.commit(SET_LOGIN_FINISHED, params);
      commit(WILL_SYNC_DATA, false);
      console.log('WILL_SYNC_DATA=false')
      await updateLastModify();
      // }
    },
    async [GET_USER_INFO]({ commit }) {
      let res = await get_user_info();
      console.log('GET_USER_INFO', res);
      commit(SET_USERINFO, res.data);
    },
    async [GET_BIND_USER_INFO]({ commit }) {
      // 获取用户绑定邮箱，手机，google等关系
      let res = await get_bind_user_info();
      // localStorage.setItem('bind_user_info', JSON.stringify(res.data))
      commit(SET_BIND_USER_INFO, res.data);
    },
    async [GET_FRIENDS_LIST]({ commit }) {
      // 获取好友列表
      let res = await window.vm.$knex.raw(
        `select friend_id,friend_head_img,ifnull(nullif(friend_friendNotes,''),friend_nick_name) as friend_nick_name,
        invite_code, vipType, inviteCodeType, userRank from t_contacts where
        is_show = 'true' or is_show is null ORDER BY friend_nick_name`
      );
      res = res.map(a => {
        a = {
          friendAreaCityCode: a.friend_areaCountryCode,
          friendAreaCountryCode: a.friend_areaCountryCode,
          friendAttrs: a.friend_attrs,
          friendFriendNotes: a.friend_friendNotes,
          friendGender: a.friend_gender,
          friendHeadImg: a.friend_head_img,
          friendId: a.friend_id,
          friendNickName: a.friend_nick_name,
          friendPersonalSign: a.friend_personalSign,
          friendType: a.friend_type,
          friendUpdatedOn: a.friend_updatedOn,
          inviteCode: a.invite_code,
          isShow: a.is_show,
          level: a.level,
          vipType: a.vipType,
          inviteCodeType: a.inviteCodeType,
          userRank: a.userRank
        };
        return a;
      });
      commit(SET_FRIENDS_LIST, res);
    },
    async [GET_GROUP_LIST]({ commit }) {
      let ls = {};
      let dls = await window.vm
        .$knex('t_groups')
        .innerJoin('t_groups_member', function() {
          this.on('t_groups_member.group_id', '=', 't_groups.group_id');
        })
        .select('t_groups.create_time as createTime')
        .select('t_groups.group_name as groupName')
        .select('t_groups.group_avatar as groupAvatar')
        .select('t_groups.group_id as groupId')
        .select('t_groups.create_time as createdOn')
        .select('t_groups.people')
        .whereRaw("t_groups.is_show='true'")
        .whereRaw('t_groups.group_type=0')
        // .count('t_groups_member.id', { as: 'people' })
        .whereRaw(
          "t_groups_member.group_id in (SELECT m1.group_id from t_groups_member m1 where m1.id='" +
            localStorage.getItem('userId') +
            "') and t_groups_member.is_show='true'"
        )
        .groupBy('t_groups.group_id')
        .havingRaw('count(t_groups_member.id)>0')
        .orderBy('t_groups.group_name');

      ls.ownerList = await window.vm
        .$knex('t_groups')
        .innerJoin('t_groups_member', function() {
          this.on('t_groups_member.group_id', '=', 't_groups.group_id');
        })
        .select('t_groups.create_time as createTime')
        .select('t_groups.group_name as groupName')
        .select('t_groups.group_avatar as groupAvatar')
        .select('t_groups.group_id as groupId')
        .select('t_groups.create_time as createdOn')
        .select('t_groups.people')
        .whereRaw("t_groups.is_show='true'")
        .whereRaw('t_groups.group_type=1')
        // .count('t_groups_member.id', { as: 'people' })
        .whereRaw(
          "t_groups_member.group_id in (SELECT m1.group_id from t_groups_member m1 where m1.id='" +
            localStorage.getItem('userId') +
            "' and m1.auth_status=1) and t_groups_member.is_show='true'"
        )
        .groupBy('t_groups.group_id')
        .havingRaw('count(t_groups_member.id)>0')
        .orderBy('t_groups.group_name');
      ls.manageList = await window.vm
        .$knex('t_groups')
        .innerJoin('t_groups_member', function() {
          this.on('t_groups_member.group_id', '=', 't_groups.group_id');
        })
        .select('t_groups.create_time as createTime')
        .select('t_groups.group_name as groupName')
        .select('t_groups.group_avatar as groupAvatar')
        .select('t_groups.group_id as groupId')
        .select('t_groups.create_time as createdOn')
        .select('t_groups.people')
        .whereRaw("t_groups.is_show='true'")
        // .count('t_groups_member.id', { as: 'people' })
        .whereRaw(
          "t_groups_member.group_id in (SELECT m1.group_id from t_groups_member m1 where m1.id='" +
            localStorage.getItem('userId') +
            "' and m1.auth_status=2) and t_groups_member.is_show='true'"
        )
        .whereRaw('t_groups.group_type=1')
        .groupBy('t_groups.group_id')
        .havingRaw('count(t_groups_member.id)>0')
        .orderBy('t_groups.group_name');
      ls.joinList = await window.vm
        .$knex('t_groups')
        .innerJoin('t_groups_member', function() {
          this.on('t_groups_member.group_id', '=', 't_groups.group_id');
        })
        .select('t_groups.create_time as createTime')
        .select('t_groups.group_name as groupName')
        .select('t_groups.group_avatar as groupAvatar')
        .select('t_groups.group_id as groupId')
        .select('t_groups.people')
        .whereRaw("t_groups.is_show='true'")
        .whereRaw('t_groups.group_type=1')
        // .count('t_groups_member.id', { as: 'people' })
        .whereRaw(
          "t_groups_member.group_id in (SELECT m1.group_id from t_groups_member m1 where m1.id='" +
            localStorage.getItem('userId') +
            "' and m1.auth_status=3) and t_groups_member.is_show='true'"
        )
        .groupBy('t_groups.group_id')
        .havingRaw('count(t_groups_member.id)>0')
        .orderBy('t_groups.group_name');

      const compare = () => {
        return (m, n) => {
          if (m.people !== n.people) {
            return n.people - m.people;
          } else {
            return new Date(n.createTime).getTime() - new Date(m.createTime).getTime();
          }
        };
      };
      ls.ownerList.sort(compare());
      ls.manageList.sort(compare());
      ls.joinList.sort(compare());
      dls.sort(compare());
      commit(SET_GROUP_LIST, ls);
      commit(SET_DISCUSSION_LIST, dls);
    },
    async [FIND_USER_RSA_INFO]({ commit }) {
      let userId = getSelfUserId();
      let res = await get_use_rsa({
        userIds: userId
      });
      let rsaPubVersion = res.data && res.data.length > 0 ? res.data[0].rsaPubVersion : 0;
      let rsaPub = res.data && res.data.length > 0 ? res.data[0].rsaPub : '';
      let rsaPri = await SQLUtils.findPrivateKeyByVersion(userId, rsaPubVersion);
      const user_rsa_info = {
        userId,
        rsaPub,
        rsaPubVersion,
        rsaPri
      };
      commit(SET_USER_RSA_INFO, user_rsa_info);
    },
    async [FIND_LATEST_USER_RSA]({ commit }) {
      let userId = getSelfUserId();
      let rsaPri = await SQLUtils.findLatestRsaInfo(userId);
      let useRsaRes = await get_use_rsa({
        userIds: userId
      });
      if (rsaPri.length == 0) {
        window.vm.$router.push({
          path: '/user/login/leadinkey'
        });
        return;
      }
      let currentVersion = rsaPri[0].rsa_pub_version;
      let rsaPubVersion = useRsaRes.data && useRsaRes.data.length > 0 ? useRsaRes.data[0].rsaPubVersion : 0;
      if (currentVersion != rsaPubVersion) {
        window.vm.$router.push({
          path: '/user/login/leadinkey'
        });
        return;
      }
      if (rsaPri.length > 0) {
        const user_rsa_info = {
          userId: rsaPri[0].user_id,
          rsaPub: rsaPri[0].rsa_pub,
          rsaPubVersion: rsaPri[0].rsa_pub_version,
          rsaPri: rsaPri[0].rsa_pri
        };
        commit(SET_USER_RSA_INFO, user_rsa_info);
      }
    },
    async [SET_USER_PRIVATE_KEY]({ commit }, params = {}) {
      params.user_id = getSelfUserId();
      await SQLUtils.insertUserPrivateKey(params);
      const user_rsa_info = {
        userId: params.user_id,
        rsaPub: params.rsa_pub,
        rsaPubVersion: params.rsa_pub_version,
        rsaPri: params.rsa_pri
      };
      commit(SET_USER_RSA_INFO, user_rsa_info);
    },
    // eslint-disable-next-line no-unused-vars
    async [GET_PUB_KEY_AND_SAVE]({ commit }, params = {}) {
      let userId = getSelfUserId();
      let privateKey = '';
      if (params && params.privateKey) {
        privateKey = params.privateKey;
      }
      let res = await get_use_rsa({
        userIds: userId
      });
      if (res.data[0]) {
        let item = {
          rsa_pub: res.data[0].rsaPub,
          rsa_pub_version: res.data[0].rsaPubVersion,
          rsa_pri: privateKey
        };
        await this.dispatch(SET_USER_PRIVATE_KEY, item);
      }
    },
    // eslint-disable-next-line no-unused-vars
    async [UPDATE_CACHE]({ commit }, params = {}) {
      await SQLUtils.updateDbByFromType(params);
    },
    async [GET_NEW_MEG]({ rootState, commit }, params = {}) {
      let sessionName;
      let body = '';
      if (params.targetType == 1) {
        const contact = await sqliteFindOne('t_contacts', {
          friend_id: params.fromId
        });
        sessionName = contact.friend_friendNotes || contact.friend_nick_name;
      }
      if (params.targetType == 2) {
        const group = await sqliteFindOne('t_groups', {
          group_id: params.targetId
        });
        sessionName = group?.group_name;
        const friend = await sqliteFindOne('t_contacts', {
          friend_id: params.fromId
        });
        if (friend) {
          // 好友备注或者昵称
          params.fromName = friend.friend_friendNotes || friend.friend_nick_name;
        }
        if (!friend) {
          const groupMember = await sqliteFindOne('t_groups_member', {
            id: params.fromId,
            group_id: params.targetId
          });
          /*
            1、只有管理员能看到群成员备注或者昵称(auth_status<3)
            2、当前用户为普通成员非好友时显示成员昵称
          */
          // 查询当前用户在目标群组的角色
          let currentUserRoleOfGroup = await window.vm
            .$knex('t_groups_member')
            .where({ id: localStorage.getItem('userId') })
            .where('group_id', '=', params.targetId)
            .select();
          let { auth_status = 3 } = currentUserRoleOfGroup?.[0] || {};//默认普通成员
          // console.log(currentUserRoleOfGroup?.[0], auth_status, groupMember)
          let { nick_name = '', member_notes = '' } = groupMember || {};
          params.fromName = auth_status >= 3 ? nick_name : (member_notes || nick_name);
        }
        body = params.fromName + ' : ';
      }
      switch (Number(params.msgType)) {
      case 1:
      case 25:
        body += params.msgBody.text;
        break;
      case 2:
        body += window.vm.$t('chat_0013');
        break;
      case 6:
        body += window.vm.$t('chat_0017') + params.msgBody.fname;
        break;
      case 9:
        body += window.vm.$t('chat_0014');
        break;
      case 10:
        body += window.vm.$t('chat_0015');
        break;
      case 15:
        // eslint-disable-next-line no-case-declarations
        let res = '';
        if (params.msgBody.type == 1) {
          // 个人
          res = window.vm.$t('chat_0020') + params.msgBody.name;
        } else {
          // 社区
          res = window.vm.$t('chat_0022') + params.msgBody.name;
        }
        body += res;
        break;
      case 24:
        body += '撤回一条消息';
        break;
      case 40:
        body += '['+window.vm.$t('chat_0042')+']';
        break;
      case 56:
        // 领现金活动
        body +=(window.vm.$t('Universal_0454')+' '+params.msgBody.text);
        break;
      }
      const silent = rootState.state.newMessageSoundRemind;
      commit(GET_NEW_MEG, {
        ...params,
        title: sessionName,
        body,
        silent: !silent
      });
    },
    async [NOTIFY_UPDATE_VERSION]({ commit }, params = {}) {
      commit(NOTIFY_UPDATE_VERSION, params)
    },
  },
  mutations: {
    [SOCKET_STATUS](state, payload) {
      state.socketStatus = payload.socketStatus;
    },
    [SET_GROUP_LIST](state, payload) {
      state.groupList = payload;
    },
    [SET_DISCUSSION_LIST](state, payload) {
      payload.sort((obj1, obj2) => {
        let value1 = Number(obj1['people']);
        let value2 = Number(obj2['people']);
        if (value1 === value2) {
          return new Date(obj2['createdOn']).getTime() - new Date(obj1['createdOn']).getTime();
        }
        return value2 - value1;
      })
      state.discussionList = payload;
    },
    [NET_STATUS](state, payload) {
      state.netStatus = payload.netStatus;
    },
    [SHOW_LOADING](state) {
      state.loading = true;
    },
    [HIDE_LOADING](state) {
      state.loading = false;
    },
    [SET_LOGIN_FINISHED](state, payload = {}) {
      state.loginfinished = payload;
      const win = window.vm.$remote.getCurrentWindow();
      // win.setSize(0, 0); //登陆成功的过渡效果
      // setTimeout(function() {
      win.setResizable(true);
      win.setMinimumSize(830, 600);
      if (payload == true || payload == 1 || payload == 'true') {
        if(/^\/user/.test(window.vm.$route.path)){
          window.vm.$router.push('/app/chat');
          win.setSize(1000, 600); //登陆成功后改变大小
          win.center(); //窗口居中
        }
      }
      ipcRenderer.send('changeMax', true); // 登陆后可以最大化
      document.body.style.border = 'none';
      win.setSkipTaskbar(false);
      // win.setAlwaysOnTop(false)
      console.log('=========', win.getMinimumSize());
      // }, 200);
    },
    async [CHECK_LOGIN](state, payload = {}) {
      this.commit(SET_LOGININFO, payload);
    },
    [USER_CHECK_LOGIN](
      state,
      payload = {
        code: '',
        json: {}
      }
    ) {
      switch (payload.code) {
      case '010606':
        window.vm.$router.push(
          `/user/register?step=2&validCode=${payload.json.validCode}&validCodeType=
            ${payload.json.validCodeType}&loginName=${payload.json.loginName}`
        );
        break;
      case '010604':
        window.vm.$router.push({
          path: '/user/login/checking',
          query: payload.json
        });
        break;
      default:
        break;
      }
    },
    [SET_USERINFO](state, payload = {}) {
      try {
        payload.gender = payload.gender + '';
        localStorage.setItem('userInfo', JSON.stringify(payload));
        state.userInfo = payload;
      } catch (e) {
        console.error('SET_USERINFO', e);
      }
    },
    [SET_BIND_USER_INFO](state, payload = {}) {
      state.bindUserInfo = payload;
    },
    [SET_LOGININFO](state, payload = {}) {
      instance.defaults.headers['Authorization'] = payload.accessToken;
      window.localStorage.accessToken = payload.accessToken;
      window.localStorage.authToken = payload.authToken;
      window.localStorage.loginInfo = JSON.stringify(payload);
      window.localStorage.userId = payload.userId;
      localStorage.setItem(payload.userId + '-UDID', payload.UDID);
      state.loginInfo = payload;
    },
    async [LOGIN_OUT](state, isPostLoginout) {
      // 视频、文件消息上传未成功处理
      let uploadTaskInfo = window.vm.$store.state.chat.uploadTaskInfo || {};
      for (let sessionId in uploadTaskInfo) {
        for (let reqId in uploadTaskInfo[sessionId]) {
          let { Total = '', Uploaded = '' } = uploadTaskInfo[sessionId]?.[reqId]
          if (Total && Uploaded && Total > Uploaded) {
            await SQLUtils.sendMessageFail(sessionId, reqId);
          }
        }
      }

      window.vm.$store.commit('set_uploadTaskInfo', '');
      window.vm.$store.commit('set_downloadTaskInfo', '');
      // 视频、文件消息上传未成功处理

      Ws.close(false);
      if (!isPostLoginout) {
        this.commit(LOGOUT);
      }
      this.commit(REMOVE_ALL_LISTENERS);
      window.vm.$router.push('/user/login/qrcode');
      ipcRenderer.send('update-badge', [])//处理window托盘、mac通知
      setTimeout(function() {
        //退出登陆后页面缩放
        if (window.vm.$remote.getCurrentWindow().isFullScreen() && process.platform == 'darwin') {
          window.vm.$remote.getCurrentWindow().setFullScreen(false);
        }
        ipcRenderer.send('changeMax', false); // 没有登陆 禁止最大化
        ipcRenderer.send('restoreFirstSize', false); // 还原大小
      }, 400);
      await window.vm.signalStore.removeAllSessions()
    },
    async [LOGOUT](state) {
      const params = {
        Authorization: window.localStorage.getItem('accessToken'),
        deviceName: 'Windows',
        logoutType: 1,
        userId: window.localStorage.getItem('userId')
      };
      await user_login_logout(params);
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('loginInfo');
      window.localStorage.removeItem('userId');
      window.localStorage.removeItem('userInfo');
      // window.localStorage.setItem(param, userIdSecretkey)
      window.sessionStorage.removeItem('paymentId');
      // let currentChat = localStorage.getItem('currentChat');
      // let { id=0 } = currentChat ? JSON.parse(currentChat) : {};
      // if(id==window.vm.$paymentId){
      //   localStorage.removeItem('currentChat')
      // }
      window.localStorage.removeItem('currentChat');
      state.loginInfo = {};
      state.bindUserInfo = {};
      state.userInfo = {};
      state.friendsList = [];
      state.userRsaInfo = {};
      state.userPrivateKey = '';
      state.userSig = {};
      state.syncDataProgress = 0;
      state.loginfinished = false;
      state.newMessageSoundRemind = true;
      store.commit('CLEAR_CHAT_ALL');
      store.commit('SET_GROUP_MEMBER',[]);//群组成员数量级
      store.commit('CLEAR_ALL_SESSION_AT');
      if (state.isAudioWindowDisplay) {
        ipcRenderer.send('audio-window-socket-close');
      }
    },
    [SET_FRIENDS_LIST](state, payload = {}) {
      state.friendsList = payload;
    },
    [SET_USER_RSA_INFO](state, payload = {}) {
      state.userRsaInfo = payload;
      state.userPrivateKey = payload.rsaPri;
    },
    [SET_TRANSFER_ITEM](state, payload = []) {
      state.transferItem = [];
      state.transferItem = payload; //payload:[{msgid:xxxxx,fromId:xxxx}]
    },
    [SET_DOWNLOAD_FILE_INFO](state, payload = {}) {
      state.downloadFile[payload.key] = payload.value;
    },
    [SET_SCREEN_SELECT](state, payload = {}) {
      state.screenSelect = payload;
    },
    [SET_NO_NOTICE_SESSION](state, payload = {}) {
      state.noNoticeSessions = [];
      state.noNoticeSessions = payload;
    },
    [GET_NEW_MEG](state, payload) {
      if (payload.fromId != getSelfUserId()) {
        let id = parseUniqueCode(payload.uniqueCode, payload.targetType);
        let isNoNotice = state.noNoticeSessions.indexOf(id);
        if (isNoNotice < 0) {
          if (state.newMessageSoundRemind && process.platform !== 'darwin') {
            document.getElementById('noticeAudio').play();
          }
          if (
            (!window.vm.$remote.getCurrentWindow().isFocused() || window.vm.$remote.getCurrentWindow().isMinimized()) &&
            process.platform !== 'darwin'
          ) {
            window.vm.$remote.getCurrentWindow().flashFrame(true);
          }
          const notification = {
            title: payload.title,
            body: payload.body,
            silent: payload.silent,
            tag: payload.msgId
          };
          ipcRenderer.send('new-message', notification);
        }
      }
    },
    [SET_NEW_MESSAGE_SOUND_REMIND](state, payload = {}) {
      state.newMessageSoundRemind = payload;
    },
    [GET_USER_SIG]() {
      const generatorUserSig = new GeneratorUserSig();
      generatorUserSig.requestUserSig();
    },
    [SET_USER_SIG](state, payload = {}) {
      state.userSig = payload;
      console.log('SET_USER_SIG ========= ', state.userSig);
    },
    [REMOVE_ALL_LISTENERS]() {
      ipcRenderer.removeAllListeners('databaseIsFinishedToIPC');
    },
    [SET_AUDIO_WINDOW_DISPLAY](state, payload = {}) {
      state.isAudioWindowDisplay = payload;
    },
    [NOTIFY_UPDATE_VERSION](state, payload) {
      state.versionUpdateInfo = payload;
    },
    [VIEW_PERSONAL_APPEAL](state,params = {}) {
      if(params.msgBody.limitType === 2){
        state.personalAppealInfo = params.msgBody
      }else if(params.msgBody.limitType === 1){
        state.personalLoginLimitInfo = params.msgBody
      }
    },
    [UPDATE_PERSONAL_APPEAL](state,params = {}) {
      const personalLoginLimitInfo = params.filter(item => item.limitType === 1);
      const personalAppealInfo = params.filter(item => item.limitType === 2);
      state.personalAppealInfo = personalAppealInfo.length !== 0? personalAppealInfo[0]:{};
      state.personalLoginLimitInfo = personalLoginLimitInfo.length !== 0? personalLoginLimitInfo[0]:{};
    },
    [CLEAR_PERSONAL_APPEAL](state, params = {}) {
      if(params.msgBody.fromType === 430){
        state.personalAppealInfo = {}
      }else if(params.msgBody.fromType === 428){
        state.personalLoginLimitInfo = {}
      }else{
        state.personalAppealInfo = {}
        state.personalLoginLimitInfo = {}
      }
    },
    [SYNC_DATA_PROGRESS](state, payload) {
      state.syncDataProgress = payload;
    },
    [WILL_SYNC_DATA](state, payload) {
      state.willSyncData = payload;
    },
    [IS_IN_SYNCDATA_PAGE](state, payload) {
      state.isInSyncDataPage = payload;
    },
    [IS_SHOW_CLOSE_SYNCDATA](state, payload) {
      state.isShowCloseSyncData = payload;
    },
    [WIN_ACTIVE](state, payload) {
      state.winActive = payload;
    }
  },
};
