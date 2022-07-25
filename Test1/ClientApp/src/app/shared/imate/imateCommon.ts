export * from './query-model/queryModel';
export * from './dataset/dataSet';
export * from './imate-info.service';

export { ModelDataRequestMode, QueryCacheType, ModelDataReponse, ModelDataRequest } from './query-model/modelDataModel';

import { Buffer } from 'buffer'
import { XNColumnInfo, QueryValue, QueryDataType, QueryRunResult } from './query-model/queryModel';

import { DataSet, DataColumn, DataRow, DataTable } from './dataset/dataSet';

/**
 * Api 인증 Header를 생성 한다.
 * @param options 옵션
 * @param userId 사용자ID
 * @param password 암호
 */
export function apiAuthHeader(userId: string, password: string) {
  var apiAuthData: string = "";

  if (userId !== null && userId !== "") 
    apiAuthData = Buffer.from(`${userId}:${password}`).toString("base64");

  return apiAuthData;
}

/**
 * Json 파라미터를 만든다.
 * @param dataObj
 */
export function getRFCParameter(dataObj: any) : string{
  var dataJson = JSON.stringify(dataObj)
                .replace(/'/g, "#0x27")
                .replace(/`/g, "#0x60")
                .replace(/"/g, "'")

  return `\"json@${dataJson}\"`;
}

/**
 * AUTH Header
 **/
export const IMATE_AUTH_HEADER = "X-Imate-api-auth";

/**
 * 실행 결과
 * */
export class ExecuteResult {
  //성공여부
  isSuccess!: boolean;
  //메시지
  message!: string;
}

/**
 * 토근의 식별 정보 테이블
 **/
export class TokenIdInfo {
  /**
   *식별자
   */
  id!: string;
  /**
   * App 이름
   */
  appname!: string;
  /**
   * e-mail 주소
   */
  email!: string;
  /**
   * 부서코드
   */
  deptcode!: string;
  /**
   * 부서이름
   */
  deptname!: string;
  /**
   * 사용자ID
   */
  userid!: string;
  /**
   * 사원번호
   */
  empid!: string;
  /**
   * 이름
   */
  name!: string;
  /**
   * 롤
   */
  role!: string;
  /**
   * 참조 데이터 1
   */
  refdata1!: string;
  /**
   * 참조 데이터 2
   */
  refdata2!: string;
  /**
   * 참조 데이터 3
   */
  refdata3!: string;
  /**
   * 참조 데이터 4
   */
  refdata4!: string;
  /**
   * 참조 데이터5
   */
  refdata5!: string;
  /**
   * 컬쳐(ko-Kr, en-US등.... .NET의 컬쳐 코드)
   */
  culture!: string;
}

//----------------------------------------------------------------------------------------------

/**
 *  Data Convert Class
 * */
export class QueryResultConvert {
  /**
   * 커럼정보를 DataColums 집합으로 변경 한다.
   *
   * @param columnInfos 컬럼 정보보
   *
   */
  private columnInfoToDataColumn(columnInfos: XNColumnInfo[]): DataColumn[] {
    try {
      var dataColumns: DataColumn[] = [];

      columnInfos.forEach((value) => {

        dataColumns.push(new DataColumn(value.ordinal, value.name, value.ordinal.toString(), value.isKey, value.dataType));
      });

      return dataColumns;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 쿼리 값을 DataTable로 변환 한다.
   *
   * @param queryValue 쿼리값
   */
  public valueToDataTable(queryValue: QueryValue): DataTable {
    try {
      var dataColumns = this.columnInfoToDataColumn(queryValue.columnInfos);
      var dataTable = new DataTable(queryValue.queryName, dataColumns);

      queryValue.rows.forEach((row) => {
        //새 DataRow를 만든다.
        var dataRow = dataTable.newDataRow();
        dataColumns.forEach((col) => {
          var value: any;
          //데이터 유형별 변환을 한다.
          switch (col.dataType) {
            case QueryDataType.Number:
              value = Number.parseFloat(row.rowValue[col.valueIndex]);
              break;
            case QueryDataType.Date:
              value = new Date(row.rowValue[col.valueIndex]);
              break;
            case QueryDataType.Time:
              value = row.rowValue[col.valueIndex];
              break;
            default:
              value = row.rowValue[col.valueIndex];
          }

          dataRow.newValue(col.valueIndex, value)
        });

        dataTable.setDataRow(dataRow)
      });

      return dataTable
    } catch (e) {
      throw e;
    }
  }

  /**
   * 쿼리 결과를 DataSet으로 변환 한다.
   *
   * @param queryResult 쿼리 결과
   */
  public resultToDataSet(queryResult: QueryRunResult): DataSet {
    var dataSet = new DataSet(queryResult.transactionId)

    queryResult.results.forEach((queryValue) => {
      var dataTable = this.valueToDataTable(queryValue);
      //dataSet.tables.push(dataTable);
      dataSet.tables[dataTable.tableName] = dataTable;
    });

    return dataSet
  }
}

//----------------------------------------------------------------------------

/**
 * 로그인 정보
 * */
export class LoginInfo {
  constructor(
    //로그인ID
    public loginId: string,
    //암호
    public passwd: string,
    //언어
    public language?: string,
    //사용자이름(반환)
    public userName?: string,
    //사용자롤(반환)
    public role?: string,
    //인증여부(반환)
    public isAuthenticated: boolean = false
  ) { }
}

