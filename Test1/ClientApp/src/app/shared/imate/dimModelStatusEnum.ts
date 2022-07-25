
/**
 * 쿼리 데이터 유형
 * */
export enum DIMModelStatus {
  /**
   *  변경 없음
   * */
  UnChanged = "UnChanged",
  /**
   * 추가
   * */
  Add = "Add",
  /**
   * 수정
   * */
  Modify = "Modify",
  /**
   * 삭제
   * */
  Delete = "Delete",
  /**
   * 변경없음을 확인함
   * */
  UnChangedTouch = "UnChangedTouch"
}
