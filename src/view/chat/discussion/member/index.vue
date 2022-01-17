
<!-- 群成员 -->
<template>
  <el-row v-loading="loading" element-loading-spinner="el-icon-loading" :element-loading-text="$t('Universal_0025')">
    <el-col :span="24" class="gruop-members-wrap flex flex-direction">
    <div class="title">
      {{ memberSelect[0].label }}
      <i class="el-icon-close close-i" @click="handleClose"></i>
    </div>
    <div class="serach">
      <el-input
        class="serach-input"
        @input="search"
        v-model="SeachInput"
        :placeholder="$t('Universal_0058')"
        prefix-icon="el-icon-search"
        clearable
        id='dissSearch'
        :code="groupSystemAbleMem"
      ></el-input>
      <img @click="inviteMemHand" class="invite-mem" src="../../../../assets/images/invite.png" alt />
    </div>
    <div class="gruop-members-con flex-sub flex-direction flex">
      <ul class="gruop-members-list" id="scrollBox">
        <li
          v-for="(item, index) in items"
          :key="item.userId"
          @contextmenu.prevent="rightClick($event, item)"
          @mouseover="onMouseover(index)"
          :id="item.inviteCode"
          :class="{ active: index === currentIndex ,active2:index == indexAt}"
        >
          <div :id="'popoverShow' + item.userId" class="gruop-members-name" @click="lookCard(item.userId)">
            <MemberIcon
              :image="item.userHeadImg || item.friendHeadImg"
              :auth-status="'' + item.authStatus"
              :userRank="item.userRank"
              :vipType="item.vipType"
            />
          </div>
          <div style="width:125px">
            <div class="flex flex-direction name-notes-id group-members-name">
              <div class="name-wrap" :title="item.groupMemberName">
                <span>{{ item.groupMemberName }}</span>
              </div>
              <LevelIcon
                :inviteCode="item.inviteCode"
                :userRank="item.userRank"
                iconType="medium"
                :vipType="item.vipType"
                :inviteCodeType="item.inviteCodeType"
              />
              <!-- <div
                class="name-wrap"
                v-show="item.showNickName && SeachInput"
                :title="item.nickName"
              >
                <span>{{ item.nickName }}222</span>
              </div> -->
            </div>
            <div style="padding-top: 2px">
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
          <div class="gruop-members-manster">
            <img src="../../../../assets/images/nowords.png" alt class="tips img_16"
                 v-if="item.authStatus == 3 && item.forbiddenWordsStatus == 1"/>
          </div>
          <!-- <div style="padding-top: 20px">
            <LevelIcon
              :inviteCode="item.inviteCode"
              :userRank="item.userRank"
              iconType="medium"
              :vipType="item.vipType"
              :inviteCodeType="item.inviteCodeType"
            />
          </div> -->
        </li>
        <div v-show="(!items.length > 0 && !loading)" class="no-results">
          <img src="../../../../assets/images/web.png" class="img_search" />
          <p>{{ $t('Universal_0173') }}</p>
        </div>
      </ul>
    </div>
    <member-card-other
      :cardDialogVisible="cardDialogVisible"
      :userId="cardDialogUserId"
      :groupId="groupId"
      ref="cardOther"
      @handleclosecard="handleclosecard"
    ></member-card-other>
    </el-col>
  </el-row>  
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import store from '@/store';
import RightRule from './rightRule';
import MemberCardOther from '@/components/memberCard/MemberCardOther';
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
import { remote } from 'electron';
import fileOperational from '@/services/fileOperational';
import { update_person_info, removeGroupMember } from './server';
import { convertToPinyin } from '@/utils/pinyin';
import SQLUtils from '@/components/db/sqlite.js';
import { getSelfUserId } from '@/utils/const';
export default {
  name:"Member",
  components: {
    MemberCardOther,
    MemberIcon,
    LevelIcon,
    LuckIdIcon
  },
  data() {
    return {
      arr: [],
      dialogVisible: false,
      diaTitle: this.$t('chat_comm_invite_0001'),
      // groupId: sessionStorage.getItem('groupId'),
      userId: this.currentUserId(),
      allMemb: 1,
      myStatus: 1,
      SeachInput: '',
      changeValueV: {},
      popoverVisible: false,
      remarkVisible: true,
      items: [],
      getMember: 1,
      memberSelect: [
        {
          value: '0',
          label: ''
        },
        {
          value: '1',
          label: ''
        }
      ],
      AllMember: '',
      forbiddenMemb: [],
      dataMemb: [],
      cardDialogVisible: false,
      cardDialogUserId: '',
      members: [],
      currentIndex: 0,
      currentItem:{},
      indexAt:0,
      loading: false,
    };
  },
  props: {
    dialogMember: {
      type: Boolean,
      default: () => {
        return false;
      }
    },
    groupSystemAbleMem: {
      type: Boolean,
      default: () => {
        return false;
      }
    },
    groupId: {
      type: String,
      required: true
    },
    maxPeople: {
      type: Number,
      required: true
    },
    authStatus: {
      type: String,
      default() {
        return '3';
      }
    },
    memberSingleChatStatus: {
      type: String,
      default() {
        return '0';
      }
    }
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    async handleclosecard() {
      this.cardDialogVisible = false;
      await this.restoreMemberNotes(this.cardDialogUserId);
    },
    transferSuccess() {
      this.cardDialogVisible = false;
    },
    onMouseover(index) {
      this.currentIndex = index;
    },
    async lookCard(id) {
      if (this.memberSingleChatStatus == 0 && this.authStatus == 3) {
        return;
      }
      this.cardDialogVisible = true;
      this.cardDialogUserId = id;
      this.$nextTick(() => {
        this.$refs.cardOther.onCardShow();
      });
    },
    // 禁言
    async forbidden(item, num) {
      const params = {
        groupId: this.groupId,
        userId: item.userId,
        forbiddenWordsStatus: num
      };
      let res = await update_person_info(params);
      if (res.code == 200) {
        this.$message.success(res.msg);
        console.log('禁言 ========= ', num, params);
        await SQLUtils.updateGroupsMemberForbiddenWordsStatus(params);
        this.init();
      } else {
        this.$message.error(res.msg);
      }
    },
    // 移出群聊
    async getOut(item) {
      this.$confirm(this.$t('book_group_0015', {member: item.groupMemberName}), this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning',
        customClass: 'pre-dialog'
      })
        .then(async () => {
          let res = await removeGroupMember({
            gId: this.groupId,
            beQuitUserId: item.userId
          });
          if (res.code == '200') {
            this.$message.success(res.msg);
            await SQLUtils.deleteGroupsMemberById(this.groupId, item.userId);
            //await SQLUtils.deleteGroupsPeople(this.groupId);
            this.init();
            this.$emit('searchGroupMembersAndInfo');
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch(() => {});
    },
    removeMemberFromList(memberId) {
      this.items = this.items.filter(item => item.id != memberId);
    },
    //触发子组内部
    onCardShow() {
      // this.$nextTick(v=>{
      //   this.$refs.CardFun[0].onCardShow()
      // })
      //this.$refs.CardFun.zz
    },
    //搜索
    search() {
      this.indexAt = 0;
      if (!this.SeachInput) {
        this.changeSec(0);
        this.$forceUpdate();
      } else {
        let keyword = this.SeachInput.toLowerCase();
        console.log('keyword', keyword);
        this.items = this.arr.filter(item => {
          return (
            item.nickName.toLowerCase().indexOf(keyword) > -1 ||
            item.nickName_pinyin.toLowerCase().indexOf(keyword) > -1 ||
            item.friendNotes.toLowerCase().indexOf(keyword) > -1 ||
            item.friendNotes_pinyin.toLowerCase().indexOf(keyword) > -1
          );
        });
        this.needShowNickName();
      }
      this.currentIndex = 0;
      this.chooseSearch();
    },
    chooseSearch(){
      this.indexAt = 0;
      document.removeEventListener('keydown', this.keyMove2)
      document.getElementById('scrollBox').scrollTop = 0
      document.addEventListener('keydown',this.keyMove2)
    },
    move(){
      if( document.getElementById('scrollBox')){
        console.log(document.getElementById('scrollBox').offsetTop,'位移')
        document.getElementById('scrollBox').scrollTop = document.getElementsByClassName('active2')[0].offsetTop-200
      }
    },
    keyMove2(e){
      if(e.keyCode == 38){ //上键
        console.log(this.indexAt,'up111')
        if(this.indexAt>0){
          this.indexAt--;
          console.log(this.indexAt,'--')
        }else{
          this.indexAt = 0;
        }
        this.move()
      }else if(e.keyCode == 40){ //下键
        console.log(this.indexAt,'down2222')
        if(this.indexAt < (this.items.length-1)){
          this.indexAt++;
          console.log(this.indexAt,'++')
        }else if(this.indexAt == this.items.length){
          this.indexAt = this.indexAt-1 ;
          console.log(this.indexAt,'-1后')
        }
        this.move()
      }
      else if(e.keyCode == 13){
        console.log(document.getElementsByClassName('active2')[0],'wswwwww')
        let currentId=''
        if(document.getElementsByClassName('active2')[0]){
          currentId = document.getElementsByClassName('active2')[0].getAttribute("id")
        }
        this.currentItem = this.items.filter((item) => {
          return item.inviteCode == currentId
        })
        console.log(this.currentItem,'currentItem','展示名片')
        this.lookCard(this.currentItem[0].userId)
      }
      
    },
    needShowNickName() {
      if (this.SeachInput) {
        let key = this.SeachInput.toLowerCase();
        this.items.map(item => {
          item.showNickName = false;
          if (item.nickName.toLowerCase().indexOf(key) != -1 || item.nickName_pinyin.toLowerCase().indexOf(key) != -1) {
            if (item.groupMemberName.indexOf(item.nickName) < 0) {
              item.showNickName = true;
            }
          }
        });
      }
      this.items.sort((a, b) => {
        return a.nickName_pinyin.localeCompare(b.nickName_pinyin);
      });
    },
    // 举报
    tipOff(id) {
      this.$router.push({
        path: '/app/chat/tipoffs',
        query: {
          impeachType: 1,
          othersId: id
        }
      });
    },
    handleClose() {
      this.items = [];
      this.SeachInput = '';
      this.$emit('closeDialog');
    },
    rightClick(e, item) {
      this.changeValueV = item;
      if (this.myStatus == 3) {
        e.preventDefault();
        return;
      } else {
        e.preventDefault();
        this.addClick();
      }
    },
    addClick() {
      const menu = RightRule(this.myStatus, this.changeValueV, this);
      // if (menu.length == 0) {
      //   return;
      // }
      return this.$RightClick(menu).popup({
        window: remote.getCurrentWindow()
      });
    },
    confirmDialogHand() {},
    cancelDialogHand() {
      this.dialogVisible = false;
      this.init();
    },
    inviteMemHand() {
      this.SeachInput='';
      this.changeSec(0);
      // 邀请成员
      //this.$refs.groupInvite.groupfriendlist();
      this.$emit('ShowGroupInvite');
    },
    async setMagHand(obj, num) {
      let message = this.$t('chat_comm_manage_0030', {member: obj.groupMemberName});
      if (num == 3) {
        message = this.$t('chat_comm_manage_0031', {member: obj.groupMemberName});
      }
      this.$confirm(message, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning'
      })
        .then(async () => {
          let res = await update_person_info({
            authStatus: num,
            groupId: this.groupId,
            userId: obj.userId
          });
          if (res.code == 200) {
            this.$message.success(res.msg);
            await window.vm
              .$knex('t_groups_member')
              .where('id', '=', obj.userId)
              .where('group_id', '=', this.groupId)
              .update({ auth_status: num });
            this.init();
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch(() => {});
    },
    changeGroupName(arr) {
      return arr.map(a => {
        a = {
          additionalStatus: a.additionalStatus,
          authStatus: a.auth_status,
          forbiddenWordsStatus: a.forbiddenWordsStatus,
          friendNotes: a.friend_friendNotes || '',
          friendNotes_pinyin: a.friend_friendNotes_pinyin || '',
          friendHeadImg: a.friend_head_img,
          friendId: a.friend_id,
          friendNickName: a.friend_nick_name || '',
          friendNickNamePinyin: a.friend_nick_name_pinyin || '',
          groupId: a.group_id,
          groupMemberName: this.authStatus == '3' ? a.group_member_friend_name : a.group_member_name,
          id: a.id,
          userId: a.userId,
          is_show: a.is_show,
          memberNotes: a?.member_notes || '',
          memberNotes_pinyin: a.member_notes_pinyin || '',
          muteNotifications: a.muteNotifications,
          mutedStatus: a.mutedStatus,
          nickName: a.nick_name,
          nickName_pinyin: convertToPinyin(a.nick_name),
          stickyStatus: a.stickyStatus,
          userHeadImg: a.user_head_img,
          inviteCode: a.inviteCode,
          vipType: a.vipType,
          inviteCodeType: a.inviteCodeType,
          userRank: a.userRank,
          joinTime: Date.now(a.joinTime)
        };
        if (a.forbiddenWordsStatus == 1 && a.authStatus == 3) {
          this.forbiddenMemb.push(a);
        }
        if (a.id == this.userId) {
          this.myStatus = a.authStatus;
        }
        return a;
      });
    },
    async getList() {
      await store.dispatch('GET_MEM_LIST', this.groupId);
      this.members = store.state.search.membList.filter(item => item.is_show == 'true');
      this.arr = this.changeGroupName(this.members);

      this.allMemb = this.arr.length;
      this.memberSelect[0].label = `${this.$t('chat_comm_set_0023')}(${this.allMemb}/${this.maxPeople ? this.maxPeople : '20'})`;
      this.AllMember = this.memberSelect[0].label;

      this.dataMemb[0] = this.arr;
      this.items = this.arr;
      // console.log('this.items ======= ',this.items);
      this.currentIndex = 0;
      this.$emit('updatePeopleInGroup', this.items.length);
      this.$forceUpdate();
    },
    async restoreMemberNotes(memberUserId) {
      if (memberUserId) {
        const memberItem = {
          fromId: memberUserId,
          targetId: this.groupId
        };
        const groupMemberItem = await SQLUtils.findGroupMemberName(memberItem);
        await store.dispatch('GET_MEM_LIST', this.groupId);
        this.members = await store.state.search.membList;
        this.items.map(item => {
          if (item.id == memberUserId) {
            item.nickName_pinyin = convertToPinyin(groupMemberItem.nickName);
            item.friendNotes = groupMemberItem.friendFriendNotes || '';
            item.friendNotes_pinyin = convertToPinyin(item.friendNotes);
            item.memberNotes = groupMemberItem.memberNotes || '';
            item.memberNotes_pinyin = convertToPinyin(item.memberNotes);
            item.groupMemberName = this.memberName(item);
            item.vipType = groupMemberItem.vipType;
            item.inviteCodeType = groupMemberItem.inviteCodeType;
            item.userRank = groupMemberItem.userRank;
            item.inviteCode = groupMemberItem.inviteCode;
          }
        });
        this.$forceUpdate();
      }
    },
    currentUserId() {
      return getSelfUserId();
    },
    memberFriendNotes(item) {
      let userInfo = this.members.find(m => m.id == item.userId);
      if (userInfo && userInfo.friend_friendNotes) {
        return userInfo.friend_friendNotes ? userInfo.friend_friendNotes : '';
      }
      return '';
    },
    memberName(item) {
      return item.friendNotes || item.nickName;
      // let memberNotes = item.memberNotes ? '['.concat(item.memberNotes).concat(']') : '';
      // let friendNotes = item.friendNotes || '';
      // let nickName = item.nickName;
      // let names = [
      //   memberNotes.concat(friendNotes),
      //   memberNotes.concat(nickName),
      //   friendNotes,
      //   nickName
      // ];
      // if (this.authStatus != 3) {
      //   if (friendNotes) {
      //     return names[0];
      //   } else {
      //     return names[1];
      //   }
      // } else {
      //   if (friendNotes) {
      //     return names[2];
      //   } else {
      //     return names[3];
      //   }
      // }
    },
    async init() {
      // this.items = [];
      // this.dataMemb = [];
      // this.forbiddenMemb = [];
      // this.AllMember = '';
      // this.SeachInput = '';
      this.SeachInput = '';
      await this.getList();
      this.loading = false
    },
    changeSec(val) {
      this.SeachInput = '';
      this.arr = this.dataMemb[val];
      this.items = this.dataMemb[val];
      this.currentIndex = 0;
    },
    findImage(image) {
      return fileOperational.getImage(image, true);
    },
    async onMemberOpen() {
      // this.items = [];
      // this.dataMemb = [];
      // this.forbiddenMemb = [];
      // this.AllMember = '';
      // this.SeachInput = '';
      this.loading = true
      await this.init();
    },
    onMemberClose() {
      this.items = [];
      this.dataMemb = [];
      this.forbiddenMemb = [];
      this.AllMember = '';
      this.SeachInput = '';
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.onMemberOpen()
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  destroyed() {}, //生命周期 - 销毁完成
  beforeDestroy() {
    document.removeEventListener('keydown', this.keyMove2)
  }, //生命周期 - 销毁之前
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less">
.set-member-operator {
  li {
    line-height: 20px;
  }
}

.serach-input {
  .el-input__prefix,
  .el-input__suffix {
    .el-input__icon {
      line-height: 26px;
    }
  }
}
.serach-input input.el-input__inner {
  font-size: 12px;
  color: #555;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
.gruop-members-wrap {
  //   overflow-y: hidden;
  min-height: 90vh;

  .title {
    font-size: 14px;
    display: flex;
    padding: 0 10px;
    line-height: 47px;
    // background:#fff;
    background: #fbfbfb;

    .conditionSelec {
      min-width: 100px;
      // background: turquoise;

      /deep/ .el-input__inner {
        max-width: 280px;
        background: transparent;
        border: 0px solid red;
        padding-left: 2px;
      }

      // /deep/ .el-input--small .el-input__inner{
      //   min-width: 150px;
      // }
    }

    .close-i {
      margin-left: auto;
      margin-right: -5px;
      line-height: 47px;
      font-size: 18px;
      cursor: pointer;
    }
  }
  .no-results {
    text-align: center;
    color: #999;
    font-size: 14px;
    margin-top: 40px;
  }
  .serach {
    padding: 10px 10px 15px;
    display: flex;
    align-items: center;
    .serach-input {
      width: 85%;
      border-radius: 20px;
      height: 26px;
      line-height: 26px;
      border: 1px solid #ddd;
      background: #fff;
      .el-input__inner {
        height: 26px;
        line-height: 26px;
      }
      //  /deep/ .el-input__prefix{
      //    top: -6px;
      //  }
      //  /deep/ .el-input__suffix{
      //    top: -6px;
      //  }
    }
    img {
      width: 20px;
      height: 21px;
    }
  }
  .invite-mem {
    vertical-align: middle;
    margin-left: auto;
    margin-right: 0px;
  }
  .gruop-members-con {
    height: 100%;
    .gruop-members-title {
      padding: 0 20px;
      height: 30px;
      line-height: 30px;
      background-color: #9297a3;
      font-size: 14px;
      color: #fff;
    }
    .gruop-members-list {
      height: 100vh;
      overflow-y: scroll;
      background-color: #fff;
      align-items: center;

      .active {
        background-color: #f7f7fa;
      }
      .active2{
        background-color: #eee;
      }
      li {
        display: flex;
        padding: 0 10px 0 12px;
        // height: 60px;
        // line-height: 58px;
        height: 50px;
        /*line-height: 48px;*/
        /*&:nth-child(2n) {*/
        /*  background-color: #f7f7fa;*/
        /*}*/
        img {
          vertical-align: middle;
          border-radius: 50%;
        }
      }
      .gruop-members-manster {
        margin-right: 10px;
        margin-left: 5px;
        // margin-left: auto;
        line-height: 48px;
        // margin-top: -2px;
      }
      .gruop-members-name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-right: 15px;
        position: relative;
        display: flex;
        align-items: center;
        .tips {
          position: absolute;
          left: 30px;
          top: 5px;
        }
      }
      .gruop-members-opera img {
        vertical-align: middle;
      }
      .group-members-name {
        font-size: 12px;
        // max-width: 26%;
      }
      .name-wrap {
        padding-right: 2px;
        // max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: pre;
        .levelbox {
          padding: 0;
        }
      }
      .name-notes-id {
        height: 20px;
        justify-content:baseline;
        flex-direction: row;
        margin-top: 5px;
        align-items: center;
        max-width: 150px;
      }
    }
  }
}
</style>
<style lang="less">
.el-message-box__wrapper {
  .el-message-box {
    &.pre-dialog {
      .el-message-box__message {
        p {
          white-space: pre-wrap !important;
        }
      }
    }
  }
}
.el-message-box__wrapper {
  .el-message-box {
    &.pre-dialog {
      .el-message-box__message {
        p {
          white-space: pre-wrap !important;
        }
      }
    }
  }
}
</style>