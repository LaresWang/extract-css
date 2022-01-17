<!-- pass -->
<template>
  <div class="flex flex-direction align-center" ondragstart="return false">
    <div class="main-login">
      <!-- <h3>扫码登录</h3> -->
      <div v-if="netError">
        <i class="el-icon-loading" style="color: #409eff; font-size: 35px"></i>
        <p style="margin-top: 120px">{{ $t('login_pc_0020') }}</p>
      </div>
      <!-- {{errorTip }}isNetOff -->
      <div v-if="!netError && !imageAsBase64">
        <span>{{ $t('login_pc_0021') }}</span>
        <p>
          <i class="el-icon-warning-outline" style="color: red; margin-top: 120px"></i>{{ $t('login_pc_0022') }}<span
            @click="qrcode()"
            style="color: #409eff; cursor: pointer"
            >{{ $t('Universal_0344') }}</span
          >
        </p>
      </div>
      <div id="qrcode" class="qrbox">
        <div v-if="showQr && !inEffective && !hasSweep && imageAsBase64" class="normalCode" 
          @mouseover="showFreshIcon()" 
          @mouseleave="hideFreshIcon()">
          <el-image 
          v-bind:src="imageAsBase64"
          >
            <div slot="error" class="image-slot" />
          </el-image>
          <i v-if="freshShow" class="el-icon-refresh-left"  @click="showQrcode()"></i>
        </div>
        <div class="confirmlogin" v-if="hasSweep && !inEffective">
          <img :src="userImg" />
          <p class="userName">{{ userName }}</p>
          <p class="tip">{{ $t('login_pc_0018') }}</p>
          <p class="returnpass" @click="returnQrcode()">{{ text }}</p>
        </div>
        <div v-if="inEffective">
          <el-image :src="imageAsBase64"> </el-image>
          <div class="mask">{{ $t('login_pc_0028') }}</div>
          <p class="returnpass" @click="qrcode()">{{ $t('Universal_0344') }}</p>
        </div>
        <div style="margin-top: 20px" v-if="showQr && !inEffective && !hasSweep && !errorTip">
          <span>{{ $t('login_pc_0029') }}</span>
          <p class="returnpass" v-if="this.env == 'development'" @click="goForget">
            密码登录
          </p>
          <p class="returnpass">
            <span @click="downloadAPP">{{ $t('login_pc_0019') }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import os from 'os';
import { mapActions } from 'vuex';
import { getMachineId } from '@/utils'
import { WEB_CODE_LOGIN, WEB_LOGIN } from '@/store/types';
import { user_login_qrcode, user_login_get_scan_status } from './server';
const QRCode = require('qrcode');
import { shell } from 'electron';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      // isNetOff: false,
      // isReconn:false,
      errorTip: true,
      netError: true,
      loading: true,
      UDID: '',
      uuid: '',
      setIntervalTime: 2000,
      showQr: true,
      imageAsBase64: '',
      userImg: '',
      userName: '',
      step: -1,
      getStatus: '',
      inEffective: false,
      hasSweep: false,
      text: this.$t('login_pc_0023'),
      env: process.env.NODE_ENV,
      identityData: '',
      privKey: '',
      freshShow:false,
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    step() {
      if (this.step == 0) {
        this.getStatusStepChange0();
      }
    }
  },
  //方法集合
  methods: {
    ...mapActions([WEB_CODE_LOGIN, WEB_LOGIN]),
    showFreshIcon(){
      this.freshShow = true;
    },
    hideFreshIcon(){
      this.freshShow = false;
    },
    S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    guid() {
      return this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4();
    },
    showQrcode(){
      this.qrcode();
    },
    returnQrcode() {
      this.qrcode();
      this.hasSweep = false;
      
    },
    getStatusStepChange1() {
      console.log('getStatusStepChange1', this.step);
      if (this.uuid) {
        this.getStatus = setInterval(async () => {
          const stepValue = await user_login_get_scan_status({
            uuid: this.uuid
          });
          console.log('stepValue', stepValue);
          if (stepValue.data.step == 0) {
            this.getStatusStepChange0();
          }
          if (stepValue.data.step == 2) {
            this.step = 2;
            this.hasSweep = true;
            this.userImg = stepValue.data.userImg;
            this.userName = stepValue.data.userName;
            console.log(this.userImg, this.userName);
            clearInterval(this.getStatus);
            this.getStatusStepChange2();
          }
          if (stepValue.data.step == 3) {
            console.log('扫码确认登陆', stepValue.data);
            this.step = 3;
            this.userImg = stepValue.data.userImg;
            this.userName = stepValue.data.userName;
            this.identityData = stepValue.data.data;
            clearInterval(this.getStatus);
            this.getStatusStepChange3();
          }
        }, this.setIntervalTime);
      }
    },
    getStatusStepChange2() {
      console.log('getStatusStepChange2', this.step);
      if (this.uuid) {
        this.getStatus = setInterval(async () => {
          const stepValue = await user_login_get_scan_status({
            uuid: this.uuid
          });
          if (stepValue.data.step == 0) {
            this.getStatusStepChange0();
          }
          if (stepValue.data.step == 3) {
            this.step = 3;
            this.userImg = stepValue.data.userImg;
            this.userName = stepValue.data.userName;
            this.identityData = stepValue.data.data;
            clearInterval(this.getStatus);
            this.getStatusStepChange3();
          }
        }, this.setIntervalTime);
      }
    },
    getStatusStepChange0() {
      this.step = 0;
      this.inEffective = true;
      // this.$message.info('二维码已过期');
      console.log('getStatusStepChange0', this.step);
      clearInterval(this.getStatus);
    },
    async getStatusStepChange3() {
      console.log('getStatusStepChange3', this.step);
      this.text = this.$t('login_pc_0015');
      await this.WEB_LOGIN({ uuid: this.uuid, isScan: true, UDID: this.UDID, identityData: this.identityData, privKey: this.privKey});
      //判断用户如果被限制登录则刷新二维码
      if(this.$store.state.common.personalLoginLimitInfo.createTime){
        this.qrcode();
        this.hasSweep = false;
      }
    },
    goForget() {
      this.$router.push('/user/login/pass');
    },
    fromBase64(value) {
      return Buffer.from(value, 'base64');
    },
    tobase64(data) {
      return Buffer.from(data).toString('base64');
    },
    async qrcode() {
      // this.freshShow = false;
      this.netError = true;
      console.log(process.env, 'process.env', getMachineId());
      this.hasSweep = false;
      this.inEffective = false;
      clearInterval(this.getStatus);
      const machineId = getMachineId();
      console.log(machineId)
      this.UDID = 'didi.pc-' + machineId;
      try {
        const provisioningCipher = new window.libsignal.ProvisioningCipher();
        const key = await provisioningCipher.getPublicKey();
        const pubKey = key.pubKey;
        this.privKey = key.privKey;
        // 预 解密 后续删除
        // console.log('原始 privKey',Key.privKey);
        // const pub_key = this.tobase64(Key.pubKey)
        // const privKey = this.tobase64(Key.privKey)
        // // 验证 私钥
        // console.log('privKey for base64', privKey);

        // let cccprivKey = this.fromBase64(privKey);
        // console.log('privKey for arraybuffer', privKey);
        // console.log(Key.privKey == cccprivKey);

        // const dd_key = toArrayBuffer(this.fromBase64('BU2tqrpV/0OtEFdnE3SCqsoULccn7Hlo6y90GqDhV6Fj'));
        //eslint-disable-next-line
        // const dd = toArrayBuffer(this.fromBase64('ATBnJlSddqAypEuA2nZptnNPNBc1VPMV6+AMKjbdEOuBFPFSD4n/rhPLoffnD+MlzYBOZWzeQUwsms/utx+wG4nU7CvAhmF2kv7p74BNVn1GDJttHbyCfjANpn7Eu1OdnYS7DMgU3xHhyhvxwHe1DmFbrtZC0aEqI1fFZgfbJ9hdt8kJ5p6PCsIQGmG5/NZSLN9VLGhTMsBU50BLUln+aYu5FossaL7GZ0ptM7bnoE5/'));
        // console.log(dd, dd_key) 
        // const a = await provisioningCipher.decrypt({
        //   publicKey: dd_key,
        //   body: dd
        // });
        // console.log(this.tobase64(a));
        // let result = this.tobase64(a);
        // result = Buffer.from(a).toString();
        // result = JSON.parse(result);
        // console.log(this.fromBase64(result.myPublicKey));
        let deviceVersion = '';
        let hostName= '';
        if (os.type() == 'Darwin') {
          deviceVersion = `OSX ${process.getSystemVersion()}`;
          hostName = os.hostname().substring(0, os.hostname().length - 6)
        } else {
          hostName = os.hostname();
          deviceVersion = `${(os.version()).split(':')[0]} ${os.arch()}`;
        }
        const code = await user_login_qrcode({
          UDID: this.UDID,
          expirationTime: process.env.NODE_ENV == 'development' ? 30000 : 0,
          deviceId: 'didi.pc-' + machineId,
          softwareVersion: (os.version()).split(':')[0],
          deviceName: os.type(),
          hostName: hostName,
          deviceVersion: deviceVersion,
          resolution: window.screen.availWidth + '*' + window.screen.availHeight
        });
        if (code.code == 200) {
          this.errorTip = false;
          this.uuid = code.data.uuid;
          //eslint-disable-next-line
          const url = await QRCode.toDataURL(`${process.env.VUE_APP_HOST}api/user/login/scanCode?uuid=${code.data.uuid}&deviceName=${process.platform == 'darwin' ? 'darwin' : 'win'}&pub_key=${this.tobase64(pubKey)}`);
          this.imageAsBase64 = url;
          this.loading = false;
          this.step = 1;
          this.getStatusStepChange1();
          this.showQr = true;
          this.netError = false;
        } else {
          this.errorTip = true;
          // this.$message.error('服务器error');
        }
      } catch (e) {
        this.netError = false;
        this.errorTip = true;
      }
    },
    downloadAPP() {
      shell.openExternal(`https://www.didimessage.com/`);
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    const machineIds = getMachineId();
    console.log(machineIds);
    if (this.getStatus) {
      clearInterval(this.getStatus);
    }
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.qrcode();
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {
    this.uuid = '';
    for (let i = 0; i < 10; i++) {
      clearInterval(i);
    }
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.main-login {
  width: 400px;
  // height: 530px;
  height: 440px;
  padding: 60px;
  box-sizing: border-box;
  // background: rgba(255, 255, 255, 1);
  box-shadow: 0px 4px 8px 0px rgba(5, 36, 163, 0.1);
  border-radius: 4px;
  text-align: center;
  h3 {
    text-align: center;
    margin: 0 0 30px 0;
    font-size: 18px;

    font-weight: bold;
    color: rgba(51, 51, 51, 1);
  }
  .confirmlogin {
    margin-top: -30px;
    p {
      font-size: 14px;
    }
    p.tip {
      margin: 50px 0 30px;
    }
  }
  .qrbox {
    width: 180px;
    height: 180px;
    position: relative;
    .normalCode{
      
    }
    .el-icon-refresh-left{
      position: absolute;
      top: 70px;
      left: 70px;
      color: #fff;
      font-size: 34px;
      background: rgba(0, 0, 0, 0.5);
      cursor: pointer;
    }
    .mask {
      width: 180px;
      height: 180px;
      background: rgba(0, 0, 0, 0.5);
      position: absolute;
      top: 0;
      left: 0;
      color: #fff;
      line-height: 180px;
    }
  }

  .returnpass {
    margin-top: 20px;
    cursor: pointer;
    font-size: 14px;

    color: rgba(47, 84, 235, 1);
  }
  .login-code {
    font-size: 14px;
    padding: 0 0 40px;
  }
  .relative {
    position: relative;
    .clickGet {
      position: absolute;
      right: 8px;
      font-size: 14px;
      cursor: pointer;

      font-weight: 500;
      color: rgba(47, 84, 235, 1);
    }
  }
  #qrcode {
    display: inline-block;
    img {
      width: 150px;
      background-color: #fff; //设置白色背景色
      padding: 6px; // 利用padding的特性，挤出白边
      height: 150px;
      border-radius: 100px;
    }
  }
  .userName {
    font-weight: 700;
  }
  .appStyle {
    text-decoration: none;
    color: #2f54eb;
    font-size: 14px;

    &:link {
      text-decoration: none;
      color: #2f54eb;
    }
    &:hover {
      text-decoration: none;
      color: #2f54eb;
    }
    &:active {
      text-decoration: none;
      color: #2f54eb;
    }
  }
}
</style>
