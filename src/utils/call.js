import store from '@/store';
import { v4 as uuidv4 } from 'uuid';
import { contFriSize } from '@/utils';
import { CHAT_REST_SEND } from '@/store/types';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import { getCurrentTime } from '@/utils';
import SQLUtils from '@/components/db/sqlite.js';

export default {
  // fromType = 701
  async sendCall(friendInfo, roomId, time = 0) {
    console.log('fromType = 701 friendInfo ======= ', friendInfo);
    let msgBody = {
      name: `${UserInfoUtils.getCurrentUserInfo().nickName}、${friendInfo.name}`,
      time,
      roomId
    };
    let users = [
      {
        id: UserInfoUtils.getCurrentUserInfo().id,
        name: UserInfoUtils.getCurrentUserInfo().nickName,
        url: UserInfoUtils.getCurrentUserInfo().headImg,
        status: 1
      },
      {
        id: friendInfo.id,
        name: friendInfo.name,
        url: friendInfo.url,
        status: 0
      }
    ];

    let refMsgBody = {
      fromName: UserInfoUtils.getCurrentUserInfo().nickName,
      fromIcon: UserInfoUtils.getCurrentUserInfo().headImg,
      users
    };
    await this.POST_chat_rest_send(msgBody, refMsgBody, friendInfo.id, 1, 701, 11);
  },

  // fromType = 700
  async noNetworkCall(friendInfo, roomId, time = 0) {
    await this.audioCallHandle(friendInfo, time, roomId, 700);
  },

  // fromType = 702
  async acceptCall(friendInfo, roomId, time = 0) {
    await this.audioCallHandle(friendInfo, time, roomId, 702);
  },

  // fromType = 706
  async cancelCall(friendInfo, roomId, time = 0) {
    await this.audioCallHandle(friendInfo, time, roomId, 706);
  },

  // fromType = 704
  async leaveCall(friendInfo, roomId, time = 0) {
    await this.audioCallHandle(friendInfo, time, roomId, 704);
  },

  // fromType = 703
  async refuseCall(friendInfo, roomId, time = 0) {
    await this.audioCallHandle(friendInfo, time, roomId, 703);
  },

  // fromType = 705
  async overtimeCall(friendInfo, roomId, time = 0) {
    await this.audioCallHandle(friendInfo, time, roomId, 705);
  },

  // fromType = 707
  async busyCall(friendInfo, roomId, time = 0) {
    await this.audioCallHandle(friendInfo, time, roomId, 707);
  },

  // fromType = 712
  async suspendCall(friendInfo, roomId, time = 0) {
    await this.audioCallHandle(friendInfo, time, roomId, 712);
  },

  async audioCallHandle(friendInfo, time, roomId, fromType) {
    console.log('audioCallHandle ---->', fromType);
    let msgBody = {
      name: `${UserInfoUtils.getCurrentUserInfo().nickName}、${friendInfo.name}`,
      time,
      roomId
    };
    let status = fromType == 703 || fromType == 706 ? 0 : 1;
    let refMsgBody = {
      fromName: UserInfoUtils.getCurrentUserInfo().nickName,
      fromIcon: UserInfoUtils.getCurrentUserInfo().headImg,
      users: [
        {
          id: UserInfoUtils.getCurrentUserInfo().id,
          name: UserInfoUtils.getCurrentUserInfo().nickName,
          url: UserInfoUtils.getCurrentUserInfo().headImg,
          status
        }
      ]
    };
    await this.POST_chat_rest_send(msgBody, refMsgBody, friendInfo.id, 1, fromType, 11);
  },

  async stopCall() {},

  async POST_chat_rest_send(msgBody, refMsgBody, targetId, targetType, fromType, msgType) {
    let uniqueCode = null;
    let reqId = uuidv4();
    if (!targetId) {
      return;
    }
    if (targetType == 1) {
      uniqueCode = contFriSize(targetId, UserInfoUtils.getCurrentUserId());
    } else {
      uniqueCode = `GROUP@${targetId}`;
    }
    let effectiveTime = await SQLUtils.getMsgExpireTime(targetId, '1');
    let params = {
      reqId,
      targetType,
      targetId,
      fromType,
      fromId: UserInfoUtils.getCurrentUserId(),
      uniqueCode,
      msgType,
      timestamp: new Date().getTime() + '',
      msgHeader: {
        pubKey: '',
        version: '',
        msgSeqNo: 1,
        msgSeqTotal: 1,
        effectiveTime,
        sourceSite: null,
        language: window.vm.$i18n.locale,
        sign: null,
        signType: null
      },
      msgBody,
      refMsgBody,
      sendStatus: 2,
      effectiveTime
    };
    // let roomId = msgBody.roomId;
    // if (roomId == UserInfoUtils.getCurrentUserInfo().inviteCode) {
    //   params.fromId = UserInfoUtils.getCurrentUserId();
    //   params.targetId = targetId;
    // } else {
    //   params.fromId = targetId;
    //   params.targetId = UserInfoUtils.getCurrentUserId();
    // }
    //
    console.log(`params ========${fromType}`, params, getCurrentTime());
    if (targetType == 1) {
      const single = {
        msgBody: {
          originTypePsw: false,
          ...msgBody,
          text: ''
        }
      };
      await store.dispatch(CHAT_REST_SEND, {
        ...params,
        refMsgBody: {
          ...params.refMsgBody
        },
        single: JSON.stringify(single),
        textOrigin: ''
      });
      // await store.dispatch('ADD_LAST_MSG_LIST', {
      //   ...params,
      //   refMsgBody: {
      //     ...params.refMsgBody,
      //   },
      //   single: JSON.stringify(single),
      //   textOrigin: '',
      // });
    } else if (targetType == 2) {
      let groupInfo = await this.findNameAndIcon(targetId);
      store.dispatch(CHAT_REST_SEND, {
        ...params,
        refMsgBody: {
          ...params.refMsgBody,
          tUrl: groupInfo.sessionIcon,
          tName: groupInfo.sessionName
        },
        textOrigin: ''
      });
    }
  },

  async findNameAndIcon(id) {
    let res = await window.vm
      .$knex('t_groups')
      .select('group_name as sessionName', 'group_avatar as sessionIcon')
      .where('group_id', id);
    if (res.length > 0) {
      return res[0];
    }
    return {};
  }
};
