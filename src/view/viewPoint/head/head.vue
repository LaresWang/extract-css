<!--  -->
<template>
  <div class="tophead">
    <el-row :gutter="20">
      <el-col :span="11" :offset="5" align="right">
        <div class="sumlist-L">
          <el-badge :is-dot="!commentFlag" class="item"><span @click="goUrl(1)">评论我的</span></el-badge>
          <el-badge :is-dot="!sharedFlag" class="item"><span @click="goUrl(2)">分享我的</span></el-badge>
          <el-badge :is-dot="!pointFlag" class="item"><span @click="goUrl(3)">点赞我的</span></el-badge>
          <el-button type="primary" @click="goPublishHand()">发布看点</el-button>
        </div>
      </el-col>
      <el-col :span="8">
        <ul class="sumlist-R">
          <li>
            <span>{{ focusObj.attention }}</span>
            <p>关注</p>
          </li>
          <li>
            <span>{{ focusObj.beAttention }}</span>
            <p>粉丝</p>
          </li>
          <li>
            <span>{{ total }}</span>
            <p>看点</p>
          </li>
        </ul>
      </el-col>
    </el-row>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { findNoticeFlag, focusCount, myInvitationCount } from '../server';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      total: 0,
      sharedFlag: true,
      commentFlag: true,
      pointFlag: true,
      focusObj: {
        beAttention: '0',
        attention: '0',
        invitationCount: '0'
      }
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    myInvitationCount() {
      myInvitationCount({
        userId: localStorage.getItem('userId')
      }).then(res => {
        if (res.code == '200') {
          this.total = res.data;
        }
      });
    },
    goUrl(a) {
      switch (a) {
      case 1:
        this.$router.push({ path: '/app/comment' });
        break;
      case 2:
        this.$router.push({ path: '/app/share' });
        break;
      case 3:
        this.$router.push({ path: '/app/thumbsup' });
        break;
      }
    },
    comInit() {
      this.findNoticeFlag();
      this.focusCount();
      this.myInvitationCount();
    },
    focusCount() {
      focusCount({}).then(res => {
        if (res.code == '200') {
          if (res.data != null) {
            this.focusObj = res.data;
          }
        }
      });
    },
    findNoticeFlag() {
      findNoticeFlag({}).then(res => {
        if (res.code == '200') {
          if (res.data != null) {
            this.sharedFlag = res.data.sharedFlag;
            this.commentFlag = res.data.commentFlag;
            this.pointFlag = res.data.pointFlag;
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    goPublishHand() {
      this.$router.push({ path: '/app/publish' });
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
.tophead {
  background: #fff;
  font-size: 14px;
  margin-bottom: 20px;
  .el-badge {
    margin-left: 35px;
    cursor: pointer;
  }
}
.sumlist-L {
  margin-top: 25px;
  span {
    cursor: pointer;
    label {
      font-size: 12px;
      color: #666;
    }
  }
  button {
    background: #f57d00;
    border: #f57d00;
    padding: 12px 30px;
    margin-left: 35px;
  }
}
.sumlist-R {
  background: #f7f7fa;
  padding: 25px 15px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  li {
    flex: 1;
    border-right: #2d53eb solid 1px;
    padding: 0 25px;
    text-align: center;
    p {
      margin-top: 5px;
    }
    &:last-child {
      border: 0;
    }
  }
}
</style>
