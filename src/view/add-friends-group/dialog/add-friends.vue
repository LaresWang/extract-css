<!-- 添加好友 -->
<template>
  <div class="addFriend">
    <el-dialog
      :title="$t('chat_addfriend_0001')"
      @close="handCloseAddFriends"
      :close-on-click-modal="false"
      :append-to-body="true"
      :visible="dialogAddFriendsVisible"
      :center="true"
      width="380px"
      custom-class="dialog-position"
      class="addFriendDialog"
    >
      <div class="add-friend-dialog-con text-center">
        <el-row>
          <el-col>
            <p style="padding:10px 0;text-align:left">{{ $t('chat_addfriend_0012') }}</p>
            <el-form ref="ruleForm" :rules="formRules" label-position="top" label-width="80px" :model="formValues" @submit.native.prevent>
              <el-form-item>
                <div class="add-friend-dialog-textarea">
                  <el-input
                    type="textarea"
                    :rows="4"
                    v-model="text"
                    maxlength="30"
                    :rules="[
                      {
                        min: 5,
                        max: 200,
                        message: $t('Universal_0241'),
                        trigger: 'blur'
                      }
                    ]"
                    show-word-limit
                  ></el-input>
                </div>
              </el-form-item>
              <el-form-item prop="friendNotes">
                <div style="text-align:left">
                  <span style="padding:10px 0;display:inline-block">{{ $t('book_friend_0005') }}</span>
                  <el-input :placeholder="$t('Universal_0353')" v-model="formValues.friendNotes"></el-input>
                </div>
              </el-form-item>
            </el-form>
            <div class="add-friend-dialog-btns">
              <el-button
                @click="handCancelDialog"
                style="
                  background-color: #d8d8d8;
                  color: #333;
                  border: 1px solid #d8d8d8;
                "
                type="info"
                >{{ $t('Universal_0063') }}</el-button
              >

              <el-button @click="handConfirmDialog(friendData.id)" style="background-color: #2F54EB" type="primary">
                {{ $t('Universal_0062') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { add_the_friends } from "../add/server";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
import { mapState,mapGetters } from "vuex";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    dialogAddFriendsVisible: {
      type: Boolean,
      default() {
        return false;
      }
    },
    friendData: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  filters: {
    substringName(val) {
      return val && val.length > 10 ? val.substring(0, 10) + '...' : val;
    }
  },
  data() {
    //这里存放数据
    let validateName = (rule, value, callback) => {
      if (value) {
        let length = value.replace(/[\u4e00-\u9fa5]/g, 'aaa').length;
        console.log('@@@@', length, value);
        if (length > 18 || length < 3) {
          callback(new Error(this.$t('Universal_0225')));
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    return {
      text: '',
      formValues: {
        friendNotes: ''
      },
      formRules: {
        friendNotes: [
          {
            validator: validateName,
            trigger: 'blur',
            message: this.$t('Universal_0225')
          },
          {
            pattern: /^((?!didi).)+$/i, ///^didi/ig,
            message: this.$t('chat_comm_set_0017')
          }
        ]
      },
      userInfoName: ''
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      personalAppealInfo: (state) => {
        return state.common.personalAppealInfo;
      },
    }),
    ...mapGetters({
      userInfo: 'userInfo'
    })
  },
  //监控data中的数据变化
  watch: {
    dialogAddFriendsVisible(n) {
      if (n === true) {
        this.text = this.$t('book_friend_0022') + this.userInfoName;
      }
    }
  },
  //方法集合
  methods: {
    async addFriends(param) {
      let res = await add_the_friends(param);
      if (res.code == 200) {
        this.$message.success(this.$t('Universal_0138'));
        this.text = '';
      } else {
        this.$message({
          message: res.msg || res.data.msg,
          type: 'error',
          customClass: 'mzindex'
        });
        return;
      }
    },
    async setkeynull() {
      this.text = this.$t('book_friend_0022') + UserInfoUtils.getCurrentUserNickName();
      this.userInfoName = UserInfoUtils.getCurrentUserNickName();
    },
    handCloseAddFriends() {
      this.$emit('handCloseAddFriends', false);
      this.$emit('handCancelFriDialog', false);
    },
    handConfirmDialog(a) {
      if(this.personalAppealInfo.createTime){
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', {time}), this.$t('Universal_0059'),{
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('Di_0015'),
          center: true,
          showClose: false,
        }).then(() => {
          this.$emit('toAppeal');
        }).catch(() => {
        });
      }else{
        this.$refs['ruleForm'].validate(async (valid) => {
          if(valid){
            let userid = UserInfoUtils.getCurrentUserId();
            let param = {
              userId: userid,
              friendId: a,
              source: "1",
              applyStatus: -1,
              content: this.text,
              friendNotes:this.formValues.friendNotes
            };
            this.addFriends(param);
            this.$emit("handConfirmFriDialog", false);
          }
        })
      }
      
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

/deep/ .el-button + .el-button {
  margin-left: 30px;
}

/deep/ .dialog-position {
  margin-top: 12vh !important;
  margin-left: 45vw !important;
}

/deep/ .el-dialog__wrapper {
  overflow: hidden;
}
.add-friend-dialog-name {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 10px 0 5px;
}
.add-friend-dialog-code {
  color: #999;
  font-size: 14px;
}
.add-friend-dialog-des {
  text-align: left;
  color: #999;
  font-size: 12px;
  margin: 10px 0 20px;
  word-break: break-all;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.add-friend-dialog-bot {
  li {
    border-right: 1px solid #2f54eb;
    flex: 1;
    color: #333333;
    font-size: 14px;
    &:last-child {
      border-right: none;
    }
    .add-friend-dialog-number {
      font-weight: 600;
      line-height: 25px;
      img {
        vertical-align: middle;
      }
    }
    .add-friend-dialog-word {
      color: #999999;
      font-size: 12px;
      line-height: 25px;
    }
  }
}
.add-friend-dialog-btns {
  margin-top: 20px;
  text-align: right;
  button {
    font-size: 13px;
    padding: 7px 29px;
    text-align: center;
    margin span {
      display: inline-block;
    }
  }
}

.addFriendDialog {
  /deep/ .el-dialog__header {
    padding-top: 10px;
    padding-bottom: 20px;
  }
  /deep/ .el-dialog__title {
    font-size: 14px;

    font-weight: 600;
    color: #333333;
    line-height: 20px;
  }
  /deep/ .el-dialog__body {
    padding: 0 20px 20px;
  }
  .add-friend-dialog-textarea {
    // height: 152px;
    background: #fbfbfb;
    border: 1px solid #d7d7d7;
  }

  /deep/ .el-input__inner,
  .el-textarea__inner {
    background-color: #fbfbfb;
  }
}
</style>
