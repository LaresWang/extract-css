<!--  -->
<template>
  <div class="setting">
    <div class="setting-box">
      <Title :authStatus="authStatus">社区信息</Title>
      <!-- <div class="mess-header flex align-center justify-between">
        <div class="flex align-center">
          <div class="mess-name">群信息</div>
          <div class="mess-set" @click="setInfo=!setInfo">编辑资料</div>
        </div>
        <div class="mess-nav flex align-center">
          <span @click="goMessage">消息</span>
          <span>搜寻</span>
          <span>文件</span>
          <span>公告</span>
          <span>
            <img src="../../../../assets/images/set.png" alt />
          </span>
        </div>
      </div> -->
      <div v-if="setInfo">
        <div class="information-qunhead flex align-center">
          <div class="information-head">
            <img v-if="groupData.groupAvatar" :src="groupData.groupAvatar" alt="" />
            <img v-else src="../../../../assets/images/group.png" alt="" />
          </div>
          <el-button type="primary" v-if="authStatus == 1 || authStatus == 2" @click="toEdit">编辑资料</el-button>
        </div>
        <div class="setting-info">
          <div class="chat-top flex justify-between">
            <span>社区ID</span>
            <span>{{ groupData.groupCode }}</span>
          </div>
          <div class="chat-top flex justify-between">
            <span>社区名称</span>
            <span>{{ groupData.groupName }}</span>
          </div>
          <!-- <div class="chat-top flex justify-between">
            <span>社区等级</span>
            <span style="height:22px">V{{groupData.groupLevel == null ? 1 : groupData.groupLevel}}</span>
          </div> -->
          <div class="chat-top flex justify-between">
            <span>社区类型</span>
            <span v-if="groupData.groupStatus == 1">公开</span>
            <span v-if="groupData.groupStatus == 2">私密</span>
          </div>
          <div class="qun-type flex flex-direction">
            <span>社区简介</span>
            <span>{{ groupData.groupProfile }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Title from '../components/title.vue';
import { ser_group_infoById } from './server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Title
  },
  data() {
    //这里存放数据
    return {
      radio: '1',
      setInfo: true,
      groupId: sessionStorage.groupId,
      authStatus: sessionStorage.authStatus,
      groupData: {}
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    preview(item) {
      // 预览图片
      let arrImg = [];
      arrImg.push(item);
      this.$imagePreview({
        images: arrImg,
        index: 0
      });
    },
    goMessage() {
      this.$router.push('/app/chat');
    },
    async getGroupInfo() {
      let res = await ser_group_infoById({
        groupId: this.groupId
      });
      this.groupData = res.data;
    },
    toEdit() {
      this.$router.push('/app/chat/group/setGroupInfo');
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getGroupInfo();
    this.authStatus = sessionStorage.getItem('authStatus');
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
  -webkit-app-region: drag;
  padding: 0 20px;
  box-sizing: border-box;
  border-bottom: 1px solid #dddddd;
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
    box-sizing: border-box;
    margin: 0 0 10px 0;
    padding: 0 20px;
    justify-content: space-between;
  }
  .information-head {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #ccc;
    display: inline-block;
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
