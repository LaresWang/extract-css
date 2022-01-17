import queue from 'async/queue'
import Ws from '@/utils/ws'
import { messageHandler } from '@/services/receiveMessage'
// Ws.sendMessage -- 发送前对消息进行设置
// 直接通过socket发送
const sendMessageQueue = queue(async (message, cb) => {
  try {
    await Ws.sendMessage(message)
  } catch (e) {
    console.log(e,message)
  } finally {
    cb && cb()
  }
  return true;
}, 1)

sendMessageQueue.error(function(err, task) {
  console.error(err, task)
})

const receiveMessagQueue = queue(async (message, cb) => {
  try {
    await messageHandler(message.results, message.ws)
  } catch (e) {
    console.log(e)
  } finally {
    cb && cb()
  }
  return true;
}, 1)

receiveMessagQueue.error(function(err, task) {
  console.error(err, task)
})

const customTaskQueue = function(num){
  return queue(async (task, cb) => {
    try {
      await task.fn(...task.params)
    } catch (e) {
      console.log(e,task)
    } finally {
      cb && cb()
    }
    return true;
  }, num)
}

export { sendMessageQueue, receiveMessagQueue, customTaskQueue }
