import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLiteService } from './services/sqlite.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  private initPlugin = false;
  private isWeb = false;

  constructor(private platform: Platform, private sqlite: SQLiteService) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      await this.initializeDB();
      await this.testDB();
      // // await customElements.whenDefined('jeep-sqlite');
      // this.sqlite.initializePlugin().then(async (ret) => {
      //   this.initPlugin = ret;
      //   console.log('>>>> in App  this.initPlugin ' + this.initPlugin);
      // });
    });
  }

  async initializeDB() {
    this.initPlugin = await this.sqlite.initializePlugin();
    const p: string = this.sqlite.platform;
    console.log(`plaform ${p}`);
    if( p === 'web') {
      this.isWeb = true;
      await customElements.whenDefined('jeep-sqlite');
      const jeepSqliteEl = document.querySelector('jeep-sqlite');
      if(jeepSqliteEl != null) {
        await this.sqlite.initWebStore();

        console.log(`isStoreOpen ${await jeepSqliteEl.isStoreOpen()}`);
        console.log(`$$ jeepSqliteEl is defined}`);
      } else {
        console.log('$$ jeepSqliteEl is null');
      }
    }
  }

  async testDB() {
    try {
      console.log(`going to create a connection`);
      const db = await this.sqlite.createConnection('test',false,'no-encryption', 1);
      console.log(`db ${JSON.stringify(db)}`);
      await db.open();
      console.log(`after db.open`);
      const query = `
      CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL
      );
      `;
      console.log(`query ${query}`);

      const res: any = await db.execute(query);
      console.log(`res: ${JSON.stringify(res)}`);
      await this.sqlite.closeConnection('test');
      console.log(`after closeConnection`);
    } catch (err) {
      console.log(`Error: ${err}`);
      this.initPlugin = false;
    }
  }
}
