<!--  -->
<template>
  <div class="chatset">
    <!-- <p
      style="text-align:right;color:#409EFF;font-size:16px;padding-right:20px;margin-bottom:20px;"
      v-if="step === 2"
      @click="gotoChat()"
    >跳过</p>-->
    <el-steps :active="activeStep" align-center>
      <el-step :title="$t('chat_createcommunity_0001')"></el-step>
      <!-- <el-step title="群聊设置"></el-step> -->
      <el-step :title="$t('chat_comm_set_0019')"></el-step>
    </el-steps>
    <br />
    <div class="formbox groupavatar">
      <el-form
        ref="creatformm"
        v-if="step === 1"
        :rules="creatformRules"
        :model="creatform"
        :label-width="labelWidth"
      >
        <el-form-item
          :label="$t('chat_createcommunity_0002')"
          prop="groupAvatar"
          required
          class="groupImg"
        >
          <div class="demo-block">
            <Copper
              ref="copperBox"
              @uploadCropper="uploadCropper"
              :avater="groupAvatarUrl"
            ></Copper>
          </div>
        </el-form-item>
        <el-form-item :label="$t('chat_createcommunity_0003')" prop="groupName" class="groupWord-name">
          <el-input
            size="small"
            :minlength="1"
            :maxlength="30"
            v-model="creatform.groupName"
            show-word-limit
            class="limtinput"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('chat_createcommunity_0006')" required class="typesel">
          <el-radio-group v-model="creatform.groupStatus">
            <el-radio :label="1">{{ $t('chat_createcommunity_0008') }}</el-radio>
            <el-radio :label="2">{{ $t('chat_createcommunity_0009') }}</el-radio>
          </el-radio-group>
          <!-- <p class="tip">公开群聊可被更多人发现</p> -->
        </el-form-item>
        <el-form-item :label="$t('Universal_0205')" prop="country" class="groupWord-area">
          <el-row>
            <el-col :span="11">
              <el-select
                size="mini"
                v-model="creatform.country"
                clearable
                filterable
                :placeholder="$t('Universal_0208')"
                popper-class="noDrag"
                @change="getarea"
                class="select_box"
              >
                <el-option
                  :label="item.name"
                  :value="item.id"
                  v-for="item in countryList"
                  :key="item.id"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="11" :offset="2">
              <el-form-item label prop="city">
                <el-select
                  size="mini"
                  v-model="creatform.city"
                  clearable
                  filterable
                  :placeholder="$t('Universal_0209')"
                  popper-class="noDrag"
                  class="select_box"
                >
                  <el-option
                    :label="item.name"
                    :value="item.id"
                    v-for="item in areaList"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :label="$t('chat_createcommunity_0010')" prop="groupTab" class="formTab">
          <el-row>
            <el-select
              size="mini"
              v-model="creatform.groupTab"
              clearable
              filterable
              :placeholder="$t('chat_createcommunity_0035')"
              class="select_box"
            >
              <el-option
                v-for="item in tabList"
                :key="item.value"
                :label="item.label"
                :value="item.value.toString()"
              ></el-option>
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
        <el-form-item class="next-btn">
          <div class="right">
            <el-button
              size="mini"
              type="primary"
              :loading="btnloading"
              @click="CloseDialog()"
              >{{ $t('Universal_0063') }}</el-button
            >
            <el-button
              size="mini"
              type="primary"
              :loading="btnloading"
              @click="firstSubmit('creatformm')"
            >
              {{ $t('Universal_0069') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <!-- <el-form
        ref="setform"
        v-if="step === 2"
        :rules="setform"
        :model="setform"
        label-width="120px">
        <el-form-item label="群聊欢迎语" prop="welcome">
          <el-input
            type="textarea"
            :maxlength="500"
            :rows="8"
            placeholder="设置群欢迎语，用户加入群聊时即可收到欢迎语"
            v-model="setform.welcome"
          ></el-input>
        </el-form-item>
        <el-form-item label="群公告" prop="notice">
          <el-input
            type="textarea"
            :maxlength="500"
            :rows="8"
            placeholder="您可以发布一份公告，以便群成员更好的了解群"
            v-model="setform.notice"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <div class="demo-block">
            <el-upload
              class="avatar-uploader"
              action="https://jsonplaceholder.typicode.com/posts/"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <span class="tip">仅支持添加一张与公告内容相关的图片</span>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="center">
            <el-button type="primary" @click="firstSubmit('creatform')">下一步</el-button>
          </div>
        </el-form-item>
      </el-form>-->
      <div class="finish" v-if="step === 2">
        <p>{{ $t('chat_addfriend_0016') }}</p>
        <br />
        <div class="mid">
          <!-- <img src="../../assets/images/success.png" /> -->
          <!-- <span>群邀请链接已创建</span> -->
          <!-- <p>您可以将链接分享至DiDi、QQ、微信等应用内，好友通过链接即可加入群聊</p> -->
          <el-input
            v-model="linkurl"
            readonly
            style="width: 300px"
            id="link"
            class="copyLink"
          ></el-input>
          <span
            v-clipboard:copy="linkurl"
            v-clipboard:success="onCopy"
            class="copy"
            >{{ $t('chat_0026') }}</span
          >
        </div>
        <br />
        <br />
        <el-button size="mini" type="primary" @click="gotoChat()"
          >{{ $t('Universal_0060') }}</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { createGroup, queryGroupByGroupId } from "./server";
import { upload_images_avatar } from "@/server.js";
import { contGrpSize } from "@/utils";
import { mapState, mapMutations } from "vuex";
import { convertToPinyin } from "@/utils/pinyin";
import { CLEAR_CHAT } from "@/store/types";
import SQLUtils from "@/components/db/sqlite.js";
import Copper from "@/components/chat/copper";
import bus from "@/utils/eventbus";
export default {
  //import引入的组件需要注入到对象中才能使用
  components: { Copper },
  data() {
    //这里存放数据
    return {
      btnloading: false,
      activeStep: 1,
      step: 1,
      countryList: [],
      areaList: [],
      creatform: {
        groupAvatar: "",
        groupBigAvatar: "",
        groupName: "",
        groupStatus: 1,
        groupProfile: "",
        city: "",
        country: "",
        groupTab: "",
      },
      /*creatformRules: {
        groupAvatar: [
          { required: true, message: this.$t('chat_createcommunity_0034'), trigger: "change" },
        ],
        groupName: [
          { required: true, message: this.$t('chat_createcommunity_0004'), trigger: "blur" },
          {
            min: 1,
            max: 30,
            trigger: "blur",
          },
          {
            pattern: /^((?!didi).)+$/i, ///^didi/ig,
            message: this.$t('chat_comm_set_0017'),
          },
        ],
        groupStatus: [{ required: true, message: this.$t('chat_createcommunity_0032') }],
        country: [{ message: this.$t('Universal_0208'), trigger: "change" }],
        city: [{ trigger: "change" }],
        groupTab: [{ message: this.$t('chat_createcommunity_0035'), trigger: "change" }],
      },*/
      setform: {
        welcome: "",
        notice: "",
        noticePic: "",
      },
      imageUrl: "",
      linkurl: "",
      groupCode: "",
      groupobj: {},
      uploadUrl: upload_images_avatar(),
      uploadData: {},
      headers: {
        Authorization: localStorage.accessToken,
      },
      groupAvatarUrl: "",
      imgLoading: false,
      /*tabList: [
        { value: 1, label: this.$t('chat_createcommunity_0012') },
        { value: 2, label: "BTC" },
        { value: 3, label: this.$t('chat_createcommunity_0014') },
        { value: 4, label: this.$t('chat_createcommunity_0015') },
        { value: 5, label: this.$t('chat_createcommunity_0016') },
        { value: 6, label: this.$t('chat_createcommunity_0017') },
        { value: 7, label: "Defi" },
        { value: 8, label: this.$t('chat_createcommunity_0019') },
        { value: 9, label: this.$t('chat_createcommunity_0020') },
        { value: 10, label: this.$t('chat_createcommunity_0021') },
      ],*/
    };
  },
  //监听属性 类似于data概念
  computed: {
    creatformRules() {
      return {
        groupAvatar: [
          { required: true, message: this.$t('chat_createcommunity_0034'), trigger: "change" },
        ],
        groupName: [
          { required: true, message: this.$t('chat_createcommunity_0004'), trigger: "blur" },
          {
            min: 1,
            max: 30,
            trigger: "blur",
          },
          {
            pattern: /^((?!didi).)+$/i, ///^didi/ig,
            message: this.$t('chat_comm_set_0017'),
          },
        ],
        groupStatus: [{ required: true, message: this.$t('chat_createcommunity_0032') }],
        country: [{ message: this.$t('Universal_0208'), trigger: "change" }],
        city: [{ trigger: "change" }],
        groupTab: [{ message: this.$t('chat_createcommunity_0035'), trigger: "change" }],
      };
    },
    tabList() {
      return [
        { value: 1, label: this.$t('chat_createcommunity_0012') },
        { value: 2, label: "BTC" },
        { value: 3, label: this.$t('chat_createcommunity_0014') },
        { value: 4, label: this.$t('chat_createcommunity_0015') },
        { value: 5, label: this.$t('chat_createcommunity_0016') },
        { value: 6, label: this.$t('chat_createcommunity_0017') },
        { value: 7, label: "Defi" },
        { value: 8, label: this.$t('chat_createcommunity_0019') },
        { value: 9, label: this.$t('chat_createcommunity_0020') },
        { value: 10, label: this.$t('chat_createcommunity_0021') },
      ];
    },
    ...mapState({
      personalAppealInfo: (state) => {
        return state.common.personalAppealInfo;
      },
    }),
    labelWidth() {
      if (this.$i18n.locale.includes('zh')) {
        return '100px';
      } else {
        return '170px';
      }
    }
  },
  //监控data中的数据变化
  watch: {},
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    bus.$on('changeLanguage',(lang)=>{   
      this.areaList=[];
      this.post_base_country_list(lang);
    });
    this.$emit("boxTitleFn", this.$t('chat_createcommunity_0001'));
  },
  //方法集合
  methods: {
    ...mapMutations([CLEAR_CHAT]),
    async uploadCropper(smallUrl, bigUrl) {
      //调接口上传裁剪的头像
      this.groupAvatarUrl = smallUrl; //传给子
      this.creatform.groupAvatar = smallUrl; //传给接口
      this.creatform.groupBigAvatar = bigUrl; //传给接口
      console.log('chen-创建群-groupAvatar==', smallUrl)
      console.log('chen-创建群-groupBigAvatar==', bigUrl)
    },
    resetForm() {
      // this.$refs['creatform'].clearValidate();

      this.activeStep = 1;
      this.step = 1;
      this.creatform = {
        groupName: "",
        groupStatus: 1,
        groupProfile: "",
        city: "",
        country: "",
        groupAvatar: "",
        groupBigAvatar: "",
        groupTab: "",
      };
      this.groupAvatarUrl = "";
      if (this.$refs["creatformm"] != undefined) {
        this.$refs["creatformm"].resetFields();
        this.imgLoading = false;
      }
    },

    async post_base_country_list(lang) {
      this.countryList = await SQLUtils.getTAreaCountryList(lang);
    },
    async getarea(val) {
      this.areaList = await SQLUtils.getTAreaCityList(val);
      this.creatform.city = "";
    },
    async gotoChat() {
      //this.groupobj.targetId = this.groupobj.id
      // this.$store.dispatch('SET_CURRENT_CHAT', this.groupobj)
      this.CLEAR_CHAT();
      let current = {
        id: this.groupId,
        targetId: this.groupId,
        uniqueCode: contGrpSize(this.groupId),
        sessionId: this.groupobj.headImg,
        sessionName: this.groupobj.groupName,
        item: this._groupInfo,
      };
      await this.$store.dispatch("SET_CURRENT_CHAT", current);
      this.$router.push({
        path: "/app/chat/group/message",
        query: {
          id: this.groupId,
          targetId: this.groupId,
          timer: new Date().getTime(),
          friendName: encodeURI(this.groupobj.groupName),
          uniqueCode: contGrpSize(this.groupId),
        },
      });
      this.$emit("CloseDialog", false);
    },
    CloseDialog() {
      this.$emit("CloseDialog", false);
    },
    onCopy() {
      this.$message.success(this.$t('chat_0026'));
    },

    beforeAvatarUpload(file) {
      const isJPG =
        file.type === "image/jpg" ||
        file.type === "image/jpeg" ||
        file.type === "image/png";
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
          type: "success",
          duration: 1500,
          onClose: () => {},
        });
        this.groupAvatarUrl = URL.createObjectURL(file.raw);
        this.creatform.groupAvatar = res.data.path;
      } else {
        this.$message.error(res.msg);
      }
    },
    async createGroupInfo(item) {
      const obj = {
        group_id: item.id,
        group_name: item.groupName,
        group_status: item.groupStatus,
        group_profile: item.groupProfile,
        group_avatar: item.groupAvatar,
        group_avatar_local: "",
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
        code: "",
        group_name_pinyin: convertToPinyin(item.groupName),
        is_show: "true",
        group_code: item.groupCode,
        group_type: item.groupType,
        groupTab: item.groupTab,
      };
      this._groupInfo = obj;
      return await window.vm.$knex("t_groups").insert(obj);
      
    },
    async createGroupMember(memberList) {
      console.log("createGroupMember");
      const list = [];
      for (let item of memberList) {
        list.push({
          id: item.userId,
          group_id: item.groupId,
          auth_status: item.authStatus,
          nick_name: item.nickName,
          user_head_img: item.userHeadImg,
          user_head_img_local: "",
          member_notes: item.memberNotes,
          member_notes_pinyin:
            item.memberNotes == undefined
              ? ""
              : convertToPinyin(item.memberNotes),
          is_show: "true",
          forbiddenWordsStatus: 0,
          muteNotifications: 0,
          additionalStatus: 0,
          mutedStatus: 0,
          stickyStatus: 0,
        });
      }
      const cc = await window.vm.$knex.batchInsert("t_groups_member", list, 10);
      return cc;
    },
    async createGroupAuth(memberAuthList) {
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
          user_level: item.userLevel,
        });
      }
      const cc = await window.vm.$knex.batchInsert(
        "t_groups_member_auth",
        list,
        10
      );
      return cc;
    },
    async createGroupAppealInfo(item) {
      const obj = {
        group_id: item.id,
        closure_create_time: '',
        closure_end_time: '',
        closure_impeach_reason: '',
        closure_limit_day: 0,
        closure_limit_type:0,
        show_appeal_closure_notice: 0,
        warn_create_time: '',
        warn_end_time: '',
        warn_impeach_reason: '',
        warn_limit_day: 0,
        warn_limit_type:0,
        show_appeal_warn_notice: 0
      }
      return await window.vm.$knex('t_groups_appeal').insert(obj);
    },
    async createGroupExceedInfo(item) {
      const obj = {
        group_id: item.id,
        exceed_num: 0,
        show_exceed_notice: 0,
      }
      return await window.vm.$knex('t_groups_exceed').insert(obj);
    },
    async createGroupToUpdateVersion(versionlist) {
      const q = [];
      for (let item of versionlist) {
        q.push(
          window.vm
            .$knex("t_news_version")
            .where({ name: item.name })
            .update({ version: item.version })
        );
      }
      const cc = await Promise.all(q);
      return cc;
    },
    async createGroupBylocal(data) {
      console.log('data-- ',data);
      // 创建群   groupBase
      const groupInfo = data.groupBase[0];
      const groupMemberList = data.groupMember;
      const memberAuthList = data.memberAuth;
      await Promise.all([
        this.createGroupInfo(groupInfo),
        this.createGroupMember(groupMemberList),
        this.createGroupAuth(memberAuthList),
        this.createGroupAppealInfo(groupInfo),
        this.createGroupExceedInfo(groupInfo),
        this.createGroupToUpdateVersion([
          {
            name: "gtmcn",
            version: data.gtmcn,
          },
          {
            name: "gtmn",
            version: data.gtmn,
          },
          {
            name: "gtn",
            version: data.gtn,
          },
        ]),
      ]).then((result)=>{
        return result;
      }).catch((error)=>{
        console.log('error--',error);
      });
     
      // 创建群成员信息    groupMember
      // 创建群成员权限信息    memberAuth
      // 更新版本信息      gtmcn/gtmn/gtn
    },
    async firstSubmit(formName) {
      if (this.personalAppealInfo.createTime) {
        let time = `${this.personalAppealInfo.createTime}--${this.personalAppealInfo.endTime}`;
        this.$confirm(
          this.$t('appeal_0003', {time}),
          this.$t('Universal_0059'),
          {
            confirmButtonText: this.$t('appeal_0017'),
            cancelButtonText: this.$t('book_group_0019'),
            center: true,
            showClose: false,
          }
        )
          .then(() => {})
          .catch(() => {});
      } else {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            console.log("imgLoading", this.imgLoading);
            if (this.imgLoading) {
              this.$message.error("请等待图片上传完成");
              return;
            }
            this.btnloading = true;
            let params = JSON.parse(JSON.stringify(this.creatform));
            this.convertCountryCode(params);
            createGroup(params)
              .then(async (res) => {
                if (res.code == 200) {
                  this.step = 2;
                  this.activeStep = 2;

                  this.$emit("boxTitleFn", this.$t('chat_comm_set_0019'));
                  this.groupId = res.data.groupBase[0].id;
                  this.queryGroupByGroupId();
                  
                  await this.createGroupBylocal(res.data);
                  // this.$emit("boxTitleFn", this.$t('chat_comm_set_0019'));
                  // this.groupId = res.data.groupBase[0].id;
                  // this.queryGroupByGroupId();
                } else {
                  this.$message.error(res.data.msg);
                  this.convertCountryId();
                }
                this.btnloading = false;
                //原下一步的处理
              })
              .catch(() => {
                this.btnloading = false;
              });
          } else {
            return false;
          }
        });
      }
    },
    convertCountryCode(item) {
      if (this.creatform.country && this.creatform.city) {
        item.country = this.countryList.find(
          (item) => item.id == this.creatform.country
        ).code;
        item.city = this.areaList.find(
          (item) => item.id == this.creatform.city
        ).code;
      } else {
        item.country = "";
        item.city = "";
      }
    },
    convertCountryId() {
      if (this.creatform.country && this.creatform.city) {
        this.creatform.country = this.countryList.find(
          (item) => item.code == this.creatform.country
        ).id;
        this.creatform.city = this.areaList.find(
          (item) => item.code == this.creatform.city
        ).id;
      }
    },
    queryGroupByGroupId() {
      let language = this.$i18n.locale;
      let baseUrl = process.env.VUE_APP_SHARE;
      queryGroupByGroupId({
        groupId: this.groupId,
      }).then((res) => {
        console.log(res);
        if (res.code == 200) {
          this.groupobj = res.data;
          this.groupCode = res.data.groupCode;
          let obj = JSON.parse(localStorage.getItem("userInfo"));
          this.linkurl = `${baseUrl}/#/invite/groups?userId=${localStorage.getItem(
            "userId"
          )}&inviteCode=${obj.inviteCode}&groupCode=${this.groupCode}&groupId=${
            this.groupId
          }&language=${language}&nickName=${obj.nickName}&category=fgg`;
          this.linkurl = encodeURI(this.linkurl);
        }
      });
    },
  },

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
<style lang="less">
.chatset {
  .el-step__title {
    font-size: 12px;
  }
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

.chatset {
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  overflow-y: scroll;
  .formbox {
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px 0 0 !important;
  }
  .groupImg {
    margin-bottom: 10px;
  }
  .tip {
    color: #bbb;
    font-size: 12px;
  }
  .right {
    text-align: right;

    /deep/ .el-button--primary {
      margin-top: 30px;
    }
  }
  .finish {
    text-align: center;
    margin: 40px 0 0;
    color: #333333;
    .mid {
      // display: flex;
      margin: 10px 0;
      img,
      span {
        vertical-align: middle;
        padding-right: 5px;
        margin-top: 40px;
      }
      p {
        color: #999999;
        font-size: 12px;
        margin: 20px 0;
      }
      .copy {
        font-size: 12px;
        padding-left: 15px;
        color: #2f54eb;
        cursor: pointer;
      }
    }
    .el-button {
      width: 202px;
      background: #2f54eb;
      border-color: #2f54eb;
    }
  }
}

.chatset {
  /deep/ .el-step__title {
    line-height: 25px;
  }
  /deep/ .el-step__title.is-finish {
    color: #333;
  }

  /deep/ .el-step__title.is-process {
    color: #333;
  }

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

  /deep/ .el-button--primary {
    width: 84px;
    height: 28px;
    margin-top: 13px;
    font-size: 13px;
  }
  /deep/ .el-form-item__error {
    padding-top: 0;
  }

  .typesel {
    margin-bottom: 0;
  }
  .groupWord-name {
    margin-bottom: 0px;
  }
  .groupWord-area {
    margin-bottom: 6px;
  }

  .formTab {
    margin-bottom: 13px;
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
</style>
