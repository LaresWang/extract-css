import { _POST } from '@/utils/axios';
export const get_my_reply = params => {
  //评论我的
  return _POST('/api/perspective/reply/getMyReply', params);
};
export const get_reply_comment = params => {
  //我回复评论
  return _POST('/api/perspective/reply/comment', params);
};
export const get_point_thumbsup = params => {
  //点赞我的
  return _POST('/api/perspective/userLiked/pointMeList', params);
};
export const get_point_share = params => {
  //分享我的
  return _POST('/api/perspective/share/queryShareList', params);
};
