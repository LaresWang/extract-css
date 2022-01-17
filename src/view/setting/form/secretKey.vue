<!--  -->
<template>
  <div class="secretWrap">
    <div><span class="key-backup">备份密钥</span></div>
    <div class="boxcont">
      <p class="divice-key">
        设备密钥：{{ short_secretKey }}
        <span v-clipboard:copy="secretKey" v-clipboard:success="onCopy">复制密钥</span>
      </p>
      <p>
        存储云端：{{ backups }}
        <el-button
          type="primary"
          icon="iconfont icon-shangchuan4"
          size="mini"
          @click="uploadWind()"
          class="btn-key"
          style="margin-left: 15px"
        >
          &nbsp; &nbsp; &nbsp;上传云端
        </el-button>
      </p>
    </div>
    <div>
      <span class="key-backup" v-if="backups == '已备份'">导入密钥</span>
    </div>
    <div class="key-download" v-if="backups == '已备份'">
      <el-button type="primary" icon="iconfont icon-xiazai1" size="mini" @click="downloadWind()" class="btn-key">
        &nbsp; &nbsp; &nbsp;云端导入
      </el-button>
    </div>
    <!-- <div class="box">
    <div id="preview" v-on:paste="handlePaste">
        <span>将图片按Ctrl+V 粘贴至此处</span>
    </div>
    <el-button
            v-on:click="uploadPlans"
        >上传文件</el-button>
    </div>-->

    <el-dialog
      title="设置密钥备份密码"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      customClass="customWidth"
      :modal="false"
      @close="dialogVisible = false"
    >
      <el-form ref="form" :model="form" label-width="80px" :rules="rules" @submit.native.prevent>
        <el-form-item label="备份密码" prop="password">
          <el-input v-model="form.password" autocomplete="off" maxlength="6"></el-input>
        </el-form-item>
      </el-form>
      <div class="tip">
        <p>
          你可以使用备份密钥从云端导入你的密钥,你的密钥会加密存储在云端，只有使用你的备份密码才能解密,备份密码不可找回，失去后可以去“个人-密钥管理”中重新备份
        </p>
        <el-button type="primary" @click="addPrivate()">确定</el-button>
      </div>
    </el-dialog>
    <ImportKey ref="ImportKey" @importback="importback" :creatFlag="creatFlag" @getKey="getKey"></ImportKey>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { getRsaKeys } from '@/utils/rsa';
import { send_my_rsa } from '@/server';
import { checkRsaPrivate, addPrivate } from '../server';
import { SET_USER_PRIVATE_KEY } from '@/store/types';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import { getSelfUserId } from '@/utils/const';
import SQLUtils from '@/components/db/sqlite.js';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    visible: {
      // 表格数据源
      type: Boolean,
      default: false
    }
  },
  data() {
    //这里存放数据
    return {
      dialogVisible: false,
      secretKey: '',
      rsaVersion: 1,
      short_secretKey: '',
      form: {
        password: ''
      },
      rules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: /^[0-9]{6,6}$/,
            message: '请输入6位数字'
          }
        ]
      },

      backups: '',
      creatFlag: true
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    visible(newVal) {
      if (newVal == true) {
        this.checkRsaPrivate();
      }
    }
  },
  //方法集合
  methods: {
    importback(ret) {
      this.secretKey = ret.rsaPrivate;
      this.rsaVersion = ret.appVersion;
      // this.short_secretKey = rsaPrivate.slice(0, 30) + "...";
      // this.checkRsaPrivate()
    },
    uploadWind() {
      this.dialogVisible = true;
      if (this.$refs['form'] != undefined) {
        this.$refs.form.resetFields();
      }
    },
    downloadWind() {
      this.$refs.ImportKey.opendialog();
    },
    checkRsaPrivate() {
      checkRsaPrivate({}).then(res => {
        if (res.code == 200) {
          if (res.data) {
            this.backups = '已备份';
          } else {
            this.backups = '未备份';
          }
        }
      });
    },

    addPrivate() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          addPrivate({
            rsaPrivate: this.secretKey, //私钥
            rsaPassword: this.form.password, //私钥密码
            loginUserId: localStorage.getItem('userId'), //
            appVersion: this.rsaVersion,
            source: 'pc'
          }).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg);
              this.dialogVisible = false;
              this.checkRsaPrivate();
            } else {
              this.$message.error(res.msg);
            }
          });
        }
      });
    },
    handlePaste(event) {
      const items = (event.clipboardData || window.clipboardData).items;
      let file = null;

      if (!items || items.length === 0) {
        this.$message.error('当前浏览器不支持本地');
        return;
      }
      // 搜索剪切板items
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile();
          break;
        }
      }
      if (!file) {
        this.$message.error('粘贴内容非图片');
        return;
      }
      // 此时file就是我们的剪切板中的图片对象
      // 如果需要预览，可以执行下面代码
      const reader = new FileReader();
      // reader.onload = event => {
      //   preview.innerHTML = `<img src="${event.target.result}">`;
      // };
      reader.readAsDataURL(file);
      this.file = file;
      // uploadPlans(file);
    },
    //上传文件成功后回调
    uploadPlans(file) {
      // let file = this.file;
      if (!file) {
        this.$message.error('请粘贴图片后上传');
        return;
      }
      this.loading = true;
      let form = new FormData();
      form.append('file', file);
      form.append('type', this.type);
    },
    //重新创建秘钥后，秘钥的版本在上传新公钥的同时从后台获取
    getKey() {
      let that = this;

      function getRsa(a, b) {
        that.privateKey = a;
        that.publicKey = b;
        that.sendCode(a, b);
        //localStorage.setItem(key, a);
        that.secretKey = a;
        that.short_secretKey = a.slice(0, 30) + '...';
      }

      getRsaKeys(getRsa);
    },
    async sendCode(priKey, pubKey) {
      let res = await send_my_rsa({
        rsaPub: pubKey
      });
      if (res.code == 200) {
        this.$message.success('创建成功');
        this.checkRsaPrivate();
        //赋值公钥版本，后面需在入本地库
        this.rsaVersion = res.data.rsaPubVersion;
        let item = {
          rsa_pub: res.data.rsaPub,
          rsa_pub_version: res.data.rsaPubVersion,
          rsa_pri: priKey
        };
        this.$store.dispatch(SET_USER_PRIVATE_KEY, item);
        let userId = getSelfUserId();
        SQLUtils.insertOrUpdateTContactsPubkey(userId);
      }
    },
    onCopy() {
      this.$message.success(this.$t('chat_0026'));
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    // this.checkRsaPrivate();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.secretKey = UserInfoUtils.getCurrentUserPrivateKey();
    this.rsaVersion = UserInfoUtils.getCurrentUserPrivateKeyLastVersion();
    console.log('this.secretKey', this.secretKey);
    this.short_secretKey = this.secretKey.slice(0, 30) + '...';
    this.checkRsaPrivate();
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
.secretWrap {
  font-size: 14px;

  .tip {
    margin: 20px;
    line-height: 30px;
    text-align: center;
    color: #f57d00;

    p {
      text-align: left;
    }
  }

  .key-backup {
    height: 20px;
    font-size: 14px;

    font-weight: 400;
    color: #333333;
    line-height: 20px;
  }

  h3 {
    background: #f5f7f7;
    height: 35px;
    line-height: 35px;
    padding-left: 10px;
  }

  .boxcont {
    padding: 20px 15px;

    p {
      margin: 15px 0;

      span {
        color: #2f54eb;
        cursor: pointer;
        padding-left: 10px;
      }

      img {
        height: 25px;
        cursor: pointer;
      }
    }

    .divice-key {
      margin: 0 0 18px;
      height: 17px;
      font-size: 13px;

      font-weight: 400;
      color: #666666;
      line-height: 17px;

      span {
        height: 17px;
        font-size: 12px;

        font-weight: 400;
        color: #2f54eb;
        line-height: 17px;
        cursor: pointer;
        padding-left: 10px;
      }
    }
  }

  .key-download {
    padding: 15px 0;
  }

  #preview {
    border: #ddd solid 1px;
    width: 200px;
    height: 200px;
  }

  .btn-key {
    // .el-button--mini, .el-button--mini.is-round
    padding: 5px 10px;
    line-height: 15px;
  }
}
</style>
