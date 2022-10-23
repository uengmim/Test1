import { Injectable } from '@angular/core';


export class Data {
  //출하일자
  SmDate!: string;
  //순번
  Num!: string;
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
  Rack!: string;
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
  inNumber!: string;
}

//유류/화학
export class OilChemical {
  ID!: string;
  Name!: string;
}
//제품
export class Product {
  ID!: string;
  Name!: string;
}
//거래처
export class Client {
  ID!: string;
  Name!: string;
}

//유류/화학
const oilChemical: string[] = [
  '[A]화학출하',
  '[B]화학출하',
  '[C]화학출하',
];

//제품
const product: string[] = [
  '전체',
  '황산98%',
  '암모니아',
];

//거래처
const client: string[] = [
  '(주)엘지화학',
  '동우화인켐주식회사%',
  '대상주식회사',
];

const data: Data[] = [{
  SmDate: '2022/04/15',
  Num: '001',
  VehNum: '전북91사8415',
  Product: '황산98%',
  Destination: '(주)엘지화학',
  CliName: '엘지화학',
  IndQuan: 20.65,
  TolWei: 17920,
  GroWei: 380,
  Temper: '',
  Tank: '204',
  Rack: '06',
  RelTim: '07:00 ~ 07:23',
  RelClass: '판매',
  DriverName: '김재준',
  CliClass: 'V2',
  CliPho: '02-2220-9500',
  RelNum: 'NCC15154896',
  inNumber: '001-01'
},
  {
    SmDate: '2022/04/15',
    Num: '002',
    VehNum: '전국96저3160',
    Product: '암모니아수',
    Destination: 'SK하이닉스',
    CliName: '동우화인켐주식회사',
    IndQuan: 10,
    TolWei: 19290,
    GroWei: 29150,
    Temper: '',
    Tank: '104A',
    Rack: '05',
    RelTim: '00:30 ~ 01:00',
    RelClass: '판매',
    DriverName: '유재형',
    CliClass: 'V2',
    CliPho: '02-1922-1346',
    RelNum: 'NCC15158452',
    inNumber: '002-02'
  },
  {
    SmDate: '2022/04/15',
    Num: '003',
    VehNum: '대전87아9037',
    Product: '황산98%',
    Destination: '(주)선진화학',
    CliName: '이화산업',
    IndQuan: 24.65,
    TolWei: 14970,
    GroWei: 39630,
    Temper: '',
    Tank: '204',
    Rack: '06',
    RelTim: '10:26 ~ 10:53',
    RelClass: '판매',
    DriverName: '이준형',
    CliClass: 'V2',
    CliPho: '062-951-3717',
    RelNum: 'NCC14123225',
    inNumber: '003-03'
  },
  {
    SmDate: '2022/04/15',
    Num: '004',
    VehNum: '충북88사3917',
    Product: '암모니아',
    Destination: 'OCI SE',
    CliName: 'OCI SE',
    IndQuan: 18.95,
    TolWei: 20940,
    GroWei: 39900,
    Temper: '',
    Tank: '501',
    Rack: '07',
    RelTim: '14:11 ~ 14:47',
    RelClass: '판매',
    DriverName: '황창식',
    CliClass: 'V2',
    CliPho: '043-1324-9912',
    RelNum: 'NCC32214896',
    inNumber: '004-04'
  },
  {
    SmDate: '2022/04/15',
    Num: '005',
    VehNum: '전남83바3572',
    Product: '황산98%',
    Destination: '세방전지',
    CliName: '이화산업',
    IndQuan: 24.7,
    TolWei: 15120,
    GroWei: 39820,
    Temper: '',
    Tank: '204',
    Rack: '06',
    RelTim: '15:35 ~ 16:02',
    RelClass: '판매',
    DriverName: '강승용',
    CliClass: 'V2',
    CliPho: '062-951-3717',
    RelNum: 'NCC15151101',
    inNumber: '005-05'
  }
]

@Injectable()
export class Service {
  getData() {
    return data;
  }
  getOilChemical() {
    return oilChemical;
  }
  getProduct() {
    return product;
  }
  getClient() {
    return client;
  }
}
