<template>
  <div class="info">
    <div class="info-contact">
      <div class="info-top">
        <!-- 联系人昵称，性别icon -->
        <!-- 头像 -->
        <div class="info-top-avatar">
          <!-- 联系人 -->
          <span @click="openImgView(contactAvatar)">
            <MemberIcon
              :image="contactAvatar"
              iconType="large"
              :userRank="userInfo.userRank"
              :vipType="userInfo.vipType"
              v-if="infoType == 0"
            />
          </span>
          <!-- 群聊 -->
          <span @click="openImgView(groupAvatar)">
            <el-avatar
              v-if="infoType == 1 && !name" 
              fit="fill"
              :src="findImage(groupAvatar) | hand_group_avatar"  
              @error="replaceImg" 
              :key="groupAvatar">
              <img src="../../assets/images/group_avtar.png" alt="" />
            </el-avatar>
          </span>
          <!-- 讨论组 -->
          <DiscussionIcon v-if="infoType == 1 && name" iconType="huge" :name="groupName" />
        </div>
        <div>
          <div class="info-contact-name flex" v-if="this.infoType == 0">
            <div class="into-top-name">{{ contactName }}</div>
            <LevelIcon
              v-if="userInfo.inviteCode"
              :inviteCode="userInfo.inviteCode"
              :userRank="userInfo.userRank"
              iconType="large"
              :vipType="userInfo.vipType"
              :inviteCodeType="userInfo.inviteCodeType"
            />
          </div>
          <!-- <div class="info-gender-icon" v-if="this.infoType == 0">
            <img src="../../assets/images/sex_girl.png" title="女" v-if="this.userSex == 2" />
            <img
              src="../../assets/images/sex_boy.png"
              title="男"
              v-else-if="this.userSex == 1"
            />
            <img src="../../assets/images/sex_place.png" title="男" v-else />
          </div> -->
          <!-- 群昵称 -->
          <div class="info-group-name" v-if="this.infoType == 1">
            <div class="group-nickname">{{ groupName }}</div>
          </div>
          <div>
            <LuckIdIcon
              v-if="this.infoType == 0"
              :inviteCode="userInfo.inviteCode"
              :userRank="userInfo.userRank"
              iconType="large"
              :vipType="userInfo.vipType"
              :inviteCodeType="userInfo.inviteCodeType"
              :listFlag="false"
            />
          </div>
        </div>
      </div>
      <!-- 签名 -->
      <div class="info-middle" v-if="noteMsg == 0">{{ noteInfo }}</div>
      <el-popover placement="bottom" width="400" trigger="click" :content="noteInfo" popper-class="info-popover" v-if="noteMsg == 1">
        <div slot="reference" class="info-middle info-note">{{ noteInfo }}</div>
      </el-popover>
      <el-divider class="info-divider"></el-divider>
      <!-- 好友-备注，地区，ID -->
      <div class="contact-form" v-if="this.infoType == 0">
        <el-row :gutter="20" class="info-area item-spacing">
          <el-col :span="5">
            <!-- 性别 -->
            <span>{{ $t('my_information_0009') }}</span>
          </el-col>
          <el-col :span="19" class="item-notes" style="margin-top: 0px;">
            <p>{{ userSex == 1 ? $t('my_information_0010') : userSex === 2 ? $t('my_information_0011') : '' }}</p>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="info-area item-spacing">
          <el-col :span="5">
            <!-- 备注 -->
            <span>{{ $t('Universal_0185') }}</span>
          </el-col>
          <el-col :span="19" class="item-notes">
            <editable-input
              :target-value="friendNotes"
              target-label="friendNotes"
              :place-holder="$t('Universal_0372')"
              @updateUserInfo="updateUserInfo"
              maxsize="18"
            />
          </el-col>
        </el-row>
        <el-row :gutter="20" class="info-area item-spacing">
          <el-col :span="5">
            <!-- 地区 -->
            <span>{{ $t('Universal_0212') }}</span>
          </el-col>
          <el-col :span="19" style="padding-left: 6px;">
            <div>{{ contactArea }}</div>
          </el-col>
        </el-row>
        <!-- <el-row :gutter="20" class="info-area item-spacing">
          <el-col :span="4">
            <span>ID</span>
          </el-col>
          <el-col :span="18">
            <div>{{contactId}}</div>
          </el-col>
        </el-row> -->
      </div>
      <!-- 群聊-群人数，地区，ID -->
      <div class="group-form" v-else>
        <el-row :gutter="20" class="info-area item-spacing">
          <el-col :span="labelWidth">
            <span v-if="!name">{{ $t('chat_comm_set_0030') }}</span>
            <span v-else>{{ $t('book_group_0027') }}</span>
          </el-col>
          <el-col :span="valueWidth">
            <div>{{ contactNum }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="info-area item-spacing" v-if="!name">
          <el-col :span="labelWidth">
            <span>{{ $t('Universal_0212') }}</span>
          </el-col>
          <el-col :span="valueWidth">
            <div>{{ contactArea }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="info-area item-spacing" v-if="!name">
          <el-col :span="labelWidth">
            <span>{{ $t('chat_createcommunity_0010') }}</span>
          </el-col>
          <el-col :span="valueWidth">
            <div>{{ groupTab | tabFilter(statusMap) }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="info-area item-spacing" v-if="!name">
          <el-col :span="labelWidth">
            <span>ID</span>
          </el-col>
          <el-col :span="valueWidth">
            <div>{{ contactId }}</div>
          </el-col>
        </el-row>
      </div>

      <!-- 发消息-按钮 -->
      <div class="info-btn">
        <el-button type="primary" @click="sendMsg">{{ $t('Universal_0359') }}</el-button>
      </div>

      <!-- 群聊-编辑资料 -->
      <div class="info-edit" v-if="this.infoType == 1 && authStatus != '3'">
        <el-button type="text" @click="editrelation" v-if="!name">{{ $t('chat_comm_set_0033') }}</el-button>
      </div>
    </div>
    <GroupInfoEdit :info="groupInfo" @refreshPage="refreshPage" ref="groupInfoEdit" />
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import DiscussionIcon from '@/components/memberIcon/DiscussionIcon';
import GroupInfoEdit from '../chat/group/components/GroupInfoEdit';
import EditableInput from '@/components/memberCard/EditableInput';
import MemberIcon from '@/components/memberIcon/MemberIcon';
import LevelIcon from '@/components/memberIcon/LevelIcon';
import LuckIdIcon from '@/components/memberIcon/luckIdIcon';
import { get_country_area, get_friend_user_info, set_member_notes } from '@/server.js';
import store from '@/store';
import { convertToPinyin } from '@/utils/pinyin';
import { contFriSize, contGrpSize } from '@/utils';
import SQLUtils from '@/components/db/sqlite.js';
import fileOperational from '@/services/fileOperational';

import  { imgView } from '@/utils/util.js'

export default {
  name: 'Info',
  //import引入的组件需要注入到对象中才能使用
  components: {
    EditableInput,
    GroupInfoEdit,
    DiscussionIcon,
    MemberIcon,
    LevelIcon,
    LuckIdIcon
  },
  data() {
    //这里存放数据
    return {
      id: '',
      contactInfo: {},
      contactName: this.$t('chat_search_0009'),
      groupName: this.$t('chat_search_0010'),
      // contactAvatar: require('../chat/images/default.png'),
      // groupAvatar: require('../chat/images/group_avtar.png'),
      contactAvatar:require('@/assets/images/default.png'),
      groupAvatar: require('@/assets/images/group_avtar.png'),
      noteInfo: this.$t('my_information_0012'),
      contactId: '-',
      contactArea: '-',
      contactNum: '-',
      groupTab: '-',
      infoType: 1,
      userSex: 0, //性别：1男，2女，0未知
      groupInfo: {},
      groupProfile: '',
      people: '',
      groupCode: '',
      region: '',
      userInfo: {},
      userNickName: '',
      gender: '',
      userHeadImg: '',
      personalSign: '',
      friendNotes: '',
      inviteCode: '',
      country: '',
      city: '',
      countryName: '',
      cityName: '',
      authStatus: '',
      groupType: '',
      name: '',
      statusMap:  {
        // "": "-",
        // 0: "-",
        1: this.$t('chat_createcommunity_0012'),
        2: "BTC",
        3: this.$t('chat_createcommunity_0014'),
        4: this.$t('chat_createcommunity_0015'),
        5: this.$t('chat_createcommunity_0016'),
        6: this.$t('chat_createcommunity_0017'),
        7: "Defi",
        8: this.$t('chat_createcommunity_0019'),
        9: this.$t('chat_createcommunity_0020'),
        10: this.$t('chat_createcommunity_0021')
      }
    };
  },
  filters: {
    tabFilter(status, statusMap) {
      return statusMap[status]||"";
    }
  },
  //监听属性 类似于data概念
  computed: {
    labelWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return 7;
      } else {
        return 14;
      }
    },
    valueWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return 17;
      } else {
        return 10;
      }
    },
    noteMsg: function() {
      if (this.getBLen(this.noteInfo) == 86 || this.getBLen(this.noteInfo) >= 89) {
        return 1;
      } else {
        return 0;
      }
    }
  },
  //监控data中的数据变化
  watch: {
    async $route() {
      await this.init();
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.infoType = this.$route.query.flag; //2讨论组
    this.id = this.$route.query.id;
    this.contactInfoShow();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  //方法集合
  methods: {
    // 打开图片查看器
    openImgView (originAvatarURl) {
      console.log('originAvatarURl=', originAvatarURl)
      imgView(originAvatarURl, this.id)
    },
    findImage(image) {
      return fileOperational.getImage(image,true);
    },
    init() {
      this.contactInfoShow();
    },
    async refreshPage() {
      this.init();
      await this.$store.dispatch('GET_GROUP_LIST');
    },
    async contactInfoShow() {
      // flag=0联系认66；
      this.name = this.$route.query.name;
      this.infoType = this.$route.query.flag;
      console.log(this.infoType);
      this.userInfo = {};
      if (this.$route.query.flag == 0) {
        // 查本地表，获取-性别、介绍（签名）、备注、地区、头像、昵称、
        let res = await get_friend_user_info({ id: this.$route.query.id });
        console.log('性别----》',res);
        this.userInfo = res.data || {};
        if(res?.data?.id&&res?.data?.userNickName){
          this.id = this.userInfo.id;
          this.contactName = this.userInfo.userNickName;
          this.userSex = this.userInfo.gender;
          this.contactAvatar = this.userInfo.userHeadImg || this.contactAvatar;
          this.noteInfo = this.userInfo.personalSign;
          this.friendNotes = this.userInfo.friendNotes;
          this.contactId = this.userInfo.inviteCode;
          this.groupTab = this.userInfo.groupTab;
          this.getRegion();
          this.updateFriendInfo();
        }else{
          console.log('异常数据',res?.data);
        }
      }
      // flag=1群聊
      if (this.$route.query.flag == 1) {
        // 查本地表，获取-简介（签名）、地区、昵称、头像、群人数
        let groupInfo = await SQLUtils.retrieveGroupsInfo(this.$route.query.id);
        groupInfo.authStatus = this.$route.query.authStatus;
        this.authStatus = this.$route.query.authStatus;
        if (groupInfo && groupInfo.country && groupInfo.city) {
          groupInfo.countryName = await SQLUtils.getTAreaCountryOrCityName(groupInfo.country);
          groupInfo.cityName = await SQLUtils.getTAreaCountryOrCityName(groupInfo.city);
          groupInfo.region = groupInfo.countryName + '-' + groupInfo.cityName;
          this.contactArea = groupInfo.region;
          this.country = groupInfo.country;
          this.city = groupInfo.city;
          this.countryName = groupInfo.countryName;
          this.cityName = groupInfo.cityName;
        } else {
          groupInfo.region = '';
          groupInfo.country = '';
          groupInfo.city = '';
          this.contactArea = '';
          this.country = '';
          this.city = '';
        }
        console.log('res', groupInfo);
        this.id = groupInfo.id;
        this.groupName = groupInfo.groupName;
        if (groupInfo.groupAvatar) {
          this.groupAvatar = groupInfo.groupAvatar;
        } else {
          // this.groupAvatar = require('../chat/images/group_avtar.png');
          this.groupAvatar = require('@/assets/images/group_avtar.png');
        }
        this.noteInfo = groupInfo.groupProfile;
        this.contactNum = groupInfo.people;
        this.contactId = groupInfo.groupCode;
        this.groupType = groupInfo.groupType;
        this.groupTab = groupInfo.groupTab;
      }
    },
    async getRegion() {
      let { areaCountryCode = '', areaCityCode = '' } = this.userInfo || {};
      // let areaCountryCode = "country" , areaCityCode = "city";
      if (this.userInfo && areaCountryCode && areaCityCode) {
        let res = await get_country_area({
          codes: areaCountryCode + "," + areaCityCode,
        });
        let [country, city] = [
          res.data?.[areaCountryCode] || {},
          res.data?.[areaCityCode] || {},
        ];
        this.contactArea =
          country?.name && city?.name
            ? `${country.name}-${city.name}`
            : country?.name || city?.name || '';
      } else {
        this.userInfo.areaCityCode = '';
        this.userInfo.areaCountryCode = '';
        this.contactArea = '';
      }
    },
    async updateFriendInfo() {
      let item = {
        friend_id: this.userInfo.id,
        friend_nick_name: this.userInfo.userNickName,
        friend_nick_name_pinyin: convertToPinyin(this.userInfo.userNickName)||'',
        friend_head_img: this.userInfo.userHeadImg,
        friend_friendNotes: this.userInfo.friendNotes,
        friend_friendNotes_pinyin: convertToPinyin(this.userInfo.friendNotes)||'',
        invite_code: this.userInfo.inviteCode,
        vipType: this.userInfo.vipType,
        inviteCodeType: this.userInfo.inviteCodeType,
        userRank: this.userInfo.userRank
      };
      let searchRet = await window.vm
        .$knex('t_contacts')
        .where({ friend_id: this.userInfo.id })
        .select();
      if (searchRet && searchRet.length > 0) {
        //更新
        await window.vm
          .$knex('t_contacts')
          .where('friend_id', '=', this.userInfo.id)
          .update(item);
      }
      await this.$store.dispatch('GET_FRIENDS_LIST');
    },
    async updateUserInfo(label, ...values) {
      let value = null;
      if (values.length == 1) {
        value = values[0];
        value = value.trim() == '' ? null : value.trim();
      }
      if (label == 'friendNotes') {
        this.friendNotes = value;
        let params = {
          friendId: this.id,
          friendNotes: value == '' ? null : value
        };
        let res = await set_member_notes(params);
        if (res.code == '200') {
          //更新数据库
          await window.vm
            .$knex('t_contacts')
            .update('friend_friendNotes', this.friendNotes)
            .update('friend_friendNotes_pinyin', this.friendNotes == undefined ? '' : convertToPinyin(this.friendNotes))
            .where('friend_id', this.id);
          this.$message.success(res.msg);
          store.dispatch('GET_LAST_MSG_LIST');
          store.dispatch('GET_FRIENDS_LIST');
        }
      }
    },
    sendMsg() {
      if (this.infoType == 0) {
        // 好友-发消息
        const userId = localStorage.userId;
        const current = {
          id: this.id,
          fromId: this.id,
          targetId: userId,
          fromType: '999',
          targetType: 1, //单聊
          msgType: 1, //默认文本
          timer: new Date().getTime(),
          uniqueCode: contFriSize(userId, this.id),
          friendName: encodeURI(this.contactName)
        };
        this.$store.dispatch('ADD_LAST_MSG_LIST', { ...current, isJump: true });
        this.$store.dispatch('SET_CURRENT_CHAT', current);
        this.$router.push({
          path: '/app/chat/single/message',
          query: current
        });
      } else {
        // 群-发消息
        let current = {
          targetId: this.id,
          id: this.id,
          uniqueCode: contGrpSize(this.id),
          sessionName: this.groupName,
          sessionIcon: this.groupAvatar,
          fromName: this.$store.state.common.userInfo.nickName,
          targetType: 2, //单聊
          msgType: 1, //默认文本
          // item,
          fromType: '999',
          groupType: this.groupType
        };
        this.$store.dispatch('ADD_LAST_MSG_LIST', { ...current, isJump: true });
        this.$store.dispatch('SET_CURRENT_CHAT', current);
        if (this.groupType == 1) {
          this.$router.push({
            path: '/app/chat/group/message',
            query: current
          });
        } else {
          this.$router.push({
            path: '/app/chat/discussion/message',
            query: current
          });
        }
      }
    },
    // 社区信息编辑
    editrelation() {
      this.groupInfo.id = this.id;
      this.groupInfo.groupAvatar = this.groupAvatar;
      this.groupInfo.groupName = this.groupName;
      this.groupInfo.groupProfile = this.noteInfo;

      this.groupInfo.countryName = this.countryName;
      this.groupInfo.cityName = this.cityName;
      this.groupInfo.country = this.country;
      this.groupInfo.city = this.city;
      this.groupInfo.groupTab = this.groupTab;
      // this.$refs.groupInfoEdit.onPop();

      this.$nextTick(async () => {
        await this.$refs.groupInfoEdit.onPop();
      });
    },
    // onPop() {
    //     this.groupEditVisible = true;
    // },
    // 计算中英文长度
    getBLen(str) {
      if (str == null) return 0;
      if (typeof str != 'string') {
        str += '';
      }
      return str.replace(/[^\x00-\xff]/g, '01').length;
    },
    // 处理图片404问题
    replaceImg() {
      return true;
    }
  },
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
.info {
  width: 100%;
  height: 350px;
  max-height: 400px;
  padding-top: 70px;

  .info-contact {
    width: 325px;
    margin: 0 auto auto;

    /deep/ .el-popover {
      height: 200px;
      overflow: auto;
    }

    .info-top {
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .info-contact-name {
        align-items: center;
        .into-top-name {
          max-width: 200px;
          overflow: hidden;
          word-break: break-all;
          font-size: 22px;
          white-space: pre;
          text-overflow: ellipsis;
        }

        .info-top-icon {
          width: 18px;
          height: 18px;
          margin: 27px 32px 27px 17px;
        }
      }

      .info-group-name {
        display: inline-block;

        .group-nickname {
          width: 218px;
          font-size: 22px;
          font-weight: 500;
          color: #333333;
          line-height: 30px;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
          hyphens: auto;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          margin-top: 6px;
          white-space: pre-wrap;
        }
      }

      .info-top-avatar {
        display: block;
        /*float: right;
        width: 72px;
        height: 72px;*/
        margin-right: 5px;

        /deep/ .el-avatar {
          width: 100%;
          height: 100%;
        }

        /deep/ .el-avatar img {
          width: 72px;
          height: 72px;
          // width: 100%;height:100%;
        }
      }
    }

    .info-middle {
      font-size: 14px;
      font-weight: 500;
      color: #999999;
      line-height: 20px;
      margin-top: 20px;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-top: 26px;
      // text-indent: 15px;
    }
    .info-note {
      cursor: pointer;
    }

    .info-divider {
      margin-top: 30px;
    }
    /deep/ .el-divider {
      background-color: #ececec;
    }

    .contact-form,
    .group-form {
      margin-top: 30px;
      font-size: 14px;

      font-weight: 500;
      color: #333333;
      line-height: 20px;

      .info-area span {
        width: 100%;
        display: inline-block;
        font-size: 14px;

        font-weight: 500;
        color: #999999;
      }

      .item-spacing {
        margin-bottom: 10px;
      }

      .item-notes {
        margin-top: -3px;
        margin-left: -4px;
        line-height: 20px;
      }
    }

    // .group-form{
    //   .info-area span{
    //   text-align: right;
    //   }
    // }

    .info-btn {
      margin-top: 50px;
      text-align: center;

      /deep/ .el-button {
        width: 140px;
        height: 40px;
      }
    }

    .info-edit {
      margin-top: 15px;
      text-align: center;
    }
  }
}
</style>
