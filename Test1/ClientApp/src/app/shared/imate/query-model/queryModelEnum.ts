
/**
 * 쿼리 데이터 유형
 * */
export enum QueryDataType {
  /**
   * 문자열
   * */
  String = "String",
  /**
   * 숫자
   * */
  Number = "Number",
  /**
   * 숫자 또는 일자
   * */
  Date = "Date",
  /**
   * 시간
   * */
  Time = "Time"
}

/**
 * 쿼리 실행 유형
 * */
export enum QueryRunMethod {
  /**
   *다른 쿼리와 연관없이 독립되어 실행
   * */
  Alone = "Alone",

  /**
   * 연관 쿼리의 Row의 개수 만큼 실행함
   * */
  Depend = "Depend",

  /**
   * 연관 쿼리의 자료로 파라미터를 만든 다음 1번 실행함
   * */
  Bound = "Bound"
}

/**
 * 쿼리 Cache 유형
 **/
export enum QueryCacheType{
  /**
   * Cahce 안함
   */
  None = "None",
  /**
   * Cache 함/ 이미 Cache되어 있으면 Cache된 결과 사용
   */
  Cached = "Cached",

  /**
   * 강제, 무조건 새로 Cache함
   */
  Force = "Force"
}


/**
 * 데이터 모델 요청 모드
 **/
export enum ModelDataRequestMode {
  /**
   * 자료 읽기
   */
  Select = "Select",
  /**
   * 자료 수정
   */
  Modify = "Modify",

  /**
   * Rfc Call
   */
  Rfc = "Rfc"
}

