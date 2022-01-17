import { _POST } from '@/utils/axios';

export const chat_group_queryGroupMsgs = params => {
  //群查询消息接口
  return _POST('/api/chat/chat/group/queryGroupMsgs', params);
};
export const chat_rest_send = params => {
  //发送消息接口
  return _POST('/api/chat/chat/rest/send', params);
};
export const ser_group_member = params => {
  //查询群成员
  return _POST('/api/contracts/api/group/queryGroupMembers', params);
};
export const queryGroupByGroupId = params => {
  //群id搜索群信息
  return _POST('/api/contracts/api/group/queryGroupByGroupId', params);
};
export const chat_send_images = (data, params) => {
  // 上传图片文件
  return _POST('/api/imfile/file/uploadFileForPhote', data, params);
};
export const chat_send_video = (data, params) => {
  // 上传视频文件
  return _POST('/api/imfile/file/uploadFileForVideo', data, params);
};
export const chat_send_voice = (data, params) => {
  // 上传视音频文件
  return _POST('/api/imfile/file/uploadFileForVoice', data, params);
};
export const chat_send_file = (data, params) => {
  // 上传文件
  return _POST('/api/imfile/file/uploadFile', data, params);
};
export const ser_group_personById = params => {
  //根据群id搜索群成员信息
  return _POST('/api/contracts/api/group/queryPersonalOfGroup', params);
};
export const delete_friends = params => {
  //删除好友
  return _POST('/api/contracts/api/friends/delete', params);
};
// export const uploadPicture = () => {
//   // 上传tupian NODE_ENV VUE_APP_HOST
//   let url = '/api/perspective/draft/uploadPicture';
//   return process.env.NODE_ENV == 'development' ? url : process.env.VUE_APP_HOST + url;
// };
export const query_owner_group = params => {
  //查询用户是群主的群
  return _POST('/api/contracts/api/group/queryOwnerGroup', params);
};

export const removeGroupMember = params => {
  // 管理员移除群成员
  return _POST('/api/contracts/api/group/removeGroupMember',params);
};

export const updateGroupPersonalInfo = params => {
  //群个人信息设置，回话设置
  return _POST('/api/contracts/api/group/updateGroupPersonalInfo', params);
};
export const queryPersonalDataGroup = params => {
  //查询群个人信息包括群属性
  return _POST('/api/contracts/api/group/queryPersonalDataGroup', params);
};

