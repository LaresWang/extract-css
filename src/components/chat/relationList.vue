<!--
* 消息转发-联系人列表
-->
<template>
  <div class="chat-list" ><!--v-loading="loading"-->
    <ul v-if="items.length > 0 " >
      <li 
        v-for="(item, index) in items" 
        :key="item._id"
        class="invite-mem-list-item flex align-center" 
        @click.stop.prevent="addInviteHand(item)"
      >
        <div class="member-icon-class">
          <MemberIcon :vipType="item.vipType" :image="item.friendHeadImg" iconType="mini" :userRank="item.userRank" />
        </div>
        <div class="select-info-class">
          <span class="select-name">
            <span class="user-name">{{ item.friendName }}</span>
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
          <!-- <span class="user-sign">ID:{{item.code}}</span> -->
          <div class="mar-t-5">
            <LuckIdIcon
              :inviteCode="item.inviteCode"
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
          :disabled="item.disabled"
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
import { diffTime } from '@/utils/index';
import { convertToPinyin } from '@/utils/pinyin';
import fileOperational from '@/services/fileOperational';
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
import UserInfoUtils from '@/utils/UserInfoUtils.js';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    MemberIcon,
    LevelIcon,
    LuckIdIcon
  },
  data() {
    //这里存放数据
    return {
      // loading:false,
      friendsList: [],
      items: []
    };
  },

  props:{
    loading: {
      type: Boolean
    }
  },
  filters: {
    diffTimeHand(val) {
      return diffTime(val);
    }
  },
  //方法集合
  methods: {
    findImage(image) {
      return fileOperational.getImage(image, true);
    },
    async init(ids, keyword, members,showAppealClosureNotice) {
      await this.getFriendsListHand(ids, keyword);
      if (keyword) {
        this.onFilter(keyword);
      }
      if (members && members.length > 0) {
        this.items.map(item => {
          if (members.filter(m => m.id == item.id && m.is_show == 'true').length > 0) {
            item.disabled = true;
            item.checked = true;
          }
        });
        this.$forceUpdate();
      }
      //当群聊讨论组处于被封禁状态时 所有人员均不可被邀请进入
      if(showAppealClosureNotice){
        this.items.map(item => {
          item.disabled = true;
        });
      }
      this.$emit('refreshLoading')
    },
    addInviteHand(item) {
      //判断当群被禁止社交时不允许邀请入群
      if(item.disabled) return;
      this.$forceUpdate();
      item.checked = item.checked ? false : true;
      this.$emit('GetSelectObj', item);
    },
    async getFriendsListHand(ids) {
      // this.loading = true
      let res = await window.vm.$knex.raw(
        'select ' +
          'friend_id,friend_head_img,friend_friendNotes, friend_nick_name, invite_code, friend_nick_name_pinyin, ' +
          'friend_friendNotes_pinyin, vipType, inviteCodeType, userRank ' +
          "from t_contacts where is_show = 'true' or is_show is null ORDER BY friend_nick_name "
      );
      // this.loading = false
      this.friendsList = this.changeName(res); //联系人列表赋值
      this.friendsList = this.friendsList.filter(f => f.id != UserInfoUtils.getCurrentUserId());
      this.items = this.friendsList.sort(this.compare());
      console.log('this.items', this.items);
      this.initCheckedItems(ids);
      //this.onFilter(keyword);
    },
    compare() {
      return (obj1, obj2) => {
        let value1 = obj1['fristName'][0];
        let value2 = obj2['fristName'][0];
        if (!value1 || !value2) {
          return 1;
        }
        let isString1 = /^[a-zA-Z]+$/.test(value1);
        let isString2 = /^[a-zA-Z]+$/.test(value2);
        let isNumber1 = !isNaN(Number(value1));
        let isNumber2 = !isNaN(Number(value2));
        if (isString1) {
          if (isString2) {
            // 这里处理一下异常情况 
            if(value1 === undefined || value2 === undefined) {
              return 1;
            }
            return value1.toLowerCase() > value2.toLowerCase() ? 1 : -1;
          } else if (isNumber2) {
            return -1;
          } else {
            return -1;
          }
        } else if (isNumber1) {
          if (isString2) {
            return 1;
          } else if (isNumber2) {
            return Number(value1) > Number(value2) ? 1 : -1;
          } else {
            return -1;
          }
        } else {
          return 1;
        }
      };
    },
    initCheckedItems(ids) {
      this.items.map(item => {
        if (ids.indexOf(item.id) > -1) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
    },
    changeName(arr) {
      return arr.map(a => {
        a = {
          friendName: a.friend_friendNotes || a.friend_nick_name,
          fristName: convertToPinyin(a.friend_friendNotes || a.friend_nick_name),
          friendAreaCityCode: a.friend_areaCountryCode,
          friendAreaCountryCode: a.friend_areaCountryCode,
          friendAttrs: a.friend_attrs,
          friendFriendNotes: a.friend_friendNotes || '',
          friendGender: a.friend_gender,
          friendHeadImg: a.friend_head_img,
          friendId: a.friend_id,
          friendNickName: a.friend_nick_name,
          friendPersonalSign: a.friend_personalSign,
          friendType: a.friend_type,
          friendUpdatedOn: a.friend_updatedOn,
          inviteCode: a.invite_code,
          isShow: a.is_show,
          level: a.level,
          id: a.friend_id,
          code: a.invite_code,
          pinyin: a.friend_nick_name_pinyin,
          note_pinyin: a.friend_friendNotes_pinyin,
          targetType: '1',
          vipType: a.vipType,
          inviteCodeType: a.inviteCodeType,
          userRank: a.userRank,
          groupType: null
        };
        return a;
      });
      // console.log(this.lists)
    },
    onFilter(keyword) {
      if (keyword) {
        keyword = keyword.toLowerCase();
      } else {
        keyword = '';
      }
      this.items = this.friendsList.filter(item => {
        return (
          item.friendNickName.toLowerCase().indexOf(keyword) > -1 ||
          item.code.indexOf(keyword) > -1 ||
          item.pinyin.indexOf(keyword) > -1 ||
          item.note_pinyin.indexOf(keyword) > -1 ||
          item.friendFriendNotes.toLowerCase().indexOf(keyword) > -1
        );
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
.member-icon-class {
  margin-right: 16px;
}
.select-info-class {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}
.select-name {
  display: flex;
  align-items: center;
  width: 180px;
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
    // padding: 3px 5px;
    padding: 3px 5px 3px 5%;
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

.mar-t-5 {
  margin-top: 5px;
}
.checkbox-mul&::v-deep .el-checkbox__inner {
  border: 1px solid #aeaeae;
}
</style>
