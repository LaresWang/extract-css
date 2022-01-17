<template>
  <div>
    <el-dialog
      :title="$t('book_group_0021')"
      :visible.sync="discussionNameVisible"
      width="270px"
      :center="true"
      append-to-body
      :modal-append-to-body="false"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="discussion-name">
        <div class="member-notes">
          <el-form ref="ruleForm" :rules="formRules" label-position="top" :model="formValues" @submit.native.prevent>
            <el-form-item prop="friendNotes">
              <el-input
                  :placeholder="$t('book_group_0022')"
                  ref="discussionname"
                  v-model="formValues.friendNotes"
                  @keyup.enter.native="onConfirm"
              ></el-input>
              <!-- <el-input
                  show-word-limit
                  type="textarea"
                  :maxlength="30"
                  :rows="2"
                  @input="validateName"
                  ref="discussionname"
                  resize="none"
                  placeholder="请输入3-30位讨论组名称"
                  v-model="discussionName"
                  size="small"
                ></el-input> -->
            </el-form-item>
          </el-form>
        </div>
        <div class="dialog-footer">
          <el-button size="mini" class="cancelBtn" type="info" @click="onCancel">
            {{ $t('Universal_0063') }}
          </el-button>
          <el-button size="mini" :class="nameValidate ? '' : 'can-not-click'" :disabled="!nameValidate" type="primary" @click="onConfirm"
            >
            {{ $t('Universal_0062') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { convertToPinyin } from '@/utils/pinyin';
import { setGroupBase } from './server';
export default {
  name: 'DiscussionNameEdit',
  data() {
    return {
      discussionNameVisible: false,
      discussionName: '',
      formValues: {
        friendNotes: ''
      },
      formRules: {
        friendNotes: [
          {
            required: true,
            trigger: 'change',
            message: this.$t('book_group_0022')
          },
          {
            trigger: 'change',
            min: 3,
            max: 30,
            message: this.$t('Universal_0226')
          },
          {
            pattern: /^((?!didi).)+$/i, ///^didi/ig,
            message: this.$t('chat_comm_set_0017')
          }
        ]
      }
    };
  },
  props: {
    name: {
      type: String,
      default() {
        return '';
      }
    },
    groupId: {
      type: String,
      default() {
        return '';
      }
    }
  },
  computed: {
    nameValidate() {
      let len = this.formValues.friendNotes.length;
      let reg = /^((?!didi).)+$/i;
      if (!this.formValues.friendNotes || len > 30 || len < 3 || !reg.test(this.formValues.friendNotes)) {
        return false;
      } else {
        return true;
      }
    }
  },
  methods: {
    onPop() {
      this.discussionNameVisible = true;
      this.formValues.friendNotes = this.name;
      this.$nextTick(() => {
        this.$refs.discussionname.select();
        this.$refs.discussionname.focus();
      });
    },
    onCancel() {
      this.discussionNameVisible = false;
    },
    onConfirm() {
      this.formValues.friendNotes = this.formValues.friendNotes.trim();
      this.$refs['ruleForm'].validate(async valid => {
        if (valid) {
          setGroupBase({
            id: this.groupId,
            groupName: this.formValues.friendNotes
          }).then(async res => {
            this.showResponseMessages(res);
            if (res.code == '200') {
              await this.updateGroupInfo({
                group_name: this.formValues.friendNotes,
                group_name_pinyin: convertToPinyin(this.formValues.friendNotes)
              });
              this.discussionNameVisible = false;
              this.$parent.refreshGroupInfo();
            }
          });
        }
      });
    },
    showResponseMessages(res) {
      if (res.code == '200') {
        this.$message({
          type: 'success',
          message: res.msg
        });
      } else {
        this.$message({
          type: 'error',
          message: res.msg
        });
      }
    },
    async updateGroupInfo(item) {
      await window.vm
        .$knex('t_groups')
        .where({ group_id: this.groupId })
        .update(item);
    }
  }
};
</script>

<style lang="less" scoped>
.can-not-click {
  opacity: 0.5;
}
.discussion-name {
  .tit {
    display: flex;
    align-items: center;
    img {
      // width: 44px;
      // height: 44px;
      width: 32px;
      height: 32px;
      margin-right: 10px;
      border-radius: 50%;
    }
  }
  textarea {
    height: 60px;
    margin: 15px 0;
  }
  .member-notes {
    margin: 10px 0;

    /deep/ .el-input--small {
      height: 55px;
    }

    /deep/ .el-textarea__inner {
      height: 54px;
      background: transparent;
      border: 1px solid #d7d7d7;
    }

    /deep/ .el-input__count {
      font-size: 12px;
      color: #666;
    }
  }
}
.dialog-footer {
  display: flex;
  justify-content: space-between;
  width: 90%;
  margin: 0 auto;
  padding-top: 10px;
  /deep/ .dialog-footer {
    width: 80%;
  }
  /deep/.el-button--mini,
  .el-button--small {
    width: 84px;
    height: 28px;
    font-size: 13px;
  }
  /deep/ .el-button--default .el-button--mini {
    color: #333;
    font-size: 13px;
  }
}
</style>
