<!--谷歌验证 -->
<template>
  <div class="google-verificaty-wrap">
    <el-form :model="ruleGoogleForm" :rules="rules" ref="ruleGoogleForm" :label-width="labelWidth" class="demo-ruleGoogleForm">
      <el-form-item label="账户名">
        <div class="account-name">{{ googleData.userName }}</div>
        <div class="account-code">
          <div id="qrcode"></div>
          <div class="copy-btn">
            <p>请妥善备份密钥以防遗失</p>
            <div>
              {{ googleData.secretKey }}
              <span v-clipboard:copy="googleData.secretKey" v-clipboard:success="onCopy">复制</span>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="谷歌验证码" prop="googleValidCode">
        <el-input
          autofocus
          minlength="6"
          maxlength="6"
          clearable
          v-model="ruleGoogleForm.googleValidCode"
          onkeyup="value=value.replace(/[^\d]/g,'')"
          placeholder="请输入谷歌验证码"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="submit-btn" :loading="saveBtn" @click.prevent="submitForm('ruleGoogleForm')">
          完成验证
        </el-button>
      </el-form-item>
      <!-- </div> -->
    </el-form>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { get_google_refresh, google_bind } from '../server';
import QRCode from 'qrcodejs2-didi';
import { mapGetters, mapActions } from 'vuex';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      labelWidth: '150px',
      ruleGoogleForm: {
        googleValidCode: '',
        userId: localStorage.getItem('userId')
      },
      rules: {
        googleValidCode: [
          { required: true, message: '请输入谷歌验证码', trigger: 'blur' },
          {
            min: 6,
            max: 6,
            message: '请输入6位数字的谷歌验证码',
            trigger: 'change'
          }
        ]
      },
      googleData: {},
      saveBtn: false,
      orShow: false
    };
  },
  inheritAttrs: false,
  //监听属性 类似于data概念
  computed: {
    ...mapGetters({
      bindUserInfo: 'bindUserInfo'
    })
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    init() {
      this.getBindUserInfor();
      this.get_google_refresh_hand();
    },
    async get_google_refresh_hand() {
      let res = await get_google_refresh();
      this.googleData = res.data;

      if (!this.bindUserInfo.google) {
        this.crateQrcode();
      }
    },
    checkBindHand() {
      this.orShow = true;
      // 是否绑定的标识
    },
    crateQrcode() {
      this.qr = new QRCode('qrcode', {
        width: 102,
        height: 102, // 高度
        text: this.googleData.qrUrl, // 二维码内容
        render: 'canvas'
      });
    },
    async save_google_bind() {
      try {
        let res = await google_bind(this.ruleGoogleForm);
        this.saveBtn = false;
        console.log(res);
        if (res.code == '200') {
          this.$message.success(res.msg);
          this.$emit('closeDig', false);
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        console.error(error);
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.saveBtn = true;
          this.save_google_bind();
        }
      });
    },

    onCopy() {
      this.$message.success(this.$t('chat_0026'));
    },

    ...mapActions({
      getBindUserInfor: 'GET_BIND_USER_INFO'
    })
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.init();
    console.log(QRCode, 'QRCode');
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
.google-verificaty-wrap {
  text-align: left;
  .submit-btn {
    height: 40px;
    background: #2f54eb;
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
    border: none;
    user-select: none;
    width: 100%;
    outline: none;
    box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
    cursor: pointer;
  }
  .bind-phone {
    text-align: left;
    color: #9297a3;
    i {
    }
  }
  .account-name {
    color: #151f34;
    font-size: 14px;
    font-weight: 600;
  }
  .account-code {
    display: flex;
    // justify-items: ;
    .copy-btn {
      flex: 1;
      margin-left: 10px;
      display: flex;
      width: 100%;
      flex-direction: column;
      justify-content: flex-end;
      div,
      p {
        line-height: 17px;
        color: #9297a3;
        font-size: 12px;
      }
      div {
        color: #151f34;
        font-weight: 600;
        margin-top: 5px;
        span {
          color: #2f54eb;
          display: inline-block;
          margin-left: 10px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
