export default function(status, obj, vm) {
  let arr = [];
  const menu0 = {
    name: vm.$t('chat_comm_set_0024'),
    fun: () => {
      vm.popoverVisible = true;
      document.querySelector('#popoverShow' + obj.userId).click();
    }
  };
  const menu1 = {
    name: vm.$t('book_friend_0014'),
    fun: () => {
      //console.log(this.changeValueV);
      vm.$emit('ShowRemark', vm.changeValueV);
    }
  };
  const menu2 = {
    name: obj.authStatus == 2 ? vm.$t('chat_comm_set_0035') : vm.$t('book_friend_0015'),
    fun: () => {
      let num;
      if (obj.authStatus == 2) {
        num = 3;
      } else {
        num = 2;
      }
      vm.setMagHand(vm.changeValueV, num);
    }
  };
  const menu3 = {
    name: obj.forbiddenWordsStatus == 0 ? vm.$t('chat_comm_set_0036') : vm.$t('chat_comm_set_0037'),
    fun: () => {
      vm.forbidden(vm.changeValueV, obj.forbiddenWordsStatus == 0 ? 1 : 0);
    }
  };
  const menu4 = {
    name: vm.$t('book_friend_0020'),
    fun: () => {
      vm.getOut(vm.changeValueV);
    }
  };

  if (status == 1) {
    //群主
    arr.push(menu0);
    if (status < obj.authStatus) {
      arr.push(menu1);
      arr.push(menu2);
      if (obj.authStatus == 3) {
        arr.push(menu3);
      }
      arr.push(menu4);
    }
  } else if (status == 2) {
    //管理员
    arr.push(menu0);
    if (status < obj.authStatus) {
      arr.push(menu1);
      arr.push(menu3);
      arr.push(menu4);
    }
  } else if (status == 3) {
    //群成员
    arr.push(menu0);
  }
  return arr;
}
