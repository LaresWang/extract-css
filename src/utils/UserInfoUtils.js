import store from '@/store';
// const group_avatar = require('@/view/chat/images/group_avtar.png');
// const user_avatar = require('@/view/chat/images/default.png');
const group_avatar = require('@/assets/images/group_avtar.png');
const user_avatar = require('@/assets/images/default.png');
/*
所有用户信息相关的公共工具
*/

const UserInfoUtils = {
  //获取当前用户信息
  getCurrentUserInfo: function() {
    return store.state.common.userInfo;
  },
  //获取当有用户头像
  getCurrentUserImg: function() {
    return this.getCurrentUserInfo().headImg;
  },
  //获取当有用户呢称
  getCurrentUserNickName: function() {
    return this.getCurrentUserInfo().nickName;
  },
  //获取当有用户Id
  getCurrentUserId: function() {
    return this.getCurrentUserInfo().id;
  },
  //获取当前用户的私钥
  getCurrentUserPrivateKey: function() {
    return store.state.common.userPrivateKey;
  },
  /**获取最新秘钥的版本号 */
  getCurrentUserPrivateKeyLastVersion: function() {
    return store.state.common.userRsaInfo.rsaPubVersion;
  },

  //更新当前的用户信息

  // 获取用户信息

  // 更新用户信息

  // 无法get到一个有效的图片就给他默认头像
  replaceDefaultImg: function(e, type) {
    switch (type) {
    case 'group':
      e.target.src = group_avatar;
      break;
    case 'user':
      e.target.src = user_avatar;
      break;
    default:
      break;
    }
  }
};

export default UserInfoUtils;
