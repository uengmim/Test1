import { Injectable, Inject } from '@angular/core';
import { isDevMode } from '@angular/core';
import { AppConfigService } from '../services/appconfig.service';

/**
 * APP Config
 **/
interface AppConfig {
  dbTitle: string;
  dbSubTitle: string;
}

/**
 * Application 설정
 */
@Injectable({
  providedIn: 'root',
})
export class ImateInfo {
  private _serviceUrl: string = "https://localhost:4200";
  private _userId: string | null = null;
  private _password: string | null = null;

  private _dbTitle: string = "";
  private _dbTitleSub: string = "";

  constructor(appConfigService: AppConfigService) {
    this.serviceUrl = appConfigService.serviceUrl;

    this.dbTitle = appConfigService.dbTitle;
    this.dbTitleSub = appConfigService.dbSubTitle;

    this.userId = appConfigService.userId;
    this.password = appConfigService.password;
  }

  /**
   * Service Url
   */
  public get serviceUrl() : string {
    return this._serviceUrl;
  }

  /**
 * Service Url
 */
  public set serviceUrl(serviceUrl: string) {
    this._serviceUrl = serviceUrl;
  }

  /**
   * 사용자 ID
   */
  public get userId() : string | null {
    return this._userId;
  }
  /**
 * 사용자 ID
 */
  public set userId(userId: string | null) {
    this._userId = userId;
  }

  /**
   * 사용자 암호
   */
  public get password(): string | null {
    return this._password;
  }

  /**
   * 사용자 암호
   */
  public set password(password : string | null) {
    this._password = password;
  }

  /**
   * DB Title
   */
  public get dbTitle(): string {
    return this._dbTitle;
  }

  /**
   * DB Title
   */
  public set dbTitle(dbTitle: string) {
    this._dbTitle = dbTitle;
  }


  /**
   * 부 DB Title
   */
  public get dbTitleSub(): string {
    return this._dbTitleSub;
  }

  /**
   * 부 DB Title
   */
  public set dbTitleSub(dbTitleSub: string) {
    this._dbTitleSub = dbTitleSub;
  }
}
