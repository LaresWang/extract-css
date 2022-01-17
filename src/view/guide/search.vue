<!-- 搜索导览页 -->
<template>
  <div class="guide-ser">
    <div class="ser-content" v-if="hasContent">
      <!-- 搜索到人 -->
      <p v-if="friendsData && friendsData.length > 0">好友</p>
      <el-card class="box-card info-card" v-for="(itm, idx) in friendsData" :key="'info' + idx">
        <el-row>
          <el-col :span="3" class="card-avatar">
            <span @click="getuserInfo(itm.friendId)">
              <el-avatar class="avatar" :size="60" :src="itm.friendHeadImg"></el-avatar>
            </span>
          </el-col>
          <el-col :span="17" class="card-info">
            <div class="info-name">{{ itm.friendNickName }}</div>
            <div class="info-num">个人ID：{{ itm.inviteCode }}</div>
          </el-col>
          <el-col :span="4" class="card-btn">
            <el-button type="primary" v-if="itm.isFriend" @click="goChat(itm)">开始聊天</el-button>
            <el-button type="primary" v-else @click="addFriends(itm.friendId)">加为好友</el-button>
          </el-col>
        </el-row>
      </el-card>
      <!-- 搜索到群 -->
      <p v-if="groupsData && groupsData.length > 0">社区</p>
      <el-card class="box-card" v-for="(item, index) in groupsData" :key="'group' + index">
        <el-row>
          <el-col :span="3" class="card-avatar">
            <span @click="addGroups(item)">
              <img class="avatar" :src="item.groupAvatar" v-if="item.groupAvatar" />
              <img class="avatar" src="../../assets/images/group.png" v-else />
            </span>
          </el-col>
          <el-col :span="17" class="card-info">
            <div class="group-name">{{ item.groupName }}</div>
            <div class="group-member">{{ $t('chat_comm_member_0003') }} : 这里应该是社区的人数，目前表里没有这个字段 {{ item.people }}</div>
            <div class="group-num">社区ID ：{{ item.code }}</div>
          </el-col>
          <el-col :span="4" class="card-btn">
            <b>这里缺少按钮判断字段：是否已经在社区内</b>
            <el-button type="primary" @click="goGroupchat(item)"> 进入社区</el-button>
            <el-button type="primary" @click="addGroupNow(item)"> 加入社区</el-button>
          </el-col>
        </el-row>
      </el-card>
      <!-- 搜索到看法 -->
      <!-- <div class="spot spot-card" v-if="this.seeingData.length != 0">
        <el-card class="box-card" v-for="(items,ind) in seeingData" :key="ind">
          <el-row>
            <el-col :span="3" class="card-avatar">
              <el-avatar class="avatar" :size="60" :src="items.userImg"></el-avatar>
            </el-col>
            <el-col :span="17" class="card-info">
              <div class="info-name">{{items.userNickName}}</div>
              <div class="spot-time">{{items.postTime}}</div>
              <div class="spot-content">{{items.content}}</div>
            </el-col>
            <el-col :span="4" class="card-btn spot-btn">
              <el-button type="primary" @click="pointDetail(items.id)">{{$t('guide.viewFullText')}}</el-button>
            </el-col>
          </el-row>
        </el-card>
        <Pagation
          @handleSizeChange="handleSizeChange"
          @handleCurrentChange="handleCurrentChange"
          :currentPage="currentPage"
          :myPageSizes="pagesize"
          layout="prev, pager, next"
          :total="total"
        />
      </div> -->
    </div>
    <div class="ser-nocontent" v-else>
      <div class="no-box">
        <img src="../../assets/images/web.png" alt="error" />
        <p>{{ $t('Universal_0174') }}</p>
      </div>
    </div>
    <DialogAddFriendVisible
      ref="myordernum"
      :dialogAddFriendsVisible="dialogAddFriendsVisible"
      @handCancelFriDialog="handCancelFriDialog"
      @handConfirmFriDialog="handConfirmFriDialog"
      :friendData="friendData"
      @toAppeal="toAppeal('single')"
    />
    <DialogAddGroupVisible
      :dialogAddGroupsVisible="dialogAddGroupsVisible"
      @handConfirmGroupDialog="handConfirmGroupDialog"
      @handCloseAddGroups="handCancelGroupDialog"
      :groupData="groupData"
      @toAppeal="toAppeal('single')"
    />
    <PersonInfoDialog
      :userInfo="userChatInfo"
      @handDel="handDel"
      @handSendMes="handSendMes"
      @handaddFriend="addFriends"
      @handCloseDialog="handCloseDialog"
      :dialogPersonInfoVisible="dialogPersonInfoVisible"
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
import DialogAddFriendVisible from "../add-friends-group/dialog/add-friends";
import PersonInfoDialog from "@/components/chat/PersonInfo";
import DialogAddGroupVisible from "../add-friends-group/dialog/add-groups";
import { mapState, mapActions, mapMutations } from "vuex";
import { get_the_info } from "../add-friends-group/add/server";
import { delete_friends, add_the_group } from "./server";
import { contFriSize, contGrpSize } from "@/utils";
import { CLEAR_CHAT } from "@/store/types";
import AppealsDialog from "@/view/chat/appeals";
import ImpeachDialog from "@/view/chat/impeach";

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    PersonInfoDialog,
    DialogAddFriendVisible,
    DialogAddGroupVisible,
    AppealsDialog,
    ImpeachDialog,
  },
  data() {
    //这里存放数据
    return {
      dialogAddFriendsVisible: false,
      dialogAddGroupsVisible: false,
      AppealsVisible: false,
      ImpeachVisible: false,
      impeachFromtype: '',//来源类型
      isFriend: true,
      isMember: false,
      hasContent: true,
      //   分页
      currentPage: 1,
      pagesize: 10,
      pageNumber: 1,
      total: 0,
      seeingData: [],
      friendsData: [],
      groupsData: [],
      friendData: {},
      groupData: {},
      userChatInfo: {},
      dialogPersonInfoVisible: false,
      keywrod: ''
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      friends: state => state.search.searchFriends,
      groups: state => state.search.searchGroup,
      seeings: state => state.search.seeings,
      keyword: state => state.search.keyword,
      totalNum: state => state.search.total
    })
  },
  //监控data中的数据变化
  watch: {
    seeings: {
      deep: true,
      handler() {
        // 由于是异步载入，所以只能在状态值的变化时执行渲染操作
        // 绝不可在mounted中执行render方法
        // this.init(val);
      }
    },
    groups: {
      deep: true,
      handler(val) {
        // 由于是异步载入，所以只能在状态值的变化时执行渲染操作
        // 绝不可在mounted中执行render方法
        this.init(val);
      }
    },
    totalNum: {
      deep: true,
      handler(val) {
        // 由于是异步载入，所以只能在状态值的变化时执行渲染操作
        // 绝不可在mounted中执行render方法
        this.init(val);
      }
    },
    friends: {
      deep: true,
      handler(val) {
        // 由于是异步载入，所以只能在状态值的变化时执行渲染操作
        // 绝不可在mounted中执行render方法
        this.init(val);
      }
    }
  },
  //方法集合
  methods: {
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
          code: a.code
        };
        return a;
      });
    },

    ...mapMutations([CLEAR_CHAT]),
    ...mapActions(['GET_SEARCH_SEEING', 'GET_SEARCH_GROUP', 'GET_SEARCH_FRIENDS']),
    handleSizeChange(val) {
      this.currentPage = 1;
      this.pageNumber = 1;
      this.pageSize = val;
      // 加参数
      this.GET_SEARCH_SEEING({
        pageSize: this.pageSize,
        pageNumber: this.pageNumber,
        keyword: this.$store.state.search.keyword
      });
    },
    handleCurrentChange(val) {
      this.pageNumber = val;
      this.currentPage = val;
      //
      this.GET_SEARCH_SEEING({
        pageSize: this.pageSize,
        pageNumber: this.pageNumber,
        keyword: this.$store.state.search.keyword
      });
    },
    goChat(a) {
      let current = {
        uniqueCode: contFriSize(a.id, localStorage.userId)
      };
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.CLEAR_CHAT();
      this.$router.push({
        path: '/app/chat/single/message',
        query: {
          fromId: a.id,
          targetId: localStorage.getItem('userId'),
          timer: new Date().getTime(),
          uniqueCode: contFriSize(a.id, localStorage.userId),
          friendName: encodeURI(a.userNickName)
        }
      });
    },
    goGroupchat(a) {
      this.CLEAR_CHAT();
      let current = {
        uniqueCode: contGrpSize(a.groupId)
      };
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.$router.push({
        path: '/app/chat/group/message',
        query: {
          targetId: a.groupId,
          timer: new Date().getTime(),
          friendName: encodeURI(a.groupName),
          uniqueCode: contGrpSize(a.groupId)
        }
      });
    },
    addGroupNow(a) {
      let userid = localStorage.getItem('userId');
      let param = {
        userId: userid,
        groupId: a.groupId
      };
      this.goGroup(param, a);
    },
    async goGroup(param, a) {
      let res = await add_the_group(param);
      if (res.code == 200) {
        this.$message.success(res.msg);
        this.text = '';
        let current = {
          uniqueCode: contGrpSize(a.id)
        };
        this.CLEAR_CHAT();
        this.$store.dispatch('SET_CURRENT_CHAT', current);
        this.$router.push({
          path: '/app/chat/group/message',
          query: {
            targetId: a.id,
            timer: new Date().getTime(),
            friendName: encodeURI(a.groupName),
            uniqueCode: contGrpSize(a.id)
          }
        });
      } else {
        this.$message.error(res.msg);
        return;
      }
    },
    async getuserInfo(a) {
      this.dialogPersonInfoVisible = true;
      let res = await get_the_info({ id: a });
      if (res.code == 200) {
        this.userChatInfo = res.data || {};
      }
    },
    async handDel(userInfo) {
      // 删除好友
      this.$confirm(`确定删除好友吗？`, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.handDelteFriend(userInfo);
        })
        .catch(() => {
          // this.$message({
          //   type: 'info',
          //   message: '已取消删除'
          // });
        });
    },
    async handDelteFriend(userInfo) {
      // 删除好友
      let pararms = {
        friendId: userInfo.id,
        userId: localStorage.userId
      };
      let res = await delete_friends(pararms);
      if (res.code == '200') {
        this.$message({
          type: 'success',
          message: res.msg
        });
        this.dialogPersonInfoVisible = false;
        this.GET_SEARCH_GROUP({
          param: this.$store.state.search.keyword
        });
        this.GET_SEARCH_FRIENDS({
          code: this.$store.state.search.keyword
        });
      } else {
        this.$message({
          type: 'info',
          message: res.msg
        });
      }
    },
    handCloseDialog() {
      this.dialogPersonInfoVisible = false;
    },
    handSendMes(a) {
      // 发送消息
      let current = {
        uniqueCode: contFriSize(a.id, localStorage.userId)
      };
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.CLEAR_CHAT();
      this.$router.push({
        path: '/app/chat/single/message',
        query: {
          fromId: a.id,
          targetId: localStorage.getItem('userId'),
          timer: new Date().getTime(),
          uniqueCode: contFriSize(a.id, localStorage.userId),
          friendName: encodeURI(a.userNickName)
        }
      });
    },
    async getFrInfo(a) {
      let res = await get_the_info({ id: a });
      if (res.code == 200) {
        this.friendData = res.data;
        this.$refs.myordernum.setkeynull();
      }
    },
    addFriends(a) {
      this.getFrInfo(a);
      this.dialogAddFriendsVisible = true;
    },
    handCancelFriDialog(param) {
      this.dialogAddFriendsVisible = param;
    },
    handConfirmFriDialog(param) {
      this.dialogAddFriendsVisible = param;
    },
    addGroups(param) {
      this.groupData = param;
      //
      this.dialogAddGroupsVisible = true;
    },
    handCancelGroupDialog(param) {
      this.dialogAddGroupsVisible = param;
    },
    handConfirmGroupDialog(param) {
      this.dialogAddGroupsVisible = param;
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
    pointDetail(a) {
      this.$router.push({ path: '/app/viewdetail', query: { id: a } });
    },
    toGroup() {},
    toFriend() {},
    init() {
      this.total = this.totalNum;
      this.seeingData = this.seeings;
      this.groupsData = this.changeGroupName(this.groups);
      this.friendsData = this.changeFriendName(this.friends);
      //
      if ((this.groupsData.length || this.friendsData.length) != 0) {
        this.hasContent = true;
      } else {
        this.hasContent = false;
      }
      //
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.init();
  },
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
.guide-ser {
  padding: 2px 0px;
  height: 100vh;
  background: #fff;
  overflow: auto;
  text-align: center;

  .ser-content {
    .box-card {
      width: 100%;
      background: rgba(236, 236, 240, 1);
      margin: 30px 0;

      .card-avatar {
        height: 100%;

        .avatar {
          margin: 14px 0;
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }
      }

      .card-info {
        height: 100%;
        text-align: left;
        padding: 20px 0;
        cursor: default;

        .info-name {
          font-size: 14px;

          font-weight: 400;
          color: #151f34;
          line-height: 24px;
        }

        .info-num,
        .spot-time {
          font-size: 12px;

          font-weight: 400;
          color: #9297a3;
          line-height: 22px;
        }

        .spot-time {
          line-height: 26px;
        }

        .group-name {
          font-size: 14px;

          font-weight: 400;
          color: #151f34;
          line-height: 20px;
        }

        .group-num,
        .group-member {
          font-size: 12px;

          font-weight: 400;
          color: #9297a3;
          line-height: 18px;
        }

        .spot-content {
          margin-top: 10px;
          color: #151f34;
          font-size: 14px;
          line-height: 24px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      }

      .card-btn {
        height: 100%;
        line-height: 88px;
      }

      .spot-btn {
        line-height: 200px;
      }
    }

    .info-card {
      height: 88px;
    }
  }

  .ser-nocontent {
    text-align: center;

    .no-box {
      margin-top: 100px;
    }
  }
}
</style>
