<!-- pass -->
<template>
  <div class="checking">
    <div class="main-login flex flex-direction align-center">
      <h3>登录</h3>
      <h4>请先进行谷歌验证</h4>
      <div class="box">
        <span class="square">
          <input maxlength="1" ref="input1" @input="next(2, $event)" v-model="input1" />
        </span>
        <span class="square">
          <input maxlength="1" ref="input2" @input="next(3, $event)" v-on:keyup.delete="deleted(1, $event)" v-model="input2" />
        </span>
        <span class="square">
          <input maxlength="1" ref="input3" @input="next(4, $event)" v-on:keyup.delete="deleted(2, $event)" v-model="input3" />
        </span>
        <span class="square">
          <input maxlength="1" ref="input4" @input="next(5, $event)" v-on:keyup.delete="deleted(3, $event)" v-model="input4" />
        </span>
        <span class="square">
          <input maxlength="1" ref="input5" @input="next(6, $event)" v-on:keyup.delete="deleted(4, $event)" v-model="input5" />
        </span>
        <span class="square">
          <input maxlength="1" ref="input6" v-model="input6" v-on:keyup.delete="deleted(5, $event)" />
        </span>
      </div>
      <el-button style="width: 60%; height: 50px; margin-top: 60px" type="primary" @click="submitForm">提交验证</el-button>
      <div class="words">
        <span>如您无法验证，请联系客服</span>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { WEB_LOGIN, WEB_CODE_LOGIN } from '@/store/types';
import { mapActions } from 'vuex';
// import { md5 } from "@/utils";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      autofocus: 1,
      input1: '',
      input2: '',
      input3: '',
      input4: '',
      input5: '',
      input6: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapActions([WEB_LOGIN, WEB_CODE_LOGIN]),
    next(num, e) {
      console.log(e);
      if (isNaN(Number(e.target.value)) || e.data == null) {
        return;
      } else {
        this.$refs[`input${num}`].focus();
      }
    },
    deleted(num, e) {
      this.$refs[`input${num}`].focus();
      e.stopPropagation();
    },
    submitForm() {
      if (this.input1 && this.input2 && this.input3 && this.input4 && this.input5 && this.input6) {
        this.WEB_LOGIN({
          ...this.$route.query,
          googleCode: `${this.input1}${this.input2}${this.input3}${this.input4}${this.input5}${this.input6}`
        });
      } else {
        this.$message.warning('请输入谷歌验证码');
      }
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
<style lang="less" scoped>
//@import url(); 引入公共css类
.main-login {
  width: 400px;
  height: 530px;
  padding: 60px;
  box-sizing: border-box;
  // background: rgba(255, 255, 255, 1);
  box-shadow: 0px 4px 8px 0px rgba(5, 36, 163, 0.1);
  border-radius: 4px;
  h3 {
    text-align: center;
    margin: 0 0 30px 0;
    font-size: 18px;

    font-weight: bold;
    color: rgba(51, 51, 51, 1);
  }
  h4 {
    font-size: 16px;

    font-weight: 400;
    color: rgba(51, 51, 51, 1);
    text-align: center;
    line-height: 40px;
  }
  .box {
    width: 100%;
    margin-top: 20px;
  }
  .square {
    width: 40px;
    height: 50px;
    background: rgba(247, 247, 250, 1);
    border-radius: 4px;
    display: inline-block;
    text-align: center;
    line-height: 50px;
    font-size: 24px;

    font-weight: 500;
    margin: 0 5px 0 0;
    input {
      text-align: center;
      color: rgba(47, 84, 235, 1);
      width: 100%;
      background: none;
      outline: none;
      border: none;
    }
  }
  .words {
    font-size: 14px;

    font-weight: 400;
    color: rgba(47, 84, 235, 1);
    line-height: 56px;
  }
}
</style>
