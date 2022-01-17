<!--  -->
<template>
  <el-header class="flex align-center justify-between" style="-webkit-app-region: drag">
    <div class="flex align-center">
      <img v-if="$route.name == 'register'" width="34" height="26" style="padding: 0 6px 0 0" src="../../../assets/images/di2.png" alt />
      <div v-if="$route.name == 'register'" class="words">
        <div>数字经济新生活</div>
        <div>全球化服务</div>
      </div>
    </div>
    <span style="color: #999999;position:absolute;left: 145px;">DiDimessage</span>
    <div class="flex align-center justify-end" style="-webkit-app-region: no-drag">
      <LangChange v-if="!isInSyncDataPage" style="-webkit-app-region: no-drag; cursor: pointer; margin-right: 10px" />
      <span class="header-login flex align-center" style="-webkit-app-region: no-drag">
        <!-- <router-link to="/user/login/pass">
          <span class="header-blue">{{$t('login.login')}}</span>
        </router-link>
        <span class="header-line"></span>
        <router-link to="/user/ordinaryRegister">
          <span class="header-blue">{{$t('login.register')}}</span>
        </router-link>-->
      </span>
      <!-- <LangChange />
      <span class="app">
        <el-popover placement="bottom" width="135" trigger="click">
          <img
            width="135"
            src="http://didiimg.oss-ap-southeast-1.aliyuncs.com/pc/user/u75%402x.png"
            alt
          />
          <span slot="reference">APP</span>
        </el-popover>
      </span>
      <span class="app" v-on:click="close">CLOSE</span>
      <span class="app" v-on:click="captureScreen">截屏</span> -->

      <i class="el-icon-close"
        v-if="(platform != 'darwin' && !isInSyncDataPage)||(isInSyncDataPage&&isShowCloseSyncData)"
        v-on:click="close"></i>
    </div>
  </el-header>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
// import { langMap } from "@/map";
import LangChange from '@/components/LangChange';
import { mapGetters, mapActions } from 'vuex';
import { LOGIN_FINISHED } from '@/store/types';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    LangChange
  },
  data() {
    //这里存放数据
    return {
      platform: process.platform
      // langMap
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapGetters(['isInSyncDataPage', 'isShowCloseSyncData']),
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapActions([LOGIN_FINISHED]),
    close() {
      if(this.isInSyncDataPage){
        // 关闭同步数据页面
        console.log('同步数据页面')
        this.LOGIN_FINISHED();
      } else {
        this.ipcRenderer.send('quit-win');
      }

    },
    captureScreen() {
      this.ipcRenderer.send('capture-screen');
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    if (process.env.IS_ELECTRON) {
      const { ipcRenderer } = require('electron');
      this.ipcRenderer = ipcRenderer;
    }
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
/deep/.el-dropdown-link {
  border: none;
  outline: none;
}
.register .el-header {
  height: 50px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 0px 2px 0px rgba(34, 84, 49, 0.35);
}
.el-header {
  font-size: 14px;
  .el-icon-close {
    cursor: pointer;
  }
  .header-blue {
    font-size: 14px;

    font-weight: 400;
    color: rgba(47, 84, 235, 1);
    cursor: pointer;
  }
  .header-line {
    width: 1px;
    height: 10px;
    background: rgba(47, 84, 235, 1);
    border-radius: 10px;
    display: block;
    margin: rgb(4, 6, 12);
  }
  .app {
    cursor: pointer;
    margin-right: 20px;
    color: #333;
  }
  .words {
    font-size: 11px;

    font-weight: 500;
    color: rgba(47, 84, 235, 1);
    opacity: 0.5;
  }
}
</style>
