<!-- 通用设置 -->
<template>
  <div class="general-setting-wrap ">
    <el-menu class="el-menu-vertical-user w160">
      <el-menu-item v-for="item in menuList" :key="item.path" @click="Tocomponent(item.path)">
        <span>{{ item.name }}</span>
        <el-badge is-dot v-if="idDotShow(item)"></el-badge>
      </el-menu-item>
    </el-menu>
    <div class="set-content">
      <component :is="comName" :latestVersion="latestVersion" :obj="updateObj"></component>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import About from './setMenu/about';
import General from './setMenu/general';
import User from './setMenu/user';
import {mapState} from "vuex";
import {check_update_by_server} from "@/server";
const appVersionCode = require('../../../package.json').version_code;
const appVersion = require('../../../package.json').version;
export default {
  //import引入的组件需要注入到对象中才能使用
  components: { User, General, About },
  data() {
    //这里存放数据
    return {
      comName: 'User',
      isNewVersion: true,
      updateObj: {},
      latestVersion: ''
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapState({
      versionUpdateInfo: obj => {
        return obj.state.versionUpdateInfo
      }
    }),
    menuList() {
      return [
        {
          name: this.$t('personal_0053'),
          path: 'User'
        },
        {
          name: this.$t('personal_0054'),
          path: 'General'
        },
        {
          name: this.$t('personal_0046'),
          // name: 'Информация о DiDi',
          path: 'About'
        }
      ]
    }
  },

  //监控data中的数据变化
  watch: {
    versionUpdateInfo: {
      immediate: true,
      deep: true,
      handler: function (v) {
        if (!v) {
          // 版本一样
          this.latestVersion = appVersion;
        }
        if (!v.updateInfo) {
          // 没有数据
          this.getUpdateVersion();
        }
      }
    }
  },
  //方法集合
  methods: {
    // 请示版本接口
    async getUpdateVersion() {
      const updateInfo = await check_update_by_server({
        currentVersion: appVersionCode
      });
      if (updateInfo.data) {
        this.latestVersion = updateInfo.data.versionCode;
        this.updateObj = updateInfo.data;
      }
    },
    toUser() {
      this.comName = 'User';
    },
    Tocomponent(name) {
      this.comName = name;
    },
    idDotShow(item) {
      // eslint-disable-next-line max-len
      return item.name === this.$t('personal_0046') && (this.versionUpdateInfo.versionSign !== undefined && this.versionUpdateInfo.versionSign !== false || (this.latestVersion && this.latestVersion !== appVersion));
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    // this.getUpdateVersion();
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
<style>
.general-setting-wrap .upload-avatar-wrap .el-upload-list {
  display: none;
}
</style>
<style lang="less" scoped>
//@import url(); 引入公共css类
.el-menu-vertical-user {
  min-height: 316px;
  .el-badge {
    vertical-align: baseline;
    margin-left: 4px;
    /deep/ .el-badge__content {
      background-color: #ff0000;
    }
  }
  /deep/ .el-menu-item {
    padding: 0 10px !important;
    display: flex;
    align-items: center;
  }
  /deep/ .el-menu-item:focus{
    background: #fff !important;
  }

}

.w160 {
  //width: 100px;
  //float: left;
  border-right: #e7e7e7 solid 1px;

  /deep/ .is-dot{
    width: 7px;height: 7px;
  }
}
.set-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  //float: right;
  //width: 448px;
}
.general-setting-wrap {
  //position: relative;
  //overflow: hidden;
  display: flex;
  flex-direction: row;
  .box-bg {
    width: 420px;
    height: 40px;
    background: rgba(247, 247, 250, 1);
    box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 15px;
  }
  .account-wrapper {
    display: flex;
    justify-content: space-between;
    button {
      font-weight: normal;
    }
  }
  .upload-avatar-wrap {
    position: absolute;
    right: calc((100% - 550px - 48px) / 2 / 2);
    top: 0;
    .upload-text {
      color: #2f53eb;
      font-size: 14px;
      margin-top: 10px;
    }
  }
  .general-setting-title {
    text-align: center;
    line-height: 22px;
    font-size: 16px;
    color: #151f34;
  }
  .general-setting-title p {
    color: #9297a3;
    margin: 10px 0 30px;
    line-height: 20px;
    font-size: 14px;
  }
  .general-setting-content {
    width: 550px;
    margin: 0 auto;
  }
  .text {
    color: #151f34;
    font-size: 10px;
    line-height: 14px;
    margin: 60px 0 10px;
  }
  .submit-btn {
    height: 40px;
    background: #2f54eb;
    box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
    border: none;
    user-select: none;
    width: 100%;
    outline: none;
  }
  .btn-wrap {
    .flex-sub:nth-child(1) {
      margin-right: 20px;
      .submit-btn {
        background: #9297a3;
      }
    }
  }
}
</style>
