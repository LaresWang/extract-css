// 数据操作

module.exports = {
  sqliteHasTable: async (tableName) => {
    return await window.vm.$knex.schema.hasTable(tableName)
  },
  sqliteQueryBySQL: async (sql) => {
    return await window.vm.$knex.raw(sql)
  },

  sqliteFindOne: async (tableName, condition, selection = []) => {
    try {
      const isExists = await window.vm.$knex.schema.hasTable(tableName)
      if (!isExists) {
        throw `${tableName} is not exists`
      }
      let data
      if (selection && selection.length) {
        data = await window.vm
          .$knex(`${tableName}`)
          .where(condition)
          .select(...selection)
      } else {
        data = await window.vm.$knex(`${tableName}`).where(condition)
      }
      return data.length > 0 ? data[0] : null
    } catch (err) {
      return Promise.reject(err)
    }
  },
  sqliteFind: async (tableName, condition, selection = []) => {
    try {
      const isExists = await window.vm.$knex.schema.hasTable(tableName)
      if (!isExists) {
        throw `${tableName} is not exists`
      }
      let data
      if (selection && selection.length) {
        data = await window.vm
          .$knex(`${tableName}`)
          .where(condition)
          .select(...selection)
      } else {
        data = await window.vm.$knex(`${tableName}`).where(condition)
      }
      return data
    } catch (err) {
      return Promise.reject(err)
    }
  },
  sqliteUpdate: async (tableName, condition, doc) => {
    try {
      const isExists = await window.vm.$knex.schema.hasTable(tableName)
      if (!isExists) {
        throw `${tableName} is not exists`
      }
      return await window.vm
        .$knex(`${tableName}`)
        .where(condition)
        .update(doc)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  sqliteInsert: async (tableName, obj) => {
    try {
      const isExists = await window.vm.$knex.schema.hasTable(tableName)
      if (!isExists) {
        throw `${tableName} is not exists`
      }
      return await window.vm.$knex(`${tableName}`).insert(obj)
    } catch (err) {
      return Promise.reject(err)
    }
  },
  sqliteUpsert: async (tableName, condition, obj) => {
    try {
      const data = await window.vm.$knex(`${tableName}`).where(condition)
      let result = ''
      if (data.length > 0) {
        result = await window.vm
          .$knex(`${tableName}`)
          .where(condition)
          .update(obj)
      } else {
        result = await window.vm
          .$knex(`${tableName}`)
          .insert({ ...obj, ...condition })
      }
      return result
    } catch (err) {
      return Promise.reject(err)
    }
  },
  sqliteDelete: async (tableName, condition) => {
    try {
      const isExists = await window.vm.$knex.schema.hasTable(tableName)
      if (!isExists) {
        throw `${tableName} is not exists`
      }
      return await window.vm
        .$knex(tableName)
        .where(condition)
        .del()
    } catch (err) {
      return Promise.reject(err)
    }
  },

  // `insert or replace into t_groups_member (id, group_id, joinTime, nick_name, auth_status, forbiddenWordsStatus, vipType,
  //   inviteCodeType, userRank, muteNotifications, user_head_img, additionalStatus, mutedStatus,
  //   inviteCode, stickyStatus, user_head_img_local, is_show,
  //   member_notes, member_notes_pinyin) values ${a}`
  sqliteReplace: async (tableName, columns, values) => {
    try {
      if (!values.length) {
        return Promise.resolve();
      }
      let valueString = `insert or replace into ${tableName} (${columns.join(',')}) values `;
      for(let item of values) {
        valueString += '('
        for (let column of columns) {
          valueString += typeof item[column] == 'string' ? `'${item[column]}',` : `${item[column]},`;
        }
        valueString = valueString.substr(0, valueString.length - 1);
        valueString += '),'
      }
      valueString = valueString.substr(0, valueString.length - 1);
      const result = await window.vm.$knex.raw(valueString);
      console.log('批量replace结果：',result);
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
