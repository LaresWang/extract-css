import { _POST, _GET } from '@/utils/axios';

export const upload_images = () => {
  return process.env.VUE_APP_ELECTRON ? process.env.VUE_APP_HOST + '/api/base/upload/image' : '/api/base/upload/image';
};
export const user_web_code_login = params => {
  return _POST('/api/user/web/code/login', params);
};
export const user_set_team_info = params => {
  return _POST('/api/user/set/team_info', params);
};
export const user_get_team_info = params => {
  return _GET('/api/user/get/team_info', params);
};
export const user_web_register = params => {
  return _POST('/api/user/web/register', params);
};
