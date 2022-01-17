<!-- 充币 -->
<template>
  <div class="withdraw">
    <div class="back" @click="goBack()"><i class="el-icon-arrow-left"></i>返回</div>
    <div class="withd-form">
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
        <el-form-item label="提币地址" prop="addressId">
          <el-select v-model="formData.addressId" placeholder="请选择提币地址">
            <el-option v-for="item in addressList" :key="item.addressId" :label="item.address" :value="item.addressId">
              <div style="line-height: 20px">
                <span style="font-size: 14px; color: #8492a6">{{ item.currency }}</span>
                <span style="font-size: 12px; margin-left: 10px">链类型：{{ item.linkType }}</span>
              </div>
              <div style="line-height: 16px">{{ item.address }}</div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提币数量" prop="actualAmount">
          <el-input v-model="formData.actualAmount"></el-input>
          <span class="num-text" @click="clickMost()">最大</span>
          <div class="balance">账户余额：{{ balance }}</div>
        </el-form-item>
        <el-form-item label="手续费" prop="fee">
          <el-input v-model="formData.fee"></el-input>
          <div class="balance">范围：{{ outFee }}-{{ maxOutFee }}</div>
        </el-form-item>
        <el-form-item label="资金密码" prop="accountPassword">
          <el-input v-model="formData.accountPassword" show-password></el-input>
          <span class="num-text" @click="forget">忘记密码</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('formData')">确认提币</el-button>
        </el-form-item>
      </el-form>
      <div class="tip">
        <span class="tip-hed">温馨提示</span>
        <div class="tip-con">
          • 最小提币数量为：{{ minOutVol }} <br />•
          为保障资金安全，当您账户安全策略变更、密码修改、我们会对提币进行人工审核，请耐心等待工作人员电话或邮件联系 <br />•
          请务必确认电脑及浏览器安全，防止信息被篡改或泄露
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { get_currency, get_user_capitaldetail, get_withdraw_addressList, get_confirm_withdraw } from '../../server';
import { md5 } from '@/utils';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    let validateCount = (rule, value, callback) => {
      if (value < this.minOutVol) {
        callback(new Error('最小提币金额为' + `${this.minOutVol}`));
        return;
      }
      if (value > this.maxOutVol) {
        callback(new Error('最大提币金额为' + `${this.maxOutVol}`));
        return;
      }
      callback();
    };
    let validateFee = (rule, value, callback) => {
      if (value < this.outFee) {
        callback(new Error('最小手续费为' + `${this.outFee}`));
        return;
      }
      if (value > this.maxOutFee) {
        callback(new Error('最大手续费为' + `${this.maxOutFee}`));
        return;
      }
      callback();
    };
    //这里存放数据
    return {
      formData: {
        currency: this.$route.query.id,
        addressId: '',
        fee: '',
        actualAmount: '',
        accountPassword: ''
      },
      rules: {
        addressId: [{ required: true, message: '请选择地址', trigger: 'blur' }],
        fee: [
          { required: true, message: '请输入手续费', trigger: 'blur' },
          {
            pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/,
            message: '请输入正数'
          },
          { validator: validateFee, trigger: 'blur' }
        ],
        actualAmount: [
          { required: true, message: '请输入提币数量', trigger: 'blur' },
          {
            pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/,
            message: '请输入正数'
          },
          { validator: validateCount, trigger: 'blur' }
        ],
        accountPassword: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      // linkType: [], //链类型
      minOutVol: '', //最小提币额度
      maxOutVol: '', //最大提币额度
      outFee: '', //最小手续费
      maxOutFee: '', //最大手续费
      balance: '', //账户余额
      addressList: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    forget() {
      this.$router.push('/app/funds/tradepwd/email');
    },
    clickMost() {
      if (this.maxOutVol >= this.balance) {
        let mostNum = parseFloat(this.balance);
        this.formData.actualAmount = mostNum;
      } else {
        let mostNum = parseFloat(this.maxOutVol);
        this.formData.actualAmount = mostNum;
      }
    },
    onSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.confirmWithDraw({
            ...this.formData,
            accountPassword: md5(this.formData.accountPassword)
          });
        } else {
          return false;
        }
      });
    },
    async confirmWithDraw(data) {
      try {
        let res = await get_confirm_withdraw(data);
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
    async init() {
      // 获取币种配置
      try {
        let param = {
          currency: this.$route.query.id
        };
        let res = await get_currency(param);

        // this.linkType = res.data.chainName
        this.minOutVol = parseFloat(res.data.minOutVol);
        this.maxOutVol = parseFloat(res.data.maxOutVol);
        this.outFee = parseFloat(res.data.outFee);
        this.maxOutFee = parseFloat(res.data.maxOutFee);
      } catch (error) {
        console.error(error);
      }
      //
      // 提币页面用户金额
      try {
        let param = {
          currency: this.$route.query.id
        };
        let detailCurrency = await get_user_capitaldetail(param);

        this.balance = detailCurrency.data.balance;
      } catch (error) {
        console.error(error);
      }
      // 地址簿列表查询(提币地址下拉框使用)
      try {
        let params = {
          currency: this.$route.query.id,
          pageNo: 1,
          pageSize: 10
        };
        let addList = await get_withdraw_addressList(params);
        //
        this.addressList = addList.data;
      } catch (error) {
        console.error(error);
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
//@import url(); 引入公共css类
@import 'http://test.mobile.didimessage.com:50001/api/base/commodity/icons/encry.css';
.withdraw {
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
  .withd-form {
    margin-top: 30px;
    .avatar {
      background-size: 40px 40px;
    }
    .num-text {
      display: inline-block;
      width: 100px;
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
