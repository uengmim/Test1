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

const Content = '';

@Injectable()
export class Service {
  getYnGubun() {
    return ynGubun;
  }
  getContent() {
    return Content;
  }
}
