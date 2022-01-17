<template>
  <div class="audio-loading-main">
    <div class="loading">{{ loading }}</div>
  </div>
</template>

<script>
export default {
  name: 'AudioLoading',
  data() {
    return {
      loading: '',
      showWindowTimer: 0,
      count: 60
    };
  },
  props: {
    waiting: {
      type: String,
      default() {
        return '';
      }
    }
  },
  methods: {
    main() {
      setInterval(() => {
        if (this.loading == '...') {
          this.loading = '';
        } else {
          this.loading += '.';
        }
      }, 600);
    }
  },
  mounted() {
    this.main();
  }
};
</script>

<style scoped>
.audio-loading-main {
  width: 10px;
}
.loading {
  color: white;
}
</style>
