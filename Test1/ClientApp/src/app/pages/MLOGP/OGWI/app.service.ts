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
  veNumber: '전남80바9237',
  grWeight: 39825780,
  toWeight: 20867480,
  acWeight: 18958300,
  drName: '이수빈',
  product: '암모니아',
  client: '대상주식회사',
},
  {
  turn: 2,
  entrance: '출하',
  veNumber: '전남81바3210',
  grWeight: 23863050,
  toWeight: 28470000,
  acWeight: 18540000,
  drName: '김정빈',
  product: '황산98%',
  client: '(주)에스엔',
  },
  {
turn: 3,
  entrance: '출하',
  veNumber: '전국97조3950',
  grWeight: 29300000,
  toWeight: 1939000,
  acWeight: 9910000,
  drName: '박정현',
  product: '암모니아수 29%',
  client: '동우화인켐주식회사',
},
];

//테스트데이터
const seasonalInfo: SeasonalInfo = {
  seasonalWe: 1,
  grossWe: 39825780,
  toleranceWe: 20867480,
  actualWe: 18958300,
  vehicleNu: '전남80바9237',
  driver: '이수빈',
  company: '대상주식회사',
  thProduct: '암모니아',
  person: '김동우',
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
