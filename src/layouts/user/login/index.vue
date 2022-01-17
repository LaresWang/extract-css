<!-- layout_user -->
<template>
  <div class="layout layout_user">
    <el-container>
      <Header />
      <el-main>
        <div class="flex flex-direction align-center justify-center">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Header from '../components/header';
const ipc = require('electron').ipcRenderer;
import { mapActions } from 'vuex';
import { LOGIN_FINISHED } from '@/store/types';
import Ws, { handleRecievedQueueMsgs } from '@/utils/ws';
import { startSync } from '@/services/syncInfos'

export default {
  //import引入的组件需要注入到对象中才能使用
  name:"Login",
  components: {
    Header
  },
  data() {
    //这里存放数据
    return {
      langMap: {
        'en-us': 'English',
        'zh-cn': '简体中文'
      }
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapActions([LOGIN_FINISHED]),
    _syncData(event, infos){
      console.log('syncData====', infos);
      if(infos.isFirstLogin){
        this.$router.push('/user/login/syncdata');
      } else {
        // 每次登录都同步下，后端离线数据有些推有些不推，有时推有时不推
        console.log('离线数据')
        Ws.init(this.startSync);
      }
      // else if (infos.longtermOffline){
      //   // 这里处理离线120小时的处理
      //   console.log('离线同步')
      //   Ws.init(this.startSync);
      // }
      // 第一次登录跳转展示同步数据页面
      
    },
    handleCommand(command) {
      this.$i18n.locale = command;
      localStorage.lang = command;
      this.$message({
        type: 'success',
        message: '切换语言成功：' + this.langMap[command]
      });
    },
    syncFinished(){
      handleRecievedQueueMsgs();
      console.log('ok');
    },
    startSync(){
      startSync(this.syncFinished, null, true);
      // setTimeout(()=>this.LOGIN_FINISHED(), 500);
      this.LOGIN_FINISHED()
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    localStorage.setItem('loginInfo',null)
    window.vm.$remote.getCurrentWindow().setSize(380, 500); //登陆页面初始化大小
    window.vm.$remote.getCurrentWindow().center(); //窗口居中
    ipc.send('changeMax', false); // 没有登陆 禁止最大化
    console.log(123123123,this) 
    
    ipc.on('syncData', this._syncData)
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    ipc.removeListener('syncData', this._syncData);
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类

.el-main {
  // background-color: #e9eef3;
  color: #000;
  // text-align: center;
  font-size: 15px;
  .main-left {
    width: 60%;
    img {
      margin-bottom: 20px;
      width: 100%;
    }
    span {
      font-size: 18px;

      font-weight: 500;
      line-height: 28px;
      color: rgba(47, 84, 235, 1);
    }
    :nth-child(3) {
      margin-bottom: 150px;
    }
  }
  .main-right {
    width: 40%;
  }
}

body .el-container {
  background: url(../../../assets/images/login_bg.png) no-repeat;
  flex-direction: column;
  background-size: 100% auto;
  width: 100%;
  height: 100vh;
}
</style>
