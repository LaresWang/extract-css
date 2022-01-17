<!-- layout -->
<template>
  <div class="layout" ondragstart="return false">
    <el-container>
      <el-aside class="flex flex-direction align-center leftElside" :style="{ width: leftWidth }">
        <el-menu
          router
          class="el-menu-vertical-demo noDrag"
          :background-color="bgcolor"
          :default-active="onRoutes()"
          :show-timeout="1000"
          @dblclick.native="selectMenu"
        >
          <div class="user-info flex flex-direction align-center drag" :style="{ width: leftWidth }">
            <div class="user-head userAvater noDrag">
              <member-card :image="userInfo.headImg" :user-id="userInfo.id" :is-group-member="false"></member-card>
            </div>
            <!-- <div class="user-name" v-show="!isCollapse">{{userInfo.nickName}}</div> -->
          </div>
          <el-menu-item :index="item.path" v-for="item in menuList" :key="item.path" style="padding: 0 " class="leftSide">
            <i :class="item.icon" :title="item.name"></i>
            <el-badge is-dot v-if="item.path == '/app/contact' && totalNumber > 0" class="apply_number"></el-badge>
            <el-badge is-dot v-else-if="item.path == '/app/chat' && orShowDot" class="newchatmsg"></el-badge>
          </el-menu-item>
        </el-menu>
        <div v-popover:popover style="height:50px;color:#909399;" class="noDrag set-icon">
          <img class="user-bottom" src="../assets/images/menu_set.png"  @click="Topass(2)">
          <el-badge is-dot v-if="idDotShow"></el-badge>
        </div>
      </el-aside>
      <el-container>
        <!-- 设置新增3个弹框 密钥管理 账号安全 设置 -->
        <el-dialog
          title="密钥管理"
          @close="handCloseGroupSecretKey"
          :close-on-click-modal="false"
          width="550px"
          :visible="secretKeyVisible"
          class="key-manage"
        >
          <SetsecretKey ref="chatSet" :visible="secretKeyVisible" />
        </el-dialog>
        <el-dialog
          title="账号安全"
          @close="handCloseGroupSetSafe"
          :close-on-click-modal="false"
          width="550px"
          :visible="SafetyVisible"
          class="account-safe"
        >
          <SetSafe ref="chatSet" />
        </el-dialog>

        <!-- <el-dialog
          :title="$t('Universal_0065')"
          @close="handCloseGroupSetgeneral"
          :close-on-click-modal="false"
          width="550px"
          :visible="SetgeneralVisible"
          class="setdialog"
        >
          <Setgeneral ref="chatSet" />
        </el-dialog> -->
        <el-dialog
          @close="handCloseGroupSetgeneral"
          :close-on-click-modal="false"
          width="550px"
          :visible="SetgeneralVisible"
          class="setdialog"
        >
          <div slot="title" id="setTitleClick" class="setTitle" @click="multiClick">
            <span>{{$t('Universal_0065')}}</span>
            <img src="../assets/images/lock.png" alt="" v-if="showLock">
          </div>
          <Setgeneral ref="chatSet" />

          <el-dialog
            width="30%"
            :title="$t('Universal_0059')"
            :visible.sync="innerVisible"
            center
            append-to-body
            :close-on-click-modal="false"
            :show-close="false"
            class="setTip"
          >
          <div class="tipInfo">确定加入DiDimessage内测？</div>
          <div class="tipBtn">
            <el-button type="info"  size="medium" class="cancel" @click="innerVisible=false">
              {{ $t('Universal_0063') }}
            </el-button>
            <el-button type="primary"  size="medium" class="submit" @click="sureJoinInside">
              {{ $t('Universal_0062') }}
            </el-button>
          </div>
          </el-dialog>
        </el-dialog>
        <!-- <DialogSetSafe :dialogGroupVisible='SafeyVisible' @handCloseGroup='handCloseGroupSafe' /> -->

        <!-- <AddFriGrop v-if="addOrderVisible" :visible.sync="addOrderVisible"  @handCloseFri='handCloseFri'/>
        <DialogGroupVisible :dialogGroupVisible='groupVisible' @handCloseGroup='handCloseGroup' />-->
        <!-- <router-view v-if="/^\/app\/chat/.test($route.path)" /> -->
        <el-main :style="{ border: mainBorder, borderLeft: 'none' }">
          <div class="flex align-baseline justify-end topwork2">
            <i @click="hideWin()" class="i1" v-if="platform != 'darwin'">
              <img class="img_13" src="../assets/images/di_closewin.png"
                   :title="$t('Universal_0375')" />
            </i>
            <i @click="sizeWindow()" v-if="!isMaxed && platform != 'darwin'" class="i1">
              <img class="img_13" src="../assets/images/di_maxmize.png"
                   :title="$t('Universal_0376')" />
            </i>
            <i @click="sizeWindow()" v-if="isMaxed && platform != 'darwin'" class="i1">
              <img class="img_13" src="../assets/images/di_minmize.png"
                   :title="$t('Universal_0377')" />
            </i>
            <i class="i2" @click="outToTray($event)" v-if="platform != 'darwin'">
              <img class="img_12" src="../assets/images/di_min_close.png"
                   :title="$t('Universal_0378')" />
            </i>
          </div>
          <router-view  />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
// import DialogGroupVisible from "../view/add-friends-group/dialog/sceate-groups";
// import AddFriGrop from "../view/add-friends-group/add";
import _ from 'lodash'
import Setgeneral from '../view/setting/Set'; //设置
import SetSafe from '../view/setting/SafeSetting'; //安全设置
import SetsecretKey from '../view/setting/form/secretKey'; //密钥管理
import MemberCard from '@/components/memberCard/MemberCard';
import { mapState, mapMutations, mapActions,mapGetters } from 'vuex';
import { LOGIN_OUT, GET_USER_INFO, SET_LAST_MSG_LIST, WIN_ACTIVE,LOGOUT } from '@/store/types';
// import Ws from '@/utils/ws';
import { ipcRenderer } from 'electron';
import bus from '@/utils/eventbus';
const appVersionCode = require('../../package.json').version_code;
const appVersion = require('../../package.json').version;
import {check_update_by_server} from "@/server";
import { screenWindow } from "@/utils/screenWindow";
// import downloadSDK from '../services/supplementaryDownload';
// downloadSDK();

export default {
  //import引入的组件需要注入到对象中才能使用
  components: { SetSafe, SetsecretKey, Setgeneral, MemberCard },
  data() {
    //这里存放数据
    return {
      closeDrawer:false,
      platform: process.platform,
      leftWidth: 0,
      mainBorder: 'none',
      direction: 'ttb',
      defaultActive: '0',
      searchListBox: false,
      groupVisible: false,
      Imgvisible: false,
      secretKeyVisible: false,
      SafetyVisible: false,
      SetgeneralVisible: false,
      addOrderVisible: false,
      bgcolor: '#272A2D',
      isCollapse: true,
      keywrod: '',
      setvis: false,
      isMaxed: false,
      latestVersion: '',
      showLock:false,
      innerVisible:false,

      timer:null,
      waitTime:500, // 该时间间隔内点击才算连续点击（单位：ms）
      lastTime: new Date().getTime(), // 上次点击时间,
      count:0, // 连续点击次数
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapGetters(['lastMsgList']),
    ...mapState({
      userInfo: obj => {
        return obj.state.userInfo;
      },
      totalNumber: state => {
        return state.chat.totalSystemNumber;
      },
      // applyFriendNumber: (state) => {
      //   return state.chat.applyFriendNumber;
      // },
      // rejectFriendNumber: (state) => {
      //   return state.chat.rejectFriendNumber;
      // },
      // requestFriendNumber: (state) => {
      //   return state.chat.requestFriendNumber;
      // },
      // 小红点
      orShowDot: state => {
        return state.chat.lastMsgList.some(item => {
          return item.unread > 0;
        });
      },
      versionUpdateInfo: obj => {
        return obj.state.versionUpdateInfo
      }
    }),
    socketStatus() {
      return this.$store.state.common.socketStatus;
    },
    // 小红点
    hasUnread(){
      return this.lastMsgList.map(o=>o.unread)
    },
    idDotShow() {
      // eslint-disable-next-line max-len
      return this.versionUpdateInfo.versionSign !== undefined && this.versionUpdateInfo.versionSign !== false || (this.latestVersion && this.latestVersion !== appVersion);
    },
    menuList() {
      return [
        // {
        //   name: "导览",
        //   path: "/app/guide",
        //   icon: "el-icon-setting"
        // },
        {
          name: this.$t('opinions_0027'),
          path: '/app/chat',
          icon: 'el-icon-chat-dot-square'
        },
        {
          name: this.$t('chat_search_0003'),
          path: '/app/contact',
          icon: 'el-icon-user'
        }
        // {
        //   name: "资产",
        //   path: "/app/funds/general/wallet",
        //   icon: "el-icon-wallet"
        // },
        // {
        //   name: "看点",
        //   path: "/app/viewpoint",
        //   icon: "el-icon-view"
        // },
        // {
        //   name: "设置",
        //   path: "/app/chatsetting",
        //   icon: "el-icon-setting",
        //   className:'lastli'
        // }
      ];
    }
  },
  //监控data中的数据变化
  watch: {
    orShowDot(val) {
      if (val == false) {
        const ipc = require('electron').ipcRenderer;
        ipc.send('no-message');
      }
    },
    versionUpdateInfo: {
      immediate: true,
      deep: true,
      handler: function (v) {
        if (!v) {
          // 版本一样
          this.latestVersion = appVersion;
        } else {
          this.getUpdateVersion();
        }
        if (!v.updateInfo || v.updateInfo === undefined) {
          // 没有数据
          this.getUpdateVersion();
        }
      }
    },
    $route:{
      immediate:true,
      deep:true,
      handler:function({name=''}){
        // window非聊天窗口快捷键截图
        if(process.platform !== "darwin"){
          ipcRenderer.removeListener('windows-captureShortcut', this._handleWinClipboardWriteImage);
          if(['contact','chat'].includes(name)){
            ipcRenderer.on('windows-captureShortcut', this._handleWinClipboardWriteImage);
          }
        }
      }
    }, 
  },
  //方法集合
  methods: {
    ...mapMutations([LOGIN_OUT, SET_LAST_MSG_LIST, WIN_ACTIVE,LOGOUT]),
    ...mapActions([GET_USER_INFO, 'GET_SEARCH_SEEING', 'GET_SEARCH_GROUP', 'GET_SEARCH_FRIENDS']),

    joinInside(){
      console.log('process.env.VUE_APP_IS_SIGNAL',process.env.VUE_APP_IS_SIGNAL);

      // 统计点击次数
      let currentTime = new Date().getTime();
      // 计算两次相连的点击时间间隔
      this.count = (currentTime-this.lastTime) < this.waitTime ? this.count + 1 : 1;

      // console.log('currentTime',currentTime);
      // console.log('lastTime',this.lastTime);
      // console.log('currentTime-this.lastTime',currentTime-this.lastTime);
      console.log('this.count',this.count);
      this.lastTime = new Date().getTime();
      // console.log('this.lastTime-2',this.lastTime);
      if (this.count > 4) {
        // 连续点击超过4次的响应事件
        console.log('点击超过4次了');
        this.innerVisible=true; 
      }

    },
    multiClick: function(){
      // 判断当前PC为加密版本且未开启加密模式
      if (this.showLock) {
        console.log('已开启加密模式');
        this.innerVisible=false;
        return;
      }
      // _.debounce(this.joinInside)()
      _.debounce(this.joinInside,10)()
    },
    async sureJoinInside(){
      await window.vm.$knex('t_userInfo').where({
        id: localStorage.getItem('userId')
      }).update({
        isSign: 1
      })
      this.innerVisible=false;
      this.showLock=true;
      this.$store.commit('LOGIN_OUT');
    },
    onRoutes() {
      let newVal = this.$route.path;
      // this.navselected=1;
      for (let menu of this.menuList) {
        if (newVal.indexOf(menu.path) > -1) {
          return menu.path;
        }
      }
    },
    selectMenu() {
      if (this.$route.path === '/app/chat') {
        this.$nextTick(() => {
          bus.$emit('checkUnReadMessage');
        });
      }
    },
    outToTray() {
      this.$remote.getCurrentWindow().hide();
    },
    sizeWindow() {
      const browserWindow = this.$remote.getCurrentWindow();
      if (!this.isMaxed) {
        browserWindow.maximize();
        this.isMaxed = true;
      } else {
        browserWindow.unmaximize();
        this.isMaxed = false;
      }
    },
    hideWin() {
      // const browserWindow = window.vm.$remote.getCurrentWindow();
      this.$remote.getCurrentWindow().minimize();
    },
    // show(a){
    //   if(a=='left'){
    //     this.isCollapse = false
    //   } else if(a=='right'){
    //     this.isCollapse = true
    //   }
    // },
    // menuChange(e) {
    //   this.$router.push({
    //     path: e
    //   });
    // },
    addHand() {
      this.addOrderVisible = true;
    },

    handOpenGroup() {
      // 打开发起群聊弹框
      this.groupVisible = true;
      // this.dialogAddFriendsVisible = true;
    },
    handCloseGroup() {
      // 关闭发起群聊弹框
      this.groupVisible = false;
    },
    handCloseGroupSecretKey() {
      this.secretKeyVisible = false;
    },
    handCloseGroupSetSafe() {
      this.SafetyVisible = false;
    },
    handCloseGroupSetgeneral() {
      this.SetgeneralVisible = false;
      this.$refs.chatSet.toUser(); //每次打开弹框，自动切换到账号设置
    },
    setGruop() {
      this.setvis = true;
    },
    setCloseGruop() {
      this.setvis = false;
    },
    handCloseFri() {
      this.addOrderVisible = false;
    },
    search() {
      if (!this.keywrod) {
        this.$message.error(this.$t('Universal_0240'));
        return;
      }
      // this.GET_SEARCH_SEEING({
      //   pageSize: 10,
      //   pageNumber: 1,
      //   keyword: this.keywrod
      // });
      this.GET_SEARCH_GROUP({
        param: this.keywrod
      });
      this.GET_SEARCH_FRIENDS({
        code: this.keywrod
      });
      this.$store.state.search.keyword = this.keywrod;
      if (this.$route.path == '/app/search') {
        //
      } else {
        this.$router.push({
          path: '/app/search'
        });
      }
    },
    Topass(i) {
      switch (i) {
      case 0:
        this.secretKeyVisible = true;
        if (this.$refs.secretkey) {
          this.$refs.secretkey.checkRsaPrivate();
        }
        break;
      case 1:
        this.SafetyVisible = true;
        break;
      case 2:
        this.SetgeneralVisible = true;
        break;
      }
    },
    goPersonSettingHand() {
      if (this.$route.path == '/app/setting') return;
      this.$router.push({
        path: '/app/setting'
      });
    },
    async resetAllsessionsUnread(event,isWinShow){
      await this.$knex('t_sessions').update({ unread: 0,isAt: 0 });
      if(!isWinShow){
        // this.$router.push({name:"chat"});
        this.getLastMsgList();
      }
      ipcRenderer.send('update-badge', [])//处理window托盘、mac通知
    },
    getLastMsgList(){
      sessionStorage.removeItem('curChatUnvisibleTray');// 最小化 不可见时 当前对话窗口的消息计数
      this.$store.dispatch('GET_LAST_MSG_LIST');
    },
    async toChat(e,sessionId){
      if(!/^\/app\/chat/.test(this.$route.path)){
        this.$router.push({name:"chat"});
      }
      // await this.$knex('t_sessions').update({ unread: 0 }).where({id});
      // await this.$nextTick();
      // this.$remote.getCurrentWindow().show();
      sessionId && bus.$emit('jumpToChatById',sessionId);
    },
    _maximize(){
      this.isMaxed = true;
      console.log('maximize', this.isMaxed);
    },
    _unmaximize(){
      this.isMaxed = false;
      console.log('unmaximize', this.isMaxed);
    },
    // 请求版本接口
    async getUpdateVersion() {
      const updateInfo = await check_update_by_server({
        currentVersion: appVersionCode
      });
      if (updateInfo.data) {
        this.latestVersion = updateInfo.data.versionCode;
      }
    },
    // window非聊天窗口快捷键截图
    // eslint-disable-next-line no-unused-vars
    _handleWinClipboardWriteImage(e,globalShortcutBol){
      console.log('~~~~~window非聊天窗口快捷键截图~~~~~~~~~~')
      // true 快捷键截图
      screenWindow(globalShortcutBol);
    },
    //快捷键Ctrl+f操作
    onsearch(){
      let groupSearch = document.getElementById('groupSearch');//群成员搜索
      let dissSearch = document.getElementById('dissSearch'); //组成员搜索
      let forwardMsg = document.getElementById('forwardMsg'); //转发搜索input
      let addFriSearch = document.getElementById('addFriSearch'); //添加好友搜索
      let addGroupSearch = document.getElementById('addGroupSearch'); //添加社区搜索
      let groupSystemAbleMem ='';
      let dissSystemAbleMem ='';
      let GroupInviteVisible ='';
      let addFriVisible = null;
      let addGroupVisible = null;
      if(groupSearch){
        groupSystemAbleMem = groupSearch.getAttribute('code')
      }
      if(dissSearch){
        dissSystemAbleMem = dissSearch.getAttribute('code')
      }
      if(forwardMsg){
        GroupInviteVisible = forwardMsg.getAttribute('code')
      }
      if(addFriSearch){
        addFriVisible = addFriSearch.getAttribute('code')
      }
      if(addGroupSearch){
        addGroupVisible = addGroupSearch.getAttribute('code')
      }
      console.log('search on blur', 
        document.getElementById('searchAll'),
        document.getElementById('groupSearch'),groupSystemAbleMem,document.getElementById('dissSearch'))
      if(forwardMsg && GroupInviteVisible){
        forwardMsg.focus()
      }else if(groupSearch && groupSystemAbleMem === 'true'){
        groupSearch.focus()
      }else if(dissSearch && dissSystemAbleMem){
        dissSearch.focus()
      }else if(addFriSearch && addFriVisible){
        addFriSearch.focus()
      }else if(addGroupSearch && addGroupVisible){
        addGroupSearch.focus()
      }else{
        document.getElementById('searchAll').focus() //全局搜索
      }
    },
    toggleActive(e, flag){
      this[WIN_ACTIVE](flag);
    },
    _closeSocket(){
      this.LOGOUT();
    },
    jumpToChat() {
      if (!this.$route.path.includes('/app/chat')) {
        this.$router.push('/app/chat')
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  async created() {
    this.GET_USER_INFO();
    // Ws.init(this);
    if (process.platform !== 'darwin') {
      this.leftWidth = '60px';
      this.mainBorder = '#ddd solid 1px';
    } else {
      this.leftWidth = '70px';
      this.mainBorder = 'none';
    }
    const userIsSigns = await window.vm.$knex('t_userInfo').where({ id: localStorage.getItem('userId') });
    console.log('settings-->',userIsSigns);
    this.showLock = userIsSigns[0].isSign;
    this.$remote.getCurrentWindow().addListener('maximize',this._maximize);
    this.$remote.getCurrentWindow().addListener('unmaximize',this._unmaximize)
    // socket.init();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    ipcRenderer.on('reset-all-session-unread', this.resetAllsessionsUnread);
    ipcRenderer.on('jump-to-chat-by-id', this.toChat);
    ipcRenderer.on('get-last-msg-list', this.getLastMsgList);
    ipcRenderer.on('onsearch', this.onsearch); //全局搜索快捷键
    ipcRenderer.on('activate', this.toggleActive)
    ipcRenderer.on('closeSocket', this._closeSocket);
    ipcRenderer.on('jump-to-chat', this.jumpToChat);
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    ipcRenderer.removeListener('closeSocket', this._closeSocket);
    this.$remote.getCurrentWindow().removeListener('maximize',this._maximize);
    this.$remote.getCurrentWindow().removeListener('unmaximize',this._unmaximize)
    ipcRenderer.removeListener('reset-all-session-unread', this.resetAllsessionsUnread);
    ipcRenderer.removeListener('jump-to-chat-by-id', this.toChat);
    ipcRenderer.removeListener('get-last-msg-list', this.getLastMsgList);
    ipcRenderer.removeListener('onsearch', this.onsearch);
    ipcRenderer.removeListener('activate', this.toggleActive)
    // window非聊天窗口快捷键截图
    if(process.platform !== "darwin"){
      ipcRenderer.removeListener('windows-captureShortcut', this._handleWinClipboardWriteImage);
    }
    ipcRenderer.removeListener('jump-to-chat', this.jumpToChat);
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less">
.setdialog {
  .el-dialog__header{
    padding:15px 20px 15px;
    
    .setTitle{
      width: 100px;height: 26px;line-height: 26px;
      font-size: 18px;color: #303133;

      img{
        width: 20px;height: 20px;
        vertical-align: middle;
        margin-left: 5px;
        margin-top: -5px;
      }
    }
  }
  .el-dialog__body {
    padding: 0 0 30px;
    border-top: #e7e7e7 solid 1px;
  }
}
.setTip{
  .el-dialog--center .el-dialog__body{
    padding: 0 25px 25px;
  }
  .tipInfo{
    width: 100%;text-align: center;
    font-size: 17px;
    color: #333;
    margin: 20px 0 35px;
  }

  .tipBtn{
    text-align: center;
    button{
      width: 100px;
      font-size: 15px;letter-spacing: 1px;
    }

    .el-button--info{
      background-color: #fff;
      border-color: #2F54EB;
      color: #2F54EB;
    }
  }
}


.topwork2 {
  -webkit-app-region: drag;
  // background: #fff;
  height: 21px;
  padding: 0;
  position: fixed;
  top: 2px;
  right: 0;
  width: calc(100% - 340px);
  z-index: 1000;
  .i1 {
    &:hover {
      background: #e7e7e7;
    }
  }
  .i2 {
    padding-right: 8px;
    &:hover {
      background: #fa5151;
    }
  }
  // img,
  i {
    padding: 3px 8px 0;
    display: inline-block;
    -webkit-app-region: no-drag;
  }
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 100%;
  min-height: 400px;
}
.el-menu--collapse {
  width: 60px;
}
.el-menu {
  border-right: none;
  .el-menu-item:nth-child(6) {
    margin-top: 160px;
  }
}
.my_class {
  text-align: left;
  display: inline-block;
  width: 200px;
}
.my_class input.el-input__inner {
  font-size: 12px;
  border-radius: 5px;
  border: none;
  background: #f6f6f6;
  border: 1px solid #e4e4e4;
  height: 30px;
  line-height: 30px;
  color: #555;
}
.newchatmsg {
  position: absolute;

  /deep/ .el-badge__content.is-dot {
    margin-top: -15px;
  }
}
.apply_number {
  position: absolute;
}
.apply_number .el-badge__content.is-fixed {
  top: 10px;
  right: 13px;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
.visible {
  visibility: hidden;
}
.el-header {
  padding: 0 8px;
  background: #fff;
  box-shadow: 0px 1px 1px 0px rgba(153, 153, 153, 0.3);
  color: #333;
  text-align: center;
  line-height: 60px;
}
.el-menu {
  min-height: 300px;
  height: 95%;
}

.el-aside {
  // background-color: #d3dce6;
  color: #333;
  text-align: center;
  .user-info {
    // width: auto;
    height: 100px;
    margin-bottom: 50px;
    // height: 150px;
    padding: 20px 0 0 0;
    font-size: 18px;
    font-weight: 400;
    color: rgba(51, 51, 51, 1);
    // border-right: solid 1px #e6e6e6;
    box-sizing: border-box;
  }
  .info-btn {
    position: relative;
    // border-right: solid 1px #e6e6e6;
    width: 100%;
    height: 20px;
    .btn {
      position: absolute;
      right: 0;
      top: 10px;
      z-index: 10;
    }
  }
}

.el-main {
  background-color: #ffffff;
  color: #000;
  padding: 0;
  height: 100vh;
  overflow: hidden;
  // text-align: center;
  // line-height: 160px;
}
.el-icon-bell {
  margin: 0 20px;
  cursor: pointer;
}
.el-icon-switch-button {
  cursor: pointer;
  margin-right: 20px;
}

body .el-container {
  // min-height: 100vh;
  height: 100%;
}
.anquan {
  font-size: 12px;

  font-weight: 400;
  color: rgba(47, 84, 235, 1);
  line-height: 17px;
  margin-top: 10px;
}
.width-min {
  width: 60px;
}
.width-max {
  width: 126px;
}

.leftSide {
  /deep/ i {
    margin-right: -1px;
  }
  /deep/ .el-badge {
    margin-left: -5px;
  }

  /deep/ .el-badge__content {
    background-color: #ff0000;
    border: none;
  }

  /deep/ .el-menu-item * {
    vertical-align: text-top;
  }
  font-weight: 400;
  color: rgba(47, 84, 235, 1);
  margin-top: 10px;
}
.set-icon {
  position: relative;
  width: 100%;
  .user-bottom {
    margin: 0 auto 60px;
    cursor: pointer;
    height: 20px;
    width: 20px;
    box-sizing: border-box;
  }
  .el-badge {
    position: absolute;
    top: -1px;
    right: 16px;
    /deep/ .el-badge__content {
      border: none;
      background-color: #ff0000;
    }
  }
}
.width-min {
  width: 60px;
}
.width-max {
  width: 126px;
}
.leftElside {
  border-right: solid 1px #e6e6e6;
  background: #26292c;
  width: 60px;
  overflow: hidden;
}
</style>

<style lang="less" scoped>
// 密钥管理-dialog
.key-manage {
  /deep/ .el-dialog__header {
    border-bottom: 1px solid #efeeee;
    padding-top: 15px;
  }

  /deep/ .el-dialog__title {
    font-size: 14px;

    font-weight: 600;
    color: #333333;
  }
  /deep/ .el-dialog__headerbtn {
    // top: 20px;

    .el-dialog__close {
      color: #000;
    }
  }

  /deep/ .el-dialog__body {
    padding: 15px;
    height: 300px;
  }
}

// 账号安全dialog
.account-safe {
  /deep/ .el-dialog__header {
    border-bottom: 1px solid #efeeee;
    padding-top: 15px;
  }

  /deep/ .el-dialog__title {
    font-size: 14px;

    font-weight: 600;
    color: #333333;
  }
  /deep/ .el-dialog__headerbtn {
    // top: 20px;

    .el-dialog__close {
      color: #000;
    }
  }

  /deep/ .el-dialog__body {
    padding: 15px;
    height: 300px;
  }
}
</style>
