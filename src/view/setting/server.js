import { _GET, _POST } from '@/utils/axios';

export const upload_images_avatar = () => {
  return process.env.VUE_APP_ELECTRON ? process.env.VUE_APP_HOST + '/api/base/upload/image/head' : '/api/base/upload/image/head';
};
export const set_user_info = params => {
  // 设置用户信息
  return _POST('/api/user/set/user_info', params);
};
export const get_bind_user_info = params => {
  // 获取用户绑定信息
  return _GET('/api/user/bind/info', params);
};
export const get_google_refresh = params => {
  // 获取google秘钥
  return _GET('/api/user/google/refresh', params);
};
export const google_bind = params => {
  // 谷歌验证-绑定
  return _POST('/api/user/google/bind', params);
};
export const send_code_email = params => {
  // 发送当前账号邮箱验证码
  return _POST('/api/user/send/code/email/self', params);
};
export const send_code_mobile = params => {
  // 发送当前账号手机验证码(新)
  return _POST('/api/user/send/code/mobile/self', params);
};
export const send_newcode_mobile = params => {
  // didi-发送手机验证码(新)
  return _POST('/api/user/send/code/mobile', params);
};
export const get_country_list = params => {
  // 获取国家列表
  return _GET('/api/base/country/list', params);
};
export const bind_mobile = params => {
  // 手机绑定
  return _POST('/api/user/mobile/bind', params);
};
export const bind_first_mobile = params => {
  // 手机绑定,首次
  return _POST('/api/user/mobile/bind/first', params);
};

export const rebind_mobile = params => {
  // 修改绑定手机
  return _POST('/api/user/mobile/rebind', params);
};
export const bind_email = params => {
  // 邮箱绑定
  return _POST('/api/user/email/bind', params);
};
export const bind_first_email = params => {
  // 邮箱绑定 首次
  return _POST('/api/user/email/bind/first', params);
};

export const rebind_email = params => {
  // 修改邮箱绑定
  return _POST('/api/user/email/rebind', params);
};
export const reset_user_pwd = params => {
  // didi-登录密码-重置
  return _POST('/api/user/pwd/reset', params);
};

export const checkRsaPrivate = params => {
  // didi-秘钥密码-是否备份
  return _POST('/api/user/rsa/checkRsaPrivate', params);
};
export const addPrivate = params => {
  // didi-秘钥密码-备份秘钥
  return _POST('/api/user/rsa/addPrivate', params);
};
export const getRsaPrivate = params => {
  // didi-秘钥密码-导入秘钥
  return _POST('/api/user/rsa/getRsaPrivate', params);
};
export const emailvalidCode = params => {
  // didi-秘钥密码-导入秘钥
  return _POST('/api/user/send/email', params);
};
export const friend_apply_status = params => {
  // 允许好友请求
  return _POST('/api/user/set/userFriendApplyStatus', params);
};
export const set_user_icon = params => {
  // 设置用户信息
  return _POST('/api/user/set/icon', params);
};
