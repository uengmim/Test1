import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { TokenServiceAdapter } from './tokenServiceAdapter';
import * as cm from './imateCommon'

/**
 * 질의 결과 Callback Action
 * */
export type queryResultAction = (result : cm.DataSet, e: Error) => { result: cm.DataSet, e: Error };

/**
 * 질의 결과 Callback Action
 * */
export type dmlResultAction = (affectedRows: Number, e: Error) => { affectedRows: Number, e: Error };

/**
 * 모델 적용 결과 Callback Action
 * */
export type modelResultAction<T> = (result: T | null, e: Error) => { result: T | null, e: Error };

/**
 * 트랜잭션 ID
 * */
export const getTransactioId = () => {
  return 'T' + Math.random().toString(36).substr(2, 9);
};

/**
 * Query 결과 Callback
 * */
export interface QueryResultAction {
  (result: cm.DataSet|null, error : any): void;
}

/**
 * Imdate Data Service
 **/
@Injectable()
export class ImateDataService {
  //BASE URL
  private readonly _baseUrl: string;

  //iMATE Data Adapter
  private readonly _imateDataAdapter: ImateDataAdapter;
  /**
   * iMATE Data Adapter
   */
  public get imateDataAdapter(): ImateDataAdapter {
    return this._imateDataAdapter;
  }

  /**
   * 생성자
   * @param httpClient
   * @param imateInfo
   * @param document
   */
  constructor(private httpClient: HttpClient, private imateInfo: cm.ImateInfo, @Inject(DOCUMENT) private document: Document) {
    this._baseUrl = document.location.origin;
    this._imateDataAdapter = new ImateDataAdapter(this.httpClient, this.imateInfo, this._baseUrl);
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
   *DB SELECT
   * 
   * @param queryMesssages
   */
  public dbSelectToDataSet(queryMesssages: cm.QueryMessage[]) {
    return this._imateDataAdapter.dbSelectToDataSet(queryMesssages);
  }

  /**
 * 데이터베이스 자료를 가져와 DataSet으로 변환 하여 반환 한다.
 * 
 * @param transctionId 트랜잭션 ID
 * @param queryMesssages 메시지
 * @param queryResultAction 결과 Action
 */
  public dbSelectToDataSetAsync(transactionId: string, queryMesssages: cm.QueryMessage[], queryResultAction: QueryResultAction) {
    this._imateDataAdapter.dbSelectToDataSetAsync(transactionId, queryMesssages, queryResultAction);
  }

  /**
  * 데이터베이스 자료를 가져와 DataSet으로 변환 하여 반환 한다.
  *
  * @param dataSource 데이터셋
  * @param query 쿼리
  */
  public dbSelectToDataSetQuery(dataSource: String, query: string) {
    return this._imateDataAdapter.dbSelectToDataSetQuery(dataSource, query);
  }

  /**
 * 데이터베이스 자료를 가져와 DataSet으로 변환 하여 반환 한다.
 * 
 * @param dataSource 데이터셋
 * @param query 쿼리
 * @param queryResultAction 결과 Action
 */
  public dbSelectToDataSetQueryAsync(transactionId: string, dataSource: string, query: string, queryResultAction: QueryResultAction) {
    return this._imateDataAdapter.dbSelectToDataSetQueryAsync(transactionId, dataSource, query, queryResultAction);
  }
  /**
  * 쿼리를 실행 하고 변경된 Row의 개수를 반환 받는다.
  *
  * @param dataSource 데이터 소스
  * @param query 쿼리
  */
  public dbExecute(dataSource: string, query: string) {
    return this._imateDataAdapter.dbExecute(dataSource, query);
  }

 /**
  * 데이터베이스 자료를 가져와 DataSet으로 변환 하여 반환 한다.
  * 
  * @param dataSource 데이터셋
  * @param query 쿼리
  * @param dmlResultAction 결과 Action
  */
  public dbExecuteAsync(transactionId: string, dataSource: string, query: string, resultAction: dmlResultAction) {
    this._imateDataAdapter.dbExecuteAsync(transactionId, dataSource, query, resultAction)
  }

 /**
  * 모델 데이터를 SELECT한다.
  *
  * @param dataSource 데이터 소스
  * @param query 쿼리
  */
  public SelectModelData<T>(dbtitle: string, modelModule: string, modelType: string, modelParams: string[] = [],
    whereCondition: string = "", sortCondition: string = "", cacheType: cm.QueryCacheType = cm.QueryCacheType.None) : Promise<T> {
    return this._imateDataAdapter.SelectModelData(dbtitle, modelModule, modelType, modelParams, whereCondition, sortCondition, cacheType);
  }

  /**
   * 모델 데이터를 비동기로 SELECT한다.
   *
   * @param dataSource 데이터 소스
   * @param query 쿼리
   */
  public SelectModelDataAsync<T>(dbtitle: string, modelModule: string, modelType: string, modelParams: string[] = [],
    whereCondition: string = "", sortCondition: string = "", cacheType: cm.QueryCacheType = cm.QueryCacheType.None, resultAction: modelResultAction<T>) {
    return this._imateDataAdapter.SelectModelDataAsync(dbtitle, modelModule, modelType, modelParams, whereCondition, sortCondition, cacheType,
      resultAction);
  }

  /**
 * 모델 데이터를 Modify한다.
 *
 * @param dataSource 데이터 소스
 * @param query 쿼리
 */
  public ModifyModelData<T>(dbtitle: string, modelModule: string, modelType: string, modelData: T) : Promise<number> {
    return this._imateDataAdapter.ModifyModelData(dbtitle, modelModule, modelType, modelData);
  }

  /**
   * 모델 데이터를 비동기로 Modify한다.
   *
   * @param dataSource 데이터 소스
   * @param query 쿼리
   */
  public ModifyModelDataAsync<T>(dbtitle: string, modelModule: string, modelType: string, modelData: T, resultAction: dmlResultAction) {
    return this._imateDataAdapter.ModifyModelDataAsync(dbtitle, modelModule, modelType, modelData, resultAction);
  }


  /**
 * 모델 데이터를 Modify한다.
 *
 * @param dataSource 데이터 소스
 * @param query 쿼리
 */
  public RefcCallUsingModel<T>(dbtitle: string, modelModule: string, modelType: string, modelData: T,
    cacheType: cm.QueryCacheType = cm.QueryCacheType.None): Promise<T> {
    return this._imateDataAdapter.RefcCallUsingModel(dbtitle, modelModule, modelType, modelData, cacheType);
  }

  /**
   * 모델 데이터를 비동기로 Modify한다.
   *
   * @param dataSource 데이터 소스
   * @param query 쿼리
   */
  public RefcCallUsingModelAsync<T>(dbtitle: string, modelModule: string, modelType: string, modelData: T,
    cacheType: cm.QueryCacheType = cm.QueryCacheType.None, resultAction: modelResultAction<T>) {
    return this._imateDataAdapter.RefcCallUsingModelAsync(dbtitle, modelModule, modelType, modelData, cacheType, resultAction);
  }

  /**
   * Device를 등록 한다
   * @param tokenIdInfo 토큰ID 정보
   */
  public registerId(tokenIdInfo: cm.TokenIdInfo) {
    this._imateDataAdapter.tokenService.registerId(tokenIdInfo);
  }

  /**
   * Device의 등록 상태를 반환 한다.
   * @param Devide id
   */
  public async registerStatus(id: string) {
    this._imateDataAdapter.tokenService.registerStatus(id);
  }

}

//####################################################################################################################################

/**
 * Imate Data Adapter
 **/
export class ImateDataAdapter {

  //Application 정보
  private readonly ApiPath: string;

  // Token 유효기간
  private tokenExpires: number;

  // JWT Token
  private jwtToken: string;

  //토근 발행 시간
  private tokenIssueTime: Date

  //Query Result Convert
  private readonly _queryResultConvert: cm.QueryResultConvert;

  // Token Service Adapter
  private readonly _tokenService: TokenServiceAdapter;
  /**
   * Token Service Adapter
   */
  public get tokenService(): TokenServiceAdapter {
    return this._tokenService;
  }

  constructor(private httpClient: HttpClient, private imateInfo: cm.ImateInfo, private baseUrl: string) {
    //API URL
    this.ApiPath = `${this.imateInfo.serviceUrl}/api/QueryService`;

    this._queryResultConvert = new cm.QueryResultConvert();

    this._tokenService = new TokenServiceAdapter(this.httpClient, this.imateInfo, this.baseUrl);
    this.tokenExpires = -1;
    this.tokenIssueTime = new Date("1900-01-01")
    this.jwtToken = "";

  }


  /**
   * 토근 ID
   */
  private _tokenId: string = "";

  /**
   * 토근 ID
   */
  public set tokenId(id: string) {
    this._tokenId = id;
  }


  //http Option
  public httpOptions =
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

  public async setHttpOptions() {

    this.httpOptions.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*",
      'withCredentials': 'true',
      "X-Imate-api-auth": cm.apiAuthHeader(this.imateInfo.userId ?? "", this.imateInfo.password ?? ""),
      "Authorization": await this.ImateOptions()
    });
  }

  /**
 *옵션을 생성 한다.
 * */
  private async ImateOptions() {

    //토근 발급
    await this.tokenIssue();

    //JWT AUTH DATA
    var jwtAuthData = "";
    if (this.jwtToken !== null && this.jwtToken !== "") {
      jwtAuthData = `Bearer ${this.jwtToken}`;
    }

    return jwtAuthData;
  }

  /**
  * Token 발행
  **/
  public async tokenIssue() {
    try {
      if (this.tokenExpires < 0)
        this.tokenExpires = await this._tokenService.getTokenExpires();

      var toDay = new Date;
      var min = (this.tokenIssueTime.getTime() - toDay.getTime()) / (1000 * 60);

      if (this.jwtToken !== null && this.jwtToken !== "" && this.tokenExpires > 0 && min < this.tokenExpires)
        return this.jwtToken;

      if (this.jwtToken === null || this.jwtToken === "") {
        this.jwtToken = this._tokenId === null || this._tokenId === ""
          ? await this._tokenService.getDefaultToken()
          : await this._tokenService.getToken(this._tokenId);

        this.tokenIssueTime = new Date();
      }

      return this.jwtToken;
    }
    catch (e) {
      throw e;
    }
  }

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

  //---------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * 데이터베이스 자료를 가져와 DataSet으로 변환 하여 반환 한다.
   *
   * @param queryMesssages 메시지
   */
  public async dbSelectToDataSet(queryMesssages: cm.QueryMessage[]) {
    try {
      await this.setHttpOptions();
      var transctionId = getTransactioId();
      var url = `${this.ApiPath}/ExecuteQueryBatch/${transctionId}`;

      let queryResult = await this.httpClient.post<cm.QueryRunResult>(url, queryMesssages, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      if (queryResult == null || queryResult == undefined)
        throw new Error("QUERY RESULT IS NULL OR UNDEFINED");

      if (queryResult.apiResult != "OK")
        throw new Error(queryResult.apiMessage);

      return this._queryResultConvert.resultToDataSet(queryResult);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 데이터베이스 자료를 가져와 DataSet으로 변환 하여 반환 한다.
   * 
   * @param transctionId 트랜잭션 ID
   * @param queryMesssages 메시지
   * @param queryResultAction 결과 Action
   */
  public dbSelectToDataSetAsync(transactionId: string, queryMesssages: cm.QueryMessage[], queryResultAction: QueryResultAction) {
    try {
      this.setHttpOptions().then(() => {
        this.httpClient.post<cm.QueryRunResult>(`${this.ApiPath}/ExecuteQueryBatch/${transactionId}`, queryMesssages, this.httpOptions).pipe(
          retry(1),
          catchError(this.handleError)
        ).toPromise().then((queryResult) => {
          var dataSet: cm.DataSet | null = null;
          var err: any = null;

          try {
            if (queryResult == null || queryResult == undefined)
              throw new Error("QUERY RESULT IS NULL OR UNDEFINED");

            if (queryResult.apiResult != "OK")
              throw new Error(queryResult.apiMessage);

            dataSet = this._queryResultConvert.resultToDataSet(queryResult);
          }
          catch (e) {
            err = e;
          }
          queryResultAction(dataSet, err);
        }
        );
      });
    }
    catch (e) {
      throw e;
    }
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------

  /**
  * 데이터베이스 자료를 가져와 DataSet으로 변환 하여 반환 한다.
  *
  * @param dataSource 데이터셋
  * @param query 쿼리
  */
  public async dbSelectToDataSetQuery(dataSource: String, query: string) {
    try {
      await this.setHttpOptions();
      var transactionId = getTransactioId;

      let queryResult = await this.httpClient.post<cm.QueryRunResult>(`${this.ApiPath}/ExecuteQuery/${transactionId}/${dataSource}`, query, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      if (queryResult == null || queryResult == undefined)
        throw new Error("QUERY RESULT IS NULL OR UNDEFINED");

      if (queryResult.apiResult != "OK")
        throw new Error(queryResult.apiMessage);

      return this._queryResultConvert.resultToDataSet(queryResult);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 데이터베이스 자료를 가져와 DataSet으로 변환 하여 반환 한다.
   * 
   * @param dataSource 데이터셋
   * @param query 쿼리
   * @param queryResultAction 결과 Action
   */
  public dbSelectToDataSetQueryAsync(transactionId: string, dataSource: string, query: string, queryResultAction: QueryResultAction) {
    try {
      this.setHttpOptions().then(() => {
        this.httpClient.post<cm.QueryRunResult>(`${this.ApiPath}/ExecuteQuery/${transactionId}/${dataSource}`, query, this.httpOptions).pipe(
          retry(1),
          catchError(this.handleError)
        ).toPromise().then((queryResult) => {
          var dataSet: cm.DataSet | null = null;
          var err: any = null;

          try {

            if (queryResult == null || queryResult == undefined)
              throw new Error("QUERY RESULT IS NULL OR UNDEFINED");

            if (queryResult.apiResult != "OK")
              throw new Error(queryResult.apiMessage);

            dataSet = this._queryResultConvert.resultToDataSet(queryResult);
          }
          catch (e) {
            err = e;
          }

          queryResultAction(dataSet, err);
        }
        );
      });
    }
    catch (e) {
      throw e;
    }
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------

  /**
    * 쿼리를 실행 하고 변경된 Row의 개수를 반환 받는다.
    *
    * @param dataSource 데이터 소스
    * @param query 쿼리
    */
  public async dbExecute(dataSource: string, query: string) {
    try {
      await this.setHttpOptions();
      var transactionId = getTransactioId;

      let queryResult = await this.httpClient.post<cm.QueryRunResult>(`${this.ApiPath}/ExecuteNoneQuery/${transactionId}/${dataSource}`, query, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      if (queryResult == null || queryResult == undefined)
        throw new Error("QUERY RESULT IS NULL OR UNDEFINED");

      if (queryResult.apiResult != "OK")
        throw new Error(queryResult.apiMessage);

      return Number.parseInt(queryResult.apiResult);
    } catch (e) {
      throw e;
    }
  }

  /**
  * 데이터베이스 자료를 가져와 DataSet으로 변환 하여 반환 한다.
  * 
  * @param dataSource 데이터셋
  * @param query 쿼리
  * @param dmlResultAction 결과 Action
  */
  public dbExecuteAsync(transactionId: string, dataSource: string, query: string, resultAction: dmlResultAction) {
    try {
      this.setHttpOptions().then(() => {
        this.httpClient.post<cm.QueryRunResult>(`${this.ApiPath}/ExecuteNoneQuery/${transactionId}/${dataSource}`, query, this.httpOptions).pipe(
          retry(1),
          catchError(this.handleError)
        ).toPromise().then((queryResult) => {
          var affectedRows: Number = -1;
          var err: any = null;

          try {

            if (queryResult == null || queryResult == undefined)
              throw new Error("QUERY RESULT IS NULL OR UNDEFINED");

            if (queryResult.apiResult != "OK")
              throw new Error(queryResult.apiMessage);

            affectedRows = Number.parseInt(queryResult.apiMessage);
          }
          catch (e) {
            err = e;
          }

          resultAction(affectedRows, err);
        }
        );
      });
    }
    catch (e) {
      throw e;
    }
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------

  /**
    * 모델 데이터를 SELECT한다.
    *
    * @typedef T 모겔 객체
    * @param dbtitle  데이터베이스 타이틀
    * @param modelModule 모델 모듈
    * @param modelType 모델 Type
    * @param modelParams 모델 파라미터
    * @param whereCondition where 조건
    * @param sortCondition sort 조건
    * @param cacheType 캐쉬 유형
    */
  public async SelectModelData<T>(dbtitle: string, modelModule: string, modelType: string, modelParams: string[] = [],
    whereCondition: string = "", sortCondition: string = "", cacheType: cm.QueryCacheType = cm.QueryCacheType.None): Promise<T> {
    try {
      await this.setHttpOptions();
      var transactionId = getTransactioId;

      var request = new cm.ModelDataRequest(
        dbtitle,
        `${transactionId}`,
        modelModule,
        modelType,
        modelParams,
        cm.ModelDataRequestMode.Select,
        whereCondition,
        sortCondition,
        cacheType,
        null);

      let result = await this.httpClient.post<cm.ModelDataReponse>(`${this.ApiPath}/ApplyModelData`, request, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      if (result == null || result == undefined)
        throw new Error("RESULT IS NULL OR UNDEFINED");

      if (result.apiResult != "OK")
        throw new Error(result.apiMessage);

      return JSON.parse(result.modelSerializationData) as T
    } catch (e) {
      throw e;
    }
  }

  /**
  * 모델 데이터를 비동기로 SELECT한다.
  * 
    * @typedef T 모겔 객체
    * @param dbtitle  데이터베이스 타이틀
    * @param modelModule 모델 모듈
    * @param modelType 모델 Type
    * @param modelParams 모델 파라미터
    * @param whereCondition where 조건
    * @param sortCondition sort 조건
    * @param cacheType 캐쉬 유형
    * @param dmlResultAction 결과 Action
  */
  public SelectModelDataAsync<T>(dbtitle: string, modelModule: string, modelType: string,
    modelParams: string[] = [], whereCondition: string = "", sortCondition: string = "", cacheType: cm.QueryCacheType = cm.QueryCacheType.None,
    resultAction: modelResultAction<T>) {
    try {


      this.setHttpOptions().then(() => {
        var transactionId = getTransactioId;
        var request = new cm.ModelDataRequest(
          dbtitle,
          `${transactionId}`,
          modelModule,
          modelType,
          modelParams,
          cm.ModelDataRequestMode.Select,
          whereCondition,
          sortCondition,
          cacheType,
          null);

        let result = this.httpClient.post<cm.ModelDataReponse>(`${this.ApiPath}/ApplyModelData`, request, this.httpOptions).pipe(
          retry(1),
          catchError(this.handleError)
        ).toPromise().then((result) => {
          var err: any = null;
          var responseModel: T | null = null;

          try {
            if (result == null || result == undefined)
              throw new Error("RESULT IS NULL OR UNDEFINED");

            if (result.apiResult != "OK")
              throw new Error(result.apiMessage);

            responseModel = JSON.parse(result.modelSerializationData) as T
          }
          catch (e) {
            err = e;
          }

          resultAction(responseModel, err);
        }
        );
      });
    }
    catch (e) {
      throw e;
    }
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------

  /**
      * 모델 데이터를 SELECT한다.
      *
      * @typedef T 모겔 객체
      * @param dbtitle  데이터베이스 타이틀
      * @param modelModule 모델 모듈
      * @param modelType 모델 Type
      * @param modelData 모델 데이터
      */
  public async ModifyModelData<T>(dbtitle: string, modelModule: string, modelType: string, modelData: T): Promise<number> {
    try {
      await this.setHttpOptions();
      var transactionId = getTransactioId;

      var request = new cm.ModelDataRequest(
        dbtitle,
        `${transactionId}`,
        modelModule,
        modelType,
        [],
        cm.ModelDataRequestMode.Modify,
        "",
        "",
        cm.QueryCacheType.None,
        JSON.stringify(modelData));

      let result = await this.httpClient.post<cm.ModelDataReponse>(`${this.ApiPath}/ApplyModelData`, request, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      if (result == null || result == undefined)
        throw new Error("RESULT IS NULL OR UNDEFINED");

      if (result.apiResult != "OK")
        throw new Error(result.apiMessage);

      return Number.parseInt(result.apiMessage);
    } catch (e) {
      throw e;
    }
  }

  /**
  * 모델 데이터를 비동기로 SELECT한다.
  * 
    * @typedef T 모겔 객체
    * @param dbtitle  데이터베이스 타이틀
    * @param modelModule 모델 모듈
    * @param modelType 모델 Type
    * @param modelData 모델 Data
    * @param dmlResultAction 결과 Action
  */
  public ModifyModelDataAsync<T>(dbtitle: string, modelModule: string, modelType: string, modelData: T, resultAction: dmlResultAction) {
    try {
      this.setHttpOptions().then(() => {
        var transactionId = getTransactioId;

        var request = new cm.ModelDataRequest(
          dbtitle,
          `${transactionId}`,
          modelModule,
          modelType,
          [],
          cm.ModelDataRequestMode.Modify,
          "",
          "",
          cm.QueryCacheType.None,
          JSON.stringify(modelData));

        let result = this.httpClient.post<cm.ModelDataReponse>(`${this.ApiPath}/ApplyModelData`, request, this.httpOptions).pipe(
          retry(1),
          catchError(this.handleError)
        ).toPromise().then((result) => {
          var err: any = null;
          var affectedRows: number = 0

          try {
            if (result == null || result == undefined)
              throw new Error("RESULT IS NULL OR UNDEFINED");

            if (result.apiResult != "OK")
              throw new Error(result.apiMessage);

            affectedRows = Number.parseInt(result.apiMessage);
          }
          catch (e) {
            err = e;
          }

          resultAction(affectedRows, err);
        }
        );
      });
    }
    catch (e) {
      throw e;
    }
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------

  /**
      * 모델 데이터를 Rfc를 Call 한다.
      *
      * @typedef T 모겔 객체
      * @param dbtitle  데이터베이스 타이틀
      * @param modelModule 모델 모듈
      * @param modelType 모델 Type
      * @param modelData 모델 데이터
      * @param cacheType 캐쉬 유형
      */
  public async RefcCallUsingModel<T>(dbtitle: string, modelModule: string, modelType: string, modelData: T,
    cacheType: cm.QueryCacheType = cm.QueryCacheType.None): Promise<T> {
    try {
      await this.setHttpOptions();
      var transactionId = getTransactioId;

      var request = new cm.ModelDataRequest(
        dbtitle,
        `${transactionId}`,
        modelModule,
        modelType,
        [],
        cm.ModelDataRequestMode.Rfc,
        "",
        "",
        cacheType,
        JSON.stringify(modelData));

      let result = await this.httpClient.post<cm.ModelDataReponse>(`${this.ApiPath}/ApplyModelData`, request, this.httpOptions).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();

      if (result == null || result == undefined)
        throw new Error("RESULT IS NULL OR UNDEFINED");

      if (result.apiResult != "OK")
        throw new Error(result.apiMessage);

      return JSON.parse(result.modelSerializationData) as T
    } catch (e) {
      throw e;
    }
  }

  /**
  * 모델 데이터로 비동기로 RFC를 Call 한다.
  * 
    * @typedef T 모겔 객체
    * @param dbtitle  데이터베이스 타이틀
    * @param modelModule 모델 모듈
    * @param modelType 모델 Type
    * @param modelParams 모델 파라미터
    * @param whereCondition where 조건
    * @param sortCondition sort 조건
    * @param cacheType 캐쉬 유형
    * @param dmlResultAction 결과 Action
  */
  public RefcCallUsingModelAsync<T>(dbtitle: string, modelModule: string, modelType: string, modelData: T,
    cacheType: cm.QueryCacheType = cm.QueryCacheType.None, resultAction: modelResultAction<T>) {
    try {
      this.setHttpOptions().then(() => {
        var transactionId = getTransactioId;

        var request = new cm.ModelDataRequest(
          dbtitle,
          `${transactionId}`,
          modelModule,
          modelType,
          [],
          cm.ModelDataRequestMode.Rfc,
          "",
          "",
          cacheType,
          JSON.stringify(modelData));

        let result = this.httpClient.post<cm.ModelDataReponse>(`${this.ApiPath}/ApplyModelData`, request, this.httpOptions).pipe(
          retry(1),
          catchError(this.handleError)
        ).toPromise().then((result) => {
          var err: any = null;
          var responseModel: T | null = null;

          try {
            if (result == null || result == undefined)
              throw new Error("RESULT IS NULL OR UNDEFINED");

            if (result.apiResult != "OK")
              throw new Error(result.apiMessage);

            responseModel = JSON.parse(result.modelSerializationData) as T
          }
          catch (e) {
            err = e;
          }

          resultAction(responseModel, err);
        }
        );
      });
    }
    catch (e) {
      throw e;
    }
  }
}
