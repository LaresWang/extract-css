<template>
  <div class="didi-service-icon">
    <img class="serviceIconClass" :src="findImage" alt />
  </div>
</template>

<script>
import fileOperational from '@/services/fileOperational';
export default {
  name: 'DiDiServiceIcon',
  props: {
    id: {
      type: String,
      default() {
        return '';
      }
    }
  },
  computed: {
    findImage() {
      let result = this.$store.state.common.didiServiceIcons.find(item => item.id == this.id);
      if (result) {
        return fileOperational.getImage(result.icon);
      }
      return fileOperational.getImage('https://oss.didimessage.com/images/permanent/logo/logo_v1.png');
    }
  },
  methods: {}
};
</script>

<style scoped>
.serviceIconClass {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.didi-service-icon {
  margin-right: -8px;
}
</style>
