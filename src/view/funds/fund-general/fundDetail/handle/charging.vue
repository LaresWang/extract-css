<!-- 充币 -->
<template>
  <div class="charging">
    <div class="back" @click="goBack()"><i class="el-icon-arrow-left"></i>返回</div>
    <div class="charg-form">
      <el-form label-width="100px">
        <el-form-item label="币种">
          <div class="currency">
            <el-avatar :class="`ICON_${this.$route.query.id}`" class="avatar" :size="40"></el-avatar>
            <div
              style="
                display: inline-block;
                font-weight: 400;
                line-height: 20px;
                margin-left: 8px;
              "
            >
              <span style="color: #151F34; font-size: 14px; line-height: 20px">{{ this.$route.query.id }}</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="链类型" v-if="this.$route.query.id == 'USDT'">
          <el-radio-group v-model="radio" v-for="(item, index) in chainName" :key="index" @change="changeAddress(item)">
            <el-radio-button :label="item"></el-radio-button>
          </el-radio-group>
          <div style="font-size: 12px; line-height: 30px; color: #999">
            选择链类型获取钱包地址
          </div>
          <!-- <el-radio v-model="formData.radio1" label="1" border>OMNI</el-radio>
            <el-radio v-model="formData.radio1" label="2" border>ERC20</el-radio>
          <el-radio v-model="formData.radio1" label="3" border>TRC20</el-radio>-->
        </el-form-item>
        <el-form-item label="钱包地址">
          <span class="address" v-if="address" id="copyMy">{{ address }}</span>
          <span class="copy" v-if="address" @click="copyFn()">复制地址</span>
          <div class="code">
            <div id="qrcode" ref="qrcode"></div>
            <a class="copy-btn" v-if="address" @click="downloadImg" style="cursor: pointer; line-height: 280px">点击下载</a>
          </div>
        </el-form-item>
      </el-form>
      <div class="tip">
        <span class="tip-hed">注意</span>
        <div class="tip-con">
          1、请勿向上述地址充值任何非USDT资产，否则资产将不可找回
          <br />2、您充值到上述地址后，需要整个网络节点确认
          <br />
          3、最小充值金额：{{ this.minInVol }}，小于最小金额的充值将不会上账且无法退回
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { get_currency, get_recharge_address } from '../../server';
import QRCode from 'qrcodejs2-didi';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      radio: '',
      minInVol: '', //最小充值
      maxInVol: '', //最大充值
      chainName: [],
      address: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    // 复制
    copyFn() {
      let val = document.getElementById('copyMy');
      window.getSelection().selectAllChildren(val);
      document.execCommand('Copy');
      this.$message.success('复制成功');
    },
    // 下载二维码
    downloadImg() {
      let myCanvas = document.getElementById('qrcode').getElementsByTagName('canvas');
      let a = document.createElement('a');
      a.href = myCanvas[0].toDataURL('image/png');
      a.download = '地址二维码';
      a.click();
      this.$message({
        message: '正在下载保存'
      });
    },
    // 展示二维码
    payOrder() {
      this.innerVisible = true;
      // 二维码内容,一般是由后台返回的跳转链接,这里是写死的一个链接
      this.qrcode = this.address;
      // 使用$nextTick确保数据渲染
      this.$nextTick(() => {
        this.crateQrcode();
      });
    },
    // 生成二维码
    crateQrcode() {
      this.closeCode();
      this.qr = new QRCode('qrcode', {
        width: 150,
        height: 150, // 高度
        text: this.qrcode, // 二维码内容
        render: 'canvas' // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
        // background: '#f0f'
        // foreground: '#ff0'
      });
      //
    },
    // 关闭弹框,清除已经生成的二维码
    closeCode() {
      this.$refs.qrcode.innerHTML = '';
    },
    goBack() {
      this.$router.go(-1);
    },
    async changeAddress(type) {
      try {
        let response = await get_recharge_address({
          currency: this.$route.query.id,
          linkType: type
        });
        this.address = response.data.address;

        this.payOrder();
      } catch (error) {
        this.address = '';
        this.payOrder();
      }
    },
    async getCurrency() {
      try {
        let param = {
          currency: this.$route.query.id
        };
        let res = await get_currency(param);

        this.chainName = res.data.chainName;
        this.minInVol = res.data.minInVol;
      } catch (error) {
        console.error(error);
      }
    },
    async getAddress() {
      try {
        let response = await get_recharge_address({
          currency: this.$route.query.id
        });
        this.address = response.data.address;

        this.payOrder();
      } catch (error) {
        this.address = '';
        this.payOrder();
      }
    },
    init() {
      this.getCurrency();
      if (this.$route.query.id != 'USDT') {
        this.getAddress();
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.init();
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
@import 'http://test.mobile.didimessage.com:50001/api/base/commodity/icons/encry.css';
//@import url(); 引入公共css类
.charging {
  box-sizing: border-box;
  padding: 30px 20px;
  .back {
    width: 100px;
    cursor: pointer;
    color: #151f34;
    font-size: 16px;
    .el-icon-arrow-left {
      color: #9497a3;
      margin-right: 10px;
      font-weight: 500;
    }
  }
  .charg-form {
    margin-top: 30px;
    .avatar {
      background-size: 40px 40px;
    }
    .address {
      display: inline-block;
      width: 310px;
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(21, 31, 52, 1);
      line-height: 20px;
    }
    .copy {
      display: inline-block;
      margin-left: 20px;
      width: 56px;
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(47, 84, 235, 1);
      line-height: 20px;
      cursor: pointer;
    }
    .code {
      display: flex;
      // justify-items: ;
      .copy-btn {
        width: 56px;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(47, 84, 235, 1);
        line-height: 180px;
        margin-left: 20px;
      }
    }
    .tip {
      color: rgba(245, 36, 45, 1);
      margin-top: 60px;
      .tip-hed {
        display: inline-block;
        width: 80px;
        height: 63px;
        font-size: 14px;
        font-weight: 400;
        text-align: center;
        vertical-align: top;
      }
      .tip-con {
        display: inline-block;
        width: 500px;
        height: 63px;
        font-size: 14px;

        font-weight: 400;
        line-height: 21px;
      }
    }
  }
}
</style>
