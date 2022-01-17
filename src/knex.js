import path from 'path';
import log from 'electron-log';
import Knex from 'knex';
import { remote } from 'electron';

let configDir = path.join(remote.app.getPath('appData'), `${process.env.VUE_APP_ID}`);

const getConnection = userId => {
  log.info('获取数据库连接');
  const options = {
    client: 'sqlite3',
    connection: () => ({
      filename: `${configDir}/${userId}.db`,
    }),
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA synchronous=OFF', cb);
        conn.run('PRAGMA Journal_Mode=WAL', cb);
        conn.run('PRAGMA Cache_Size=5000', cb);
        // conn.run('PRAGMA foreign_keys = ON');
      }
    },
    // debug: true,
    useNullAsDefault: true
  };
  const knex = Knex(options);
  log.info('[Knex] 获取数据库连接成功, 数据库地址：', `${configDir}/${userId}.db`);
  return knex;
};

export { getConnection };
