<!-- 看法 -->
<template>
  <div class="view-wrap">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" label-position="top">
      <el-form-item label="摘要" prop="content">
        <el-input
          type="textarea"
          v-model="ruleFormData.content"
          :autosize="{ minRows: 10, maxRows: 40 }"
          maxlength="500"
          show-word-limit
          placeholder="写下你的看点，分享你的心情"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item>
        <el-button type="primary" >立即创建</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>-->
    </el-form>
    <div>
      <UpoadImg ref="UpoadImg" :limit="limit" :multiple="multiple" :fileList="imgList" :uoploadImgList="uoploadImgList" />
    </div>
    <Btns @saveHand="saveHand" @publishHand="publishHand" />
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

import Btns from './Btns';
import UpoadImg from './UpoadImg';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: { Btns, UpoadImg },
  props: {
    ruleForm: {
      type: Object,
      default() {
        return {
          content: '',
          picShortObjs: [],
          picObjs: []
        };
      }
    }
  },
  data() {
    //这里存放数据
    return {
      rules: {
        content: [{ required: true, message: '请填写摘要', trigger: 'blur' }]
      },
      limit: 9,
      multiple: true,
      imgList: [],
      uoploadImgList: {
        picShortObjs: [],
        picObjs: []
      },
      ruleFormData: this.ruleForm
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    ruleForm(val) {
      this.ruleFormData = val;
    }
  },
  //方法集合
  methods: {
    saveHand() {
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          this.ruleFormData.picShortObjs = this.$refs.UpoadImg.uoploadImgList.picShortObjs;
          this.ruleFormData.picObjs = this.$refs.UpoadImg.uoploadImgList.picObjs;
          this.$emit('saveHand', this.ruleFormData, '0');
        } else {
          return false;
        }
      });
    },
    publishHand() {
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          this.ruleFormData.picShortObjs = this.$refs.UpoadImg.uoploadImgList.picShortObjs;
          this.ruleFormData.picObjs = this.$refs.UpoadImg.uoploadImgList.picObjs;
          this.$emit('publishHand', this.ruleFormData, '0');
        } else {
          return false;
        }
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    if (this.$route.query.type && this.$route.query.type == 'edit') {
      // 编辑
      this.imgList = this.ruleFormData.picObjs;
      this.uoploadImgList.picObjs = this.ruleFormData.picObjs;
      this.uoploadImgList.picShortObjs = this.ruleFormData.picShortObjs;
      //
    }
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
</style>
