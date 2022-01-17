import { _POST } from '@/utils/axios';

export const chat_user_queryUserMsgs = params => {
  //个人用户查询消息接口
  return _POST('/api/chat/chat/user/queryUserMsgs', params);
};
export const chat_rest_send = params => {
  //个人用户查询消息接口
  return _POST('/api/chat/chat/rest/send', params);
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
export const queryGroupByGroupId = params => {
  //群id搜索群信息
  return _POST('/api/contracts/api/group/queryGroupByGroupId', params);
};

export const usersession_list = params => {
  //个人单聊会话设置list
  return _POST('/api/contracts/api/usersession/list', params);
};

export const usersession_update = params => {
  //个人单聊会话设置update
  return _POST('/api/contracts/api/usersession/updateUserSession', params);
};
export const createGroup = params => {
  return _POST('/api/contracts/api/group/createGroupAPP', params); //发起群聊
};
