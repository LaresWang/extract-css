<!-- member title -->
<template>
  <div style="background: #fff;height:38px">
    <div class="mess-header flex align-center justify-between drag">
      <div class="mess-name">
        <slot></slot>
      </div>
      <div class="mess-nav flex align-center noDrag setnav">
        <!-- <span
            class="liMenu"
            @click="gourl(item,idx)"
            v-for="(item,idx) in menutop"
            :key="idx"
        >{{item}}</span>-->
        <!-- <i class="el-icon-s-custom" @click="showPerson()"></i> -->
        <!-- <el-popover placement="bottom" width="180" trigger="click">
          <ul>
            <li
              class="liMenu"
              @click="son(item,id)"
              v-for="(item,id) in menu"
              :key="id"
            >{{item.name}}</li>
          </ul>
          <el-button slot="reference">click 激活</el-button>
          <img src="../../../../assets/images/set.png" slot="reference" />
        </el-popover> -->
        <span @click="goInfo">
          <img draggable='false' src="../../../../assets/images/right_top_info.png" alt />
        </span>
        <span @click="goGroup">
          <img draggable='false' src="../../../../assets/images/right_top_member.png" alt />
        </span>
        <span @click="goSetting">
          <img draggable='false' src="../../../../assets/images/right_top_config.png" alt />
        </span>
      </div>
    </div>
    <!-- <div v-if="!rightStatus" id="checklist" class="mess-checklist"> -->

    <!-- </div> -->
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { contGrpSize } from '@/utils';
export default {
  //import引入的组件需要注入到对象中才能使用
  props: ['authStatus'],

  components: {},
  data() {
    //这里存放数据
    return {
      drawer: false,
      rightStatus: true,
      menutop: ['消息'],
      menu:
        this.authStatus == 3
          ? [
            { id: '1', name: '查看社区信息' },
            { id: '2', name: '查看社区成员' },
            { id: '4', name: '设置' }
          ]
          : [
            { id: '1', name: '查看社区信息' },
            { id: '2', name: '查看社区成员' },
            { id: '3', name: '社区管理' },
            { id: '4', name: '设置' }
          ]
      // menu:[{id:'1',name:"查看群信息"}, {id:'2',name:"查看群成员"},{id:'4',name:"设置"}]
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    authStatus(a) {
      if (a == 3) {
        this.menu = [
          { id: '1', name: '查看社区信息' },
          { id: '2', name: '查看社区成员' },
          { id: '4', name: '设置' }
        ];
      } else {
        this.menu = [
          { id: '1', name: '查看社区信息' },
          { id: '2', name: '查看社区成员' },
          { id: '3', name: '社区管理' },
          { id: '4', name: '设置' }
        ];
      }
    }
  },
  //方法集合
  methods: {
    goSetting() {
      this.$emit('goSetting', 1);
    },
    goGroup() {
      this.$emit('goSetting', 2);
    },
    goInfo() {
      this.$emit('goSetting', 0);
    },
    showPerson() {},
    setClick() {
      this.rightStatus = true;
    },
    son(item) {
      if (item.id == 4) {
        this.$router.push({
          path: '/app/chat/group/setting',
          query: { timer: new Date().getTime() }
        });
      } else if (item.id == 1) {
        this.$router.push({
          path: '/app/chat/group/information',
          query: { timer: new Date().getTime() }
        });
      } else if (item.id == 3) {
        this.$router.push({
          path: '/app/chat/group/manage',
          query: { timer: new Date().getTime() }
        });
      } else if (item.id == 2) {
        this.$router.push({
          path: '/app/chat/group/member',
          query: {
            targetId: sessionStorage.getItem('groupId'),
            timer: new Date().getTime()
          }
        });
      }
    },
    gourl(item, idx) {
      if (idx == 0) {
        let current = {
          targetId: sessionStorage.getItem('groupId'),
          uniqueCode: contGrpSize(sessionStorage.getItem('groupId'))
        };
        this.$store.dispatch('SET_CURRENT_CHAT', current);
        this.$router.push({
          path: '/app/chat/group/message',
          query: {
            targetId: sessionStorage.getItem('groupId'),
            timer: new Date().getTime(),
            // friendName: encodeURI(this.groupobj.groupName),
            friendName: null,
            uniqueCode: contGrpSize(sessionStorage.getItem('groupId'))
          }
        });
      } else if (idx == 1) {
        this.$router.push({
          path: '/app/chat/group/files',
          query: { timer: new Date().getTime() }
        });
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    /* console.log(
      sessionStorage.authStatus,
      "sessionStorage.authStatussessionStorage.authStatus"
    ); */
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
.mess-header {
  height: 38px;
  background: #fff;
  padding: 0 20px;
  box-sizing: border-box;
  border-bottom: 1px solid #e4e4e4;
  span {
    height: 20px;
    line-height: 20px;
    &:nth-child(2) {
      margin: 0 12px;
    }
    &:nth-child(4) {
      margin: 0 12px;
    }
  }

  .mess-nav span {
    cursor: pointer;
  }
  .setnav span {
    padding: 5px 3px !important;
  }
  .mess-nav img {
    width: 23px;
    height: 23px;
  }
  .mess-name {
    font-weight: 600;
  }
}
.mess-checklist {
  position: absolute;
  right: 0;
  width: 200px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(221, 221, 221, 1);
  z-index: 10000;
}
.liMenu {
  cursor: pointer;
  text-align: center;
  height: 40px;
  line-height: 40px;
  font-size: 15px;
}
.liMenu:hover {
  color: #fff;
  background: #2f54eb;
}
</style>
