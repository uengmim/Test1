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
  getCarSeq(): CarSeq[] {
    return carSeq;
  }

  getCSpart(): CSpart[] {
    return cspart;
  }
}
