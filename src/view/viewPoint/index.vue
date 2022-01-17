<!--资金 模块 -->
<template>
  <div class="VIEW-wrap">
    <HeadTop ref="tophead"></HeadTop>
    <el-radio-group v-model="tabList" style="margin-bottom: 30px" @change="changTab">
      <el-radio-button label="has">已发布</el-radio-button>
      <el-radio-button label="nohas">待发布</el-radio-button>
    </el-radio-group>
    <div v-for="(item, index) in dataList" :key="item.id" :data-index="index" class="myspin">
      <span v-for="pic in item.picObjs" :key="pic.picId">
        <img :src="pic.url" />
      </span>
    </div>
    <div class="list">
      <div>
        <div class="spot" v-if="total > 0">
          <el-row class="box-card spot-card" v-for="(item, index) in dataList" :data-index="index" :key="item.id">
            <el-row>
              <el-col class="card-avatar" style="text-align: right; padding-right: 15px; width: 70px">
                <el-avatar class="avatar" :size="60" :src="item.userImg"></el-avatar>
              </el-col>
              <el-col :span="18" class="card-info">
                <div class="info-name">{{ item.userNickName }}</div>
                <!-- <div class="spot-time">{{item.createdOn | timeCulmulate}}</div> -->
                <div class="spot-time" v-if="item.postTime != '0' && item.postTimeDecribe != 'day'">
                  {{ item.postTime }}{{ item.postTimeDecribe }}
                </div>
                <div class="spot-time" v-else-if="item.postTimeDecribe == 'day'">
                  {{ item.postTime }}
                </div>
                <div class="spot-time" v-else>{{ item.postTimeDecribe }}</div>
                <!-- <div class="spot-time" v-if="onshow">{{item.updatedOn}}</div> -->
                <div class="spot-relative">
                  <div class="spot-content" :class="{ active: item.isShowMore }" :ref="item.id">
                    {{ item.content }}
                  </div>
                  <span class="isShow" v-if="item.isDescStatus" @click="item.isShowMore = !item.isShowMore">
                    {{ item.isShowMore ? '全文' : '收起' }}
                  </span>
                </div>
              </el-col>
              <el-col :span="4" class="card-btn spot-btn" style="text-align: right">
                <i class="el-icon-edit" v-if="onshow" @click="goPublishHand(item)"></i>
                <i class="el-icon-delete" @click="delInvitation(item.id, onshow)"></i>
                <!-- <div class="blue" v-if="!onshow" @click="godetail(item.id)">查看全文 ></div> -->
              </el-col>
            </el-row>
            <ul class="imgbox cf" v-if="item.picObjs != null">
              <li v-for="(pic, index2) in item.picObjs.slice(0, 5)" :key="pic.picId" @click="preview(item, index2)">
                <img :src="pic.url" />
                <!-- <img :src="pic.url" @click="onPreview(index,index2)"/> -->
              </li>
            </ul>
            <!-- <el-image-viewer
            v-if="showViewer"
            :on-close="closeViewer"
            :url-list="[bigUrl]" /> -->
            <div class="article" v-show="item.invitationType == '1'" @click="toArticle(item.id)">
              <div class="art-img">
                <img :src="item.articleImg" alt="" v-if="item.articleImg" />
                <img src="../../assets/images/noimg.png" alt="" v-else />
              </div>
              <div class="art-content">
                <p v-if="item.title" class="art-title">{{ item.title }}</p>
                <p v-else class="art-title">来自@{{ item.userNickName }}的看点</p>
                <!-- <p v-if="item.invitationSource" class="art-source">来源：{{item.invitationSource}}</p> -->
              </div>
            </div>
            <div class="work">
              <div>{{ item.invitationLabelNames }}</div>
              <div class="right">
                <span v-if="!onshow">
                  <i><img src="../../assets/images/view_share.png"/></i><span>分享 {{ item.sharedTimes }}</span>
                  <i @click="godetail(item.id)" style="cursor: pointer"><img src="../../assets/images/view_conment.png"/></i
                  ><span @click="godetail(item.id)" style="cursor: pointer"> 评论 {{ item.commentTimes }} </span>
                  <i><img src="../../assets/images/view_proud.png"/></i><span>赞 {{ item.numberOfPoints }}</span>
                </span>
                <span class="authority">
                  <label v-if="item.limitsOfAuthority == '6009-001'">公开</label>
                  <label v-if="item.limitsOfAuthority == '6009-002'">订阅</label>
                  <label v-if="item.limitsOfAuthority == '6009-003'">私密</label>
                </span>
              </div>
            </div>
          </el-row>
          <Pagation
            :layout="layout"
            :currentPage="currentPage"
            :total="total"
            :myPageSizes="pageSize"
            @handleSizeChange="handleSizeChange"
            @handleCurrentChange="handleCurrentChange"
          />
        </div>
        <div v-else class="nodata">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Vue from 'vue';
import HeadTop from './head/head';
import { getInvitationListPage, delInvitation, removeDraftInvitation, queryDraftInvitation } from './server';
import { mapState } from 'vuex';
// import { timeCulmulate} from "../../utils/index.js";
// import { state} from "@/store/modules/common.js";
// import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
export default {
  //import引入的组件需要注入到对象中才能使用，本人性格开朗，乐观，热情，与同事相处融洽，爱好看书，电影，打羽毛球。其他熟悉软件photoshop,AE,Premior Pro,3Dmax,micro Officec
  components: {
    // ElImageViewer,
    HeadTop
  },
  data() {
    //这里存放数据
    return {
      showViewer: false, // 显示查看器
      bigUrl: '',
      layout: 'prev, pager, next',
      onshow: false,
      tabList: 'has',
      tabData: ['已发布', '未发布'],
      activeItem: 'first',
      //   分页
      pageNo: 1,
      currentPage: 1,
      pageSize: 5,
      total: 0,
      dataList: [],
      srcList: ['https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg']
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      loginInfo: obj => {
        return obj.state.loginInfo;
      }
    })
  },
  //   filters: {
  //     timeCulmulate: function (date) {

  //         let nowTimes = new Date().getTime();
  //         let parTimes = new Date(date).getTime();
  //
  //         if(nowTimes-parTimes>=86400000){
  //             return date
  //         }else{
  //             let time = Number(((nowTimes - parTimes)/(1000*60*60)).toFixed(1))+ ''
  //             time=time.substring(0,time.indexOf("."))
  //             return (time +'小时前')
  //         }
  //     }
  //   },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    toArticle(a) {
      //   console.log(this.onshow)
      if (!this.onshow) {
        this.$router.push({
          path: `/app/articleDetail?id=${a}`
        });
      } else {
        return;
      }
    },
    preview(item, index) {
      let arry = [];
      for (let i in item.picObjs) {
        arry.push(item.picObjs[i].url);
      }

      this.$imagePreview({
        images: arry,
        index: index
      });
    },
    goPublishHand(item) {
      //   let picObjs = item.picObjs
      //   let arrImg = []
      //   picObjs.map(item => {
      //     arrImg.push({
      //         ...item,
      //         name:''
      //     })
      //   })
      let pararms = {
        invitationType: item.invitationType + '',
        limitsOfAuthority: item.limitsOfAuthority,
        invitationLabelIds: item.invitationLabelIds,
        title: item.title,
        content: item.content,
        articleImg: item.articleImg || '',
        articleContent: item.articleContent,
        //   img: arrImg,
        picShortObjs: item.picShortObjs,
        picObjs: item.picObjs,
        draftId: item.id,
        draftOperation: 0,
        invitationSource: item.invitationSource
      };
      localStorage.setItem('publish', JSON.stringify(pararms));
      //
      this.$router.push({
        path: '/app/publish',
        query: {
          type: 'edit'
        }
      });
    },
    godetail(a) {
      this.$router.push({ path: '/app/viewdetail', query: { id: a } });
    },
    delInvitation(id, onshow) {
      //删除已发布
      console.log(id);
      let aipname, pararms;
      if (onshow) {
        //
        aipname = removeDraftInvitation;
        pararms = {
          draftInvitationId: id
        };
      } else {
        aipname = delInvitation;
        pararms = {
          invitationId: id
        };
      }
      this.$confirm('确定要删除看点吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          aipname(pararms).then(res => {
            //
            if (res.code == '200') {
              this.$message.success(res.msg);
              this.pageNo = 1;
              this.currentPage = 1;
              if (onshow) {
                this.queryDraftInvitation();
              } else {
                this.getInvitationListPage();
              }
              this.$refs.tophead.comInit();
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    onPreview(i, j) {
      this.bigUrl = this.dataList[i].picObjs[j].url;
      this.showViewer = true;
    },
    // 关闭查看器
    closeViewer() {
      this.showViewer = false;
    },

    getInvitationListPage() {
      //已发布列表
      getInvitationListPage({
        pageNumber: this.pageNo,
        pageSize: this.pageSize,
        userInfoId: localStorage.getItem('userId')
      }).then(res => {
        if (res.code == '200') {
          this.dataList = res.data.rows;
          this.total = res.data.totalRow;
          this.$nextTick(() => {
            this.dataList.forEach(item => {
              let vHeight = this.$refs[`${item.id}`][0].offsetHeight;
              if (vHeight > 72) {
                Vue.set(item, 'isShowMore', true);
                Vue.set(item, 'isDescStatus', true);
              } else {
                Vue.set(item, 'isShowMore', false);
                Vue.set(item, 'isDescStatus', false);
              }
            });
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    queryDraftInvitation() {
      queryDraftInvitation({
        pageNumber: this.pageNo,
        pageSize: this.pageSize,
        userInfoId: localStorage.getItem('userId')
      }).then(res => {
        if (res.code == '200') {
          this.dataList = res.data.rows;
          this.total = res.data.totalRow;
          this.$nextTick(() => {
            this.dataList.forEach(item => {
              let vHeight = this.$refs[`${item.id}`][0].offsetHeight;
              // console.log(vHeight,888)
              if (vHeight > 72) {
                // item.isShowMore = true
                // item.isDescStatus = true
                Vue.set(item, 'isShowMore', true);
                Vue.set(item, 'isDescStatus', true);
              } else {
                // item.isShowMore = false
                // item.isDescStatus = false
                Vue.set(item, 'isShowMore', false);
                Vue.set(item, 'isDescStatus', false);
              }
            });
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    changTab(a) {
      this.currentPage = 1;
      this.pageNo = 1;
      this.pageSize = 5;
      if (a == 'has') {
        this.onshow = false;
        this.getInvitationListPage();
      } else {
        this.onshow = true;
        this.queryDraftInvitation();
      }
    },
    handleSizeChange(val) {
      this.currentPage = 1;
      this.pageNo = 1;
      this.pageSize = val;
      if (!this.onshow) {
        this.getInvitationListPage();
      } else {
        this.queryDraftInvitation();
      }
    },
    handleCurrentChange(val) {
      this.pageNo = val;
      this.currentPage = val;
      if (!this.onshow) {
        this.getInvitationListPage();
      } else {
        this.queryDraftInvitation();
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.$refs.tophead.comInit();
    if (this.$route.query.type) {
      this.tabList = 'nohas';
      this.onshow = true;
      this.$nextTick(function() {
        this.queryDraftInvitation();
      });
    } else {
      this.getInvitationListPage();
    }
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
.nodata {
  margin: 30px 0;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.imgbox {
  margin: 20px;

  li {
    float: left;
    padding: 0 12px;

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

.el-icon-delete {
  padding-left: 10px;
  cursor: pointer;
}

.work {
  margin-top: 5px;
  display: flex;
  font-size: 13px;
  color: #999;

  div {
    flex: 1;

    &.right {
      text-align: right;
      color: #444;

      .authority {
        padding-left: 30px;
        color: #999;
      }
    }
  }

  span {
    padding-right: 10px;
  }

  span,
  img {
    vertical-align: middle;

    padding-left: 5px;
  }
}

.spot-relative {
  font-size: 14px;
  cursor: pointer;
  position: relative;

  .isShow {
    position: absolute;
    bottom: 4px;
    right: -30px;
    color: #2f54eb;
    background: #fff;
    padding-left: 10px;
    cursor: pointer;
  }
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
      font-size: 14px;

      font-weight: 400;
      color: #151f34;
      line-height: 24px;
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
      position: relative;
      word-break: break-all;
      word-wrap: break-word;
    }

    .active {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
    }
  }

  .card-btn {
    height: 100%;
    line-height: 88px;
  }
}

.myspin {
  display: none;

  img {
    width: 50px;
    height: 50px;
  }
}
</style>
