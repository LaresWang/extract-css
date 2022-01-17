<template>
  <div>
    <el-dialog
      class="update-dialog"
      :visible.sync="centerDialogVisible"
      width="346px"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      center
    >
      <i
        class="el-icon-close"
        v-if="isUpdate"
        size="mini"
        @click="closeUpdateApp"
        style="font-size: 14px; position: absolute; right: 10px; top: 010px"
      ></i>

      <div v-if="isUpdate">
        <h1>{{ $t('personal_0012') }}</h1>
        <span class="version-tip">{{ $t('personal_0062', {version}) }}，{{ tips }} </span>
      </div>

      <div class="version-title" v-if="!isUpdate">{{ $t('personal_0062', {version}) }}</div>
<!--      <el-input
        v-if="!downloadDialogVisible"
        class="el-input"
        type="textarea"
        rows="4"
        :readonly="true"
        resize="none"
        v-model="upgradeDesc"
        placeholder=""
      >
        upgradeDesc</el-input
      >-->
      <el-input
        class="el-input"
        type="textarea"
        rows="4"
        :readonly="true"
        resize="none"
        v-model="upgradeDesc"
        placeholder=""
      >
        upgradeDesc</el-input
      >
      <!-- <br /> -->
      <div class="update-tips" v-if="!isUpdate">{{ $t('personal_0063') }}</div>
      <span slot="footer" class="dialog-footer" v-if="!downloadDialogVisible">
        <el-button size="small" @click="onCancelUpdateApp" class="cancel-btn">{{
          cancelBtn
        }}</el-button>
        <el-button
          size="small"
          type="primary"
          @click="updateApp"
          class="update-btn"
          >{{ $t('personal_0021') }}</el-button
        >
      </span>
      <div slot="footer" v-else class="progress-wrapper">
        <el-progress
          :percentage="downloadPercent"
          :show-text="false"
        ></el-progress>
        <div class="progress-text">
          <span>{{ $t('personal_0026') }} {{ downloadPercent }}%</span>
          <a href="javascript:void(0)" @click="reDownload">{{ $t('personal_0071') }}</a>
        </div>
        <div class="fault-text">{{ $t('personal_0068') }}
          <a href="javascript:void(0)" @click="downloadAPP">{{ $t('personal_0069') }}</a>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :title="$t('personal_0076')"
      class="cancel-update-dialog"
      width="320px"
      append-to-body
      :modal="true"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="cancelUpdateDialog"
      :show-close="false"
      center
    >
      <p class="cancel-update-dialog-p">
        {{ $t('personal_0067') }}
      </p>
      <p class="cancel-update-dialog-p">{{ cancelUpdateTitle }}</p>
      <div class="dialog-footer exitUpdateT">
        <el-button size="mini" @click="cancelUpdateApp" class="cancel-btn">{{
          cancelBtn
        }}</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="reUpdateApp"
          class="update-btn"
          >{{ $t('personal_0065') }}</el-button
        >
      </div>
      <p class="downloadLink">
        <span @click="downloadAPP">{{ $t('personal_0064') }}</span>
      </p>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer, shell } from "electron";
const appVersion = require("../../../../package.json").version;
const appVersionCode = require("../../../../package.json").version_code;
import { writeFile, deleteFile } from "@/utils/checkForUpdate";
import { LOGIN_OUT } from '@/store/types';
import {mapMutations} from "vuex";
import bus from '@/utils/eventbus';

export default {
  name: "check-update",
  components: {},
  data() {
    return {
      isUpdate: false,
      isLogin: false,
      centerDialogVisible: false,
      currVersion: "",
      version: "",
      downloadPercent: 0,
      downloadDialogVisible: false,
      tips: this.$t('personal_0077'),
      title: "",
      upgradeDesc: "",
      cancelUpdateDialog: false,
      forceUpgrade: 0,
      cancelBtn: "",
      cancelUpdateTitle: ""
    };
  },
  mounted() {
    this.getVersion();
  },
  beforeDestroy() {
    // 移除事件监听
    ipcRenderer.removeAllListeners("updateMessage");
    this.ipcRenderer.removeListener("downloadProgress",this.updateProgress);
    this.ipcRenderer.removeListener("downloadError",this.downloadErrTip);
    ipcRenderer.removeAllListeners("isUpdateNow");
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  filters: {
    textBr(val) {
      console.log('ssss',val);
      return val.replace(/↵/g,"\n");
    },
  },
  //方法集合
  methods: {
    ...mapMutations([LOGIN_OUT]),
    init(val) {
      console.log(val);
      this.centerDialogVisible = val.centerDialogVisible;
      this.forceUpgrade = val.forceUpgrade;
      this.upgradeDesc = val.upgradeDesc;
      this.version = val.versionCode;
      this.cancelBtn = this.forceUpgrade == 0 ? this.$t('personal_0020') : this.$t('personal_0022');
      this.cancelUpdateTitle =
        this.forceUpgrade == 0
          ? this.$t('personal_0072')
          : this.$t('personal_0073');
    },
    downloadAPP() {
      // window.open(`http://172.16.10.18:8081/didi-pc?suffix=${process.platform == 'darwin' ? 'dmg':'exe'}`)
      shell.openExternal(`https://www.didimessage.com/`);
    },
    // 暂不更新/退出应用
    async cancelUpdateApp() {
      console.log(this.forceUpgrade, this.cancelBtn, this.cancelUpdateDialog);
      ipcRenderer.send("cancelledUpdate");
      if (!this.forceUpgrade) {
        // console.log("关闭退出更新页面到登录页面");
        this.cancelUpdateDialog = false;
        this.centerDialogVisible = false;
        await writeFile(this.version);
        this.$emit("updateCenterDialogVisible");
        bus.$emit('closeDownload', true);
      } else if (this.forceUpgrade) {
        ipcRenderer.send("quit-win");
      }
    },
    closeUpdateApp() {
      this.cancelUpdateDialog = true;
    },
    // 暂不更新/退出应用
    async onCancelUpdateApp() {
      ipcRenderer.send("cancelledUpdate");
      if (this.forceUpgrade) {
        ipcRenderer.send("quit-win");
      }
      this.centerDialogVisible = false;
      await writeFile(this.version);
      this.$emit("updateCenterDialogVisible", false);
      bus.$emit('closeDownload', true);
    },
    async reUpdateApp() {
      await deleteFile();
      this.cancelUpdateDialog = false;
    },
    async updateApp() {
      console.log('route0- ',this.$route.name)
      if (this.forceUpgrade == 0 || this.$route.name === 'login-qrcode') {
        this.isUpdate = true;
        await deleteFile();
        if (this.cancelUpdateDialog) {
          this.centerDialogVisible = true;
          this.cancelUpdateDialog = false;
        }
        this.downloadDialogVisible = true;
        this.tips = this.$t('personal_0074');
        this.downloadUpdate();
      } else {
        // 强制更新，直接退出登录
        this.LOGIN_OUT();
      }
    },
    downloadUpdate() {
      ipcRenderer.send("downloadUpdate");
    },
    getVersion() {
      //获取当前版本
      ipcRenderer.on("app_version", (event, arg) => {
        ipcRenderer.removeAllListeners("app_version");
        this.currVersion = arg.version;
      });
      ipcRenderer.send("app_version");
    },
    ondialogclose() {
      if (this.forceUpgrade && !this.cancelUpdateDialog) {
        this.cancelUpdateDialog = true;
      } else if (!this.forceUpgrade && this.cancelUpdateDialog) {
        this.cancelUpdateDialog = false;
      } else if (!this.forceUpgrade && !this.cancelUpdateDialog) {
        console.log("点 × 呼出退出更新页面");
        this.cancelUpdateDialog = true;
      }
    },
    // 取消更新
    reDownload() {
      ipcRenderer.send("cancelUpdate");
      if(this.downloadPercent<100){
        this.downloadPercent = 0;
      }
      // this.downloadUpdate();
    },
    updateProgress(event, progressObj){
      console.log('checkcomp----', progressObj.percent)
      let value = Math.trunc(progressObj.percent);
      if(this.downloadPercent==100){
        this.downloadPercent = value;
      } else {
        this.downloadPercent = this.downloadPercent > value ? this.downloadPercent : value;
      }      
    },
    downloadErrTip() {
      ipcRenderer.send("cancelledUpdate");
      // this.$emit("updateCenterDialogVisible", false);
      bus.$emit('closeDownload', true);
      let _this = this;
      this.$confirm(this.$t('personal_0080'), this.$t('Universal_0059'), {
        confirmButtonText: this.$t('personal_0081'),
        cancelButtonText: this.forceUpgrade ? this.$t('personal_0022') : this.$t('Universal_0063'),
        center: true,
        showClose: true,
        distinguishCancelAndClose: true,
        customClass: 'download-err-dialog',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        beforeClose:function (action,instance,done) {
          
          if (action == 'confirm') {
            _this.downloadAPP();
            return false;
          } else if (action == 'cancel') {
            if (_this.forceUpgrade) {
              _this.cancelUpdateApp();
            }
            done();
          } else if (action == 'close') {
            done();
          }
        },
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    console.log(appVersion, appVersionCode, this.forceUpgrade);
    this.ipcRenderer = ipcRenderer;
    this.ipcRenderer.on("downloadProgress", this.updateProgress);
    this.ipcRenderer.on('downloadError', this.downloadErrTip)
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less">
// 退出更新
.cancel-update-dialog {
  //width: 346px;
  height: 202px;
  //left: 4.5%;
  top: 12%;
  // left: 50%;
  // transform: translate(-50%);
  .el-dialog {
    border-radius: 5px;
  }
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
    text-align: center;
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
  h1 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 15px;
  }
  .version-tip {
    font-size: 16px;
  }
  .el-dialog {
    background: url("../../../assets/images/upload-pic.png") no-repeat 50% 20px
      #fff;
    background-size: 100%;
    width: 346px;
    border-radius: 5px;
    .el-dialog__body {
      box-sizing: border-box;
      height: 280px;
      text-align: center;
      padding-top: 100px;
      color: rgba(21, 31, 52, 1);
    }
    .el-icon-close {
      font-size: 26px;
    }
    .dialog-footer {
      .el-button {
        // width: 120px;
        // height: 36px;
        width: 148px;height: 40px;
      }
      .cancel-btn {
        box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
        border-radius: 4px;
        border: 1px solid rgba(47, 84, 235, 1);
        color: rgba(47, 84, 235, 1);
      }
      .update-btn {
        background: rgba(47, 84, 235, 1);
        box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
      }
    }
    .version-title {
      font-size: 16px;
      color: rgba(21, 31, 52, 1);
      padding-bottom: 15px;
      font-weight: 550 !important;
    }
  }
  .progress-wrapper {
    height: 60px;
    .progress-text {
      display: flex;
      justify-content: space-between;
      padding-top: 10px;
      font-size: 13px;
      a:link {
        color: -webkit-link;
      }
    }
    .fault-text {
      margin-top: 10px;
      text-align: center;
    }
  }
  .el-input {

    .el-textarea__inner {
      overflow: auto !important;
      background: none;
      // min-height: 40px;
      padding-top: -30px;
      padding-left: 0;
      padding-right: 0;
      // padding-left: 40px;
      line-height: 1.8;
      border: none;
      height: auto;
    }
    .el-textarea__inner {
      overflow-y: scroll !important;
      overflow-x: hidden !important;

      // 整体部分
      &::-webkit-scrollbar {
        display: block !important;
        width: 4px;
        background-color: rgba(0, 0, 0, 0);
      }

      // 滑动轨道
      &::-webkit-scrollbar-track {
        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0);
      }

      // 滑块
      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: #b8b8b8;
      }
    }
  }
  .update-tips{
    font-size: 12px;
    color: #999;
    margin-top: 8px;
    word-break: break-word;
  }
}
.download-err-dialog {
  /deep/ .el-button--primary {
    width: 120px !important;
  }
}
</style>
