<!-- 举报 -->
<template>
  <div class="tipoffs">
    <div class="tip-head">{{ $t('report_0001') }}</div>
    <div class="tip-details">
      <el-form class="tipoffs-con" :model="ruleForm" :rules="rules" ref="ruleForm">
        <div class="col colone flex justify-between">
          <div class="text"><span>*</span> {{ $t('report_0002') }}</div>
          <el-form-item prop="impeachOpinionId">
            <el-select v-model="ruleForm.impeachOpinionId" :placeholder="$t('Universal_0202')" clearable class="tipoffInput">
              <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="col">
          <div class="text"><span>*</span> {{ $t('report_0004') }}</div>
          <el-form-item prop="content">
            <el-input
              type="textarea"
              v-model.trim="ruleForm.content"
              :placeholder="$t('report_0003')"
              :autosize="{ minRows: 6, maxRows: 20 }"
              maxlength="200"
              :rules="[
                { required: true, message: this.$t('report_0005') },
                {
                  min: 5,
                  max: 200,
                  message: this.$t('report_0005'),
                  trigger: 'blur'
                }
              ]"
              show-word-limit
            ></el-input>
          </el-form-item>
          <UpoadImg
            class="image"
            ref="UpoadImg"
            :limit="limit"
            :multiple="multiple"
            :imgList="imgList"
          />
          <!-- </el-upload> -->
        </div>
      </el-form>
      <div class="btn flex justify-around">
        <el-button type="info" @click="goBack('ruleForm')">{{ $t('Universal_0355') }}</el-button>
        <el-button type="primary" @click="onSubmit('ruleForm')" v-loading.fullscreen.lock="fullscreenLoading">
          {{ $t('Universal_0049') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import UpoadImg from "./UpoadImg";
import { get_type_lists, get_tipoffs_add } from "./server";
import fileOperational from '@/services/fileOperational';
// import FileUpload from "@/utils/fileUpload";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    UpoadImg
  },
  data() {
    //这里存放数据
    return {
      options: [],
      ruleForm: {
        impeachOpinionId: '',
        content: '',
        impeachType: 1,
        othersId: ''
      },
      limit: 5,
      multiple: true,
      imgList: [],
      fullscreenLoading: false
    };
  },
  //监听属性 类似于data概念
  computed: {
    rules() {
      return {
        impeachOpinionId: [{ required: true, message: this.$t('Universal_0202'), trigger: 'change' }],
        content: [
          {
            required: true,
            message: this.$t('report_0005'),
            trigger: 'blur'
          },
          {
            min: 5,
            max: 200,
            message: this.$t('report_0005'),
            trigger: 'blur'
          }
        ]
      };
    }
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    onSubmit(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          this.ruleForm.files = [...this.$refs.UpoadImg.imgList];
          const imgUrls = await this.uploadImageToSdk(this.ruleForm.files)
          this.totipoffs(imgUrls);
        } else {
          return false;
        }
      });
    },
    async uploadImageToSdk(pararm){
      let imgUrls = []
      for(let imgData of pararm){
        // eslint-disable-next-line
        const filePath = await fileOperational.saveImageToFile( imgData.file.src, UserInfoUtils.getCurrentUserId() + '.png');
        const { FileUpload } = require('@/utils/fileUpload');
        const fileUpload = new FileUpload(filePath, UserInfoUtils.getCurrentUserId(),-1); 
        const upload = await fileUpload.headImageUpload();//通过sdk上传
        imgUrls.push(upload[0].url)
      }
      return imgUrls;
    },
    async totipoffs(imgUrls) {
      const params = {
        impeachOpinionId:this.ruleForm.impeachOpinionId,
        content:this.ruleForm.content,
        impeachType:this.ruleForm.impeachType,
        othersId:this.ruleForm.othersId,
        imgArray:imgUrls,
        userId:UserInfoUtils.getCurrentUserId()
      }
      let res = await get_tipoffs_add({}, params);
      if (res.code == 200) {
        this.fullscreenLoading = false;
        this.$message.success(this.$t('report_0012'));
        this.$router.go(-1);
      } else {
        this.fullscreenLoading = false;
        this.$message.error(res.msg);
        // console.log(res.msg);
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    // 获取下拉列表数据
    async getList() {
      this.ruleForm.impeachType = this.$route.query.impeachType;
      this.ruleForm.othersId = this.$route.query.othersId;
      let res = await get_type_lists();
      if (res.code == 200) {
        this.options = res.data.rows;
      }
    },
    init() {
      this.getList();
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
.tipoffs {
  .tip-head {
    height: 48px;
    background: rgba(243, 243, 243, 1);
    padding: 0 20px;
    box-sizing: border-box;
    border-top: 1px solid #dddddd;
    line-height: 48px;
    font-weight: 600;
  }
  .tip-details {
    overflow: scroll;
    height: calc(100vh - 100px);
  }
  .tipoffs-con {
    width: 100%;
    background: #fff;
    padding: 20px;
    box-sizing: border-box;
    .col {
      font-size: 14px;
      .text {
        line-height: 52px;
        span {
          // content: "*";
          color: #f56c6c;
          margin-right: 4px;
        }
      }
      .image {
        margin-top: 20px;
      }
    }
    .colone {
      border-bottom: 1px solid #dddddd;
      min-height: 60px;
    }
  }
  .btn {
    margin-top: 20px;
  }
}

.tipoffInput {
  width: 260px;
}
</style>
