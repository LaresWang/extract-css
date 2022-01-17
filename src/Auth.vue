<!--  -->
<template>
  <div class="common-height">
    <Layout v-if="/^\/app/.test($route.path)" />
    <LayoutUser v-if="/^\/user/.test($route.path)" />
    <checkUpdate v-if="checkUpdateShow&&$route.name!='tray'"
                 @updateCenterDialogVisible="updateCenterDialogVisibleValue"
                 ref="centerDialogVisibleValue" />
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapState } from 'vuex';
import Layout from '@/layouts';
import LayoutUser from '@/layouts/user';
import Ws from '@/utils/ws';
import checkUpdate from '@/layouts/user/components/checkUpdate';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Layout,
    LayoutUser,
    checkUpdate
  },
  data() {
    //这里存放数据
    return {
      checkUpdateShow: false,
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      loginInfo: obj => {
        return obj.state.loginInfo;
      },
      versionUpdateInfo: obj => {
        return obj.state.versionUpdateInfo
      }
    }),
    isMacOS(){
      return process.platform==='darwin'
    }
  },
  //监控data中的数据变化
  watch: {
    versionUpdateInfo:{
      immediate: true,
      deep: true,
      handler: function (v) {
        if (v.versionSign && v.versionSign < 1) {
          // 有更新且为强制更新，需要弹出提示框
          this.updateInfo = v.updateInfo.data;
          this.$set(this, 'checkUpdateShow', true);
          this.$forceUpdate();
          this.$nextTick(() => {
            this.$refs.centerDialogVisibleValue.init({
              ...v.updateInfo,
              centerDialogVisible: true
            });
          });
        } else {
          this.checkUpdateShow = false;
        }
      }
    }
  },
  //方法集合
  methods: {
    updateCenterDialogVisibleValue(val) {
      this.checkUpdateShow = val;
    },
    getNetStatus() {
      let that=this;
      console.log('navigator.onLine', navigator.onLine);
      window.addEventListener('online',that._online);
      window.addEventListener('offline',that._offline);
    },
    _online(){
      this.clearoffLineTimer();
      this.$store.dispatch("NET_STATUS",{ netStatus: 'online' })
      // if (Ws.socket.readyState != 1) {
      Ws.reConnect();
      // }
      console.log('在线');
      console.log('audio-window-online');
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('audio-window-online');
    },
    _offline(){
      let that=this;
      that.$store.dispatch("NET_STATUS",{ netStatus: 'offline' })
      console.log('离线');
      console.log('audio-window-offline');
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('audio-window-offline');
      that.offLineTimer = setTimeout(() => {
        if (!navigator.onLine && that.$store.state.common.isAudioWindowDisplay) {
          console.log('audio-window-socket-close');
          ipcRenderer.send('audio-window-socket-close');
        }
        that.clearoffLineTimer();
      }, 30000);
      Ws.close(true);
    },
    clearoffLineTimer(){
      if(this.offLineTimer){
        clearTimeout(this.offLineTimer);
        this.offLineTimer=null;
      }
    },
    handleKeydown(ev) {
      // console.log(ev.metaKey, ":", ev.keyCode);
      let contents = this.$remote.getCurrentWebContents();
      if (ev.metaKey && ev.keyCode == 67) {
        contents.copy();
      }
      if (ev.metaKey && ev.keyCode == 86) {
        contents.paste();
      }
      if (ev.metaKey && ev.keyCode == 88) {
        contents.cut();
      }
      if (ev.metaKey && ev.keyCode == 65) {
        contents.selectAll();
      }
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.getNetStatus();
    this.isMacOS&&document.addEventListener('keydown', this.handleKeydown);
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    this.isMacOS&&document.removeEventListener('keydown', this.handleKeydown);
    this.clearoffLineTimer();
    window.removeEventListener('online',this._online);
    window.removeEventListener('offline',this._offline);
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
</style>
