/* eslint-disable vue/no-dupe-v-else-if */
<template>
  <span v-if="item.msgType == '14'">{{ $t('chat_0087') }}</span>
  <span v-else-if="item.msgType == '44'">{{ $t('chat_0088') }}</span>
  <span v-else-if="item.msgType == '7' && item.fromType != '388'">{{ $t('chat_0090') }}</span>
  <span v-else-if="item.msgType == '8'" class="notify">{{ $t('chat_0091') }}</span>
  <span v-else-if="item.msgType == '31'" class="notify">{{ $t('chat_0092') }}</span>
  <span v-else-if="item.fromType == '203'">{{ $t('chat_0090') }}</span>
  <span v-else-if="item.fromType == '204'">你设置了消息 {{ senderer }} 秒后消失</span>
  <span v-else-if="item.fromType == '205'">{{ senderer }} 设置了消息 {{ receiver }} 秒后消失</span>
  <span v-else-if="item.fromType == '206'">你取消了阅后即焚</span>
  <span v-else-if="item.fromType == '207'">{{ senderer }} 取消了阅后即焚</span>
  <span v-else-if="(item.fromType == '0' || item.msgType == '26') && !item.widthDrawFlag">
    <span v-if="!item.fromName2">{{ $t('chat_notice_0025', {value: senderer}) }}
    </span>
    <span v-else>
      {{ $t('chat_notice_0028', {fromName: item.fromName2}) }}
      <!--’你‘撤回了XXX的消息-->
    </span>
    <span 
      v-show="item.msgBody.text && myUserId == item.fromId  && !item.fromName2" 
      class="reEdit" @click="reEdit(item)">{{ $t('Universal_0389') }}<!--!item.fromName2确保不是你撤回的别人的消息-->
    </span>
  </span>
  <span v-else-if="(item.fromType == '0' || item.msgType == '26') && item.widthDrawFlag"><!--管理员撤回的消息-->
    <span v-if="myUserId == item.msgBody.userId">{{ $t('chat_notice_0026') }}</span>
    <span v-else>{{ $t('chat_notice_0027', {fromName: item.nickName || item.fromName}) }}</span>
  </span>
  <!-- <span v-else-if="item.fromType == '209'">你撤回了一条消息</span> -->
  <span v-else-if="item.fromType == '301'">{{ $t('chat_notice_0019', {value: nickNameIsMe}) }}</span
  ><!-- {{item.refMsgBody.tName}}{{senderer}}-->
  <span v-else-if="item.fromType == '380'">{{ $t('chat_notice_0020', {value: nickNameIsMe}) }}</span>
  <span v-else-if="item.fromType == '302'">
    {{ $t('book_notice_0005', {value:$t('Universal_0036'),senderer}) }}
  </span>
  <span v-else-if="item.fromType == '303'">
    <span v-if="senderer != receiver">
      {{ $t('book_notice_0005', {value: nickNameIsMe,senderer: receiver}) }}
    </span>
    <span v-else>{{ $t('chat_notice_0015', {value: senderer}) }}</span>
  </span>
  <span v-else-if="[386,387].includes(item.fromType*1)">
    {{getNoticeFor386_387}}
  </span>
  <span v-else-if="item.fromType == '381'">
    <span v-if="senderer != receiver">
      {{ $t('chat_notice_0050', {value: nickNameIsMe, receiver}) }}
    </span>
    <span v-else>{{ $t('chat_notice_0016', {value: senderer}) }}</span>
  </span>
  <!-- <span v-else-if="item.fromType == '303'">{{ receiver }} 加入了群组</span> -->
  <span v-else-if="item.fromType == '304'">
    {{ $t('book_notice_0005', {value: senderer, senderer: $t('Universal_0036')}) }}
  </span>
  <span v-else-if="item.fromType == '305'">{{ $t('chat_notice_0015', {value: nickNameIsMe}) }}</span>
  <span v-else-if="item.fromType == '306'">{{ senderer }} {{ $t('chat_joincommunity_0006') }}</span>
  <span v-else-if="item.fromType == '307'">
    {{ $t('chat_notice_0049', {value: senderer, receiver}) }}
  </span>
  <span v-else-if="item.fromType == '308'">{{ $t('chat_notice_0021', {value: senderer}) }}</span>
  <span v-else-if="item.fromType == '309'">{{ $t('chat_notice_0021', {value: senderer}) }}</span>
  <span v-else-if="item.fromType == '382'">{{ $t('chat_notice_0022', {value: senderer}) }}</span>
  <span v-else-if="item.fromType == '310'">
    {{ $t('chat_notice_0047', {value: senderer}) }}
  </span>
  <span v-else-if="item.fromType == '311'">
    {{ $t('chat_notice_0023', {value1: $t('Universal_0036'), value2: senderer}) }}
  </span>
  <span v-else-if="item.fromType == '312'">
    {{ $t('chat_notice_0023', {value1: nickNameIsMe, value2: receiver}) }}
  </span>
  <span v-else-if="item.fromType == '384'">
    {{ $t('chat_notice_0024', {value1: nickNameIsMe, value2: receiver}) }}
  </span>
  <span v-else-if="item.fromType == '313'">
    {{ $t('chat_notice_0017', {value: senderer, groupName: item.groupName}) }}
  </span>
  <span v-else-if="item.fromType == '383'">
    {{ $t('chat_notice_0018', {value: senderer}) }}
  </span>
  <span v-else-if="item.fromType == '315'">你修改社区名为 {{ senderer }}</span>
  <span v-else-if="item.fromType == '316'">{{ senderer }} 修改社区名为 {{ receiver }}</span>
  <span v-else-if="item.fromType == '317'">你修改社区通行证为 {{ senderer }}</span>
  <span v-else-if="item.fromType == '318'">{{ senderer }} 修改社区通行证为 {{ receiver }}</span>
  <span v-else-if="item.fromType == '320'">{{ senderer }} 关闭了截屏提醒</span>
  <span v-else-if="item.fromType == '322'">{{ senderer }} 关闭了截屏提醒</span>
  <span v-else-if="item.fromType == '324'">{{ senderer }} 截取了当前屏幕</span>
  <span v-else-if="item.fromType == '325'">你 开启了 全员禁言</span>
  <span v-else-if="item.fromType == '328'">{{ $t('chat_notice_0001', {value: nickNameIsMe}) }}</span>
  <span v-else-if="item.fromType == '326'">{{ $t('chat_notice_0002', {value: nickNameIsMe}) }}</span>
  <span v-else-if="item.fromType == '327'">你关闭了全员禁言</span>
  <span v-else-if="item.fromType == '330'">
    {{ $t('chat_notice_0044', {value1: nickNameIsMe, value2: receiver}) }}
  </span>
  <span v-else-if="item.fromType == '331'">
   {{ $t('chat_notice_0044', {value1: nickNameIsMe, value2: $t('Universal_0036') }) }}
  </span>
  <span v-else-if="item.fromType == '332'">
    <!--    对 {senderer} 关闭了禁言     改成  解除了禁言-->
    {{ $t('chat_notice_0045', {value1: $t('Universal_0036'), value2: senderer}) }}
  </span>
  <span v-else-if="item.fromType == '333'">
    {{ $t('chat_notice_0045', {value1: nickNameIsMe, value2: receiver}) }}
  </span>
  <span v-else-if="item.fromType == '334'">
    {{ $t('chat_notice_0045', {value1: nickNameIsMe, value2: $t('Universal_0036') }) }}
  </span>
  <span v-else-if="item.fromType == '336'">
    {{ $t('chat_notice_0004', {value: nickNameIsMe}) }}
  </span>
  <span v-else-if="item.fromType == '338'">
    {{ $t('chat_notice_0003', {value: nickNameIsMe}) }}
  </span>
  <span v-else-if="item.fromType == '341'">{{ senderer }} 设置 你 为禁止单聊例外</span>
  <span v-else-if="item.fromType == '343'">{{ senderer }} 设置 你 为禁止单聊例外</span>
  <span v-else-if="item.fromType == '345'">
    {{ $t('chat_notice_0006', {value: nickNameIsMe}) }}
  </span>
  <span v-else-if="item.fromType == '347'">
    {{ nickNameIsMe }} {{ $t('chat_comm_manage_0026') }}
  </span>
  <span v-else-if="item.fromType == '349'">
    {{ $t('chat_notice_0008', {value: nickNameIsMe}) }}
  </span>
  <span v-else-if="item.fromType == '351'">
    {{ nickNameIsMe }} {{ $t('chat_comm_manage_0027') }}
  </span>
  <span v-else-if="item.fromType == '355'">
    {{ $t('chat_notice_0009', {value: nickNameIsMe}) }}
  </span>
  <span v-else-if="item.fromType == '353'">
    {{ $t('chat_notice_0010', {value: nickNameIsMe}) }}
  </span>
  <span v-else-if="item.fromType == '357'">{{ senderer }} 设置 你 为例外</span>
  <span v-else-if="item.fromType == '359'">{{ senderer }} 设置 你 为例外</span>
  <span v-else-if="item.fromType == '361'">
    {{ $t('chat_notice_0013', {value1: nickNameIsMe, value2: receiver}) }}
  </span>
  <span v-else-if="item.fromType == '363'">
    {{ $t('chat_notice_0014', {value1: nickNameIsMe, value2: receiver}) }}
  </span>
  <span v-else-if="item.fromType == '365'">{{ senderer }} 接收到了一个红包</span>
  <span v-else-if="item.fromType == '367'">{{ senderer }} 领取了 你 红包</span>
  <span v-else-if="item.fromType == '368'">
    {{ $t('book_notice_0002', {value: senderer}) }}
  </span>
  <span v-else-if="item.fromType == '405'">
    {{ nickNameIsMe }} {{ $t('chat_comm_manage_0029') }}
  </span>
  <span v-else-if="item.fromType == '406'">
    {{ $t('chat_notice_0012', {value: nickNameIsMe}) }}
  </span>
  <span v-else-if="item.fromType == '373'">
    {{ $t('book_group_0013', {value: nickNameIsMe}) }}
  </span>
  <span v-else-if="(item.fromType == '999') && (item.msgType == '61')">
    {{ $t('chat_0127') }}
  </span>
  <span v-else-if="item.fromType == '372'">{{getNoticeFor372}}</span>
</template>

<script>
import UserInfoUtils from "@/utils/UserInfoUtils";
import { parseUniqueCode } from '@/utils/const';
export default {
  name: 'message-notice',
  data() {
    return {
      myUserId: localStorage.userId,
      senderer: ''
    };
  },
  inject: ['saveTimeArr372'],
  props: {
    item: { require: true },
    isCurrent: {
      type: Boolean,
      default() {
        return false;
      }
    },
    sender: {
      type: String,
      default() {
        return '';
      }
    },
    receiver: {
      type: String,
      default() {
        return '';
      }
    }
  },
  computed:{
    nickNameIsMe(){
      if(this.item?.fromId==localStorage.userId){
        return this.$t('Universal_0036')
      }else{
        return this.senderer
      }
    },
    refMsgBody(){
      if(typeof this.item.refMsgBody === "string"){
        return JSON.parse(this.item.refMsgBody)
      }
      return this.item.refMsgBody
    },
    getNoticeFor372(){
      let unit = 60 * 60 * 1000;
      let saveTimeArr372Lang=this.saveTimeArr372();
      let obj=Object.fromEntries(saveTimeArr372Lang.map(o=>[o['value']*unit,o.label]))
      let who=''
      if(this.item?.fromId==localStorage.userId){
        who = this.$t('Universal_0036')//this.$i18n.locale.includes('zh')?'你':'You'
      }else{
        // console.info(this.item)
        // 公用组件 会话列表/右侧消息记录
        if(this.item.targetType==1){
          who =this.item?.friendFriendNotes||this.item?.friendNickName||this.item?.fromName||this.item?.nickName||''
        }else{
          who= this.item?.fromName||this.item?.nickName||''
        }
      }
      let time = obj[this.refMsgBody?.time || this.item?.msgHeader?.effectiveTime];
      if(this.$i18n.locale.includes('zh')){
        time=time.replace(/\s/g,'')
      }
      return  this.$t('chat_notice_0057', {value: who, time});
    }
  },
  asyncComputed: {
    // http://project.vonechain.com:7880/zentao/story-view-3779.html
    async getNoticeFor386_387() {
      let { fromType, fromName = "", refMsgBody, nickName, fromId,uniqueCode,targetType } = this.item;
      let inviteName = '';
      if (fromId === UserInfoUtils.getCurrentUserId()) {
        // 是本人
        // inviteName = UserInfoUtils.getCurrentUserNickName()
        inviteName = this.$t('Universal_0036')
      } else {
        inviteName = await this.getMemberFromSql(
          fromId,
          parseUniqueCode(uniqueCode, targetType)
        );
      }
      let name = (refMsgBody?.users || [])
        .map((o) => o["nickName"])
        .slice(0, 3);
      let count=refMsgBody?.users?.length||0;
      if (fromType == 386) {
        if(count<=3){
          return this.$t("book_notice_0005", {
            value: inviteName || nickName || fromName,
            senderer: name.join(","),
          }); 
        }
        return this.$t("chat_notice_0058", {
          inviter: inviteName || nickName || fromName,
          invited: name.join(","),
          count
        });
      }
      if (fromType == 387) {
        if(count<=3){
          return this.$t("chat_notice_0050", {
            value: inviteName || nickName || fromName,
            receiver: name.join(","),
          });
        }
        return this.$t("chat_notice_0059", {
          inviter: inviteName || nickName || fromName,
          invited: name.join(","),
          count
        });
      }
      return "";
    },
  },
  watch: {
    sender: {
      deep: true,
      immediate: true,
      handler: async function  (v) {
        if (v === '' || !v) {
          let name = await this.getMemberFromSql(this.item.fromId, this.item.id || this.item.targetId);
          this.senderer = name || this.item.nickName || this.item.refMsgBody.fromName;       
        } else {
          this.senderer = v;
        }
      }
    }
  },
  methods: {
    keepSilent() {
      this.$emit('keepSilentSet', this.item);
      // this.$parent.keepSilentSet(this.item);
    },
    reEdit(item) {
      this.$emit('reEditMsg', item);
    },
    // ```
    //   单聊：你/You > 好友备注 > 昵称
    //   非单聊：你/You > 昵称
    // ```
    async getMemberFromSql(id, group_id) {
      let targetType=this.item.targetType;
      if(targetType==1){
        let contactsArr = await window.vm.$knex("t_contacts").where({
          friend_id: id,
        });
        return Promise.resolve(contactsArr?.[0]?.friend_friendNotes||contactsArr?.[0]?.nick_name||'');
      }else{
        const memberInGroup = await window.vm.$knex('t_groups_member').where({
          id,
          group_id
        })
        // return Promise.resolve(memberInGroup?.[0]?.member_notes||memberInGroup?.[0]?.nick_name||'');
        return Promise.resolve(memberInGroup?.[0]?.nick_name||'');
      }
    },
  }
};
</script>

<style scoped lang="less">
span {
  white-space: pre-wrap;
}
</style>
