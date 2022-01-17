<!-- pass -->
<template>
  <div class="email">
    <div class="main-login">
      <!-- <div class="flex" style="justify-content:center;">
        <img src="../../../assets/images/dun.png" alt="">
      </div>-->
      <div class="key-text">使用密钥解锁您的已加密历史消息</div>

      <div class="input-box">
        <p class="keydes">
          请粘贴密钥至此处:
          <span @click="downloadWind()">从云端导入</span>
        </p>
        <el-input type="textarea" :rows="2" placeholder="请输入密钥" v-model="myCode" class="secretKeyArea"></el-input>
      </div>
      <div class="tip">
        <p>密钥是您阅读消息的钥匙</p>
        <p>如果您没有导入密钥，将无法解密信息</p>
      </div>
      <div class="btn">
        <el-button style="width: 100%" type="primary" @click="restore">确认恢复</el-button>
      </div>
      <div class="bottom">
        如果您的密钥丢失，请您重新
        <span style="color: #2F54EB; cursor: pointer" @click="create">创建密钥</span>
      </div>
    </div>
    <ImportKey ref="ImportKey" @importback="importback" :creatFlag="creatFlag" :first="true"></ImportKey>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { WEB_LOGIN, WEB_CODE_LOGIN } from '@/store/types';
import { GET_PUB_KEY_AND_SAVE } from '@/store/types';
import { mapActions } from 'vuex';
// import { remote } from "electron";
// const ipc = require('electron').ipcRenderer;

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      myCode: '',
      secretKey: '',
      short_secretKey: '',
      creatFlag: false
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapActions([WEB_LOGIN, WEB_CODE_LOGIN]),
    importback(rsaPrivate) {
      this.secretKey = rsaPrivate;
      this.short_secretKey = rsaPrivate.slice(0, 50) + '...';
    },
    downloadWind() {
      this.$refs.ImportKey.opendialog();
    },
    async restore() {
      if (this.myCode == '') {
        this.$message.error('不能为空');
        return;
      }
      await this.$store.dispatch(GET_PUB_KEY_AND_SAVE, {
        privateKey: this.myCode
      });
      this.WEB_LOGIN(this.$store.state.common.loginInfo);
    },

    create() {
      this.$confirm('重新创建密钥后，将无法解密您的历史消息确定重新创建吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true,
        customClass: 'messageKey'
      })
        .then(() => {
          this.$router.push('/user/login/creatkey');
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          });
        });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    //效果会被覆盖，暂时没有解决方案
    // remote.getCurrentWindow().setSize(380, 500);//登陆页面初始化大小
    // remote.getCurrentWindow().center();//窗口居中
    // ipc.send('changeMax',false); // 没有登陆 禁止最大化
  },
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
<style>
.messageKey {
  width: 60%;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类

.email {
  position: absolute;
  top: 80px;
}
.main-login {
  width: 400px;
  height: 530px;
  padding: 20px 60px 60px 60px;
  margin-top: -20px;
  box-sizing: border-box;
  // background: rgba(255, 255, 255, 1);
  box-shadow: 0px 4px 8px 0px rgba(5, 36, 163, 0.1);
  border-radius: 4px;
  .keydes {
    margin-bottom: 10px;
    font-size: 14px;
    span {
      float: right;
      color: rgb(47, 84, 235);
      cursor: pointer;
    }
  }
  h3 {
    text-align: center;
    margin: 0 0 30px 0;
    font-size: 18px;

    font-weight: bold;
    color: rgba(51, 51, 51, 1);
  }
  .key-text {
    margin-top: 18px;
    height: 16px;
    font-size: 16px;

    font-weight: 500;
    color: rgba(51, 51, 51, 1);
    text-align: center;
  }
  .input-box {
    width: 300px;
    margin-top: 30px;
  }
  .tip {
    margin-top: 17px;
    width: 240px;
    height: 66px;
    font-size: 12px;

    font-weight: 400;
    color: rgba(51, 51, 51, 1);
    line-height: 33px;
  }
  .btn {
    margin-top: 38px;
  }
  .key-input {
    border: none;
    border-bottom: 1px solid rgba(151, 151, 151, 1);
    font-size: 16px;

    font-weight: 400;
    color: rgba(153, 153, 153, 1);
  }
  .bottom {
    margin-top: 18px;
    width: 300px;
    height: 14px;
    line-height: 24px;
    font-size: 14px;

    font-weight: 400;
    color: rgba(51, 51, 51, 1);
    text-align: center;
  }
}
</style>
