<template>
  <div class="editable-textarea">
    <div v-show="!isEdit" @click="onClick" :class="isCurrentUser ? 'target-name target-name-border' : 'target-name'" :title="targetValue">
      {{ targetValue }}
    </div>
    <el-input
      show-word-limit
      type="textarea"
      :maxlength="50"
      :rows="3"
      v-show="isEdit && isCurrentUser"
      v-model="inputValue"
      @blur="onBlur($event)"
      ref="targetInput"
      size="mini"
    ></el-input>
  </div>
</template>

<script>
export default {
  name: 'EditableTextArea',
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
    isCurrentUser: {
      type: Boolean,
      default() {
        return false;
      }
    }
  },
  methods: {
    onClick() {
      this.isEdit = !this.isEdit;
      if (!this.isCurrentUser) {
        this.isEdit = !this.isEdit;
      }
      setTimeout(() => {
        this.inputValue = this.targetValue;
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
        this.$emit('updateUserInfo', this.targetLabel, e.target.value);
      }
    }
  },
  mounted() {
    this.edit = this.isEdit;
  }
};
</script>

<style scoped>
.editable-textarea {
  user-select: text;
}
span {
  width: 100%;
  height: 18px;
  display: inline-block;
}
.target-name {
  min-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.target-name-border {
  border: 1px #fff solid;
}
.target-name-border:hover {
  border: 1px #dddddd solid;
}
</style>
