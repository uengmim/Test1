import { Injectable } from '@angular/core';


export class Data {
  //순번
  turn!: number;
  //입출문구분
  entrance!: string;
  //차량번호
  veNumber!: string;
  //총중량
  grWeight!: number;
  //공차중량
  toWeight!: number;
  //실중량
  acWeight!: number;
  //기사명
  drName!: string;
  //제품
  product!: string;
  //거래처
  client!: string;
}

export class SeasonalInfo {
  //계근중량
  seasonalWe!: number;
  //총중량
  grossWe!: number;
  //공차중량
  toleranceWe!: number;
  //실중량
  actualWe!: number;
  //차량번호
  vehicleNu!: string;
  //기사명
  driver!: string;
  //거래처
  company!: string;
  //제품
  thProduct!: string;
  //검량자
  person!: string;
}


//테스트데이터
const data: Data[] = [{
  turn: 1,
  entrance: '출하',
  veNumber: '충북88사3917',
  grWeight: 39549720,
  toWeight: 16168470,
  acWeight: 23381250,
  drName: '김현우',
  product: '암모니아',
  client: 'SK멀티리얼즈(주)',
},
  {
  turn: 2,
  entrance: '출하',
  veNumber: '울산81아9415',
  grWeight: 20238350,
  toWeight: 15238270,
  acWeight: 5000080,
  drName: '박수민',
  product: '발연황산',
  client: '미원화학',
  },
  {
turn: 3,
  entrance: '출하',
  veNumber: '충북88아7716',
  grWeight: 27912530,
  toWeight: 15978200,
  acWeight: 11934330,
  drName: '김재용',
  product: '암모니아수 25%',
  client: '에쓰지에너지(주)',
},
];

//테스트데이터
const seasonalInfo: SeasonalInfo = {
  seasonalWe: 1,
  grossWe: 39549720,
  toleranceWe: 16168470,
  actualWe: 23381250,
  vehicleNu: '충북88사3917',
  driver: '김현우',
  company: 'SK멀티리얼즈(주)',
  thProduct: '암모니아',
  person: '이정현',
}

@Injectable()
export class Service {
  getData() {
    return data;
  }
  getSeasonalInfo() {
    return seasonalInfo;
  }
}
