<!--
* 消息转发-社区列表
-->
<template>
  <div class="chat-list">
    <ul v-if="items.length > 0">
      <li
        v-for="(item, index) in items"
        :key="item._id"
        class="invite-mem-list-item flex align-center"
        @click.stop.prevent="addInviteHand(item)"
        :style="{
          cursor: item.forbiddenWordsStatus2Boolean ? 'not-allowed' : '',
        }"
      >
        <div class="invite-mem-avatar">
          <img
            :src="findImage(item.friendHeadImg) | hand_group_avatar"
            @error="replaceImg"
            alt
          />
        </div>
        <div class="user-words flex flex-direction">
          <div class="flex justify-between align-center">
            <span class="user-name">{{ item.friendNickName }}</span>
            <el-checkbox
              class="checkbox-mul"
              v-model="item.checked"
              @change="addInviteHand(item, index)"
              :checked="item.checked"
              :disabled="item.forbiddenWordsStatus2Boolean || item.disabled"
            ></el-checkbox>
          </div>
          <div class="flex justify-between align-center">
            <span class="user-sign">ID:{{ item.code }}</span>
          </div>
        </div>
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
import UserInfoUtils from "@/utils/UserInfoUtils.js";
import fileOperational from "@/services/fileOperational";
// import { viewLimitGroupByUserId } from "../chat/server";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
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
    async init(ids, keyword) {
      await this.getAllGroupListHand(ids, keyword);
      // viewLimitGroupByUserId({
      //   userId: UserInfoUtils.getCurrentUserId()
      // }).then(async (res) => {
      //   if(res.code === "200"){
      this.items.map((item) => {
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
      this.$emit('refreshLoading')
    },
    findImage(image) {
      return fileOperational.getImage(image, true);
    },
    addInviteHand(item) {
      // :disabled="item.forbiddenWordsStatus2Boolean || item.disabled"
      if (!item.forbiddenWordsStatus2Boolean&&!item.disabled) {
        this.$forceUpdate();
        item.checked = item.checked ? false : true;
        this.$emit("GetSelectObj", item);
      }
    },
    collectSelectedGroups(selectedGroups, list) {
      for (let item of list) {
        if (item.checked) {
          selectedGroups.push({
            checked: item.checked,
            friendHeadImg: item.groupAvatar,
            friendNickName: item.groupName,
            id: item.groupId,
            targetType: "2",
          });
        }
      }
    },
    async getAllGroupListHand(ids, keyword) {
      let userId = UserInfoUtils.getCurrentUserId();
      let res = await window.vm.$knex.raw(`
        select
        g.people as people,
        g.group_name as friendNickName,
        g.group_avatar as friendHeadImg,
        g.group_id as id,
        g.group_name_pinyin as pinyin,
        g.group_type as groupType,
        g.group_code as code,
        g.forbiddenWordsStatus as forbiddenWordsStatus, 
        g.create_time as createdOn,
        tgm.forbiddenWordsStatus as memberForbiddenWordsStatus,
        tgm.auth_status as authStatus,
        tgm.id as memberId
        from t_groups g
        left join t_groups_member gm on gm.group_id = g.group_id
        left join t_groups_member tgm on tgm.group_id = g.group_id and tgm.id = '${userId}' and tgm.is_show='true'
        where g.is_show='true' and g.group_type='1'
        group by g.group_id
        order by g.group_name
      `);
      this.friendsList = res;
      this.items = this.friendsList.sort(this.compare());
      this.initCheckedItems(ids);
      if (keyword) {
        this.onFilter(keyword);
      }
    },
    compare() {
      return (obj1, obj2) => {
        let value1 = Number(obj1["people"]);
        let value2 = Number(obj2["people"]);
        if (value1 === value2) {
          return (
            new Date(obj2["createdOn"]).getTime() -
            new Date(obj1["createdOn"]).getTime()
          );
        }
        return value2 - value1;
      };
    },
    onFilter(keyword) {
      if (keyword) {
        keyword = keyword.toLowerCase();
      } else {
        keyword = "";
      }
      this.items = this.friendsList.filter((item) => {
        return (
          item.friendNickName.toLowerCase().indexOf(keyword) > -1 ||
          item.code.indexOf(keyword) > -1 ||
          item.pinyin.indexOf(keyword) > -1
        );
      });
    },
    initCheckedItems(ids) {
      this.items.map((item) => {
        /* forbiddenWordsStatus:0禁言，1不禁言； memberForbiddenWordsStatus：0不禁言，1禁言。authStatus=3普通成员 */
        let isForbiddenWordsStatus =
          item.authStatus != 3
            ? false
            : item.forbiddenWordsStatus == 0 ||
              item.memberForbiddenWordsStatus == 1;
        item.forbiddenWordsStatus2Boolean = Boolean(isForbiddenWordsStatus);
        if (ids.indexOf(item.id) > -1) {
          item.checked = true;
        } else {
          item.checked = false;
        }
        item.targetType = 2;
      })
    },
    removeSelectedItem(id) {
      this.items.map((item) => {
        if (item.id == id) {
          item.checked = false;
        }
      });
      this.$forceUpdate();
    },
    checkItems(id) {
      this.items.map((item) => {
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
.user-words {
  width: 180px;
  flex: auto;
  padding: 0 10px 0 0;
  margin-left: 10px;
}

.user-name {
  font-size: 12px;
  font-weight: 600;
  color: #191f25;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  flex: 1;
  white-space: pre;
}
.user-sign {
  word-break: break-all;
  font-size: 10px;

  font-weight: 500;
  color: #999;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  -webkit-box-flex: 1;
  flex: 1;
}
.chat-list {
  position: relative;
  li {
    // padding: 5px;
    padding: 5px 5px 5px 5%;
  }
  li:hover {
    background: #f4f4f4;
  }
  .invite-mem-avatar {
    // margin-right: 5px;
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
