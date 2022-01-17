
<template>
  <div class="editable-input">
    <span v-show="!isEdit" @click="onClick" class="target-name">
      <label v-if="targetValue" class="target-name-label pre-wrap">{{ targetValue }}</label>
      <label v-else>{{ placeHolder }} <img class="img_13" src="../../assets/images/edit.png"/></label>
    </span>
    <el-input
        v-show="isEdit"
        v-model="inputValue"
        @blur="onBlur($event)"
        ref="targetInput"
        size="mini"
        :maxlength="maxsize"
        @input="changeValue"
    >
      <template slot="suffix">{{ textLength || 0 }}/{{ maxsize }}</template>
    </el-input>
  </div>
</template>

<script>
export default {
  name: 'EditableInput',
  data() {
    return {
      isEdit: false,
      inputValue: ''
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
    },
    lengthByString: {
      type: Boolean,
      default: false
    },
    noMinimum: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    errMsg() {
      return this.$t('Universal_0226');
    },
    textLength() {
      let length = 0;
      if (!this.inputValue) return length;
      if (this.lengthByString) {
        length = this.inputValue.length;
      } else {
        length = this.inputValue.replace(/[\u4e00-\u9fa5]/g, 'aaa').length;
      }
      return length;
    }
  },
  methods: {
    onClick() {
      this.isEdit = !this.isEdit;
      setTimeout(() => {
        this.inputValue = this.targetValue || "";
        let currentInput = this.$refs.targetInput;
        let pos = currentInput.value.length;
        currentInput.focus();
        currentInput.selectionStart = pos;
        currentInput.selectionEnd = pos;
      }, 100);
    },
    onBlur(e) {
      this.isEdit = !this.isEdit;
      if (e.target.value != this.targetValue) {
        let length = 0;
        if (this.lengthByString) {
          length = e.target.value.length;
        } else {
          length = e.target.value.replace(/[\u4e00-\u9fa5]/g, 'aaa').length;
        }

        if (!this.noMinimum && (e.target.value && (length > Number(this.maxsize) || length < 3))) {
          this.$message.error(this.errMsg);
          return;
        }
        this.$emit('updateUserInfo', this.targetLabel, e.target.value);
      }
    },
    changeValue() {
      if (this.textLength > this.maxsize) {
        this.inputValue = this.inputValue.substr(0, this.inputValue.length - 1);
      }
    }
  },
  mounted() {}
};
</script>

<style scoped>
.editable-input {
  max-width: 160px;
  user-select: text;
}
span {
  width: 100%;
  height: 18px;
  display: inline-block;
}
.target-name {
  user-select: text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 22px;
  line-height: 22px;
  /* padding-left: 4px; */
}
.target-name-label {
  border: 1px #fff solid;
  /* padding: 1px 4px; */
  /*margin-bottom: -4px;*/
}
.target-name-label:hover {
  border: 1px #dddddd solid;
}
/deep/ .el-input__suffix {
  line-height: 28px;
}
</style>
