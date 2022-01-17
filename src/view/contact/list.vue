<!-- 好友列表 -->
<template>
  <div class="contact-list-wrap">
    <search></search>
    <ul class="flex text-center">
      <li
        :class="activeIndex == index ? 'active' : ''"
        v-for="(item, index) in tabsArr"
        :key="index"
        @click="tabHand(index)"
      >
        <i :class="item['iconClass']"></i>
        <span class="tab-item" v-show="activeIndex == index">{{
          item["label"]
        }}</span>
      </li>
    </ul>
    <div class="tab-list-item">
      <!-- <component
        v-bind:is="getComponent['com']"
        ref="coms"
        :list="getComponent['list']"
        :availableScrollHeight="availableScrollHeight"
      ></component> -->
      <Relation
        v-show="activeIndex == 0"
        :list="friendsList"
        ref="coms0"
        :availableScrollHeight="availableScrollHeight"
      />
      <Group
        v-show="activeIndex == 1"
        :list="groupList"
        ref="coms1"
        :availableScrollHeight="availableScrollHeight"
      />
      <Discussion
        v-show="activeIndex == 2"
        :list="discussionList"
        ref="coms2"
        :availableScrollHeight="availableScrollHeight"
      />
    </div>
    <AddBtn />
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Group from "@/view/contact/group";
import Relation from "@/view/contact/relation";
import Discussion from "@/view/contact/discussion";
import AddBtn from "@/view/add-friends-group";
import { GET_FRIENDS_LIST, GET_GROUP_LIST } from "@/store/types/";
import Search from "@/components/search";
import { mapGetters } from "vuex";
// import { cloneDeep } from "lodash"
const LIHEIGHT = 67,
  LITITLEHEIGHT = 34;
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    Group,
    Relation,
    Discussion,
    AddBtn,
    Search,
  },
  data() {
    return {
      activeIndex: 0,
    };
  },
  computed: {
    ...mapGetters(["discussionList", "groupList", "friendsList"]),
    tabsArr() {
      return [
        { label: this.$t("chat_search_0003"), iconClass: "iconfont icon-user" },
        {
          label: this.$t("chat_search_0005"),
          iconClass: "iconfont icon-user-group-Fill",
        },
        { label: this.$t("chat_search_0007"), iconClass: "iconfont icon-laba" },
      ];
    },
    getComponent() {
      switch (this.activeIndex) {
      case 0:
        return {
          com: Relation,
          list: this.friendsList,
        };
      case 1:
        return {
          com: Group,
          list: this.groupList,
        };
      case 2:
        return {
          com: Discussion,
          list: this.discussionList,
        };
      default:
        return {
          com: Relation,
          list: this.friendsList,
        };
      }
    },
    availableScrollHeight() {
      let {
          joinList = [],
          manageList = [],
          ownerList = [],
        } = this.groupList || {}, count = 0;
      switch (this.activeIndex) {
      case 0:
        return ((this.friendsList?.length || 0) + 1) * LIHEIGHT;
      case 1:
        joinList.length && count++;
        manageList.length && count++;
        ownerList.length && count++;
        return (
          (manageList.length + ownerList.length + joinList.length) *
              LIHEIGHT +
            count * LITITLEHEIGHT
        );
      case 2:
        return (this.discussionList?.length || 0) * LIHEIGHT;
      default:
        return 0;
      }
    },
  },
  watch: {
    activeIndex(v) {
      if (v == 0) {
        // 联系人
        this.$store.dispatch(GET_FRIENDS_LIST);
      } else {
        // 群聊列表、 讨论组列表
        this.$store.dispatch(GET_GROUP_LIST);
      }
    },
  },
  methods: {
    tabHand(i) {
      this.activeIndex = i;
    },
    // win 拖拽之后 scollview 刷新
    winResize() {
      // let instance = this.$refs.coms;
      let instance = this.$refs[`coms${this.activeIndex}`];
      instance?.$refs?.scroll?.update?.();
      instance?.$refs?.scroll?.handleScroll?.();
      console.log("scroll ===> 滑动更新",'如果有必要 一次性更新其他滚动条的状态');
    },
  },
  created() {
    // 联系人
    this.$store.dispatch(GET_FRIENDS_LIST);
  },
  mounted() {
    this.$remote.getCurrentWindow().addListener("resize", this.winResize);
  },
  beforeDestroy() {
    this.$remote.getCurrentWindow().removeListener("resize", this.winResize);
  },
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.contact-list-wrap {
  width: 270px;
  position: relative;
  ul {
    height: 38px;
    line-height: 40px;
    border: 1px solid #e4e4e4;
    border-right: none;
    border-left: none;
    justify-content: space-between;
    li {
      flex: 1;
      cursor: pointer;
      font-size: 14px;
      color: #999;
      padding: 0 2px;
      margin: 0 10px;
      .iconfont {
        font-size: 18px;
      }
      .tab-item {
        margin-left: 2px;
      }
      &:last-child {
        border-right: none;
      }
      &.active {
        color: #000;
        border-bottom: 1px solid #333333;
      }
    }
  }
  .tab-list-item {
    background-color: #fcfbfb;
    height: calc(100vh - 100px);
    overflow-y: scroll;
  }
}
</style>
