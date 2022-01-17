<!-- 评论我的 -->
<template>
  <div class="comment">
    <HeadTop ref="tophead"></HeadTop>
    <div class="comment-me">点赞我的（共{{ total }}条）</div>
    <div class="com-content" v-if="total != 0">
      <div class="every-con" v-for="(item, index) in dataList" :key="index">
        <div class="info">
          <el-row>
            <el-col :span="1" class="card-avatar">
              <div @click="toUser(item.pointUserId)" style="cursor: pointer">
                <el-avatar class="avatar" :size="40" :src="item.pointHeadImg"></el-avatar>
              </div>
            </el-col>
            <el-col :span="23" class="card-info">
              <div class="info-name">{{ item.pointNickname }}</div>
              <div class="info-num">
                <span
                  ><span v-if="item.pointTime != 0">{{ item.pointTime }}</span>
                  &nbsp;&nbsp;
                  <span v-if="item.pointTimeType != 'day'">{{ item.pointTimeType }}</span></span
                >
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="comment-detail">赞了你的帖子</div>
        <div class="text-con">
          <div class="text-img" @click="toUser(item.sendInvUserId)">
            <el-avatar class="avatar" :size="58" :src="item.sendInvUserHeadImg"></el-avatar>
          </div>
          <div class="con-text">
            <div class="con-box">
              <div class="my-info">@{{ item.sendInvUserNickname }}</div>
              <div class="my-text" @click="pointDetail(item.invitationId)">
                {{ item.invitationContent }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Pagation
        :layout="layout"
        :currentPage="currentPage"
        :total="total"
        :myPageSizes="pageSize"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </div>
    <div class="com-nocontent" v-else>
      <div class="no-box">
        <img src="../../../assets/images/web.png" alt="error" />
        <p>{{ $t('Universal_0174') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { get_point_thumbsup } from './server';
import HeadTop from '../head/head';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    HeadTop
  },
  data() {
    //这里存放数据
    return {
      textarea: '',
      clickCom: false,
      layout: 'prev, pager, next',
      total: 0,
      currentPage: 1,
      pageSize: 10,
      pageNum: 1,
      dataList: []
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    handleSizeChange(val) {
      // 一页显示多少条
      this.currentPage = 1;
      this.pageNum = 1;
      this.pageSize = val;
      this.getMyreplay();
    },
    handleCurrentChange(val) {
      // 页码改变时
      this.pageNum = val;
      this.currentPage = val;
      this.getMyreplay();
    },
    toUser(a) {
      let userId = localStorage.getItem('userId');
      if (a == userId) {
        this.$router.push({ path: '/app/viewpoint' });
      } else {
        this.$router.push({ path: '/app/otherpoint', query: { userId: a } });
      }
    },
    // 跳转详情
    pointDetail(a) {
      this.$router.push({ path: '/app/viewdetail', query: { id: a } });
    },
    async getMyreplay() {
      try {
        let param = {
          pageSize: this.pageSize,
          pageNum: this.pageNum
        };
        let res = await get_point_thumbsup(param);
        this.dataList = res.data.rows;
        this.total = res.data.totalRow;
        //
      } catch (error) {
        // console.error(error)
      }
    },
    init() {
      this.getMyreplay();
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.init();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.$refs.tophead.comInit();
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
<style lang="less" scoped>
//@import url(); 引入公共css类
.comment {
  box-sizing: border-box;
  .comment-me {
    height: 22px;
    font-size: 16px;
    font-weight: 400;
    color: rgba(21, 31, 52, 1);
    line-height: 22px;
    margin-bottom: 10px;
  }
  .com-content {
    .every-con {
      margin: 20px 0px;
      .info {
        margin: 3px 0;
        .card-avatar {
          height: 100%;
          .avatar {
            margin: 14px 0;
          }
        }
        .card-info {
          height: 100%;
          text-align: left;
          padding: 0 0 0 16px;
          .info-name {
            height: 20px;
            font-size: 14px;
            font-weight: 400;
            color: rgba(21, 31, 52, 1);
            line-height: 20px;
          }
          .info-num {
            height: 17px;
            font-size: 12px;
            font-weight: 400;
            color: rgba(146, 151, 163, 1);
            line-height: 17px;
          }
        }
      }
      .comment-detail {
        height: 30px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(21, 31, 52, 1);
        line-height: 30px;
      }
      .text-con {
        box-sizing: border-box;
        padding: 0 8px;
        display: flex;
        background: rgb(235, 237, 241);
        .text-img {
          cursor: pointer;
          .avatar {
            margin: 10px 0px;
          }
        }
        .con-text {
          box-sizing: border-box;
          padding: 4px 0px;
          .con-box {
            box-sizing: border-box;
            padding-left: 20px;
            .my-info {
              height: 24px;
              font-size: 14px;
              font-weight: 400;
              color: rgba(21, 31, 52, 1);
              line-height: 24px;
            }
            .my-text {
              cursor: pointer;
              font-size: 14px;
              line-height: 20px;
              font-weight: 400;
              color: rgba(21, 31, 52, 1);
              word-break: break-all;
              word-wrap: break-word;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
          }
        }
      }
    }
  }
  .com-nocontent {
    text-align: center;
    .no-box {
      margin-top: 100px;
    }
  }
}
</style>
