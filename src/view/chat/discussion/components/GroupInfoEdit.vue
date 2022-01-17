<template>
  <div>
    <el-dialog
      :title="$t('chat_comm_set_0031')"
      @open="onOpen"
      :visible.sync="groupEditVisible"
      append-to-body
      :modal-append-to-body="false"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="onEditCancel"
      width="380px"
      custom-class="group-edit-el-dialog"
      class="gruop-info-edit"
      center
    >
      <el-form :model="groupInfo" ref="groupEditForm" :rules="groupEditFormRules" label-width="100px" class="group-edit-form">
        <el-form-item :label="$t('chat_createcommunity_0002')" prop="groupAvatar" required class="group-avatar-class group-info-avatar">
          <div class="demo-block">
            <el-upload
              v-loading="imgLoading"
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(255, 255, 255, 0.8)"
              :show-file-list="false"
              :action="uploadUrl"
              :data="uploadData"
              :headers="headers"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="groupInfo.groupAvatar" :src="groupInfo.groupAvatar" class="group-avatar" alt />
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item :label="$t('chat_createcommunity_0003')" prop="groupName" class="group-info-name">
          <el-input :minlength="1" :maxlength="30" v-model="groupInfo.groupName" show-word-limit class="limtinput"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Universal_0205')" class="group-info-country">
          <el-row>
            <el-col :span="11">
              <el-form-item class="group-country" prop="country">
                <el-select
                  v-model="groupInfo.countryName"
                  size="mini"
                  clearable
                  filterable
                  :placeholder="$t('Universal_0208')"
                  @change="getAreaList"
                  @clear="clearCountry"
                >
                  <el-option :label="item.name" :value="item.id" v-for="item in countryList" :key="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="11" :offset="2">
              <el-form-item class="group-country" prop="city">
                <el-select
                  v-model="groupInfo.cityName"
                  clearable
                  filterable
                  :placeholder="$t('Universal_0209')"
                  @change="setCity"
                  @clear="clearCity"
                  :disabled="areaDisabled"
                >
                  <el-option :label="item.name" :value="item.id" v-for="item in areaList" :key="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :label="$t('chat_createcommunity_0010')" prop="groupTab" class="group-info-name">
          <el-row>
            <el-select size="mini" v-model="groupInfo.groupTab" clearable filterable
                       :placeholder="$t('chat_createcommunity_0035')">
              <el-option v-for="item in tabList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-row>
        </el-form-item>
        <el-form-item :label="$t('chat_comm_set_0002')" prop="groupProfile" class="notegroup">
          <el-input
            show-word-limit
            class="limtinput"
            type="textarea"
            :maxlength="500"
            :rows="4"
            :placeholder="$t('chat_createcommunity_0033')"
            v-model="groupInfo.groupProfile"
          ></el-input>
        </el-form-item>
        <el-form-item class="group-info-btn">
          <div class="group-edit-button">
            <el-button type="info" size="mini" class="cancel" @click="onEditCancel">
              {{ $t('Universal_0063') }}
            </el-button>
            <el-button type="primary" size="mini" class="submit" @click="onEditSubmit('groupEditForm')">
              {{ $t('Universal_0062') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { upload_images_avatar } from '@/server.js';
import { GroupInfo } from '../groupInfo';
import { setGroupBase } from '../message/server';
import SQLUtils from '@/components/db/sqlite.js';

export default {
  name: 'GroupInfoEdit',
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
      groupEditVisible: false,
      countryList: [],
      areaList: [],
      currentCountryName: '',
      btnLoading: false,
      groupInfo: {},
      uploadData: {},
      uploadUrl: upload_images_avatar(),
      headers: {
        Authorization: localStorage.accessToken
      },
      groupEditFormRules: {
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
        country: [{ message: this.$t('Universal_0208'), trigger: 'blur' }],
        city: [{ message: this.$t('Universal_0209'), trigger: 'blur' }],
        groupTab: [{ message: this.$t('chat_createcommunity_0035'), trigger: 'blur' }]
      },
      areaDisabled: false,
      inValidName: ['盘古'],
      groupInfoBefore: '',
      groupInfoAfter: '',
      imgLoading: false,
      tabList: [
        // {value:0,label:"为你的群贴上标签"},
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
      ]
    };
  },
  methods: {
    onPop() {
      this.groupEditVisible = true;
    },
    onClose() {
      this.groupEditVisible = false;
    },
    async getCountryList() {
      this.countryList = await SQLUtils.getTAreaCountryList();
      if (this.groupInfo.country && this.groupInfo.countryName) {
        let countryId = this.countryList.find(item => item.code == this.groupInfo.country).id;
        await this.getAreaList(countryId);
      }
    },
    async getAreaList(fatherId) {
      this.areaList = await SQLUtils.getTAreaCityList(fatherId);
      if (!fatherId) {
        this.currentCountryName = '';
        this.groupInfo.cityName = '';
        this.groupInfo.country = '';
        this.areaDisabled = true;
      } else if (this.currentCountryName != this.groupInfo.countryName) {
        this.groupInfo.cityName = '';
        this.groupInfo.city = '';
        this.areaDisabled = true;
        this.groupInfo.country = this.countryList.find(item => item.id == fatherId).code;
        this.areaDisabled = false;
      }
    },
    setCity() {
      this.groupInfo.city = this.areaList.find(item => item.id == this.groupInfo.cityName).code;
    },
    clearCountry() {
      this.groupInfo.country = '';
      this.groupInfo.city = '';
      this.areaList = [];
      this.areaDisabled = true;
    },
    clearCity() {
      this.groupInfo.city = '';
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2;
      // const textArr = file.name.split(".");
      // const isPng = textArr[textArr.length - 1];

      const isPng = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';

      if (isPng) {
        if (!isLt2M) {
          this.$message.error(this.$t('Universal_0390'));
          return false;
        }
      } else {
        this.$message(this.$t('Universal_0369'));
        return false;
      }
      this.imgLoading = true;
      this.uploadData.file = file.name;
    },
    handleAvatarSuccess(data) {
      if (data.code == '200') {
        this.imgLoading = false;
        this.groupInfo.groupAvatar = data.data.path;
      }
    },
    onEditSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          console.log(this.groupInfo);
          this.btnLoading = true;
          console.log('imgLoading', this.imgLoading);
          if (this.imgLoading) {
            this.$message.error('请等待图片上传完成');
            return;
          }
          const params = {
            id: this.groupInfo.id,
            groupAvatar: this.groupInfo.groupAvatar,
            groupName: this.groupInfo.groupName,
            country: this.groupInfo.country,
            city: this.groupInfo.city,
            groupProfile: this.groupInfo.groupProfile,
            groupTab: this.groupInfo.groupTab == '' ? 0 : this.groupInfo.groupTab
          };
          setGroupBase(params)
            .then(async res => {
              if (res.code == '200') {
                this.$message.success(res.msg);
                this.groupEditVisible = false;
                this.btnLoading = false;
                this.clearCountry();
                await this.updateGroupInfo(params);
                await this.$store.dispatch('GET_LAST_MSG_LIST');
                await this.$store.dispatch('GET_GROUP_LIST');
                this.$emit('refreshPage');
                this.$emit('refreshGroupInfo');
              } else {
                this.$message.error(res.data.msg);
              }
            })
            .catch(() => {
              this.btnLoading = false;
            });
        } else {
          return false;
        }
      });
    },
    async updateGroupInfo(params) {
      await SQLUtils.updateTGroupsInfo(params);
    },
    onEditCancel() {
      this.imgLoading = false;
      this.groupInfoAfter = JSON.stringify(this.groupInfo);
      if (this.groupInfoAfter == this.groupInfoBefore) {
        this.groupEditVisible = false;
      } else {
        this.$confirm(this.$t('chat_comm_set_0029'), this.$t('Universal_0059'), {
          confirmButtonText: this.$t('Universal_0062'),
          cancelButtonText: this.$t('Universal_0388'),
          type: 'info'
        })
          .then(() => {
            this.groupEditVisible = false;
            this.$parent.refreshGroupInfo();
          })
          .catch(() => {});
      }
    },
    onOpen() {
      let groupInfo = new GroupInfo(this.info);
      if (groupInfo.groupTab == 0 || groupInfo.groupTab == '') {
        groupInfo.groupTab = null;
      }
      this.groupInfo = groupInfo;
      this.currentCountryName = this.groupInfo.countryName;
      this.getCountryList();
      this.areaDisabled = false;
      this.groupInfoBefore = JSON.stringify(this.groupInfo);
    },
    created() {}
  }
};
</script>

<style>
.group-edit-el-dialog .el-dialog__header {
  padding: 10px 0;
}
.group-edit-el-dialog .el-dialog__header span {
  font-size: 14px;

  font-weight: 500;
  color: #333333;
}
.group-edit-el-dialog .el-dialog__body {
  padding: 5px 20px 2px 0;
}
.group-edit-form .el-form-item__label {
  font-size: 12px;

  font-weight: 400;
}
.group-edit-el-dialog button {
  margin-top: -5px;
  margin-right: -5px;
}
.limtinput input {
  height: 30px;
  font-size: 12px;

  font-weight: 400;
  border: 1px solid #d7d7d7;
  background-color: #fbfbfb;
}
.group-edit-el-dialog .el-select .el-input__inner {
  height: 30px;
  font-size: 12px;

  font-weight: 400;
}
.limtinput textarea {
  font-size: 12px;

  font-weight: 400;
}
.group-label .el-form-item__content {
  font-size: 12px;

  font-weight: 400;
}
.group-edit-el-dialog {
  border-radius: 5px;
}
.group-edit-form .group-avatar-class label {
  padding-top: 15px;
}
</style>
<style lang="less" scoped>
.gruop-info-edit {
  /deep/ .el-dialog__body {
    padding-top: 10px;
  }
  /deep/ .el-dialog__headerbtn .el-dialog__close {
    color: #000;
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

  /deep/ .limtinput textarea {
    min-height: 120px;
    max-height: 150px;
    font-size: 13px;
  }
  /deep/ .el-form-item__error {
    padding-top: 0;
  }

  .group-info-avatar {
    margin-bottom: 0px;
  }
  .group-info-name {
    margin-bottom: 12px;
    // margin-bottom: 6px;

    /deep/ .el-input__inner {
      border: 1px solid #d7d7d7;
      background: #fbfbfb;
    }
  }
  .group-info-country {
    margin-bottom: 18px;
    // margin-bottom: 5px;

    /deep/ .el-input__inner {
      border: 1px solid #d7d7d7;
      background-color: #fbfbfb;
    }
  }
  .group-info-label {
    margin-bottom: 11px;

    /deep/ .el-input__inner {
      border: 1px solid #d7d7d7;
      background: #fbfbfb;
    }
  }
  .notegroup {
    margin-bottom: 0;

    /deep/ .el-textarea__inner {
      border: 1px solid #d7d7d7;
      background-color: #fbfbfb;
    }

    /deep/ .el-form-item__content {
      line-height: 20px;
    }
    /deep/ .el-textarea .el-input__count {
      bottom: -20px;
      background-color: transparent;
    }

    /deep/ .el-textarea__inner {
      padding: 8px;
    }
  }
  .group-info-btn {
    margin-bottom: 15px;
  }
}

.demo-block {
  /deep/ .el-loading-spinner {
    left: -20%;
  }

  /deep/ .el-icon-loading {
    color: #fff;
    font-size: 12px;
  }
}
</style>
<style scoped>
.group-country {
  margin-bottom: 0px;
}
.group-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.group-edit-button {
  float: right;
  padding-right: 5px;
  margin-top: 26px;
}
.cancel {
  margin-right: 20px;
}
.group-edit-button button {
  width: 84px;
}
</style>
