import store from '@/store';
import { msg_type, getSelfUserId } from '@/utils/const';
import { ChatListUtils, contFriSize } from '@/utils';
import { v4 as uuidv4 } from 'uuid';
import { get_use_rsa } from '@/server';
import { CHAT_REST_SEND } from '@/store/types';
import Message from '@/services/message';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
const MAX_MESSAGE_LENGTH = 25000;

export default {
  async sendTxt(friendId, targetType) {
    for (let msgItem of store.state.common.transferItem) {
      let msg_id = msgItem.msgId;
      let userId = getSelfUserId();
      let targetId = '';
      if (msgItem.targetType == 1) {
        targetId = userId == msgItem.fromId ? msgItem.targetId : msgItem.fromId;
      } else {
        targetId = msgItem.targetId;
      }
      let message = new Message(targetId);
      if (msgItem.msgType == 40) {
        let hasTable = await message.hasTable();
        if (!hasTable) {
          await this.processMergeTransfer(msgItem, friendId, targetType);
          continue;
        }
      }
      let messageInfo = await message.getMessage(msg_id);
      let res = null;
      if (messageInfo && messageInfo.length > 0) {
        res = messageInfo[0];
      } else if (msgItem.msgType == 40) {
        await this.processMergeTransfer(msgItem, friendId, targetType);
        continue;
      } else {
        continue;
      }
      if (res) {
        let mesType = res.msg_type; // 1.文本 2.图片 6.文件 10.视频
        if (mesType == 25) {
          mesType = 1;
        }
        let msg_body = res.msg_body;
        let msg_text = res.text;

        // let publicKeyInfo = await this.getPublicKeyInfo(
        //   userId,
        //   friendId,
        //   targetType
        // );
        // let publicKeyVersion = publicKeyInfo[1];
        let text = msg_text;
        // if (targetType == 1) {
        //   text =
        //     mesType == msg_type["TEXT_TYPE"]
        //       ? encrypt(msg_text, publicKey)
        //       : msg_text;
        // } else if (targetType == 2) {
        //   text = msg_text;
        //   if (ChatListUtils.needCrypto(res.from_id, friendId, "2")) {
        //     text =
        //       mesType == msg_type["TEXT_TYPE"]
        //         ? Encrypt(msg_text, friendId)
        //         : msg_text;
        //   }
        // }
        if (mesType == 40) {
          msg_body = res.msg_body.replace(/"downloadFinished":true,/g, '');
          msg_body = res.msg_body.replace(/"downloadPercent":"100%",/g, '');
        }
        let msgBody = mesType == msg_type['TEXT_TYPE'] ? { text } : JSON.parse(msg_body);
        await this.POST_chat_rest_send(msgBody, msg_text, friendId, targetType, '', mesType);
      }
    }
  },

  async processMergeTransfer(msgItem, friendId, targetType) {
    let msg_body = JSON.stringify(msgItem.msgBody);
    msg_body = msg_body.replace(/"downloadFinished":true,/g, '');
    msg_body = msg_body.replace(/"downloadPercent":"100%",/g, '');
    await this.POST_chat_rest_send(JSON.parse(msg_body), '', friendId, targetType, '', 40);
  },

  async sendPostcard(friendId, targetType) {
    for (let msgItem of store.state.common.transferItem) {
      // let userId = getSelfUserId();
      let mesType = '15';
      let msg_body = msgItem;
      let msg_text = '';

      // let publicKeyInfo = await this.getPublicKeyInfo(
      //   userId,
      //   friendId,
      //   targetType
      // );
      // let publicKeyVersion = publicKeyInfo[1];
      let text = msg_text;
      let msgBody = mesType == msg_type['TEXT_TYPE'] ? { text } : msg_body;
      await this.POST_chat_rest_send(msgBody, msg_text, friendId, targetType, '', mesType);
    }
  },

  async sendShareGroup(friendId, targetType) {
    for (let msgItem of store.state.common.transferItem) {
      // let userId = getSelfUserId();
      let mesType = '1';
      let msg_body = msgItem;
      let msg_text = msgItem.text;

      // let publicKeyInfo = await this.getPublicKeyInfo(
      //   userId,
      //   friendId,
      //   targetType
      // );
      // let publicKeyVersion = publicKeyInfo[1];
      let text = msgItem.text;
      // if (targetType == 1) {
      //   text =
      //     mesType == msg_type["TEXT_TYPE"]
      //       ? encrypt(msg_text, publicKey)
      //       : msg_text;
      // } else if (targetType == 2) {
      //   text = msg_text;
      //   if (ChatListUtils.needCrypto(msgItem.id, friendId, "2")) {
      //     text =
      //       mesType == msg_type["TEXT_TYPE"]
      //         ? Encrypt(msg_text, friendId)
      //         : msg_text;
      //   }
      // }
      let msgBody = mesType == msg_type['TEXT_TYPE'] ? { text } : msg_body;
      await this.POST_chat_rest_send(msgBody, msg_text, friendId, targetType, '', mesType);
    }
  },

  async POST_chat_rest_send(msgBody, textOrigin, friendId, targetType, publicKeyVersion, msgType) {
    let uniqueCode = null;
    let reqId = uuidv4();
    if (targetType == 1) {
      uniqueCode = contFriSize(friendId, getSelfUserId());
    } else {
      uniqueCode = `GROUP@${friendId}`;
    }
    if (msgType == '6') {
      msgBody.reqId = reqId;
    }
    let params = {
      id: friendId,
      reqId,
      targetType, // 单聊1 群聊2
      targetId: friendId,
      fromType: '999',
      fromId: getSelfUserId(),
      uniqueCode,
      msgType,
      msgBody,
      msgHeader: {
        pubKey: '',
        version: '',
        msgSeqNo: 1,
        msgSeqTotal: 1,
        effectiveTime: -1,
        sourceSite: null,
        language: window.vm.$i18n.locale,
        sign: null,
        signType: null
      },
      refMsgBody: {
        fromName: JSON.parse(localStorage.userInfo).nickName,
        fromIcon: JSON.parse(localStorage.userInfo).headImg
      }
    };
    //
    if (targetType == 1) {
      let sendMessage = {
        ...params,
        refMsgBody: {
          ...params.refMsgBody
        },
        textOrigin: textOrigin
      };
      if (JSON.stringify(sendMessage).length > MAX_MESSAGE_LENGTH) {
        return 'EXCEED_MESSAGE';
      }
      await store.dispatch(CHAT_REST_SEND, sendMessage);
      await store.dispatch('ADD_LAST_MSG_LIST', sendMessage);
    } else if (targetType == 2) {
      let groupInfo = await this.findNameAndIcon(friendId);
      let sendMessage = {
        ...params,
        refMsgBody: {
          ...params.refMsgBody,
          tUrl: groupInfo.sessionIcon,
          tName: groupInfo.sessionName
        },
        textOrigin: textOrigin
      };
      if (JSON.stringify(sendMessage).length > MAX_MESSAGE_LENGTH) {
        return 'EXCEED_MESSAGE';
      }
      await store.dispatch(CHAT_REST_SEND, sendMessage);
    }
    return '';
  },

  async getPublicKeyInfo(userId, friendId, targetType) {
    if (targetType == 2) {
      return [friendId, ''];
    }
    //如果不需要加密，那么不取公钥
    if (!ChatListUtils.needCrypto(userId, friendId, 1)) {
      return ['', ''];
    }
    //从数据库中取
    let pubKeyData = await window.vm
      .$knex('t_contacts_pubkey')
      .select()
      .where('user_id', friendId);

    if (pubKeyData.length == 0) {
      let res = await get_use_rsa({
        userIds: friendId
      });
      pubKeyData = res.data;
    } else {
      return [pubKeyData[0].rsa_pub, pubKeyData[0].rsa_pub_version];
    }

    if (pubKeyData[0]) {
      return [pubKeyData[0].rsaPub, pubKeyData[0].rsaPubVersion];
    }
    return ['', ''];
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
  },

  // eslint-disable-next-line no-unused-vars
  async mergeTransfer(friendId, targetType, friendName) {
    let msgs = [];
    for (let msgItem of store.state.common.transferItem) {
      let targetId = '';
      if (msgItem.targetType == 1) {
        targetId = UserInfoUtils.getCurrentUserId() == msgItem.fromId ? msgItem.targetId : msgItem.fromId;
      } else {
        targetId = msgItem.targetId;
      }
      let message = new Message(targetId);
      let messageInfo = await message.getMessage(msgItem.msgId);
      let res = null;
      if (messageInfo) {
        res = messageInfo[0];
      } else {
        continue;
      }
      let mesType = res.msg_type; // 1.文本 2.图片 6.文件 10.视频
      if (mesType == 25) {
        mesType = 1;
      }
      let subMessage = await this.retrieveSubMessage(res);
      msgs.push(subMessage);
    }
    if (msgs) {
      msgs.sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
    }
    let title = friendName == window.vm.$t('chat_search_0005') ? '' : `${friendName}&${UserInfoUtils.getCurrentUserNickName()}`;
    let msgBody = {
      title,
      msgs
    };
    console.log(title, ' ========= ', msgBody);
    return await this.POST_chat_rest_send(msgBody, '', friendId, targetType, '', 40);
  },

  async retrieveSubMessage(message) {
    let fromName,
      fromIcon,
      vipType,
      inviteCodeType,
      userRank,
      inviteCode,
      fromId,
      timestamp,
      msgType,
      fromType,
      msgBody,
      reqId,
      msgId,
      targetId;
    fromId = message.from_id;
    timestamp = message.timestamp;
    msgType = message.msg_type;
    fromType = message.from_type;
    if (msgType == 40) {
      message.msg_body = message.msg_body.replace(/"downloadFinished":true,/g, '');
      message.msg_body = message.msg_body.replace(/"downloadPercent":"100%",/g, '');
    }
    msgBody = msgType == 1 ? { text: message.text } : JSON.parse(message.msg_body);
    if (msgType == 6) {
      msgBody.downloadFinished = false;
      msgBody.downloadPath = '';
      msgBody.downloadPercent = '';
    }
    reqId = message.req_id;
    msgId = message.msg_id;
    targetId = message.target_id;
    if (fromId == UserInfoUtils.getCurrentUserId()) {
      fromName = UserInfoUtils.getCurrentUserNickName();
      fromIcon = UserInfoUtils.getCurrentUserImg();
      vipType = UserInfoUtils.getCurrentUserInfo().vipType;
      inviteCodeType = UserInfoUtils.getCurrentUserInfo().inviteCodeType;
      userRank = UserInfoUtils.getCurrentUserInfo().userRank;
      inviteCode = UserInfoUtils.getCurrentUserInfo().inviteCode;
    }
    if (message.target_type == 1) {
      if (fromId != UserInfoUtils.getCurrentUserId()) {
        const friend = await window.vm
          .$knex('t_contacts')
          .select()
          .where('friend_id', fromId);
        fromName = friend[0].friend_nick_name;
        fromIcon = friend[0].friend_head_img;
        vipType = friend[0].vipType;
        inviteCodeType = friend[0].inviteCodeType;
        userRank = friend[0].userRank;
        inviteCode = friend[0].invite_code;
      }
    } else {
      if (fromId != UserInfoUtils.getCurrentUserId()) {
        const friend = await window.vm.$knex('t_groups_member').where({ id: message.from_id, group_id: message.target_id });
        if (friend && friend.length > 0) {
          fromName = friend[0].nick_name;
          fromIcon = friend[0].user_head_img;
          vipType = friend[0].vipType;
          inviteCodeType = friend[0].inviteCodeType;
          userRank = friend[0].userRank;
          inviteCode = friend[0].inviteCode;
        } else {
          fromName = '';
          fromIcon = '';
          vipType = 0;
          inviteCodeType = 0;
          userRank = 0;
          inviteCode = '';
        }
      }
    }
    return {
      fromName,
      fromIcon,
      vipType,
      inviteCodeType,
      userRank,
      inviteCode,
      fromId,
      timestamp,
      msgType,
      fromType,
      msgBody,
      reqId,
      msgId,
      targetId
    };
  }
};
