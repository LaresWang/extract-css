<template>
  <div class="header-lang">
    <el-dropdown trigger="click" @command="changeLang">
      <span class="el-dropdown-link">
         {{ langMap[$i18n.locale] }}
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="zh-cn">中文</el-dropdown-item>
         <el-dropdown-item command="en-us">English</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { langMap } from '@/map';
import { instance } from '@/utils/axios';
import fs from "fs";
import path from 'path';
const { remote, ipcRenderer } = require('electron');
const configDir = path.join(remote.app.getPath('appData'), `${process.env.VUE_APP_ID}`);
import bus from '@/utils/eventbus';
import Ws from '@/utils/ws';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      langMap
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    // 切换语言
    changeLang(command) {
      if (this.$i18n.locale === command) return;
      if(/^\/app/.test(this.$route.path)){
        Ws.close();
        Ws.init();
      }
      this.$nextTick(() => {
        this.$i18n.locale = command;
        instance.defaults.headers['Content-Language'] = command;
        instance.defaults.headers['Accept-Language'] = command;
        localStorage.lang = command;
        this.$message({
          type: 'success',
          message: this.$t('personal_0075') + this.langMap[command],
          duration: 1000
        });
        // 把设置的语言保存在本地
        this.writeLangFile(command);
        bus.$emit('refresh');
        this.changeTrayLang();
        ipcRenderer.send('changeMediaLan', {lan: command});
      });
      // this.$remote.getCurrentWebContents().reload();
    },
    writeLangFile(lang) {
      let obj = {
        "language": lang
      };
      fs.writeFileSync(`${configDir}/language.json`, JSON.stringify(obj));
    },
    //  取浏览器语言
    getNavigatorLan() {
      let lang = navigator.language || navigator.userLanguage;
      if (lang && this.langMap[lang.toLowerCase()]) {
        // 浏览器语言存在，且didi中有该语言
        this.$i18n.locale = lang.toLowerCase();
      } else {
        // 不存在该语言，则默认为英语
        this.$i18n.locale = 'en-us';
      }
    },
    // 托盘语言
    changeTrayLang() {
      const ipcRenderer = require('electron').ipcRenderer;
      ipcRenderer.send('trayLang', {
        exit: this.$t('personal_0022'),
        newMsg: this.$t('Universal_0364'),
        ignoreAll: this.$t('Universal_0363')
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  async created() {
    if (fs.existsSync(`${configDir}/language.json`)) {
      // 设置过，存在文件
      let data = JSON.parse(fs.readFileSync(`${configDir}/language.json`, 'utf-8'));
      if (data) {
        if (this.langMap[data.language]) {
          this.$i18n.locale = data.language;
        } else {
          // 不存在该语言，则默认为英语
          this.$i18n.locale = 'en-us';
        }
      } else {
        // 不存在文件
        this.getNavigatorLan();
      }
    } else {
      // 没设置过，不存在   取浏览器语言
      this.getNavigatorLan();
    }
    this.changeTrayLang();
    ipcRenderer.send('changeMediaLan', {lan: this.$i18n.locale});
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
.header-lang {
  // margin: 0 20px;
  .el-dropdown-link {
    padding: 5px 10px;
  }
}
.el-dropdown-link {
  border: 1px solid rgba(47, 84, 235, 1);
  border-radius: 4px;
  cursor: pointer;
}
</style>
