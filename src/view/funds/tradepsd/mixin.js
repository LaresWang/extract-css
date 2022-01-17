import * as api from './server';
import { md5 } from '@/utils';
import { get_user_info } from '@/server';
export default {
  data() {
    return {
      checkData: {},
      user_data: {}
    };
  },
  methods: {
    async getUserInfo() {
      this.user_data = JSON.parse(localStorage.getItem('userInfo'));
      if (!this.user_data) {
        let res_user_info = await get_user_info();
        if (res_user_info.data) {
          this.user_data = res_user_info.data;
        }
      }
      // 获取用户绑定信息
      let res = await api.get_bind_user_info();
      if (res.data) {
        this.checkData = {
          ...res.data,
          userEmail: this.user_data.email,
          userMobile: this.user_data.mobile
        };
        console.log(this.checkData, 'checkData');
      }
    },
    submitTradeForms(val, type) {
      // 提交表单
      let validCodeType;
      validCodeType = type == 'email' ? 'email' : type == 'mobile' ? 'mobile' : type == 'google' ? 'google' : '';
      let pararms = {
        ...val,
        validCodeType,
        type: 2, //  1-社区资金密码 2-交易所资金密码
        newPassword: md5(val.password)
      };
      delete pararms.checkPassword;

      api.update_user_pwd(pararms).then(res => {
        if (res.code == '200') {
          this.$message.success(res.msg);
          this.$emit('closeDigpass');
        }
      });
    }
  }
};
