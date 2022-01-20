<template>
  <div class="t1">
    t1
    <div class="test1">
      样式test1
      <div class="test2">
        样式test2
      </div>
    </div>
    <div class="test3">
      样式test3
      <div class="test4">
        样式test4
      </div>
    </div>
  </div>
</template>

<script>
export default {
};
</script>
<style lang="less">

	/deep/ .abc {
    height: 30px;
		.asz {
			color: #eee;
		}
	}
	.t1 {
		font-size: 15px;
		color: #abc;
		.test1 {
			color: #aaa;
		}
	}
</style>
<style scoped lang="less">

	.t1 {
		/deep/ .def {
      height: 40px;
			.dsfg {
				.sdf {
					color: #444;
				}
			}
		}
		.test3 {
			margin-top: 30px;
			.test4 {
				font-size: 30px;
			}
		}
	}
</style>