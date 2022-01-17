<!--  -->
<template>
  <div class="VIEW-wrap">
    <div style="text-align: right; color: #2f54eb; cursor: pointer" @click="goback()">
      返回
    </div>
    <div v-if="detailObj.content">
      <div v-for="item in detailObj.picObjs" :key="item.id" class="myspin">
        <img :src="item.url" />
      </div>
      <div class="list">
        <div>
          <div class="spot">
            <el-row class="box-card spot-card">
              <el-col class="card-avatar" style="text-align: right; padding-right: 15px; width: 70px">
                <div @click="gotoself(detailObj.userId)" class="pointer">
                  <el-avatar class="avatar" :size="60" :src="detailObj.userImg"></el-avatar>
                </div>
              </el-col>
              <el-col :span="22" class="card-info">
                <div class="info-name">{{ detailObj.userNickName }}</div>
                <div class="spot-time">
                  {{ detailObj.createdOn | timeCulmulate }}
                </div>
                <div class="spot-content">{{ detailObj.content }}</div>
              </el-col>
              <div class="clear"></div>
              <ul class="imgbox">
                <li v-for="(item, index) in detailObj.picObjs" :key="item.picId" @click="preview(index)">
                  <img :src="item.url" />
                </li>
              </ul>
              <div style="clear: both"></div>
              <div class="article" v-show="detailObj.invitationType == '1'" @click="toArticle(detailObj.id)">
                <div class="art-img">
                  <img :src="detailObj.articleImg" alt="" v-if="detailObj.articleImg" />
                  <img src="../../../assets/images/noimg.png" alt="" v-else />
                </div>
                <div class="art-content">
                  <p v-if="detailObj.title" class="art-title">
                    {{ detailObj.title }}
                  </p>
                  <p v-else class="art-title">来自@{{ detailObj.userNickName }}的看点</p>
                  <p v-if="detailObj.invitationSource" class="art-source">来源：{{ detailObj.invitationSource }}</p>
                </div>
              </div>
              <div class="work">
                <i><img src="../../../assets/images/view_share.png"/></i><span>分享 {{ detailObj.sharedTimes }}</span>
                <i><img src="../../../assets/images/view_conment.png"/></i><span>评论 {{ detailObj.commentTimes }} </span>
                <i><img src="../../../assets/images/view_proud.png"/></i><span>赞 {{ detailObj.numberOfPoints }}</span>
              </div>
            </el-row>
          </div>
        </div>
      </div>
      <div class="comment">
        <div class="comment-me">全部评论（共{{ totalRow }}条）</div>
        <div class="com-content">
          <div class="every-con" v-for="(item, index) in dataList" :key="index">
            <div class="info">
              <el-row class="liston">
                <el-col :span="1" class="card-avatar">
                  <div @click="gotoself(item.replyUserId)" class="pointer">
                    <el-avatar class="avatar" :size="40" :src="item.replyImg"></el-avatar>
                  </div>
                </el-col>
                <el-col :span="2" class="card-info">
                  <div class="info-name">{{ item.replyName }}</div>
                  <div class="info-num">
                    <span v-if="item.replyTime != 0">{{ item.replyTime }}</span
                    ><span v-if="item.replyTimeType != 'day'">{{ item.replyTimeType }}</span>
                  </div>
                </el-col>
                <el-col :span="17">
                  <div class="comment-replay">
                    <span class="reply-left">
                      <label class="pointer" v-if="item.beReplyName" @click="gotoself(item.beReplyUserId)">
                        回复{{ item.beReplyName }} </label
                      >：</span
                    >{{ item.replyComment }}
                  </div>
                </el-col>
                <el-col :span="4" class="info-replay">
                  <div @click="onReplay(index)" v-show="!item.show && item.replyUserId != myUserId">
                    回复
                  </div>
                </el-col>
              </el-row>
            </div>
            <div class="text-box" v-show="item.show">
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
                      maxlength="150"
                      v-model="textarea"
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
          <p class="more" v-if="totalRow > pageSize" @click="lookMore()">
            查看更多>
          </p>
          <p class="more" v-else></p>
          <p class="shengming">
            免责声明：行情分享，观点仅代表来源，不构成任何投资理财建议
          </p>
        </div>
      </div>
    </div>
    <div v-else style="margin: 80px 0; text-align: center">看点已删除</div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { getAllReply, getDetailContent } from '../server';
import { get_reply_comment } from '../relatedme/server';
import Vue from 'vue';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      myUserId: '',
      dataList: [],
      textarea: '',
      detailObj: {
        content: ''
      },
      totalRow: '',
      pageSize: 10
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    toArticle(a) {
      this.$router.push({
        path: `/app/articleDetail?id=${a}`
      });
    },
    goback() {
      //  this.$router.go(-1)
      this.$router.back();
    },
    gotoself(userId) {
      if (userId == localStorage.getItem('userId')) {
        this.$router.push({
          path: 'viewpoint'
        });
      } else {
        this.$router.push({
          path: 'otherpoint',
          query: { userId: userId }
        });
      }
    },
    onSubmit(invId, comId, indx) {
      // async onSubmit(invId, comId,indx) {
      if (!this.textarea) {
        this.$message.error('请输入回复内容');
        return;
      }
      // this.toReplay(invId, comId,indx)
      // this.getAllReply()

      this.toReplay(invId, comId, indx);
      //  await this.getAllReply();
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
        this.textarea = [];
        this.getDetailContent();
        this.getAllReply();
      } catch (error) {
        console.error(error);
      }
    },
    onReplay(indx) {
      //
      this.dataList.map(item => {
        item.show = false;
      });
      Vue.set(this.dataList[indx], 'show', true);
    },
    cancel(indx) {
      this.textarea = [];
      Vue.set(this.dataList[indx], 'show', false);
    },
    preview(index) {
      let arry = [];
      for (let i in this.detailObj.picObjs) {
        arry.push(this.detailObj.picObjs[i].url);
      }

      this.$imagePreview({
        images: arry,
        index: index
      });
    },
    getDetailContent() {
      getDetailContent(
        {
          id: this.$route.query.id
        },
        {}
      ).then(res => {
        if (res.code == '200' && res.data.length > 0) {
          this.detailObj = res.data[0];
          console.log(this.detailObj);
        } else if (res.code != '200') {
          this.$message.error(res.msg);
        }
      });
    },
    lookMore() {
      this.pageSize += 10;
      this.getAllReply();
    },
    getAllReply() {
      getAllReply({
        pageNumber: 1,
        pageSize: this.pageSize,
        invitationId: this.$route.query.id
      }).then(res => {
        if (res.code == '200') {
          // this.dataList = res.data.rows
          //  this.dataList.map((item) => {
          //     item.show = false;
          //  });
          let arrNew = [];
          res.data.rows.map(item => {
            arrNew.push(Object.assign({}, item, { show: false }));
          });
          this.dataList = arrNew;

          this.totalRow = res.data.totalRow;
        } else {
          this.$message.error(res.msg);
        }
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.getDetailContent();
    this.getAllReply();
    this.myUserId = localStorage.getItem('userId');
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
.shengming {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin: 50px 0 20px;
}

.more {
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  color: #2f54eb;
}

.myspin {
  display: none;
}

.liston {
  margin: 20px 0;
  padding-bottom: 10px;
  border-bottom: #eee solid 1px;
}

.clear {
  clear: both;
}

.imgbox {
  margin: 10px;

  li {
    padding: 0 20px;
    float: left;
    text-align: left;

    img {
      width: 170px;
      height: 110px;
      cursor: pointer;
    }
  }
}

.article {
  box-sizing: border-box;
  padding: 10px 20px;
  background: #f7f7fa;
  display: flex;

  .art-img {
    img {
      width: 204px;
      max-height: 150px;
    }
  }

  .art-content {
    flex: 1;
    margin-left: 20px;

    .art-title {
      font-size: 18px;

      font-weight: 400;
      color: rgba(21, 31, 52, 1);
      line-height: 24px;
      margin-bottom: 10px;
    }

    .art-source {
      font-size: 14px;

      font-weight: 400;
      color: rgba(146, 151, 163, 1);
      line-height: 17px;
    }
  }
}

.work {
  text-align: right;
  color: #666;
  margin-top: 5px;

  span {
    padding-right: 10px;
  }

  span,
  img {
    vertical-align: middle;
    font-size: 13px;
    padding-left: 5px;
  }
}

.blue {
  color: #5882f4;
  font-size: 14px;
  cursor: pointer;
}

.box-card {
  width: 100%;
  background: #fff;
  border-bottom: #e7e7e7 solid 1px;
  padding: 0 10px 10px;
  margin: 20px 0;

  .card-avatar {
    height: 100%;

    .avatar {
      margin: 14px 0;
    }
  }

  .card-info {
    height: 100%;
    text-align: left;
    padding: 20px 0;

    .info-name {
      overflow: hidden;
      word-break: break-all;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      font-size: 14px;

      font-weight: 400;
      color: #151f34;
      line-height: 20px;
    }

    .info-num,
    .spot-time {
      font-size: 12px;

      font-weight: 400;
      color: #9297a3;
      line-height: 22px;
    }

    .spot-time {
      line-height: 26px;
    }

    .group-name {
      font-size: 14px;

      font-weight: 400;
      color: #151f34;
      line-height: 20px;
    }

    .group-num,
    .group-member {
      font-size: 12px;

      font-weight: 400;
      color: #9297a3;
      line-height: 18px;
    }

    .spot-content {
      margin-top: 10px;
      color: #151f34;
      font-size: 14px;
      line-height: 24px;
      word-break: break-all;
    }
  }

  .card-btn {
    height: 100%;
    line-height: 88px;
  }
}

.comment {
  box-sizing: border-box;
  padding: 30px;

  .comment-me {
    height: 22px;
    font-size: 16px;
    font-weight: 400;
    color: rgba(21, 31, 52, 1);
    line-height: 22px;
    margin-bottom: 30px;
  }

  .com-content {
    .every-con {
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
            line-height: 20px;
            overflow: hidden;
            word-break: break-all;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            font-size: 14px;
            font-weight: 400;
            color: rgba(21, 31, 52, 1);
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
        word-break: break-all;
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
        height: 30px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(21, 31, 52, 1);
        line-height: 30px;
      }

      .text-con {
        display: flex;

        .text-img {
          .avatar {
            margin: 10px 0;
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
              font-size: 14px;
              line-height: 20px;
              font-weight: 400;
              color: rgba(21, 31, 52, 1);
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
}
</style>
