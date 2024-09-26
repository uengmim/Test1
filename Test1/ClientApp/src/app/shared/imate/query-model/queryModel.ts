import { QueryDataType, QueryRunMethod } from './queryModelEnum';

export * from './queryModelEnum';

/**
 *쿼리 파라미터
 * */
export class QueryParameter
{
  constructor(
    /**
     * 파라미터 이름
     * */
    public name: string,

    /**
     * 파라미터 데이터 유형
     * */
    public dataType: QueryDataType,

    /**
     * 파라미터 데이터 값
     * */
    public value: string,

    /**
     *  파라미터 템플릿
     * */
    public template: string | undefined | null,

    /**
     * 라인 끝 문자
     * */
    public lineTerminateChar: string | undefined | null,

    /**
     * Prefix
     * */
    public prefix: string | undefined | null,

    /**
     * SurFix
     * */
    public surfix: string | undefined | null
  ) { }
}

/**
 * Query Message
 * */
export class QueryMessage {
  constructor(
    /**
     * 쿼리 실행 방법
     * */
    public queryMethod: QueryRunMethod,

    /**
     * 쿼리 이름
     * */
    public queryName: string,

    /**
     * 데이터 소스
     * */
    public dataSource: string,

    /**
     * 쿼리 템플릿
     * */
    public queryTemplate: string | undefined | null,

  /**
   * 의존 쿼리 집합
   * */
    public dependQuery: string[] | undefined | null,

    /**
     * 파라미터
     * */
    public parameters: QueryParameter[] | undefined | null ,
  ) { }
}

/**
 * 컬럼 정보
 * */
export class XNColumnInfo
{
  /**
   * 컬럼 순서
   * */
  ordinal!: number;

  /**
   * 이름
   * */
  name!: string;

  /**
   * 키여부
   * */
  isKey!: boolean;

  /**
   * 데이터 유형
   * */
  dataType!: QueryDataType
}

/**
 * Row의 값
 * */
export class XNRowValue {
  /**
   * row 값 집합
   * */
  rowValue!: string[]
}

/**
 * 질의 결과 값
 * */
export class QueryValue {
  /**
   * 쿼리 이름
   * */
  queryName!: string;

  /**
   * 쿼리 정보
   * */
  columnInfos!: XNColumnInfo[];

  /**
   * Row의 집합
   * */
  rows!: XNRowValue[];
}

/**
 * 쿼리 실행 결과
 * */
export class QueryRunResult {
  /**
   * 트랜잭션 ID
   * */
  transactionId!: string;

  /**
   * 결과
   * */
  results!: QueryValue[];

  /**
   * API 결과
   * */
  apiResult!: string;

  /**
   * API 메시지
   * */
  apiMessage!: string;

  /**
   * 사용자 메시지
   * */
  userMessage!: string;
}
