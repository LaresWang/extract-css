<!--  -->
<template>
  <div class="setting" v-loading="uploadLoading">
    <div class="setting-box">
      <Title>编辑社区信息</Title>
      <div>
        <div class="information-qunhead flex align-center justify-between">
          <span class="information-head">
            <img :src="imgBox[0].file.src" alt="" v-if="imgBox.length != 0" />
            <img :src="groupData.groupAvatar" alt="" v-if="groupData.groupAvatar && imgBox.length == 0" />
            <img v-if="!groupData.groupAvatar && imgBox.length == 0" src="../../../../assets/images/group.png" alt="" />
          </span>
          <span class="information-upload" @click="fileClick">
            上传
            <input
              type="file"
              multiple="true"
              accept="image/jpeg,image/jpg, image/png"
              @change="changeHand($event)"
              ref="files"
              style="display: none"
            />
          </span>
        </div>
        <div class="setting-info">
          <div class="chat-top flex justify-between">
            <span>社区ID</span>
            <span>{{ groupData.groupCode }}</span>
          </div>
          <div class="chat-top flex justify-between">
            <span>社区名称</span>
            <el-input
              style="
                border: none;
                width: 200px;
                font-size: 14px;
                text-align: right;
              "
              type="text"
              placeholder="请输入社区名称"
              v-model="groupData.groupName"
              maxlength="30"
              :rules="[
                {
                  min: 5,
                  max: 200,
                  message: '最多输入30个字符',
                  trigger: 'blur'
                }
              ]"
              show-word-limit
            />
          </div>
          <!-- <div class="chat-top flex justify-between">
            <span>社区等级</span>
            <span style="height:22px">V{{groupData.groupLevel == null ? 1 : groupData.groupLevel}}</span>
          </div> -->
          <div class="chat-top flex justify-between">
            <span>社区类型</span>
            <span>
              <el-radio v-model="groupData.groupStatus" :label="1" @change="changeNum()">公开社区</el-radio>
              <el-radio v-model="groupData.groupStatus" :label="2" @change="changeNum()">私密社区</el-radio>
            </span>
          </div>
          <div class="qun-type flex flex-direction">
            <span style="margin: 0 0 10px 0">社区简介</span>
            <el-input
              type="textarea"
              placeholder="请输入社区简介"
              :rows="6"
              v-model="groupData.groupProfile"
              maxlength="500"
              :rules="[{ max: 500, message: '最多输入500个字符', trigger: 'blur' }]"
              show-word-limit
            ></el-input>
          </div>
        </div>
      </div>
      <div class="setting-footer flex justify-center">
        <el-button style="width: 320px" type="info" @click="cacel">取消</el-button>
        <el-button style="width: 320px" type="primary" @click="save">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Title from '../components/title.vue';
import { ser_group_infoById, set_group_avatar } from './server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Title
  },
  data() {
    //这里存放数据
    return {
      uploadLoading: false,
      radio: '1',
      setInfo: true,
      groupId: sessionStorage.groupId,
      authStatus: sessionStorage.authStatus,
      groupData: {},
      imgBox: []
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    changeNum() {},
    //   上传头像
    fileClick() {
      this.$refs.files.click();
    },
    changeHand(e) {
      this.groupData.avatorFile = e.target.files[0];

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
      this.imgBox = [];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        file.src = reader.result;
        this.imgBox.push({
          file
        });
      };
    },
    cacel() {
      this.$router.go(-1);
    },
    async save() {
      this.uploadLoading = true;
      let formData = new FormData();
      //
      formData.append('avatorFile', this.groupData.avatorFile);
      let res = await set_group_avatar(
        {
          id: this.groupId,
          groupProfile: this.groupData.groupProfile,
          groupName: this.groupData.groupName,
          groupStatus: this.groupData.groupStatus
        },
        formData
      );
      if (res.code == 200) {
        this.$message.success(res.msg);
        this.$store.dispatch('GET_LAST_MSG_LIST', {
          userId: localStorage.userId,
          lastTime: 0
        });
        this.$router.go(-1);
        this.uploadLoading = false;
      } else {
        this.$message.error(res.msg);
        this.uploadLoading = false;
      }
    },
    goMessage() {
      this.$router.push('/app/chat');
    },
    async getGroupInfo() {
      let res = await ser_group_infoById({
        groupId: this.groupId
      });
      this.groupData = res.data;
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getGroupInfo();
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
.mess-header {
  height: 38px;
  background: #fff;
  padding: 0 20px;
  box-sizing: border-box;
  border-bottom: 1px solid #dddddd;
  -webkit-app-region: drag;
  span {
    height: 20px;
    line-height: 20px;
    &:nth-child(2) {
      margin: 0 12px;
    }
    &:nth-child(4) {
      margin: 0 12px;
    }
  }
  .mess-nav span {
    cursor: pointer;
  }
  .mess-nav img {
    width: 20px;
    height: 20px;
  }
  .mess-name {
    font-size: 18px;

    font-weight: bold;
    color: rgba(51, 51, 51, 1);
  }
}

.setting {
  .setting-user {
    width: 100%;
    height: 84px;
    background: #fff;
    padding: 0 20px;
  }
  .user-info {
    width: 40px;
  }
  .user-head {
    height: 40px;
    width: 40px;
    background: #ccc;
    border-radius: 50%;
    display: inline-block;
  }
  .user-name {
    font-size: 14px;

    font-weight: 400;
    color: #191f25;
    line-height: 30px;
  }
  .add {
    padding: 0 0 28px 40px;
  }
  .setting-info {
    width: 100%;
    height: 380px;
    background: #fff;
    margin-top: 10px;
    padding: 20px;
    box-sizing: border-box;
  }
  .chat-top {
    padding: 0 0 15px 0;
    border-bottom: 1px solid #dddddd;
    &:nth-child(2) {
      margin: 15px 0;
    }
    &:nth-child(3) {
      margin: 15px 0;
    }
    span {
      font-size: 14px;

      font-weight: 400;
      color: rgba(51, 51, 51, 1);
      line-height: 20px;
    }
    .shuoming {
      font-size: 14px;

      font-weight: 400;
      color: rgb(153, 153, 153);
      line-height: 30px;
    }
  }
  .setting-info2 {
    width: 100%;
    height: 102px;
    background: #fff;
    margin-top: 10px;
    padding: 20px;
    box-sizing: border-box;
    span {
      font-size: 14px;

      font-weight: 400;
      color: rgba(51, 51, 51, 1);
      line-height: 20px;
    }
  }
  .el-slider {
    width: 100%;
  }
  .setting-info3 {
    width: 100%;
    height: 190px;
    background: #fff;
    margin-top: 10px;
    padding: 20px;
    box-sizing: border-box;
  }
  .setting-footer {
    margin: 30px 0 0 0;
  }
  .qun-type {
    margin: 15px 0;
    span:nth-child(1) {
      font-size: 15px;

      font-weight: 400;
      color: rgba(51, 51, 51, 1);
      line-height: 20px;
    }
    span:nth-child(2) {
      font-size: 15px;

      font-weight: 400;
      color: rgba(153, 153, 153, 1);
      line-height: 20px;
      margin-top: 15px;
    }
    textarea {
      width: 700px;
      font-size: 14px;
      height: 100px;
      border-radius: 5px;
      border: 1px solid #ccc;
      word-break: break-all;
    }
  }
  .information-qunhead {
    width: 100%;
    height: 80px;
    background: #fff;
    margin: 0 0 10px 0;
  }
  .information-head {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #ccc;
    display: inline-block;
    margin: 0 0 0 20px;
    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
  }
  .mess-set {
    font-size: 15px;
    cursor: pointer;

    font-weight: 400;
    color: rgba(47, 84, 235, 1);
    line-height: 20px;
    margin-left: 20px;
  }
  .setting-footer {
    margin: 30px 0 0 0;
  }
  .information-upload {
    width: 80px;
    height: 40px;
    background: rgba(47, 84, 235, 1);
    border-radius: 4px;
    margin: 0 20px 0 0;
    text-align: center;
    cursor: pointer;
    line-height: 40px;
    color: #fff;
  }
}
</style>
