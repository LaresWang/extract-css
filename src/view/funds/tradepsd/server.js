import { _GET, _POST } from '@/utils/axios';
export const get_bind_user_info = params => {
  // 获取用户绑定信息
  return _GET('/api/user/bind/info', params);
};

export const send_code_email = params => {
  // 发送当前账号邮箱验证码
  return _POST('/api/user/send/code/email/self', params);
};
export const send_code_mobile = params => {
  // 发送当前账号手机验证码(新)
  return _POST('/api/user/send/code/mobile/self', params);
};
export const set_funds_pwd = params => {
  // 资金密码-设置
  return _POST('/api/user/fundpwd/set', params);
};
export const update_user_pwd = params => {
  // didi-登录密码-修改
  return _POST('/api/user/pwd/update', params);
};
export const fundpwd_first_pwd = params => {
  // didi-资金密码-设置-首次
  return _POST('/api/user/fundpwd/set/first', params);
};
export const fundpwd_set_pwd = params => {
  // didi-资金密码-设置-首次
  return _POST('/api/user/fundpwd/set', params);
};
