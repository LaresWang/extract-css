<!--  -->
<template>
  <div class="notify">
    <!-- <div>{{item}}</div> -->
    <span v-if="item.msgType == '14'" class="notify">{{$t('chat_0087')}}</span>
    <span v-else-if="item.msgType == '44'">{{ $t('chat_0088') }}</span>
    <div v-if="item.msgType == '7' && item.fromType != '388'" class="">
      {{$t('chat_0090')}}
    </div>
    <div v-if="item.msgType == '8'" class="">
      {{ $t('chat_0091') }}
    </div>
    <div v-if="item.msgType == '31'" class="">
      {{ $t('chat_0092') }}
    </div>
    <div v-if="item.msgType == '26'" class="notify">
      <!-- <span>{{ item.fromId == currentUserId() && item.msgType == '26' ? '你' : getFriendName }}撤回了一条消息</span> -->
      <span v-if="item.fromId == currentUserId() && item.msgType == '26'">
        {{ $t('chat_notice_0029') }}
      </span>
      <span v-if="item.fromId !== currentUserId() && item.msgType == '26'">
        {{ $t('chat_notice_0025', {value: getFriendName}) }}
      </span>
      <span v-if="item.msgBody.text && myUserId == item.fromId" class="reEdit" @click="reEdit(item)">
        {{ $t('Universal_0389') }}
      </span>
    </div>
    <div v-if="item.msgType == '61'" class="notify">
      <span v-if="item.fromType == '999'">{{ $t('chat_0127') }}</span>
    </div>
    <div v-if="item.msgType == '4'" class="notify">
      <span v-if="item.fromType == '202'">你领取了用户{{ item.refMsgBody&&item.refMsgBody.fromName }}的红包</span>
      <span v-if="item.fromType == '204'">你设置了消息 {{ item.refMsgBody&&item.refMsgBody.fromName }}秒后消失</span>
      <span v-if="item.fromType == '205'">
        {{ item.refMsgBody&&item.refMsgBody.fromName }}设置了消息{{ item.refMsgBody&&item.refMsgBody.users[0].name }}秒 后消失
      </span>
      <span v-if="item.fromType == '206'">你取消了阅后即焚</span>
      <span v-if="item.fromType == '207'">{{ item.refMsgBody&&item.refMsgBody.fromName }}取消了阅后即焚</span>
      <span v-if="item.fromType == '208'">用户{{ item.refMsgBody&&item.refMsgBody.fromName }}撤回了自己的消息</span>
      <span v-if="item.fromType == '209'">{{ $t('chat_notice_0029') }}</span>
      <span v-if="item.fromType == '210'">{{ $t('chat_notice_0030', {value: item.refMsgBody&&item.refMsgBody.fromName}) }}</span>
      <span v-if="item.fromType == '211'">{{ $t('chat_notice_0031', {value: item.refMsgBody&&item.refMsgBody.fromName}) }} </span>
      <span v-if="item.fromType == '220'">{{ item.refMsgBody&&item.refMsgBody.fromName }}发起了红包</span>
      <span v-if="item.fromType == '221'">你收到了{{ item.refMsgBody&&item.refMsgBody.fromName }}的红包</span>
      <span v-if="item.fromType == '222' || item.fromType == '212'">{{ $t('chat_notice_0039', {value: friendName}) }}</span>
      <span v-if="item.fromType == '372'">{{getNoticeFor372}}</span>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { getSelfUserId } from '@/utils/const';
export default {
  //import引入的组件需要注入到对象中才能使用
  name:"SingleNotice",
  components: {},
  inject: ['saveTimeArr372'],
  data() {
    //这里存放数据
    return {
      myUserId: localStorage.userId
    };
  },
  props: {
    item: {
      type: Object,
      default() {
        return {};
      }
    },
    getFriendName: {
      type: String,
      default() {
        return '';
      }
    }
  },
  //监听属性 类似于data概念
  computed: {
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
        who= this.$i18n.locale.includes('zh')?'你':'You'
      }else{
        who =
          this.item?.friendNotes ||
          this.item?.friendFriendNotes ||
          this.item?.fromName ||
          this.item?.friendNickName ||
          this.getFriendName ||
          this.refMsgBody?.fromName ||
          "";
      }
      let time = obj[this.refMsgBody?.time || this.item?.msgHeader?.effectiveTime];
      if(this.$i18n.locale.includes('zh')){
        time=time.replace(/\s/g,'');
      }
      return  this.$t('chat_notice_0057', {value: who, time});
      
    },
    friendName() {
      return this.item?.refMsgBody?.users?.[0]?.userId == this.currentUserId()
        ? this.item?.refMsgBody?.users?.[1]?.userNickName || this.item?.friendNickName
        : this.item?.refMsgBody?.users?.[0]?.userNickName || this.item?.friendNickName;
    }
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    currentUserId() {
      return getSelfUserId();
    },
    reEdit(item) {
      this.$emit('reEditMsg', item);
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.notify {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin: 10px 0;
  white-space: pre;
}
</style>
