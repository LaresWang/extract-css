/*
 * @Description:
 * @Author: 龙春雨
 * @Date: 2020-06-04 13:41:17
 */
import axios from 'axios';
import log from 'electron-log';
// import store from '@/store/index';
// import { SHOW_LOADING, HIDE_LOADING } from '@/store/types';
import { Message } from 'element-ui';
import store from "../store"
// import moment from 'moment';
// import { get_user_access_token_by_refresh } from '@/server';

export let instance = axios.create({
  baseURL: process.env.VUE_APP_ELECTRON ? process.env.VUE_APP_HOST : '/',
  timeout: 30000,
  headers: {
    'Accept-Language': localStorage.lang || 'zh-cn',
    'Content-Language': localStorage.lang || 'zh-cn',
    'Source-Site': 'pc.didi',
    Authorization: localStorage.accessToken,
  }
});
log.info(localStorage.authToken);

export const getAccessToken = async () => {
  return new Promise((resolve,reject) => {
    let loginInfo = localStorage.getItem('loginInfo');
    loginInfo = JSON.parse(loginInfo);
    // console.warn(`刷新authToken之前 ${loginInfo.authToken}, 过期时间${moment(Number(loginInfo.expiresAt)).format('yyyy-MM-DD HH:mm:ss')}`);
    axios.post(`${process.env.VUE_APP_AUTH_HOST}user/refreshTokenForDidi?refreshToken=${loginInfo.refreshToken}`,
      {
        refreshToken: loginInfo.refreshToken,
      },
      {
        headers: {
          'Content-Language': 'zh-cn',
          'Source-Site':'pc.didi'
        },
        timeout: 30000,
      }
    ).then(res => {
      let newToken = {};
      newToken = res.data;
      if (newToken) {
        localStorage.setItem('authToken', newToken.data.accessToken);
        loginInfo.authToken = newToken.data.accessToken;
        loginInfo.expiresAt = newToken.data.expiresAt;
        localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
        // console.warn(`刷新authToken之后${newToken.data.accessToken},
        // 过期时间${moment(Number(newToken.data.expiresAt)).format('yyyy-MM-DD HH:mm:ss')}`
        // );
      }
      resolve();
    },
    err => reject(err)
    ).catch(err => reject(err));
  })
}

instance.interceptors.request.use( //这里添加getAccessToken
  async config => {
    // 刷新Token
    let loginInfo = localStorage.getItem('loginInfo');
    if (loginInfo && loginInfo != 'null') {
      loginInfo = JSON.parse(loginInfo);
      if (Number(loginInfo.expiresAt) <= (new Date().getTime() + 1000 * 60 * 10)) {
        await getAccessToken();
      }
    }
    //end
    if (config.params && config.params.requestBase && config.params.requestBase == process.env.VUE_APP_AUTH_HOST) {
      config.baseURL = process.env.VUE_APP_AUTH_HOST;
      delete config.params.requestBase;
      delete config.headers.Authorization;
    }
    config.headers['Authorization-auth'] = localStorage.authToken;
    return config;
  },
  error => {
    // store.commit(HIDE_LOADING)
    // Message.warning('The network is slow, please try again late');
    return Promise.reject(error);
  }
);
// 添加响应拦截器
instance.interceptors.response.use(
  function(response) {
    // setTimeout(() => {
    //   store.commit(HIDE_LOADING)
    // }, 300)
    // 对响应数据做点什
    // if (response.data.code == '500') {
    //   Message.error(window.vm.$t('chat_0084'));
    //   return Promise.reject();
    // }
    if (response.data.code !== '200') {
      if (response.data.code == '210') {
        Message.error(window.vm.$t('chat_0084'));
      } else if (response.data.code == '207') {
        Message.error(window.vm.$t('book_friend_0017'));
      } else if (response.data.code == '208') {
        Message.error(window.vm.$t('chat_0085'));
      } else if (response.data.code == '211') {
        Message.error(window.vm.$t('Universal_0428'));
      } else if (response.data.code === '010604') {
        console.log(window.vm.$t('my_safety_0108'));
      } else if (response.data.code == '010149') {
        Message.error(window.vm.$t('my_safety_0109'));
      } else if (response.data.code == '010204') {
        Message.error(window.vm.$t('my_safety_0055'));
      } else if (response.data.code == '010135') {
        Message.error(window.vm.$t('my_safety_0056'));
      } else if (response.data.code == 'D100002') {
        Message.error(window.vm.$t('my_safety_0057'));
      } else if (response.data.code == 'D100006') {
        Message.error(window.vm.$t('my_safety_0058'));
      } else if (response.data.code == '010141') {
        Message.error(window.vm.$t('my_safety_0059'));
      } else if (response.data.code == '200110') {
        Message.error(window.vm.$t('chat_comm_member_0009'));
      } else if (response.data.code == '010150') {
        Message.error(window.vm.$t('my_safety_0060'));
      }
      // else if (response.data.msg !== '请求频繁') {
      //   Message.error(response.data.msg);
      // }

      if (response.data.code == '010101') {
        store.commit("LOGIN_OUT", true);
      }
      return Promise.resolve(response);
    }
    return response.data;
    // return Promise.reject(response.data);
  },
  function(error) {
    console.warn('[axios:request]请求 error : ', error);
    console.warn('当前host： ', instance.defaults.baseURL)
    instance.defaults.baseURL =
      instance.defaults.baseURL == process.env.VUE_APP_HOST
        ? process.env.VUE_APP_HOST_BK
        : process.env.VUE_APP_HOST
    console.warn('当前host： ', instance.defaults.baseURL)
    // setTimeout(() => {
    //   store.commit(HIDE_LOADING)
    // }, 300)
    // Message.warning('The network is slow, please try again late');
    // 对响应错误做点什么
    // if(error?.message==="Network Error"){
    //   store.dispatch("NET_STATUS",{netStatus: 'offline'});
    // }
    return Promise.reject(new Error(error));
  }
);

export const _GET = async (url, params) => {
  return instance.request({
    url: url,
    method: 'get',
    params
  });
};

export const _POST = async (url, params, data, headers) => {
  const op = {
    url: url,
    method: 'post',
    params,
    data
  };
  // for(let key of Object.keys(params)) {
  //   op.params[key] = encodeURI(params[key]);
  // }
  if (headers) {
    op.headers = headers;
    if (headers && headers['Content-Type'] == 'application/x-www-form-urlencoded') {
      let fromData = new FormData();
      for (let key of Object.keys(data)) {
        fromData.append(key, data[key]);
      }
      op.data = fromData;
    }
  }
  return instance.request(op);
};
