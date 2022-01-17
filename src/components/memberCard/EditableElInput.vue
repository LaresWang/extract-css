
<template>
  <div class="editable-input">
    <span v-show="!isEdit" @click="onClick" class="target-name">
      <span v-if="targetValue" class="target-name-label">{{ targetValue }}</span>
      <label v-else>{{ placeHolder }} <img class="img_15" src="../../assets/images/edit.png"/></label>
    </span>
    <el-form ref="ruleForm" :rules="formRules" :model="formValues" v-show="isEdit" @submit.native.prevent>
      <el-form-item prop="inputValue">
        <el-input
            v-model="formValues.inputValue"
            @blur="onBlur($event)"
            ref="targetInput"
            size="mini"
            :maxlength="maxsize"
            @keyup.enter.native="$event.target.blur"
            @input="changeValue"
        >
          <template slot="suffix">{{ textLength || 0 }}/{{ maxsize }}</template>
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'EditableInput',
  data() {
    return {
      isEdit: false,
      formValues: {
        inputValue: ''
      }
    };
  },
  props: {
    targetValue: {
      type: String,
      default() {
        return '';
      }
    },
    targetLabel: {
      type: String,
      default() {
        return '';
      }
    },
    maxsize: {
      type: String,
      default() {
        return '';
      }
    },
    targetType: {
      type: String,
      default() {
        return 'text';
      }
    },
    placeHolder: {
      type: String,
      default() {
        return 'text';
      }
    }
  },
  computed: {
    formRules() {
      return  {
        inputValue: [
          {
            pattern: /^((?!didi).)+$/i, ///^didi/ig,
            message: this.$t('chat_comm_set_0017'),
            trigger: 'blur'
          }
        ]
      };
    },
    textLength() {
      let length = this.formValues.inputValue && this.formValues.inputValue.replace(/[\u4e00-\u9fa5]/g, 'aaa').length;
      return length || 0;
    },
    errMsg() {
      return this.$t('Universal_0226');
    }
  },
  methods: {
    onClick() {
      this.isEdit = !this.isEdit;
      setTimeout(() => {
        this.formValues.inputValue = this.targetValue;
        let currentInput = this.$refs.targetInput;
        let pos = currentInput.value ? currentInput.value.length : 0;
        currentInput.focus();
        currentInput.selectionStart = pos;
        currentInput.selectionEnd = pos;
      }, 100);
    },
    onBlur(e) {
      this.$refs['ruleForm'].validate(valid => {
        let length = e.target.value.replace(/[\u4e00-\u9fa5]/g, 'aaa').length;
        if (!e.target.value) {
          // 备注可以为空
          this.isEdit = false;
          this.$emit('updateUserInfo', this.targetLabel, '');
          return;
        } else {
          if (length > 18 || length < 3) {
            this.$message.error(this.errMsg);
            this.isEdit = false;
            return;
          }
          if (valid) {
            this.isEdit = !this.isEdit;
            if (e.target.value != this.targetValue) {
              this.$emit('updateUserInfo', this.targetLabel, e.target.value);
            } else {
              this.isEdit = false;
            }
          } else {
            // 让备注框不失去焦点
            this.$refs.targetInput.focus();
          }
        }
      });
    },
    changeValue() {
      if (this.textLength > this.maxsize) {
        this.formValues.inputValue = this.formValues.inputValue.substr(0, this.formValues.inputValue.length - 1);
      }
    }
  },
  mounted() {}
};
</script>

<style scoped lang="less">
.editable-input {
  user-select: text;
  //max-width: 75%;
  .el-form-item {
    margin-bottom: 0;
  }
  .el-form {
    display: inline-block;
    width: 100%;
  }
}
span {
  max-width: 95%;
  /*height: 18px;*/
  display: inline-block;
}
.target-name {
  /*user-select: text;*/
  /*overflow: hidden;*/
  /*text-overflow: ellipsis;*/
  /*white-space: nowrap;*/
  height: 24px;
  line-height: 24px;
}
.target-name-label {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px #fff solid;
  // padding: 1px 4px;
  margin-bottom: -4px;
}
.target-name-label:hover {
  border: 1px #dddddd solid;
}
/deep/ .el-form-item__error {
  padding-top: 0;
}
</style>

