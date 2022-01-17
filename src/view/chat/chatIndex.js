import { fileValidation } from '@/utils';
import { SET_DRAF_LIST, UPDATE_CHAT_CONTENT } from '@/store/types';
import store from '@/store';
import {sqliteFindOne} from '@/services/sqliteDao';
import { videoTypeArr } from "@/utils/const";

export default {
  async dropwrapperListenerDrop(e) {
    this.maskVisible = false;
    let self = this;
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      for (let file of files) {
        console.log(file);
        let fileType = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        if (fileType == 'exe' || fileType == 'bat' || fileType == 'dmg') {
          self.fileName = '';
          this.$message.error(window.vm.$t('chat_0106'));
          return false;
        }

        let type = '';
        let _type = file.type.substr(0, 5)
        if (_type == 'image') {
          type = window.vm.$t('chat_0013')+' ';
        } else if (_type == 'video' && videoTypeArr.includes(fileType)) {
          type = window.vm.$t('chat_0015')+' ';
        } else {
          type = window.vm.$t('chat_0017')+' ';
        }
        let flag = await fileValidation(file, self);
        if (!flag) {
          self.fileName = '';
          return false;
        }
        self.fileName = self.fileName + type + file.name + '\n';
      }
      // self.dropFile = e.dataTransfer.files;
      self.dropFile = files;
      self.sendFile = true;
    }
  },
  dropwrapperListenerDragenter(e) {
    let self = this;
    self.leaveElement = e.target.className;
    e.preventDefault();
  },
  dragoverListenerDragenter(e) {
    let self = this;
    self.maskVisible = true;
    e.preventDefault();
  },
  dragleaveListenerDragenter(e) {
    let self = this;
    if (e.target.className === 'maskVisible' || self.leaveElement === e.target.className) {
      self.maskVisible = false;
    } else {
      self.maskVisible = true;
    }
    e.preventDefault();
  },
  initDraft(from) {
    let self = this;
    self.quill.blur();
    if(self.initFlag){
      //如果没有初始化完成，不更新草稿
      let texthtml ='';
      if(self.quill.getContents() && self.quill.getContents().ops.length>0){
        let msglist = self.quill.getContents().ops
        // console.log('~!!!!!!!!!!!!!!!',msglist)
        if(msglist.length>0){
          let j = 0 ;
          for(let i of msglist){
            if(i.insert && i.insert.image && !(i.attributes && i.attributes.alt)){ //图片
              j = j + 1;
              texthtml = texthtml + window.vm.$t('chat_0013');
            } else if (i.insert && i.insert.image && i.attributes && i.attributes.alt) {
              texthtml = texthtml + i.attributes.alt;
            }else if(i?.insert?.mention?.denotationChar=='@'){//扩展mention props
              let {denotationChar,value}=i.insert.mention;
              texthtml = texthtml + denotationChar+value;
            }else{
              texthtml = texthtml + i.insert
            }
          }
        }
      }
      let draftObj = {
        id: from.query.id,
        ...from.query.item,
        draftText: texthtml,
        draftHtml: self.texthtml,
        draftTime: texthtml.length > 1 ? Date.now() : null,
        msgHtml: texthtml,
        msgType: 1,
        texthtml: self.texthtml
      };
      self.$store.commit(SET_DRAF_LIST, draftObj);
    }
  },
  async widthDrawMsg(msgInfo){
    console.log('&&&&&&info', msgInfo)
    let searchRetsMsgbody = {};
    if (msgInfo.msgType == 24 ){
      let searchRets = await sqliteFindOne(`m_${msgInfo.id}`, {
        msg_id: msgInfo.msgBody.msgId
      }, ['msg_body']);
      console.log(searchRets, 'searchRets');
      if (searchRets) {
        searchRetsMsgbody = JSON.parse(searchRets.msg_body);
      } else {
        searchRets = await sqliteFindOne(`m_${msgInfo.id}`, {
          req_id: msgInfo.msgBody.reqId
        }, ['msg_body']);
        if(searchRets){
          searchRetsMsgbody = JSON.parse(searchRets.msg_body);
        }
      }
    }
    let widthDrawTextObj = {};
    let widthDrawText = '';
    let myUserId = localStorage.userId;
    let originName = ''; //被撤回msg的那个人
    let authStatus = 3;
    if (msgInfo.msgBody && msgInfo.msgBody.userId && msgInfo.msgBody.userId != myUserId) { //拿被撤回msg的那个人的名字
      const SELECT_SQL =
        "select nick_name from t_groups_member where group_id='" + msgInfo.targetId + "' and id='" + msgInfo.msgBody.userId + "'";
      let resultArr = await window.vm.$knex.raw(SELECT_SQL);
      const SELECT_SQL2 =
        "select auth_status from t_groups_member where group_id='" + msgInfo.targetId + "' and id='" + msgInfo.fromId + "'";
      let resultArr2 = await window.vm.$knex.raw(SELECT_SQL2);
      if (resultArr.length > 0) {
        originName = resultArr[0].nick_name
      }
      if (resultArr2.length > 0) {
        authStatus = resultArr2[0].auth_status
      }
    }
    if (msgInfo.fromId == myUserId) { //自己撤回
      if (!originName) {
        widthDrawText = window.vm.$t('chat_notice_0029');
      } else {
        widthDrawTextObj.widthDrawName = originName;
        widthDrawText = `${window.vm.$t('chat_notice_0028', {fromName: originName})}`;
      }
    } else if (authStatus && authStatus != 3 && msgInfo.fromId != myUserId && msgInfo.fromId != msgInfo.msgBody.userId && originName) {
      widthDrawTextObj.widthDrawName = originName;
      widthDrawText = window.vm.$t('chat_notice_0027', {fromName: originName});
    } else if (originName && msgInfo.fromId == msgInfo.msgBody.userId) {
      widthDrawText = window.vm.$t('chat_notice_0025', {value: originName});
      //widthDrawText = `管理员撤回了你的消息`
    } else {
      widthDrawText = window.vm.$t('chat_notice_0026');
    }
    widthDrawTextObj.widthDrawText = widthDrawText
    await window.vm
      .$knex(`m_${msgInfo.id}`)
      .update({
        msg_type: 26,
        from_type: 0,
        text: '',
        status: 2,
        from_id: msgInfo.fromId,
        ref_body: JSON.stringify({...msgInfo.refMsgBody}),
        msg_body: JSON.stringify({ ...searchRetsMsgbody, ...msgInfo.msgBody, ...widthDrawTextObj })
      })
      .where({
        msg_id: msgInfo.msgBody.msgId
      }).orWhere({
        req_id: msgInfo.msgBody.reqId
      });

    store.commit(UPDATE_CHAT_CONTENT, '');
  }
};
