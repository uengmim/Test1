import { QueryCacheType, ModelDataRequestMode } from './queryModelEnum';

export * from './queryModelEnum';

/**
 *  Model 데이터 응답
 * */
export class ModelDataReponse {
  /**
   *  API 결과
   *  */
  apiResult!: string;
  /**
   * API 메시지
   * */
  apiMessage!: string;

  /**
   * 사용자 메시지
   * */
  userMessage: string | undefined | null;

  /**
   * 모델 Type
   * */
  modelType!: string;

  /**
   * 모델 직렬화 데이터
   * */
  modelSerializationData!: string;

  /**
   * Cahce된 자료인지 여부
   * */
  isCachedData!: boolean;
}

/**
 *  모델 데이터 요청
 * */
export class ModelDataRequest {
  constructor(
    /**
     * 데이터베이스 이름
     * */
    public dbTitle: string,
    /**
     * 트랜잭션 ID
     * */
    public transactionId: string,
    /**
     * 모델 모델
     * */
    public modelModule: string,
    /**
     * 모델 Type
     * */
    public modelType: string,
    /**
     * 모델파라미터
     * */
    public modelParams: string[],
    /**
     * ModelData 요청 모드
     * */
    public mode: ModelDataRequestMode,
    /**
     * WHERE 조건
     * */
    public whereCondition: string | undefined | null,
    /**
     * Sort 조건
     * */
    public sortCondition: string | undefined | null,
    /**
     * Cache 유형
     * */
    public cacheType: QueryCacheType = QueryCacheType.None,
    /**
     * 모델 직렬화 데이터
     * */
    public modelSerializationData: string | undefined | null
  ) { }
}
