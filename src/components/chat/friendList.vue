<!--
* 消息转发-最近列表
-->
<template>
  <div class="chat-list">
    <ul v-if="items.length > 0 ">
      <li
        v-for="(item, index) in items"
        :key="item._id"
        class="invite-mem-list-item flex align-center"
        @click.stop.prevent="addInviteHand(item)"
        :style="{
          cursor: item.forbiddenWordsStatus2Boolean ? 'not-allowed' : '',
        }"
      >
        <div class="icon-class">
          <MemberIcon
            :vipType="item.vipType"
            :image="item.sessionIcon"
            iconType="mini"
            :userRank="item.userRank"
            v-if="item.groupType === null"
          />
          <img
            :src="findImage(item.sessionIcon) | hand_group_avatar"
            alt
            v-else-if="item.groupType === 1"
            @error="replaceImg"
          />
          <DiscussionIcon :name="item.sessionName" iconType="mini" v-else />
        </div>
        <div class="select-info-class">
          <span class="select-name">
            <span class="user-name">{{ item.sessionName }}</span>
            <LevelIcon
              :inviteCode="item.code"
              :userRank="item.userRank"
              iconType="small"
              :vipType="item.vipType"
              :inviteCodeType="item.inviteCodeType"
              v-if="item.targetType == 1"
              :listFlag="true"
              style="padding-left: 2px;"
            />
          </span>
          <!-- <span class="user-sign" v-if="item.groupType != 0">ID:{{item.code}}</span> -->
          <div>
            <LuckIdIcon
              v-if="item.targetType == 1 || item.groupType == 1"
              :inviteCode="item.code"
              :userRank="item.userRank"
              iconType="medium"
              :vipType="item.vipType"
              :inviteCodeType="item.inviteCodeType"
              :listFlag="false"
            />
          </div>
        </div>
        <el-checkbox
          class="checkbox-mul"
          v-model="item.checked"
          @change="addInviteHand(item, index)"
          :checked="item.checked"
          :disabled="item.forbiddenWordsStatus2Boolean || item.disabled"
        ></el-checkbox>
      </li>
    </ul>
    <div v-if="items.length == 0 && !loading" class="no-results">
      <img src="../../assets/images/web.png" class="img_search" />
      <p>{{ $t('Universal_0173') }}</p>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { diffTime } from "@/utils/index";
import DiscussionIcon from "@/components/memberIcon/DiscussionIcon";
import MemberIcon from "@/components/memberIcon/MemberIcon";
import LevelIcon from "@/components/memberIcon/LevelIcon";
import LuckIdIcon from "@/components/memberIcon/luckIdIcon";
import fileOperational from "@/services/fileOperational";
import UserInfoUtils from "@/utils/UserInfoUtils.js";
// import { viewLimitGroupByUserId } from "../chat/server";
import { cloneDeep } from "lodash"
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    DiscussionIcon,
    MemberIcon,
    LevelIcon,
    LuckIdIcon,
  },
  data() {
    //这里存放数据
    return {
      friendsList: [],
      items: [],
    };
  },
  props:{
    limitGroupIdArr:{
      type:Array,
      default: () => {
        return [];
      },
    },
    loading: {
      type: Boolean
    }
  },
  filters: {
    diffTimeHand(val) {
      return diffTime(val);
    },
  },
  //方法集合
  methods: {
    addInviteHand(item) {
      // console.log('最近----',item);
      //  :disabled="item.forbiddenWordsStatus2Boolean || item.disabled"
      if (!item.forbiddenWordsStatus2Boolean&&!item.disabled) {
        this.$forceUpdate();
        item.checked = item.checked ? false : true;
        this.$emit("GetSelectObj", item);
      }
    },
    findImage(image) {
      return fileOperational.getImage(image, true);
    },
    async init(ids, keyword) {
      const lastMsgList = this.$store.state.chat.lastMsgList;
      if (lastMsgList) {
        this.friendsList = cloneDeep(lastMsgList.filter(
          (item) =>
            item.id != "1008455862495526912" &&
            item.id != "1032384035881537536" &&
            item.id != "1188285824566878208" &&
            item.id != this.$paymentId &&
            item.id != UserInfoUtils.getCurrentUserId()
        ));
        this.friendsList.forEach((item) => {
          console.log(item.sessionName, item.id)
          if (item.checked) {
            item.checked = false;
            this.$set(item,'checked',false)
          }
          /* forbiddenWordsStatus:0禁言，1不禁言； memberForbiddenWordsStatus：0不禁言，1禁言 */
          let isForbiddenWordsStatus =
            item.authStatus != 3
              ? false
              : item.forbiddenWordsStatus == 0 ||
                item.memberForbiddenWordsStatus == 1;
          item.forbiddenWordsStatus2Boolean = Boolean(isForbiddenWordsStatus);
          this.$set(item,'forbiddenWordsStatus2Boolean',Boolean(isForbiddenWordsStatus))
        });

        this.items = cloneDeep(this.friendsList);
        // viewLimitGroupByUserId({
        //   userId: UserInfoUtils.getCurrentUserId()
        // }).then(async (res) => {
        //   if(res.code === "200"){
        this.items.forEach((item) => {
          // if(res.data.limitGroupId.length !== 0&&res.data.limitGroupId.indexOf(item.id) > -1){
          if(this.limitGroupIdArr.includes(item.id)){
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        });
        //     this.$forceUpdate();
        //   }
        // });
      }
      //this.initCheckedItems(ids);
      //this.onFilter(keyword);
      this.initCheckedItems(ids);
      if (keyword) {
        this.onFilter(keyword);
      }
      this.$emit('refreshLoading')
    },
    initCheckedItems(ids) {
      this.items.forEach((item) => {
        if (ids.indexOf(item.id) > -1) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
    },
    onFilter(keyword) {
      if (keyword) {
        keyword = keyword.toLowerCase();
      } else {
        keyword = "";
      }
      this.items = cloneDeep(this.friendsList.filter((item) => {
        return (
          item.sessionName.toLowerCase().indexOf(keyword) > -1 ||
          item.code.indexOf(keyword) > -1 ||
          item.pinyin.indexOf(keyword) > -1 ||
          item.friendNickName.indexOf(keyword) > -1
        );
      }));
    },
    removeSelectedItem(id) {
      this.items.forEach((item) => {
        if (item.id == id) {
          item.checked = false;
        }
      });
      this.$forceUpdate();
    },
    checkItems(id) {
      this.items.forEach((item) => {
        if (item.id == id) {
          item.checked = true;
        }
      });
      this.$forceUpdate();
    },
    // 处理图片404问题
    replaceImg(e) {
      UserInfoUtils.replaceDefaultImg(e, "group");
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
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.icon-class {
  border-radius: 50%;
  width: 38px;
  height: 38px;
  vertical-align: middle;
  margin-right: 12px;
  img {
    border-radius: 50%;
    width: 38px;
    height: 38px;
    vertical-align: middle;
    margin-right: 12px;
  }
}
.select-info-class {
  display: flex;
  flex-direction: column;
}
.select-name {
  display: flex;
  align-items: center;
  width: 180px;
  margin-bottom: 5px;
}
.user-name {
  font-size: 12px;
  font-weight: 600;
  color: #191f25;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre;
}
// .user-sign {
//   word-break: break-all;
//   font-size: 10px;

//   font-weight: 500;
//   color: #999;
//   line-height: 20px;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   display: -webkit-box;
//   -webkit-line-clamp: 1;
//   -webkit-box-orient: vertical;
//   -webkit-box-flex: 1;
//   flex: 1;
// }
.chat-list {
  position: relative;
  li {
    //  padding: 5px;
    padding: 5px 5px 5px 5%;
  }
  li:hover {
    background: #f4f4f4;
  }
  .invite-mem-avatar {
    // margin-right: 5px;
    margin-bottom: 5px;
    overflow: hidden;
    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
  }
  .no-results {
    text-align: center;
  }
}
.checkbox-mul&::v-deep .el-checkbox__inner {
  border: 1px solid #aeaeae;
}
</style>
