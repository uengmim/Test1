import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as cm from './imateCommon'
import { ImateInfo } from './imate-info.service';

/**
 * Token Service Adapter
 * */
export class TokenServiceAdapter {

  // Application 정보
  private readonly apiPath: string;

  /**
   * 생성자
   * @param httpClient Http client
   * @param imateInfo iMATE 정보
   * @param baseUrl 기준 URL
   */
  constructor(private httpClient: HttpClient, private imateInfo: ImateInfo, private baseUrl : string) {
    //API URL
    this.apiPath = `${this.imateInfo.serviceUrl}/api/TokenService`;

  }

  //http Option
  httpOptions = {

    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'rejectUnauthorized': 'false',
      'Access-Control-Allow-Origin': "*",
      'withCredentials': 'true',
      "X-Imate-api-auth": cm.apiAuthHeader(this.imateInfo.userId??"", this.imateInfo.password??"")
    }),
    rejectUnauthorized: false,
    requestCert: true,
  };

  // 에러 처리
  handleError(error : any) {
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
   * Device를 등록 한다
   * @param tokenIdInfo Device 토근ID 정보
   */
  public async registerId(tokenIdInfo: cm.TokenIdInfo) {
    try {
      var tokenResult = await this.httpClient.post<cm.ExecuteResult>(`${this.apiPath}/RegisterId`, tokenIdInfo, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      if (tokenResult == undefined)
        throw new Error("TOKEN RESULT IS UNDEFINED!!");

      if (!tokenResult.isSuccess)
        throw new Error(tokenResult.message);

      return tokenResult.message;
    } catch(e) {
      throw e;
    }
  }

  /**
   * Device의 등록 상태를 반환 한다.
   * @param Devide id
   */
  public async registerStatus(id: string) {
    try {
      var tokenResult = await this.httpClient.get<cm.ExecuteResult>(`${this.apiPath}/RegisterStatus/${id}`, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      if (tokenResult == undefined) 
        throw new Error("TOKEN RESULT IS UNDEFINED!!");
      
      if (!tokenResult.isSuccess)
        throw new Error(tokenResult.message);

      return tokenResult.message;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Device의 토근을 반환 한다.
   * 
   * @param id 토근ID
   */
  public async getToken(id: string) {
    try {
      var tokenResult = await this.httpClient.get<string>(`${this.apiPath}/GetToken/${id}`, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      return tokenResult == undefined ? "" : tokenResult;
    } catch (e) {
      throw e;
    }
  }

  /**
   *  기본 Token 정보를 반환 한다.
   * 
   */
  public async getDefaultToken() {
    try {
      var tokenResult = await this.httpClient.get<string>(`${this.apiPath}/GetDefaultToken`, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise()

      return tokenResult == undefined ? "" : tokenResult;

    } catch (e) {
      throw e;
    }
  }

  /**
   * Token의 유효 기간
   **/
  public async getTokenExpires()  {
    try {
      var tokenExpires = await this.httpClient.get<number>(`${this.apiPath}/GetTokenExpires`, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      return tokenExpires == undefined ? -1 : tokenExpires;
    } catch (e) {
      throw e;
    }
  }
}
