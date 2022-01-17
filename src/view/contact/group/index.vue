<!--  -->
<template>
<el-scrollbar class="scroll-color" ref="scroll">
  <div class="contract-group-wrap">
    <ul class="contract-group-ul">
      <li v-if="list.ownerList && list.ownerList.length > 0">
        <div class="contract-group-title">
          {{ $t('book_community_0001', {value: list.ownerList.length}) }}
        </div>
        <ul class="contract-group-item">
          <li
            v-for="(item, index) in list.ownerList"
            :key="index"
            class="flex align-center"
            :class="{ active: isSelect == item.groupId }"
            @click="handGoChat({ ...item, status: 1 })"
            @contextmenu.prevent="rightClick({ ...item, status: 1 })"
          >
            <img
              width="40px"
              height="40px"
              style="margin-right: 10px; border-radius: 50%"
              :src="findImage(item.groupAvatar) | hand_group_avatar"
              alt
            />
            <span class="flex-sub text-cut group-name-list">{{ item.groupName }}</span>
            ({{ item.people }})
            <!-- <span class="flex-sub text-cut">{{item.id }}</span> -->
          </li>
        </ul>
      </li>
      <li v-if="list.manageList && list.manageList.length > 0">
        <div class="contract-group-title">{{ $t('book_community_0002', {value: list.manageList.length}) }}</div>
        <ul class="contract-group-item">
          <li
            v-for="(item, index) in list.manageList"
            :key="index"
            class="flex align-center"
            :class="{ active: isSelect == item.groupId }"
            @click="handGoChat({ ...item, status: 2 })"
            @contextmenu.prevent="rightClick({ ...item, status: 2 })"
          >
            <img
              width="40px"
              height="40px"
              style="margin-right: 10px; border-radius: 50%"
              :src="findImage(item.groupAvatar) | hand_group_avatar"
              alt
            />
            <span class="flex-sub text-cut group-name-list">{{ item.groupName }}</span>
            ({{ item.people }})
          </li>
        </ul>
      </li>
      <li v-if="list.joinList && list.joinList.length > 0">
        <div class="contract-group-title">{{ $t('book_community_0003', {value: list.joinList.length}) }}</div>
        <ul class="contract-group-item">
          <li
            v-for="(item, index) in list.joinList"
            :key="index"
            class="flex align-center"
            :class="{ active: isSelect == item.groupId }"
            @click="handGoChat({ ...item, status: 3 })"
            @contextmenu.prevent="rightClick({ ...item, status: 3 })"
          >
            <img
              width="40px"
              height="40px"
              style="margin-right: 10px; border-radius: 50%"
              :src="findImage(item.groupAvatar) | hand_group_avatar"
              alt
              @error="replaceImg"
            />
            <span class="flex-sub text-cut group-name-list">{{ item.groupName }}</span>
            ({{ item.people }})
          </li>
        </ul>
      </li>
    </ul>
  </div>
</el-scrollbar>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { mapMutations } from 'vuex';
import { CLEAR_CHAT } from '@/store/types';
import fileOperational from '@/services/fileOperational';
import UserInfoUtils from '@/utils/UserInfoUtils';
import contextmenuMixin from "../mixin/contextmenuMixin"
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  mixins:[contextmenuMixin],
  props: {
    availableScrollHeight:Number,
    list: {
      type: Object,
      dafault() {
        return {};
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
      groupType:'1',
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
      this.$router.push({
        path: '/app/contact/info',
        query: {
          flag: this.flagGroup,
          id: item.groupId,
          targetId: item.groupId,
          nickName: item.groupName,
          headImg: item.groupAvatar,
          num: item.people,
          authStatus: item.status
        }
      });
    },
    // 处理图片404问题
    replaceImg(e) {
      UserInfoUtils.replaceDefaultImg(e, 'group');
    }
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
.group-name-list {
  max-width: 70%;
  font-size: 14px;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: pre;
}
</style>
