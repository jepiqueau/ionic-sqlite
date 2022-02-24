import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { User } from 'src/entities/user';
import { MOCK_USERS } from 'src/mock-users';
import { Connection, createConnection, getConnection } from 'typeorm';
import { SQLiteService } from './services/sqlite.service';

@Injectable({
  providedIn: 'root',
})
export class OrmService {
  constructor(private sqlite: SQLiteService) {}

  async initialize() {
    try {
      await this.initializeDB();
      await getConnection();
    } catch (ex) {
      console.log('Connection not established, creating connection', ex);
      await this.createConnection();
      console.log('Connection created!');
    }
    await this.createMockData();
    if( this.sqlite.platform === 'web') {
      await this.sqlite.saveToStore('test');
    }

    console.log('All users:', JSON.stringify(await User.find(), null, 2));
  }

  /**
   * Initialize the database. On device does nothing. On web, sets up the
   * IndexDB database, if it doesn't exist.
   */
  async initializeDB() {
    await this.sqlite.initializePlugin();
    const p = this.sqlite.platform;
    console.log(`plaform ${p}`);
    if (p === 'web') {
      await customElements.whenDefined('jeep-sqlite');
      const jeepSqliteEl = document.querySelector('jeep-sqlite');
      if (jeepSqliteEl != null) {
        await this.sqlite.initWebStore();
        console.log(`isStoreOpen ${await jeepSqliteEl.isStoreOpen()}`);
        console.log(`$$ jeepSqliteEl is defined $$`);
      } else {
        console.log('$$ jeepSqliteEl is null');
        throw Error('jeepSqliteEl is null');
      }
    }
  }

  /**
   * Create mock data for testing. To be called after TypeORM connection
   * to the database has been created.
   */
  private async createMockData(): Promise<void> {
    const users = await User.find();
    if (users.length > 0) {
      console.log('Skipping loading user data as it already exists!');
      return;
    }

    console.log('Loading user data..');
    for (let index = 0; index < 10; index++) {
      const user = MOCK_USERS[index];
      const newUser = new User();
      newUser.firstName = user.firstName;
      newUser.lastName = user.lastName;
      await newUser.save();
    }
  }

  private async createConnection(): Promise<Connection> {
    // when using Capacitor, you might want to close existing connections,
    // otherwise new connections will fail when using dev-live-reload
    // see https://github.com/capacitor-community/sqlite/issues/106
    CapacitorSQLite.checkConnectionsConsistency({
      dbNames: ['test'], // i.e. "i expect no connections to be open"
    }).catch((e) => {
      // the plugin throws an error when closing connections. we can ignore
      // that since it is expected behaviour
      console.log(e);
      return null;
    });

    // create a SQLite Connection Wrapper
    const sqliteConnection = new SQLiteConnection(CapacitorSQLite);

    // copy preloaded dbs (optional, not TypeORM related):
    // the preloaded dbs must have the `YOUR_DB_NAME.db` format (i.e. including
    // the `.db` suffix, NOT including the internal `SQLITE` suffix from the plugin)
    // await sqliteConnection.copyFromAssets();

    // create the TypeORM connection
    return await createConnection({
      logging: ['error', 'query', 'schema'],
      type: 'capacitor',
      driver: sqliteConnection, // pass the connection wrapper here
      database: 'test', // database name without the `.db` suffix,
      mode: 'no-encryption',
      synchronize: true,
      entities: [User],
    });
  }
}
