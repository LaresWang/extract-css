<template>
  <div class="audio-waiting-main">
    <div ref="waitingCircle" class="waiting"></div>
  </div>
</template>

<script>
export default {
  name: 'AudioWaiting',
  props: {
    start: {
      type: String,
      default() {
        return 'white';
      }
    }
  },
  methods: {
    sleep(duration) {
      return new Promise(reslove => {
        setTimeout(reslove, duration);
      });
    },
    async changeColor(duration, color) {
      this.$refs.waitingCircle.style.background = color;
      await this.sleep(duration);
      console.log(color);
    },
    async main() {
      this.$refs.waitingCircle.style.background = this.start;
      const time = true;
      const duration = 600;
      while (time) {
        if (this.start == 'white') {
          await this.changeColor(duration, 'lightgray');
          await this.changeColor(duration, 'gray');
          await this.changeColor(duration, 'white');
        } else if (this.start == 'lightgray') {
          await this.changeColor(duration, 'gray');
          await this.changeColor(duration, 'white');
          await this.changeColor(duration, 'lightgray');
        } else if (this.start == 'gray') {
          await this.changeColor(duration, 'white');
          await this.changeColor(duration, 'lightgray');
          await this.changeColor(duration, 'gray');
        }
      }
    }
  },
  mounted() {
    this.main();
  }
};
</script>

<style scoped>
.audio-waiting-main {
  padding: 5px;
}
.waiting {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
