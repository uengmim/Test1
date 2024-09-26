import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {

  private appConfig: any;
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
    //this.loadAppConfig();
  }

  loadAppConfig() {
    return this.http.get('/assets/appconfig.json')
      .toPromise()
      .then(config => {
        this.appConfig = config;
      });
  }

  /**
 * Server URL
 **/
  get serviceUrl(): string {
    return this.appConfig.serviceUrl;
  }

  /**
   * Database Title
   **/
  get dbTitle(): string {
    return this.appConfig.dbTitle;
  }

  /**
   * Database Sub Title
   **/
  get dbSubTitle(): string {
    return this.appConfig.dbSubTitle;
  }

  /**
   * 사용자ID
   **/
  get userId(): string {
    return this.appConfig.userId;
  }

  /**
   * 암호
   **/
  get password(): string {
    return this.appConfig.password;
  }
}
