<!--  -->
<template>
  <div class="setting">
    <div class="setting-box">
      <Title :authStatus="authStatus">{{ name }}</Title>
      <div class="setting-info flex flex-direction">
        <p class="tip">基础设置</p>
        <div class="chat-top flex justify-between">
          <span style="margin-top: 10px">消息保存时长</span>
          <span>
            <el-select v-model="group.saveTime">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </span>
        </div>
      </div>
      <div class="setting-info">
        <p class="tip">成员权限<span>全体成员权限（非管理员）</span></p>
        <div class="chat-top flex justify-between">
          <span>截屏提醒</span>
          <span>
            <el-switch v-model="group.screenshotsReminderStatus" active-color="#13ce66" inactive-color="#D8D8D8"></el-switch>
          </span>
        </div>
        <div class="chat-top flex justify-between">
          <span>社区成员禁言</span>
          <span>
            <el-switch v-model="group.forbiddenWordsStatus" active-color="#13ce66" inactive-color="#D8D8D8"></el-switch>
          </span>
        </div>
        <div class="chat-top flex justify-between">
          <span>禁止成员单聊</span>
          <span>
            <el-switch v-model="group.memberSingleChatStatus" active-color="#13ce66" inactive-color="#D8D8D8"></el-switch>
          </span>
        </div>
        <div class="chat-top flex justify-between">
          <span>禁止成员发送图片和视频</span>
          <span>
            <el-switch v-model="group.sendPicturesStatus" active-color="#13ce66" inactive-color="#D8D8D8"></el-switch>
          </span>
        </div>
        <div class="chat-top flex justify-between">
          <span>禁止成员发送链接</span>
          <span>
            <el-switch v-model="group.sendConnectionStatus" active-color="#13ce66" inactive-color="#D8D8D8"></el-switch>
          </span>
        </div>
        <div class="chat-top flex justify-between">
          <span>禁止成员复制</span>
          <span>
            <el-switch v-model="group.copyMessagesStauts" active-color="#13ce66" inactive-color="#D8D8D8"></el-switch>
          </span>
        </div>
      </div>
      <div class="setting-info">
        <div class="chat-top flex justify-between" style="margin: 0; padding: 0">
          <span style="padding-top: 10px">其他</span>
          <span>
            <el-button type="danger" @click="releaseGroup()">解散社区</el-button>
          </span>
        </div>
      </div>
      <div class="setting-footer flex justify-center">
        <el-button style="width: 320px" type="info" @click="gotoChat()">取消</el-button>
        <el-button style="width: 320px" type="primary" @click="setGroupBase()">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script>
//社群设置
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Title from '../components/title.vue';
import { setGroupBase, releaseGroup, queryGroupByGroupId } from './server';
import { contGrpSize } from '@/utils';
import { mapMutations } from 'vuex';
import { CLEAR_CHAT } from '@/store/types';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Title
  },
  data() {
    //这里存放数据
    return {
      relategroup: [
        {
          name: '社区1',
          id: '1',
          avater: 'http://didiimg.oss-ap-southeast-1.aliyuncs.com/default.png'
        },
        {
          name: '社区2',
          id: '2',
          avater: 'http://didiimg.oss-ap-southeast-1.aliyuncs.com/default.png'
        },
        {
          name: '社区3',
          id: '3',
          avater: 'http://didiimg.oss-ap-southeast-1.aliyuncs.com/default.png'
        },
        {
          name: '社区4',
          id: '4',
          avater: 'http://didiimg.oss-ap-southeast-1.aliyuncs.com/default.png'
        }
      ],
      name: '社区管理',
      group: {
        saveTime: 168,
        screenshotsReminderStatus: 0, //截屏提醒
        forbiddenWordsStatus: 0, //0关闭禁言1开启禁言
        memberSingleChatStatus: 0, //0禁止成员单聊1允许成员单聊
        sendPicturesStatus: 0, //0禁止发送图片1允许发送图片
        sendConnectionStatus: 0, //0禁止发送链接1允许发送链接
        copyMessagesStauts: 0, //	0禁止复制消息1允许复制消息
        sendRedpacketStatus: 0, //	0禁止发送红包1允许发送红包
        id: sessionStorage.getItem('groupId')
      },

      value0: false,
      value1: false,
      value2: false,
      value11: 0,
      options: [
        {
          value: 1,
          label: '1小时'
        },
        {
          value: 3,
          label: '3小时'
        },
        {
          value: 12,
          label: '12小时'
        },
        {
          value: 24,
          label: '24小时'
        },
        {
          value: 72,
          label: '3天'
        },
        {
          value: 120,
          label: '5天'
        },
        {
          value: 168,
          label: '7天'
        }
      ],
      authStatus: ''
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapMutations([CLEAR_CHAT]),
    gotoChat() {
      let current = {
        targetId: sessionStorage.getItem('groupId'),
        uniqueCode: contGrpSize(sessionStorage.getItem('groupId'))
      };
      this.CLEAR_CHAT();
      this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.$router.push({
        path: '/app/chat/group/message',
        query: {
          targetId: sessionStorage.getItem('groupId'),
          timer: new Date().getTime(),
          friendName: this.group.groupName,
          uniqueCode: contGrpSize(sessionStorage.getItem('groupId'))
        }
      });
    },
    queryGroupByGroupId() {
      queryGroupByGroupId({
        groupId: sessionStorage.getItem('groupId')
      }).then(res => {
        if (res.code == 200) {
          // var newobj={}
          // for(let key in res.data){
          //       newobj.key=res.data[key]===1?true:false
          // }
          this.group.screenshotsReminderStatus = res.data.screenshotsReminderStatus == 1 ? true : false; //截屏提醒
          this.group.forbiddenWordsStatus = res.data.forbiddenWordsStatus == 1 ? true : false; //0关闭禁言1开启禁言
          this.group.memberSingleChatStatus = res.data.memberSingleChatStatus == 1 ? true : false; //0禁止成员单聊1允许成员单聊
          this.group.sendPicturesStatus = res.data.sendPicturesStatus == 1 ? true : false; //0禁止发送图片1允许发送图片
          this.group.sendConnectionStatus = res.data.sendConnectionStatus == 1 ? true : false; //0禁止发送链接1允许发送链接
          this.group.copyMessagesStauts = res.data.copyMessagesStauts == 1 ? true : false;
          this.group.sendRedpacketStatus = res.data.sendRedpacketStatus == 1 ? true : false;
          this.group.groupName = res.data.groupName;
          this.group.saveTime = res.data.saveTime;
        }
      });
    },
    releaseGroup() {
      this.$confirm('确定要解散社区吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          releaseGroup({
            gId: this.$route.query.id
          }).then(res => {
            if (res.code == 200) {
              this.$message.success(`你已成功解散社区${this.group.groupName}`);
              let GROUPEncode = 'GROUP@' + sessionStorage.getItem('groupId') + '_messageList';
              localStorage.setItem(GROUPEncode, '');
              this.$router.push({ path: '/app/chat' });
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          });
        });
    },
    setGroupBase() {
      setGroupBase({
        saveTime: this.group.saveTime,
        screenshotsReminderStatus: this.group.screenshotsReminderStatus ? 1 : 0, //截屏提醒
        forbiddenWordsStatus: this.group.forbiddenWordsStatus ? 1 : 0, //0关闭禁言1开启禁言
        memberSingleChatStatus: this.group.memberSingleChatStatus ? 1 : 0, //0禁止成员单聊1允许成员单聊
        sendPicturesStatus: this.group.sendPicturesStatus ? 1 : 0, //0禁止发送图片1允许发送图片
        sendConnectionStatus: this.group.sendConnectionStatus ? 1 : 0, //0禁止发送链接1允许发送链接
        copyMessagesStauts: this.group.copyMessagesStauts ? 1 : 0, //	0禁止复制消息1允许复制消息
        sendRedpacketStatus: this.group.sendRedpacketStatus ? 1 : 0, //0禁止发送红包1允许发送红包
        id: sessionStorage.getItem('groupId')
      }).then(res => {
        if (res.code == 200) {
          this.$message.success(res.msg);
          this.queryGroupByGroupId();
        } else {
          this.$message.error(res.msg);
        }
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.queryGroupByGroupId();
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
  padding: 0 20px;
  box-sizing: border-box;
  border-bottom: 1px solid #dddddd;
  span {
    height: 20px;
    line-height: 20px;
    &:nth-child(2) {
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
  padding-bottom: 20px;
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
    .tip {
      font-weight: 700;
      button {
        margin-left: 20px;
      }
      span {
        font-size: 14px;
        color: #666;
        padding-left: 20px;
        font-weight: 400;
      }
    }
    .cancellink {
      padding-top: 10px;
      label {
        color: #2f54eb;
        cursor: pointer;
      }
    }
    .updown {
      padding-top: 10px;
      img {
        cursor: pointer;
      }
    }
    .grouppic {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      border: #ddd solid 1px;
    }
    .leftside {
      img,
      label {
        vertical-align: middle;
        margin-right: 10px;
      }
    }
    .grouprelate div.chat-top {
      border-bottom: #ddd solid 1px;
    }
  }
  .chat-top {
    padding: 0 0 15px 0;
    border-bottom: 1px solid #dddddd;
    margin: 15px 0;
    &:last-child {
      border: none;
      margin: 15px 0 0 0;
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
    background: #fff;
    margin-top: 10px;
    padding: 20px;
    box-sizing: border-box;
  }
  .setting-footer {
    margin: 30px 0 0 0;
  }
}
</style>
