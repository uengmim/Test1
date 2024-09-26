import { Injectable } from '@angular/core';


export class Data {
  //구분
  sortation!: string;
  //입출문일시
  entry!: string;
  //순번
  turn!: number;
  //입출문구분
  entrance!: string;
  //차량번호
  vehicle!: string;
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
  //검량자
  surveyor!: string;
}

//테스트데이터
const data: Data[] = [{
  sortation: '유류출하',
  entry: '2022.09.30',
  turn: 1,
  entrance: '출하',
  vehicle: '경남82사 4989',
  grWeight: 1000,
  toWeight: 1000,
  acWeight: 1000,
  drName: '김상윤',
  product: '석고',
  client: '글로벌로직스(주)',
  surveyor: '김영욱',
},
{
  sortation: '유류출하',
  entry: '2022.10.01',
  turn: 2,
  entrance: '출하',
  vehicle: '경북88사 7662',
  grWeight: 2000,
  toWeight: 2000,
  acWeight: 2000,
  drName: '박정윤',
  product: '석고',
  client: '유림동운',
  surveyor: '김성대',
},
{
  sortation: '유류출하',
  entry: '2022.10.02',
  turn: 3,
  entrance: '출하',
  vehicle: '충남84하 4668',
  grWeight: 3000,
  toWeight: 3000,
  acWeight: 3000,
  drName: '권새성',
  product: '석고',
  client: '금상운수(주)',
  surveyor: '김동현',
}
];

@Injectable()
export class Service {
  getData() {
    return data;
  }
}
