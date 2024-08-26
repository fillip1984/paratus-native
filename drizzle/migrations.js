// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_exotic_cobalt_man.sql';
import m0001 from './0001_true_overlord.sql';
import m0002 from './0002_misty_goliath.sql';
import m0003 from './0003_misty_tigra.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  