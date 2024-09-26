import { Injectable } from '@angular/core';

//취소상태
export class CancelStatus {
  code!: string;
  name!: string;
}

const cancelStatus: CancelStatus[] = [
  {
    code: "01",
    name: "입고완료"
  },
  {
    code: "02",
    name: "출고전기 취소 가능"
  },
  {
    code: "03",
    name: "납품문서 삭제 가능"
  }]


@Injectable()
export class Service {
  getCancelStatus() {
    return cancelStatus;
  }
}
