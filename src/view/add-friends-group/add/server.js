import { _POST } from '@/utils/axios';
export const add_the_group = params => {
  //加群申请
  return _POST('/api/contracts/api/group/addGroupBycode', params);
};
export const add_group_by_qr = params => {
  //加群申请
  return _POST('/api/contracts/api/group/addGroupByQr', params);
};
export const add_the_friends = params => {
  //加好友申请
  return _POST('/api/contracts/api/friendsapply/add', params);
};
export const get_the_info = params => {
  //获取好友详情
  return _POST('/api/contracts/api/user/info', params);
};
export const get_user_info = params => {
  //获取用户详情
  return _POST('/api/contracts/api/user/info', params);
};
export const send_add_group_apply = params => {
  //批量发送加群申请
  return _POST('/api/contracts/api/group/sendApply', '', params);
};
