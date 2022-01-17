<!--  -->
<template>
    <div class="chat-list" ref="messagelist">
      <VCFixedHeightScrollBar  
      class="scroll-color" ref="scroll" :noresize='true' :availableScrollHeight='availableScrollHeight'>
      <!-- <el-scrollbar class="scroll-color" ref="scroll"> -->
        <div
         v-infinite-scroll="loadMoreSessionList"
         :infinite-scroll-distance="60"
         >
        <div
          class="chat-info flex align-center"
          v-for="(item, index) in showLastMsgList"
          :key="item.id"
          :id="item['id']"
          :class="{
            active: isCurCode == item.id,
            topflag: item.topFlag == 1
          }"
          @click="toChat(item, index)"
          @contextmenu.prevent="rightClick($event, item)"
        >
          <div class="user-head" :class="item.noNoticeFlag == '1'?'redDot':''">
            <el-badge
              :is-dot="item.noNoticeFlag == '1'"
              class="item"
              :class="item.unread > 99&&item.noNoticeFlag != '1' ? 'msgUnread' :''"
              :value="item.unread > 99 ? '99+' : item.unread"
              :hidden='item.unread > 0 ? false : true'
            >
              <span v-if="item.sessionIcon">
                <MemberIcon
                  :image="item.sessionIcon"
                  iconType="small"
                  :userRank="item.userRank"
                  :vipType="item.vipType"
                  v-if="notDiDiService(item)"
                />

                <SessionIcon v-else :sessionIconSrc="findImage(item.sessionIcon)" :sessionId="item.id" />
                <!-- <img :src="findImage(item.sessionIcon)" alt  @error="replaceImg" :data-key="item.id" /> -->
              </span>
              <span v-if="!item.sessionIcon">
                <!-- 群 -->
                <div v-if="item.targetType == '2' && item.groupType == '1'">
                  <img src="../../assets/images/group_avtar.png" alt width="48px" height="48px" />
                </div>
                <!-- 讨论组 -->
                <div v-if="item.targetType == '2' && item.groupType == '0'">
                  <DiscussionIcon :name="item.sessionName" />
                </div>
              </span>
            </el-badge>
          </div>
          <div class="user-words flex flex-direction">
            <div class="flex align-center">
              <span class="user-name" v-if="isDiDiService(item)"
                    :style="{'max-width': didiServiceWidth(item), width: 'auto'}">
                <label class="vlogo"><img src="../../assets/images/vlogo.png" /> </label>
                {{ `${item.sessionName}` }}
              </span>
              <span class="user-name" v-if="item.targetType == 2&&item.groupType == '1'"
                    :style="{'max-width': groupNameWidth(item), width: 'auto'}">
                <i class="iconfont icon-user-group-Fill"></i>
                {{`${item.sessionName}` }}
              </span>
              <span class="user-name" v-if="item.targetType == 2&&item.groupType == '0'"
                    :style="{'max-width': groupNameWidth(item), width: 'auto'}">
                 <i class="iconfont icon-laba"></i>
                {{`${item.sessionName}` }}
              </span>
              <span class="user-name r5" v-if="notDiDiService(item)"
                    :style="{'max-width': userNameWidth(item), width: 'auto'}">
                <i class="iconfont icon-user"></i>
                {{ `${item.sessionName}` }}
              </span>
              <LuckIdIcon
                :listFlag="true"
                :vipType="item.vipType"
                :inviteCodeType="item.inviteCodeType"
                :inviteCode="item.code"
                :userRank="item.userRank"
                iconType="medium"
                v-if="notDiDiService(item)"
              />
              <!-- <LevelIcon
                :listFlag="true"
                :vipType="item.vipType"
                :inviteCodeType="item.inviteCodeType"
                :inviteCode="item.code"
                :userRank="item.userRank"
                iconType="medium"
                v-if="
                  item.targetType == 1 &&
                    item.id != '1008455862495526912' &&
                    item.id != '1032384035881537536'
                "
              /> -->
              <label v-if="item.targetType == '2'">({{ item.people }})</label>
              <span class="user-time" v-if="!item.timestamp&&!item.draftTime"></span>
              <span class="user-time" v-else-if="item.draftTime">{{ item.draftTime | diffTimeHand }}</span>
              <span class="user-time" v-else>{{ item.updateTime | diffTimeHand}}</span>
            </div>
            <div class="flex  align-center" style="position: relative; height: 23px;" :class="{ 'justify-between': !item.isAt }">
              <span
                v-if="item.isAt&&item.unread>0"
                class="user-sign"
                style="color:#F5222D;"
                :style="item.msgType == 1 || item.msgType == 25 ? 'width:60px' : 'width:70px'"
              >
                [{{ $t('chat_0041') }}]
              </span>
              <span v-if="groupDraft(item)" class="user-sign" :style="item.isAt ? 'width:110px' : 'width:175px'">
                <!-- 停留在A群内窗口还原，左侧消息列表 ”有人@你” 显示3s后消失，且同一消息id不再二次延迟显示 -->
                <template v-if="isFiveSecondsDelay && item['id'] == $store.state.chat.currentChat['id']">
                  <span style="color:#F5222D;">
                    [{{ $t('chat_0041') }}]
                  </span>
                </template>
                <span v-if="item.fromName && item.text && !mergeDraf(item)['draftFlag']">
                  {{ item.fromId == userId ? $t('Universal_0037') : item.fromName }}:
                </span>
                <span v-else-if="!item.fromName && item.text && !mergeDraf(item)['draftFlag']">{{item.refMsgBody.fromName}}: </span>
                <span v-else-if="!item.fromName && item.text && mergeDraf(item)['draftFlag']"></span>
                <MessageFormatText
                    linkFlag
                    v-if="mergeDraf(item)['draftFlag']"
                    v-bind:text="mergeDraf(item)['text2']"
                    :draftFlag="mergeDraf(item)['draftFlag']" />
                <MessageFormatText linkFlag v-else v-bind:text="item.text" />
              </span>

              <!--根据不同的类型显示不同-->
              <span v-if="singleDraft(item)" class="user-sign">
                <MessageFormatText
                    linkFlag
                    v-if="mergeDraf(item)['draftFlag']"
                    v-bind:text="mergeDraf(item)['text2']"
                    :draftFlag="mergeDraf(item)['draftFlag']" />
                <MessageFormatText linkFlag v-else v-bind:text="item.text" />
              </span>
              <span v-else-if="item.msgType == 2 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ itemFromName(item) }}{{ $t('chat_0013') }}
              </span>
              <span v-else-if="isGroupNotice(item) && !mergeDraf(item)['draftFlag']" class="user-sign">
                <MessageNotice :item="item" :sender="showSenderName(item)" :receiver="showReceiverName(item)" />
              </span>
              <span v-else-if="isSingleNotice(item)" class="user-sign">
                <Notice v-if="item.msgType != '24'" :item="item" class="single-notice" />
              </span>
              <span v-else-if="item.msgType == 6 && !mergeDraf(item)['draftFlag']" :class="item.isAt ? 'notice-msg' : 'user-sign'">
                {{ itemFromName(item) }}{{ $t('chat_0017') }}{{ item.msgBody&&item.msgBody.fileName }}
              </span>
              <span v-else-if="item.msgType == 7 && !mergeDraf(item)['draftFlag'] && item.fromType != '388'" class="user-sign">
                {{ $t('chat_0090') }}
              </span>
              <span v-else-if="item.msgType == 9 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ itemFromName(item) }}{{ $t('chat_0014') }}
              </span>
              <span v-else-if="item.msgType == 10 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ itemFromName(item) }}{{ $t('chat_0015')}}
              </span>
              <span v-else-if="item.msgType === 11 && !mergeDraf(item)['draftFlag']" class="user-sign">
                [{{ $t('chat_voice_0001') }}]
              </span>
              <span v-else-if="item.msgType === 12 && !mergeDraf(item)['draftFlag']" class="user-sign">
                [{{ $t('chat_voice_0002') }}]
              </span>
              <span v-else-if="item.msgType == 15 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ itemFromName(item) }}{{ $t('chat_0024')}}
              </span>
              <!-- XXX撤回了一条消息 个人 -->
              <span
                  v-else-if="(item.msgType == 24 || item.msgType == 26) &&
                  !mergeDraf(item)['draftFlag'] &&
                  item.targetType == 1"
                  class="user-sign">
                {{ $t('chat_notice_0025',
                  {value: item.fromId == userId ? $t('Universal_0036') : item.friendFriendNotes || item.friendNickName || item.fromName}) }}
              </span>
              <!-- 你撤回了一条消息 -->
              <span
                  v-else-if="(item.msgType == 24 || item.msgType == 26) &&
                  !mergeDraf(item)['draftFlag'] &&
                  item.targetType == 2 &&
                  item.fromId == userId &&
                  item.fromId == item.msgBody.userId"
                  class="user-sign">
                {{ $t('chat_notice_0029') }}
              </span>
              <!-- XXX撤回了一条消息 群-->
              <span
                  v-else-if="(item.msgType == 24 || item.msgType == 26) &&
                  !mergeDraf(item)['draftFlag'] &&
                  item.targetType == 2 &&
                  item.fromId !== userId &&
                  item.fromId === item.msgBody.userId"
                  class="user-sign">
                {{ $t('chat_notice_0025', {value: item.refMsgBody&&item.refMsgBody.fromName||item.fromName}) }}
              </span>
              <!-- 管理员撤回了你的消息 -->
              <span
                  v-else-if="(item.msgType == 24 || item.msgType == 26) &&
                  !mergeDraf(item)['draftFlag'] &&
                  item.targetType == 2 &&
                  item.fromId !== userId &&
                  item.fromId !== item.msgBody.userId &&
                  item.msgBody.userId === userId"
                  class="user-sign">
                {{ $t('chat_notice_0026') }}
              </span>

              <!-- 你撤回了{fromName}的消息 -->
              <span
                  v-else-if="(item.msgType == 24 || item.msgType == 26) &&
                  !mergeDraf(item)['draftFlag'] &&
                  item.targetType == 2 &&
                  item.fromId !== item.msgBody.userId &&
                  item.msgBody.userId !== userId && item.fromId == userId"
                  class="user-sign">
                {{ $t('chat_notice_0028', {fromName: item.refMsgBody.fromName ||  ''}) }}
              </span>

              <!-- 管理员撤回了{fromName}的消息 -->
              <span
                  v-else-if="(item.msgType == 24 || item.msgType == 26) &&
                  !mergeDraf(item)['draftFlag'] &&
                  item.targetType == 2 &&
                  item.fromId !== userId &&
                  item.fromId !== item.msgBody.userId &&
                  item.msgBody.userId !== userId"
                  class="user-sign">
                {{ $t('chat_notice_0027', {fromName: item.refMsgBody.fromName || ''}) }}
              </span>

              <span v-else-if="item.msgType == 14 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ $t('chat_0087') }}
              </span>
              <span v-else-if="item.msgType == 44 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ $t('chat_0088') }}
              </span>
              <span v-else-if="item.msgType == 16 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ $t('chat_0089') }}
              </span>
              <span v-else-if="item.msgType == 61 && item.fromType == 999 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ $t('chat_0127') }}
              </span>
              <span v-else-if="item.msgType == 40 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ itemFromName(item) }}[{{$t('chat_0042')}}]
              </span>
              <!-- 56领现金活动类型 -->
              <span v-else-if="item.msgType == 56 && !mergeDraf(item)['draftFlag']" class="user-sign">
                {{ itemFromName(item) }}{{$t('Universal_0454')}} {{item.text}}
              </span>
              <span v-else-if="isDiDiServiceNotice(item)" class="user-sign">
                <MessageFormatText linkFlag v-bind:text="item.text" />
              </span>
              <!-- DiDi Payment 支付通知 41 -->
              <span v-else-if="isDiDiPaymentNotice(item)" class="user-sign">
                {{ formatTip(item, true) }}
              </span>
              <span v-else-if="item.fromId == ActAssistantId" class="user-sign">
                {{$t('chat_home_0011')}}
              </span>
              <img
                v-show="item.noNoticeFlag == 1"
                style="margin-top: 10px"
                src="../../assets/images/disturb.png"
                alt
                width="12px"
                class="disturb"
              />
            </div>
          </div>
        </div>
      </div>
    <!-- </el-scrollbar> -->
    </VCFixedHeightScrollBar>
    <AddBtn />
    <AddFriGrop v-if="addOrderVisible" :visible.sync="addOrderVisible" @handCloseFri="handCloseFri" />
    <DialogGroupVisible :dialogGroupVisible="groupVisible" @handCloseGroup="handCloseGroup" ref="sceatGroup" />
    </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import VCFixedHeightScrollBar from "@/components/ScrollBar/Index"
import MessageNotice from './group/message/MessageNotice';
import Notice from './single/message/notice';
import DialogGroupVisible from '../add-friends-group/dialog/sceate-groups';
import AddFriGrop from '../add-friends-group/add';
import { diffTime, ChatListUtils } from '@/utils/index';
import { ActAssistantId } from "@/utils/const"
import { mapMutations, mapActions, mapGetters } from 'vuex';
import {
  CLEAR_CHAT,
  DEL_LAST_MSG_LIST,
  GET_LAST_MSG_LIST,
  SET_CHAT,
  ADD_LAST_MSG_LIST,
  CHAT_REST_SEND,
  SOCKET_STATUS,
  SEND_READ_MESSAGE,
  NET_STATUS
  // SET_AUDIO_WINDOW_DISPLAY
} from '@/store/types';
import { deleteTSessionsById, overheadAndNoticeFlagById } from '@/services/rightClickByDB';
import AddBtn from '@/view/add-friends-group';
import fileOperational from '@/services/fileOperational';
import { remote, ipcRenderer } from 'electron';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import MessageFormatText from '@/view/chat/components/common/MessageFormatText';
import DiscussionIcon from '@/components/memberIcon/DiscussionIcon';
// import LevelIcon from "@/components/memberIcon/LevelIcon";
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';

import { v4 as uuidv4 } from 'uuid';
// import call from '@/utils/call';
import bus from '@/utils/eventbus';
// import moment from "moment";
import { html2Escape } from '@/utils/domainSuffix.js'
import SessionIcon from "./components/SessionIcon"
const SESSION_ITEM_HEIGHT=66,SESSION_PAGESIZE=30;
export default {
  name:"SessionLists",
  //import引入的组件需要注入到对象中才能使用
  components: {
    VCFixedHeightScrollBar,
    AddBtn,
    DialogGroupVisible,
    AddFriGrop,
    MessageFormatText,
    MessageNotice,
    Notice,
    DiscussionIcon,
    MemberIcon,
    // LevelIcon,
    LuckIdIcon,
    SessionIcon
  },
  data() {
    //这里存放数据
    return {
      ActAssistantId:ActAssistantId,
      userId: '',
      isCurCode: '',
      groupVisible: false,
      addOrderVisible: false,
      rightClickItem: {},
      timer: '',
      isFiveSecondsDelay: false, //at消息3s 延迟提示
      showLastMsgList:[],//动态push的会话列表
      availableScrollHeight:0,
      currentChatId: ''
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapGetters(['gettersAllSessionWithAt','gettersCurrentAtBySessionID','lastMsgList','drafList']),
    // store(){
    //   return this.$store
    // },
    getCurLastAtById() {
      let { id } = this.$store.state.chat.currentChat || {};
      return this.gettersCurrentAtBySessionID(id);
    },
    mergeDraf(){
      return (item)=>{
        if (this.drafList.length) {
          let draftItem = this.drafList.find(o =>o['id'] == item.id);
          if(!draftItem||item.isAt == 1|| this.currentChatId === item.id){
            return {
              draftFlag:false,
              text2:"",
            }
          }else{
            let draft = this.$t('chat_0052');
            return {
              draftFlag:draftItem?.draftFlag,
              // eslint-disable-next-line max-len
              text2:draftItem?.msgType == 1 && draftItem?.msgHtml.length > 1? '<span class="red">'+draft+'</span>' + html2Escape(draftItem.msgHtml, false):""
            }
          }
        }

        if(item.isAt == 1 || this.currentChatId === item.id){
          return {
            draftFlag:false,
            text2:"",
          }
        }else{
          let draft = this.$t('chat_0052');
          return {
            draftFlag: item?.draftTime,
            text2: '<span class="red">'+draft+'</span>' + html2Escape(item.draftText, false)
          }
        }
      }
    },
    isDiDiPaymentNotice() {
      return item => {
        return item['id'] == this.$paymentId && [224, 225, 226, 227, 228, 1001, 1002, 1003, 1004].includes(item['fromType'] * 1);
      };
    },
    isDiDiServiceNotice() {
      return item => {
        return item['id'] == '1008455862495526912' && [1005, 1006, 1007].includes(item['fromType'] * 1);
      };
    },
    formatTip() {
      return function({ fromType }, isTitle) {
        switch (fromType * 1) {
        case 224: //群和单聊红包退款到账,
        case 1001: //退款到账通知(平仓)
          return isTitle ? this.$t('wallet_notice_0002') : this.$t('wallet_notice_0024');
        case 225: //付款(内部转账),
        case 226: //付款(内部转账),
          return isTitle ? this.$t('wallet_notice_0017') : this.$t('Universal_0420');
        case 227: //外部钱包充值到账
        case 228: //场外交易到账,
        case 1003: //收款到账通知-理财收益到账
          return isTitle ? this.$t('wallet_notice_0006') : this.$t('wallet_list_0009');
        case 1002: //还款凭证-抵押借币还款
          return isTitle ? this.$t('wallet_notice_0011') : this.$t('wallet_notice_0025');
        case 1004: //资金借出通知-理财借出
          return this.$t('wallet_notice_0014');
        default:
          return this.$t('chat_0018');
        }
      };
    },
    notDiDiService() {
      return item => {
        return (
          item.targetType == '1' && item.id != '1008455862495526912' && item.id != '1032384035881537536' 
          && item.id != this.$paymentId && item.id != this.ActAssistantId
        );
      };
    },
    isDiDiService() {
      return item => {
        return item.id == '1008455862495526912' || item.id == '1032384035881537536' 
        || item.id == this.$paymentId || item.id == this.ActAssistantId;
      };
    },
    groupDraft() {
      return item => {
        return item.targetType == '2' && (item.msgType == 1 || item.msgType == 25 || this.mergeDraf(item)['draftFlag']);
      };
    },
    singleDraft() {
      return item => {
        return item.targetType == '1' && (item.msgType == 1 || item.msgType == 25 || this.mergeDraf(item)['draftFlag']);
      };
    },
    itemFromName() {
      return item => {
        // eslint-disable-next-line max-len
        return item.targetType == '2' ? (item.fromId == UserInfoUtils.getCurrentUserId() ? this.$t('Universal_0037')+': ' : item.fromName + ':') : '';
      };
    },
    isGroupNotice() {
      return item => {
        return (item.msgType == 4 || item.msgType == 5 || item.msgType == 8 || item.msgType == 31) && item.targetType == 2;
      };
    },
    isSingleNotice() {
      return item => {
        return (item.msgType == 4 || item.msgType == 5 || item.msgType == 8 || item.msgType == 31) && item.targetType == 1;
      };
    },
    // findImage() {
    //   return image => {
    //     // let random = (((1 + Math.random()) * 0x10000) | 0).toString(16);
    //     // return fileOperational.getImage(image) + '?' + random;
    //     return fileOperational.getImage(image)
    //   }
    // }
    lastMsgListUpdateTimeArr(){
      //可视区域内 减少watch的数据量 前提入库的消息updateTime一定是实时的
      return this.lastMsgList.slice(0,60).map(o=>o['updateTime'])
    }
  },
  //监控data中的数据变化
  watch: {
    'showLastMsgList.length':function(l){
      // GET_LAST_MSG_LIST 减少非必要的数据查询 SQLUtils.queryLastMsgListFromLocalDB
      sessionStorage.setItem("showLastMsgList",l)
    },
    lastMsgListUpdateTimeArr: {
      immediate: true,
      deep: true,
      handler: function () {
        this.updateShowLastMsgList();
        this.availableScrollHeight = this.lastMsgList.length* SESSION_ITEM_HEIGHT;
      },
    },
    $route(val) {
      if (val.query?.id) {
        this.isCurCode = val.query.id;
      }
    }
  },
  filters: {
    diffTimeHand(val) {
      return diffTime(val);
    }
  },
  //方法集合
  methods: {
    // 个人名称长度
    userNameWidth(item) {
      let timestamp = diffTime(item.timestamp);
      if (item.inviteCodeType) {
        // 需要展示靓号
        if (timestamp.includes('/')) {
          return '54%';
        } else if (timestamp.includes(':')) {
          return '65%';
        } else if (timestamp === '昨天') {
          return '67%';
        } else if (timestamp === 'Yesterday') {
          return '52%';
        }
      } else {
        if (timestamp.includes('/')) {
          return '70%';
        } else if (timestamp.includes(':')) {
          return '84%';
        } else if (timestamp === '昨天') {
          return '84%';
        } else if (timestamp === 'Yesterday') {
          return '68%';
        }
      }
    },
    // didiService名称长度
    didiServiceWidth(item) {
      let timestamp = diffTime(item.timestamp);
      if (timestamp.includes('/')) {
        return '71%';
      } else if (timestamp.includes(':')) {
        return '80%';
      } else if (timestamp === '昨天') {
        return '83%';
      } else if (timestamp === 'Yesterday') {
        return '70%';
      }
    },
    // 群名称长度
    groupNameWidth(item) {
      let timestamp = diffTime(item.timestamp);
      if (timestamp.includes('/')) {
        // 年/月/日
        if (Number(item.people) > 999) {
          return '51%';
        } else if (Number(item.people) < 1000 && Number(item.people) > 99) {
          return '55%';
        } else if (Number(item.people) < 100 && Number(item.people) > 9) {
          return '59%';
        } else if (Number(item.people) < 10 && Number(item.people) > 0) {
          return '63%';
        }
      } else if (timestamp.includes(':')) {
        // 时:分
        if (Number(item.people) > 999) {
          return '61%';
        } else if (Number(item.people) < 1000 && Number(item.people) > 99) {
          return '66%';
        } else if (Number(item.people) < 100 && Number(item.people) > 9) {
          return '70%';
        } else if (Number(item.people) < 10 && Number(item.people) > 0) {
          return '74%';
        }
      } else if (timestamp === '昨天') {
        // 昨天
        if (Number(item.people) > 999) {
          return '65%';
        } else if (Number(item.people) < 1000 && Number(item.people) > 99) {
          return '69%';
        } else if (Number(item.people) < 100 && Number(item.people) > 9) {
          return '73%';
        } else if (Number(item.people) < 10 && Number(item.people) > 0) {
          return '77%';
        }
      } else if (timestamp === 'Yesterday') {
        // Yesterday
        if (Number(item.people) > 999) {
          return '49%';
        } else if (Number(item.people) < 1000 && Number(item.people) > 99) {
          return '53%';
        } else if (Number(item.people) < 100 && Number(item.people) > 9) {
          return '57%';
        } else if (Number(item.people) < 10 && Number(item.people) > 0) {
          return '61%';
        }
      }
    },
    updateShowLastMsgList(){
      let len = this.showLastMsgList.length;
      this.showLastMsgList = this.lastMsgList.slice(
        0,
        Math.max(len, SESSION_PAGESIZE)
      );
      console.log(this.showLastMsgList.length);
      if (this.$route.query?.id) {
        this.isCurCode = this.$route.query.id;
        this.showCurrentChooseIntoViewPort(this.$route.query.id);
      }
    },
    loadMoreSessionList() {
      let len=this.showLastMsgList.length;
      console.log(len);
      this.showLastMsgList = [...this.showLastMsgList, ...this.lastMsgList.slice(len, len+SESSION_PAGESIZE)];
    },
    findImage(image) {
      return fileOperational.getImage(image, true)
    },
    // win 拖拽之后 scollview 刷新
    winResize() {
      this.$refs?.scroll?.update?.();
      console.log('scroll ===> 滑动更新')
      this?.$refs?.scroll?.handleScroll?.();
    },

    async showCurrentChooseIntoViewPort(chooseId = "") {
      if(!this.isCurCode==chooseId) return
      await this.$nextTick();
      let ele = document.getElementById(chooseId);
      if (chooseId && ele && !this.isInViewPort(ele)) {
        ele.scrollIntoView();
      }
    },
    isInViewPort (el) {
      const viewPortHeight = window.innerHeight-60;//hearer
      const top = el.getBoundingClientRect() && el.getBoundingClientRect().top
      // console.warn("%c~~~~~~~~", "font-size:40px;",top);
      if(top>=0&&top<viewPortHeight){
        return true
      }else{
        return false
      }
    },
    ...mapActions([CHAT_REST_SEND, SEND_READ_MESSAGE]),
    ...mapMutations([
      SET_CHAT,
      CLEAR_CHAT,
      ADD_LAST_MSG_LIST,
      DEL_LAST_MSG_LIST,
      CHAT_REST_SEND,
      SOCKET_STATUS,
      NET_STATUS,
      'GET_SEARCH_GROUP',
      'GET_SEARCH_FRIENDS'
    ]),
    // 全局搜索 showReceiverName
    showReceiverName(item) {
      /*if ((item.targetName && item.msgType == '4') || item.msgType == '7') {
        return item.targetName;
      }*/
      if ((item.refMsgBody?.users && item.msgType == '4') || item.msgType == '7') {
        let isMe=(item.refMsgBody?.users?.[0]?.id||item.refMsgBody?.users?.[0]?.userId)==localStorage.userId?this.$t('Universal_0036'):'';
        return isMe||item.refMsgBody?.users[0].name || item.refMsgBody?.users[0].nickName;
      }
      return '';
    },
    showSenderName(item) {
      if (item.msgType == '4' || item.msgType == '7') {
        if (
          item.fromType == '308' ||
          item.fromType == '309' ||
          item.fromType == '382' ||
          item.fromType == '312' ||
          item.fromType == '384' ||
          item.fromType == '313' ||
          item.fromType == '383'
        ) {
          return item.fromName  || item.refMsgBody.fromName;
        } else {
          return item.fromName || item.refMsgBody.item ||  item.targetName;
        }
      }
      return '';
    },
    compare() {
      return (obj1, obj2) => {
        if (obj1['id'] === '1008455862495526912') return -1;
        if (obj2['id'] === '1008455862495526912') return 1;
        let value1 = Number(obj1['topFlag']);
        let value2 = Number(obj2['topFlag']);
        if (value1 === value2) {
          return Number(obj2['updateTime']) - Number(obj1['updateTime']);
        }
        return value2 - value1;
      };
    },
    ...mapActions([GET_LAST_MSG_LIST]),
    // 以下为单页面添加鼠标右键事件

    addClick() {
      const options = [];
      if (this.rightClickItem.topFlag == 1) {
        options[0] = {
          name: this.$t('chat_home_0005'),
          enabled: true,
          fun: async () => {
            const res = await overheadAndNoticeFlagById(this.rightClickItem, 'topFlag', '0');
            if(res.code==='200'||res.data?.code==='200'){
              this.$message.success(this.$t('chat_home_0005'));
              this.$store.dispatch('GET_LAST_MSG_LIST');
            } else {
              this.$message.error(res.data?.msg);
            }
          }
        };
      }
      if (!this.rightClickItem.topFlag || this.rightClickItem.topFlag == 0) {
        options[0] = {
          name: this.$t('chat_home_0004'),
          enabled: true,
          fun: async () => {
            const res = await overheadAndNoticeFlagById(this.rightClickItem, 'topFlag', '1');
            if(res.code==='200'||res.data?.code==='200'){
              this.$message.success(this.$t('chat_home_0004'));
              this.$store.dispatch('GET_LAST_MSG_LIST');
            } else {
              this.$message.error(res.data?.msg);
            }
            
          }
        };
      }
      if (!this.rightClickItem.noNoticeFlag || this.rightClickItem.topFlag == 0 || this.rightClickItem.noNoticeFlag == 0) {
        options[1] = {
          name: this.$t('chat_0057'),
          enabled: true,
          fun: async () => {
            const res = await overheadAndNoticeFlagById(this.rightClickItem, 'noNoticeFlag', '1');
            if(res.code==='200'||res.data?.code==='200'){
              this.$message.success(this.$t('chat_0057'));
              this.$store.dispatch('GET_LAST_MSG_LIST');
            } else {
              this.$message.error(res.data?.msg);
            }
          }
        };
      }
      if (this.rightClickItem.noNoticeFlag == 1) {
        options[1] = {
          name: this.$t('chat_0098'),
          enabled: true,
          fun: async () => {
            const res = await overheadAndNoticeFlagById(this.rightClickItem, 'noNoticeFlag', '0');
            if(res.code==='200'||res.data?.code==='200'){
              this.$message.success(this.$t('chat_0098'));
              this.$store.dispatch('GET_LAST_MSG_LIST');
            } else {
              this.$message.error(res.data?.msg);
            }
          }
        };
      }
      options[2] = {
        name: this.$t('chat_home_0010'),
        enabled: true,
        fun: async () => {
          await deleteTSessionsById(this.rightClickItem.id, this.rightClickItem.lastMsgId);
          sessionStorage.removeItem('paymentId');
          localStorage.removeItem('currentChat');
          this.$message.success(this.$t('chat_home_0010'));
          this.$store.dispatch('actionSessionAtDeleteBySessionId', this.rightClickItem.id);
          this.$store.dispatch('GET_LAST_MSG_LIST');
          this.$router.push({ name: "chat" });
          if(this.isCurCode==this.rightClickItem.id){
            this.isCurCode = '';
            this.$store.commit('SET_CURRENT_CHAT',{});
          }
        }
      };
      console.log(this.rightClickItem, options);
      return this.$RightClick(options).popup({
        window: remote.getCurrentWindow()
      });
    },

    rightClick(e, item) {
      this.rightClickItem = {
        id: item.id,
        uniqueCode: item.uniqueCode,
        noNoticeFlag: item.noNoticeFlag,
        topFlag: item.topFlag,
        lastMsgId: item.lastMsgId,
        targetType: item.targetType,
        fromId: item.fromId
      };
      e.preventDefault();
      if (item.id != '1008455862495526912') {
        this.addClick();
      }
    },
    addHand() {
      this.addOrderVisible = true;
    },

    handOpenGroup() {
      // 打开发起群聊弹框
      this.groupVisible = true;
      // this.$refs.sceatGroup.resetFroms()
      // this.dialogAddFriendsVisible = true;
    },
    handCloseGroup() {
      // 关闭发起群聊弹框
      this.groupVisible = false;
    },
    // eslint-disable-next-line no-unused-vars
    async toChat(record, cindex) {
      this.currentChatId = record.id;
      // 切换会话列表之前，处理 CURRENT_CHAT上一条 有人@你 已读
      this.$store.dispatch('actionSessionAtDeleteBySessionId', this.$route.query?.id);
      // console.log('%c~~~~~~~~','font-size:40px;',this)
      this.isCurCode = record.id
      if (record.id == this.$paymentId) {
        sessionStorage.setItem('paymentId', this.$paymentId);
      } else {
        sessionStorage.removeItem('paymentId');
      }
      if (record.id == this.ActAssistantId) {
        sessionStorage.setItem('ActAssistantId', this.ActAssistantId);
      } else {
        sessionStorage.removeItem('ActAssistantId');
      }
      if (this.$route.path !== '/app/chat') {
        if (ChatListUtils.isCurrentChat(record.id)) {
          //重复点击同一个对话框，不刷新页面，防止草稿丢失 如果是登录后第一次点击则不属于这种情况
          return;
        }
      }
      this.isFiveSecondsDelay = false;
      await this.$nextTick()
      // 子路由 async init() commit SET_CURRENT_CHAT
      // 存储当前聊天会话框窗口
      this.$store.dispatch('SET_CURRENT_CHAT', {
        uniqueCode: record.uniqueCode,
        id: record.id,
        sessionIcon: record.sessionIcon,
        sessionName: record.sessionName
      });
      // SET_CURRENT_CHAT SET_CLEAN_UN_MSG 已处理 t_session中unread
      record['unread']=0;
      this.tiemr =
        new Date().getTime() +
        '' +
        Math.random()
          .toString()
          .slice(-6);
      this.CLEAR_CHAT();
      if (record.targetType == 1) {
        if (!this.tiemr) {
          this.tiemr =
            new Date().getTime() +
            '' +
            Math.random()
              .toString()
              .slice(-6);
        }
        //单聊
        this.$router.push({
          path: '/app/chat/single/message',
          query: {
            id: record.id,
            fromId: record.id,
            targetId: record.targetId,
            uniqueCode: encodeURI(record.uniqueCode),
            timer: this.tiemr,
            friendName: encodeURI(record.sessionName),
            item: record,
            unread: record.unread
          }
        });
        this.sendReadedMessage(record);
        this.tiemr = '';
      }
      if (record.targetType == 2) {
        //群聊
        if (record.groupType == '1') {
          this.toqunChat(record);
        }
        if (record.groupType == '0') {
          this.toDiscussionChat(record);
        }
      }
    },
    toqunChat(record) {
      this.$router.push({
        path: '/app/chat/group/message',
        query: {
          targetId: record.id,
          id: record.id,
          timer: new Date().getTime(),
          // friendName: encodeURI(record.refMsgBody.groupName),
          uniqueCode: record.uniqueCode,
          item: record
        }
      });
      sessionStorage.setItem('groupId', record.id);
    },
    toDiscussionChat(record) {
      console.log(record);
      this.$router.push({
        path: '/app/chat/discussion/message',
        query: {
          targetId: record.id,
          id: record.id,
          timer: new Date().getTime(),
          groupType: record.groupType,
          // friendName: encodeURI(record.refMsgBody.groupName),
          uniqueCode: record.uniqueCode,
          item: record
        }
      });
      sessionStorage.setItem('groupId', record.id);
    },
    async sendReadedMessage(record) {
      console.log('record', record);
      let pararms = {
        reqId: uuidv4(),
        targetType: '1', // 单聊1 群聊2
        targetId: record.targetId || record.id,
        fromType: 410,
        fromId: UserInfoUtils.getCurrentUserId(),
        msgType: 23, // 23 已读
        msgBody: JSON.stringify({}),
        msgHeader: JSON.stringify({
          pubKey: '', //this.publickKey,
          version: this.publickKeyVersion,
          msgSeqNo: 1,
          msgSeqTotal: 1,
          effectiveTime: -1,
          sourceSite: null,
          language: window.vm.$i18n.locale,
          sign: null,
          signType: null
        }),
        refMsgBody: {
          // fromName: JSON.parse(localStorage.userInfo).nickName,
          // fromIcon: JSON.parse(localStorage.userInfo).headImg,
        }
      };
      const option = {
        ...pararms,
        refMsgBody: JSON.stringify({
          ...pararms.refMsgBody
        })
      };
      console.log('SEND_READ_MESSAGE === ', record.unread, option);
      if (record.unread > 0) {
        await this.SEND_READ_MESSAGE(option);
      }
      // 子路由 async init() 已调用 $store.dispatch('SET_CURRENT_CHAT' 已调用 SET_CLEAN_UN_MSG
      // this.$store.dispatch('SET_CLEAN_UN_MSG', {
      //   uniqueCode: record.uniqueCode,
      //   id: record.id,
      //   sessionIcon: record.sessionIcon,
      //   sessionName: record.sessionName
      // });

    },
    async storeDiDiServiceIcon() {
      let didiServiceResult = await window.vm.$knex.raw(
        `select friend_id, friend_head_img
        from t_contacts
        where friend_id in ('1032384035881537536','1008455862495526912',${this.$paymentId},${this.ActAssistantId})`
      );
      if (didiServiceResult.length > 0) {
        this.$store.state.common.didiServiceIcons = [];
        for (let result of didiServiceResult) {
          this.$store.state.common.didiServiceIcons.push({
            id: result.friend_id,
            icon: result.friend_head_img
          });
        }
      }
    },
    scrollHandle(index) {
      this.$nextTick(() => {
        if (this.$refs['scroll'] === undefined) return;
        let div = this.$refs['scroll'].$refs['wrap'];
        let arr = Array.from(document.getElementsByClassName('chat-info'));
        div.scrollTo({ behavior: 'smooth', top: arr[index].offsetTop });
      });
    },
    // 替换404图片
    replaceImg(e) {
      const { groupType = '' } = this.lastMsgList.filter(i => i.id === e.target.dataset.key)[0]||{};
      UserInfoUtils.replaceDefaultImg(e, groupType ? 'group' : 'user');
    },
    handleCurrentSessionDelayAtTip(obj = {}, time = 1500) {
      let that = this;
      that.fiveSecondsDelayTimer && clearTimeout(that.fiveSecondsDelayTimer);
      //当前会话id 存在未读的at消息
      let { id } = that.$store.state.chat.currentChat || {};
      //1、存在会话窗口 2、at消息属于当前窗口的某一条at消息、3、禁止二次延迟显示
      if (id && obj['id'] && obj['id'] == id && obj['msgId'] && sessionStorage.lastAtMsgId != obj['msgId']) {
        // console.log(obj);
        that.isFiveSecondsDelay = true;
        that.fiveSecondsDelayTimer = setTimeout(() => {
          that.isFiveSecondsDelay = false;
          clearTimeout(that.fiveSecondsDelayTimer);
          that.fiveSecondsDelayTimer = null;
        }, time);
      }
    },
    // delay time 1500ms
    restoreCurrentSessionAtTip() {
      //当前会话窗口存在at
      this.getCurLastAtById && this.handleCurrentSessionDelayAtTip(this.getCurLastAtById, 1500);
      // 记录上一次 延迟显示的at消息id，禁止二次延迟显示
      let { msgId = '' } = this.getCurLastAtById || {};
      sessionStorage.setItem('lastAtMsgId', msgId);
    },
    async _scrollToTop(){
      console.log('scrollToTop');
      await this.$nextTick();
      if (this.$route.query?.id) {
        this.isCurCode = this.$route.query.id;
      }
      if (this.$refs['scroll'] === undefined) return;
      let div = this.$refs['scroll'].$refs['wrap'];
      let arr = Array.from(document.getElementsByClassName('chat-info'));
      div.scrollTo({ top: arr[0].offsetTop });
    },
    async _checkUnReadMessage(){
      await this.$nextTick();
      // 找出所有未读且没有设置免打扰的列表
      let unreadList = this.lastMsgList.filter(i => i.noNoticeFlag !== '1' && i.unread);
      if (unreadList.length) {
        let theIndex = this.lastMsgList.findIndex(i => i.id === unreadList[0].id);
        // 滚动到指定位置
        this.scrollHandle(theIndex);
        // 打开该聊天窗口
        this.toChat(unreadList[0], theIndex);
      } else {
        this.isCurCode = '';
        this.scrollHandle(0);
      }
    },
    _toChatByTray(chatId) {
      let list = this.showLastMsgList;
      let i = list.findIndex((o) => o["id"] == chatId);
      if (i >= 0) {
        this.toChat(list[i], i);
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    bus.$on('scrollToTop', this._scrollToTop);
    bus.$on('checkUnReadMessage', this._checkUnReadMessage);
    bus.$on('jumpToChatById',this._toChatByTray);
    this.userId = localStorage.userId;
    this.$store.dispatch('GET_LAST_MSG_LIST');
    if (localStorage.getItem('currentChat')) {
      this.isCurCode = JSON.parse(localStorage.getItem('currentChat'))?.id;
    }
    // console.log('lastMsgList-- ',this.lastMsgList)
  },
  mounted() {
    this.storeDiDiServiceIcon();
    ipcRenderer.on('current-session-at', this.restoreCurrentSessionAtTip);
    this.$remote.getCurrentWindow().addListener('resize',this.winResize);
  },
  beforeDestroy() {
    this.fiveSecondsDelayTimer && clearTimeout(this.fiveSecondsDelayTimer);
    this.fiveSecondsDelayTimer=null;
    bus.$off('scrollToTop', this._scrollToTop);
    bus.$off('checkUnReadMessage', this._checkUnReadMessage);
    bus.$off('jumpToChatById',this._toChatByTray);
    ipcRenderer.removeListener('current-session-at', this.restoreCurrentSessionAtTip);
    this.$remote.getCurrentWindow().removeListener('resize',this.winResize);

  }, //生命周期 - 销毁之前
  beforeRouteLeave(to, from, next) {
    next();
  }
};
</script>

<style lang="less">
[v-cloak] {
  display: none;
}
.single-notice .notify {
  text-align: left !important;
}
.newmsg {
  color: #999;
  font-size: 12px;
}
.searchListBox {
  width: 269px !important;
  height: 70% !important;
  overflow-y: scroll !important;
  padding: 0;
  // 整体部分
  &::-webkit-scrollbar {
    display: block !important;
    width: 6px;
    background-color: rgba(0, 0, 0, 0);
  }
  // 滑动轨道
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0);
  }
  // 滑块
  &::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0);
  }

  .list {
    width: 100%;
    & > p {
      padding: 3px 10px;
      font-size: 13px;
      color: #333;
      background-color: #f2f2f2;
      display: flex;
      justify-content: space-between;
      span {
        cursor: pointer;
        color: #02a7f0;
      }
    }
    & > ul li {
      display: flex;
      justify-content: flex-start;
      padding: 8px 0 8px 15px;
      border-bottom: 1px solid #dddddd;
      &.active{
        background:#e7e7e7;
      }
      img {
        border-radius: 50%;
        width: 40px;
        height: 40px;
      }
      .level-icon img{
        width: auto;
      }
      /*& > span {*/
      /*  font-size: 12px;*/
      /*  padding: 5px 0 0 0;*/
      /*  & > p:nth-child(2) {*/
      /*    font-size: 12px;*/
      /*    color: #999999;*/
      /*  }*/
      /*}*/
    }
  }
}
.searchListBox:hover {
  // 滑动轨道
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: transparent;
  }
  // 滑块
  &::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: #d2d2d2;
  }
}
</style>

<style lang="less" scoped>
//@import url(); 引入公共css类
.disturb {
  position: absolute;
  bottom: 5px;
  right: 10px;
}
.my_class {
  text-align: left;
  display: inline-block;
  width: 200px;
  margin: 15px 0 15px 10px;
}
.my_class input.el-input__inner {
  font-size: 12px;
  border-radius: 5px;
  border: none;
  background: #e6e6e6;
  height: 30px;
  line-height: 30px;
  color: #555;
}
.apply_number + .el-badge {
  position: absolute;
}
.apply_number .el-badge__content.is-fixed {
  top: 10px;
  right: 13px;
}
.chat-info {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 66px;
  // height: 68px;
  // margin: 0 0 0 10px;
  border-bottom: 1px solid #e4e4e4;
  // border-right: 1px solid rgba(221, 221, 221, 1);
  cursor: pointer;
  box-sizing: border-box;
  #text {
    user-select: none !important;
  }
  &:hover {
    background: #f7f7f7;
  }
  .line {
    margin-left: 10px;
    width: calc(100% - 10px);
    height: 1px;
    border-bottom: 1px solid #e4e4e4;
  }
}
.user-head {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  margin: 0 10px;

  /deep/ .el-badge__content {
    font-size: 10px;
    background-color: #f5222d;
    border-radius: 20px;
    border: none;
  }

  /deep/ .el-badge__content.is-fixed {
    top: 5px;
    right: 14px;
    transition: none !important;
  }
}
.redDot /deep/ .el-badge__content.is-fixed{
    top: 5px;
    right: 8px;
}
.msgUnread /deep/ .el-badge__content.is-fixed{
  right: 22px;
}
.user-head img {
  display: block;
  width: 38px;
  height: 38px;
  border-radius: 50%;
}
.user-words {
  width: 180px;
  flex: auto;
  padding: 0 10px 0 0;
}
.active {
  background-color: #e4e4e4 !important;
}
.topflag {
  // background-color: #f1f1f1;
  border-top: 1px solid #ececec;
  background-color: #f6f6f6;
}
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #191f25;
  line-height: 20px;
  display: inline-block;
  overflow: hidden;
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  white-space: pre;
  // flex: 1;
  .iconfont {
    font-size: 12px;
  }
}
.user-sign {
  word-break: break-all;
  font-size: 12px;

  font-weight: 500;
  color: rgba(153, 153, 153, 1);
  line-height: 20px;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  -webkit-box-flex: 1;
  // flex: 1;
  white-space: pre;
}
.user-time {
  font-size: 12px;

  font-weight: 500;
  color: rgba(153, 153, 153, 1);
  line-height: 17px;
  position: absolute;
  right: 10px;
}
.chat-list {
  height: calc(100vh - 60px);
  position: relative;
  overflow-y: scroll;
  // /deep/ .el-scrollbar__view{
  //   height: 100%;
  // }
}

.notice-msg {
  color:#999;
  font-size: 12px;
  width: 120px !important;
  margin-left: -10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  -webkit-box-flex: 1;
}
</style>
