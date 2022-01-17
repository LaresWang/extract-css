
import store from '@/store';
import { LOGIN_OUT } from '@/store/types';
import { getCurrentTime } from '@/utils';
import { saveReport } from '@/services/uploadRecord';
import UserInfoUtils from '@/utils/UserInfoUtils.js';

export const getCurrentUserId = ()=>{
  return UserInfoUtils.getCurrentUserId();
}
  
export const getSocketUDID = async()=>{
  const uid = getCurrentUserId();
  try {
    const userInfos = await window.vm.$knex('t_userinfo').where({ id: uid});
    if (userInfos.length > 0 && userInfos[0].id) {
      return userInfos[0].udid;
    } else {
      return localStorage.getItem(uid + '-UDID');
    }
  } catch (err) {
    reportException(err)
    return localStorage.getItem(uid + '-UDID');
  }
}
  
export const logoutAndAlertMessage = async(msgType, message) => {
  // const time = getCurrentTime();
  // const logoutEnum = {
  //   '4001': `当前账号于${time}在另一台电脑上登录，若非本人操作，你的登录密码可能已经泄露，请及时修改密码`,
  //   '4004': `用户信息失效,请重新登录`,
  //   '4003': message||"服务启动异常",
  //   '4002': `访问服务器异常，请检查APP是否为最新版本`,
  //   '4006': `访问服务器异常，请检查APP是否为最新版本`,
  //   '4007': `因发布色情、暴力、种族歧视等违规消息，违反平台规则，账号已被限制登录`,
  //   '435': `DiDi密码已修改，请重新扫码登录`,
  //   '416': `你已退出DiDi`,
  //   '417': `你已退出DiDi`,
  //   '42': `${message}`,
  // };
  const time = getCurrentTime();
  const logoutEnum = {
    '4001': window.vm.$t('login_pc_0024', {time}),
    '4004': window.vm.$t('Universal_0101'),
    '4002': window.vm.$t('Universal_0155'),
    '4003': window.vm.$t('Universal_0162'),
    '4006': window.vm.$t('Universal_0155'),
    '4007': window.vm.$t('appeal_0005'),
    '435': window.vm.$t('login_pc_0025'),
    '416': window.vm.$t('login_pc_0026'),
    '417': window.vm.$t('login_pc_0026'),
    '42': `${message}`,
  };
  await store.commit(LOGIN_OUT);
  window.vm.$alert(logoutEnum[msgType] , window.vm.$t('Universal_0059'), {
    confirmButtonText: window.vm.$t('Universal_0062'),
    customClass: 'quitip',
    center: true
  });
}

export const reportException = (err)=>{
  saveReport({msg: err.message}, 2);
}

export const formatSendMessage= (message)=>{
  try{
    if (message.sendType == 'signal') {
      message['event'] = 'c.l.s.newsend';
      delete message.sendType;
    } else if (message.type != 'ws') {
      message['event'] = 'c.c.send';
      console.log('===socket 发送消息===', message);
      if (message.targetType) {
        message.targetType = Number(message.targetType);
      }
      if (message.fromType) {
        message.fromType = Number(message.fromType);
      }
      if (message.msgType) {
        message.msgType = Number(message.msgType);
      }
      if (message.msgBody) {
        message.msgBody = JSON.parse(message.msgBody);
      }
      if (message.msgHeader) {
        message.msgHeader = JSON.parse(message.msgHeader);
      }
      if (message.refMsgBody) {
        message.refMsgBody = JSON.parse(message.refMsgBody);
      }
    }
  } catch (err) {
    reportException(err);
    console.error(`socket send message err`, err);
  }
}