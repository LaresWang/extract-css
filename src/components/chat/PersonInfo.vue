<!-- 个人信息 -->
<template>
  <div class>
    <el-dialog @close="handCloseDialog" :append-to-body="true" width="400px" :visible="dialogPersonInfoVisible">
      <div class="person-info-wrap text-center">
        <el-row>
          <el-col :span="24">
            <img :src="userInfo.userHeadImg" width="50px" height="50px" style="border-radius: 50%" alt />
            <div class="add-friend-dialog-name">
              {{ userInfo.userNickName | substringName }}
            </div>
            <div class="add-friend-dialog-code">个人ID：{{ userInfo.inviteCode }}</div>
            <div class="add-friend-dialog-des">个性签名：{{ userInfo.personalSign }}</div>
            <ul class="flex text-center add-friend-dialog-bot">
              <li>
                <div class="add-friend-dialog-word">LV{{ userInfo.level }}</div>
                <div class="add-friend-dialog-number">
                  <div>
                    <img src="../../assets/images/pinfo_grade.png" width="20px" alt />
                  </div>
                </div>
              </li>
              <li>
                <div class="add-friend-dialog-number">
                  {{ userInfo.computingPower }}
                </div>
                <div class="add-friend-dialog-number">
                  <div>
                    <img src="../../assets/images/pinfo_number.png" width="20px" alt />
                  </div>
                </div>
              </li>
              <li>
                <div class="add-friend-dialog-number">{{ userInfo.invitationCount }}篇</div>
                <div class="add-friend-dialog-number">
                  <div>
                    <img src="../../assets/images/pinfo_view.png" width="20px" alt />
                  </div>
                </div>
              </li>
            </ul>
            <div class="add-friend-dialog-btns">
              <slot v-if="userInfo.isFriend">
                <el-button @click="handSendMes(userInfo)" style="background-color:#2F54EB;width: 48%" type="info">开始聊天</el-button>
                <el-button @click="handDel(userInfo)" style="background-color:#F5222D;width: 48%" type="warning">删除好友</el-button>
              </slot>
              <slot v-else>
                <el-button @click="handaddFriend(userInfo.id)" style="background-color:#2F54EB;width:96%" type="info">加为好友</el-button>
              </slot>
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
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    dialogPersonInfoVisible: {
      type: Boolean,
      default() {
        return false;
      }
    },
    userInfo: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    //这里存放数据
    return {};
  },
  filters: {
    substringName(val) {
      return val && val.length > 10 ? val.substring(0, 10) + '...' : val;
    }
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    handCloseDialog() {
      // 关闭弹框
      this.$emit('handCloseDialog', false);
    },
    handDel(userInfo) {
      // 删除事件
      this.$emit('handDel', userInfo, false);
    },
    handSendMes(userInfo) {
      // 发送消息
      this.$emit('handSendMes', userInfo, false);
    },
    handaddFriend(userInfo) {
      this.$emit('handaddFriend', userInfo, false);
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
.person-info-wrap {
  cursor: auto;
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
    line-height: 1.7;
    // text-align: left;
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
        height: 25px;
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
  .add-friend-dialog-apply {
    font-size: 14px;
    color: #333;
    line-height: 20px;
    margin-bottom: 10px;
  }
  .add-friend-dialog-btns {
    margin-top: 20px;
  }
}
</style>
