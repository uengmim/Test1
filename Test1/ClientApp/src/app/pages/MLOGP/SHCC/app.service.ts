import { Injectable } from '@angular/core';


export class Data {
  //거래처명
  customerName!: string;
  //품명
  productName!: string;

  //shInformation_출하정보
  //출하정보_출하일지
  shInformation_date!: string;
  //출하정보_출하지
  shInformation_shipped!: string;
  //출하정보_출발지
  shInformation_StartPo!: string;
  //출하정보_도착지
  shInformation_dest!: string;
  //출하정보_도착지명
  shInformation_placeDe!: string;
  //출하정보_순번
  shInformation_turn!: string;
  //출하정보_출하중량
  shInformation_shWeight!: number;
  //출하정보_착지중량
  shInformation_laWeight!: number;
  //출하정보_기본중량
  shInformation_baWeight!: number;

  //shCost_기본운송비
  //기본운송비_단가
  shCost_unPrice!: number;
  //기본운송비_운송비합계
  shCost_totCost!: number;

  //caAccount_운송사계산
  //운송사계산_단가구분
  caAccount_unPrice!: string;
  //운송사계산_정산중량
  caAccount_setWeight!: number;
  //운송사계산_단가
  caAccount_unitPr!: number;
  //운송사계산_운송비합계
  caAccount_totCost!: number;

  //HPCharge_본사담당자계산
  //본사담당자계산_정산중량(톤)
  HPCharge_setWeight!: number;
  //본사담당자계산_단가
  HPCharge_unPrice!: number;
  //본사담당자계산_운송비합계
  HPCharge_totCost!: number;

  //비고
  note!: string;
  //정산여부
  settlement!: string;
  //본사마감
  ofClosing!: string;
  //차종
  carType!: string;
  //출하구분
  shCategory!: string;
  //플래그
  flag!: string;
}

export class Division {
  //구분
  division!: string;
  //거래처명
  customerName!: string;
  //품명
  productName!: string;

  //shInformation_출하정보
  //출하정보_출하일지
  shInformation_date!: string;
  //출하정보_출하지
  shInformation_shipped!: string;
  //출하정보_순번
  shInformation_turn!: string;
  //출하정보_출하중량
  shInformation_shWeight!: number;
  //출하정보_착지중량
  shInformation_laWeight!: number;
  //출하정보_기본중량
  shInformation_baWeight!: number;

  //caAccount_운송사계산
  //운송사계산_정산중량
  caAccount_setWeight!: number;
  //운송사계산_단가
  caAccount_unitPr!: number;
  //운송사계산_운송비합계
  caAccount_totCost!: number;

  //HPCharge_본사담당자계산
  //본사담당자계산_정산중량(톤)
  HPCharge_setWeight!: number;
  //본사담당자계산_단가
  HPCharge_unPrice!: number;
  //본사담당자계산_운송비합계
  HPCharge_totCost!: number;

  //출하정보_출발지
  shInformation_StartPo!: string;
  //출하정보_도착지
  shInformation_dest!: string;
  //출고번호
  reNumber!: string;
  //비고
  note!: string;
}
//정산구분
export class SetDivision {
  ID!: string;
  Name!: string;
}
//제품
export class Product {
  ID!: string;
  Name!: string;
}
//거래처
export class Account {
  ID!: string;
  Name!: string;
}
//도착지
export class Destination {
  ID!: string;
  Name!: string;
}

//제품
const product: string[] = [
  '비료',
  '화학',
  '액상',
  ];

//정산구분
const setDivision: string[] = [
  '월간',
  '주간',
  '일간',
  ];

//거래처
const account: string[] = [
  '(주)협성유조',
  '동보운수(주)',
  '남선석유',
];

//도착지
const destination: string[] = [
  '서울',
  '경기',
  '강원',
];

//테스트데이터
const data: Data[] = [{
  customerName: '(주)협성유조',
  productName: '유류',
  shInformation_date: '2022.09.05',
  shInformation_shipped: '강원',
  shInformation_StartPo: '강원터미널',
  shInformation_dest: '서울',
  shInformation_placeDe: '잠실',
  shInformation_turn: '1',
  shInformation_shWeight: 1000,
  shInformation_laWeight: 1000,
  shInformation_baWeight: 1000,
  shCost_unPrice: 2081,
  shCost_totCost: 158456,
  caAccount_unPrice: '고정단가',
  caAccount_setWeight: 135486,
  caAccount_unitPr: 2081,
  caAccount_totCost: 125862,
  HPCharge_setWeight: 1000,
  HPCharge_unPrice: 1225,
  HPCharge_totCost: 123684,
  note: '',
  settlement: 'O',
  ofClosing: 'O',
  carType: '대형트럭',
  shCategory: 'O',
  flag: 'X',
},
{
  customerName: '동보운수(주)',
  productName: '유류',
  shInformation_date: '2022.09.21',
  shInformation_shipped: '경남',
  shInformation_StartPo: '밀양시',
  shInformation_dest: '경북',
  shInformation_placeDe: '성주군',
  shInformation_turn: '2',
  shInformation_shWeight: 2000,
  shInformation_laWeight: 2000,
  shInformation_baWeight: 2000,
  shCost_unPrice: 1689,
  shCost_totCost: 298412,
  caAccount_unPrice: '고정단가',
  caAccount_setWeight: 234985,
  caAccount_unitPr: 2268,
  caAccount_totCost: 326486,
  HPCharge_setWeight: 2000,
  HPCharge_unPrice: 2238,
  HPCharge_totCost: 336489,
  note: '',
  settlement: 'O',
  ofClosing: 'O',
  carType: '대형트럭',
  shCategory: 'O',
  flag: 'X',
},
{
  customerName: '남선석유',
  productName: '유류',
  shInformation_date: '2022.09.31',
  shInformation_shipped: '경기',
  shInformation_StartPo: '연천읍',
  shInformation_dest: '남해',
  shInformation_placeDe: '여수',
  shInformation_turn: '3',
  shInformation_shWeight: 3000,
  shInformation_laWeight: 3000,
  shInformation_baWeight: 3000,
  shCost_unPrice: 3082,
  shCost_totCost: 264894,
  caAccount_unPrice: '고정단가',
  caAccount_setWeight: 234685,
  caAccount_unitPr: 2602,
  caAccount_totCost: 238945,
  HPCharge_setWeight: 2000,
  HPCharge_unPrice: 1556,
  HPCharge_totCost: 264534,
  note: '',
  settlement: 'O',
  ofClosing: 'O',
  carType: '대형트럭',
  shCategory: 'O',
  flag: 'X',
},
];

//테스트데이터
const division: Division[] = [{
  division: '출고현황 1-1',
  customerName:'남해화학 봉화',
  productName: '원예웃거름특호',
  shInformation_date: '2022.09.05',
  shInformation_shipped: '강원',
  shInformation_turn: '1',
  shInformation_shWeight: 1000,
  shInformation_laWeight: 1000,
  shInformation_baWeight: 1000,
  caAccount_setWeight: 135486,
  caAccount_unitPr: 2081,
  caAccount_totCost: 125862,
  HPCharge_setWeight: 1000,
  HPCharge_unPrice: 1225,
  HPCharge_totCost: 123684,
  shInformation_StartPo: '강원터미널',
  shInformation_dest: '여수',
  reNumber: '423-11',
  note: '',
},
{
  division: '출고현황 1-2',
  customerName: '벽진농협(구매)',
  productName: '부산석고',
  shInformation_date: '2022.09.16',
  shInformation_shipped: '연천',
  shInformation_turn: '2',
  shInformation_shWeight: 2000,
  shInformation_laWeight: 2000,
  shInformation_baWeight: 2000,
  caAccount_setWeight: 263486,
  caAccount_unitPr: 3061,
  caAccount_totCost: 336128,
  HPCharge_setWeight: 2000,
  HPCharge_unPrice: 1865,
  HPCharge_totCost: 223465,
  shInformation_StartPo: '연천읍',
  shInformation_dest: '광주',
  reNumber: '236-12',
  note: '',
},
{
  division: '출고현황 1-3',
  customerName: '(주)가림환경개발',
  productName: '부산석고',
  shInformation_date: '2022.09.22',
  shInformation_shipped: '경북',
  shInformation_turn: '3',
  shInformation_shWeight: 3000,
  shInformation_laWeight: 3000,
  shInformation_baWeight: 3000,
  caAccount_setWeight: 226489,
  caAccount_unitPr: 2609,
  caAccount_totCost: 238964,
  HPCharge_setWeight: 3000,
  HPCharge_unPrice: 2206,
  HPCharge_totCost: 336589,
  shInformation_StartPo: '성주군',
  shInformation_dest: '양천구',
  reNumber: '236-13',
  note: '',
},
];

@Injectable()
export class Service {
  getData() {
    return data;
  }
  getDivision() {
    return division;
  }
  getProduct() {
    return product;
  }
  getSetDivision() {
    return setDivision;
  }
  getAccount() {
    return account;
  }
  getDestination() {
    return destination;
  }
}
