<!-- 上传图片 -->
<template>
  <div>
    <div class="upload-img cf">
      <div class="upload-img-list" v-for="(item, index) of imgList" :key="index" v-show="imgList.length != 0">
        <!-- v-if="item.file.type.indexOf('image') !== -1" -->
        <img :src="item.file.src" />
        <div class="remove_logo" @click="delHand(index)">
          <i class="el-icon-close"></i>
        </div>
      </div>
      <div @click="fileClick" class="upload-img-list plus" v-show="addState">
        <i class="el-icon-plus"></i>
        <input
          type="file"
          :multiple="multiple"
          accept="image/jpeg,image/jpg, image/png"
          @change="changeHand($event)"
          ref="files"
          style="display: none"
        />
      </div>
    </div>
    <span style="color: #151F34; font-size: 14px">{{ $t('Universal_0371') }}</span>
    <!-- <div style="color: #F56C6C;font-size: 12px;" v-show="imgList.length == 0">请上传</div> -->
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    limit: {
      type: Number,
      default() {
        return 1;
      }
    },
    multiple: {
      type: Boolean,
      default() {
        return false;
      }
    },
    imgList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    //这里存放数据
    return {
      // imgList: [],
      addState: true,
      formData: new FormData(),
      imgListData: this.imgList
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    imgList:{
      handler:function (val) {
        if (this.imgList.length == this.limit) {
          this.addState = false;
        } else {
          this.addState = true;
        }
        this.imgListData = val;
      },
      deep:true
    }
  },
  //方法集合
  methods: {
    fileClick() {
      this.$refs.files.click();
    },
    clearFiles(){
      this.imgListData.length = 0;
    },
    changeHand(e) {
      const isJPG =
        e.target.files[0].type === 'image/jpg' || e.target.files[0].type === 'image/jpeg' || e.target.files[0].type === 'image/png';

      if (!isJPG) {
        this.$message.error(this.$t('Universal_0369'));
        return false;
      }
      if (e.target.files.length + this.imgList.length > this.limit) {
        this.$message.warning(this.$t('Universal_0434', {limit: this.limit}));
        return;
      }

      if (!e.target.files[0].size) return;
      this.fileList(e.target);
      e.target.value = '';
    },
    fileList(fileList) {
      // 获取文件
      let files = fileList.files;
      for (let i = 0; i < files.length; i++) {
        //判断是否为文件夹
        if (files[i].type != '') {
          this.fileAdd(files[i]);
        }
      }
    },
    fileAdd(file) {
      // 添加图片，显示上传的图片
      //总大小
      //   this.size = this.size + file.size;
      // FileReader读取图片文件
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        file.src = reader.result;
        this.imgListData.push({
          file
        });
      };
    },
    delHand(index) {
      // 删除图片
      this.imgListData.splice(index, 1);
    },
    uploadImage() {
      // 上传图片
      let formData = new FormData();
      for (let i = 0; i < this.imgList.length; i++) {
        formData.append('file' + [i + 1], this.imgList[i].file);
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
