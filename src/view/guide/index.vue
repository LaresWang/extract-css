<!--  -->
<template>
  <div class="homepage">
    <div class="top">
      <i>
        <img src="../../assets/images/guide_welcome.png" />
      </i>
      欢迎回来，尊敬的 {{ userInfo.nickName }}
      <p>
        在我们的帮助之下，您可以借助DIDI平台推广你的团队和产品，维系你的客户资源，管理你的团队。我们为您精心挑选了一些常用功能，你可以在这里快速进行管理。
      </p>
    </div>
    <div class="mid">
      <div class="panel" @click="goWalletHand()">
        <el-row align="middle">
          <el-col :span="2">
            <img src="../../assets/images/guide_cash.png" />
          </el-col>
          <el-col :span="21" class="centerbox">
            <p>
              把你的资金接入DIDI平台，并利用它进行最大化的营销活动
              <br />
            </p>
            <span>在你可以随时控制和监控你的资金使用情况</span>
          </el-col>
          <el-col :span="1">
            <img src="../../assets/images/guide_rightArrow.png" style="margin-top: 20px" />
          </el-col>
        </el-row>
      </div>
      <p class="tip">
        利用DIDI的团队营销工具，你可以针对整个平台进行资金空投、发红包以及在一些用户容易触达的位置对你的产品和团队进行宣传。
      </p>
      <ul class="quikHref">
        <li @click="goMessageHand()">
          <div>安全聊天</div>
          <p>
            每个人都拥有基本的隐私权，这也是DiDi的核心价值观之一。未经您许可的任何人都无法阅读您的消息，包括DiDi。
          </p>
        </li>
        <li @click="goContactPersonHand()">
          <div>创建您的社群</div>
          <p>
            邀请朋友或同事加入社群，并进行语音或视频聊天或直播。你能够进行有关的小组讨论工作或电影，或找点乐子。
          </p>
        </li>
        <li @click="goViewPointHand()">
          <div>发布看点</div>
          <p>以文字、图片、视频等多媒体形式，实现信息的即时分享、传播互动</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapState } from 'vuex';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      activeItem: 'first'
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      userInfo: obj => {
        return obj.state.userInfo;
      }
    })
  },

  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    //跳转至资产
    goWalletHand() {
      this.$router.push({
        path: '/app/funds/general/wallet'
      });
    },
    //跳转至看法
    goViewPointHand() {
      this.$router.push({
        path: '/app/viewpoint'
      });
    },
    //跳转至联系人
    goContactPersonHand() {
      this.$router.push({
        path: '/app/contact'
      });
    },
    //跳转至消息
    goMessageHand() {
      this.$router.push({
        path: '/app/chat'
      });
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
.homepage {
  padding: 20px 0;
  text-align: left;

  .top {
    border-bottom: #ddd solid 1px;
    line-height: 28px;

    p {
      line-height: 28px;
      margin: 10px 0 0 0;
      padding-bottom: 10px;
      color: #9297a3;
      font-size: 0.8rem;
    }
  }

  .mid {
    padding: 40px 0;

    .panel {
      padding: 30px;
      border-radius: 10px;
      -moz-box-shadow: 4px 4px 12px 4px rgba(20%, 20%, 40%, 0.5);
      -webkit-box-shadow: 4px 4px 12px 4px rgba(20%, 20%, 40%, 0.5);
      box-shadow: 4px 4px 12px 4px rgba(20%, 20%, 40%, 0.5);

      .centerbox {
        padding-left: 20px;

        p {
          margin: 10px 0;
        }

        span {
          color: #9297a3;
          font-size: 0.8rem;
        }
      }
    }

    .tip {
      margin: 50px 0 30px;
      font-size: 1rem;
    }

    .quikHref {
      margin: 10px 0;
      display: flex;

      li {
        flex: 1;
        margin: 0 20px;
        background: linear-gradient(to top, #ffffff, #fce7cc);
        padding: 30px 20px;
        border-radius: 10px;
        box-shadow: 4px 4px 12px 1px rgba(20%, 20%, 40%, 0.5);

        &:nth-child(2) {
          background: linear-gradient(to top, #ffffff, #d8defe);
        }

        &:nth-child(3) {
          background: linear-gradient(to top, #ffffff, #f8d5d7);
        }

        div {
          text-align: center;
          font-weight: 700;
          margin-bottom: 25px;
        }

        p {
          line-height: 28px;
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>
