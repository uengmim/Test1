import { Injectable } from '@angular/core';

export class Data {
  //거래처명
  cuName!: string;
  //주문번호
  orNumber!: string;
  //출하일지
  ShDate!: string;
  //출하번호
  ShNumber!: string;
  //출고지명
  foName!: string;
  //도착지명
  deName!: string;
  //제품명
  prName!: string;
  //주문량(포)
  orQuantity!: number;
  //출하량(포)
  shVolume!: number;
  //출하량(MT)
  MTVolume!: number;
  //인수일자
  acDate!: string;
  //인수여부
  acStatus!: string;
  //운송사
  foAgent!: string;
  //차량번호
  veNumber!: string;
  //운전기사
  driver!: string;
  //사업자번호
  buNumber!: string;
  //비고
  note!: string;
  //인수일자
  aqDate!: string;
  //출하구분
  ShClass!: string;
  //S_FWD_NUM
  S_FWD_NUM!: string;
}

//주문처
export class Order {
  ID!: string;
  Name!: string;
}
//출하지
export class ShAddress {
  ID!: string;
  Name!: string;
}
//구분
export class Sortation {
  ID!: string;
  Name!: string;
}
//제품구분
export class Classification {
  ID!: string;
  Name!: string;
}
//제품
export class Product {
  ID!: string;
  Name!: string;
}

//주문처(산하)
const order: string[] = [
  '(주)대창',
  '한화에너지주식회사',
  '(주)IBC PLUS',
];

//출하지
const shAddress: string[] = [
  '서울',
  '경기',
  '강원',
];

//구분
const sortation: string[] = [
  '인수완료',
  '인수미완료',
];

//제품구분
const classification: string[] = [
  '비료',
  '화학',
];

//제품
const product: string[] = [
  '입황산가리',
  '슈퍼21',
  '염화가리'
];

//테스트데이터
const data: Data[] = [{
  cuName: '강진남해화학',
  orNumber: '20220630-0260',
  ShDate: '2022.07.01',
  ShNumber: '402',
  foName: '남해화학(주)',
  deName: '강진(물)',
  prName: '입상황산가리',
  orQuantity: 600,
  shVolume: 600000,
  MTVolume: 12000,
  acDate: '2022.09.21',
  acStatus: 'true',
  foAgent: '농협물류',
  veNumber: '서울85바7794',
  driver: '최성수',
  buNumber: '4130426',
  note: '',
  aqDate: '2022.07.01',
  ShClass: 'O',
  S_FWD_NUM: '82',
},
{
  cuName: '강진남해화학',
  orNumber: '20220630-0261',
  ShDate: '2022.07.01',
  ShNumber: '401',
  foName: '남해화학(주)',
  deName: '강진(물)',
  prName: '슈퍼21',
  orQuantity: 660,
  shVolume: 660000,
  MTVolume: 13200,
  acDate: '2022.07.01',
  acStatus: 'true',
  foAgent: '농협물류',
  veNumber: '서울85바7794',
  driver: '최성수',
  buNumber: '4130426',
  note: '',
  aqDate: '2022.09.21',
  ShClass: 'O',
  S_FWD_NUM: '82',
},
{
  cuName: '강진남해화학',
  orNumber: '20220630-0262',
  ShDate: '2022.07.04',
  ShNumber: '404',
  foName: '남해화학(주)',
  deName: '강진(물)',
  prName: '염화가리',
  orQuantity: 1260,
  shVolume: 1260000,
  MTVolume: 25200,
  acDate: '2022.07.04',
  acStatus: 'true',
  foAgent: '농협물류',
  veNumber: '서울85바7794',
  driver: '최성수',
  buNumber: '4130426',
  note: '',
  aqDate: '2022.09.21',
  ShClass: 'O',
  S_FWD_NUM: '82',
},
];



@Injectable()
export class Service {
  getData() {
    return data;
  }
  getOrder() {
    return order;
  }
  getShAddress() {
    return shAddress;
  }
  getSortation() {
    return sortation;
  }
  getClassification() {
    return classification;
  }
  getProduct() {
    return product;
  }
}
