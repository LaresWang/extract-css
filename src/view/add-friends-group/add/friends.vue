<!--成员列表-加好友  -->
<template>
  <div class="friends">
    <div class="flex top">
      <el-input
        size="small"
        :placeholder="$t('Universal_0360')"
        prefix-icon="el-icon-search"
        style="flex: 1; margin-right: 10px"
        v-model="value"
        clearable
        @keydown.enter.native="search"
        id="addFriSearch"
        :code="addFriVisible"
        @click="document.getElementById('addFriSearch').focus()"
      ></el-input>
      <el-button size="small" type="primary" @click="search">{{ $t('Universal_0058') }}</el-button>
    </div>
    <div class="link" >
      <div @click="Toshare" class="invite-link" style="position: relative">
        <div
          style="
            display: inline-block;
            position: absolute;
            left: -15px;
            top: 2px;
          "
        >
          <img src="../../../assets/images/link_share.png" />
        </div>
        <span>{{ $t('chat_addfriend_0006') }}</span>
      </div>
      <div class="invite-tip">{{ $t('chat_addfriend_0007') }}</div>
    </div>

    <div class="list"  >
      <div  v-if="hasData && addFriVisible" id="linkF2"  contenteditable="true"  @keydown.enter="keyMoveF">
        <ul class="list-box" contenteditable="false">
          <li class="li-card" v-for="(item, index) in dataList" 
          :key="index"
          :class="{activeFri:indexAt == item.indexAt}" 
          :id="item.inviteCode">
            <div class="card flex align-center">
              <div class="left">
                <MemberIcon :image="item.userHeadImg" iconType="mini" :userRank="item.userRank" :vipType="item.vipType" />
                <div class="name-code-class ">
                  <p class="name flex">
                    <span class="user-nick-name" :title="item.userNickName"> {{ item.userNickName }}</span>
                    <LevelIcon
                      :inviteCode="item.inviteCode"
                      :userRank="item.userRank"
                      iconType="medium"
                      :vipType="item.vipType"
                      :inviteCodeType="item.inviteCodeType"
                    />
                  </p>
                  <p class="pass">
                    <!-- 个人ID：{{item.inviteCode}} -->
                    <LuckIdIcon
                      :inviteCode="item.inviteCode"
                      :userRank="item.userRank"
                      iconType="medium"
                      :vipType="item.vipType"
                      :inviteCodeType="item.inviteCodeType"
                      :listFlag="false"
                    />
                  </p>
                </div>
              </div>
              <!-- <div class="right">
                <button class="btn" v-if="item.isFriend" @click="goChat(item)">
                  开始聊天
                </button>
                <el-button v-else-if="item.id == id" disabled="disabled" size="small" style="font-size: 14px">加为好友</el-button>
                <el-button v-else-if="item.friendApplyStatus == 0" disabled="disabled" size="small" type="info" style="font-size: 14px;"
                  ><i class="iconfont icon-jinzhi1 no-use-btn"></i>加为好友</el-button
                >
                <button class="btn" v-else @click="addFriends(item.id)">
                  加为好友
                </button>
              </div>
            </div> -->
            <div class="right">
              <button class="btn" v-if="item.isFriend" @click="goChat(item)">
                {{ $t('Universal_0354') }}
              </button>
              <el-button v-else-if="item.id == id" disabled="disabled" size="small" style="font-size: 14px">
                {{ $t('book_friend_0012') }}
              </el-button>
              <el-button v-else-if="item.friendApplyStatus == 0" disabled="disabled" size="small" type="info" style="font-size: 14px;"
                ><i class="iconfont icon-jinzhi1 no-use-btn"></i>{{ $t('book_friend_0012') }}</el-button
              >
              <button class="btn" v-else @click="addFriends(item.id)">
                {{ $t('book_friend_0012') }}
              </button>
            </div>
          </div>
          </li>
        </ul>
      </div>
      <ul v-else class="ser-nocontent">
        <div class="no-box">
          <img src="../../../assets/images/web.png" alt="error" />
          <p>{{ $t('Universal_0174') }}</p>
        </div>
      </ul>
    </div>
    <DialogAddFriendVisible
      ref="myordernum"
      :dialogAddFriendsVisible="dialogAddFriendsVisible"
      @handCancelFriDialog="handCancelFriDialog"
      @handConfirmFriDialog="handConfirmFriDialog"
      :friendData="friendData"
      @toAppeal="toAppeal('single')"
    />
    <DialogShareVisible
      ref="myordernum"
      :dialogShareVisible="dialogShareVisible"
      @dialog-share-close="dialogShareClose"
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
import DialogAddFriendVisible from "../dialog/add-friends";
import DialogShareVisible from "../dialog/share-friends";
import MemberIcon from "@/components/memberIcon/MemberIcon";
import { get_query_code } from "../../../server";
import { get_the_info } from "../add/server";
import { contFriSize } from "@/utils";
import { CLEAR_CHAT } from "@/store/types";
import { mapState,mapMutations } from "vuex";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
import LevelIcon from "@/components/memberIcon/LevelIcon";
import LuckIdIcon from "@/components/memberIcon/luckIdIcon";
import AppealsDialog from "@/view/chat/appeals";
import ImpeachDialog from "@/view/chat/impeach";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    DialogAddFriendVisible,
    DialogShareVisible,
    MemberIcon,
    LevelIcon,
    LuckIdIcon,
    AppealsDialog,
    ImpeachDialog,
  },
  props: {
    addFriVisible:{
      type:Boolean,
      default:false
    },
    inviteCode: {
      type: String,
      default: ''
    }
  },
  data() {
    //这里存放数据
    return {
      addFlag: true,
      id: '',
      value: '',
      dialogAddFriendsVisible: false,
      dialogShareVisible: false,
      AppealsVisible: false,
      ImpeachVisible: false,
      impeachFromtype: '',//来源类型
      dataList: [],
      hasData: true,
      friendData: {},
      indexAt:0,
      currentItem:{},//上下键选中的item
      alldataNum:0
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
  //   'isCon':function(){
  //     if(this.isCon == 1){
  //       this.value = ''
  //     }
  //   }
    // addFriVisible(val){
    //   if(!val){
    //     document.getElementById('linkF2').removeEventListener('keydown', this.keyMoveF)
    //   }
    // }
  },
  //方法集合
  filters: {
    substringName(val) {
      return val && val.length > 10 ? val.substring(0, 10) + '...' : val;
    }
  },
  methods: {
    ...mapMutations([CLEAR_CHAT]),
    goChat(a) {
      const userId = UserInfoUtils.getCurrentUserId();
      const current = {
        id: a.id,
        fromId: a.id,
        targetId: userId,
        fromType: '999',
        targetType: 1,
        msgType: 1,
        timer: new Date().getTime(),
        uniqueCode: contFriSize(userId, a.id),
        friendName: a.friendNickName
      };
      this.$store.dispatch('ADD_LAST_MSG_LIST', { ...current, isJump: true });
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.$router.push({
        path: '/app/chat/single/message',
        query: current
      });
      this.$emit('handleColseFri', false);
    },
    dialogShareClose() {
      this.dialogShareVisible = false;
    },
    async search() {
      if (!this.value.trim()) {
        this.$message.error(this.$t('Universal_0240'));
        return;
      }
      let params = {
        code: this.value
      };
      await this.searchFriend(params);
      document.getElementById('addFriSearch').blur()
      this.chooseSearch()
      
    },
    async searchFriend(param) {
      try {
        let res = await get_query_code(param);
        this.dataList = res.data;
        console.log(param, this.id, this.dataList);
        this.dataList.forEach((item,index)=>{
          item.indexAt = index;
        })
        if (this.dataList.length == 0) {
          this.hasData = false;
        } else {
          this.hasData = true;
          this.alldataNum = this.dataList.length
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getFrInfo(a) {
      let res = await get_the_info({ id: a });
      if (res.code == 200) {
        this.friendData = res.data;
        this.$refs.myordernum.setkeynull();
      }
    },
    addFriends(a) {
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
        this.getFrInfo(a);

        this.dialogAddFriendsVisible = true;
      }
      
    },
    Toshare() {
      this.dialogShareVisible = true;
    },
    handCancelFriDialog(param) {
      this.dialogAddFriendsVisible = param;
    },
    handConfirmFriDialog(param) {
      this.dialogAddFriendsVisible = param;
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
    move(target){
      if( document.getElementsByClassName('serlist')[0]){
        if(target == 'up'){
          document.getElementsByClassName('serlist')[0].scrollTop = document.getElementsByClassName('activeFri')[0].offsetTop-150
        }else{
          document.getElementsByClassName('serlist')[0].scrollTop = document.getElementsByClassName('activeFri')[0].offsetTop-100
        }
      }
      console.log(document.getElementsByClassName('activeFri')[0].offsetTop,'位移')
    },
    keyMoveF(e){
      if(e.keyCode == 38){ //上键
        console.log(this.indexAt,'up111')
        if(this.indexAt>0){
          this.indexAt--;
        }else{
          this.indexAt = 0;
        }
        this.move('up')
      }else if(e.keyCode == 40){ //下键
        if(this.indexAt < this.alldataNum-1){
          this.indexAt++;
        }else if(this.indexAt == this.alldataNum){
          this.indexAt = this.indexAt-1 ;
        }
        this.move('down')
      }
      else if(e.keyCode == 13 && this.addFlag){
        let currentId='';
        if(document.getElementsByClassName('activeFri')[0]){
          currentId = document.getElementsByClassName('activeFri')[0].getAttribute("id")
          console.log(currentId,'currentId')
        }
        this.currentItem = this.dataList.filter((item) => {
          return item.inviteCode == currentId
        })

        if(this.currentItem[0].isFriend){
          this.goChat(this.currentItem[0]) //聊天
        }else{
          this.addFriends(this.currentItem[0].id) //加为好友
        }
        this.addFlag = false;
      }
      
    },
    chooseSearch(){
      if(this.hasData){
        this.indexAt = 0;
        document.getElementById('linkF2').focus()
      }
      // document.getElementById('linkF').removeEventListener('keydown', this.keyMoveF)
      // if(this.hasData){ // && document.getElementById('searchAll') == document.activeFriElement
      //   document.getElementById('linkF').addEventListener('keydown',this.keyMoveF)
      // }
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.id = UserInfoUtils.getCurrentUserId();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    if (this.inviteCode) {
      this.value = this.inviteCode;
      this.search();
    }
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    // if(document.getElementById('linkF')){
    //   document.getElementById('linkF').removeEventListener('keydown', this.keyMoveF)
    // }
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.activeFri .card{
  background:#eaeaea !important;
}
.friends {
  .top {
    width: 90%;
    margin: 10px auto 0px;

    /dee/ .el-button--small {
      // height: 18px;
      // line-height: 18px;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
    }
  }

  .link {
    text-align: center;
    margin: 30px auto 0px;
    font-size: 12px;
    font-weight: 400;

    .invite-link {
      display: inline-block;
      color: #2f54eb;
      cursor: pointer;

      img {
        width: 12px;
        height: 12px;
        margin-right: 5px;
      }
    }

    .invite-tip {
      display: inline-block;
      margin-left: 10px;
      color: rgba(153, 153, 153, 1);
    }
  }

  .list {
    max-height: 390px;
    overflow: scroll;
    .list-box {
      .li-card {
        display: inline-block;
        margin-left: 24px;
        margin-top: 20px;
        .card {
          display: flex;
          justify-content: flex-end;
          padding: 10px 20px;
          width: 310px;
          background: rgba(255, 255, 255, 1);
          box-shadow: 0px 0px 4px 0px rgba(47, 83, 234, 0.2);
          border-radius: 10px;
          margin-bottom: 2px;
          .left {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            flex: 1;
            .name-code-class {
              padding-left: 15px;
              height: 40px;
              display: flex;
              flex-direction: column;
              justify-content: space-around;
              width: 183px;
            }
            .name {
              align-items: center;
              font-size: 12px;
              font-weight: 500;
              color: rgba(51, 51, 51, 1);
              line-height: 20px;
              padding-left: 2px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              .user-nick-name {
                padding-right:5px;
                white-space: pre;
                max-width: 110px;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
            .pass {
              font-size: 12px;
              font-weight: 500;
              color: rgba(153, 153, 153, 1);
              line-height: 17px;
            }
          }
          .right {
            .btn {
              cursor: pointer;
              border: none;
              min-width: 90px;
              max-width: 110px;
              padding: 7px 10px;
              background: rgba(47, 84, 235, 1);
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              color: rgba(255, 255, 255, 1);
              word-break: break-word;
            }
          }
        }
      }
    }
    .ser-nocontent {
      text-align: center;
      .no-box {
        margin-top: 20px;
      }
    }
  }

  .no-use-btn {
    font-size: 14px;
  }
  /deep/ .el-button--small {
    padding: 9px 10px;
    white-space: pre-line;
  }
}
</style>
