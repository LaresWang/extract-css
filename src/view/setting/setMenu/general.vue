<!-- 个人设置 -->
<template>
  <div class="setting-wrap">
    <el-form :label-width="labelWidth" class="demo-userInfo" >
      <el-form-item :label="$t('personal_0055')" prop="">
        <LangChange style="-webkit-app-region: no-drag; cursor: pointer" />
      </el-form-item>
      <el-form-item :label="$t('personal_0056')" prop="">
<!--      <el-form-item label="Универсальный" prop="">-->
        <el-checkbox v-model="newMessageRemind" @change="messageRemind()"> <span class="user-name">
          {{ $t('personal_0057') }}
        </span></el-checkbox>
        <el-checkbox v-model="FriendApplyStatus" @change="changeFAS()"> <span class="user-name">
          {{ $t('my_vip_0026') }}
        </span></el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button class="submit-btn" @click="clearLocal()">
          {{ $t('chat_0110') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

// import { get_bind_user_info } from './server'
import LangChange from '@/components/LangChange';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { friend_apply_status } from '../server';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
import { getSelfUserId } from '@/utils/const';
import { CLEAR_CHAT } from '@/store/types';
import SQLUtils from '@/components/db/sqlite';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    LangChange
  },
  data() {
    //这里存放数据
    return {
      // labelWidth: '120px',
      newMessageRemind: false,
      FriendApplyStatus: true
    };
  },
  //监听属性 类似于data概念
  computed: {
    ...mapGetters({
      userInfo: 'userInfo'
    }),
    labelWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return '120px';
      } else {
        return '85px';
      }
    }
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapActions({
      getUserInfo: 'GET_USER_INFO'
    }),
    ...mapMutations([CLEAR_CHAT]),
    async init() {
      await this.getUserInfo();
    },
    currentUserId() {
      return getSelfUserId();
    },
    async messageRemind() {
      this.$store.commit('SET_NEW_MESSAGE_SOUND_REMIND', this.newMessageRemind);
      this.$message({
        type: 'success',
        message: this.$t('Universal_0122')
      });
    },
    async changeFAS() {
      let i = this.FriendApplyStatus ? 1 : 0;
      let params = {
        userId: this.currentUserId(),
        friendApplyStatus: i
      };
      let res = await friend_apply_status(params);
      console.log(res.code);
      if (res.code == '200') {
        this.$message({
          type: 'success',
          message: this.$t('Universal_0122')
        });
      }
    },
    clearLocal() {
      this.$confirm(this.$t('chat_0060'), this.$t('Universal_0059'), {
        confirmButtonText: this.$t('Universal_0062'),
        cancelButtonText: this.$t('Universal_0063'),
        type: 'warning'
      }).then(async () => {
        try {
          //删除聊天记录
          let searchRet = await window.vm.$knex.raw(
            'SELECT name FROM sqlite_master ' + "WHERE type='table' and name like 'm_%' ORDER BY name;  "
          );
          await searchRet.forEach(async item => {
            console.log('删除聊天记录', item.name);
            await window.vm.$knex.schema.dropTableIfExists(item.name);
          });
          //删除会话记录
          //先删除个人相关的会话(把type=6的个人除开，包括DiDI官方号)
          searchRet = await window.vm.$knex.raw(
            'select s.id ,c.friend_type,s.targetType,c.friend_id from t_sessions s ' +
              'left  JOIN  t_contacts c on s.id=c.friend_id ' +
              'where (c.friend_type !=6 or c.friend_type is null)'
          );

          await searchRet.forEach(async item => {
            console.log('删除会话记录', item.id);

            // 查看是否有草稿消息
            let draftTime = await SQLUtils.getKeyFromSession(item.id, 'draftTime');

            await window.vm
              .$knex('t_sessions')
              .where('id', item.id)
              .update({ isDeleted: draftTime ? false : true, text: '', msgBody: null })
          });

          //删除群相关的会话
          /*await window.vm
            .$knex('t_sessions')
            .where('targetType', '2')
            .update({ isDeleted: true })*/
          this.$store.dispatch('GET_LAST_MSG_LIST');
          //更新会话列表
          this.$message({
            type: 'info',
            message: this.$t('chat_0111')
          });
          this.CLEAR_CHAT();
          this.$router.push({ path: '/app/chat' });
        } catch (e) {
          console.error('删除所有个人和社区的聊天记录', e);
        }
      });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    // 允许好友请求
    let friendApplyStatus_tmp = UserInfoUtils.getCurrentUserInfo().friendApplyStatus;
    this.FriendApplyStatus = friendApplyStatus_tmp == 0 ? false : true;
    // 开启新消息提醒声音
    this.newMessageRemind = this.$store.state.common.newMessageSoundRemind;
    this.init();
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
.el-checkbox, .el-checkbox__input {
  white-space: unset;
}
.clearfix::after {
  content: '';
  display: inline-block;
  overflow: hidden;
  clear: both;
}
.setting-wrap {
  padding: 30px;
  //height: 100%;
  text-align: left;
  background-color: #fff;
  .setting-title {
    font-size: 14px;
    color: #151f34;
    line-height: 20px;
  }
  .setting-tab-wrap {
    padding: 20px 0 50px;
    margin: 0;
  }
  .setting-tab-wrap li {
    float: left;
    font-size: 14px;
    color: #151f34;
    list-style: none;
    line-height: 20px;
    margin-right: 35px;
    user-select: none;
  }
  .setting-tab-wrap li:last-child {
    margin-right: 0;
  }
  .setting-tab-wrap li.router-link-active {
    color: #2f54eb;
    position: relative;
  }
  .setting-tab-wrap li.router-link-active::after {
    content: '';
    display: inline-block;
    position: absolute;
    bottom: -5px;
    width: 10px;
    height: 2px;
    background-color: #2f54eb;
    left: 50%;
    margin-left: -5px;
  }
  .setting-content-wrap {
    .setting-content-wrap-item-con {
      display: none;
    }
    .show {
      display: block;
    }
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
    width: 160px;
    outline: none;
    cursor: pointer;
  }
}
</style>
