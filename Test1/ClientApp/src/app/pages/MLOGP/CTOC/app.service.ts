import { Injectable } from '@angular/core';

export class CSpart {
  code!: string;
  name!: string;
}

export class SpData {
  code!: string;
  name!: string;
}

const cspart: CSpart[] = [
  {
    code: "20",
    name: "화학"
  }
]
const spdata: SpData[] = [
  {
    code: '2000',
    name: '공업포장재'
  },
  {
    code: '4000',
    name: '액상/Bulk'
  },
];


@Injectable()
export class Service {

  getCSpart(): CSpart[] {
    return cspart;
  }
  getSpData(): SpData[] {
    return spdata;
  }

}
