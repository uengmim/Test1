import { QueryDataType } from '../query-model/queryModelEnum';
import { RowVersion, RowStatus } from './dataSetEnum';

export * from './dataSetEnum';

/**
 * DataTable 사전
 **/
interface DataTables {
  [key: string]: DataTable;
}

/**
 * DataSet 클래스
 */
export class DataSet {
  /**
   * 생성자
   * 
   * @param transactionId 트랜잭션 ID
   */
  constructor(transactionId: string) {
    this._transactionId = transactionId;
    this._tables = {};
  }

  //트랜잭션ID
  private _transactionId: string;
  /**
   * 트랜잭션ID
   */
  public get transactionId() {
    return this._transactionId;
  }

  //데이터 테이블 컬렉션
  private _tables: DataTables;
  /**
   * 테이블 배열
   */
  public get tables() {
    return this._tables;
  }

  /**
   * 데이터 Objet를 만든다.
   */
  public getDataObject<T>(tableName: string, type: { new(): T; }): T[] {
    try {
      //var dataTables = this.tables.filter(t => t.tableName == tableName);
      var dataTable = this.tables[tableName];

      if (dataTable === undefined || dataTable === null)
        throw new Error(`Table '${tableName}' not found`);

      //var dataTable = dataTables[0];
      var resultList = dataTable.getDataObject<T>(type);

      return resultList;
    } catch (e) {
      throw e
    }
  }
}

/**
 * 데이트 테이블 Class
 */
export class DataTable {

  //생성자
  constructor(tableName?: string, dataColumns?: DataColumn[]) {
    this._tableName = tableName == null ? "TABLE1" : tableName;
    this._dataColumns = dataColumns == null ? [] : dataColumns;
    this._dataRows = [];
    this._currRowIndex = -1;
  }

  //현재 Row Index
  private _currRowIndex: number = -1;

  //테이블의 데이터 Row의 컬렉션
  private _dataRows: DataRow[] = [];
  /**
   * 데이블의 데이터 Row의 컬렉션
   */
  public get dataRows() {
    return this._dataRows;
  };

  //데이터 커럼
  private _dataColumns: DataColumn[];
  /**
   *  데이터 컬럼들
   */
  public get dataColumns() {
    return this._dataColumns;
  };

  //table 이름
  private _tableName: string;
  /**
   * table 이름
   */
  public get tableName() {
    return this._tableName;
  }

  /**
   * 데이터 Objet를 만든다.
   */
  public getDataObject<T>(type: { new(): T; }): T[] {
    try {
      var resultList: T[] = [];

      this.getDataRows().forEach(r => {
        var result: T = new type();
        this.dataColumns.forEach(c => {
          (<any>result)[c.columnName] = r.getValueIndex(c.valueIndex);
        });

        resultList.push(result);
      });

      return resultList;
    } catch (e) {
      throw e
    }
  }

  /**
   * 현재 Row Index
   */
  public get currentRowIndex() {
    return this._currRowIndex;
  }

  /**
   * Row를 이동 한다.
   */
  public move(rowindex: number) {
    if (rowindex >= this._dataRows.length)
      this._currRowIndex = this._dataRows.length - 1;
    else
      this._currRowIndex = rowindex;
  }

  /**
   * 처음으로 이동
   **/
  public moveFirst() {
    if (this.currentRowIndex === -1)
      throw new Error("Data row not init");

    this.move(0);
  }

  /**
   *  마지막으로 이동
   **/
  public moveLast() {
    if (this.currentRowIndex === -1)
      throw new Error("Data row not init");

    this.move(this._dataRows.length - 1);
  }

  /**
   * Move Next
   **/
  public moveNext() {
    if (this.currentRowIndex === -1)
      throw new Error("Data row not init");

    if (this.currentRowIndex === this._dataRows.length - 1)
      return false;

    this.move(this.currentRowIndex + 1);

    return true;
  }

  /**
   * Move Previous
   **/
  public movePrevious() {
    if (this.currentRowIndex === -1)
      throw new Error("Data row not init");

    if (this.currentRowIndex === 0)
      return false;

    this.move(this.currentRowIndex - 1);

    return true;
  }

  /**
   * 현재의 Row를 가져온다.
   *
   * @param rowIndex Row Index
   */
  public getCurrentDataRow(rowIndex: number): DataRow {
    try {
      var maxIndex = Object.keys(this.dataRows).length - 1;
      if (rowIndex > maxIndex)
        throw new Error(`Out Of Row index ${rowIndex} / ${maxIndex}`)

      var row = this.dataRows[rowIndex]

      //삭제된 row이면 다음 삭제안된 row를 반환 한다.
      if (row.getRowStatus() == RowStatus.Deleted) {
        do {
          row = this.dataRows[++rowIndex]
        } while (row.getRowStatus() == RowStatus.Deleted)
      }

      return row
    }
    catch (e) {
      throw new Error(`${e} : index ${rowIndex}`)
    }
  }

  /**
   * 데이커 컬럼의 크기
   */
  public getDataColumnCount(): number {
    return this.dataColumns.length;
  }

  /**
   * 컬럼이름의 컬럼 인덱스를 가져 온다.
   *
   * @param colName 컬럼이름
   */
  public getColumnIndex(colName: string): number {

    try {
      return this.dataColumns.findIndex(v => v.columnName == colName);
    }
    catch (e) {
      throw e;
    }
  }

  /**
   * 컬럼의 이름의 리스트를 가져 온다.
   */
  public getDataColumnNames(): string[] {
    try {
      var columns: string[] = [];

      this.dataColumns.forEach(v => columns.push(v.columnName));

      return columns;
    }
    catch (e) {
      throw e;
    }
  }

  /**
   *  인덱스의 데이터 컬럼을 가져 온다.
   *
   *  @param index 인덱스
   */
  public getDataColumnIndex(index: number): DataColumn {
    try {
      return this.dataColumns[index];
    }
    catch (e) {
      throw e;
    }
  }

  /**
   * 컬럼이름으로 데이터 컬럼을 가져온다.
   *
   * @param colName 컬럼이름
   */
  public getDataColumnName(colName: string): DataColumn {
    return this.dataColumns[this.getColumnIndex(colName)]
  }

  /**
   * DataRow를 추가 한다.
   *
   * @param dataRow Data Row
   */
  public setDataRow(dataRow: DataRow) {
    try {
      if (this.currentRowIndex === -1)
        throw new Error("Data row not init");

      this.dataRows[this._currRowIndex] = dataRow
      dataRow.attachDataTable(this)
    } catch (ex) {
      throw ex
    }
  }

  /**
   * 비어 있는 새로운 Data Row를 마지막에 추가 한다.
   */
  public newDataRow(): DataRow {
    try {
      var newRow = new DataRow();

      Object.keys(this.dataColumns).forEach(k => newRow.newValue(Number(k), ""))

      newRow.attachDataTable(this)
      newRow.setRowStatus(RowStatus.Addnew)

      this._currRowIndex++;
      this.setDataRow(newRow);

      return newRow
    }
    catch (ex) {
      throw ex
    }
  }

  /**
   * 지정된 상태의 Row의 개수를 반환 한다.
   * @param rowStatus Row 상태
   */
  public getRowCount(rowStatus?: RowStatus): number {
    try {
      return rowStatus == null || rowStatus == undefined
        ? this.dataRows.filter(v => v.getRowStatus() != RowStatus.Deleted).length
        : this.dataRows.filter(v => v.getRowStatus() == rowStatus).length
    } catch (ex) {
      throw ex
    }
  }

  /**
   * 인덱스의 Row를 가져온다.
   *
   * @param rowIndex Row 인덱스
   */
  public getDataRow(rowIndex: number): DataRow {
    try {
      return this.getCurrentDataRow(rowIndex)
    } catch (ex) {
      throw ex
    }
  }

  //---------------------------------------------------------------------------------------------

  /**
   * Row의 컬럼 값을 설정 한다.
   *
   * @param rowIndex Row 인덱스
   * @param colIndex 컬럼 인덱스
   * @param value 컬럼의 값
   */
  public setRowValueIndex(rowIndex: number, colIndex: number, value: any) {
    try {
      this.getCurrentDataRow(rowIndex).setValueIndex(colIndex, value)
    } catch (ex) {
      throw ex
    }
  }

  /**
   * Row의 컬럼 값을 설정 한다.
   *
   * @param rowIndex Row 인덱스
   * @param colName 컬럼 이름
   * @param value 컬럼의 값
   */
  public setRowValueName(rowIndex: number, colName: string, value: any) {
    try {
      this.getCurrentDataRow(rowIndex).setValueName(colName, value)
    } catch (ex) {
      throw ex
    }
  }


  /**
   * 지정된 상태의 Data Row의 컬렉션을 반환 한다.
   *
   * @param rowStatus Row 상태
   */
  public getDataRows(rowStatus?: RowStatus): DataRow[] {
    var dataRows = [];

    if (rowStatus == null || rowStatus == undefined)
      dataRows = this.dataRows.filter(r => r.getRowStatus() != RowStatus.Deleted);
    else
      dataRows = this.dataRows.filter(r => r.getRowStatus() == rowStatus);

    return dataRows
  }

  /**
   * Row를 삭제 한다.
   *
   * @param rowIndex Row 인덱스
   */
  public deleteRow(rowIndex: number) {
    this.getCurrentDataRow(rowIndex).delete()
  }
  //---------------------------------------------------------------------------------------------

  /**
   * Row의 컬럼값을 가져온다.
   *
   * @param rowIndex Row 인덱스
   * @param colIndex Column 인덱스
   * @param rowVersion Row 버전
   */
  public getRowValueIndex(rowIndex: number, colIndex: number, rowVersion?: RowVersion): any {
    try {
      if (rowVersion == null || rowVersion == undefined)
        rowVersion = RowVersion.Current;

      return this.getCurrentDataRow(rowIndex).getValueIndex(colIndex, rowVersion);
    } catch (e) {
      throw e;
    }
  }

  /**
    * Row의 컬럼값을 가져온다.
    *
    * @param rowIndex Row 인덱스
    * @param colName Column 이름
    * @param rowVersion Row 버전
    */
  public getRowValueName(rowIndex: number, colName: string, rowVersion?: RowVersion): any {
    try {
      if (rowVersion == null || rowVersion == undefined)
        rowVersion = RowVersion.Current;

      return this.getCurrentDataRow(rowIndex).getValueName(colName, rowVersion);
    } catch (e) {
      throw e;
    }
  }


  /**
   * Row의 컬럼값을 가져온다.
   *
   * @param rowIndex Row 인덱스
   * @param colIndex Column 인덱스
   * @param rowVersion Row 버전
   */
  public getRowValueIndexString(rowIndex: number, colIndex: number, rowVersion?: RowVersion): string {
    try {
      if (rowVersion == null || rowVersion == undefined)
        rowVersion = RowVersion.Current;

      return this.getCurrentDataRow(rowIndex).getValueIndexString(colIndex, rowVersion)
    } catch (ex) {
      throw ex
    }
  }

  /**
   * Row의 컬럼값을 가져온다.
   *
   * @param rowIndex Row 인덱스
   * @param colName Column 이름
   * @param rowVersion Row 버전
   */
  public getRowValueNameString(rowIndex: number, colName: string, rowVersion?: RowVersion): string {
    try {
      if (rowVersion == null || rowVersion == undefined)
        rowVersion = RowVersion.Current;

      return this.getCurrentDataRow(rowIndex).getValueNameString(colName, rowVersion)
    } catch (ex) {
      throw ex
    }
  }
}

/**
 * 데이터의 값
 * 
 */
export class DataValue {
  //원래 값
  private originalValue: any = null
  //현재 값
  private currentValue: any = null

  //값의 데이터 유형
  private dataType: QueryDataType

  /**
   * 초기화
   * @param value 값
   * @param type 깂의 데이터 유형
   */
  constructor(value: any, type: QueryDataType) {
    this.currentValue = value
    this.originalValue = value
    this.dataType = type
  }

  /**
   * 값을 가져온다
   *
   * @param rowVersion row의 버전
   */
  public getValue(rowVersion?: RowVersion) {

    return  (rowVersion != null || rowVersion != undefined)
      ? rowVersion == RowVersion.Current ? this.currentValue : this.originalValue
      : this.currentValue;
  }

  /**
    * 값을 설정 한다
    *
    * @param value 값
    */
  public setValue(value: any) {
    this.currentValue = value
  }

  /**
   * 깂을 변경 했음
   */
  public acceptChanged() {
    this.originalValue = this.currentValue
  }

  /**
   * 값 수정 여부
   */
  public isModifed(): Boolean {
    return this.currentValue == null
      ? this.originalValue != null
      : this.currentValue != this.originalValue
  }
}

/**
 * 데이터 커럼
 */
export class DataColumn {
  /**
   * 값의 인덱스
   **/
  valueIndex: number;
  /**
   * 컬럼 이름
   **/
  columnName: string;
  /**
   * 서수
   **/
  ordinal: string;
  /**
   * 키 여부
   **/
  isKey: boolean;
  /**
   * 데이터 유형
   **/
  dataType: QueryDataType;

  /**
   * 생성자
   * @param valueIndex 값의 인덱스
   * @param columnName 컬럼 이름
   * @param ordinal 서수
   * @param isKey 키 여부
   * @param dataType 데이터 유형
   */
  constructor(valueIndex: number, columnName: string, ordinal: string, isKey: boolean, dataType: QueryDataType) {
    this.valueIndex = valueIndex;
    this.columnName = columnName;
    this.ordinal = ordinal;
    this.isKey = isKey;
    this.dataType = dataType;
  }
}



/**
 * Data Row Class
 *
 */
export class DataRow{
  private dataTable: DataTable | null = null;
  private rowValues: DataValue[];
  private rowStatus: RowStatus = RowStatus.UnChanged;

  /**
   * 생성자
   * @param dataTable 데이터 테이블
   */
  constructor(dataTable?: DataTable) {
    this.rowValues = [];

    if (dataTable != null && dataTable != undefined)
      this.attachDataTable(dataTable);
  }


  /**
   * Row가 부착된 DataTable
   *
   * @param dataTable 데이터테이블
   */
  public attachDataTable(dataTable: DataTable) {
    this.dataTable = dataTable;
    this.rowStatus = RowStatus.UnChanged;
  }

    /**
     * SAP 숫자 체크
     *
     * @param colValue 컬럼의 값
     */
  private checkSAPNumber(colValue: string): string | null {
    var value : string | null = colValue != null ? colValue.trim() : null;

    //SAP일 경우 음수기호("-") 가 마자막에 붙어 있는 경우가 있음(숫자를 문자로 반환된 경우)
    if (value !== null && value.endsWith("-")) {
      var pos = value.indexOf("-")
      value = "-" + value.substring(0, pos)
    }

    return value
  }

  /**
   *  컬럼의 값을 새로 추가
   *  @param index 새로 추가할 컬럼 인덱스
   *  @param value 컬럼 값
   */
  public newValue(index: number, value: any)
  {
    try {
      //새로운 컬럼에 값을 추가 한다.
      this.rowValues[index]
        = new DataValue(value, this.dataTable == null || this.dataTable == undefined
          ? QueryDataType.String
          : this.dataTable.getDataColumnIndex(index).dataType)
    }
    catch (ex) {
      throw ex
    }
}

/**
 * 인덱스 위치의 컬럼 값 설정
 *
 * @param index 인덱스
 * @param value 컬럼값
 */
  public setValueIndex(index: number, value: any)
  {
    try {
      this.rowStatus = RowStatus.Modified
      this.rowValues[index] !== null ? this.rowValues[index].setValue(value) : null
    }
    catch (ex) {
      throw ex
    }
  }

  /**
   * 컬럼이름으로 컬럼 값 설정
   *
   * @param colName 컬럼이믈
   * @param value 값
   */
  public setValueName(colName: string, value: any)
  {
    try {
      var index: number = this.dataTable !== null ? this.dataTable.getColumnIndex(colName) : 0;
      if (index == -1)
        throw new Error(`Not found '${colName}' Column`)

      this.setValueIndex(index, value)
    }
    catch (ex) {
      throw ex
    }
  }

  /**
   * Row 삭제
   */
  public delete ()
  {
    this.rowStatus = RowStatus.Deleted
  }

  /**
   * Row 변경사항 반영
   */
  public acceptChaneged()
  {
    if (this.rowStatus != RowStatus.Deleted)
      this.rowStatus = RowStatus.UnChanged
  }

  /**
   * Row 상태
   */
  public getRowStatus(): RowStatus
  {
    return this.rowStatus
  }

  /**
   * Row 상태 설정
   *
   * @param status 상태
   */
  public setRowStatus(status: RowStatus)
  {
    this.rowStatus = status
  }

  //--------------------------------------------------------------------
  /**
   * 인덱스 위치의 컬럼의 값 반환
   *
   * @param  index 컬럼의 인덱스
   * @param rowVersion Row의 버전
   */
  public getValueIndexAny(index: number, rowVersion?: RowVersion): any
  {
    return (rowVersion != null && rowVersion != undefined)
      ? this.rowValues[index] != null ? this.rowValues[index].getValue(rowVersion) : null
      : this.rowValues[index] != null ? this.rowValues[index].getValue(RowVersion.Current) : null
  }

    /**
     * 인덱스 위치의 컬럼의 Row Version값  반환
     *
     * @param colName 인덱스
     * @param rowVersion Row의 버전
     */
    public getValueNameAny(colName: string, rowVersion?: RowVersion): any
    {
      try {
        var index: number = this.dataTable?.getColumnIndex(colName) ?? -1;
        if (index == -1)
          throw new Error("Not found '$colName' Column")

        return this.getValueIndexAny(index, rowVersion);
      }
      catch (ex) {
        throw ex;
      }
    }

  /**
   * 인덱스 위치의 컬럼의 Row Version값 반환
   *
   * @param index 인덱스
   * @param rowVersion Row의 버전
   */
    public getValueIndexString(index: number, rowVersion?: RowVersion): string
    {
      return String(this.rowValues[index] !== null ? this.rowValues[index].getValue(rowVersion) : null);
    }

    /**
     * 인덱스 위치의 컬럼의 Row Version값  반환
     *
     * @param colName 인덱스
     * @param rowVersion Row의 버전
     */
    public getValueNameString(colName: string, rowVersion?: RowVersion): string
    {
      try {
        var index: number = this.dataTable?.getColumnIndex(colName) ?? -1;
        if (index == -1)
          throw new Error(`Not found '${colName}' Column`);

        return this.getValueIndexString(index, rowVersion);
      }
      catch (ex) {
        throw ex;
      }
    }

    /**
     * 인덱스 위치의 컬럼의 값 반환
     *
     * @param  index 컬럼의 인덱스
     * @param rowVersion Row의 버전
     */
    public getValueIndex(index: number, rowVersion?: RowVersion): any
    {
      return rowVersion != null && rowVersion != undefined
        ? this.getValueIndexAny(index, rowVersion)
        : this.getValueIndexAny(index, RowVersion.Current);
    }

    /**
     * 컬럼이름으로 컬럼의 값 반환
     *
     * @param colName 컬럼이름
     * @param rowVersion Row의 버전
     */
    public getValueName(colName: string, rowVersion?: RowVersion): any
    {
      return rowVersion != null && rowVersion != undefined
        ? this.getValueNameAny(colName, rowVersion)
        : this.getValueNameAny(colName, RowVersion.Current);
    }
}
