<!--
* 消息转发-讨论组列表
-->
<template>
  <div class="chat-list">
    <ul v-if="items.length > 0">
      <li 
        v-for="(item, index) in items" 
        :key="item._id"
        class="invite-mem-list-item flex align-center"
        @click.stop.prevent="addInviteHand(item)"
      >
        <div class="invite-mem-avatar">
          <DiscussionIcon iconType="mini" :name="item.friendNickName" />
        </div>
        <div class="user-words flex flex-direction">
          <div class="flex justify-between align-center">
            <span class="user-name">{{item.friendNickName }}</span>
            <el-checkbox class="checkbox-mul" v-model="item.checked" @change="addInviteHand(item, index)" 
            :checked="item.checked" 
            :disabled='item.disabled'>
            </el-checkbox>
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
import UserInfoUtils from "@/utils/UserInfoUtils.js";
import DiscussionIcon from "@/components/memberIcon/DiscussionIcon";
// import { viewLimitGroupByUserId } from "../chat/server";
export default {
  name: 'DiscussionInfo',
  components: {
    DiscussionIcon
  },
  data() {
    return {
      items: []
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
      this.$forceUpdate();
      //   }
      // });
      this.$emit('refreshLoading')
    },
    addInviteHand(item) {
      //判断当群被禁止社交时不允许邀请入群
      if(item.disabled) return;
      this.$forceUpdate();
      item.checked = item.checked ? false : true;
      this.$emit('GetSelectObj', item);
    },
    collectSelectedGroups(selectedGroups, list) {
      for (let item of list) {
        if (item.checked) {
          selectedGroups.push({
            checked: item.checked,
            friendHeadImg: item.groupAvatar,
            friendNickName: item.groupName,
            id: item.groupId,
            targetType: '2',
            groupType: 0
          });
        }
      }
    },
    async getAllGroupListHand(ids, keyword) {
      let userId = UserInfoUtils.getCurrentUserId();
      let res = await window.vm
        .$knex('t_groups')
        .innerJoin('t_groups_member', function() {
          this.on('t_groups_member.group_id', '=', 't_groups.group_id');
        })
        .select('t_groups.group_name as friendNickName')
        .select('t_groups.group_avatar as friendHeadImg')
        .select('t_groups.group_id as id')
        .select('t_groups.group_name_pinyin as pinyin')
        .select('t_groups.group_code as code')
        .select('t_groups.create_time as createdOn')
        .select('t_groups.group_type as groupType')
        .whereRaw("t_groups.is_show='true'")
        .whereRaw("t_groups.group_type='0'")
        .count('t_groups_member.id', { as: 'people' })
        .whereRaw(
          "t_groups_member.group_id in (SELECT m1.group_id from t_groups_member m1 where m1.id='" +
            userId +
            "') and t_groups_member.is_show='true'"
        )
        .groupBy('t_groups.group_id')
        .havingRaw('count(t_groups_member.id)>0')
        .orderBy('t_groups.group_name');
      this.items = res.sort(this.compare());
      this.initCheckedItems(ids);
      if (keyword) {
        this.onFilter(keyword);
      }
    },
    compare() {
      return (obj1, obj2) => {
        let value1 = Number(obj1['people']);
        let value2 = Number(obj2['people']);
        if (value1 === value2) {
          return new Date(obj2['createdOn']).getTime() - new Date(obj1['createdOn']).getTime();
        }
        return value2 - value1;
      };
    },
    onFilter(keyword) {
      if (keyword) {
        keyword = keyword.toLowerCase();
      } else {
        keyword = '';
      }
      this.items = this.items.filter(item => {
        return (
          item.friendNickName.toLowerCase().indexOf(keyword) > -1 || item.code.indexOf(keyword) > -1 || item.pinyin.indexOf(keyword) > -1
        );
      });
    },
    initCheckedItems(ids) {
      this.items.map(item => {
        if (ids.indexOf(item.id) > -1) {
          item.checked = true;
        } else {
          item.checked = false;
        }
        item.targetType = 2;
        item.groupType = 0;
      });
    },
    removeSelectedItem(id) {
      this.items.map(item => {
        if (item.id == id) {
          item.checked = false;
        }
      });
      this.$forceUpdate();
    },
    checkItems(id) {
      this.items.map(item => {
        if (item.id == id) {
          item.checked = true;
        }
      });
      this.$forceUpdate();
    }
  }
};
</script>

<style lang="less" scoped>


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
