<template>
  <div class="user">
    <router-view style="-webkit-app-region: no-drag" />
    <checkUpdate v-if="checkUpdateShow" @updateCenterDialogVisible="updateCenterDialogVisibleValue" ref="centerDialogVisibleValue" />
  </div>
</template>

<script>
import checkUpdate from '@/layouts/user/components/checkUpdate';
import { check_for_update } from '@/utils/checkForUpdate';
const appVersionCode = require('../../../package.json').version_code;
import { mapState } from 'vuex';
export default {
  components: {
    checkUpdate
  },
  data() {
    return {
      centerDialogVisible: false,
      checkUpdateShow: false,
      updateInfo: {
        forceUpgrade: 0,
        upgradeDesc: '',
        versionCode: 0
      }
    };
  },
  mounted() {},
  beforeDestroy() {},
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      versionUpdateInfo: obj => {
        return obj.state.versionUpdateInfo
      }
    })
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    updateCenterDialogVisibleValue(val) {
      this.centerDialogVisible = val;
    },
    async checkForUpdate() {
      await check_for_update(appVersionCode, (updateInfo) => {
        if (updateInfo.data) {
          this.updateInfo = updateInfo.data;
          this.$set(this, 'checkUpdateShow', true)
          this.$nextTick(() => {
            this.$refs.centerDialogVisibleValue.init({
              ...this.updateInfo,
              centerDialogVisible: true
            });
          });
        }
      });
    },
    // getVersion() {
    //   ipcRenderer.on('app_version', (event, arg) => {
    //     ipcRenderer.removeAllListeners('app_version');
    //     this.currVersion = arg.version;
    //   });
    //   ipcRenderer.send('app_version');
    // }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.checkForUpdate();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less">
//@import url(); 引入公共css类
.user {
  // 退出更新
  .cancel-update-dialog {
    width: 346px;
    height: 202px;
    left: 4.5%;
    top: 12%;
    // left: 50%;
    // transform: translate(-50%);

    /deep/ .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      color: #151f34;
    }
    /deep/ .el-dialog__body {
      padding: 30px 20px;
    }
    .cancel-update-dialog-p {
      padding-left: 20px;
      font-size: 14px;
      color: #151f34;
      line-height: 20px;
    }
    /deep/ .el-button {
      //width: 120px;
      height: 35px;
    }
    /deep/ .el-button--default {
      box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
      border-radius: 4px;
      border: 1px solid #2f54eb;
      background: transparent;
      span {
        font-size: 14px;
        font-weight: 400;
        color: #2f54eb;
      }
    }
    /deep/ .el-button--primary {
      background: #2f54eb;
      box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
      border-radius: 4px;
      span {
        font-size: 14px;
        font-weight: 400;
        color: #fff;
      }
    }
    .exitUpdateT {
      margin: 20px auto 13px;
    }
    .downloadLink {
      text-align: center;
      font-size: 12px;
      color: #2f54eb;
      text-decoration: underline;
    }
  }
  // 版本更新
  .update-dialog {
    .el-dialog {
      background: url('../../assets/images/upload-pic.png') no-repeat 50% 20px #fff;
      background-size: 100%;
      width: 346px;
      border-radius: 10px;
      .el-dialog__body {
        box-sizing: border-box;
        text-align: center;
        padding-top: 100px;
        color: rgba(21, 31, 52, 1);
      }
      .el-icon-close {
        font-size: 26px;
      }
      .dialog-footer {
        /deep/ .el-button {
          width: 148px;
          height: 40px;
        }
        /deep/ .el-button--default {
          box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
          border-radius: 4px;
          border: 1px solid #2f54eb;
          background: transparent;
          span {
            font-size: 14px;
            font-weight: 400;
            color: #2f54eb;
          }
        }
        /deep/ .el-button--primary {
          background: #2f54eb;
          box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
          border-radius: 4px;
          span {
            font-size: 14px;
            font-weight: 400;
            color: #fff;
          }
        }
      }
      h1 {
        font-size: 16px;
        color: rgba(21, 31, 52, 1);
      }
    }
    .progress-wrapper {
      height: 60px;
      .progress-text {
        padding-top: 10px;
        text-align: left;
        font-size: 13px;
      }
    }
    .el-input {
      .el-textarea__inner {
        background: none;
        min-height: 40px;
        padding-top: -30px;
      }
    }
  }
  .el-input {
    .el-textarea__inner {
      background: none;
      min-height: 40px;
      padding-top: -30px;
    }
  }
}
</style>
