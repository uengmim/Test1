import { Injectable } from '@angular/core';

export class Data {
  //구분
  sortation!: string;
  //지사
  branch!: string;
  //출고일자
  forDate!: string;
  //출고지
  forDest!: string;
  //순번
  turn!: string;
  //2차운송사
  forAgent!: string;
  //배송처
  deDest!: string;
  //제품명
  product!: string;
  //수량(포)
  quantity!: number;
  //수량(톤)
  tonsQuantity!: number;
  //출발지
  place!: string;
  //도착지
  destination!: string;
  //거리
  distance!: string;
  //단가
  unitPrice!: number;
  //운송비
  transportCosts!: number;
  //도서비
  boExpenses!: number;
  //관리비
  adCost!: number;
  //하차비
  disFee!: number;
  //운송비합계
  trcoTotal!: number;
  //합계금액
  amount!: number;
  //비고
  note!: string;
}

//운송사
export class FoAgent {
  ID!: string;
  Name!: string;
}
//정산구분
export class SettlementCl {
  ID!: string;
  Name!: string;
}
//비종구분
export class SeedlingCl {
  ID!: string;
  Name!: string;
}
//비종구분
export class SeClassification {
  ID!: string;
  Name!: string;
}
//운송사
const foAgent: string[] = [
  '농협물류',
  '강진(대)',
  '(유)월드로지스'
];
//정산구분
const settlementCl: string[] = [
  '일간',
  '주간',
  '월간'
];
//비종구분
const seedlingCl: string[] = [
  '일반+맞춤',
  'BB비료',
  '원예비료'
];
//비종구분
const seClassification: string[] = [
  '비료',
  '고체화학',
  '우류'
];
//테스트데이터
const data: Data[] = [{
  sortation: '[1-1]매입현황',
  branch: '경기',
  forDate: '2016.04.28',
  forDest: '안성/용인(대)',
  turn: '401',
  forAgent: '원농실업',
  deDest: '남사농협(구매)',
  product: '슈퍼21',
  quantity: 180,
  tonsQuantity: 3600,
  place: '449',
  destination: '449',
  distance: '30',
  unitPrice: 11100,
  transportCosts: 39960,
  boExpenses: 0,
  adCost: 0,
  disFee: 0,
  trcoTotal: 39960,
  amount: 39960,
  note: '',
},
{
  sortation: '[1-1]매입현황',
  branch: '경기',
  forDate: '2016.04.25',
  forDest: '안성/용인(대)',
  turn: '401',
  forAgent: '원농실업',
  deDest: '남사농협(구매)',
  product: '슈퍼21',
  quantity: 240,
  tonsQuantity: 4800,
  place: '449',
  destination: '449',
  distance: '30',
  unitPrice: 11100,
  transportCosts: 53280,
  boExpenses: 0,
  adCost: 0,
  disFee: 0,
  trcoTotal: 53280,
  amount: 53280,
  note: '',
},
{
  sortation: '[1-1]매입현황',
  branch: '경기',
  forDate: '2016.04.12',
  forDest: '안성/용인(대)',
  turn: '402',
  forAgent: '원농실업',
  deDest: '백암농협(구매)',
  product: '슈퍼21',
  quantity: 1680,
  tonsQuantity: 33600,
  place: '449',
  destination: '449',
  distance: '30',
  unitPrice: 12300,
  transportCosts: 413280,
  boExpenses: 0,
  adCost: 0,
  disFee: 0,
  trcoTotal: 413280,
  amount: 413280,
  note: '',
},
];

@Injectable()
export class Service {
  getData() {
    return data;
  }
  getFoAgent(): string[] {
    return foAgent;
  }
  getSettlementCl(): string[] {
    return settlementCl;
  }
  getSeedlingCl(): string[] {
    return seedlingCl;
  }
  getSeClassification(): string[] {
    return seClassification;
  }
}
