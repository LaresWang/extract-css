<!-- pass -->
<template>
  <div class="email">
    <div class="main-login">
      <div class="flex outbox" style="justify-content: center">
        <img src="../../../assets/images/dun.png" alt />
        <div class="key-text">
          <p>我们已为您创建密钥</p>
          <p>您的消息只有您自己可以看见</p>
        </div>
      </div>
      <div class="key-box">
        <p>密钥</p>
        <p class="overtip" id="copyMy">{{ this.privateKey }}</p>
        <p style="color: #2F54EB" @click="copyFn()">复制密钥</p>
      </div>
      <div class="btn">
        <el-button style="width: 100%" type="primary" @click="restore">确定</el-button>
      </div>
      <div class="bottom">
        如果密钥丢失，您将无法恢复您的聊天记录 请您妥善保管您的密钥
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { getRsaKeys } from '@/utils/rsa';
import { send_my_rsa } from '@/server';
import { mapActions } from 'vuex';
import { SET_LOGIN_FINISHED, SET_USER_PRIVATE_KEY } from '@/store/types';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      publicKey: '',
      privateKey: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapActions([SET_LOGIN_FINISHED]),
    getKey() {
      let that = this;
      function getRsa(a, b) {
        that.privateKey = a;
        that.publicKey = b;
        that.sendCode(a, b);
      }
      getRsaKeys(getRsa);
    },
    async sendCode(priKey, pubKey) {
      let res = await send_my_rsa({
        rsaPub: pubKey
      });
      if (res.code == 200) {
        let item = {
          rsa_pub: res.data.rsaPub,
          rsa_pub_version: res.data.rsaPubVersion,
          rsa_pri: priKey
        };
        this.$store.dispatch(SET_USER_PRIVATE_KEY, item);
      }
    },
    // 复制
    copyFn() {
      const { clipboard } = require('electron');
      clipboard.writeText(this.privateKey);
      this.$message.success('复制成功');
    },
    restore() {
      this.SET_LOGIN_FINISHED('true');
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getKey();
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
<style lang="less" scoped>
//@import url(); 引入公共css类
.main-login {
  width: 400px;
  // height: 530px;
  padding: 0 60px;
  box-sizing: border-box;
  // background: rgba(255, 255, 255, 1);
  // box-shadow: 0px 4px 8px 0px rgba(5, 36, 163, 0.1);
  border-radius: 4px;
  .key-box {
    margin: 20px 0;
    p {
      font-size: 16px;

      font-weight: 400;
      color: rgba(51, 51, 51, 1);
      line-height: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .overtip {
      text-align: left;
      width: 290px;
      height: 61px;
      font-size: 14px;

      font-weight: 400;
      color: rgba(51, 51, 51, 1);
      line-height: 20px;
      word-break: break-all;
      word-wrap: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }
  .key-text {
    margin-top: 10px;
    margin-left: 12px;
    line-height: 24px;
    flex: 1;
    height: 44px;
    font-size: 15px;

    font-weight: 500;
    color: rgba(51, 51, 51, 1);
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
    width: 265px;
    height: 38px;
    font-size: 14px;
    font-weight: 400;
    color: rgba(233, 129, 18, 1);
  }
}
</style>
