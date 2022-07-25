import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ImateInfo } from './imate-info.service';
import * as cm from './imateCommon'

/**
 * Imdate Data Service
 **/
@Injectable()
export class ImateAuthService {
  //BASE URL
  private readonly _baseUrl: string;

  //iMATE Data Adapter
  private readonly _authenticationAdapter: AuthenticationAdapter;

  /**
   * iMATE Data Adapter
   */
  public get AuthenticationAdapter(): AuthenticationAdapter {
    return this._authenticationAdapter;
  }

  /**
   * 생성자
   * @param httpClient
   * @param imateInfo
   * @param document
   */
  constructor(private httpClient: HttpClient, private imateInfo: cm.ImateInfo, @Inject(DOCUMENT) private document: Document) {
    this._baseUrl = document.location.origin;
    this._authenticationAdapter = new AuthenticationAdapter(this.httpClient, this.imateInfo, this._baseUrl);
  }

  /**
 * Base Url
 */
  get baseUrl() {
    return this._baseUrl;
  }

  /**
* Base Url
*/
  get apiBaseUrl() {
    return this.imateInfo.serviceUrl;
  }

  /**
   * 
   * @param loginInfo
   */
  public login(loginInfo : cm.LoginInfo) {
    return this._authenticationAdapter.login(loginInfo);
  }

  /**
   * 로그인 정보
   **/
  public loginInfo() {
    return this._authenticationAdapter.loginInfo();
  }

  /**
   * 로그 아웃
   **/
  public logout() {
    return this._authenticationAdapter.logout();
  }
}

/**
 * Token Service Adapter
 * */
export class AuthenticationAdapter {

  // Application 정보
  private readonly apiPath: string;

  /**
   * 생성자
   * @param httpClient Http client
   * @param imateInfo iMATE 정보
   * @param baseUrl 기준 URL
   */
  constructor(private httpClient: HttpClient, private imateInfo: ImateInfo, private _baseUrl : string) {
    //API URL
    this.apiPath = `${this.imateInfo.serviceUrl}/api/Authentication`;
  }

  //http Option
  httpOptions = {

    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'rejectUnauthorized': 'false',
      'Access-Control-Allow-Origin': "*",
      'withCredentials': 'true',
      "X-Imate-api-auth": cm.apiAuthHeader(this.imateInfo.userId ?? "", this.imateInfo.password ?? "")
    }),
    rejectUnauthorized: false,
    requestCert: true,
  };

  // 에러 처리
  handleError(error: any) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  /**
   * 로그인을 한다.
   * @param loginInfo 로그인 정보
   */
  public async login(loginInfo: cm.LoginInfo) {
    try {
      var loginResult = await this.httpClient.post<cm.LoginInfo>(`${this.apiPath}/login`, loginInfo, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      return loginResult;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 로그인 정보룰 가져온다,
   */
  public async loginInfo() {
    try {
      var loginResult = await this.httpClient.get<cm.LoginInfo>(`${this.apiPath}/logininfo`, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      return loginResult;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 로그인 정보룰 가져온다,
   */
  public async logout() {
    try {
      var loginResult = await this.httpClient.get<boolean>(`${this.apiPath}/logout`, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      return loginResult;
    } catch (e) {
      throw e;
    }
  }

}
