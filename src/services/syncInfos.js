import { v4 as uuidv4 } from 'uuid';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import store from '@/store';
import { GET_LAST_MSG_LIST, SYNC_DATA_PROGRESS} from '../store/types';
import { sendMessageQueue } from '@/services/messageQueue';
import { ProcessContract, ProcessGroupInfo, ProcessSelfGroupMember } from '@/services/receiveMessage';
import SQLUtils from '@/components/db/sqlite.js';
import {
  getFriendsApplyList,
} from '../view/contact/server';
import {
  t_friend_apply_builder
} from '@/utils/dbDataBuilder';
/**
 * SyncTypeMap
 *  name - [string] 同步事件名
 *  key - [string] 存入t_news_version的最新版本字段名
 *  handler - [function] 收到同步信息后的处理逻辑
 *  remark - [string] 备注
 *  oldWay - [boolean] 是否走老的同步流程，默认走新流程
 *
 * 例
 * import handles from '@/services/syncInfos'
 * handles[name](message)
 * handles[name](message)
 * 
 * 
 */
// 每一批次入库成功后发送下一批次的请求， 同步顺序按照SyncTypeMap数组元素的顺序

// 同步好友 ProcessContract
// 同步群信息 ProcessGroupInfo
// 同步群成员(本人) ProcessSelfGroupMember
// 同步更新群成员(他人) ProcessGroupMember
const SyncTypeMap = [
  {
    name: 'fds',
    key: 'msgType57',
    handler: ProcessContract,
    remark: '好友进度',
  },
  {
    name: 'gds',
    key: 'msgType55',
    handler: ProcessGroupInfo,
    remark: '群进度',
  },
  {
    name: 'gdns',
    key: 'msgType48',
    handler: ProcessSelfGroupMember,
    remark: '群成员(本人)进度',
  },
  // {name: 'gtmn', key: 'msgType19', handler: ProcessGroupMember, remark: '群成员(他人)进度', oldWay: true}, // 暂时不做
]

let infos = {};
let successCb = ()=>{};
// let errCb = ()=>{};
let hideProgress = false;

const getNextName = (cid) => {
  let next = SyncTypeMap[cid + 1]
  return next ? next.name : null
}

const getCurrentUsedInfos = (eventName)=>{
  // let info = SyncTypeMap.filter(item=>item.name === eventName);
  // return info ? info[0] : {};
  let info = null;
  const len = SyncTypeMap.length;
  for(let i=0; i<len; i++){
    if(SyncTypeMap[i].name === eventName){
      info = SyncTypeMap[i];
      info.rate = 100/len;
      info.baseProgress = i*100/len;
    }
  }
  return info || {};
}

const createReqBody = () => {
  const vers = {}

  return async (eventName, batch=0, totalBatch=0, version)=>{
    console.log('获取请求信息：', eventName)
    let vInfo = vers[eventName];
    let v = version;
    let b = batch;
    if(!v){
      if(!vInfo){
        vInfo = await getVersionAndBtach();
        vers[eventName] = vInfo; 
      }
      v = vInfo.v;
      // 无需获取批次
      // b = vInfo.batch;
    }

    // let validBatch = b>batch ? b : batch;
    let reqBody = null;
    let uid = UserInfoUtils.getCurrentUserId();

    if (infos.oldWay) {
      // 走老的同步请求
      reqBody = {
        platform: 'electron',
        event: 'chat.client.retrievedata',
        ud: uid, // 用户当前ID
        m: 'PC',
        et: {
          [eventName]: v,
        },
      }
    } else {
      reqBody = {
        type: 'ws',
        reqId: uuidv4(),
        userId: uid,
        event: `g.c.${eventName}`,
        batch: b,
        totalBatch,
        v,
        time: Date.now(),
      }
    }

    return reqBody
  }
}

let getReqBody = null;
let sendRequestRecord = [];

const sendRequest = async (eventName, batch, totalBatch, version)=>{
  const reqbody = await getReqBody(eventName, batch, totalBatch, version);
  reqbody.$raw = true;
  sendMessageQueue.push(reqbody);
  sendRequestRecord.push({...reqbody, time: new Date().getTime()});
  checkInterval();
}

// 定时器
let intervalTime;

const checkInterval = () => {
  intervalTime = setInterval(() => {
    if (sendRequestRecord[0]) {
      console.log('检查当前未收到回执的订阅',sendRequestRecord, intervalTime);
      sendRequestRecord[0].$raw = true;
      sendMessageQueue.push(sendRequestRecord[0]);
    } else {
      window.clearInterval(intervalTime);
    }
  }, 3000);
}

const sendNextRequest = async (currentName, nextName, batch, totalBatch, isLast, version)=>{
  if(!isLast){
  // if(batch<totalBatch){
    sendRequest(currentName, batch, totalBatch, version);
  } else if(nextName) {
    // 触发下一类信息的同步
    infos = getCurrentUsedInfos(nextName)
    sendRequest(nextName)
  } else {
    // 更新完成
    console.log('update finish');
    await store.dispatch(GET_LAST_MSG_LIST);
    // 订阅同步群成员退群消息
    const versions = await window.vm.$knex('t_news_version').where('name', 'in', ['msgType46']).select('name', 'version');
    sendMessageQueue.push({
      type: 'ws',
      event: "g.c.slmsg",
      reqId: uuidv4(), // 前端每次请求都需要变更
      userId: UserInfoUtils.getCurrentUserId(),
      v: versions[0].version,
      "time": new Date().getTime()
    });
    successCb();
  }
}

const updateProgress = (batch, totalBatch, isLast)=>{
  let stageProgress = 0;
  if(isLast){
    stageProgress = 1;
  } else if(totalBatch>0) {
    stageProgress = batch / totalBatch;
  }

  console.log(infos.remark + '==>', stageProgress);
  const totalProgress = Math.ceil(stageProgress*infos.rate + infos.baseProgress);
  // console.log(store)
  store.commit(SYNC_DATA_PROGRESS, totalProgress>100?100:totalProgress);
  
}

export const startSync = async (ok, err, ignoreProgress)=>{
    infos = getCurrentUsedInfos(SyncTypeMap[0].name);
    ok && (successCb = ok);
    // err && (errCb = err);
    hideProgress = ignoreProgress;
    getReqBody = createReqBody();
    sendRequest(infos.name);
    // sendRequest(GDS);
    // sendRequest(GDNS);
    // 同步一下好友申请信息
    const list = await SQLUtils.getFriensApplyList(1, 10)
    if (list.length === 0) {
      await getFriendsApplyListHand()
    }  
  },

  getFriendsApplyListHand = async ()  =>{
  // 查询列表
    let pararms = {
      pageNo: 1,
      pageSize: 10000000,
      // 1017150835043491840
      friendId: localStorage.getItem('userId')
    };
    let res = await getFriendsApplyList(pararms);
    if (res.code == '200') {
      if (res.data.rows.length > 0) {
        const rows = res.data.rows.map((row) => {
          return t_friend_apply_builder(row)
        });
        await SQLUtils.insertFriendsApply(rows)
      } 
    }
  }

const updateVersionOrBatch = async(name, value)=>{
  // console.log('更新版本并删除该类型的重试', name)
  let newInfos = {
    updatedOn: Date.now(),
    version: value + ''
  }

  let ret = await window.vm
    .$knex('t_news_version')
    .where({
      name
    })
  // console.log(ret,'查询结果')
  if(ret && ret.length){
    await window.vm
      .$knex('t_news_version')
      .where({
        name
      })
      .update(newInfos);
  } else {
    await window.vm
      .$knex('t_news_version')
      .insert({
        name,
        ...newInfos
      });
  }
}

const getVersionAndBtach = async()=>{
  let batchKey = infos.key+'Batch';
  let searchRet = null;
  let v = 0;
  let batch = 0;

  searchRet = await window.vm.$knex('t_news_version').where('name', 'in', [infos.key, batchKey]).select('name', 'version');
  if(searchRet && searchRet.length){
    searchRet.forEach(item=>{
      if(item.name===infos.key){
        v = item.version;
      } else if(item.name===batchKey){
        batch = +item.version;
      }
    })
  }
  return { v, batch }
}

const createHandlers = (currentName, nextName, handler) => {
  return async (message) => {
    const data = message.data || {}
    const { batch, totalBatch } = data
    data.arrs = data.arrs || []
    await handler(data, 'syncInfo')
    await updateVersionOrBatch(infos.key, data.v);
    // 无需保存批次
    // if(data.last){
    //   // await updateVersionOrBatch(infos.key+'Batch', 0);
    // } else {
    //   await updateVersionOrBatch(infos.key, data.v);
    //   // await updateVersionOrBatch(infos.key+'Batch', batch);
    // }

    !hideProgress && updateProgress(batch, totalBatch, data.last);
    sendRequestRecord = [];
    window.clearInterval(intervalTime)
    console.log('已经接到消息删除记录', currentName)
    sendNextRequest(currentName, nextName, batch, totalBatch, data.last, data.v);
  }
}

// // 好友
// export const handleFds = createHandlers(FDS, GDS, ProcessContract);

// // 群信息
// export const handleGds = createHandlers(GDS, GDNS, ProcessGroupInfo);

// // 群成员
// export const handleGdns = createHandlers(GDNS, null, ProcessSelfGroupMember);

let handles = {}
SyncTypeMap.forEach((item, index) => {
  let name = item.name
  handles[name] = createHandlers(name, getNextName(index), item.handler)
})

console.log(handles, '++++++++++++++++++')
export default handles
