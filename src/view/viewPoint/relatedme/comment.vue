<!-- 评论我的 -->
<template>
  <div class="comment">
    <HeadTop ref="tophead"></HeadTop>
    <div class="comment-me">评论我的（共{{ total }}条）</div>
    <div class="com-content" v-if="total != 0">
      <div class="every-con" v-for="(item, index) in dataList" :key="index">
        <div class="info">
          <el-row>
            <el-col :span="1" class="card-avatar">
              <div @click="toUser(item.replyUserId)">
                <el-avatar class="avatar" :size="40" :src="item.replyImg" style="cursor: pointer"></el-avatar>
              </div>
            </el-col>
            <el-col :span="19" class="card-info">
              <div class="info-name">{{ item.replyName }}</div>
              <div class="info-num">
                <span
                  ><span v-if="item.replyTime != 0">{{ item.replyTime }}</span
                  >&nbsp;&nbsp;<span v-if="item.replyTimeType != 'day'">{{ item.replyTimeType }}</span></span
                >
              </div>
            </el-col>
            <el-col :span="4" class="info-replay">
              <div @click="onReplay(index)" v-if="!item.show && !item.delete">
                回复
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="comment-replay" v-if="item.beReplyName">
          <div style="word-break: break-all; word-wrap: break-word">
            <span class="reply-left">回复{{ item.beReplyName }}：</span>
            <span>{{ item.replyComment }}</span>
          </div>
          <div style="word-break: break-all; word-wrap: break-word">
            <span class="reply-left" @click="toBeRepplay(item.beReplyUserId)" style="cursor: pointer"> {{ item.beReplyName }}： </span>
            <span>{{ item.beReplyContent }}</span>
          </div>
        </div>
        <div class="comment-detail" v-if="!item.beReplyName" style="word-break: break-all; word-wrap: break-word">
          {{ item.replyComment }}
        </div>
        <div class="text-con">
          <div class="text-img" @click="toBeRepplay(item.userId)">
            <el-avatar class="avatar" :size="58" :src="item.invitationUserImg"></el-avatar>
          </div>
          <div class="con-text">
            <div class="con-box">
              <div class="my-info">@{{ item.invitationUserName }}</div>
              <div class="my-text" @click="pointDetail(item.invitationId)">
                {{ item.invitationContent }}
              </div>
            </div>
          </div>
        </div>
        <div class="text-box" v-if="item.show">
          <el-row>
            <el-col :span="1">
              <div class="box-left">回复</div>
            </el-col>
            <el-col :span="23">
              <div class="box-right">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  placeholder="请输入回复内容"
                  v-model="textarea"
                  maxlength="150"
                ></el-input>
              </div>
            </el-col>
          </el-row>
          <div class="replay-btn">
            <el-button type="info" @click="cancel(index)">取消</el-button>
            <el-button type="warning" @click="onSubmit(item.invitationId, item.id, index)">发送</el-button>
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
import { get_my_reply, get_reply_comment } from './server';
import Vue from 'vue';
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
      pageNumber: 1,
      dataList: []
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    onReplay(indx) {
      this.dataList.map(item => {
        item.show = false;
      });
      Vue.set(this.dataList[indx], 'show', true);
      //
    },
    cancel(indx) {
      this.textarea = '';
      Vue.set(this.dataList[indx], 'show', false);
    },
    onSubmit(invId, comId, indx) {
      if (!this.textarea) {
        this.$message.error('请输入回复内容');
        return;
      }
      this.toReplay(invId, comId, indx);
      this.textarea = '';
      this.getMyreplay();
    },
    toBeRepplay(a) {
      let userId = localStorage.getItem('userId');
      if (a == userId) {
        this.$router.push({ path: '/app/viewpoint' });
      } else {
        this.$router.push({ path: '/app/otherpoint', query: { userId: a } });
      }
    },
    toUser(a) {
      //
      this.$router.push({ path: '/app/otherpoint', query: { userId: a } });
    },
    pointDetail(a) {
      this.$router.push({ path: '/app/viewdetail', query: { id: a } });
    },
    async toReplay(invId, comId, indx) {
      try {
        let param = {
          beReplyId: comId,
          invitationId: invId,
          replyComment: this.textarea
        };
        let res = await get_reply_comment(param);
        this.$message.success(res.msg);
        Vue.set(this.dataList[indx], 'show', false);
      } catch (error) {
        // console.error(error)
      }
    },
    handleSizeChange(val) {
      // 一页显示多少条
      this.currentPage = 1;
      this.pageNumber = 1;
      this.pageSize = val;
      this.getMyreplay();
    },
    handleCurrentChange(val) {
      // 页码改变时
      this.pageNumber = val;
      this.currentPage = val;
      this.getMyreplay();
    },
    async getMyreplay() {
      try {
        let param = {
          pageSize: this.pageSize,
          pageNumber: this.pageNumber,
          replyType: 1
        };
        let res = await get_my_reply(param);
        // this.dataList = res.data.rows
        let arrNew = [];
        res.data.rows.map(item => {
          arrNew.push(Object.assign({}, item, { show: false }));
        });
        this.dataList = arrNew;
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
    height: 100vh;
    overflow: auto;

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

        .info-replay {
          height: 40px;
          font-size: 14px;
          font-weight: 400;
          color: rgba(47, 84, 235, 1);
          line-height: 60px;
          text-align: right;
          cursor: pointer;
        }
      }

      .comment-replay {
        margin-bottom: 8px;
        font-size: 14px;

        font-weight: 400;
        color: rgba(21, 31, 52, 1);
        line-height: 24px;

        .reply-left {
          color: rgba(47, 84, 235, 1);
          margin-right: 10px;
        }
      }

      .text-box {
        margin-top: 10px;

        .replay-btn {
          text-align: right;
          margin-top: 6px;
        }

        .box-left {
          width: 40px;
          height: 20px;
          font-size: 14px;
          font-weight: 400;
          color: rgba(21, 31, 52, 1);
          line-height: 20px;
          text-align: center;
        }

        .box-right {
          margin-left: 16px;
        }
      }

      .comment-detail {
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
