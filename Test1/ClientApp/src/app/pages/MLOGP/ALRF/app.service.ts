import { Injectable } from '@angular/core';

export class CarSeq {
  code!: string;
  name!: string;
}

const carSeq: CarSeq[] = [
  {
    code: "1",
    name: "배차의뢰"
  },
  {
    code: "2",
    name: "배차진행"
  }
]

export class CSpart {
  code!: string;
  name!: string;
}

const cspart: CSpart[] = [
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
  }
]

export class MatType {
  code!: string;
  name!: string;
}

const matType: MatType[] = [
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
  getCarSeq(): CarSeq[] {
    return carSeq;
  }

  getCSpart(): CSpart[] {
    return cspart;
  }

  getMatType(): MatType[] {
    return matType;
  }
}
