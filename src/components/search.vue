<!-- 成员列表-顶部搜索框 -->
<template>
  <div class="searchBox">
    <div style="text-align: left; -webkit-app-region: drag">
      <!-- @keyup.enter.native="keyword == '' ? (searchListBox = false,indexAt = 0,keyword = '') : (searchListBox = true,search())" -->
      <el-input
        clearable
        class="my_class"
        :placeholder="$t('Universal_0058')"
        prefix-icon="el-icon-search"
        v-model="keyword"
        :class="[!serFlag ? 'visible' : '']"
        @input="search()"
        style="-webkit-app-region: no-drag"
        id="searchAll"
        @focus="closeMembers"
      ></el-input>
      <el-popover
        v-model="popoverVisible"
        placement="right"
        trigger="click"
        popper-class="noDrag addMenu"
        style="-webkit-app-region: no-drag; min-width: 125px;"
      >
        <ul class="addbox">
          <li
            style="
              line-height: 35px;
              border-bottom: 1px solid #eee;
              cursor: pointer;
            "
            @click="addHand(0),popoverVisible = false"
          >
            <img draggable='false' src="../assets/images/add.png" /><span>{{ $t('chat_addfriend_0001') }}</span>
          </li>
          <li
            style="
              line-height: 35px;
              border-bottom: 1px solid #eee;
              cursor: pointer;
            "
            @click="addHand(1),popoverVisible = false"
          >
            <img draggable='false' src="../assets/images/creatGroup.png" /><span>{{ $t('chat_joincommunity_0001') }}</span>
          </li>
          <li style="line-height: 35px; cursor: pointer" @click="handOpenGroup">
            <img draggable='false' src="../assets/images/addgroup.png" /><span>{{ $t('chat_createcommunity_0001') }}</span>
          </li>
        </ul>
        <el-button @click="closeMembers(),searchListBox = false" 
        plain size="mini" id="contact-add-btn" slot="reference" style="margin-left: 18px" :class="[!serFlag ? 'visible' : '']"
          >+
        </el-button>
      </el-popover>
    </div>
    <!--搜索结果 弹窗 -->
    <el-drawer
      title
      :with-header="false"
      :visible.sync="searchListBox"
      :direction="direction"
      :modal="false"
      :close-on-press-escape="true"
      custom-class="searchListBox"
      style="min-height: 600px; left: 61px; top: 60px"
      @close="closePopver"
    >
      <div >
        <div v-show="friendsDataMin.length == 0 && groupsData.length == 0 && discussionsData.length == 0" class="no-data">
          <img src="../assets/images/web.png" class="img_search" />
          <p>{{ $t('Universal_0173') }}</p>
        </div>
        <div class="list contacts" v-show="friendsDataMin.length > 0">
          <p>
            {{ $t('chat_search_0003') }}
            <span @click="showAll" v-show="isShowAll">{{ $t('Universal_0271') }}</span>
          </p>
          <ul>
            <li v-for="(item, index) in friendsDataMin" :key="'friend' + index" @click="handGoChatF(item)" 
            :class="{active:indexAt == item.indexAt}" :id="item.inviteCode" disName="1">
              <!--              <img :src="findImage(item.friendHeadImg)" alt="头像"/>-->
              <div class="friend-icon">
                <MemberIcon :image="item.friendHeadImg" iconType="small" :userRank="item.userRank" :vipType="item.vipType" />
              </div>
              <div class="flex flex-direction name-notes-id">
                <div class="nick-name">
                  <span v-html="item.friendNickName"></span>
                  <LevelIcon
                    :inviteCode="item.inviteCode"
                    :userRank="item.userRank"
                    iconType="medium"
                    :vipType="item.vipType"
                    :inviteCodeType="item.inviteCodeType"
                    :listFlag="true"
                  />
                </div>
                <div class="friend-notes" v-show="item.showNotes">
                  <span>{{ $t('book_friend_0002') }}</span><span v-html="item.friendFriendNotes"></span>
                </div>
                <div class="invite-code" v-show="item.showCode">
                  <LuckIdIcon
                    :inviteCode="item.inviteCode"
                    :userRank="item.userRank"
                    iconType="medium"
                    :vipType="item.vipType"
                    :inviteCodeType="item.inviteCodeType"
                    :listFlag="false"
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
        <br />
        <div class="list groups" v-show="groupsData.length > 0">
          <p>{{ $t('chat_search_0005') }}</p>
          <ul>
            <li v-for="(item, index) in groupsData" :key="'group' + index" @click="handGoChatG(item)" 
            :class="{active:indexAt == item.indexAt}" :id="item.groupId" disName="2">
              <div class="group-icon">
                <img class="avatar"
                     :src="findImage(item.groupAvatar)"
                     v-if="item.groupAvatar"
                     :alt="$t('Universal_0184')"
                     @error="replaceImg" />
                <img class="avatar" src="../assets/images/group.png" v-else
                     :alt="$t('Universal_0184')"  />
              </div>
              <div class="flex flex-direction justify-center name-notes-id">
                <div class="nick-name">
                  <span v-html="item.groupName"></span>
                </div>
                <div class="group-code" v-show="item.showCode">
                  <span>{{ $t('book_community_0007') }}: </span><span v-html="item.groupCode"></span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <br />
        <div class="list groups" v-show="discussionsData.length > 0">
          <p>{{ $t('chat_search_0007') }}</p>
          <ul>
            <li v-for="(item, index) in discussionsData" :key="'group' + index" @click="handGoChatDiscussion(item)"
            :class="{active:indexAt == item.indexAt}" :id="item.groupId" disName="3">
              <div class="discussion-icon">
                <DiscussionIcon iconType="medium" :name="item.groupNameOrigin" />
              </div>
              <div class="flex flex-direction justify-center name-notes-id">
                <div class="nick-name">
                  <span v-html="item.groupName"></span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <br />
      </div>
    </el-drawer>
    <AddFriGrop
      v-if="addOrderVisible"
      :visible.sync="addOrderVisible"
      :index="this.index"
      @handCloseFri="handCloseFri"
    />
    <DialogGroupVisible
      :dialogGroupVisible="groupVisible"
      @handCloseGroup="handCloseGroup"
      ref="creatGroup"
    />
    <AppealsDialog
      ref="appeal"
      :AppealsVisible.sync="AppealsVisible"
      :impeachFromtype="impeachFromtype"
      @cancelDialogHand="cancelAppealsDialogHand"
      @toImpeach="toImpeachDialog"
    />
    <ImpeachDialog
      ref="impeach"
      :ImpeachVisible.sync="ImpeachVisible"
      :impeachFromtype="impeachFromtype"
      @cancelDialogHand="cancelImpeachDialogHand"
    />
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import DialogGroupVisible from "@/view/add-friends-group/dialog/sceate-groups";
import AddFriGrop from "@/view//add-friends-group/add";
import { mapState,mapMutations } from "vuex";
import bus from "@/utils/eventbus";
import { sqliteUpdate } from "@/services/sqliteDao";
import { contFriSize, contGrpSize } from "@/utils";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
import fileOperational from "@/services/fileOperational";
import DiscussionIcon from "@/components/memberIcon/DiscussionIcon";
import MemberIcon from "@/components/memberIcon/MemberIcon";
import LevelIcon from "@/components/memberIcon/LevelIcon";
import LuckIdIcon from "@/components/memberIcon/luckIdIcon";
import { CLEAR_CHAT } from "@/store/types";
import { checkFreeGroupLimit } from "../components/server";
import AppealsDialog from "@/view/chat/appeals";
import ImpeachDialog from "@/view/chat/impeach";

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    DialogGroupVisible,
    AddFriGrop,
    DiscussionIcon,
    MemberIcon,
    LevelIcon,
    LuckIdIcon,
    AppealsDialog,
    ImpeachDialog,
  },
  data() {
    //这里存放数据
    return {
      indexAt:0,//被选中item的下标0
      alldataNum:0,//搜索到的所有列表之和
      currentItem:{},//上下键选中的item
      popoverVisible:false,
      searchListBox: false,
      serFlag: false,
      groupVisible: false,
      AppealsVisible: false,
      ImpeachVisible: false,
      impeachFromtype: '',//来源类型
      addOrderVisible: false,
      keyword: '',
      friendsData: [],
      groupsData: [],
      discussionsData: [],
      isShowAll: false,
      friendsDataMin: [],
      direction: 'ttb',
      index: 0
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      personalAppealInfo: (state) => {
        return state.common.personalAppealInfo;
      },
    }),
  },
  //监控data中的数据变化
  watch: {
    '$route.path': function(newVal) {
      // console.log(newVal.indexOf("/app/chat"));
      if (newVal.indexOf('/app/chat') >= 0 || newVal.indexOf('/app/contact') >= 0) {
        this.serFlag = true;
      } else {
        this.serFlag = false;
      }
    },
    searchListBox(val){
      if(!val){
        document.removeEventListener('keydown', this.keyMove)
      }
    }
  },
  //方法集合
  methods: {
    ...mapMutations([CLEAR_CHAT]),
    handCloseFri() {
      this.addOrderVisible = false;
    },
    async handGoChatF(item) {
      // console.error(item)
      this.CLEAR_CHAT();
      let current = {
        id: item.friendId,
        sessionName: item.friendNickName,
        sessionIcon: item.friendHeadImg,
        targetType: 1, //单聊
        msgType: 1, //默认文本
        textOrigin: '',
        uniqueCode: contFriSize(item.friendId, UserInfoUtils.getCurrentUserId()),
        fromType: '999'
      };
      await this.updateSessionTime(item.friendId);
      this.$store.dispatch('ADD_LAST_MSG_LIST', {
        ...current,
        isJump: true,
        updateTime: new Date().getTime()
      });
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.searchListBox = false;
      this.indexAt = 0;
      this.keyword = '';
      this.$router.push({
        path: '/app/chat/single/message',
        query: {
          id: item.friendId,
          fromId: item.friendId,
          targetId: item.userId,
          timer: new Date().getTime(),
          uniqueCode: contFriSize(item.userId, item.friendId),
          friendName: encodeURI(item.sessionName)
        }
      });
      bus.$emit('scrollToTop');
    },
    //群聊跳转
    async handGoChatG(item) {
      this.CLEAR_CHAT();
      let current = {
        id: item.groupId,
        sessionName: item.groupName,
        targetId: item.groupId,
        targetType: 2, //单聊
        textOrigin: '',
        msgType: 1, //默认文本
        groupType: 1,
        uniqueCode: contGrpSize(item.groupId),
        fromType: '999'
      };
      await this.updateSessionTime(item.groupId);
      this.$store.dispatch('ADD_LAST_MSG_LIST', {
        ...current,
        isJump: true,
        updateTime: new Date().getTime()
      });
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.searchListBox = false;
      this.indexAt = 0;
      this.keyword = '';
      this.$router.push({
        path: '/app/chat/group/message',
        query: {
          id: item.groupId,
          targetId: item.groupId,
          timer: new Date().getTime(),
          friendName: encodeURI(item.groupName),
          uniqueCode: contGrpSize(item.groupId),
          groupType: 1
        }
      });
      bus.$emit('scrollToTop');
    },
    //讨论组跳转
    async handGoChatDiscussion(item) {
      this.CLEAR_CHAT();
      let current = {
        id: item.groupId,
        sessionName: item.groupName,
        targetId: item.groupId,
        targetType: 2, //单聊
        textOrigin: '',
        msgType: 1, //默认文本
        groupType: 0,
        uniqueCode: contGrpSize(item.groupId),
        fromType: '999'
      };
      await this.updateSessionTime(item.groupId);
      this.$store.dispatch('ADD_LAST_MSG_LIST', {
        ...current,
        isJump: true,
        updateTime: new Date().getTime()
      });
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.searchListBox = false;
      this.indexAt = 0;
      this.keyword = '';
      this.$router.push({
        path: '/app/chat/discussion/message',
        query: {
          id: item.groupId,
          targetId: item.groupId,
          timer: new Date().getTime(),
          friendName: encodeURI(item.groupName),
          uniqueCode: contGrpSize(item.groupId),
          groupType: 0
        }
      });
      bus.$emit('scrollToTop');
    },
    async updateSessionTime(id) {
      console.log('updateTime=', new Date().getTime() + '');
      await sqliteUpdate('t_sessions', { id }, { updateTime: new Date().getTime() + '' });
    },
    //将 friendList 中字段下划线转换成驼峰
    changeFriendName(arr) {
      return arr.map(a => {
        a = {
          friendAreaCityCode: a.friend_areaCountryCode,
          friendAreaCountryCode: a.friend_areaCountryCode,
          friendAttrs: a.friend_attrs,
          friendFriendNotes: a.friend_friendNotes,
          friendGender: a.friend_gender,
          friendHeadImg: a.friend_head_img,
          friendId: a.friend_id,
          friendNickName: a.friend_nick_name,
          friendPersonalSign: a.friend_personalSign,
          friendType: a.friend_type,
          friendUpdatedOn: a.friend_updatedOn,
          inviteCode: a.invite_code,
          colorInviteCode: a.invite_code,
          isShow: a.is_show,
          level: a.level,
          vipType: a.vipType,
          inviteCodeType: a.inviteCodeType,
          userRank: a.userRank
        };
        return a;
      });
    },
    //将 groupList 中字段下划线转换成驼峰
    changeGroupName(arr) {
      return arr.map(a => {
        a = {
          groupId: a.group_id,
          groupNameOrigin: a.group_name,
          groupName: a.group_name,
          groupNamePinyin: a.group_name_pinyin,
          groupStatus: a.group_status,
          groupProfile: a.group_profile,

          groupAvatar: a.group_avatar,
          groupAvatarLocal: a.group_avatar_local,
          addCheck: a.add_check,
          inviteAuth: a.invite_auth,
          country: a.country,

          city: a.city,
          screenshotsReminderStatus: a.screenshotsReminderStatus,
          forbiddenWordsStatus: a.forbiddenWordsStatus,
          memberSingleChatStatus: a.memberSingleChatStatus,
          sendPicturesStatus: a.sendPicturesStatus,
          sendConnectionStatus: a.sendConnectionStatus,
          sendRedpacketStatus: a.sendRedpacketStatus,
          copyMessagesStauts: a.copyMessagesStauts,
          createTime: a.create_time,
          saveTime: a.save_time,
          people: a.people,
          memberLevelStatus: a.member_level_status,
          groupLevel: a.group_level,
          updatedOn: a.updatedOn,
          code: a.code,
          groupCode: a.group_code,
          groupType: a.group_type,
          groupTab: a.groupTab
        };
        return a;
      });
    },
    //讨论组
    async getSearchDiscussion(key) {
      let res = await window.vm
        .$knex('t_groups')
        .where(function() {
          this.where('group_name', 'like', '%' + key + '%').orWhere('group_name_pinyin', 'like', '%' + key + '%');
          // .orWhere("group_code", "like", "%" + key + "%");
        })
        .where('group_type', '=', 0)
        .orderBy('group_name_pinyin')
        .select();
      this.discussionsData = this.changeGroupName(res);
    },
    //群
    async getSearchGroup(key) {
      let res = await window.vm
        .$knex('t_groups')
        .where(function() {
          this.where('group_name', 'like', '%' + key + '%')
            .orWhere('group_name_pinyin', 'like', '%' + key + '%')
            .orWhere('group_code', 'like', '%' + key + '%');
        })
        .where('group_type', '=', 1)
        .orderBy('group_name_pinyin')
        .select();
      this.groupsData = this.changeGroupName(res);
    },
    //个人
    async getSearchFriends(key) {
      let res = await window.vm
        .$knex('t_contacts')
        .where(function() {
          this.where('friend_nick_name', 'like', '%' + key + '%')
            .orWhere('friend_nick_name_pinyin', 'like', '%' + key + '%')
            .orWhere('invite_code', 'like', '%' + key + '%')
            .orWhere('friend_friendNotes_pinyin', 'like', '%' + key + '%')
            .orWhere('friend_friendNotes', 'like', '%' + key + '%');
        })
        .where(function() {
          this.whereNull('is_show').orWhere('is_show', '!=', 'false');
        })
        .orderBy('friend_nick_name_pinyin')
        .select();
      this.friendsData = this.changeFriendName(res);
    },
    closePopver(){
      console.log(this.indexAt,'closepopver')
      this.keyword = '';
      document.removeEventListener('keydown', this.keyMove)
    },
    async search() {
      this.keyword == '' ? (this.searchListBox = false,this.indexAt = 0,this.keyword = '') : (this.searchListBox = true);
      if (!this.keyword) {
        // this.$message.error("请输入搜索内容");
        return;
      }
      if (this.keyword.trim() == '') {
        return;
      }
      // this.resetData();
      await this.getSearchFriends(this.keyword);
      await this.getSearchGroup(this.keyword);
      await this.getSearchDiscussion(this.keyword);
      // console.log(this.friendsData, this.groupsData, this.discussionsData);
      this.isShowAll = this.friendsData.length > 5;
      if (this.isShowAll) {
        this.friendsDataMin = this.friendsData.slice(0, 5);
        if (this.friendsDataMin.length >= 5) {
          this.isShowGroup = false;
        }
      } else {
        this.friendsDataMin = this.friendsData;
      }
      await this.changeColor();
      await this.chooseSearch();
      // this.enterInto()
    },
    enterInto(){
      document.removeEventListener('keydown', this.keyMove)
      if(this.searchListBox){ // && document.getElementById('searchAll') == document.activeElement
        document.addEventListener('keydown',this.keyMove)
      }
    },
    changeColor() {
      if (this.keyword) {
        let key = this.keyword.toLowerCase();
        let replaceReg = new RegExp(key, 'g');
        let replaceString = '<span class="high-light">' + key + '</span>';
        let keyUp = this.keyword.toUpperCase();
        let replaceRegUp = new RegExp(keyUp, 'g');
        let replaceStringUp = '<span class="high-light">' + keyUp + '</span>';
        this.friendsDataMin.map((item,index) => {
          item.indexAt = index;
          if (item.friendNickName.toLowerCase().indexOf(key) != -1) {
            item.friendNickName = item.friendNickName.replace(replaceReg, replaceString).replace(replaceRegUp, replaceStringUp);
          }
          if (item.friendFriendNotes && item.friendFriendNotes.toLowerCase().indexOf(key) != -1) {
            item.friendFriendNotes = item.friendFriendNotes.replace(replaceReg, replaceString).replace(replaceRegUp, replaceStringUp);
            item.showNotes = true;
          }
          if (item.colorInviteCode.toLowerCase().indexOf(key) != -1) {
            item.colorInviteCode = item.colorInviteCode.replace(replaceReg, replaceString).replace(replaceRegUp, replaceStringUp);
            item.showCode = true;
          }
        });
        this.groupsData.map((item,index) => {
          item.indexAt = Number(this.friendsDataMin.length) + index;
          if (item.groupName.toLowerCase().indexOf(key) != -1) {
            item.groupName = item.groupName.replace(replaceReg, replaceString).replace(replaceRegUp, replaceStringUp);
          }
          if (item.groupCode.toLowerCase().indexOf(key) != -1) {
            item.groupCode = item.groupCode.replace(replaceReg, replaceString).replace(replaceRegUp, replaceStringUp);
            item.showCode = true;
          }
        });
        this.discussionsData.map((item,index) => {
          item.indexAt = Number(this.friendsDataMin.length)+ Number(this.groupsData.length) +index;
          if (item.groupName.toLowerCase().indexOf(key) != -1) {
            item.groupName = item.groupName.replace(replaceReg, replaceString).replace(replaceRegUp, replaceStringUp);
          }
        });
        this.alldataNum = Number(this.friendsDataMin.length)+Number(this.groupsData.length)+Number(this.discussionsData.length)
      }
      this.$forceUpdate();
    },
    addHand(index) {
      if(this.personalAppealInfo.createTime){
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', {time}), this.$t('Universal_0059'),{
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
      }else{
        this.addOrderVisible = true;
        this.index = index;
      }
    },

    handOpenGroup() {
      console.log('handOpenGroup')
      this.popoverVisible = false
      if(this.personalAppealInfo.createTime){
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', {time}), this.$t('Universal_0059'),{
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.toAppeal('single');
        }).catch(() => {
        });
      }else{
        const params = {'userId':UserInfoUtils.getCurrentUserId()}
        checkFreeGroupLimit(params).then(async (res) => {
          if (res.code == "200") {
            if (res.data.groupNowNum >= res.data.groupLimit){
              this.$confirm(this.$t('chat_createcommunity_0036', {limit: res.data.groupLimit}),
                this.$t('Universal_0059'),{
                  confirmButtonText: this.$t('book_group_0019'),
                  showCancelButton: false,
                  center: true,
                  showClose: false,
                }).then(() => {
              // this.$confirm(`当前社区创建上限${res.data.groupLimit}个，创建已超限，无法创建`, "提示  ",{
              //   confirmButtonText: "知道了",
              //   showCancelButton: false,
              //   center: true,
              //   showClose: false,
              // }).then(() => {
              // }).catch(() => {
              });
            }else{
              // 打开发起群聊弹框           
              this.groupVisible = true;
              this.$refs.creatGroup.resetFroms();
              this.$nextTick(()=>{
                bus.$emit('changeLanguage',this.$i18n.locale);
              });
            }
          } 
        });
        // this.dialogAddFriendsVisible = true;
      }
    },
    handCloseGroup() {
      // 关闭发起群聊弹框
      this.groupVisible = false;
    },
    cancelAppealsDialogHand(param) {
      this.AppealsVisible = param;
    },
    cancelImpeachDialogHand(param) {
      this.ImpeachVisible = param;
    },
    //去申诉
    toAppeal(impeachFromtype) {
      this.impeachFromtype = impeachFromtype;
      this.AppealsVisible = true;
      this.$refs.appeal.init();
    },
    toImpeachDialog(){
      this.AppealsVisible = false;
      this.ImpeachVisible = true;
      this.$refs.impeach.init()
    },
    async showAll() {
      this.resetData();
      await this.getSearchFriends(this.keyword);
      await this.getSearchGroup(this.keyword);
      await this.getSearchDiscussion(this.keyword);
      this.friendsDataMin = this.friendsData;
      this.changeColor();
    },
    resetData() {
      this.friendsData = [];
      this.groupsData = [];
      this.discussionsData = [];
      this.isShowAll = false;
    },
    findImage(image) {
      return fileOperational.getImage(image);
    },
    cleanInput() {
      this.keyword = '';
    },
    drawerClose() {
      this.searchListBox = false;
      this.keyword = '';
    },
    // 替换404图片
    replaceImg(e) {
      UserInfoUtils.replaceDefaultImg(e, 'group');
    },
    move(){
      if( document.getElementsByClassName('searchListBox')[0]){
        console.log(document.getElementsByClassName('active')[0].offsetTop,'位移',document.getElementsByClassName('searchListBox')[0])
        document.getElementsByClassName('searchListBox')[0].scrollTop = document.getElementsByClassName('active')[0].offsetTop-70
      }
    },
    keyMove(e){
      if(e.keyCode == 38){ //上键
        console.log(this.indexAt,this.alldataNum,'up111')
        if(this.indexAt>0){
          this.indexAt--;
          console.log(this.indexAt,'--')
        }else{
          this.indexAt = 0;
        }
        this.move()
      }else if(e.keyCode == 40){ //下键
        console.log(this.indexAt,this.alldataNum,'down2222')
        if(this.indexAt < this.alldataNum-1){
          this.indexAt++;
          console.log(this.indexAt,'++')
        }else if(this.indexAt == this.alldataNum){
          this.indexAt = this.indexAt-1 ;
          console.log(this.indexAt,'-1后')
        }
        this.move()
        console.log(this.$route,'this.$route')
      }
      else if(e.keyCode == 13){
        console.log(document.getElementsByClassName('active')[0],'wswwwww')
        let currentId='',disName='',currentPath = this.$route.path
        if(document.getElementsByClassName('active')[0]){
          currentId = document.getElementsByClassName('active')[0].getAttribute("id")
          disName = document.getElementsByClassName('active')[0].getAttribute("disName")
          console.log(currentId,'currentId')
        }
        console.log(disName,this.friendsDataMin,currentPath)
        if(disName == 1){ //好友
          this.currentItem = this.friendsDataMin.filter((item) => {
            return item.inviteCode == currentId
          })
          console.log(this.currentItem,'currentItem')
          if(currentPath.indexOf('chat')>-1){
            this.handGoChatF(this.currentItem[0])
          }else{
            this.handGoChat(this.currentItem[0])
          }
        }else if(disName == 2){ //社区
          this.currentItem = this.groupsData.filter((item) => {
            return item.groupId == currentId
          })
          console.log(this.currentItem,'currentItem')
          if(currentPath.indexOf('chat')>-1){
            this.handGoChatG(this.currentItem[0])
          }else{
            this.GoGroup(this.currentItem[0])
          }
        }else if(disName == 3){ //讨论组
          this.currentItem = this.discussionsData.filter((item) => {
            return item.groupId == currentId
          })
          console.log(this.currentItem,'currentItem')
          if(currentPath.indexOf('chat')>-1){
            this.handGoChatDiscussion(this.currentItem[0])
          }else{
            this.GoDisscuss(this.currentItem[0])
          }
        }
      }
      
    },
    chooseSearch(){
      this.indexAt = 0;
      console.log(this.alldataNum,'this.alldataNum')
      document.removeEventListener('keydown', this.keyMove)
      if(this.searchListBox){ // && document.getElementById('searchAll') == document.activeElement
        document.addEventListener('keydown',this.keyMove)
      }
    },
    handGoChat(item) {
      this.searchListBox = false
      this.$router.push({
        path: '/app/contact/info',
        query: {
          flag: 0,
          id: item.friendId,
          targetId: item.userId,
          nickName: item.friendNickName,
          headImg: item.friendHeadImg,
          isSelect:item.friendId
        }
      });
    },
    GoGroup(item) {
      this.searchListBox = false
      this.$router.push({
        path: '/app/contact/info',
        query: {
          flag: 1,
          id: item.groupId,
          targetId: item.groupId,
          nickName: item.groupName,
          headImg: item.groupAvatar,
          num: item.people,
          authStatus: item.status,
          isSelect:item.groupId
        }
      });
    },
    GoDisscuss(item) {
      this.searchListBox = false
      this.$router.push({
        path: '/app/contact/info',
        query: {
          flag: 1,
          id: item.groupId,
          targetId: item.groupId,
          nickName: item.groupName,
          headImg: item.groupAvatar,
          num: item.people,
          authStatus: item.status,
          name: 'discussion',
          groupType: item.groupType,
          isSelect:item.groupId
        }
      });
    },
    closeMembers(){
      bus.$emit('closeMemberinfo')
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    document.removeEventListener('keydown', this.keyMove)
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style>
#contact-add-btn:hover,
#contact-add-btn:active,
#contact-add-btn:visited,
#contact-add-btn:focus {
  background: #f7f7f7;
  color: #606266;
  border: 1px solid #dcdfe6;
}
.high-light {
  color: #2f54eb;
}
.addMenu {
  min-width: 100px;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
.my_class {
  text-align: left;
  display: inline-block;
  width: 200px;
  margin: 15px 0 15px 10px;

  // /deep/ .el-input__prefix{
  //   top: -3px;
  // }
  // /deep/ .el-input__suffix{
  //   top: -4px;
  // }
}

.my_class input.el-input__inner {
  font-size: 12px;
  border-radius: 5px;
  border: none;
  background: #ff0000;
  height: 30px;
  line-height: 30px;
  color: #555;
}

.apply_number .el-badge__content.is-fixed {
  top: 10px;
  right: 13px;
}

.no-data {
  text-align: center;
}

.nick-name {
  font-size: 14px;
  color: #333333;
  width: 180px;
  display: flex;
  align-items: center;
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
    max-width: 65%;
  }
}

.friend-notes,
.invite-code,
.group-code {
  font-size: 12px;
  color: #999999;
  width: 180px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invite-code img {
  margin-top: 0px;
}

.name-notes-id {
  height: 50px;
  justify-content: space-around;
}
.discussion-icon,
.group-icon,
.friend-icon {
  margin: 7px 10px 0 0;
}
.addbox {
  img {
    width: 20px;
    height: 20px;
    padding-right: 5px;
  }
  img,
  span {
    vertical-align: middle;
  }
}
</style>
