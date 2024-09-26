import { Injectable } from '@angular/core';




export class RequestProcess {
  //주문번호
  OrderNum?: number;
  //주문처
  OrderPlace?: string;
  //제품
  ProductName?: string;
  //포장
  Packing?: string;
  //주문구분
  OrderClass?: string;
  //용도
  Purpose?: string;
  //도착지
  Destination?: string;
  //주문량
  OrderQuantity?: number;
  //주문단가
  OrderPrice?: number;
  //배차량
  Vehicle?: number;
  //출고량
  Released?: number;
  //차량댓수
  NumofVehicle?: number;
  //상차
  Load?: string;
  //납기일자
  DeliveryDate?: string;
  //출고지
  Address?: string;
  //운송사
  Shipping?: string;
  //출하요청번호
  ShipmentNum!: number;
  //주문등록계정
  OrderAccount?: string;
  //주문일자
  OrderDate?: string;
  //본/지사승인(1차)
  Approval1?: string;
  //본/지사승인일
  ApprovalDate?: string;
  //본/지사승인(2차)
  Approval2?: string;
  //본사/팀장승인일
  ApprovalDate2?: string;
  //본사승인
  OfficeApproval?: string;
  //출하가능
  Shipment?: string;
  //제품구분
  ProductClass?: string;
  //비고
  Note?: string;

}


const requestprocess: RequestProcess[] = [{

  OrderNum: 13123123,

  OrderPlace: '남해화학',
  
  ProductName: '슈퍼고추(세기)',

  Packing: '포장',

  OrderClass: '주문',

  Purpose: '농사',

  Destination: '여수',

  OrderPrice: 8000,

  OrderQuantity: 3000,

  Vehicle: 700,

  Released: 600,

  NumofVehicle: 14,

  Load: 'O',

  DeliveryDate: '22/11/01',

  Address: '서울',

  Shipping: 'CJ',

  ShipmentNum: 1231232,

  OrderAccount: 'Seungmin',

  OrderDate: '22/10/21',

  Approval1: '승인',

  ApprovalDate: '22/05/14',

  Approval2: '미승인',

  ApprovalDate2: '22/05/17',

  OfficeApproval: '미승인',

  Shipment: 'O',

  ProductClass: '채소',

  Note: ''

},
  {
    OrderNum: 4123277,

    OrderPlace: '스타벅스',

    ProductName: '커피',

    Packing: '포장',

    OrderClass: '주문',

    Purpose: '농사',

    Destination: '해남',

    OrderPrice: 2100,

    OrderQuantity: 4000,

    Vehicle: 500,

    Released: 300,

    NumofVehicle: 10,

    Load: 'X',

    DeliveryDate: '22/08/14',

    Address: '인천',

    Shipping: '쿠팡',

    ShipmentNum: 41661,

    OrderAccount: 'Chae',

    OrderDate: '22/09/12',

    Approval1: '승인',

    ApprovalDate: '22/09/14',

    Approval2: '승인',

    ApprovalDate2: '22/09/21',

    OfficeApproval: '승인',

    Shipment: 'O',

    ProductClass: '채소',

    Note: ''
  },
  {
    OrderNum: 87162312,

    OrderPlace: 'LG',

    ProductName: '컴퓨터',

    Packing: '포장',

    OrderClass: '주문',

    Purpose: '회사',

    Destination: '서울',

    OrderPrice: 15000,

    OrderQuantity: 1000,

    Vehicle: 200,

    Released: 400,

    NumofVehicle: 32,

    Load: 'X',

    DeliveryDate: '22/08/29',

    Address: '울산',

    Shipping: 'CJ',

    ShipmentNum: 412111,

    OrderAccount: 'CSM',

    OrderDate: '22/08/30',

    Approval1: '승인',

    ApprovalDate: '22/09/02',

    Approval2: '승인',

    ApprovalDate2: '22/09/04',

    OfficeApproval: '미승인',

    Shipment: 'O',

    ProductClass: '가전제품',

    Note: ''
  },
]
const clients: string[] = [
  '영업관리담당',
  '생산관리담당',
  '운송관리담당'

  ];


@Injectable()
export class Service {


  getRequestProcess() {
    return requestprocess;
  }
  getclient(): string[] {
    return clients;
  }

}
