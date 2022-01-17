import { _POST } from '@/utils/axios';
export const user_web_login = params => {
  return _POST('/api/user/web/login', params);
};
export const user_web_code_login = params => {
  return _POST('/api/user/web/code/login', params);
};

export const user_login_qrcode = params => {
  return _POST('/api/user/login/getCode', params);
};

export const user_login_get_scan_status = params => {
  return _POST('/api/user/login/getScanStatus', params);
};

export const user_login_web_scan_login = params => {
  return _POST('/api/user/login/webScanLogin', params);
};
