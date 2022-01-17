export default function(currentUserAuthStatus, obj, vm) {
  let arr = [];
  const menu4 = {
    name: vm.$t('book_group_0014'),
    fun: () => {
      vm.removeFromGroup(obj);
    }
  };
  const menu5 = {
    name: `@${obj.nickName}`,
    fun: () => {
      vm.quill.getModule("mention").insertItem(
        {
          denotationChar: "@",
          id: obj['fromId'],
          nickName: obj['nickName'],
          value: obj['nickName'],
          image: obj['fromIcon'],
        },
        true
      );
      // vm.atUser({
      //   id: obj.fromId,
      //   nickName: obj.fromName,
      //   image: obj.fromIcon,
      // });
    },
  }

  if (currentUserAuthStatus == 1) {
    //当前用户在群里是群主
    if (currentUserAuthStatus < obj.authStatus) {
      arr.push(menu4);
    }
  } else if (currentUserAuthStatus == 2) {
    //当前用户在群里是管理员
    if (currentUserAuthStatus < obj.authStatus) {
      arr.push(menu4);
    }
  }
  arr.push(menu5);
  return arr;
}
