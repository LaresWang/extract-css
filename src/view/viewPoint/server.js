import { _POST } from '@/utils/axios';
import { _GET } from '@/utils/axios';
export const getInvitationListPage = params => {
  //已发布帖子列表
  return _POST('/api/perspective/invitation/getInvitationListPage', params);
};
export const queryDraftInvitation = params => {
  //未发布帖子列表
  return _POST('/api/perspective/draft/queryDraftInvitation', params);
};
export const delInvitation = params => {
  //删除已发布帖子
  return _POST('/api/perspective/invitation/delInvitation', params);
};
export const findNoticeFlag = params => {
  //查询我的消息中的小红点
  return _POST('/api/perspective/user/findNoticeFlag', params);
};
export const focusCount = params => {
  //关注用户数和被关注用户数
  return _POST('/api/perspective/user/focusCount', params);
};
export const getAllReply = params => {
  //获取帖子全部评论
  return _POST('/api/perspective/reply/getAllReply', params);
};
export const getDetailContent = params => {
  //查看帖子详情
  return _POST('/api/perspective/invitation/getDetailContent', '', params);
};
export const allLabelInfo = params => {
  //查看帖子详情
  return _GET('/api/perspective/label/allLabelInfo', params);
};
export const removeDraftInvitation = params => {
  //删除待发布帖子
  return _POST('/api/perspective/draft/removeDraftInvitation', params);
};
export const myInvitationCount = params => {
  //获取我的看法总数
  return _POST('/api/perspective/invitation/myInvitationCount', params);
};
export const focusUser = params => {
  //关注、取消关注
  return _POST('/api/perspective/user/focusUser', params);
};
export const getContent = params => {
  //文章内容
  return _POST('api/perspective/invitation/getArticle', '', params);
};
//////api/perspective/invitation/getDetailContent
