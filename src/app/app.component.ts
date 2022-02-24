import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { OrmService } from './orm.service';
import { SQLiteService } from './services/sqlite.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public isWeb = false;
  constructor(private platform: Platform, private sqlite: SQLiteService, private ormService: OrmService) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      await this.ormService.initialize();
      //await this.testDB();
    });
  }

  async testDB() {
    try {
      console.log(`going to create a connection`);
      const db = await this.sqlite.createConnection('db_issue',false,'no-encryption', 1);
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
      await this.sqlite.closeConnection('db_issue');
      console.log(`after closeConnection`);
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  }
}
