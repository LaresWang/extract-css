<template>
  <div>
    <img class="serviceIconClass" :src="findImage(image)" alt />
  </div>
</template>

<script>
import fileOperational from '@/services/fileOperational';
export default {
  name: 'ServiceIcon',
  props: {
    image: {
      type: String,
      default() {
        return '';
      }
    }
  },
  methods: {
    findImage(image) {
      return fileOperational.getImage(image);
    }
  }
};
</script>

<style scoped>
.serviceIconClass {
  width: 38px;
  height: 38px;
  border-radius: 50%;
}
</style>
