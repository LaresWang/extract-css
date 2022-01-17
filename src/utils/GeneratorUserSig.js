import UserInfoUtils from '@/utils/UserInfoUtils.js';
import store from '@/store';
import { SET_USER_SIG } from '@/store/types';
// const SDK_APP_ID = 1400378388;
const EXPIRE_TIME = 604800;
const VUE_APP_AWS_CONFIG_URL = process.env.VUE_APP_AWS_CONFIG_URL;
const DO_USER_SIG = 'doUserSig';

export default class GeneratorUserSig {
  constructor() {
    this.url = `${VUE_APP_AWS_CONFIG_URL}${DO_USER_SIG}`;
    this.send = `UserID=${UserInfoUtils.getCurrentUserId()}&Expire=${EXPIRE_TIME}`;
  }

  requestUserSig() {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open('POST', this.url, true);
    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=utf-8');
    httpRequest.send(this.send);
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        let sig = JSON.parse(httpRequest.responseText);
        store.commit(SET_USER_SIG, sig);
      }
    };
  }
}
