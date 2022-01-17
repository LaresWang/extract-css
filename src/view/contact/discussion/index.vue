<!--  -->
<template>
<el-scrollbar class="scroll-color" ref="scroll">
  <div class="contract-group-wrap">
    <ul class="contract-group-ul">
      <li v-if="list && list.length > 0">
        <ul class="contract-group-item">
          <li
            v-for="(item, index) in list"
            :key="index"
            class="flex align-center"
            :class="{ active: isSelect == item.groupId }"
            @click="handGoChat({ ...item, status: 1 })"
            @contextmenu.prevent="rightClick(item)"
          >
            <img
              width="40px"
              height="40px"
              style="margin-right: 10px; border-radius: 50%"
              v-if="item.targetType == '2' && item.groupType == '0'"
              :src="findImage(item.groupAvatar) | hand_group_avatar"
              alt
            />
            <DiscussionIcon :name="item.groupName" v-else />
            <span class="flex-sub text-cut discussionName pre-wrap">{{ item.groupName }}</span>
            ({{ item.people }})
            <!-- <span class="flex-sub text-cut">{{item.id }}</span> -->
          </li>
        </ul>
      </li>
    </ul>
    <GroupUpgrade :info="currentDiscussionInfo" ref="groupUpgrade" @updateContactListAndRouter="_updateContactListAndRouter" />
  </div>
</el-scrollbar>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapMutations } from 'vuex';
import { CLEAR_CHAT } from '@/store/types';
import fileOperational from '@/services/fileOperational';
import DiscussionIcon from '@/components/memberIcon/DiscussionIcon';
import contextmenuMixin from "../mixin/contextmenuMixin"
import GroupUpgrade from "../../chat/discussion/components/GroupUpgrade";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: { DiscussionIcon, GroupUpgrade },
  mixins:[contextmenuMixin],
  props: {
    availableScrollHeight:Number,
    list: {
      type: Array,
      dafault() {
        return [];
      }
    },
    flagGroup: {
      type: Number,
      default() {
        return 1;
      }
    }
  },
  data() {
    //这里存放数据
    return {
      flag: 1,
      isSelect: this.$route.query.isSelect?"this.$route.query.isSelect":'',
      groupType:'0',
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    ...mapMutations([CLEAR_CHAT]),
    findImage(image) {
      return fileOperational.getImage(image, true);
    },
    handGoChat(item) {
      this.isSelect = item.groupId;
      // debugger
      this.$router.push({
        path: '/app/contact/info',
        query: {
          flag: this.flagGroup,
          id: item.groupId,
          targetId: item.groupId,
          nickName: item.groupName,
          headImg: item.groupAvatar,
          num: item.people,
          authStatus: item.status,
          name: 'discussion',
          groupType: item.groupType
        }
      });
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
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
.discussionName {
  max-width: 70%;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
}
.text-cut {
  padding-left: 10px;
}
.contract-group-wrap {
  padding-bottom: 100px;
  .contract-group-title {
    padding: 15px 10px 0;
    font-size: 14px;
    color: #999;
  }
  .contract-group-item {
    li {
      height: 66px;
      // height: 60px;
      padding: 0 10px;
      border-bottom: 1px solid #e4e4e4;
      background-color: #fff;
      // &:last-child {
      //   border-bottom: none;
      // }
    }
  }
}
.active {
  background-color: #e4e4e4 !important;
}
</style>
