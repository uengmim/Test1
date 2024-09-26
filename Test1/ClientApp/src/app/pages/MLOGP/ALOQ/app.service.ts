import { Injectable } from '@angular/core';

//비료/포장재 출하구분
export class VsGubun {
  code!: string;
  name!: string;
}

const vsGubun: VsGubun[] = [
  {
    code: "1000",
    name: "비료"
  },
  {
    code: "2000",
    name: "화학"
  },
  {
    code: "9999",
    name: "임가공(구성품)"
  }]


@Injectable()
export class Service {
  getVsGubun() {
    return vsGubun;
  }
}
