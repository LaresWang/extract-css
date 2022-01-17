<!-- 发布看法 -->
<template>
  <div class="publish-wrap" v-loading.fullscreen.lock="fullscreenLoading">
    <!-- <div class="publish-title">发布看法</div> -->
    <div class="publish-type flex">
      <div class="publish-left">有什么看点想告诉大家?</div>
      <ul>
        <li>
          类型
          <el-select v-model="form.invitationType" placeholder="请选择">
            <el-option v-for="item in view_type" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </li>
        <li>
          权限
          <el-select v-model="form.limitsOfAuthority" placeholder="请选择">
            <el-option v-for="item in power_type" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </li>
        <li>
          选择标签
          <el-select v-model="form.invitationLabelIds" :multiple-limit="3" multiple placeholder="请选择">
            <el-option v-for="item in labelArr" :key="item.id" :label="item.labelContent" :value="item.id"></el-option>
          </el-select>
        </li>
      </ul>
    </div>
    <div>
      <!-- 看点 -->
      <ViewPage ref="ViewPage" :ruleForm="form" @publishHand="publishHand" @saveHand="saveHand" v-show="form.invitationType == '0'" />
      <!-- // 文章 -->
      <Article v-show="!(form.invitationType == '0')" :ruleForm="form" @publishHand="publishHand" @saveHand="saveHand" />
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import ViewPage from './View';
import Article from './Article';

import { view_type, power_type } from '@/utils/const';

import { getAllLabelInfo, saveDraftInvitation, pcAddOrUpdateInvitation } from './server';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    ViewPage,
    Article
  },
  data() {
    //这里存放数据
    return {
      fullscreenLoading: false,
      textType: '类型',
      value: '1',
      view_type: view_type,
      power_type,
      valuePower: '1',
      value_label: '',
      form: {
        invitationType: '0',
        limitsOfAuthority: '6009-001',
        invitationLabelIds: [],
        invitationLabelNames: [],
        origin: '6013-0002',
        draftOperation: 0,
        invitationSource: '原创'
      },
      labelArr: [],
      show: true
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    publishHand(val) {
      // 发布保存
      this.changeLabelArrHand();
      let pararms = {
        ...this.form,
        ...val,
        invitationLabelIds: this.form.invitationLabelIds.join(','),
        invitationLabelNames: this.form.invitationLabelNames.join(',')
      };
      if (this.$route.query.type && this.$route.query.type == 'edit') {
        // 编辑--发布
        pararms.draftOperation = 1;

        this.editPublish(pararms);
      } else {
        this.newAddPublish(pararms);
      }
    },
    async editPublish(pararms) {
      // 编辑待发布，发布按钮保存事件
      this.fullscreenLoading = true;
      let res = await saveDraftInvitation({}, pararms);
      if (res.code == '200') {
        this.$message.success(res.msg);
        this.$router.push({
          path: '/app/viewpoint'
        });
      } else {
        this.$message.error(res.msg);
      }
      this.fullscreenLoading = false;
    },
    async newAddPublish(pararms) {
      // 新增看法，发布按钮保存事件
      this.fullscreenLoading = true;
      let res = await pcAddOrUpdateInvitation({}, pararms);
      if (res.code == '200') {
        this.$message.success(res.msg);
        this.$router.push({
          path: '/app/viewpoint'
        });
      } else {
        this.$message.error(res.msg);
      }
      this.fullscreenLoading = false;
    },
    async saveHand(val) {
      // 保存接口
      this.changeLabelArrHand();
      let pararms = {
        ...this.form,
        ...val,
        invitationLabelIds: this.form.invitationLabelIds.join(','),
        invitationLabelNames: this.form.invitationLabelNames.join(',')
      };
      this.fullscreenLoading = true;
      let res = await saveDraftInvitation({}, pararms);
      if (res.code == '200') {
        this.$message.success(res.msg);
        this.$router.push({
          path: '/app/viewpoint',
          query: {
            type: 'unpublish'
          }
        });
      } else {
        this.$message.error(res.msg);
      }
      this.fullscreenLoading = false;
    },
    changeHand(val) {
      // 看法、文章切换
      this.show = val == '0' ? true : false;
    },
    async getAllLabelInfoHand() {
      // 获取标签列表
      let res = await getAllLabelInfo();
      this.labelArr = res.data || [];
      this.form.invitationLabelIds[0] = this.labelArr[0].id;
    },
    changeLabelArrHand() {
      if (this.form.invitationLabelIds.length > 0) {
        this.form.invitationLabelNames = [];
        this.labelArr.map((item, index) => {
          if (this.form.invitationLabelIds.indexOf(item.id) > -1) {
            this.form.invitationLabelNames.push(this.labelArr[index].labelContent);
          }
        });
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    if (this.$route.query.type && this.$route.query.type == 'edit') {
      // 编辑
      let publishItem = JSON.parse(localStorage.getItem('publish'));
      this.form = publishItem;
    }
    this.getAllLabelInfoHand();
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
.publish-wrap {
  .publish-title {
    color: #151f34;
    line-height: 22px;
    margin-bottom: 10px;
  }
  .publish-type {
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    margin-bottom: 20px;
    .publish-left {
      color: #f57d00;
    }
    ul {
      flex: 1;
      text-align: right;
      li {
        display: inline-block;
        font-size: 14px;
        color: #333333;
        margin-left: 20px;
      }
    }
  }
}
</style>
