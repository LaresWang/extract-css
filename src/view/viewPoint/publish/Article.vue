<!-- 文章 -->
<template>
  <div class="publish-artice-wrap" v-loading="uploadLoading">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" label-position="top">
      <el-form-item label="标题" prop="title">
        <el-input v-model="ruleFormData.title" type="text" maxlength="100" show-word-limit placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="来源" prop="invitationSource">
        <el-input v-model="ruleFormData.invitationSource" type="text" maxlength="30" show-word-limit placeholder="请输入来源"></el-input>
      </el-form-item>
      <el-form-item label="摘要" prop="content">
        <el-input
          type="textarea"
          v-model="ruleFormData.content"
          :autosize="{ minRows: 10, maxRows: 40 }"
          maxlength="500"
          show-word-limit
          placeholder="写下你看点，分享你的心情"
        ></el-input>
      </el-form-item>
      <el-form-item label="封面" prop="upload">
        <div>
          <el-upload
            class="avatar-uploader"
            :action="actionUrl"
            :headers="headers"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="articleImg" :src="articleImg" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="文章内容" prop="articleContent">
        <div>
          <el-upload
            class="avatar-uploaders"
            :action="actionUrl"
            :headers="headers"
            :show-file-list="false"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :before-upload="beforeUpload"
          ></el-upload>
          <quill-editor
            class="ql-editor"
            v-model="ruleFormData.articleContent"
            ref="myQuillEditor"
            :options="editorOption"
            @blur="onEditorBlur($event)"
            @focus="onEditorFocus($event)"
            @change="onEditorChange($event)"
          ></quill-editor>
        </div>
      </el-form-item>
      <!-- <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>-->
    </el-form>
    <Btns @saveHand="saveHand" @publishHand="publishHand" class="btn" />
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { uploadPicture } from './server';
import { addQuillTitle } from './quill';
import Btns from './Btns';
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], //加粗，斜体，下划线，删除线
  ['blockquote'], //引用，代码块

  [{ header: 1 }, { header: 2 }], // 标题，键值对的形式；1、2表示字体大小
  [{ list: 'ordered' }, { list: 'bullet' }], //列表
  [{ script: 'sub' }, { script: 'super' }], // 上下标
  [{ indent: '-1' }, { indent: '+1' }], // 缩进
  [{ direction: 'rtl' }], // 文本方向
  [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
  [{ header: [1, 2, 3, 4, 5, 6, false] }], //几级标题
  [{ color: [] }, { background: [] }], // 字体颜色，字体背景颜色
  [{ font: [] }], //字体
  [{ align: [] }], //对齐方式

  ['clean'], //清除字体样式
  ['link', 'image'] //上传图片、上传视频
];

export default {
  //import引入的组件需要注入到对象中才能使用
  components: { Btns },
  props: {
    ruleForm: {
      type: Object,
      default() {
        return {
          title: '',
          content: '',
          invitationSource: '',
          picShortObjs: [],
          picObjs: [],
          articleContent: '',
          articleImg: ''
        };
      }
    }
  },
  data() {
    //这里存放数据
    return {
      ruleFormData: this.ruleForm,
      uploadLoading: false, // 根据图片上传状态来确定是否显示loading动画，刚开始是false,不显示
      editorOption: {
        placeholder: '',
        theme: 'snow', // or 'bubble'
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function(value) {
                if (value) {
                  // 触发input框选择图片文件
                  document.querySelector('.avatar-uploaders input').click();
                } else {
                  this.quill.format('image', false);
                }
              }
            }
          }
        }
      },
      // ruleForm: {
      //   title: "",
      //   content: "",
      //   summary: ''
      // },
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        invitationSource: [{ required: true, message: '请输入来源', trigger: 'blur' }],
        content: [{ required: true, message: '请输入摘要', trigger: 'blur' }],
        articleContent: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
      },
      imageUrl: '',
      imgList: [],
      limit: 1,
      multiple: false,
      actionUrl: uploadPicture(),
      articleImg: '',
      headers: {
        Authorization: localStorage.getItem('accessToken')
      }
    };
  },
  //监听属性 类似于data概念
  computed: {
    editor() {
      return this.$refs.vueQuillEditor.quill;
    }
  },
  //监控data中的数据变化
  watch: {
    ruleForm(val) {
      this.ruleFormData = val;
    }
  },
  //方法集合
  methods: {
    handleAvatarSuccess(res, file) {
      // console.log(file,909090)
      this.articleImg = file.response.data.jaPicShortArra[0].url;
      this.uploadLoading = false;
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 3;
      const textArr = file.name.split('.');
      const isPng = textArr[textArr.length - 1].toLowerCase();
      if (isPng.toLocaleLowerCase() == 'jpg' || isPng.toLocaleLowerCase() == 'png') {
        if (!isLt2M) {
          this.$message.error('单个文件不可超过3 MB!');
          return false;
        }
      } else {
        this.$message('仅支持上传png、jpg格式的文件');
        return false;
      }
      this.uploadLoading = true;
    },
    saveHand() {
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          this.ruleFormData.articleImg = this.articleImg;
          // this.$emit('saveHand', this.ruleFormData, '0')
          // this.ruleFormData.articleImg = this.$refs.UpoadImg.uoploadImgList.picShortObjs[0].url;
          // console.log(this.ruleFormData,989889)
          //
          this.$emit('saveHand', this.ruleFormData, '1');
        } else {
          return false;
        }
      });
    },
    publishHand() {
      //
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          this.ruleFormData.articleImg = this.articleImg;
          // this.$emit('publishHand', this.ruleFormData, '1')
          // this.ruleFormData.articleImg = this.$refs.UpoadImg.uoploadImgList.picShortObjs[0].url;
          // this.ruleFormData.picObjs = this.$refs.UpoadImg.uoploadImgList.picObjs;

          this.$emit('publishHand', this.ruleFormData, '1');
        } else {
          return false;
        }
      });
    },
    onEditorReady() {
      // 准备编辑器
    },
    onEditorBlur() {}, // 失去焦点事件
    onEditorFocus() {}, // 获得焦点事件
    onEditorChange({ html }) {
      // console.log("---内容改变事件---")
      this.ruleFormData.articleContent = html;
      // console.log(html)
    }, // 内容改变事件
    beforeUpload() {
      // 显示loading动画
      this.uploadLoading = true;
    },
    uploadSuccess(res) {
      // res为图片服务器返回的数据
      // 获取富文本组件实例
      // console.log(res,999999);
      let quill = this.$refs.myQuillEditor.quill;
      // 如果上传成功
      if (res.code == 200) {
        // 获取光标所在位置
        let length = quill.getSelection().index;
        // 插入图片  res.url为服务器返回的图片地址
        quill.insertEmbed(length, 'image', res.data.jaPicShortArra[0].url);
        // 调整光标到最后
        quill.setSelection(length + 1);
      } else {
        this.$message.error('图片插入失败');
      }
      // loading动画消失
      this.uploadLoading = false;
    },
    // 富文本图片上传失败
    uploadError() {
      // loading动画消失
      this.uploadLoading = false;
      this.$message.error('图片插入失败');
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert('submit!');
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    if (this.$route.query.type && this.$route.query.type == 'edit') {
      // 编辑
      this.articleImg = this.ruleFormData.articleImg || '';

      // this.imgList = this.ruleFormData.picObjs;
      //
    }
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    addQuillTitle();
  },
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
@import '../../../../node_modules/quill/dist/quill.snow.css';
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.ql-container {
  height: 250px;
}
.publish-artice-wrap .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.publish-artice-wrap .avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.publish-artice-wrap .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.publish-artice-wrap .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

/* 字体大小 */
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: '默认' !important;
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='small']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
  content: '小号' !important;
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='large']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
  content: '大号' !important;
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='huge']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
  content: '特大号' !important;
}

/* 标题 */
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: '默认' !important;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
  content: '标题1' !important;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
  content: '标题2' !important;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
  content: '标题3' !important;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
  content: '标题4' !important;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
  content: '标题5' !important;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='6']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
  content: '标题6' !important;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
.publish-artice-wrap {
  .avatar-uploader {
    display: inline-block;
    margin-right: 10px;
  }
}
.btn {
  margin-bottom: 30px;
}
</style>
