
<template>
  <div class="silent-mask">
    <img class="img_18" src="../../../../assets/images/nowords.png" alt />
    <span v-if="fromType == '330'">{{ $t('chat_0066') }}</span>
    <span v-else-if="fromType == '326'">{{ $t('chat_0062') }}</span>
  </div>
</template>

<script>
export default {
  name: 'SilentMask',
  props: {
    fromType: {
      type: String,
      default() {
        return '';
      }
    }
  }
};
</script>

<style scoped>
.silent-mask {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.silent-mask img {
  margin-right: 20px;
}
</style>

