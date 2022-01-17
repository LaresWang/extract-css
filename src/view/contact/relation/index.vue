
<!--  -->
<template>
<VCFixedHeightScrollBar  class="scroll-color" ref="scroll" :noresize='true' :availableScrollHeight='availableScrollHeight'>
  <div class="relation-wrap">
    <div class="new-friends flex align-center"
    @click="handleSysMsgRouter" :class="$route.path == '/app/contact/addfriends' ? 'active' : ''">
      <img class="img_38" src="../../../assets/images/system.png" alt />
      <div class="flex-sub text-cut flex justify-between" >
        <div style="min-height:20px">{{ $t('Universal_0382') }}</div>
        <el-badge v-if="totalNumber > 0" :value="totalNumber" class="item"></el-badge>
      </div>
    </div>
    <ul class="relation-friends-ul"  
        v-infinite-scroll="loadMore"
        :infinite-scroll-immediate='true'
        :infinite-scroll-distance="70">
      <li
        @click="handGoChat(item)"
        v-for="(item, index) in showFriendsList"
        :key="index"
        class="relation-friends-avatar flex align-center"
        :class="{ active: isSelect == item.friendId }"
        @contextmenu.prevent="rightClick($event, item)"
      >
        <!-- <div class="relation-friends-avatar">
        <ul>-->
        <!-- <li v-for="item in 3" :key="item" class="flex align-center"> -->
        <MemberIcon
          :image="item.friendHeadImg"
          iconType="small"
          :userRank="item.userRank"
          style="margin-right: 12px"
          :vipType="item.vipType"
        />
        <div>
          <div class="nameClass">
            <span class="flex-sub text-cut pre-wrap">
              {{ item.friendNickName }}
            </span>
            <LevelIcon
              :inviteCode="item.inviteCode"
              :userRank="item.userRank"
              iconType="medium"
              :vipType="item.vipType"
              :inviteCodeType="item.inviteCodeType"
            />
          </div>
          <div style="margin-top:5px">
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
 </VCFixedHeightScrollBar>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { remote } from 'electron';
import { SET_CHAT, CLEAR_CHAT, ADD_LAST_MSG_LIST } from '@/store/types';
import { mapState, mapMutations } from 'vuex';
import { contFriSize } from '@/utils';
import fileOperational from '@/services/fileOperational';
import { getSelfUserId } from '@/utils/const';
import { delete_friend } from '@/server.js';
import SQLUtils from '@/components/db/sqlite.js';
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
import VCFixedHeightScrollBar from "@/components/ScrollBar/Index"
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    VCFixedHeightScrollBar,
    MemberIcon,
    LevelIcon,
    LuckIdIcon
  },
  props: {
    availableScrollHeight:Number,
    list: {
      type: Array,
      dafault() {
        return [];
      }
    },
    flagFriend: {
      type: Number,
      default() {
        return 0;
      }
    }
  },
  data() {
    //这里存放数据
    return {
      showFriendsList:[],
      flag: 0,
      isSelect: this.$route.query?.isSelect?this.$route.query.isSelect:''
    };
  },
  watch:{
    'list.length': function () { 
      this.showFriendsList=[];//新增 联系人存在排序
      this.loadMore();//deleteFriend 删除好友路由跳转了
    }
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      totalNumber: state => {
        return state.chat.totalSystemNumber;
      }
    })
  },
  methods: {
    ...mapMutations([SET_CHAT, CLEAR_CHAT, ADD_LAST_MSG_LIST]),
    loadMore() {
      let len=this.showFriendsList.length;
      this.showFriendsList = [...this.showFriendsList, ...this.list.slice(len, len+20)];
    },
    handleSysMsgRouter(){
      this.isSelect = '';
      this.$router.push({name:"new-friends"})
    },
    findImage(image) {
      return fileOperational.getImage(image);
    },
    handGoChat(item) {
      this.isSelect = item.friendId;

      this.$router.push({
        path: '/app/contact/info',
        query: {
          flag: this.flagFriend,
          id: item.friendId,
          targetId: item.userId,
          nickName: item.friendNickName,
          headImg: item.friendHeadImg
        }
      });
    },
    rightClick(e, item) {
      e.preventDefault();
      this.addClick(item);
    },
    addClick(item) {
      const menu = [
        {
          name: this.$t('Universal_0359'),
          fun: () => {
            this.goToChat(item);
          }
        },
        {
          name: this.$t('book_friend_0018'),
          fun: () => {
            this.deleteFriend(item);
          }
        }
      ];
      return this.$RightClick(menu).popup({
        window: remote.getCurrentWindow()
      });
    },
    currentUserId() {
      return getSelfUserId();
    },
    goToChat(item) {
      this.CLEAR_CHAT();
      let current = {
        id: item.friendId,
        sessionName: item.friendNickName,
        sessionIcon: item.friendHeadImg,
        targetType: 1, //单聊
        msgType: 1, //默认文本
        uniqueCode: contFriSize(item.friendId, this.currentUserId()),
        targetId: item.friendId
      };
      this.$store.dispatch('ADD_LAST_MSG_LIST', { ...current, isJump: true });
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.$router.push({
        path: '/app/chat/single/message',
        query: {
          id: item.friendId,
          fromId: item.friendId,
          targetId: this.currentUserId(),
          timer: new Date().getTime(),
          uniqueCode: contFriSize(item.friendId, this.currentUserId()),
          friendName: encodeURI(item.friendNickName)
        }
      });
    },
    deleteFriend(item) {
      let message = this.$t('book_friend_0019', {friend: item.friendNickName});
      this.$confirm(message, this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning'
      })
        .then(() => {
          this.deleteFriendConfirm(item);
        })
        .catch(() => {});
    },
    async deleteFriendConfirm(item) {
      let res = await delete_friend({
        userId: this.currentUserId(),
        friendId: item.friendId
      });
      if (res.code == 200) {
        this.$router.push({
          path: '/app/chat'
        });
        this.$message({
          type: 'success',
          message: this.$t('Universal_0107')
        });
        await SQLUtils.updateFromTypeBy_210({ targetId: item.friendId,fromId:localStorage.userId });
        this.$store.dispatch('GET_LAST_MSG_LIST');
      }
    }
  },
 
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    console.log(this.$route.path, '$route.path');
  },
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
// .bgActive {
//   background: #f6f6f6 !important;
// }
.nameClass {
  display: flex;
  align-items: center;
  span {
    max-width: 97px;
    padding-right: 3px;
  }
}
.relation-wrap {
  .new-friends {
    cursor: pointer;
    // height: 60px;
    height: 66px;
    background-color: #fff;
    padding: 0 10px;
    border-bottom: 1px solid #e4e4e4;

    .img_38{
      width: 38px;height: 38px;
      margin-right: 10px;
    }
  }
  .relation-friends-ul {
    padding-bottom: 100px;
    min-height: 100px;//触发 滚动加载
    .relation-friends-avatar {
      // padding-top: 20px;
    }
    li {
      // height: 60px;
      height: 66px;
      padding: 0 10px;
      border-bottom: 1px solid #e4e4e4;
      background-color: #fff;
      // &:last-child {
      //   border-bottom: none;
      // }
      cursor: pointer;
    }
  }
}
.active {
  background-color: #e4e4e4 !important;
}
</style>
