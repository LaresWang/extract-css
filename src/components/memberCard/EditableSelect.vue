<template>
  <div class="editable-input">
    <span v-show="!isEdit" @click="onClick" :class="isCurrentUser ? 'select-target-name' : ''">{{ targetValue }}</span>

    <el-select
      v-show="isEdit && isCurrentUser"
      v-model="countryName"
      size="mini"
      class="editable-select"
      clearable
      filterable
      :placeholder="$t('Universal_0211')"
      @change="getAreaList"
      @clear="clearCountry"
    >
      <el-option :label="item.name" :value="item.id" v-for="item in countryList" :key="item.id"></el-option>
    </el-select>
    <el-select
      v-show="isEdit && isCurrentUser"
      v-model="cityName"
      size="mini"
      class="editable-select"
      clearable
      filterable
      :placeholder="$t('Universal_0387')"
      @change="setCity"
      @clear="clearCity"
      :disabled="areaDisabled"
    >
      <el-option :label="item.name" :value="item.id" v-for="item in areaList" :key="item.id"></el-option>
    </el-select>
  </div>
</template>

<script>
import { base_country_list, base_area_list } from '@/server.js';

export default {
  name: 'EditableSelect',
  data() {
    return {
      isEdit: false,
      inputValue: '',
      countryName: '',
      cityName: '',
      countryCode: '',
      cityCode: '',
      countryList: [],
      areaList: [],
      areaDisabled: false,
      countrys: this.country
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
    country: {
      type: String,
      default() {
        return '';
      }
    },
    city: {
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
    async getCountryList() {
      console.log('this.countrys = ', this.countrys);
      console.log('this.city = ', this.city);
      let res = await base_country_list();
      this.countryList = res.data;
      if (this.countrys) {
        let selectCountry = this.countryList.find(item => item.code == this.countrys);
        let countryId = selectCountry.id;
        this.countryName = selectCountry.id;
        this.countryCode = selectCountry.code;
        await this.getAreaList(countryId);
        if (this.city) {
          this.cityName = this.areaList.find(item => item.code == this.city).id;
          this.cityCode = this.areaList.find(item => item.code == this.city).code;
        }
      } else {
        this.cityName = '';
        this.cityCode = '';
        this.countrys = '';
        this.areaDisabled = true;
      }
    },
    async getAreaList(fatherId) {
      if (fatherId) {
        let res = await base_area_list({ fatherId });
        this.cityName = '';
        this.areaList = res.data;
        this.areaDisabled = false;
      }
    },
    setCity() {
      this.countryCode = this.countryList.find(item => item.id == this.countryName).code;
      this.cityCode = this.areaList.find(item => item.id == this.cityName).code;
      this.$emit('updateUserInfo', this.targetLabel, this.countryCode, this.cityCode);
    },
    clearCountry() {
      this.areaList = [];
      this.countryName = '';
      this.cityName = '';
      this.countryCode = '';
      this.cityCode = '';
      this.areaDisabled = true;
    },
    clearCity() {
      //this.city = '';
      this.cityName = '';
      this.cityCode = '';
    },
    onClick() {
      this.isEdit = !this.isEdit;
      if (!this.isCurrentUser) {
        this.isEdit = !this.isEdit;
      }
      if (!this.countrys) {
        this.countryName = '';
      }
      if (!this.city) {
        this.cityName = '';
      }
      this.getCountryList();
    },
    initEditableSelect() {
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
  width: 90%;
  height: 18px;
  display: inline-block;
}
.select-target-name {
  user-select: text;
  border: 1px #fff solid;
}
.select-target-name:hover {
  border: 1px #dddddd solid;
}
.editable-select {
  width: 100px;
}
</style>
