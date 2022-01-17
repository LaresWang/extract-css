import WS from '@/services/websocket';
import HeartBeat from '@/services/heartBeat';
import { startSync } from '@/services/syncInfos'
import { receiveMessagQueue } from '@/services/messageQueue';
import { addDiDiServiceInSession, addDiDiPaymentInContacts, getGroupChatHistory } from '@/services/receiveMessage'
import store from '@/store'
import { TO_BE_HANDLED_MSGS, WILL_SYNC_DATA } from '@/store/types'

let hb = null;
const Ws = WS.setUp({
  open(event, ws){
    hb = new HeartBeat(ws);
    hb.heartbeat();
    hb.fristSend();
    if(!store.state.common.willSyncData){
      startSync(null, null, true);
    }
    // //v1.6 DiDi Payment
    addDiDiPaymentInContacts();
    addDiDiServiceInSession();
  },
  message(results, ws){
    receiveMessagQueue.push({
      results,
      ws
    })
    
  },
  error(){
    clearInterval(hb?.connect);
  },
  beforeClose(){
    clearInterval(hb?.connect);
  },
  beforeReconnect(){
    clearInterval(hb?.connect);
  },
})
export default Ws;

export const handleRecievedQueueMsgs = function(){
  store.commit(WILL_SYNC_DATA, false);
  const toBeHandledMsgs = store.state.chat.toBeHandledMsgs;
  console.log('待处理消息',toBeHandledMsgs)
  // 合并消息类型为19的消息
  
  if(toBeHandledMsgs.length){
    const msg19Lists = [];
    const otherMsgs = [];
    const ws = toBeHandledMsgs[0].ws;
    let newListsMap = {};
    const merged19Lists = [];

    toBeHandledMsgs.forEach(item=>{
      if(item.results.msgType===19){
        msg19Lists.push(item.results)
      } else {
        otherMsgs.push(item)
      }
    });
    // 合并targetId,targetType相同的数据
    msg19Lists.forEach(item=>{
      const key = `${item.targetId}_${item.targetType}`;
      if(typeof newListsMap[key] === 'undefined'){
        newListsMap[key] = merged19Lists.length;
        merged19Lists.push(item)
      } else {
        merged19Lists[newListsMap[key]].dt = (merged19Lists[newListsMap[key]].dt||[]).concat(item.dt);
        merged19Lists[newListsMap[key]].gtmn<item.gtmn && (merged19Lists[newListsMap[key]].gtmn=item.gtmn);
      }
    });
    console.log(merged19Lists, '消息类型19')
    console.log(otherMsgs, '其他消息类型')
    if(!merged19Lists.length){
      getGroupChatHistory();
    } else {
      merged19Lists.forEach((item,index)=>{
        receiveMessagQueue.push({results:item, ws}, ()=>{
          console.log('完成 msgtype19：',index)
        })
      })
    }
    
    otherMsgs.forEach((item,index)=>{
      receiveMessagQueue.push(item, ()=>{
        console.log('完成其他类型：',index)
      })
    })
    // toBeHandledMsgs.forEach((item,index)=>{
    //   receiveMessagQueue.push(item, ()=>{
    //     console.log('完成：',index)
    //   })
    // })
  } else {
    getGroupChatHistory();
  }
  store.commit(TO_BE_HANDLED_MSGS)
}