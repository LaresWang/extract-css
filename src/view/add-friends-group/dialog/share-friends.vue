<!-- 添加好友 -->
<template>
  <div class="addFriend">
    <el-dialog
      class="invite-friend"
      :title="$t('chat_home_0007')"
      :append-to-body="true"
      width="380px"
      :before-close="gotoChat"
      :visible="dialogShareVisible"
    >
      <div class="share-link">{{ $t('chat_addfriend_0016') }}</div>
      <div class="add-friend-dialog-con text-center">
        <el-input v-model="linkurl" readonly style="width: 300px" id="link"></el-input>
        <span v-clipboard:copy="linkurl" v-clipboard:success="onCopy" class="copy">{{ $t('chat_0026') }}</span>
      </div>
      <div class="finish-btn">
        <el-button size="small" type="primary" @click="gotoChat()">{{ $t('Universal_0060') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { add_the_friends } from '../add/server';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    dialogShareVisible: {
      type: Boolean,
      default() {
        return false;
      }
    }
  },
  data() {
    //这里存放数据
    return {
      text: '',
      userInfoName: '',
      linkurl: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    async setkeynull() {
      this.text = this.$t('book_friend_0022') + UserInfoUtils.getCurrentUserNickName();
      this.userInfoName = UserInfoUtils.getCurrentUserNickName();
    },
    async addFriends(param) {
      let res = await add_the_friends(param);
      if (res.code == 200) {
        this.$message.success(this.$t('Universal_0138'));
        this.text = '';
      } else {
        this.$message({
          message: res.msg,
          type: 'error',
          customClass: 'mzindex'
        });
        return;
      }
    },
    onCopy() {
      this.$message.success(this.$t('Universal_0118'));
    },
    gotoChat() {
      // this.dialogShareVisible = false;
      this.$emit('dialog-share-close');
    },
    queryGroupByGroupId() {
      let language = this.$i18n.locale;
      let Baseurl = process.env.VUE_APP_SHARE;
      let obj = JSON.parse(localStorage.getItem('userInfo'));
      console.log('-----', obj.inviteCode);
      this.linkurl = `${Baseurl}/#/invite/personal?userId=${UserInfoUtils.getCurrentUserId()}&inviteCode=${
        obj.inviteCode
      }&language=${language}&nickName=${obj.nickName}&category=fgg`;
      this.linkurl = encodeURI(this.linkurl);
    },
    handCloseAddFriends() {
      this.$emit('handCloseAddFriends', false);
    },
    handConfirmDialog(a) {
      let userid = UserInfoUtils.getCurrentUserId();
      let param = {
        userId: userid,
        friendId: a,
        source: '1',
        applyStatus: -1,
        content: this.text
      };

      this.addFriends(param);
      this.$emit('handConfirmFriDialog', false);
    },
    handCancelDialog() {
      // this.text = ''
      this.$emit('handCancelFriDialog', false);
      // this.text=`我是${this.friendData.userNickName}`
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.setkeynull();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.queryGroupByGroupId();
    //  this.text=`我是${this.friendData.userNickName}`
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

.invite-friend {
  /deep/ .el-dialog__header {
    text-align: center;
    padding-top: 10px;
  }

  /deep/ .el-dialog__title {
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  /deep/ .el-dialog__headerbtn {
    top: 12px;
    color: #000;
    font-size: 14px;
  }

  /deep/ .el-dialog__body {
    padding-top: 0;
    color: #333;
  }

  .share-link {
    text-align: center;
    height: 20px;
    font-size: 14px;

    font-weight: 400;
    color: #333;
    line-height: 20px;
    margin: 40px auto 15px;
  }
  .add-friend-dialog-con {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /deep/ .el-input__inner,
  .el-textarea__inner {
    height: 33px;
    background: #fbfbfb;
    border: 1px solid #d7d7d7;

    font-size: 12px;

    font-weight: 400;
    color: #333;
  }

  /deep/ .copy {
    font-size: 12px;
    font-weight: 400;
    color: #2f54eb;
    line-height: 17px;
  }
}

.finish-btn {
  margin-top: 30px;
  text-align: center;

  /deep/ .el-button--primary {
    margin: 50px auto 0px;

    width: 202px;
    height: 28px;
    background: #2f54eb;
    border-radius: 3px;
  }
  /deep/ .el-button--mini,
  .el-button--small {
    font-size: 13px;

    font-weight: 400;
    padding-top: 7px;
  }
}
</style>
