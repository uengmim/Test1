import { Injectable } from '@angular/core';

export class Reqclass {
  ID?: string;
  Name?: string;
}
export class OilType {
  ID?: string;
  Name?: string;
}
export class ShipSort {
  ID?: string;
  Name?: string;
}
export class OrderData {
  //요청번호
  reqNum?: number;
  //요청일자
  reqDate?: string;
  //주문구분
  orderClass?: string;
  //거래처
  client?: string;
  //배차번호
  allocationNum?: number;
  //차량번호
  vehicleNum?: string;
  //액상구분
  liquidClass?: string;
  //주문량
  orderQuantity?: number;
  //주문단위
  orderUnit?: string;
  //선적번호
  sOil?: number;
  //지시번호
  insNum?: number;
  //주소
  address!: string;
  //전화번호
  phoneNum?: string;
  //출하일
  shipmentDate?: string;
  //H.P
  HP?: string;
  //차량용량
  vehicleCapacity?: string;
  //구분
  sort?: string;
  //저장소
  storage?: string;
  //정산량
  settlement?: number;
  //출하방식
  shippingMethod?: string;
  //cTank
  cTank?: string;
  //비고
  remark?: string;
  
}

const reqclass: Reqclass[] = [{
  ID: 'S-OIL',
  Name: 'S-OIL주문',
}];
const oiltype: OilType[] = [{
  ID: '염산',
  Name: '염산',
}, {
  ID: '암모니아',
  Name: '암모니아',
}];
const shipsort: ShipSort[] = [{
  ID: '도착도',
  Name: '도착도',
}, {
  ID: '출발도',
  Name: '출발도',
}];
const Orderdata: OrderData[] = [{

  reqNum: 13123123,

  reqDate: '2022/08/29',
  
  orderClass: 'S-OIL',

  client: 'LG',

  allocationNum: 5123,

  vehicleNum: '13가3123',

  liquidClass: '염산',

  orderQuantity: 3000,

  orderUnit: '만',

  sOil: 1,

  insNum: 14,

  address: '서울특별시',

  phoneNum: '010-5698-7424',

  shipmentDate: '2022/08/29',

  HP: '02-1234-5698',

  vehicleCapacity: '1000',

  sort: '도착도',

  storage: '10TB',

  settlement: 54712,

  shippingMethod: '',

  cTank: 'O',

  remark: ''
},
  {
    reqNum: 2357773,

    reqDate: '2022/10/10',

    orderClass: 'S-OIL',

    client: '삼성',

    allocationNum: 5782,

    vehicleNum: '75나1235',

    liquidClass: '암모니아',

    orderQuantity: 15123,

    orderUnit: '만',

    sOil: 2,

    insNum: 52,

    address: '부산광역시',

    phoneNum: '010-1234-5678',

    shipmentDate: '2022/11/01',

    HP: '02-8765-4321',

    vehicleCapacity: '412',

    sort: '도착도',

    storage: '98GB',

    settlement: 1412132,

    shippingMethod: '',

    cTank: 'X',

    remark: ''
  },
  {
    reqNum: 97563,

    reqDate: '2022/01/01',

    orderClass: 'S-OIL',

    client: '네이버',

    allocationNum: 12417,

    vehicleNum: '95다1745',

    liquidClass: '염산',

    orderQuantity: 12441,

    orderUnit: '만',

    sOil: 3,

    insNum: 73,

    address: '인천광역시',

    phoneNum: '010-3787-2314',

    shipmentDate: '2022/02/02',

    HP: '02-7725-9711',

    vehicleCapacity: '5372',

    sort: '출발도',

    storage: '80TB',

    settlement: 38633,

    shippingMethod: '',

    cTank: 'X',

    remark: ''
  },
]


@Injectable()
export class Service {

  getReqclass() {
    return reqclass;
  }
  getOilType() {
    return oiltype;
  }
  getOrderData() {
    return Orderdata;
  }
  getShipSort() {
    return shipsort;
  }
}
