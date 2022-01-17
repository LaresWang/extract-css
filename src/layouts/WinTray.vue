<!--  -->
<template>
  <ul class="win-tray">
   <template v-if="isNoRead">
     <li class="quit" @click="quitApp">{{ exitText }}</li>
   </template>
   <template>
      <li>{{ newMsg }}</li>
      <li
          v-for="item in winTray"
          :key="item['id']"
          @click="toChat(item)"
      >
        <div class="item-left">
          <img v-if="item.sessionIcon" class="item-avatar" :src="item.sessionIcon" alt="">
          <DiscussionIcon
              v-if="!item.sessionIcon && item.groupType==0"
              class="item-avatar"
              iconType="super-mini"
              :name="item.sessionName" />
          <div class="item-desc">
            <span class="item-name"
                  :style="{'max-width': item.people ? maxWidth(item.people) : '140px'}">{{ item["sessionName"] }}</span>
            <div v-if="item.people">({{ item["people"] }})</div>
          </div>
        </div>
        <div class="item-right">{{ item["unread"] > 99 ? '99+' : item["unread"] }}</div>
      </li>
      <li><span @click="ignoreAll">{{ ignoreAllText }}</span></li>
   </template>
  </ul>
</template>

<script>
import { sum } from "lodash";
const { ipcRenderer } = require("electron");
import DiscussionIcon from "@/components/memberIcon/DiscussionIcon";
export default {
  name: "WinTray",
  data() {
    return {
      winTray: [],
      newMsg: '',
      ignoreAllText: '',
      exitText: ''
    };
  },
  components : { DiscussionIcon },
  computed: {
    loginfinished() {
      // return JSON.stringify(store.state.common.userInfo);
      return this.$route.path;
    },
    isNoRead() {
      return sum(this.winTray.map((o) => o["unread"])) <= 0;
    },
    getItemVH() {
      let h = `${100 / (this.winTray.length + 2)}vh`;
      return {
        height: h,
        lineHeight: h,
      };
    }
  },
  methods: {
    maxWidth(people) {
      switch (people.length) {
      case 4:
        return '80px';
      case 3:
        return '86px';
      case 2:
        return '92px';
      case 1:
        return '98px';
      default:
        break;
      }
    },
    quitApp() {
      ipcRenderer.send('update-badge', [])//处理window托盘、mac通知
      ipcRenderer.send('quit-app');
    },
    toChat(item) {
      const { id } = item;
      ipcRenderer.send('to-chat-by-id', id);
    },
    handleTrayMsgArr(e, res) {
      this.winTray = res.noNoticeFlagArr||[];
      this.newMsg = res.newMsg;
      this.ignoreAllText = res.ignoreAll;
      this.exitText = res.exit;
    },
    // 忽略全部
    ignoreAll() {
      ipcRenderer.send('ignore-tray-data');
    }
  },
  mounted() {
    ipcRenderer.on("window-tray-data", this.handleTrayMsgArr);
  },

  beforeDestroy() {
    ipcRenderer.removeListener("window-tray-data", this.handleTrayMsgArr);
  },
};
</script>
<style lang="less" scoped>
.win-tray {
  min-height: 30px;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  background: #FBFBFB;
  >li{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    height: 42px;
    box-sizing: border-box;
    border-bottom: 1px solid #ECECEC;
     &:first-child {
        border-bottom: none;
     }
     &:last-child{
       border-bottom: none;
     }
     &:hover:not(:first-child){
       background-color: #ECECEC;

     }
    &:last-child {
      display: flex;
      justify-content: flex-end;
      color: #2F54EB;
      span {
        cursor: pointer;
      }
      &:hover {
        background-color: #FBFBFB;
      }
    }
    .item-left {
      display: flex;
      flex: 1;
      align-items: center;
      .item-avatar {
        flex: 0 0 32px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }
      .item-desc {
        margin-left: 5px;
        display: flex;
        .item-name {
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: pre;
        }
      }
    }
    .item-right {
      min-width: 16px;
      padding: 0 4px;
      height: 16px;
      line-height: 16px;
      background: red;
      color: #ffffff;
      text-align: center;
      border-radius: 8px;
      font-size: 10px;
      box-sizing: border-box;
    }
    &.quit {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      line-height: 100vh;
      color: #333333;
    }
  }
}
</style>
