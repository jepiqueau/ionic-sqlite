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
  constructor(private platform: Platform, private sqlite: SQLiteService) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      await customElements.whenDefined('jeep-sqlite');
      this.sqlite.initializePlugin().then(async (ret) => {
        this.initPlugin = ret;
        console.log('>>>> in App  this.initPlugin ' + this.initPlugin);
      });
    });
  }
}
