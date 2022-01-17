
<template>
  <span v-if="item.msgType != 11">
    <!-- 1：发送中 2：发送完成 -1 发送失败  3已读-->
    <div class="msgStatus" v-if="item.sendStatus == 1">
      <i class="el-icon-loading"></i>
    </div>
    <div class="msgStatus" v-if="item.sendStatus == 2 && item.targetType == '1'">
      <img class="img_12" src="../../../../assets/images/msg_status_send.png" />
    </div>
    <div class="msgStatus" v-if="item.sendStatus == 3 && item.targetType == '1'">
      <img class="img_12" src="../../../../assets/images/msg_status_read.png" />
    </div>
    <div class="msgStatus" v-if="item.sendStatus == -1">
      <img  class="img_12" src="../../../../assets/images/msg_status_fail.png" style="cursor: pointer" @click="resendMsg(item)" />
    </div>
  </span>
</template>
<script>
import SQLUtils from '@/components/db/sqlite.js';

export default {
  name: 'message-send-status',
  data() {
    return {};
  },
  props: {
    item: { required: true }
  },
  mounted() {},
  computed: {},
  watch: {},
  methods: {
    async resendMsg(item) {
      item.sendStatus = 1;
      item.fromResend = true;
      await SQLUtils.sendMessageStatusSending(item.targetId, item.reqId);
      if (item.msgType == 2) {
        item.path = item.msgBody.path;
        item.reqId = item.msgBody.reqId;
        item.size = item.msgBody.fsize;
        item.fileType = item.msgBody.format
        item.fromId = item.msgBody.fromId;
        item.friendId = item.msgBody.friendId;
        this.$emit('handSendImg', item);
      }
      if (item.msgType == 6) {
        this.$emit('reHandSendFile', item.msgBody);
      }
      if (item.msgType == 10) {
        this.$emit('reHandSendVideo', item.msgBody);
      } else if (item.msgType == 1 || item.msgType == 25 || item.msgType == 15 || item.msgType == 40) {
        await this.$store.dispatch('CHAT_REST_SEND', { ...item });
      }
      // fix 38563 查询chatList
      // this.$parent?.getGroupHistory?.();//群组历史消息
      // this.$parent?.getlist?.();//单聊历史消息
    }
  }
};
</script>
<style>
.msgStatus {
  margin-right: 5px;
  /* position: absolute;
  top: 35%;
  left: -18px; */
}
</style>
