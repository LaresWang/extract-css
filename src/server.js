/*
 * @Description:
 * @Author: 龙春雨
 * @Date: 2020-06-04 13:41:17
 */
import { _GET, _POST } from '@/utils/axios';
const queryString = require('query-string');

export const check_update_by_server = params => {
  return _GET('/api/base/sys/version/get', params);
};

// 单聊设置
export const user_session_update = (data, params) => {
  return _POST('/api/contracts/api/usersession/updateUserSession', data, queryString.stringify(params));
};
// 群聊设置
export const group_session_update = (data, params) => {
  return _POST('/api/contracts/api/group/updateGroupPersonalInfo', data, queryString.stringify(params));
};

// 删除回话
export const delete_session_message = (data, params) => {
  return _POST('/api/chat/chat/rest/removeMsg', data, queryString.stringify(params));
};

export const chat_rest_send = (data, params) => {
  return _POST('/api/chat/chat/rest/send', data, queryString.stringify(params));
};

// 获取国家及其区号列表
export const base_country_list = () => _GET('api/base/area/list');

// 获取地区
export const base_area_list = params => {
  return _GET('/api/base/area/list', params);
};
// 获取国家与地区
export const get_country_area = params => {
  return _GET('/api/base/area/getAreaByCode', params);
};
// 发送邮箱验证码
export const user_send_email = params => {
  return _POST('/api/user/send/email', params);
};
// 验证码登录/注册
export const user_web_code_login = params => {
  return _POST('/api/user/web/code/login', params);
};
// 密码登录
export const user_web_login = params => {
  return _POST('/api/user/web/login', params);
};

// 密码登录v1
export const user_web_login_v1 = params => {
  return _POST('/api/user/web/loginV1', params);
};

export const user_login_web_scan_login = params => {
  return _POST('/api/user/login/webScanLogin', params);
};

export const user_login_web_scan_login_v1 = params => {
  return _POST('/api/user/login/webScanLoginV1', params);
};

// 刷新token
export const get_user_access_token_by_refresh = params => {
  return _POST('/user/refreshTokenForDidi', { ...params, requestBase: process.env.VUE_APP_AUTH_HOST});
};

// 用户退出程序
export const user_login_logout = params => {
  return _POST('/api/user/logout/PC', params);
};

// 根据msgID 查询消息详情
export const chat_rest_getMsgInfo = params => {
  return _POST('/api/chat/chat/rest/getMsgInfo', params);
};
// 发送手机验证码
export const user_send_mobile = params => {
  return _POST('/api/user/send/code/mobile', params);
};
export const get_user_info = params => {
  // 获取我的界面信息
  return _GET('/api/user/home/page/info', params);
};
// 搜素看点
export const get_search_see = params => {
  return _POST('/api/esearch/invitation/esSearchByKeyword', params);
};
// 搜个人
export const get_query_code = params => {
  return _POST('/api/contracts/api/user/queryByCode', params);
};
// 搜群
export const get_groupquery_code = params => {
  return _POST('/api/contracts/api/group/queryGroupByPara', params);
};
export const get_bind_user_info = params => {
  // 获取用户绑定信息
  return _GET('/api/user/bind/info', params);
};
export const get_friends_list = params => {
  // 好友列表
  return _POST('/api/contracts/api/friends/list', params);
};
export const get_friends_apply_list = params => {
  // 好友申请列表
  return _POST('/api/contracts/api/friendsapply/list', params);
};
export const get_use_rsa = params => {
  // 获取用户公钥接口
  return _GET('/api/user/rsa/list/get', params);
};
export const send_my_rsa = params => {
  // 发送公钥接口
  return _POST('/api/user/rsa/set', params);
};
export const chat_rest_getLastMsgs = params => {
  //已发布帖子列表
  return _POST('/api/chat/chat/rest/getLastPCMsgs', params);
};

export const get_friend_user_info = params => {
  // 获取好友信息
  return _POST('/api/contracts/api/user/info', params);
};
export const delete_friend = params => {
  // 删除好友
  return _POST('/api/contracts/api/friends/delete', params);
};
export const query_group_by_group = params => {
  // 群个人消息111111111111
  return _POST('/api/contracts/api/hot/group/queryGroupByGroupId', params);
};
export const delete_friends = params => {
  //删除好友
  return _POST('/api/contracts/api/friends/delete', params);
};
export const ser_group_member = params => {
  //查询群成员1111111111111
  return _POST('/api/contracts/api/group/queryGroupMembers', params);
};
export const upload_images_avatar = () => {
  return process.env.VUE_APP_ELECTRON ? process.env.VUE_APP_HOST + '/api/base/upload/image/head' : '/api/base/upload/image/head';
};

export const query_tl_code = () => {
  return _GET('/api/user/tlCode/queryTlCode');
};

export const set_tl_code = params => {
  return _POST('/api/user/tlCode/setTlCode', params);
};

export const set_member_notes = params => {
  return _POST('/api/contracts/api/friends/updateNotes', params);
};

export const set_user_nickname = params => {
  // 设置用户昵称
  return _POST('/api/user/set/nickname', params);
};

export const set_user_personal_sign = params => {
  // 设置用户个性签名
  return _POST('/api/user/set/personal_sign', params);
};

export const set_user_gender = params => {
  // 设置用户性别
  return _POST('/api/user/set/gender', params);
};

export const set_user_area = params => {
  // 设置用户国家城市
  return _POST('/api/user/set/userArea', params);
};

//暂时将用户警告封禁状态写为主动拉取
export const view_personal_appeal = (params) => {
  // 获取个人限制信息
  return _GET('/api/contracts/api/impeach/viewPersonalDeal', params);
};

export const user_login_data = (params) => {
  // 收集用户相关信息
  return _POST('/api/user/add/userLoginDataWeb', params);
};

/**
 * 获取大图
 * @param {
 *  id: 用户或者群组或者社区id
 * }
 * @return {
 *  {
 *    data:  string 图片地址 可能为""
 *  }
 * }
 */
export const getBigPic = (params) => {
  return _GET('/api/user/binary/getBigImgById', params);
};
