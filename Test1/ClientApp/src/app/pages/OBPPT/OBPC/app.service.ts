import { Injectable } from '@angular/core';

//업체접수여부
export class YnGubun { 
  code!: string;
  name!: string;
}

const ynGubun: YnGubun[] = [
  {
    code: "ALL",
    name: "전체"
  },
  {
    code: "X",
    name: "접수"
  },
  {
    code: "",
    name: "미접수"
  }]

const Content = "당사는 위의 낙찰된 건에 대하여 첨부된 계약 제반서류('계약서', '청렴계약이행각서', '계약보증금 지급각서' 등)를 확인하였으며,남해화학(주)에서 정한 계약사항들을 승낙하여 계약을 이행코자 합니다.";

@Injectable()
export class Service {
  getYnGubun() {
    return ynGubun;
  }
  getContent() {
    return Content;
  }
}
