<template>
  <div class="editable-radio">
    <span v-show="!isEdit" @click="onClick" class="radio-target-name">{{ targetValue }}</span>
    <div v-show="isEdit && isCurrentUser" class="radio-group" @blur="onBlur" @onmouseover="onMouseover" ref="radiogroup">
      <el-radio-group v-model="inputValue" @change="onChange" size="mini">
        <el-radio-button :label="$t('my_information_0010')" />
        <el-radio-button :label="$t('my_information_0011')" />
      </el-radio-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditableRadio',
  data() {
    return {
      isEdit: false,
      inputValue: '',
      radioValue: ''
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
    radioEdit: {
      type: Boolean,
      default() {
        return false;
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
      }, 100);
    },
    onMouseover() {
      this.$refs.radiogroup.focus();
    },
    onBlur() {
      this.isEdit = !this.isEdit;
    },
    onChange() {
      this.isEdit = !this.isEdit;
      this.$emit('updateUserInfo', this.targetLabel, this.inputValue);
    },
    initEditableRadio() {
      this.isEdit = false;
    }
  }
};
</script>

<style scoped>
.editable-input {
  user-select: text;
}
span {
  width: 40%;
  height: 18px;
  display: inline-block;
}
.radio-target-name {
  user-select: text;
  border: 1px #fff solid;
}
.radio-target-name:hover {
  border: 1px #dddddd solid;
}
</style>
