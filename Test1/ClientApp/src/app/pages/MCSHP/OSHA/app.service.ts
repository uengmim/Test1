import { Injectable } from '@angular/core';


export class OilShip {
  //출하일
  oilShipDate?: string;
  //순번
  oilNum?: number;
  //거래처
  oilClient?: string;
  //상태
  oilState?: string;
  //유종
  oilType?: string;
  //차량번호
  oilVehNum?: string;
  //도착지
  oilDesti?: string;
  //지시량
  oilInsQuan?: number;
  //유창#1
  oilYuchang1?: string;
  //유창#2
  oilYuchang2?: string;
  //유창#3
  oilYuchang3?: string;
  //유창#4
  oilYuchang4!: string;
  //유창#5
  oilYuchang5?: string;
  //유창#6
  oilYuchang6?: string;
  //유창#7
  oilYuchang7?: string;
  //유창#8
  oilYuchang8?: string;
  //유창#9
  oilYuchang9?: string;
  //유창#10
  oilYuchang10?: string;
  
}
const oilship: OilShip[] = [{

  oilShipDate: '2022-06-01',

  oilNum: 1,

  oilClient: '용현농협주유소',

  oilState: '완료',

  oilType: '등유',

  oilVehNum: '전남81바4478',

  oilDesti: '사천',

  oilInsQuan: 8000,

  oilYuchang1: '07:06~07:11',

  oilYuchang2: '07:11~07:16',

  oilYuchang3: '',

  oilYuchang4: '',

  oilYuchang5: '',

  oilYuchang6: '',

  oilYuchang7: '',

  oilYuchang8: '',

  oilYuchang9: '',

  oilYuchang10: '',

}, 
  {

    oilShipDate: '2022-08-12',

    oilNum: 2,

    oilClient: '도곡농협주유소',

    oilState: '완료',

    oilType: '등유',

    oilVehNum: '전북14사1478',

    oilDesti: '화순',

    oilInsQuan: 6000,

    oilYuchang1: '08:05~08:14',

    oilYuchang2: '08:14~08:25',

    oilYuchang3: '08:25~08:58',

    oilYuchang4: '08:58~09:45',

    oilYuchang5: '09:45~09:59',

    oilYuchang6: '09:59~10:10',

    oilYuchang7: '',

    oilYuchang8: '',

    oilYuchang9: '',

    oilYuchang10: '',

  }, {

    oilShipDate: '2022-10-11',

    oilNum: 3,

    oilClient: '순천원예농현주유소',

    oilState: '완료',

    oilType: '등유',

    oilVehNum: '경북82아5422',

    oilDesti: '순천',

    oilInsQuan: 12000,

    oilYuchang1: '20:00~20:21',

    oilYuchang2: '20:21~20:48',

    oilYuchang3: '20:48~21:03',

    oilYuchang4: '21:03~21:22',

    oilYuchang5: '',

    oilYuchang6: '',

    oilYuchang7: '',

    oilYuchang8: '',

    oilYuchang9: '',

    oilYuchang10: '',

  },
]
export class ChemShip {
  //출하일
  chemShipDate?: string;
  //순번
  chemNum?: number;
  //거래처
  chemClient?: string;
  //상태
  chemState?: string;
  //제품
  chemProduct?: string;
  //차량번호
  chemVehNum?: string;
  //도착지
  chemDesti?: string;
  //지시량
  chemInsQuan?: number;
  //출하량
  chemShipQuan?: number;
  //공차중량
  chemWeight?: number;
  //총중량
  chemTWeight?: number;
  //시작시간
  chemStaTim!: string;
  //종료시간
  chemEndTim?: string;

}
const chemship: ChemShip[] = [{

  chemShipDate: '2022-06-01',

  chemNum: 1,

  chemClient: '용현농협주유소',

  chemState: '완료',

  chemProduct: '등유',

  chemVehNum: '전남81바4478',

  chemDesti: '사천',

  chemInsQuan: 8000,

  chemShipQuan: 5000,

  chemWeight: 4500,

  chemTWeight: 95125154,

  chemStaTim: '07:00',

  chemEndTim: '08:15',
}, {

    chemShipDate: '2022-07-12',

    chemNum: 2,

    chemClient: '동광양농협주유소',

    chemState: '완료',

    chemProduct: '등유',

    chemVehNum: '전남54자1842',

    chemDesti: '남해',

    chemInsQuan: 20000,

    chemShipQuan: 3500,

    chemWeight: 67534,

    chemTWeight: 242844,

    chemStaTim: '13:15',

    chemEndTim: '13:57',
  }, {

    chemShipDate: '2022-09-12',

    chemNum: 3,

    chemClient: '하남주유소',

    chemState: '완료',

    chemProduct: '등유',

    chemVehNum: '경북84아165',

    chemDesti: '해남',

    chemInsQuan: 4000,

    chemShipQuan: 9000,

    chemWeight: 1200,

    chemTWeight: 7233155,

    chemStaTim: '12:12',

    chemEndTim: '12:54',
  }, {

    chemShipDate: '2022-12-12',

    chemNum: 4,

    chemClient: '강성주유소',

    chemState: '완료',

    chemProduct: '등유',

    chemVehNum: '서울14차1978',

    chemDesti: '성남',

    chemInsQuan: 4000,

    chemShipQuan: 9000,

    chemWeight: 7500,

    chemTWeight: 521177,

    chemStaTim: '23:10',

    chemEndTim: '23:12',
  },]



@Injectable()
export class Service {


  getOilShip() {
    return oilship;
  }
  getChemShip() {
    return chemship;
  }
}
