<template>
  <div>
    <el-dialog
      :title="$t('book_group_0012')"
      :visible.sync="groupUpgradeVisible"
      append-to-body
      :modal-append-to-body="false"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @open="onOpen"
      @close="onClose"
      width="500px"
      center
      class="discussion"
    >
      <div class="chatset">
        <div class="formbox groupavatar">
          <el-form ref="creatformm" :rules="creatformRules" :model="creatform" :label-width="labelWidth">
            <el-form-item
                :label="$t('chat_createcommunity_0002')"
                prop="groupAvatar" required class="groupWord-img">
              <div class="demo-block">
                <!-- <el-upload
              v-loading="imgLoading" 
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(255, 255, 255, 0.5)"
              ref="upload"
              :show-file-list="false"
              :action="uploadUrl"
              :data="uploadData"
              :headers="headers"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload" >
              <img v-if="groupAvatarUrl" :src="groupAvatarUrl" class="group-avatar" alt />
              <i v-else class="el-icon-circle-plus user-uploader-icon"></i>
            </el-upload> -->
                <Copper ref="copperBox" @uploadCropper="uploadCropper" :avater="groupAvatarUrl"></Copper>
              </div>
            </el-form-item>

            <el-form-item
                :label="$t('chat_createcommunity_0003')"
                prop="groupName" class="groupWord">
              <el-input
                size="small"
                :minlength="1"
                :maxlength="30"
                v-model="creatform.groupName"
                ref="groupname"
                show-word-limit
                class="limtinput"
              ></el-input>
            </el-form-item>
            <el-form-item
                :label="$t('chat_createcommunity_0006')"
                required class="group-typesel">
              <el-radio-group v-model="creatform.groupStatus">
                <el-radio :label="1">{{ $t('chat_createcommunity_0008') }}</el-radio>
                <el-radio :label="2">{{ $t('chat_createcommunity_0009') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('Universal_0205')" prop="country" class="typesel">
              <el-row v-if="selectRefresh">
                <el-col :span="countrySpan">
                  <el-select
                    size="mini"
                    v-model="creatform.country"
                    clearable
                    filterable
                    :placeholder="$t('Universal_0208')"
                    popper-class="noDrag"
                    @change="getarea" 
                  >
                    <el-option :label="item.name" :value="item.id" v-for="item in countryList" :key="item.id"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="countrySpan" :offset="$i18n.locale.includes('zh') ? 2 : 0">
                  <el-form-item label prop="city">
                    <el-select size="mini" v-model="creatform.city" clearable filterable
                               :placeholder="$t('Universal_0209')" popper-class="noDrag">
                      <el-option :label="item.name" :value="item.id" v-for="item in areaList" :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item :label="$t('chat_createcommunity_0010')" prop="groupTab" class="group-info-name">
              <el-row v-if="selectRefresh">
                <el-select size="mini" v-model="creatform.groupTab" clearable filterable
                           :placeholder="$t('chat_createcommunity_0035')">
                  <el-option v-for="item in tabList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-row>
            </el-form-item>
            <el-form-item :label="$t('chat_comm_set_0002')" prop="type" class="notegroup">
              <el-input
                show-word-limit
                class="limtinput"
                type="textarea"
                :maxlength="500"
                :rows="4"
                :placeholder="$t('chat_createcommunity_0033')"
                v-model="creatform.groupProfile"
              ></el-input>
            </el-form-item>
            <el-form-item class="update-geoup">
              <div class="right">
                <el-button size="mini" type="primary" @click="upgradeSubmit('creatformm')">
                  {{ $t('Universal_0045') }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { discussionUpgradeGroup } from './server';
import { upload_images_avatar } from '@/server.js';
import { contGrpSize } from '@/utils';
import { mapMutations } from 'vuex';
import { convertToPinyin } from '@/utils/pinyin';
import { CLEAR_CHAT } from '@/store/types';
import SQLUtils from '@/components/db/sqlite.js';
import Copper from '@/components/chat/copper';
export default {
  name: 'GroupUpgrade',
  components: { Copper },
  props: {
    info: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      groupUpgradeVisible: false,
      countryList: [],
      areaList: [],
      creatform: {
        id: '',
        groupName: '',
        groupAvatar: '',
        groupStatus: 1,
        groupProfile: '',
        city: '',
        country: '',
        groupTab: ''
      },
      linkurl: '',
      groupCode: '',
      groupobj: {},
      uploadUrl: upload_images_avatar(),
      uploadData: {},
      headers: {
        Authorization: localStorage.accessToken
      },
      groupAvatarUrl: '',
      imgLoading: false,
      selectRefresh:false,
    };
  },
  //监听属性 类似于data概念
  computed: {
    creatformRules() {
      return {
        groupAvatar: [{ required: true, message: this.$t('chat_createcommunity_0034'), trigger: 'change' }],
        groupName: [
          { required: true, message: this.$t('chat_createcommunity_0004'), trigger: 'blur' },
          {
            min: 1,
            max: 30,
            trigger: 'blur'
          },
          {
            pattern: /^((?!didi).)+$/i,
            message: this.$t('chat_comm_set_0017')
          }
        ],
        groupStatus: [{ required: true, message: this.$t('chat_createcommunity_0032') }],
        country: [{ message: this.$t('Universal_0208'), trigger: 'change' }],
        city: [{ trigger: 'change' }]
        // groupTab:[ { message: "为你的群贴上标签", trigger: "blur" },],
      };
    },
    tabList() {
      return [
        { value: 1, label: this.$t('chat_createcommunity_0012') },
        { value: 2, label: 'BTC' },
        { value: 3, label: this.$t('chat_createcommunity_0014') },
        { value: 4, label: this.$t('chat_createcommunity_0015') },
        { value: 5, label: this.$t('chat_createcommunity_0016') },
        { value: 6, label: this.$t('chat_createcommunity_0017') },
        { value: 7, label: 'Defi' },
        { value: 8, label: this.$t('chat_createcommunity_0019') },
        { value: 9, label: this.$t('chat_createcommunity_0020') },
        { value: 10, label: this.$t('chat_createcommunity_0021') }
      ];
    },
    labelWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return '100px';
      } else {
        return '170px';
      }
    },
    countrySpan() {
      if (this.$i18n.locale.includes('zh')) {
        return 11;
      } else {
        return 24;
      }
    }
  },
  //监控data中的数据变化
  watch: {
    '$i18n.locale': {
      deep: true,
      immediate: true,
      handler: function () {
        this.post_base_country_list();
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
  },
  methods: {
    async uploadCropper(url) {
      //调接口上传裁剪的头像
      this.groupAvatarUrl = url;
      this.creatform.groupAvatar = url;
    },
    onPop() {
      this.groupUpgradeVisible = true;
      this.creatform.id = this.info.id;
      this.creatform.groupName = this.info.groupName;
      this.$nextTick(() => {
        this.$refs.groupname.select();
        this.$refs.groupname.focus();
      });
    },
    onOpen() {
      this.selectRefresh=true;
    },
    onClose() {
      console.log('onclose');
      this.areaList = [];
      this.resetForm();
      this.selectRefresh=false;
      this.groupUpgradeVisible = false;
    },

    ...mapMutations([CLEAR_CHAT]),
    resetForm() {
      this.creatform = {
        groupName: '',
        groupStatus: 1,
        groupProfile: '',
        city: '',
        country: '',
        groupAvatar: '',
        groupTab: ''
      };
      this.groupAvatarUrl = '';
      if (this.$refs['creatformm'] != undefined) {
        this.$refs['creatformm'].resetFields();
        this.imgLoading = false;
      }
    },
    async post_base_country_list() {
      this.countryList = await SQLUtils.getTAreaCountryList();
    },
    async getarea(val) {
      this.areaList = await SQLUtils.getTAreaCityList(val);
      this.creatform.city = '';
    },
    async gotoChat() {
      // const index = this.$store.chat.lastmsgList.findIndex(item => item.id == this.groupId);
      // Vue.set(this.$store.chat.lastMsgList[index], 'groupType', 1);
      // Vue.set(this.$store.chat.lastMsgList[index], 'sessionIcon', this.creatform.groupAvatar);
      let current = {
        id: this.groupId,
        groupType: 1,
        targetId: this.groupId,
        uniqueCode: contGrpSize(this.groupId),
        sessionId: this.groupobj.headImg,
        sessionName: this.groupobj.groupName,
        item: this._groupInfo
      };
      await this.$store.dispatch('SET_CURRENT_CHAT', current);
      this.$router.push({
        path: '/app/chat/group/message',
        query: {
          id: this.groupId,
          targetId: this.groupId,
          groupType: 1,
          timer: new Date().getTime(),
          friendName: encodeURI(this.groupobj.groupName),
          uniqueCode: contGrpSize(this.groupId)
        }
      });
    },
    async createGroupInfo(item) {
      const obj = {
        group_id: item.id,
        group_name: item.groupName,
        group_status: item.groupStatus,
        group_profile: item.groupProfile,
        group_avatar: item.groupAvatar,
        group_avatar_local: '',
        add_check: item.addCheck,
        invite_auth: item.inviteAuth,
        country: item.country,
        city: item.city,
        screenshotsReminderStatus: item.screenshotsReminderStatus,
        forbiddenWordsStatus: item.forbiddenWordsStatus,
        memberSingleChatStatus: item.memberSingleChatStatus,
        sendPicturesStatus: item.sendPicturesStatus,
        sendConnectionStatus: item.sendConnectionStatus,
        copyMessagesStauts: item.copyMessagesStauts,
        sendRedpacketStatus: item.sendRedpacketStatus,
        create_time: item.createdOn,
        save_time: item.saveTime,
        people: item.people,
        member_level_status: item.memberLevelStatus,
        group_level: item.groupLevel,
        updatedOn: item.updatedOn,
        code: '',
        group_name_pinyin: convertToPinyin(item.groupName),
        is_show: 'true',
        group_code: item.groupCode,
        group_type: item.groupType,
        groupTab: item.groupTab
      };
      this._groupInfo = obj;
      return await window.vm.$knex('t_groups').insert(obj);
    },
    async createGroupMember(memberList) {
      console.log('createGroupMember');
      const list = [];
      for (let item of memberList) {
        list.push({
          id: item.userId,
          group_id: item.groupId,
          auth_status: item.authStatus,
          nick_name: item.nickName,
          user_head_img: item.userHeadImg,
          user_head_img_local: '',
          member_notes: item.memberNotes,
          member_notes_pinyin: item.memberNotes == undefined ? '' : convertToPinyin(item.memberNotes),
          is_show: 'true',
          forbiddenWordsStatus: 0,
          muteNotifications: 0,
          additionalStatus: 0,
          mutedStatus: 0,
          stickyStatus: 0
        });
      }
      const cc = await window.vm.$knex.batchInsert('t_groups_member', list, 10);
      return cc;
    },
    async createGroupAuth(memberAuthList) {
      console.log('createGroupAuth');
      const list = [];
      for (let item of memberAuthList) {
        list.push({
          group_id: item.groupId,
          user_id: item.userId,
          member_leval: item.memberLeval,
          muted_status: item.mutedStatus,
          additional_status: item.additionalStatus,
          mute_notifications: item.muteNotifications,
          forbidden_words_status: item.forbiddenWordsStatus,
          sticky_status: item.stickyStatus,
          user_level: item.userLevel
        });
      }
      console.log('list', list);
      const cc = await window.vm.$knex.batchInsert('t_groups_member_auth', list, 10);
      console.log(cc);
      return cc;
    },
    async upgradeSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          console.log('imgLoading', this.imgLoading);
          if (this.imgLoading) {
            this.$message.error(this.$t('chat_0093'));
            return;
          }
          let params = JSON.parse(JSON.stringify(this.creatform));
          console.log('--------------', params);
          this.convertCountryCode(params);
          discussionUpgradeGroup(params)
            .then(async res => {
              if (res.code == 200) {
                this.$emit('updateContactListAndRouter', this.info['id']);//查询群聊列表、 讨论组列表
                this.groupUpgradeVisible = false;
              } else {
                this.$message.error(res.data.msg);
                console.log('设计讨论组失败了。。。。。。');
                this.convertCountryId();
              }
            })
            .catch(err => {
              console.error('讨论组升级失败', err);
            });
        } else {
          return false;
        }
      });
    },
    convertCountryCode(item) {
      if (this.creatform.country && this.creatform.city) {
        item.country = this.countryList.find(item => item.id == this.creatform.country).code;
        item.city = this.areaList.find(item => item.id == this.creatform.city).code;
      } else {
        item.country = '';
        item.city = '';
      }
    },
    convertCountryId() {
      if (this.creatform.country && this.creatform.city) {
        this.creatform.country = this.countryList.find(item => item.code == this.creatform.country).id;
        this.creatform.city = this.areaList.find(item => item.code == this.creatform.city).id;
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error(this.$t('Universal_0369'));
        return false;
      } else {
        if (!isLt2M) {
          this.$message.error(this.$t('Universal_0390'));
          return false;
        }
      }
      this.imgLoading = true;
    },
    handleAvatarSuccess(res, file) {
      if (res.code == 200) {
        this.imgLoading = false;
        this.$message({
          message: this.$t('Universal_0110'),
          type: 'success',
          duration: 1500,
          onClose: () => {}
        });
        this.groupAvatarUrl = URL.createObjectURL(file.raw);
        this.creatform.groupAvatar = res.data.path;
      } else {
        this.$message.error(res.msg);
      }
    }
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
<style lang="less">
.chatset {
  .el-input__inner,
  .el-textarea__inner {
    background: #fff;
    border: 1px solid rgba(215, 215, 215, 1);
  }
  .el-textarea .el-input__count {
    background: #fff;
  }
}
</style>

<style scoped>
.group-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.user-uploader-icon {
  font-size: 40px;
  color: #e9e8e8;
  text-align: center;
}
</style>

<style lang="less" scoped>
//@import url(); 引入公共css类
.discussion {
  /deep/ .el-dialog__header {
    padding: 10px 20px;
  }
  /deep/ .el-dialog__body {
    padding: 10px 20px;
  }
}

.chatset {
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  overflow-y: scroll;
  .formbox {
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px 0 0;
  }

  .right {
    text-align: right;
    /deep/ .el-button--primary {
      margin-top: 30px;
    }
  }
}

.chatset {
  /deep/ .el-form-item__label {
    color: #333;
    font-size: 13px;
    font-weight: 400;
  }

  /deep/ .el-input__inner,
  .el-textarea__inner {
    color: #333;
    font-size: 13px;
    font-weight: 400;
  }

  /deep/ .el-radio__label {
    color: #333;
    font-size: 13px;
    font-weight: 400;
  }

  /deep/ .limtinput textarea {
    min-height: 50px;
    max-height: 105px;
    font-size: 13px;
  }

  /deep/ .el-button--primary,
  /deep/ .el-button--default {
    width: 84px;
    height: 28px;
    margin-top: 13px;
    font-size: 13px;
  }
  /deep/ .el-form-item__error {
    padding-top: 0;
  }
  .group-typesel{
    margin-bottom: 0;
  }
  .typesel {
    margin-bottom: 6px;
  }
  .groupWord-img{
    margin-bottom: 10px;
  }
  .groupWord {
    margin-bottom: 0;
  }
  .notegroup {
    margin-bottom: 0;

    /deep/ .el-form-item__content {
      line-height: 20px;
    }
    /deep/ .el-textarea .el-input__count {
      bottom: -20px;
    }

    /deep/ .el-textarea__inner {
      padding: 8px;
    }
  }
  .copyLink /deep/ .el-input__inner {
    font-size: 12px;
  }
}

.demo-block {
  height: 50px;
  /deep/ .el-loading-spinner {
    left: -20%;
    margin-top: -25px;
  }

  /deep/ .el-icon-loading {
    color: #fff;
    font-size: 12px;
  }
}
.group-info-name {
  margin-bottom: 12px;
}
.update-geoup{
  margin-bottom: 5px;
}
/deep/ .el-select .el-input .el-select__caret {
  &.el-icon-circle-close {
    line-height: 40px;
  }
}
</style>
