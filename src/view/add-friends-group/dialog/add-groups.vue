<!-- 添加好友 -->
<template>
  <div>
    <el-dialog
      :lock-scroll="true"
      :title="$t('chat_joincommunity_0009')"
      @close="handCloseAddGroups"
      :close-on-click-modal="false"
      :append-to-body="true"
      width="380px"
      :visible="dialogAddGroupsVisible"
      :center="true"
      custom-class="dialog-position"
      class="add-group-wrap"
    >
      <div class="add-group-dialog-con text-center" style="cursor: auto">
        <el-row>
          <el-col>
            <div class="add-group-dialog-textarea">
              <el-input rows="6" class="verify-info" type="textarea" v-model="text"></el-input>
            </div>
            <div class="add-group-dialog-btns">
              <el-button @click="handCancelDialog" style="background-color: #9297A3" type="info">
                {{ $t('Universal_0063') }}
              </el-button>
              <el-button @click="handConfirmDialog(groupData)" style="background-color: #2F54EB" type="primary">
                {{ $t('Universal_0046') }}
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
import { send_add_group_apply } from "../add/server";
import { contGrpSize } from "@/utils";
import { mapState,mapMutations, mapGetters } from "vuex";
import { CLEAR_CHAT } from "@/store/types";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    dialogAddGroupsVisible: {
      type: Boolean,
      default() {
        return false;
      }
    },
    groupData: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    //这里存放数据
    return {
      text: ''
    };
  },
  filters: {
    substringName(val) {
      return val && val.length > 10 ? val.substring(0, 10) + '...' : val;
    }
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
    dialogAddGroupsVisible: {
      handler(n) {
        if (n === true) {
          this.text = this.$t('book_friend_0022') + this.userInfo && this.userInfo.userName;
        }
      }
    }
  },
  //方法集合
  methods: {
    ...mapMutations([CLEAR_CHAT]),
    handCloseAddGroups() {
      this.$emit('handCloseAddGroups', false);
    },
    async goGroup(param) {
      let res = await send_add_group_apply([param]);
      if (res.code == 200) {
        this.$message.success(this.$t('chat_joincommunity_0010'));
        this.text = '';
      } else {
        this.$message.error(res.msg);
        return;
      }
    },
    handGoChat(a) {
      this.CLEAR_CHAT();
      let current = {
        uniqueCode: contGrpSize(a.id)
      };
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
      this.$emit('handConfirmGroupDialog', false);
    },
    handConfirmDialog(a) {
      if(this.personalAppealInfo.createTime){
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(this.$t('appeal_0003', {time}), this.$t('Universal_0059'),{
          confirmButtonText: this.$t('appeal_0017'),
          cancelButtonText: this.$t('book_group_0019'),
          center: true,
          showClose: false,
        }).then(() => {
          this.$emit('toAppeal');
        }).catch(() => {
        });
      }else{
        if (this.text.trim() === "") {
          this.$message.warning(this.$t('Universal_0242'));
          return;
        }
        let userid = UserInfoUtils.getCurrentUserId();
        let param = {
          channelCode: 1,
          userId: userid,
          groupId: a.id,
          content: this.text,
        };
        this.goGroup(param, a);
        this.$emit("handConfirmGroupDialog", false);
      }
    },
    handCancelDialog() {
      this.text = '';
      this.$emit('handCancelGroupDialog', false);
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
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
.add-group-wrap {
  /deep/ .el-dialog__header {
    padding: 20px 28px 0 !important;
  }
}

/deep/ .dialog-position {
  margin-top: 12vh !important;
  margin-left: 45vw !important;
}

.add-group-dialog-title {
  font-weight: 600;
  font-size: 18px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #d8d8d8;
}
.add-group-dialog-name {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 10px 0 5px;
}
.add-group-dialog-code {
  color: #999;
  font-size: 14px;
}
.add-group-dialog-des {
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
.add-group-dialog-bot {
  li {
    border-right: 1px solid #2f54eb;
    flex: 1;
    color: #333333;
    font-size: 14px;
    &:last-child {
      border-right: none;
    }
    .add-group-dialog-number {
      font-weight: 600;
      line-height: 25px;
      img {
        vertical-align: middle;
      }
    }
    .add-group-dialog-word {
      color: #999999;
      font-size: 12px;
      margin-top: 5px;
    }
  }
}
.add-group-dialog-apply {
  font-size: 14px;
  color: #333;
  line-height: 20px;
  margin-bottom: 10px;
}
.add-group-dialog-btns {
  margin-top: 20px;
  text-align: right;
  button {
    font-size: 13px;
    padding: 5px 29px;
    text-align: center;
    margin span {
      display: inline-block;
    }
  }
}
</style>
