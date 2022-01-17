export default function(status, obj, vm) {
  let arr = [];
  const menu0 = {
    name: vm.$t('chat_comm_set_0024'),
    fun: () => {
      vm.popoverVisible = true;
      document.querySelector('#popoverShow' + obj.userId).click();
    }
  };
  const menu4 = {
    name: vm.$t('book_group_0014'),
    fun: () => {
      vm.getOut(vm.changeValueV);
    }
  };

  if (status == 1) {
    //群主
    arr.push(menu0);
    if (status < obj.authStatus) {
      arr.push(menu4);
    }
  } else if (status == 2) {
    //管理员
    arr.push(menu0);
    if (status < obj.authStatus) {
      arr.push(menu4);
    }
  } else if (status == 3) {
    //群成员
    arr.push(menu0);
  }
  return arr;
}
