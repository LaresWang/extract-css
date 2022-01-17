import { _POST, _GET } from '@/utils/axios';

export const pcAddOrUpdateInvitation = (data, params) => {
  // 发布看法--新增的时候：发布
  return _POST('/api/perspective/invitation/pcAddOrUpdateInvitation', data, params);
};

export const saveDraftInvitation = (data, params) => {
  // 保存编辑待发布帖子：保存、发布
  return _POST('/api/perspective/draft/saveDraftInvitation', data, params);
};
export const getAllLabelInfo = params => {
  // 发布看法
  return _GET('/api/perspective/label/allLabelInfo', params);
};
export const uploadPicture = () => {
  // 上传tupian NODE_ENV VUE_APP_HOST
  let url = '/api/perspective/draft/uploadPicture';
  return process.env.NODE_ENV == 'development' ? url : process.env.VUE_APP_HOST + url;
};
