<!-- 划转 -->
<template>
  <div class="transfer">
    <div class="back" @click="goBack()"><i class="el-icon-arrow-left"></i>返回</div>
    <div class="trans-form">
      <el-form ref="formData" :model="formData" :rules="rules" label-width="80px">
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
        <el-form-item label="转出账户" prop="transferFrom">
          <el-select v-model="formData.transferFrom" placeholder="请选择账户">
            <el-option v-for="item in options1" :key="item.type" :label="item.value" :value="item.type"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转入账户" prop="transferTo">
          <el-select v-model="formData.transferTo" placeholder="请选择账户">
            <el-option v-for="item in options" :key="item.type" :label="item.value" :value="item.type"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转出数量" prop="transferCount">
          <el-input v-model="formData.transferCount"></el-input>
          <span class="num-text" @click="clickMost()">最大</span>
          <div class="balance">账户余额：{{ balance }} {{ this.$route.query.id }}</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('formData')">确认划转</el-button>
        </el-form-item>
      </el-form>
      <div class="tip">
        <span class="tip-hed">温馨提示</span>
        <div class="tip-con">
          • 请务必确认电脑及浏览器安全，防止信息被篡改或泄露。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { support_account_types, account_transfer_num, get_account_transfer, get_currency, get_funds_balance } from '../../server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    let validateCount = (rule, value, callback) => {
      if (value < 1 && value != 0) {
        if (value.toString().split('.')[1].length > this.miniScale) {
          callback(new Error('最多只能有' + `${this.miniScale}` + '位小数'));
          return;
        }
      }
      if (value > this.balance && value != 0) {
        callback(new Error('不可超过余额'));
        return;
      }
      if (value == 0) {
        callback(new Error('转出数量需大于0'));
        return;
      }
      callback();
    };
    return {
      options: [],
      options1: [],
      formData: {
        currency: this.$route.query.id,
        currencyPair: '',
        transferTo: '',
        transferFrom: '',
        transferCount: '',
        bizId: ''
      },
      rules: {
        transferTo: [{ required: true, message: '请选择账户', trigger: 'blur' }],
        transferFrom: [{ required: true, message: '请选择账户', trigger: 'blur' }],
        transferCount: [
          { required: true, message: '请输入数量', trigger: 'blur' },
          {
            pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/,
            message: '请输入正数'
          },
          { validator: validateCount, trigger: 'blur' }
        ]
      },
      miniScale: '',
      balance: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    // 点击最大
    clickMost() {
      let mostNum = parseFloat(this.balance);
      this.formData.transferCount = mostNum;
    },
    onSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.transfer();
        } else {
          return false;
        }
      });
    },
    async transfer() {
      try {
        let res = await get_account_transfer(this.formData);
        this.$message.success(res.msg);
        this.resetForm('formData');
        this.$router.go(-1);
      } catch (error) {
        console.error(error);
      }
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    goBack() {
      this.$router.go(-1);
    },
    async getType() {
      let currencyNow = {
        currency: this.$route.query.id
      };
      // 获取币种小数位限制
      let currencyStrict = await get_currency(currencyNow);
      if (currencyStrict.code == 200) {
        this.miniScale = currencyStrict.data.scale;
      }
      let param = {
        types: this.$route.query.type,
        currency: this.$route.query.id,
        userType: JSON.parse(localStorage.userInfo).userType
      };
      // 获取账户类型
      let res = await support_account_types(param);
      if (res.code == 200) {
        // let dataType = res.data.filter(item => {
        //   return (item.type = "" + item.type);
        // });
        let dataType = res.data;
        this.options = dataType;
        //
      }
      // this.options = res.data

      // 获取流水号
      let resp = await account_transfer_num();
      if (resp.code == 200) {
        this.formData.bizId = resp.data;
      }
    },
    async getBalance() {
      let res = await get_funds_balance({
        currency: this.$route.query.id,
        accountType: this.$route.query.type
      });
      if (res.code == 200) {
        this.balance = res.data.balance;
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getType();
    this.getBalance();
    this.options1 = this.$route.query.type == 1001 ? [{ type: 1001, value: '资金账户' }] : [{ type: 1002, value: '挖矿账户' }];
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
.transfer {
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
  .trans-form {
    margin-top: 30px;
    .avatar {
      background-size: 40px 40px;
    }
    .num-text {
      display: inline-block;
      width: 50px;
      text-align: center;
      height: 18px;
      font-size: 13px;
      font-weight: 400;
      color: rgba(47, 84, 235, 1);
      line-height: 18px;
      cursor: pointer;
    }
    .balance {
      margin-top: 10px;
      width: 300px;
      text-align: right;
      height: 17px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(21, 31, 52, 1);
      line-height: 17px;
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
        width: 453px;
        height: 63px;
        font-size: 14px;

        font-weight: 400;
        line-height: 21px;
      }
    }
  }
}
</style>
