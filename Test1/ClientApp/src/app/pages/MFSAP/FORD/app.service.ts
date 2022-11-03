import { Injectable } from '@angular/core';




export class RequestProcess {
  //주문번호
  VBELN?: number;
  //주문처
  orderPlace?: string;
  //제품명
  productName?: string;
  //포장
  packing?: string;
  //주문구분
  orderClass?: string;
  //용도
  purpose?: string;
  //도착지
  destination?: string;
  //주문량
  orderQuantity?: number;
  //주문단가
  orderPrice?: number;
  //배차량
  vehicle?: number;
  //출고량
  released?: number;
  //차량댓수
  numofVehicle?: number;
  //납기일자
  deliveryDate?: string;
  //출고지
  address?: string;
  //운송사
  shipping?: string;
  //출하요청번호
  shipmentNum!: number;
  //주문등록계정
  orderAccount?: string;
  //주문일자
  orderDate?: string;
  //출하가능
  shipment?: string;
  //제품구분
  productClass?: string;
  //비고
  TEXT?: string;

}


const requestprocess: RequestProcess[] = [{

  VBELN: 13123123,

  orderPlace: '남해화학',
  
  productName: '슈퍼고추(세기)',

  packing: '포장',

  orderClass: '주문',

  purpose: '농사',

  destination: '여수',

  orderPrice: 8000,

  orderQuantity: 3000,

  vehicle: 700,

  released: 600,

  numofVehicle: 14,

  deliveryDate: '22/11/01',

  address: '서울',

  shipping: 'CJ',

  shipmentNum: 1231232,

  orderAccount: 'Seungmin',

  orderDate: '22/10/21',

  shipment: 'O',

  productClass: '채소',

  TEXT: ''

},
  {
    VBELN: 4123277,

    orderPlace: '스타벅스',

    productName: '커피',

    packing: '포장',

    orderClass: '주문',

    purpose: '농사',

    destination: '해남',

    orderPrice: 2100,

    orderQuantity: 4000,

    vehicle: 500,

    released: 300,

    numofVehicle: 10,

    deliveryDate: '22/08/14',

    address: '인천',

    shipping: '쿠팡',

    shipmentNum: 41661,

    orderAccount: 'Chae',

    orderDate: '22/09/12',

    shipment: 'O',

    productClass: '채소',

    TEXT: ''
  },
  {
    VBELN: 87162312,

    orderPlace: 'LG',

    productName: '컴퓨터',

    packing: '포장',

    orderClass: '주문',

    purpose: '회사',

    destination: '서울',

    orderPrice: 15000,

    orderQuantity: 1000,

    vehicle: 200,

    released: 400,

    numofVehicle: 32,

    deliveryDate: '22/08/29',

    address: '울산',

    shipping: 'CJ',

    shipmentNum: 412111,

    orderAccount: 'CSM',

    orderDate: '22/08/30',

    shipment: 'O',

    productClass: '가전제품',

    TEXT: ''
  },
]
const clients: string[] = [
  '영업관리담당',
  '생산관리담당',
  '운송관리담당'

];

//도착지
const simpleProducts: string[] = [
  '여수',
  '해남',
  '서울',
];

//제품명
const simpleProducts2: string[] = [
  '맞춤1호',
  '슈퍼고추(세기)-배합',
  '맞춤16호',
];

//주문구분
const simpleProducts3: string[] = [
  '정상',
  '비정상',
];

//용도구분
const simpleProducts4: string[] = [
  '농업용',
  '비농업용',
];

//하차방법
const simpleProducts5: string[] = [
  '하차',
];

//운송방법
const simpleProducts6: string[] = [
  '운송',
];


export class ProductDiv {
  //주문구분코드
  productDivCode?: string;
  //주문구분명
  productDicName?: string;
}


@Injectable()
export class Service {


  getRequestProcess() {
    return requestprocess;
  }
  getclient(): string[] {
    return clients;
  }
  getSimpleProducts(): string[] {
    return simpleProducts;
  }
  getSimpleProducts2(): string[] {
    return simpleProducts2;
  }
  getSimpleProducts3(): string[] {
    return simpleProducts3;
  }
  getSimpleProducts4(): string[] {
    return simpleProducts4;
  }
  getSimpleProducts5(): string[] {
    return simpleProducts5;
  }
  getSimpleProducts6(): string[] {
    return simpleProducts6;
  }
}
