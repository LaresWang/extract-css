<!-- 上传图片 -->
<template>
  <div>
    <el-upload
      :multiple="multiple"
      :action="actionUrl"
      :limit="limit"
      list-type="picture-card"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :headers="headers"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeUpload"
      :on-exceed="handleExceed"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { uploadPicture } from './server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    limit: {
      type: Number,
      default() {
        return 9;
      }
    },
    multiple: {
      type: Boolean,
      default() {
        return false;
      }
    },
    fileList: {
      type: Array,
      default() {
        return [];
      }
    },
    uoploadImgList: {
      type: Object,
      default() {
        return {
          picShortObjs: [],
          picObjs: []
        };
      }
    }
  },
  data() {
    //这里存放数据
    return {
      // imgList: [],
      actionUrl: uploadPicture(),
      dialogImageUrl: '',
      dialogVisible: false,
      headers: {
        Authorization: localStorage.getItem('accessToken')
      },
      picShortObjs: [],
      picObjs: [],
      uploadImgListData: this.uoploadImgList
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    uoploadImgList(val) {
      this.uploadImgListData = val;
    }
  },
  //方法集合
  methods: {
    handleExceed() {
      this.$message.warning(`当前限制选择${this.limit}个文件`);
    },
    handleRemove(file, fileList) {
      this.uploadImgListData.picShortObjs = [];
      this.uploadImgListData.picObjs = [];
      // this.picShortObjs = [];
      // this.picObjs = [];

      fileList.map(item => {
        if (item.response) {
          // 新增文件的时候
          this.uploadImgListData.picShortObjs.push(item.response.data.jaPicShortArra[0]);
          this.uploadImgListData.picObjs.push(item.response.data.jaPicArra[0]);
        } else {
          // 从待发布过来带来默认的值
          this.uploadImgListData.picShortObjs.push(item);
          this.uploadImgListData.picObjs.push(item);
        }
      });
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleAvatarSuccess(val, file, fileList) {
      //
      this.uploadImgListData.picShortObjs = [];
      this.uploadImgListData.picObjs = [];
      if (val.code == '200') {
        fileList.map(item => {
          if (item.response) {
            // 新增文件的时候
            this.uploadImgListData.picShortObjs.push(item.response.data.jaPicShortArra[0]);
            this.uploadImgListData.picObjs.push(item.response.data.jaPicArra[0]);
          } else {
            // 从待发布过来带来默认的值
            this.uploadImgListData.picShortObjs.push(item);
            this.uploadImgListData.picObjs.push(item);
          }
        });
        // this.picShortObjs.push(val.data.jaPicShortArra[0]);
        // this.picObjs.push(val.data.jaPicArra[0]);
      } else {
        this.$message.error(val.msg);
      }
    },
    beforeUpload(files) {
      const isLt2M = files.size / 1024 / 1024 < 3;
      const textArr = files.name.split('.');
      const isPng = textArr[textArr.length - 1];
      if (isPng.toLocaleLowerCase() == 'jpg' || isPng.toLocaleLowerCase() == 'png') {
        if (!isLt2M) {
          this.$message.error('单个文件不可超过3 MB!');
          return false;
        }
      } else {
        this.$message('仅支持上传png、jpg格式的文件');
        return false;
      }
      //
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
.upload-img {
  .upload-img-list {
    width: 100px;
    height: 75px;
    float: left;
    position: relative;
    margin-right: 20px;
    margin-bottom: 20px;
    overflow: hidden;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 6px;
    box-sizing: border-box;
    img {
      width: 100%;
      height: 100%;
    }
    .remove_logo {
      position: absolute;
      right: 5px;
      top: 5px;
    }
  }
  .plus {
    background: #ededf0;
    text-align: center;
    line-height: 75px;
    font-size: 20px;
    color: #9297a3;
    display: inline-block;
  }
}
</style>
