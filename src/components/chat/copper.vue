<template>
  <div>
    <img :src="avater" v-if="avater" class="head-image" @click="uploadAvater" />
    <i v-else class="el-icon-circle-plus user-uploader-icon" @click="uploadAvater"></i>
    <input type="file" ref="upload" @change="transferFiles($event)" style="display:none;" />
    <el-dialog
      :title="$t('Universal_0076')"
      class="cropper-dialog"
      :close-on-click-modal="false"
      :visible="dialogVisible"
      center
      :modal="false"
      @close="close"
    >
      <div class="cropper-wrap">
        <div class="cropper-box">
          <vue-cropper
            ref="cropper"
            :img="imgUrl"
            :output-size="option.size"
            :output-type="option.outputType"
            :info="option.info"
            :full="option.full"
            :canScale="option.canScale"
            :can-move="option.canMove"
            :can-move-box="option.canMoveBox"
            :fixed="option.fixed"
            :fixed-box="option.fixedBox"
            :original="option.original"
            :auto-crop="option.autoCrop"
            :center-box="option.centerBox"
            :high="option.high"
            :info-true="option.infoTrue"
            :max-img-size="option.maxImageSize"
            :enlarge="option.enlarge"
            :mode="option.mode"
            :maxImgSize="option.maxImgSize"
            :fixedNumber="option.fixedNumber"
            @realTime="realTime"
          />
        </div>
        <div class="preview-box">
          <div class="preview-title">
            <span @click="uploadImg2" class="preveiw-upload">{{ $t('opinions_0021') }}</span>
          </div>
          <div :style="previewStyle" class="preview-img">
            <div :style="preview.div">
              <img :style="preview.img" :src="preview.url" />
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">{{ $t('Universal_0063') }}</el-button>
        <el-button type="primary" @click="finish" :loading="loadings">{{ $t('Universal_0062') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper';
import fileOperational from '@/services/fileOperational';
export default {
  name: 'ImageCropper',
  components: {
    VueCropper
  },
  data() {
    return {
      // 裁剪组件的基础配置option
      option: {
        img: '', // 裁剪图片的地址
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'png', // 裁剪生成图片的格式
        full: true, // 是否输出原图比例的截图
        info: false, // 图片大小信息
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        // autoCropWidth: 300, // 默认生成截图框宽度
        // autoCropHeight: 300, // 默认生成截图框高度
        canMove: true, // 上传图片是否可以移动
        fixedBox: false, // 固定截图框大小 不允许改变
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [1,1], // 截图框的宽高比例
        canMoveBox: true, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: false, // 截图框是否被限制在图片里面
        height: true,
        infoTrue: false, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
        enlarge: 1, // 图片根据截图框输出比例倍数
        mode: 'container', // 图片默认渲染方式
        maxImgSize: 300
      },
      // 防止重复提交
      loadings: false,
      preview: {},
      previewStyle: {},
      imgUrl: '',
      dialogVisible: false
    };
  },
  props: {
    avater: {
      type: String,
      default: ''
    }
  },
  watch: {},
  methods: {
    uploadAvater() {
      this.$refs.upload.click();
    },
    transferFiles(e) {
      let res = this.getFiles(e);
      if (res) {
        this.dialogVisible = true;
      }
    },
    getFiles(e) {
      let file = e.target.files[0];
      // const isLt2M = file.size / 1024 < 300;
      const textArr = file.name.split('.');
      const isPng = textArr[textArr.length - 1].toLowerCase();

      if (isPng == 'jpg' || isPng == 'png' || isPng == 'jpeg') {
        // if (!isLt2M) {
        //   this.$message.error("单个文件不可超过300 KB!");
        //   this.loadings = false;
        //   return false;
        // }
      } else {
        this.$message(this.$t('Universal_0369'));
        this.loadings = false;
        return false;
      }
      // this.uploadData.file = file.name;

      let reader = new FileReader();
      // 转化为blob
      reader.readAsArrayBuffer(file);
      reader.onload = e => {
        let data;
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]));
        } else {
          data = e.target.result;
        }
        // this.$set(this.option, 'img', data)
        this.imgUrl = data; //上传的本地图片，需要裁剪的图片
        // console.log(this.imgUrl,'this.imgUrl++++');
      };
      return true;
    },
    upload() {
      // 点击上传
      this.$refs.upload.value = null;
      this.$refs.upload.click();
    },
    uploadImg2() {
      this.uploadAvater();
    },
    realTime(preview) {
      // 实时预览
      this.preview = preview;
      this.previewStyle = {
        width: preview.w + 'px',
        height: preview.h + 'px',
        overflow: 'hidden',
        margin: '0',
        zoom: 1,
        'border-radius': (preview.w/2) + 'px'
      };
    },
    // 将base64转换为png文件图片
    finish() {
      this.$refs.cropper.getCropData(async data => {
        //把裁剪后的图片转化为base64
        this.loadings = true;
        //把base64转化为本地路径
        const filePath = await fileOperational.saveImageToFile(data, localStorage.getItem('userId') + '.png');
        const { FileUpload } = require('@/utils/fileUpload');
        const files = new FileUpload(filePath, localStorage.getItem('userId'), -1);
        const upload = await files.headImageUpload(); //通过sdk上传
        console.log('chen-copper-upload==', upload)
        this.$emit('uploadCropper', upload[0].url, upload[1].url);
        this.dialogVisible = false;
        this.loadings = false;
      });
    },
    close() {
      // this.$emit('closeDialog',false)
      this.dialogVisible = false;
      this.loadings = false;
      this.$refs.upload.value = ''
    }
  }
};
</script>
<style lang="less" scoped>
.head-image {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}
.cropper-dialog {
  & /deep/ .el-dialog {
    width: max-content;
  }
  & /deep/ .el-dialog__body {
    padding: 20px;
  }
  & /deep/ .el-button {
    width: 145px !important;
  }
}
.cropper-wrap {
  display: flex;
  .cropper-box {
    margin-right: 20px;
    width: 300px;
    height: 300px;
    & /deep/ .crop-point {
      display: none;
    }
  }
  .preview-box {
    .preview-title {
      display: flex;
      min-width: 100px;
      justify-content: space-between;
      align-items: center;
      height: 32px;
      color: rgba(30, 35, 48, 1);
      font-family: PingFangSC-Medium;
      .preveiw-upload {
        color: #0067ed;
        cursor: pointer;
      }
    }
    .preview-img {
      border-radius: 2px;
    }
  }
}
.fun-btn {
  margin-top: 16px;
  i {
    margin-right: 16px;
    font-size: 18px;
    color: #8c8c8c;
    cursor: pointer;
    &:hover {
      color: #0067ed;
    }
  }
  .reUpload {
    margin-right: 16px;
  }
}
</style>
