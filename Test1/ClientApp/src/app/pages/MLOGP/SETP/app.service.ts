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
  }]

export class CarSeq {
  code!: string;
  name!: string;
}

const carSeq: CarSeq[] = [
  {
    code: "1",
    name: "1차운송사"
  },
  {
    code: "2",
    name: "2차운송사"
  }
]

export class CSpart {
  code!: string;
  name!: string;
}

const cspart: CSpart[] = [
  {
    code: "20",
    name: "화학"
  },
  {
    code: "30",
    name: "유류"
  }
]

@Injectable()
export class Service {
  getVsGubun() {
    return vsGubun;
  }

  getCarSeq(): CarSeq[] {
    return carSeq;
  }

  getCSpart(): CSpart[] {
    return cspart;
  }
}
