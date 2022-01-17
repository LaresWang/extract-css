<template>
  <div class="select-con">
    <div class="title">{{ $t('chat_select_chat_0010', {length: mapSelect.length}) }}</div>
    <ul>
      <li v-for="item in mapSelect" :key="item._id">
        <div class="icon-class">
          <MemberIcon
            :image="item.friendHeadImg || item.sessionIcon"
            iconType="mini"
            :vipType="item.vipType"
            :userRank="item.userRank"
            v-if="item.groupType === null"
            style="display: inline-block; margin-right: 12px"
            :class="item.targetType == '1' ? 'desClass' : ''"
          />
          <img :src="findImage(item.friendHeadImg || item.sessionIcon) | hand_group_avatar" alt v-else-if="item.groupType === 1" />
          <DiscussionIcon class="select-discussion-icon" :name="item.friendNickName || item.sessionName" iconType="mini" v-else />
        </div>
        <div class="select-info-class">
          <span class="select-name">
            <span class="namebox">{{ item.friendFriendNotes || item.friendNickName || item.sessionName }}</span>
            <LevelIcon
              :inviteCode="item.code"
              :userRank="item.userRank"
              iconType="small"
              :vipType="item.vipType"
              :inviteCodeType="item.inviteCodeType"
              :listFlag="false"
              v-if="item.groupType === null"
              style="padding-left: 2px"
            />
          </span>
          <span style="margin-top:5px;" class="user-sign" v-if="item.groupType != 0">
            <LuckIdIcon
              v-if="item.groupType === null"
              :listFlag="false"
              :vipType="item.vipType"
              :inviteCodeType="item.inviteCodeType"
              :inviteCode="item.code"
              :userRank="item.userRank"
              iconType="medium"
            />
          </span>
          <span v-if="item.targetType == 2 && item.groupType == 1" class="grouIdstyle">ID:{{ item.code }}</span>
        </div>

        <i @click="removeSelect(item.id)" class="el-icon-error" style="cursor: pointer"></i>
      </li>
    </ul>
    <div class="flex btn-wrap" v-show="mapSelect.length > 0">
      <div class="flex-sub">
        <button class="submit-btn" type="info" @click="cancelDialogHand">
          {{ $t('Universal_0063') }}
        </button>
      </div>
      <div class="flex-sub">
        <button class="submit-btn" @click="confirmDialogHand" :disabled="mapSelect.length == 0">
          {{ $t('Universal_0062') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import bus from '@/utils/eventbus';
import fileOperational from '@/services/fileOperational';
import DiscussionIcon from '@/components/memberIcon/DiscussionIcon';
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {
    DiscussionIcon,
    MemberIcon,
    LevelIcon,
    LuckIdIcon
  },
  props: {
    SelectObj: Array
  },
  filters: {},

  data() {
    //这里存放数据
    return {
      mapSelect: this.SelectObj
    };
  },
  //监听属性 类似于data概念
  computed: {
    //   mapSelect(){
    //         let a =[]
    //         this.SelectObj.forEach(v => {
    //         if(v.checked){
    //             a.push(v)
    //         }
    //         return a
    //     });
    //   }
  },
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    findImage(image) {
      return fileOperational.getImage(image);
    },
    handCloseRealy() {
      this.$emit('update:visible', false);
    },
    cancelDialogHand() {
      this.$emit('cancelDialogHand', false);
    },
    confirmDialogHand() {
      let arrList = [];
      for (let item of this.mapSelect) {
        arrList.push({
          friendId: item.id,
          targetType: item.targetType,
          friendNickName: item.friendNickName
        });
      }
      this.mapSelect = [];
      if (arrList.length < 1) {
        this.$message.warning(this.$t('chat_0086'));
      } else {
        bus.$emit('groupShareClose', false);
        this.$emit('confirmDialogHand', arrList);
      }
      // this.$emit("confirmDialogHand",false);
    },
    removeSelect(id) {
      this.mapSelect = this.mapSelect.filter(item => item.id != id);
      this.$emit('removeSelect', id);
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    console.log(this.mapSelect);
    let a = [];
    this.mapSelect.forEach(v => {
      if (v.checked) {
        a.push(v);
      }
      // if(v.joinList.length>0&&v.manageList.length>0&&v.ownerList.length>0){

      // }
    });
    this.mapSelect = a;
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {} //生命周期 - 销毁完成
};
</script>
<style lang="less" scoped>
.grouIdstyle {
  font-size: 10px;
  font-weight: 400;
  color: #999;
}
.select-info-class {
  display: flex;
  flex-direction: column;
  margin-top: 9px;
}
.desClass {
  margin-right: 16px !important;
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
.relay-wrap {
  width: 50%;
}
.select-discussion-icon {
  margin-right: 12px;
  display: inline-block;
}
.icon-class {
  display: flex;
  justify-content: center;
  .user-high-level-border,
  .user-low-level-border {
    margin-left: -3px;
  }
}
.select-con {
  padding-left: 10px;
  height: 100%;
  position: relative;

  img {
    border-radius: 50%;
    width: 38px;
    height: 38px;
    vertical-align: middle;
    margin-right: 12px;
  }

  ul {
    height: 310px;
    overflow-y: auto;
  }

  li {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 5px;
    color: rgba(51, 51, 51, 1);
    display: flex;
    align-items: center;
    i {
      font-size: 16px;
      color: #d7d7d7;
    }
    i:hover{
      color: #aeaeae;
    }
  }
  // li:hover {
  //   background: #f4f4f4;
  // }
  .submit-btn {
    height: 30px;
    background: #2f54eb;
    box-shadow: 0px 0px 1px 0px rgba(153, 153, 153, 0.3);
    border-radius: 4px;
    color: #fff;
    font-size: 13px;
    border: none;
    user-select: none;
    width: 90px;
    outline: none;
    cursor: pointer;
  }

  .btn-wrap {
    position: absolute;
    right: 20px;

    .flex-sub:nth-child(1) {
      .submit-btn {
        background: #d8d8d8;
        color: #333;
      }
    }

    .flex-sub {
      margin-left: 20px;
    }
  }

  .title {
    display: block;
    margin-left: 155px;
    color: #bbb;
    font-size: 12px;
    margin-bottom: 15px;
    font-weight: 400;
  }

  .select-name {
    display: flex;
    align-items: center;
    width: 180px;
    .namebox {
      display: inline-block;
      max-width: 110px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre;
    }
  }
}
</style>
