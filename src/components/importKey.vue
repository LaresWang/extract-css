<!--  -->
<template>
  <div>
    <!-- first：true 表示从登录页过来 TODO 后续研究怎么合并 -->

    <el-dialog
      v-if="first == true"
      title="从云端导入"
      :close-on-click-modal="false"
      :visible.sync="ImportKeyvisible"
      customClass="importKeyCSS"
      :modal="true"
      @close="dialogVisible2 = false"
    >
      <el-form ref="importForm" :model="importForm" label-width="80px" :rules="rules2" @submit.native.prevent>
        <el-form-item label="备份密码" prop="password">
          <el-input
            type="password"
            v-model="importForm.password"
            autocomplete="off"
            maxlength="6"
            @keyup.enter.native="getRsaPrivate()"
          ></el-input>
        </el-form-item>
      </el-form>
      <p style="margin-left: 80px" v-if="creatFlag">
        如您忘记密码，请
        <span @click="getKeys()" style="color: #2f54eb; cursor: pointer">重新创建密钥</span>
      </p>
      <div class="tip">
        <p style="margin: 0 0 20px 60px; color: #888">
          密钥导入后会替换原有密钥，可能会导致历史消息无法查看
        </p>
        <el-button type="primary" @click="getRsaPrivate()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-if="first == false"
      title="从云端导入"
      :close-on-click-modal="false"
      :visible.sync="ImportKeyvisible"
      customClass=""
      :modal="false"
      @close="dialogVisible2 = false"
    >
      <el-form ref="importForm" :model="importForm" label-width="80px" :rules="rules2" @submit.native.prevent>
        <el-form-item label="备份密码" prop="password">
          <el-input v-model="importForm.password" autocomplete="off" maxlength="6" @keyup.enter.native="getRsaPrivate()"></el-input>
        </el-form-item>
      </el-form>
      <p style="margin-left: 80px" v-if="creatFlag">
        如您忘记密码，请
        <span @click="getKeys()" style="color: #2f54eb; cursor: pointer">重新创建密钥</span>
      </p>
      <div class="tip">
        <p style="margin: 0 0 20px 60px; color: #888">
          密钥导入后会替换原有密钥，可能会导致历史消息无法查看
        </p>
        <el-button type="primary" @click="getRsaPrivate()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { getRsaPrivate } from '../view/setting/server';
import { GET_PUB_KEY_AND_SAVE, SET_LOGIN_FINISHED } from '@/store/types';
import { mapActions } from 'vuex';
import { getSelfUserId } from '@/utils/const';
import SQLUtils from '@/components/db/sqlite.js';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    creatFlag: null,
    first: { type: Boolean, default: false }
  },
  data() {
    //这里存放数据
    return {
      ImportKeyvisible: false,
      importForm: {
        password: ''
      },

      rules2: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: /^[0-9]{6,6}$/,
            message: '请输入6位数字'
          }
        ]
      },
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
    getKeys() {
      this.$confirm('重新创建密钥后，将无法解密您的历史消息,确定重新创建吗？')
        .then(() => {
          this.$emit('getKey');
          this.ImportKeyvisible = false;
        })
        .catch(() => {});
    },
    opendialog() {
      this.ImportKeyvisible = true;
      if (this.$refs['importForm'] != undefined) {
        this.$refs.importForm.resetFields();
      }
    },
    getRsaPrivate() {
      this.$refs['importForm'].validate(valid => {
        if (valid) {
          getRsaPrivate({
            rsaPassword: this.importForm.password,
            source: 'pc'
          })
            .then(res => {
              if (!res.code && res.data.code == 'D100005') {
                this.$message.error(res.data.msg);
              } else if (res.code && res.code == 200) {
                this.$message.success(res.msg);
                this.ImportKeyvisible = false;
                this.privateKey = res.data.rsaPrivate;
                //localStorage.setItem(userId, this.privateKey);
                console.log('this.creatFlag === ', this.creatFlag);

                this.$store.dispatch(GET_PUB_KEY_AND_SAVE, {
                  privateKey: this.privateKey
                });
                let userId = getSelfUserId();
                SQLUtils.insertOrUpdateTContactsPubkey(userId);
                if (this.creatFlag) {
                  //内部的导入秘钥
                  this.$emit('importback', res.data);
                } else {
                  //登陆的导入秘钥
                  this.SET_LOGIN_FINISHED('true');
                }
              } else {
                this.$message.error(res.data.msg);
              }
            })
            .catch(e => {
              console.error('getRsaPrivate', e);
            });
        }
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
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
<style>
.importKeyCSS {
  height: 300px !important;
  margin-top: 20vh !important;
  width: 85%;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
.tip {
  margin: 20px;
  line-height: 30px;
  text-align: center;
  color: #f57d00;
  p {
    text-align: left;
  }
}
</style>
