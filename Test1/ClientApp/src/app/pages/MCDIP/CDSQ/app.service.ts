import { Injectable } from '@angular/core';


export class OrderData {
  //거래처
  oilClient?: string;
  //도착지
  oilDesti?: string;
  //유종
  oilSort?: string;
  //출하일자
  oilShipDate?: string;
  //순번
  oilTurn?: number;
  //RACK
  oilRack?: number;
  //주문구분
  oilOrderSort?: string;
  //차량번호
  oilVehNum?: string;
  //지시량(L)
  oilIndQuanL?: number;
  //출하량(L)
  oilShipQuanL?: number;
  //출하량(MT)
  oilShipQuanMT?: number;
  //정산량
  oilSetAmount!: number;
  //단위
  oilUnit?: string;
  //온도
  oilTem?: number;
  //V.C.F
  oilVCF?: number;
  //비중
  oilSpecific?: number;
  //출고시간
  oilFWTime?: string;
  //B/L번호
  oilBLNum?: string;
  //ORDER
  oilOrder?: number;
  //REQUEST
  oilRequset?: string;
  //선적번호(S-OIL)
  oilSOil?: number;
  //저장탱크
  oilStorTank?: string;
}
export class CheOrderData {
  //거래처
  cheOilClient?: string;
  //도착지
  cheOilDesti?: string;
  //유종
  cheOilSort?: string;
  //출하일자
  cheOilShipDate?: string;
  //순번
  cheOilTurn?: number;
  //차량번호
  cheOilVehNum?: string;
  //지시량(L)
  cheOilIndQuanL?: number;
  //출하량(L)
  cheOilShipQuanL?: number;
  //출하량(MT)
  cheOilShipQuanMT?: number;
  //정산량
  cheOilSetAmount!: number;
  //단위
  cheOilUnit?: string;
  //V.C.F
  cheOilVCF?: number;
  //비중
  cheOilSpecific?: number;
  //출고시간
  cheOilFWTime?: string;
  //저장탱크
  cheOilStorTank?: string;
}
const sort: string[] = [
  '남해',
  'S-OIL',

];
const Orderdata: OrderData[] = [{

  oilClient: '도곡농협주유소',

  oilDesti: '화순',

  oilSort: '등유',

  oilShipDate: '2022-05-15',

  oilTurn: 14,

  oilRack: 5,

  oilOrderSort: '남해',

  oilVehNum: '43다1235',

  oilIndQuanL: 8000,

  oilShipQuanL: 8000,

  oilShipQuanMT: 6248,

  oilSetAmount: 9735,

  oilUnit: '[V2]부피공란',

  oilTem: 32.7,

  oilVCF: 0.9787,

  oilSpecific: 0.7991,

  oilFWTime: '12:01 ~ 12:12',

  oilBLNum: 'M1234123123',

  oilOrder: 1234123123,

  oilRequset: '',

  oilSOil: 412312,

  oilStorTank: '50%'
}, {

  oilClient: '순천원예농협주유소',

  oilDesti: '순천',

  oilSort: '휘발유',

  oilShipDate: '2022-07-02',

  oilTurn: 4,

  oilRack: 8,

  oilOrderSort: '남해',

  oilVehNum: '98다6454',

  oilIndQuanL: 8000,

  oilShipQuanL: 8000,

  oilShipQuanMT: 6248,

  oilSetAmount: 7830,

  oilUnit: '[V2]부피공란',

  oilTem: 26.4,

  oilVCF: 76786,

  oilSpecific: 0.7991,

  oilFWTime: '08:00 ~ 08:04',

  oilBLNum: 'M1231245677',

  oilOrder: 7827278,

  oilRequset: '',

  oilSOil: 87641,

  oilStorTank: '40%'
}, {

  oilClient: '서포농협주유소',

  oilDesti: '사천',

  oilSort: '경유',

  oilShipDate: '2022-07-13',

  oilTurn: 3,

  oilRack: 9,

  oilOrderSort: '남해',

  oilVehNum: '49다7342',

  oilIndQuanL: 12000,

  oilShipQuanL: 19607,

  oilShipQuanMT: 31451,

  oilSetAmount: 45412,

  oilUnit: '[V2]부피공란',

  oilTem: 39.5,

  oilVCF: 5123123,

  oilSpecific: 0.7912,

  oilFWTime: '17:00 ~ 17:34',

  oilBLNum: 'M1245213',

  oilOrder: 9848413,

  oilRequset: '',

  oilSOil: 78545,

  oilStorTank: '80%'
}
]

const CheOrderdata: CheOrderData[] = [{

  cheOilClient: '도곡농협주유소',

  cheOilDesti: '화순',

  cheOilSort: '등유',

  cheOilShipDate: '2022-05-15',

  cheOilTurn: 14,

  cheOilVehNum: '43다1235',

  cheOilIndQuanL: 8000,

  cheOilShipQuanL: 8000,

  cheOilShipQuanMT: 6248,

  cheOilSetAmount: 9735,

  cheOilUnit: '[V2]부피공란',

  cheOilVCF: 0.9787,

  cheOilSpecific: 0.7991,

  cheOilFWTime: '12:01 ~ 12:12',

  cheOilStorTank: '50%'
},
{
  cheOilClient: '화천농협주유소',

  cheOilDesti: '순천',

  cheOilSort: '휘발유',

  cheOilShipDate: '2022-10-14',

  cheOilTurn: 14,

  cheOilVehNum: '55다9534',

  cheOilIndQuanL: 10242,

  cheOilShipQuanL: 675534,

  cheOilShipQuanMT: 3453,

  cheOilSetAmount: 32132,

  cheOilUnit: '[V2]부피공란',

  cheOilVCF: 0.9787,

  cheOilSpecific: 0.7991,

  cheOilFWTime: '10:24 ~ 10:28',

  cheOilStorTank: '70%'
}]
@Injectable()
export class Service {


  getOrderData() {
    return Orderdata;
  }
  getCheOrderData() {
    return CheOrderdata;
  }
  getSort(): string[] {
    return sort;
  }
}
