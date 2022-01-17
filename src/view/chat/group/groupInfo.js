export class GroupInfo {
  constructor(groupInfo) {
    this.id = groupInfo.id;
    this.groupAvatar = groupInfo.groupAvatar;
    this.groupName = groupInfo.groupName;
    this.country = groupInfo.country;
    this.city = groupInfo.city;
    this.countryName = groupInfo.countryName;
    this.cityName = groupInfo.cityName;
    this.groupProfile = groupInfo.groupProfile;
    this.groupTab = Number(groupInfo.groupTab);
  }
}
