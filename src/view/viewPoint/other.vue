<!--资金 模块 -->
<template>
  <div class="VIEW-wrap">
    <div class="tophead">
      <el-row :gutter="20">
        <el-col :span="11" :offset="5" align="right">
          <div class="sumlist-L">
            <el-button type="primary" v-if="focusObj.interrelation" @click="focus(0)">取消关注</el-button>
            <el-button type="primary" v-else @click="focus(1)">关注</el-button>
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

    <div v-for="(item, index) in dataList" :key="item.id" :data-index="index" class="myspin">
      <span v-for="pic in item.picObjs" :key="pic.picId">
        <img :src="pic.url" />
      </span>
    </div>
    <div class="list">
      <div>
        <div class="spot" v-if="total > 0">
          <el-row class="box-card spot-card" v-for="(item, index) in dataList" :data-index="index" :key="item.id">
            <el-col class="card-avatar" style="text-align: right; padding-right: 15px; width: 70px">
              <el-avatar class="avatar" :size="60" :src="item.userImg"></el-avatar>
            </el-col>
            <el-col :span="18" class="card-info">
              <div class="info-name">{{ item.userNickName }}</div>
              <div class="spot-time">{{ item.createdOn }}</div>
              <div class="spot-content">{{ item.content }}</div>
            </el-col>
            <el-col :span="4" class="card-btn spot-btn" style="text-align: right">
              <div class="blue" @click="godetail(item.id)">查看全文 ></div>
            </el-col>
            <el-row> </el-row>
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
            <div class="work">
              <div>{{ item.invitationLabelNames }}</div>
              <div class="right">
                <i><img src="../../assets/images/view_share.png"/></i><span>分享 {{ item.sharedTimes }}</span>
                <i><img src="../../assets/images/view_conment.png"/></i><span>评论 {{ item.commentTimes }} </span>
                <i><img src="../../assets/images/view_proud.png"/></i><span>赞 {{ item.numberOfPoints }}</span>
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

import { getInvitationListPage, focusCount, focusUser } from './server';
// import { state} from "@/store/modules/common.js";
// import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    // ElImageViewer,
    // HeadTop
  },
  data() {
    //这里存放数据
    return {
      focusObj: {
        interration: false,
        beAttention: '0',
        attention: '0',
        invitationCount: '0'
      },
      focusFlag: true,
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
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    focus(a) {
      focusUser({
        focusStatus: a, //1是关注  0是 取消关注
        focusUserId: this.$route.query.userId
      }).then(res => {
        if (res.code == '200') {
          this.$message.success(res.msg);
          this.focusCount();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    focusCount() {
      //关注数和粉丝数
      focusCount({
        sysUserId: this.$route.query.userId
      }).then(res => {
        if (res.code == '200') {
          if (res.data != null) {
            this.focusObj = res.data;
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    // myInvitationCount(){ //获取看法数
    //         myInvitationCount({
    //             userId:this.$route.query.userId
    //         }).then(res=>{
    //             if(res.code == '200'){
    //                     this.total = res.data
    //             }
    //         })
    // },
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

    godetail(a) {
      this.$router.push({ path: '/app/viewdetail', query: { id: a } });
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
        userInfoId: this.$route.query.userId
      }).then(res => {
        if (res.code == '200') {
          this.dataList = res.data.rows;
          this.total = res.data.totalRow;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleSizeChange(val) {
      this.currentPage = 1;
      this.pageNo = 1;
      this.pageSize = val;
      this.getInvitationListPage();
    },
    handleCurrentChange(val) {
      this.pageNo = val;
      this.currentPage = val;
      this.getInvitationListPage();
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getInvitationListPage();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.focusCount();
    //   this.myInvitationCount()
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
    padding: 0 20px;

    img {
      width: 170px;
      height: 110px;
      cursor: pointer;
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
      overflow: hidden;
      word-break: break-all;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
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
