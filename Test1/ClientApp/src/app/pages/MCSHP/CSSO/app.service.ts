import { Injectable } from '@angular/core';

export class Reqclass {
  ID?: string;
  Name?: string;
}
export class OilType {
  ID?: string;
  Name?: string;
}
export class SalesSort {
  Num?: string;
  Sort?: string;
}
export class Rack {
  ID?: string;
  Name?: string;
}
export class InsRegis {
  //일자
  date?: string;
  //지시번호
  insNum?: number;
  //거래처명
  cliName?: string;
  //도착지
  destination?: string;
  //제품
  product?: string;
  //지시량
  insQuan?: number; 
  //차량번호
  vehicleNum?: string;
  //기사명
  driverName?: string;
  //주소
  address?: string;
  //출하형태
  shipType?: string;
  //구분
  sort?: string;
  //배차번호
  disNum!: number;
  //C_REQUEST
  cRequest?: string;
  //C_BUSI_NO
  cBusiNo?: string;
  //C_PASS
  cPass?: string;
  //서버일자
  severDate?: string;
  //서버순번
  serverNum?: number;
}
export class LiqShip {
  //일자
  liqDate?: string;
  //지시번호
  liqInsNum?: number;
  //거래처명
  liqCliName?: string;
  //도착지
  liqDestination?: string;
  //제품
  liqProduct?: string;
  //지시량
  liqInsQuan?: number;
  //차량번호
  liqVehicleNum?: string;
  //기사명
  liqDriverName?: string;
  //주소
  liqAddress?: string;
  //출하형태
  liqShipType?: string;
  //구분
  liqSort?: string;
  //배차번호
  liqDisNum!: number;
  //C_REQUEST
  liqCRequest?: string;
  //C_BUSI_NO
  liqCBusiNo?: string;
  //C_PASS
  liqCPass?: string;
  //출하일자
  liqShipDate?: string;
  //출하순번
  liqShipNum?: number;
}
export class OrderInfo {
  //주문구분
  orderOrderSort?: string;
  //거래처명
  orderCliName?: string;
  //유종
  orderOilClass?: string;
  //출하요청량
  orderShipReqQuan?: number;
  //차량번호
  orderVehicleNum?: string;
  //선적번호
  orderShipNum?: number;
  //주소
  orderAddress?: string;
  //출하희망일
  orderShipDate?: string;
  //전화번호
  orderOfficeNum?: string;
  //연락처
  orderPhoneNum?: string;
  //차량용량
  orderVehCapacity?: number;
  //출하여부
  orderShipDepart!: string;
  //C_REQUEST
  orderCRequest?: string;
  //S_DATE
  orderSDate?: string;
  //C_BUSI_NO
  orderCBusiNo?: number;
  //C_ORDER
  orderCOrder?: string;
  //C_OIL
  orderCOil?: string;
  //temp
  orderTemp?: string;
  //비고
  orderNote?: string;
}
export class InvenList {
  //통관일
  cusDate?: string;
  //통관번호
  cusNum?: number;
  //유종
  oilClass?: string;
  //탱크번호
  tankNum?: number;
  //통관물량
  cusQuan?: number;
  //재고량
  invenQuan?: number;
  //출하량
  shipQuan?: number;
  //KL물량
  klQuan?: number;
  //화주
  shipper?: string;
  //선박
  ship?: string;
  //D_PASS
  dPass?: string;
  //S_BL_NO
  sBlNo!: number;
  //S_PASS_NO
  sPassNo?: string;
}
export class LiqOrderInfo {

  //배차번호
  liqAlloNum?: number;
  //제품
  liqProduct?: string;
  //거래처명
  liqCliName?: string;
  //배차물량
  liqAlloVol?: number;
  //차량번호
  liqVehicleNum?: string;
  //운송조건
  liqTransCon?: string;
  //도착지
  liqDest?: string;
  //주문량
  liqOrderQuan?: number;
  //출하요청번호
  liqShipReqNum?: number;
  //납기시작일
  liqDelStartDat?: string;
  //납기종료일
  liqDelEndDat?: string;
  //주소
  liqAddress!: string;
  //S_BUSI_NUM
  liqSBusiNum?: number;
  //S_TRANS_COND
  liqSTransCond?: string;
  //S_ARRV_PLACE
  liqSArryPlace?: string;
  //C_PROD
  liqCProd?: string;
  //S_PREORD_NUM
  liqSPreordNum?: number;
  //S_ORD_NUM
  liqSOrdNum?: number;
  //C_CUST_TRANS
  liqCCustTrans?: string;
  //C_DCODE
  liqCDCode?: number;
}
const liqorderinfo: LiqOrderInfo[] = [{

  liqAlloNum: 1,

  liqProduct: '냉장고',

  liqCliName: 'LG',

  liqAlloVol: 132,

  liqVehicleNum: '12가8152',

  liqTransCon: '비행기',

  liqDest: '서울',

  liqOrderQuan: 312,

  liqShipReqNum: 152313,

  liqDelStartDat: '2022/09/01',

  liqDelEndDat: '2022/09/10',

  liqAddress: '서울특별시',

  liqSBusiNum: 123,

  liqSTransCond: '',

  liqSArryPlace: '',

  liqCProd: '',

  liqSPreordNum: 21,

  liqSOrdNum: 41,

  liqCCustTrans: '',

  liqCDCode:9952
}, {

    liqAlloNum: 2,

    liqProduct: '전자레인지',

    liqCliName: '삼성',

    liqAlloVol: 5123,

    liqVehicleNum: '44사6562',

    liqTransCon: '오토바이',

    liqDest: '부산',

    liqOrderQuan: 421,

    liqShipReqNum: 51223,

    liqDelStartDat: '2022/10/01',

    liqDelEndDat: '2022/10/10',

    liqAddress: '울산광역시',

    liqSBusiNum: 1412312,

    liqSTransCond: '',

    liqSArryPlace: '',

    liqCProd: '',

    liqSPreordNum: 11,

    liqSOrdNum: 856,

    liqCCustTrans: '',

    liqCDCode: 1422
  }]
const reqclass: Reqclass[] = [{
  ID: 'S',
  Name: 'S-OIL주문',
}, {
  ID: 'N',
  Name: 'N-OIL주문',
}, {
  ID: 'W',
  Name: 'W-OIL주문',
  }, {
    ID: 'E',
    Name: 'E-OIL주문',
  },];
const oiltype: OilType[] = [{
  ID: '1',
  Name: '휘발유',
}, {
  ID: '2',
  Name: '일반 휘발유',
}, {
  ID: '3',
  Name: '경유',
  }];
const salessort: SalesSort[] = [{
  Num: 'S',
  Sort: '[1]판매',
}, {
  Num: 'C',
  Sort: '[2]판매 완료',
}, {
  Num: 'B',
  Sort: '[3]판매 전',
  }];
const rack: Rack[] = [{
  ID: '1',
  Name: '01',
}, {
  ID: '2',
  Name: '02',
}, {
  ID: '3',
  Name: '03',
  },
  {
    ID: '4',
    Name: '04',
  }];
const insregis: InsRegis[] = [{

  date: '2022/08/30',

  insNum: 1,
  
  cliName: '남해화학',

  destination: '남해',

  product: '컴퓨터',

  insQuan: 14,

  vehicleNum: '13가3123',

  driverName: '채승민',

  address: '서울',

  shipType: '선박',

  sort: '',

  disNum: 14,

  cRequest: '',

  cBusiNo: '',

  cPass: 'Pass',

  severDate: '2022/08/30',

  serverNum: 1

},
  {
    date: '2022/04/14',

    insNum: 2,

    cliName: '삼성',

    destination: '수원',

    product: '스마트폰',

    insQuan: 74,

    vehicleNum: '19다7242',

    driverName: '박주안',

    address: '부산',

    shipType: '비행기',

    sort: '',

    disNum: 41,

    cRequest: '',

    cBusiNo: '',

    cPass: 'Pass',

    severDate: '2022/09/13',

    serverNum: 2
  },
  {
    date: '2022/12/25',

    insNum: 3,

    cliName: 'LG',

    destination: '해남',

    product: '냉장고',

    insQuan: 52,

    vehicleNum: '97가1237',

    driverName: '최원석',

    address: '여수',

    shipType: '선박',

    sort: '',

    disNum: 7,

    cRequest: '',

    cBusiNo: '',

    cPass: 'None',

    severDate: '2022/12/31',

    serverNum: 3
  },
]
const liqship: LiqShip[] = [{

  liqDate: '2022/01/01',

  liqInsNum: 1,

  liqCliName: '네이버',

  liqDestination: '성남',

  liqProduct: '모니터',

  liqInsQuan: 512,

  liqVehicleNum: '11가9512',

  liqDriverName: '최수연',

  liqAddress: '서울',

  liqShipType: '비행기',

  liqSort: '',

  liqDisNum: 52,

  liqCRequest: '',

  liqCBusiNo: '',

  liqCPass: 'Pass',

  liqShipDate: '2022/08/30',

  liqShipNum: 1

},
{
  liqDate: '2022/05/15',

  liqInsNum: 2,

  liqCliName: '카카오',

  liqDestination: '인천',

  liqProduct: '어플',

  liqInsQuan: 12,

  liqVehicleNum: '98다1238',

  liqDriverName: '남궁훈',

  liqAddress: '여수',

  liqShipType: '자동차',

  liqSort: '',

  liqDisNum: 12,

  liqCRequest: '',

  liqCBusiNo: '',

  liqCPass: 'NPass',

  liqShipDate: '2022/09/13',

  liqShipNum: 2
},
{
  liqDate: '2022/11/30',

  liqInsNum: 3,

  liqCliName: '라인',

  liqDestination: '울산',

  liqProduct: '마우스',

  liqInsQuan: 123,

  liqVehicleNum: '86사6215',

  liqDriverName: '신중호',

  liqAddress: '전주',

  liqShipType: '기차',

  liqSort: '',

  liqDisNum: 4,

  liqCRequest: '',

  liqCBusiNo: '',

  liqCPass: 'None',

  liqShipDate: '2022/12/31',

  liqShipNum: 3
  },
  {
    liqDate: '2022/12/30',

    liqInsNum: 4,

    liqCliName: '배달의민족',

    liqDestination: '광주',

    liqProduct: '오토바이',

    liqInsQuan: 7312,

    liqVehicleNum: '99라9999',

    liqDriverName: '김봉진',

    liqAddress: '강릉',

    liqShipType: '오토바이',

    liqSort: '',

    liqDisNum: 4,

    liqCRequest: '',

    liqCBusiNo: '',

    liqCPass: 'None',

    liqShipDate: '2022/12/31',

    liqShipNum: 4
  }
]
const orderinfo: OrderInfo[] = [{

      orderOrderSort: '배송',

      orderCliName: '남해화학',

      orderOilClass: '경유',

      orderShipReqQuan: 132,

      orderVehicleNum: '12가8152',

      orderShipNum: 8231,

      orderAddress: '서울',

      orderShipDate: '2022/09/01',

      orderOfficeNum: '02-6224-7424',

      orderPhoneNum: '010-5698-7424',

      orderVehCapacity: 132,

      orderShipDepart: 'O',

      orderCRequest: '',

      orderSDate: '2022/09/30',

      orderCBusiNo: 45,

      orderCOrder: '',

      orderCOil: '',

      orderTemp: '',
      orderNote: ''
}, {

      orderOrderSort: '배송완료',

      orderCliName: 'LG',

      orderOilClass: '고급휘발유',

      orderShipReqQuan: 312,

      orderVehicleNum: '53라5154',

      orderShipNum: 9744,

      orderAddress: '여수',

      orderShipDate: '2022/04/24',

      orderOfficeNum: '02-874-8432',

      orderPhoneNum: '010-2345-2143',

      orderVehCapacity: 51,

      orderShipDepart: 'O',

      orderCRequest: '',

      orderSDate: '2022/12/30',

      orderCBusiNo: 34,

      orderCOrder: '',

      orderCOil: '',

      orderTemp: '',
      orderNote: ''
  }, {

      orderOrderSort: '배송',

      orderCliName: '삼성',

      orderOilClass: '휘발유',

      orderShipReqQuan: 4,

      orderVehicleNum: '97다1242',

      orderShipNum: 6454,

      orderAddress: '부산',

      orderShipDate: '2022/11/11',

      orderOfficeNum: '02-942-1232',

      orderPhoneNum: '010-5121-6111',

      orderVehCapacity: 32,

      orderShipDepart: 'X',

      orderCRequest: '',

      orderSDate: '2022/11/15',

      orderCBusiNo: 89,

      orderCOrder: '',

      orderCOil: '',

      orderTemp: '',
      orderNote: ''

  }]
const invenlist: InvenList[] = [{

  cusDate: '2022/09/01',

  cusNum: 423,

  oilClass: '경유',

  tankNum: 132,

  cusQuan: 124,

  invenQuan: 142,

  shipQuan: 12,

  klQuan: 2143,

  shipper: '한명제',

  ship: '여객선',

  dPass: '',

  sBlNo: 1,

  sPassNo: ''
}, {

    cusDate: '2022/11/31',

    cusNum: 157,

    oilClass: '고급휘발유',

    tankNum: 41,

    cusQuan: 4123,

    invenQuan: 142123,

    shipQuan: 123,

    klQuan: 51,

    shipper: '박상준',

    ship: '쇄빙선',

    dPass: '',

    sBlNo: 2,

    sPassNo: ''
  },
  {

    cusDate: '2022/12/31',

    cusNum: 978,

    oilClass: '휘발유',

    tankNum: 879,

    cusQuan: 77,

    invenQuan: 7855,

    shipQuan: 789,

    klQuan: 546,

    shipper: '여진규',

    ship: '낚시배',

    dPass: '',

    sBlNo: 3,

    sPassNo: ''
  },
  {

    cusDate: '2022/01/01',

    cusNum: 789,

    oilClass: '경유',

    tankNum: 87,

    cusQuan: 234,

    invenQuan: 8784,

    shipQuan: 4532,

    klQuan: 124,

    shipper: '최경학',

    ship: '유람선',

    dPass: '',

    sBlNo: 4,

    sPassNo: ''
  }]
@Injectable()
export class Service {

  getReqclass() {
    return reqclass;
  }
  getOilType() {
    return oiltype;
  }
  getInsRegis() {
    return insregis;
  }
  getLiqShip() {
    return liqship;
  }
  getOrderInfo() {
    return orderinfo;
  }
  getInvenList() {
    return invenlist;
  }
  getSalesSort() {
    return salessort;
  }
  getRack() {
    return rack;
  }
  getLiqOrderInfo() {
    return liqorderinfo;
  }
}
