import { Injectable } from '@angular/core';


export class Data {
  //출하일자
  SmDate!: string;
  //순번
  Num!: number;
  //차량번호
  VehNum!: string;
  //제품
  Product!: string;
  //도착지
  Destination!: string;
  //거래처명
  CliName!: string;
  //지시량
  IndQuan!: number;
  //공차중량
  TolWei!: number;
  //총중량
  GroWei!: number;
  //온도
  Temper!: string;
  //TANK
  Tank!: string;
  //RACK
  Rack!: number;
  //출고시간
  RelTim!: string;
  //출하구분
  RelClass!: string;
  //기사명
  DriverName!: string;
  //거래처구분
  CliClass!: string;
  //거래처전화
  CliPho!: string;
  //출하번호
  RelNum!: string;
  //유류/화학
  OilChe!: string;

}

const data: Data[] = [{
  SmDate: '2022/04/15',
  Num: 1,
  VehNum: '전북91사8414',
  Product: '황산98%',
  Destination: '(주)엘지화학',
  CliName: '엘지화학',
  IndQuan: 20.65,
  TolWei: 17.920,
  GroWei: 380,
  Temper: '',
  Tank: '204',
  Rack: 6,
  RelTim: '07:00 ~ 07:23',
  RelClass: '판매',
  DriverName: '채승민',
  CliClass: 'V2',
  CliPho: '02-2220-9500',
  RelNum: 'NCC15154896',
  OilChe: '[C]화학출하'
},
  {
    SmDate: '2022/08/17',
    Num: 2,
    VehNum: '전북17사8485',
    Product: '암모니아수',
    Destination: '(주)백광산업',
    CliName: '신아화공',
    IndQuan: 20,
    TolWei: 11.911,
    GroWei: 140,
    Temper: '',
    Tank: '104A',
    Rack: 5,
    RelTim: '04:00 ~ 05:43',
    RelClass: '판매',
    DriverName: '강용덕',
    CliClass: 'V2',
    CliPho: '02-1922-1346',
    RelNum: 'NCC15158452',
    OilChe: '[C]화학출하'
  },
  {
    SmDate: '2022/01/11',
    Num: 3,
    VehNum: '전남11사1234',
    Product: '염산',
    Destination: '(주)코아텍',
    CliName: '코아텍',
    IndQuan: 60.45,
    TolWei: 13.410,
    GroWei: 330,
    Temper: '',
    Tank: '501',
    Rack: 7,
    RelTim: '19:00 ~ 20:00',
    RelClass: '판매',
    DriverName: '윤현철',
    CliClass: 'V2',
    CliPho: '02-1323-1244',
    RelNum: 'NCC14123225',
    OilChe: '[O]유류출하'
  },
  {
    SmDate: '2022/02/24',
    Num: 4,
    VehNum: '전북34사4122',
    Product: '암모니아수',
    Destination: '(주)비봉케미칼',
    CliName: '에스피시',
    IndQuan: 21.79,
    TolWei: 27.220,
    GroWei: 222,
    Temper: '',
    Tank: '201A',
    Rack: 2,
    RelTim: '17:00 ~ 19:23',
    RelClass: '판매',
    DriverName: '함정우',
    CliClass: 'V2',
    CliPho: '02-1324-9912',
    RelNum: 'NCC32214896',
    OilChe: '[C]화학출하'
  },
  {
    SmDate: '2022/10/14',
    Num: 5,
    VehNum: '서울14사2211',
    Product: '발연황산',
    Destination: '(주)이지테크',
    CliName: '이화산업',
    IndQuan: 71.11,
    TolWei: 22.224,
    GroWei: 101,
    Temper: '',
    Tank: '430A',
    Rack: 5,
    RelTim: '23:00 ~ 23:23',
    RelClass: '판매',
    DriverName: '황창식',
    CliClass: 'V2',
    CliPho: '02-1155-9852',
    RelNum: 'NCC15151101',
    OilChe: '[O]유류출하'
  }
]

@Injectable()
export class Service {
  getData() {
    return data;
  }

}
