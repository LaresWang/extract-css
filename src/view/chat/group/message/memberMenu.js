export default function(currentUserAuthStatus, obj, vm) {
  let arr = [];
  const menu1 = {
    name: vm.$t('book_friend_0014'),
    fun: () => {
      vm.setMemberNotes(obj);
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
      vm.setAsAdmin(obj, num);
    }
  };
  const menu3 = {
    name: obj.forbiddenWordsStatus == 0 ? vm.$t('chat_comm_set_0036') : vm.$t('chat_comm_set_0037'),
    fun: () => {
      vm.setMemberForbiddenWords(obj, obj.forbiddenWordsStatus == 0 ? 1 : 0);
    }
  };
  const menu4 = {
    name: vm.$t('book_friend_0020'),
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
          id: obj.fromId,
          nickName: obj.nickName,
          value: obj.nickName,
          image: obj.fromIcon,
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
      arr.push(menu1);
      arr.push(menu2);
      if (obj.authStatus == 3) {
        arr.push(menu3);
      }
      arr.push(menu4);
    }
  } else if (currentUserAuthStatus == 2) {
    //当前用户在群里是管理员
    if (currentUserAuthStatus < obj.authStatus) {
      arr.push(menu1);
      arr.push(menu3);
      arr.push(menu4);
    }
  }
  arr.push(menu5);
  return arr;
}
