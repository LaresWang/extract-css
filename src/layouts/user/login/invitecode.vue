<template>
  <div class="invite-code-select">
    <div class="main-login">
      <div class="title"><span>选择您的ID</span></div>
      <div class="content">
        <span>ID是你在DiDi中的重要标识，你可以使用你的ID来邀请好友加入DiDi，别人也可以通过你的ID找到你</span>
      </div>
      <div class="change">
        <el-link type="primary" :underline="false" @click="getInviteCodes">换一换</el-link>
      </div>
      <div class="codes">
        <el-radio-group v-for="item in codes" :key="item.ltCode" v-model="inviteCode">
          <el-radio-button :label="item.ltCode"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="submit">
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { query_tl_code, set_tl_code } from '@/server';
import { mapActions } from 'vuex';
import { SET_LOGIN_FINISHED } from '@/store/types';
export default {
  components: {},
  data() {
    return {
      codes: [],
      inviteCode: ''
    };
  },
  methods: {
    ...mapActions([SET_LOGIN_FINISHED]),
    async getInviteCodes() {
      let res = await query_tl_code();
      if (res.code == '200') {
        this.codes = res.data;
        this.inviteCode = this.codes[0].ltCode;
      }
    },
    async onSubmit() {
      let ltCode = this.inviteCode;
      await set_tl_code({ ltCode });
      this.SET_LOGIN_FINISHED('true');
    }
  },
  mounted() {
    this.getInviteCodes();
  }
};
</script>

<style scoped>
.invite-code-select {
  position: absolute;
  top: 80px;
}
.main-login {
  width: 400px;
  height: 530px;
  padding: 50px;
  box-sizing: border-box;
  box-shadow: 0px 4px 8px 0px rgba(5, 36, 163, 0.1);
  border-radius: 4px;
}
.title {
  text-align: center;
  margin-bottom: 15px;
}
.title span {
  font-size: 16px;
}
.content span {
  font-size: 14px;
}
.change {
  float: right;
  padding: 8px 0;
}
.codes {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  height: 160px;
  margin-bottom: 25px;
}
.submit {
  text-align: center;
}
.submit button {
  width: 100%;
  height: 50px;
}
.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  color: #409eff;
  background-color: #fff;
  border-color: #409eff;
}
</style>
