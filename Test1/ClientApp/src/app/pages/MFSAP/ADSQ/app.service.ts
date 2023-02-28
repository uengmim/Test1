import { Injectable } from '@angular/core';

//검색구분
export class SelectType {
  //코드
  code!: string;
  //내역
  name!: string;
}

const selectType: SelectType[] = [
  {
    code: "A",
    name: "출고일"
  },
  {
    code: "B",
    name: "검수일"
  }
]

export class CSpart {
  code!: string;
  name!: string;
}

const cspart: CSpart[] = [
  {
    code: "",
    name: "전체"
  },
  {
    code: "10",
    name: "비료"
  },
  {
    code: "40",
    name: "친환경"
  }
]

@Injectable()
export class Service {
  getSelectType() {
    return selectType;
  }

  getCSpart(): CSpart[] {
    return cspart;
  }

}
