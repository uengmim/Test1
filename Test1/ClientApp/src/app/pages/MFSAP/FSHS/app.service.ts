import { Injectable } from '@angular/core';

//데이터 정보
export class Employee {
  //요청번호
  reqNum!: number;
  //주문처
  whereOrder!: string;
  //제품명
  productName!: string;
  //주문상태
  orderState!: string;
  //포장
  packaging!: string;
  //주문구분
  orderClass!: string;
  //용도
  purpose!: string;
  //도착지
  destination!: string;
  //주문량
  orderQuantity!: number;
  //주문단가
  orderPrice!: number;
  //주문단위
  orderUnit!: number;
  //주문잔량
  orderBacklog!: number;
  //주문가능량
  availableOrder!: number;
  //납품잔량
  deliveryBalance!: number;
  //인도처
  whereabouts!: string;
  //검수요청여부
  inspectionReq!: string;
  //검수반려여부
  inspectionReturn!: string;
  //검수완료여부
  inspectionComplete!: string;
  //납기일자
  deliveryDate!: string;
  //출고지
  placeShipment!: string;
  //제품구푼
  productClass!: string;
  //승인구분
  approvalClass!: string;

}

const employees: Employee[] = [
  {
    reqNum: 1,
    whereOrder: '영업관리담당',
    productName!: 'AX11',
    orderState!: '주문완료',
    packaging!: '진공포장',
    orderClass!: '일시불',
    purpose!: '개인',
    destination!: '용인',
    orderQuantity!: 10,
    orderPrice!: 10000,
    orderUnit!: 10,
    orderBacklog!: 100,
    availableOrder!: 1000000,
    deliveryBalance!: 100,
    whereabouts!: '아이에스티엔',
    inspectionReq!: 'O',
    inspectionReturn!: 'O',
    inspectionComplete!: 'O',
    deliveryDate!: '2022-12-25',
    placeShipment!: '서울',
    productClass!: '완제품',
    approvalClass!: '승인',
  },
  {
    reqNum: 2,
    whereOrder: '제품관리담당',
    productName!: 'AX12',
    orderState!: '주문완료',
    packaging!: '진공포장',
    orderClass!: '일시불',
    purpose!: '공용',
    destination!: '성남',
    orderQuantity!: 100,
    orderPrice!: 100000,
    orderUnit!: 100,
    orderBacklog!: 1000,
    availableOrder!: 10000000,
    deliveryBalance!: 10000,
    whereabouts!: '쿠팡',
    inspectionReq!: 'X',
    inspectionReturn!: 'X',
    inspectionComplete!: 'X',
    deliveryDate!: '2021-11-13',
    placeShipment!: '여수',
    productClass!: '완제품',
    approvalClass!: '미승인',
  },
  {
    reqNum: 3,
    whereOrder: '영업관리담당',
    productName!: 'AX13',
    orderState!: '주문완료',
    packaging!: '진공포장',
    orderClass!: '일시불',
    purpose!: '공용',
    destination!: '수원',
    orderQuantity!: 1,
    orderPrice!: 1000,
    orderUnit!: 1,
    orderBacklog!: 10,
    availableOrder!: 100000,
    deliveryBalance!: 100,
    whereabouts!: '쿠팡',
    inspectionReq!: 'X',
    inspectionReturn!: 'O',
    inspectionComplete!: 'X',
    deliveryDate!: '2021-08-18',
    placeShipment!: '인천',
    productClass!: '완제품',
    approvalClass!: '미승인',
  },
];

//콤보박스
export class Product {
  ID!: number;
  Name!: string;
}

const simpleProducts: string[] = [
  '영업관리담당',
  '제품관리담당',
];



@Injectable()
export class Service {
  getEmployees() {
    return employees;
  }
  getSimpleProducts(): string[] {
    return simpleProducts;
  }



}
