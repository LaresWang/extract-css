<!-- step2 -->
<template>
  <div class="step2 flex" v-loading="loading">
    <div class="step2-left flex flex-direction align-center">
      <el-upload class="upload-demo" :action="action" :show-file-list="false" :on-success="handleUploadSuccess" :limit="1">
        <el-avatar :size="64" fit="contain" :src="coinLogo"></el-avatar>
        <div class="step2-left-words">上传</div>
      </el-upload>
    </div>
    <div class="step2-right">
      <div class="step2-right-info">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="联系人" prop="contactPerson">
            <el-input v-model="ruleForm.contactPerson"></el-input>
          </el-form-item>
          <el-form-item label="联系手机" prop="contactPhone">
            <el-input v-model="ruleForm.contactPhone"></el-input>
          </el-form-item>
          <el-form-item label="国家" prop="country">
            <el-select v-model="ruleForm.country" clearable filterable placeholder="请选择活动区域">
              <el-option :label="item.name" :value="item.code" v-for="item in countryList" :key="item.code"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="团队名称" prop="teamName">
            <el-input v-model="ruleForm.teamName"></el-input>
          </el-form-item>
          <el-form-item label="客服邮箱" prop="serviceEmail">
            <el-input v-model="ruleForm.serviceEmail"></el-input>
          </el-form-item>
          <el-form-item label="链" prop="chain">
            <el-radio-group v-model="ruleForm.chain" size="medium" class="chain-list">
              <el-row :gutter="12">
                <el-col :span="6">
                  <el-radio-button label="ETH">以太坊</el-radio-button>
                </el-col>
                <el-col :span="6">
                  <el-radio-button label="EOS">柚子</el-radio-button>
                </el-col>
                <el-col :span="6">
                  <el-radio-button label="TRON">波场</el-radio-button>
                </el-col>
                <el-col :span="6">
                  <el-radio-button label="STEEM">STEEM</el-radio-button>
                </el-col>
                <el-col :span="6">
                  <el-radio-button label="IOST">IOST</el-radio-button>
                </el-col>
                <el-col :span="6">
                  <el-radio-button label="ONT">本体</el-radio-button>
                </el-col>
                <el-col :span="6">
                  <el-radio-button label="KLAYTN">KLAYTN</el-radio-button>
                </el-col>
                <el-col :span="6">
                  <el-input v-model="ruleForm.chain" placeholder="请输入"></el-input>
                </el-col>
              </el-row>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="币种简称" prop="shortCurrency">
            <el-input v-model="ruleForm.shortCurrency"></el-input>
          </el-form-item>
          <el-form-item label="币种全称" prop="currency">
            <el-input v-model="ruleForm.currency"></el-input>
          </el-form-item>
          <el-form-item label="发行时间" required>
            <el-col :span="11">
              <el-form-item prop="releaseTime">
                <el-date-picker
                  type="date"
                  placeholder="选择日期"
                  value-format="yyyy-MM-dd"
                  v-model="ruleForm.releaseTime"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="发行总量" prop="releaseTotal">
            <el-input v-model="ruleForm.releaseTotal" type="number"></el-input>
          </el-form-item>
          <el-form-item label="官网地址" prop="officialUrl">
            <el-input v-model="ruleForm.officialUrl"></el-input>
          </el-form-item>
          <el-form-item label="白皮书地址" prop="whiteUrl">
            <el-input v-model="ruleForm.whiteUrl"></el-input>
          </el-form-item>
          <el-form-item label="简介" prop="introduction">
            <el-input :autosize="{ minRows: 4, maxRows: 10 }" type="textarea" v-model="ruleForm.introduction"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="step2-right-media flex flex-direction align-center">
        <!-- <h3>社交媒体</h3>
        <ul class="flex">
          <li>
            <img src="../../../assets/images/register_facebook.png" alt />Facebook
          </li>
          <li>
            <img src="../../../assets/images/register_github.png" alt />Github
          </li>
        </ul>
        <ul class="flex">
          <li>
            <img src="../../../assets/images/register_twitter.png" alt />Twitter
          </li>
          <li>
            <img src="../../../assets/images/register_telegram.png" alt />Telegram
          </li>
        </ul>
        <ul class="flex">
          <li>
            <img src="../../../assets/images/register_youtube.png" alt />Youtube
          </li>
          <li>
            <img src="../../../assets/images/register_instagram.png" alt />Instatram
          </li>
        </ul>
        <ul class="flex">
          <li>
            <img src="../../../assets/images/register_reddit.png" alt />Reddit
          </li>
          <li>
            <img src="../../../assets/images/register_discord.png" alt />Discord
          </li>
        </ul>
        <ul class="flex">
          <li>
            <img src="../../../assets/images/register_medium.png" alt />Medium
          </li>
          <li>
            <img src="../../../assets/images/register_wechat.png" alt />Wechat
          </li>
        </ul>-->
        <span class="step2-right-contact">提交后无法修改，如需修改，请联系客服</span>
        <button @click="submitForm('ruleForm')">提交</button>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { user_set_team_info, user_get_team_info, upload_images } from './server';
import { base_country_list } from '@/server.js';
import { mapGetters } from 'vuex';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      action: upload_images(),
      coinLogo: '',
      loading: false,
      countryList: [],
      ruleForm: {
        contactPerson: '',
        contactPhone: '',
        country: '',
        teamName: '',
        serviceEmail: this.$route.query.email,
        chain: '',
        shortCurrency: '',
        currency: '',
        releaseTime: '',
        releaseTotal: null,
        officialUrl: '',
        whiteUrl: '',
        introduction: ''
      },
      rules: {
        contactPerson: [
          { required: true, message: '请输入', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '请输入1到50位',
            trigger: 'blur'
          }
        ],
        contactPhone: [
          { required: true, message: '请输入', trigger: 'blur' },
          {
            min: 7,
            max: 12,
            message: '请输入7到12位数字',
            trigger: 'blur'
          }
        ],
        country: [{ required: true, message: '请选择', trigger: 'change' }],
        teamName: [
          { required: true, message: '请输入', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '请输入1到50位',
            trigger: 'blur'
          }
        ],
        serviceEmail: [
          { required: true, message: '请输入', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        chain: [{ required: true, message: '请选择', trigger: 'change' }],
        shortCurrency: [
          { required: true, message: '请输入', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '请输入1到10位',
            trigger: 'blur'
          }
        ],
        currency: [
          { required: true, message: '请输入', trigger: 'blur' },
          {
            min: 1,
            max: 25,
            message: '请输入1到25位',
            trigger: 'blur'
          }
        ],
        releaseTime: [{ required: true, message: '请选择', trigger: 'change' }],
        releaseTotal: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 12, message: '请输入12位数字以内', trigger: 'blur' }
        ],
        officialUrl: [
          {
            required: true,
            type: 'url',
            message: '请输入正确网址',
            trigger: 'blur'
          }
        ],
        whiteUrl: [
          {
            required: true,
            type: 'url',
            message: '请输入正确网址',
            trigger: 'blur'
          }
        ],
        introduction: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 500, message: '不得超过500字', trigger: 'blur' }
        ]
      }
    };
  },
  props: {
    callback: {
      type: Function
    }
  },
  //监听属性 类似于data概念
  computed: {
    ...mapGetters({
      userInfo: 'userInfo'
    })
  },
  //监控data中的数据变化
  //方法集合
  methods: {
    async post_base_country_list() {
      let res = await base_country_list();
      this.countryList = res.data;
    },
    async post_user_set_team_info() {
      try {
        this.loading = true;
        let res = await user_set_team_info({
          coinLogo: this.coinLogo,
          ...this.$route.query,
          ...this.ruleForm
        });
        this.loading = false;
        if (typeof this.callback === 'function') {
          this.callback();
          return true;
        }
        if (res.code == '200') {
          this.$router.push({
            path: '',
            query: {
              step: 3
            }
          });
        }
      } catch (err) {
        this.loading = false;
        throw new Error(err);
      }
    },
    async post_user_get_team_info() {
      try {
        this.loading = true;
        let res = await user_get_team_info({
          tempAccess: this.$route.query.tempAccess
        });
        this.loading = false;
        if (!res.data) return;
        this.ruleForm = res.data;
      } catch (err) {
        this.$message.error('提交失败，请重试！');
        this.loading = false;
        throw new Error(err);
      }
    },
    handleUploadSuccess(res) {
      this.coinLogo = res.data.path;
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (!this.coinLogo) {
            this.$message.warning('请上传logo');
            return;
          }
          this.post_user_set_team_info();
        }
      });
    },
    // 获取用户的审核状态，如果非专业用户时才进行查询
    async getAccountInfo() {
      if (this.userInfo.userType === 5) {
        this.$message.error('您已经是专业用户，不需要进行账户升级！');
        this.$router.back();
        return false;
      }
      try {
        let { data } = await user_get_team_info();
        if (data) {
          this.ruleForm = data;
        }
      } catch (err) {
        throw new Error(err);
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.post_base_country_list();
    this.post_user_get_team_info();
    this.getAccountInfo();
  }
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.step2 {
  width: 760px;
  margin: 30px 0;
  .step2-left {
    width: 10%;
    .step2-left-head {
      width: 70px;
      height: 70px;
      background: #ccc;
      border-radius: 50%;
    }
    .step2-left-coin {
      margin: 5px 0 15px 0;
      font-size: 14px;

      font-weight: 500;
      color: rgba(51, 51, 51, 1);
    }
    .step2-left-words {
      font-size: 14px;

      font-weight: 500;
      color: rgba(47, 84, 235, 1);
      cursor: pointer;
    }
  }
  .step2-right {
    width: 90%;
    padding: 0 20px;
    .step2-right-info {
      width: 100%;
    }
    .step2-right-media {
      width: 100%;
      h3 {
        font-size: 14px;

        font-weight: 500;
        color: rgba(47, 84, 235, 1);
        line-height: 36px;
        width: 100%;
        text-align: left;
      }
      ul {
        width: 100%;
        height: 50px;
        box-sizing: border-box;
        font-size: 12px;

        font-weight: 500;
        color: rgba(153, 153, 153, 1);
        li:nth-child(1) {
          width: 50%;
          height: 45px;
          background: rgba(247, 247, 250, 1);
          border-radius: 4px;
          margin: 0 5px 5px 0;
          display: flex;
          align-items: center;
          padding: 0 0 0 10px;
          box-sizing: border-box;
          img {
            margin: 0 10px 0 0;
          }
        }
        li:nth-child(2) {
          width: 50%;
          height: 45px;
          background: rgba(247, 247, 250, 1);
          border-radius: 4px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          padding: 0 0 0 10px;
          box-sizing: border-box;
          img {
            margin: 0 10px 0 0;
          }
        }
      }
      .step2-right-contact {
        width: 100%;
        text-align: center;
        display: block;
        margin-top: 10px;
        font-size: 14px;

        font-weight: 500;
        color: rgba(47, 84, 235, 1);
      }
      button {
        width: 300px;
        height: 40px;
        background: rgba(47, 84, 235, 1);
        border-radius: 5px;
        border: none;
        margin-top: 20px;
        font-size: 16px;

        font-weight: 500;
        color: rgba(255, 255, 255, 1);
      }
    }
  }
  .chain-list {
    .el-col {
      padding-bottom: 10px;
    }
  }
}
</style>
