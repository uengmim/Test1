import { Injectable } from '@angular/core';


export class ShipData {
  //출하일자
  shipDate?: string;
  //순번
  turn?: number;
  //지시일자
  insDate?: string;
  //지시순번
  insTurn?: number;
  //상품코드
  prodcCode?: string;
  //상품명
  prodcName?: string;
  //차량번호
  vehNum?: string;
  //출하구분
  shipSort?: string;
  //시작시간
  startTime!: string;
  //종료시간
  endTime?: string;
  //도착코드
  arrivCode?: string;
  //도착지
  arriv?: string;
  //지시량
  insQuan?: number;
  //Liter중량
  literWeight?: number;
  //공차중량
  tolerWeight?: number;
  //출하량
  shipQuan?: number;
  //출하총량
  shipTotalAmt?: number;
  //정산량
  settleAmt?: number;
  //온도
  temper?: number;
}

const shipdata: ShipData[] = [{

  shipDate: '2022-07-01',

  turn: 14,
  
  insDate: '2022-07-01',

  insTurn: 14,

  prodcCode: 'A45',

  prodcName: '등유',

  vehNum: '전남81바4238',

  shipSort: '자동출하',

  startTime: '12:01',

  endTime: '12:12',

  arrivCode: 'H03',

  arriv: '화순',

  insQuan: 8000,

  literWeight: 8000,

  tolerWeight: 365,

  shipQuan: 6.248,

  shipTotalAmt: 15165165,

  settleAmt: 7.830,

  temper: 37.7,
},
  {

    shipDate: '2022-07-02',

    turn: 4,

    insDate: '2022-07-02',

    insTurn: 3,

    prodcCode: 'A45',

    prodcName: '등유',

    vehNum: '전남81바4238',

    shipSort: '자동출하',

    startTime: '08:04',

    endTime: '08:08',

    arrivCode: 'S01',

    arriv: '순천',

    insQuan: 4000,

    literWeight: 4000,

    tolerWeight: 8945,

    shipQuan: 3.158,

    shipTotalAmt: 7985465,

    settleAmt: 3.958,

    temper: 26.4
  },
  {

    shipDate: '2022-07-13',

    turn: 3,

    insDate: '2022-07-43',

    insTurn: 5,

    prodcCode: 'A45',

    prodcName: '등유',

    vehNum: '경북82아5422',

    shipSort: '자동출하',

    startTime: '07:38',

    endTime: '07:43',

    arrivCode: 'S08',

    arriv: '사천',

    insQuan: 8000,

    literWeight: 7999,

    tolerWeight: 978,

    shipQuan: 6.328,

    shipTotalAmt: 97846,

    settleAmt: 7.930,

    temper: 24.73
  },
  {

    shipDate: '2022-07-14',

    turn: 5,

    insDate: '2022-07-14',

    insTurn: 7,

    prodcCode: 'A45',

    prodcName: '등유',

    vehNum: '전남81바4238',

    shipSort: '자동출하',

    startTime: '07:17',

    endTime: '08:34',

    arrivCode: 'H04',

    arriv: '합천',

    insQuan: 12000,

    literWeight: 11998,

    tolerWeight: 7894,

    shipQuan: 9.465,

    shipTotalAmt: 987255,

    settleAmt: 9.465,

    temper: 27.3,
  },
  {

    shipDate: '2022-07-22',

    turn: 17,

    insDate: '2022-07-22',

    insTurn: 20,

    prodcCode: 'A45',

    prodcName: '등유',

    vehNum: '전남81바4238',

    shipSort: '자동출하',

    startTime: '11:37',

    endTime: '11:58',

    arrivCode: 'H03',

    arriv: '장흥',

    insQuan: 32000,

    literWeight: 31993,

    tolerWeight: 9786,

    shipQuan: 24.958,

    shipTotalAmt: 9784,

    settleAmt: 31.238,

    temper: 38.5,
  }
]


@Injectable()
export class Service {


  getShipData() {
    return shipdata;
  }


}
