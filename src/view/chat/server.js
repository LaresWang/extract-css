import { _POST } from '@/utils/axios';

export const updateGroupPersonalInfo = params => {
  //群聊会话设置
  return _POST('/api/group/updateGroupPersonalInfo', params);
};

export const usersessionList = params => {
  //查询会话设置
  return _POST('/api/contracts/api/usersession/list', params);
};
export const usersessionUpdate = params => {
  //设置会话设置
  return _POST('/api/contracts/api/usersession/update', params);
};

export const queryGroupByGroupId = params => {
  //群id搜索群信息
  return _POST('/api/contracts/api/group/queryGroupByGroupId', params);
};


export const setGroupBase = params => {
  // 社群设置 - 修改群基础属性
  return _POST('/api/contracts/api/group/setGroupBase', {}, params, {
    'Content-Type': 'application/x-www-form-urlencoded'
  });
};

export const releaseGroup = params => {
  //解散群
  return _POST('/api/contracts/api/group/releaseGroup', params);
};

export const quitGroup = params => {
  //主动退出群
  return _POST('/api/contracts/api/group/quitGroup', params);
};

export const uploadPicture = () => {
  // 上传tupian NODE_ENV VUE_APP_HOST
  let url = '/api/perspective/draft/uploadPicture';
  return process.env.NODE_ENV == 'development' ? url : process.env.VUE_APP_HOST + url;
};

export const update_person_info = params => {
  //禁言
  return _POST('/api/contracts/api/group/updateGroupPersonalInfo', params);
};
export const removeGroupMember = params => {
  // 管理员移除群成员
  return _POST('/api/contracts/api/group/removeGroupMember', params);
};
export const closeUserExceedWarnNew = params => {
  // 关闭群人数预警
  return _POST('/api/contracts/api/groupExpand/closeUserExceedWarnNew', '', params);
};