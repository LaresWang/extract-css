<!-- 个人设置 -->
<template>
  <div class="setting-wrap">
    <div class="pic">
      <div class="pic-logo-wrap">
        <img class="pic-logo" src="../../../assets/images/logo_512.png" alt />
        <img class="pic-new" src="../../../assets/images/new.png" alt="" v-if="centerDialogVisible">
      </div>

      <div class="ver-info">{{ $t('personal_0024') }}{{ currVersion }}</div>
      <div class="xy" @click="PrivacyAgreement()">{{ $t('login_register_0018') }}</div>
      <div v-show="centerDialogVisible == false" class="is-latest-version">
        {{ $t('personal_0030') }}
      </div>
      <el-button class="submit-btn" :disabled="centerDialogVisible == false" v-if="!downloadDialogVisible" @click="updateApp"
        >{{ $t('personal_0025') }}</el-button>
      <!-- <div slot="footer" v-else class="progress-wrapper">
        <el-progress :percentage="downloadPercent" :show-text="false"></el-progress>
        <div class="progress-text">{{ $t('personal_0026') }}{{ downloadPercent }}%</div>
      </div> -->
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import {mapState} from "vuex";
import { remote } from 'electron';
const appVersionCode = require('../../../../package.json').version_code;
import store from '@/store';
import { NOTIFY_UPDATE_VERSION } from '@/store/types';
import {check_update_by_server} from "@/server";
import bus from '@/utils/eventbus';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      currVersion: '',
      version: '',
      downloadPercent: 0,
      centerDialogVisible: false,
      downloadDialogVisible: false,
      latestVersion: ''
    };
  },
  props: {
    obj: {
      type: Object,
      default: () => {
        return {}
      }
    },
    /*latestVersion: {
      type: String,
      default: ''
    }*/
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      versionUpdateInfo: obj => {
        return obj.state.versionUpdateInfo
      }
    })
  },
  //监控data中的数据变化
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler: function (v) {
        if (v.updateInfo && v.obj) {
          this.updateInfo = v.updateInfo.data;
          this.version = v.obj.info.version;
          this.centerDialogVisible = true;
          this.latestVersion = v.updateInfo.versionCode;
        } else {
          this.centerDialogVisible = false;
        }
      }
    },
    versionUpdateInfo: {
      immediate: true,
      deep: true,
      handler: async function (v) {
        if (!v.versionSign) {
          this.$set(this, 'centerDialogVisible', false);
        } else {
          this.updateInfo = v.updateInfo;
          this.$set(this, 'centerDialogVisible', true);
        }
      }
    }
  },
  //方法集合
  methods: {
    PrivacyAgreement() {
      console.log(remote.BrowserWindow, 'BrowserWindow');
      let win = new remote.BrowserWindow({
        icon: `${__static}/logo.png` // eslint-disable-line
      });
      // en-us zh-cn
      win.loadURL(`https://m.didimessage.com/#/staticpage/userpact?colorMode=day&language=${this.$i18n.locale}`);
    },
    async checkForUpdate() {
      const updateInfo = await check_update_by_server({
        currentVersion: appVersionCode
      });
      if (updateInfo.data) {
        this.updateInfo = updateInfo.data;
        this.centerDialogVisible = true;
      } else {
        this.centerDialogVisible = false;
        await store.dispatch(NOTIFY_UPDATE_VERSION, false);
      }
    },
    getVersion() {
      //获取当前版本
      this.ipcRenderer.on('app_version', (event, arg) => {
        this.ipcRenderer.removeAllListeners('app_version');
        this.currVersion = arg.version;
      });
      this.ipcRenderer.send('app_version');
    },
    async updateApp() {
      // this.downloadUpdate();
      const updateInfo = await check_update_by_server({
        currentVersion: appVersionCode
      });
      if (updateInfo.data) {
        await store.dispatch(NOTIFY_UPDATE_VERSION, {versionSign: Math.random(), updateInfo: updateInfo.data});
      }
    },
    downloadUpdate() {
      //统一处理下载，如果已经开始下载，则不重新下载，只更新UI
      if (this.downloadPercent == 0) {
        this.ipcRenderer.send('downloadUpdate');
      }
      this.tips = this.$t('personal_0074');
      this.downloadDialogVisible = true;
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    if (process.env.IS_ELECTRON) {
      const { ipcRenderer } = require('electron');
      this.ipcRenderer = ipcRenderer;
    }
    //打开就开始监听进度，因为X掉之后，没有销毁事件
    // 注意："downloadProgress”事件可能存在无法触发的问题，只需要限制一下下载网速就好了
    this.ipcRenderer.on('downloadProgress', (event, progressObj) => {
      this.downloadPercent = Math.trunc(progressObj.percent) || 0;
      console.log('this.downloadPercent-- ',this.downloadPercent)
      if (this.downloadDialogVisible == false && this.downloadPercent != 0) {
        //已经下载中的，直接显示
        this.tips = this.$t('personal_0074');
        this.downloadDialogVisible = true;
      }
    });
    let _this = this;
    bus.$on('closeDownload', function () {
      _this.downloadDialogVisible = false;
    });
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.checkForUpdate();
    this.getVersion();
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    this.ipcRenderer.removeAllListeners('updateMessage');
    this.ipcRenderer.removeAllListeners('downloadProgress');
    this.ipcRenderer.removeAllListeners('isUpdateNow');
    console.log('this.ipcRenderer.removeAllListeners(downloadProgress)');
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类

.clearfix::after {
  content: '';
  display: inline-block;
  overflow: hidden;
  clear: both;
}
.pic {
  margin-top: 25px;
  .pic-logo-wrap {
    position: relative;
    width: 48px;
    height: 48px;
    margin: 0 auto 10px;
    border-radius: 5px;
    box-shadow: 0 0 9px 2px #ccc;;
    .pic-logo {
      width: 48px;
      height: 48px;
    }
    .pic-new {
      position: absolute;
      right: -37px;
      top: -8px;
      height: 18px;
      width: 36px;
    }
  }

  .ver-info {
    color: #666666;
  }
  .xy {
    margin: 15px 0;
    color: #2f54eb;
    cursor: pointer;
  }
  .is-latest-version {
    font-size: 13px;
    color: #151f34;
    margin: 30px 0 10px 0;
  }
}
.submit-btn {
  height: 40px;
  background: #2f54eb;
  box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  border: none;
  user-select: none;
  width: 190px;
  outline: none;
  cursor: pointer;
}
.submit-btn.is-disabled {
  height: 40px;
  box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
  background: #ebeef5;
  border-radius: 4px;
  color: #c0c4cc;
  font-size: 14px;
  user-select: none;
  width: 190px;
  outline: none;
}
.setting-wrap {
  padding: 30px;
  //height: 100%;
  text-align: center;
  background-color: #fff;
  .setting-title {
    font-size: 14px;
    color: #151f34;
    line-height: 20px;
  }
  .setting-tab-wrap {
    padding: 20px 0 50px;
    margin: 0;
  }
  .setting-tab-wrap li {
    float: left;
    font-size: 14px;
    color: #151f34;
    list-style: none;
    line-height: 20px;
    margin-right: 35px;
    user-select: none;
  }
  .setting-tab-wrap li:last-child {
    margin-right: 0;
  }
  .setting-tab-wrap li.router-link-active {
    color: #2f54eb;
    position: relative;
  }
  .setting-tab-wrap li.router-link-active::after {
    content: '';
    display: inline-block;
    position: absolute;
    bottom: -5px;
    width: 10px;
    height: 2px;
    background-color: #2f54eb;
    left: 50%;
    margin-left: -5px;
  }
  .setting-content-wrap {
    .setting-content-wrap-item-con {
      display: none;
    }
    .show {
      display: block;
    }
  }
}
</style>
