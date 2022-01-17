<!--  -->
<template>
<div class="contact-new-friends" v-loading="loading">
  <div class="contact-new-friends-title">{{ $t('Universal_0382') }}</div>
  <ul class="contact-new-friends-item" v-if="!noResult">
    <li class="time-title" v-if="oneAndthreeDay.length > 0">{{ $t('Universal_0019') }}</li>
    <li v-for="(item, index) in oneAndthreeDay" :key="`${item.id}${item.userId}${index}`">
      <div class="flex align-center">
        <MemberIcon :image="handImg(item) | hand_group_avatar" 
        iconType="large" :userRank="item.userRank" :vipType="item.vipType" class="member-icon-class" />
        <div class="flex-sub flex justify-between align-center mr20">
          <div class="flex-sub flex flex-direction" style="padding-right:20px;">
            <p class="contact-add-name text-cut" style="white-space:pre-line;">
              {{ showName(item) }}
              <LevelIcon v-if="!item.groupName" :inviteCode="item.inviteCode" 
              :userRank="item.userRank" iconType="medium" :vipType="item.vipType" :inviteCodeType="item.inviteCodeType" />
            </p>
            <p class="contact-add-des" v-if="item.applyStatus == 0 && item.groupName && userId == item.userId">
              {{ $t('book_notice_0008') }}
            </p>
            <p class="contact-add-des" v-else-if="item.applyStatus == 0 && !item.groupName && userId == item.userId">
              {{ $t('book_notice_0007') }}
            </p>
            <p class="contact-add-des" v-else>{{ item.content }}</p>
          </div>
          <div v-if="item.applyStatus == '-1'">
            <el-button type="danger" size="small" @click="handUpdateSimple(item, 0)">{{ $t('book_friend_0011') }}</el-button>
            <el-button type="primary" size="small" 
            @click="item.groupName ? handUpdateSimple(item, 1) : acceptFriend(item, 1)">{{ $t('Universal_0266') }}</el-button>
          </div>
          <div v-else>
            <el-button v-if="item.applyStatus == 0 && userId != item.userId" type="danger" size="small">
              {{ $t('Universal_0152') }}
            </el-button>
            <el-button v-if="item.applyStatus == 1" type="info" size="small">{{ $t('Universal_0151') }}</el-button>
            <el-button v-if="item.applyStatus == -2" type="info" size="small">{{ $t('Universal_0149') }}</el-button>
          </div>
        </div>
      </div>
    </li>
    <li class="time-title" v-if="threeAndSevenDay.length > 0">{{ $t('Universal_0020') }}</li>
    <li class="flex align-center" v-for="(item, index) in threeAndSevenDay" :key="`${item.id}${index}${item.userId}`">
      <!-- :src="item.userHeadImgPath" -->
      <MemberIcon :image="handImg(item) | hand_group_avatar" iconType="medium" 
      :userRank="item.userRank" class="member-icon-class" :vipType="item.vipType" />
      <div class="flex-sub flex justify-between align-center mr20">
        <div class="flex-sub flex flex-direction" style="padding-right:20px;">
          <p class="contact-add-name text-cut" style="white-space: pre-line;">
            {{ showName(item) }}
            <LevelIcon v-if="!item.groupName" :inviteCode="item.inviteCode" 
            :userRank="item.userRank" iconType="medium" :vipType="item.vipType" :inviteCodeType="item.inviteCodeType" />
          </p>
          <p class="contact-add-des" v-if="item.applyStatus == 0 && item.groupName && userId == item.userId">
            {{ $t('book_notice_0008') }}
          </p>
          <p class="contact-add-des" v-else-if="item.applyStatus == 0 && !item.groupName && userId == item.userId">
            {{ $t('book_notice_0007') }}
          </p>
          <p class="contact-add-des" v-else>{{ item.content }}</p>
        </div>
        <div v-if="item.applyStatus == '-1'">
          <el-button type="danger" size="small" @click="handUpdateSimple(item, 0)">
            {{ $t('book_friend_0011') }}
          </el-button>
          <el-button type="primary" size="small" @click="acceptFriend(item, 1)">
            {{ $t('Universal_0266') }}
          </el-button>
        </div>
        <div v-else>
          <el-button v-if="item.applyStatus == 0 && userId != item.userId" type="danger" size="small">
            {{ $t('Universal_0152') }}
          </el-button>
          <el-button v-if="item.applyStatus == 1" type="info" size="small">
            {{ $t('Universal_0151') }}
          </el-button>
          <el-button v-if="item.applyStatus == -2" type="info" size="small">
            {{ $t('Universal_0149') }}
          </el-button>
        </div>
      </div>
    </li>
    <li class="time-title" v-if="gtSevenDay.length > 0">{{ $t('Universal_0021') }}</li>
    <li class="flex align-center" v-for="(item, index) in gtSevenDay" :key="`${index}${item.id}${item.userId}`">
      <MemberIcon :image="handImg(item) | hand_group_avatar" iconType="medium" 
      :userRank="item.userRank" class="member-icon-class" :vipType="item.vipType" />
      <div class="flex-sub flex justify-between align-center mr20">
        <div class="flex-sub flex flex-direction" style="padding-right:20px;">
          <p class="contact-add-name text-cut" style="white-space: pre-line;">
            {{ showName(item) }}
            <LevelIcon v-if="!item.groupName" :inviteCode="item.inviteCode" 
            :userRank="item.userRank" iconType="medium" :vipType="item.vipType" :inviteCodeType="item.inviteCodeType" />
          </p>
          <p class="contact-add-des" v-if="item.applyStatus == 0 && item.groupName && userId == item.userId">
            {{ $t('book_notice_0008') }}
          </p>
          <p class="contact-add-des" v-else-if="item.applyStatus == 0 && !item.groupName && userId == item.userId">
            {{ $t('book_notice_0007') }}
          </p>
          <p class="contact-add-des" v-else>{{ item.content }}</p>
        </div>
        <div v-if="item.applyStatus == '-1'">
          <el-button type="danger" size="small" @click="handUpdateSimple(item, 0)">
            {{ $t('book_friend_0011') }}
          </el-button>
          <el-button type="primary" size="small" @click="acceptFriend(item, 1)">
            {{ $t('Universal_0266') }}
          </el-button>
        </div>
        <div v-else>
          <el-button v-if="item.applyStatus == 0 && userId != item.userId" type="danger" size="small">
            {{ $t('Universal_0152') }}
          </el-button>
          <el-button v-if="item.applyStatus == 1" type="info" size="small">
            {{ $t('Universal_0151') }}
          </el-button>
          <el-button v-if="item.applyStatus == -2" type="info" size="small">
            {{ $t('Universal_0149') }}
          </el-button>
        </div>
      </div>
    </li>
  </ul>
  <div v-if="noResult" class="no-results">
    <img src="../../../assets/images/web.png" class="img_search" />
    <p>{{ $t('book_notice_0019') }}</p>
  </div>
  <div class="loadmore" v-if="hasMore" v-loading="listLoading" element-loading-spinner="el-icon-loading" @click="loadmorelist()">
    {{ $t('Universal_0361') }}
  </div>
  <!-- <PersonInfoDialog
      :userInfo="userInfo"
      :dialogPersonInfoVisible="dialogPersonInfoVisible"
      @handCloseDialog="handCloseDialog"
    >
      <div>
        <el-button
          style="background-color: #2F54EB; width: 70%"
          @click="handUpdateSimple(userItem, 1, 'dialog')"
          type="info"
          >通过</el-button
        >
      </div>
      <div style="margin-top: 20px">
        <el-button
          style="background-color: #F5222D; width: 70%"
          @click="handUpdateSimple(userItem, 0, 'dialog')"
          type="warning"
          >拒绝</el-button
        >
      </div>
    </PersonInfoDialog> -->
  <el-dialog :title="$t('chat_addfriend_0014')" :visible.sync="dialogFriendVisile" width="40%" center>
    <div style="text-align:left">
      <span style="padding:10px 0;display:inline-block">{{ $t('book_friend_0005') }}</span>
      <el-form ref="ruleForm" :rules="formRules" :model="formValues" @submit.native.prevent>
        <el-form-item prop="friendNotes">
          <el-input :placeholder="$t('Universal_0353')" v-model="formValues.friendNotes"></el-input>
          <!-- <span style="padding:10px 0;display:inline-block">设置备注</span>
        <el-form ref="ruleForm" :rules="formRules" :model="formValues"  @submit.native.prevent>
          <el-form-item prop="friendNotes">
            <el-input placeholder="请输入备注2" v-model="formValues.friendNotes"></el-input> -->
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogFriendVisile = false" style="padding: 7px 25px">
        {{ $t('Universal_0063') }}
      </el-button>
      <el-button size="small" type="primary" @click="handUpdateSimple(friendItem, 1)" style="padding: 7px 25px">
        {{ $t('Universal_0062') }}
      </el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
// import PersonInfoDialog from "@/components/chat/PersonInfo";
import {
  getFriendsApplyList,
  updateSimple,
  getUserInfo,
  group_apply_member_deal
} from '../server';
import {
  diffDays
} from '@/utils';
import {
  mapActions
} from 'vuex';
import SQLUtils from '@/components/db/sqlite.js';
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import {
  t_friend_apply_builder
} from '@/utils/dbDataBuilder';
import bus from '@/utils/eventbus';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    // PersonInfoDialog,
    MemberIcon,
    LevelIcon
  },
  data() {
    let validateName = (rule, value, callback) => {
      if (value) {
        let length = value.replace(/[\u4e00-\u9fa5]/g, 'aaa').length;
        console.log('@@@@', length, value);
        if (length > 18 || length < 3) {
          callback(new Error(this.$t('Universal_0226')));
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    //这里存放数据
    return {
      noResult: false,
      listLoading: false,
      hasMore: false,
      isRouterAlive: true,
      oneAndthreeDay: [],
      threeAndSevenDay: [],
      gtSevenDay: [],
      loading: false,
      dialogPersonInfoVisible: false,
      userInfo: {},
      userItem: {},
      userId: localStorage.userId,
      dialogFriendVisile: false,
      friendItem: {},
      formValues: { 
        friendNotes: ''
      },
      pageSize: 10,
      pageNo: 1,
      formRules: {
        friendNotes: [{
          validator: validateName,
          trigger: 'blur',
          message: this.$t('Universal_0226')
        },
        {
          pattern: /^((?!didi).)+$/i, ///^didi/ig,
          message: this.$t('chat_comm_set_0017')
        }
        ]
      }
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  filters: {
    substringName(val) {
      return val && val.length > 10 ? val.substring(0, 10) + '...' : val;
    }
  },
  //方法集合
  methods: {
    acceptFriend(item) {
      this.dialogFriendVisile = true;
      this.friendItem = item;
    },
    async init() {
      // 这里判断本地是否有数据 没有从服务器获取 有从本地获取
      const list = await SQLUtils.getFriensApplyList(this.pageNo, this.pageSize)
      if (list.length === 0 && this.pageNo === 1) {
        this.getFriendsApplyListHand();
      } else {
        if (list.length === this.pageSize) {
          this.hasMore = true
        } else {
          this.hasMore = false
        }
        // 检查过期时间
        list.forEach(element => {
          // 七天时间戳
          const day7 = 7*24*60*60*1000 
          const applyTimeStamp7 = element.applyTimeStamp + day7
          // 当前时间与7天过期时间对比
          const timestamp = new Date().getTime();
          if (timestamp > applyTimeStamp7 && element.applyStatus == '-1') { // 当前时间大于7天过期时间  同时状态是 -1 更新状态
            element.applyStatus = -2 // 已过期
          }
        });
        this.sortTime(list)
      }
      this.$store.dispatch('SET_APPLY_FRINED_NUMBER', 0);
      this.$store.dispatch('SET_REJECT_FRIEND_NUMBER', 0);
      this.$store.dispatch('SET_REQUEST_FRIEND_NUMBER', 0);
      await SQLUtils.clearSystemMessageNumber();
      this.$store.dispatch('SET_TOTAL_SYSTEM_NUMBER', 0);
    },

    handImg(item) {
      let avatar;
      if (this.userId == item.userId) {
        // 本人发起申请
        avatar = item.friendHeadImgPath;
      }
      if (this.userId == item.friendId) {
        // 他人发起
        avatar = item.userHeadImgPath;
      }
      if (item.groupId != 0 && item.groupName) {
        if (item.applyStatus == -1 || item.applyStatus == 1) {
          avatar = item.userHeadImgPath;
        } else {
          if (this.userId == item.userId) {
            avatar = item.groupImg;
          } else {
            avatar = item.userHeadImgPath;
          }
        }
      }
      return avatar;
    },
    showName(item) {
      let name;
      if (this.userId == item.userId) {
        // 本人发起申请
        name = item.friendNickName;
        item.userRank = item.friendUserRank;
        item.inviteCode = item.friendInviteCode;
        item.inviteCodeType = item.friendInviteCodeType || 0;
        item.vipType = item.friendVipType;
      }
      if (this.userId == item.friendId) {
        // 他人发起
        name = item.userNickName;
      }
      if (item.groupId != 0 && item.groupName) {
        if (item.applyStatus == -1 || item.applyStatus == 1) {
          if (this.userId == item.userId) {
            name = item.friendNickName;
          } else {
            if (item.channelCode == '2') {
              // xx邀请xx加入xx群
              name = this.userInviteGroup(item);
            } else if (item.channelCode == '1') {
              // xxx申请加入xxx群
              name = this.userApplyGroup(item);
            } else {
              name = item.userNickName;
            }
          }
        } else {
          if (this.userId == item.userId) {
            name = item.groupName;
          } else {
            if (item.channelCode == '2') {
              // xx邀请xx加入xx群
              name = this.userInviteGroup(item);
            } else if (item.channelCode == '1') {
              // xxx申请加入xxx群
              name = this.userApplyGroup(item);
            } else {
              name = item.userNickName;
            }
          }
        }
      }
      return name;
    },
    userApplyGroup(item) {
      return this.$t('book_notice_0003', {
        value1: item.userNickName,
        value2: item.groupName
      });
      // .concat("群");
    },
    userInviteGroup(item) {
      return this.$t('book_notice_0004', {
        value1: item.friendNickName,
        value2: item.userNickName,
        value3: item.groupName
      });
    },
    handOpenPersonInfo(item) {
      // 弹出个人信息弹框
      if (item.applyStatus == '-1') {
        this.userItem = item;
        // 申请中
        this.dialogPersonInfoVisible = true;
        if (this.userId == item.userId) {
          // 本人发起申请
          this.getUserInfoHand(item.friendId);
        }
        if (this.userId == item.friendId) {
          // 他人发起
          this.getUserInfoHand(item.userId);
        }
      }
    },
    handCloseDialog() {
      this.dialogPersonInfoVisible = false;
    },
    async getUserInfoHand(id) {
      // 获取好友信息 1014707554377326592
      let res = await getUserInfo({
        id
      });
      this.userInfo = res.data || {};
    },
    async getFriendsApplyListHand() {
      // 查询列表
      let pararms = {
        pageNo: 1,
        pageSize: 10000000,
        // 1017150835043491840
        friendId: localStorage.getItem('userId')
      };
      this.loading = true;
      let res = await getFriendsApplyList(pararms);
      if (res.code == '200') {
        if (res.data.rows.length > 0) {
          const rows = res.data.rows.map((row) => {
            // 时间都转成时间戳
            // row.applyTime = new Date(row.applyTime).getTime()
            // row.createdOn = new Date(row.createdOn).getTime()
            return t_friend_apply_builder(row)
          });
          console.log('getFriendsApplyListHand ===>', rows);
          await SQLUtils.insertFriendsApply(rows)
          // this.sortTime(res.data.rows) // 排序
          this.init()
          this.noResult = false
        } else {
          this.noResult = true
          console.log('无数据 页面显示暂无数据 ===>');
        }
      }
      this.loading = false;
      // if (res.code != '200') {
      //   this.$message.error(res.msg);
      // }
    },

    sortTime(rows) {
      const array = rows.filter(item => {
        // 三天内
        return diffDays(this.timeStamp2Time(item.applyTimeStamp) || item.applyTime) < 3;
      });
      this.oneAndthreeDay = this.oneAndthreeDay.concat(array)

      this.oneAndthreeDay.sort((a, b) => {
        return new Date(this.timeStamp2Time(b.applyTimeStamp) ||
          b.applyTime).getTime() - new Date(this.timeStamp2Time(a.applyTimeStamp) || a.applyTime).getTime();
      });
      
      const array2 = rows.filter(item => {
        // 七天前
        return diffDays(this.timeStamp2Time(item.applyTimeStamp) || item.applyTime) > 7;
      });
      this.gtSevenDay =  this.gtSevenDay.concat(array2)

      this.gtSevenDay.sort((a, b) => {
        return new Date(this.timeStamp2Time(b.applyTimeStamp) ||
          b.applyTime).getTime() - new Date(this.timeStamp2Time(a.applyTimeStamp) || a.applyTime).getTime();
      });

      const array3 = rows.filter(item => {
        // 三天前
        return diffDays(this.timeStamp2Time(item.applyTimeStamp) ||
          item.applyTime) <= 7 && diffDays(this.timeStamp2Time(item.applyTimeStamp) || item.applyTime) >= 3;
      });
      this.threeAndSevenDay = this.threeAndSevenDay.concat(array3)
      this.threeAndSevenDay.sort((a, b) => {
        return new Date(this.timeStamp2Time(b.applyTimeStamp) ||
          b.applyTime).getTime() - new Date(this.timeStamp2Time(a.applyTimeStamp) || a.applyTime).getTime();
      });
    },

    // 时间戳转日期
    timeStamp2Time(applyTimeStamp) {
      // return moment(parseInt(applyTimeStamp)).format('YYYY-MM-DD hh:mm:ss')
      return applyTimeStamp
    },

    async handUpdateSimple(item, val, type) {
      let {
        id,
        userId,
        friendId
      } = item;
      if (item.groupId && item.groupName) {
        // 群申请
        let params = {
          adminId: this.userId,
          applyUserId: id,
          groupId: item.groupId,
          status: val
        };
        let res = await group_apply_member_deal(params);
        if (res.code == 200) {
          this.$message.success(res.msg);
          // this.getFriendsApplyListHand();
          // 更新数据库好友状态
          let pararms = {
            id,
            userId,
            friendId,
            groupId: item.groupId,
            applyStatus: val,
          };
          await SQLUtils.updateFriendsApply(pararms)
          this.updateItem(pararms)
          // this.init()
        } else {
          this.$message.error(`${res.data.msg}`);
          // this.init();
          
        }
      } else {
        // 拒绝、同意好友
        // type: 参数，表示弹框的拒绝、同意好友
        let pararms = {
          id,
          userId,
          friendId,
          applyStatus: val,
          friendNotes: this.formValues.friendNotes
        };
        if (val == 0) {
          let res = await updateSimple(pararms);
          if (res.code == '200') {
            this.$message.success(res.msg);
            this.dialogFriendVisile = false;
            // this.getFriendsApplyListHand();
            // 更新数据库好友状态
            await SQLUtils.updateFriendsApply(pararms)
            this.updateItem(pararms)
            // this.init()
            if (type && type == 'dialog') {
              this.dialogPersonInfoVisible = false;
              this.dialogFriendVisile = true;
            }
          } else {
            // this.init();
            this.$message.error(res.msg);
          }
        } else {
          this.$refs['ruleForm'].validate(async valid => {
            if (valid) {
              let res = await updateSimple(pararms);
              if (res.code == '200') {
                this.$message.success(res.msg);
                this.dialogFriendVisile = false;
                // this.getFriendsApplyListHand();
                await SQLUtils.updateFriendsApply(pararms)
                this.updateItem(pararms)
                // this.init()
                if (type && type == 'dialog') {
                  this.dialogPersonInfoVisible = false;
                  this.dialogFriendVisile = true;
                }
              } else {
                // this.init();
                this.$message.error(res.msg);
              }
            }
          });
        }
      }
    },

    updateItem(pararms) {
      const item1 = this.oneAndthreeDay.filter(d=>d.id == pararms.id)[0]
      const item2 = this.gtSevenDay.filter(d=>d.id == pararms.id)[0]
      const item3 = this.threeAndSevenDay.filter(d=>d.id == pararms.id)[0]
      const item = item1 || item2 || item3
      if (item) {
        item.applyStatus = pararms.applyStatus
        item.friendId = pararms.friendId
        item.friendFriendNotes = pararms.friendFriendNotes
        item.group_id = pararms.group_id
      }
    },
    // 加载更多好友申请列表
    async loadmorelist() {
      this.listLoading = true
      this.pageNo ++
      await this.init();
      this.listLoading = false
    },
    ...mapActions({
      getFriendsListHand: 'GET_FRIENDS_LIST'
    }),
    async refreshApplyList() {
      if (this.isRouterAlive) {
        console.log('当前页面刷新泪列表数据');
        this.listLoading = true
        this.pageNo = 1
        await this.init();
        this.listLoading = false
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.init();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    bus.$on('refreshApplyList', this.refreshApplyList);
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    bus.$off('refreshApplyList', this.refreshApplyList);
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>

<style>
.el-dialog__title {
  font-size: 15px;
  font-weight: 700;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
@fixedHeight: 48px;

.contact-new-friends {
  height: 100vh;
  overflow: hidden;

  .mr20 {
    margin-right: 20px;
  }

  .contact-new-friends-title {
    position: fixed;
    width: 100%;
    z-index: 2;
    padding: 0 20px;
    color: #333333;
    height: @fixedHeight;
    line-height: @fixedHeight;
    font-size: 18px;
    font-weight: 600;
    background-color: #f3f3f3;
  }

  .contact-new-friends-item {
    margin-top: @fixedHeight;
    max-height: calc(100vh - @fixedHeight - 40px);
    overflow: scroll;

    li {
      padding: 20px;
      border-bottom: 2px solid #dddddd;

      &:last-child {
        border-bottom: none;
      }

      .contact-add-des {
        margin-top: 10px;
        font-size: 14px;
        color: #999999;
        white-space: normal;
        word-break: break-all;
        word-wrap: break-word;
      }

      .contact-add-name {
        color: #333333;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;

        div {
          padding-left: 2px;
        }
      }

      &.time-title {
        color: #333333;
        height: 50px;
        line-height: 50px;
        padding: 0 20px;
        border: none;
        background-color: #fcfbfb;
      }
    }
  }

  .no-results {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: #999;
    font-size: 14px;
  }

  .loadmore {
    font-size: 12px;
    text-align: center;
    color: #2f54eb;
  }
}

.member-icon-class {
  margin-right: 16px;
}
</style>
