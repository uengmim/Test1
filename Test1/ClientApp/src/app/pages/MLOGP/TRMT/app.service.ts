import { Injectable } from '@angular/core';

//오더데이터
export class Data {
  //차량번호
  vehNumber!: string;
  //소속회사
  affCompany!: string;
  //기사명
  drName!: string;
  //자택전화
  homeCall!: string;
  //회사전화
  companyCall!: string;
  //휴대폰
  cellPhone!: string;
  //적재중량
  loWeight!: number;
  //공차중량
  toWeight!: number;
  //유창수량
  flQuantity!: number;
  //구분
  sortation!: string;
  //우편번호
  poCode!: string;
  //주소
  address!: string;
  //RFID번호
  rfid!: string;
  //지역
  area!: string;
  //년도
  year!: string;
  //앞번호
  prNumber!: string;
  //뒷번호
  baNumber!: number;
}

//오더데이터
export class SerchInfo {
  //지역
  A!: string;
  //년도
  B!: string;
  //차량 앞번호
  C!: string;
  //차량 뒷번호
  D!: string;
  //차량 전체번호
  E!: string;
  //소속회사
  F!: string;
  //기사명
  G!: string;
  //자택전화
  H!: string;
  //회사전화
  I!: string;
  //휴대폰번호
  J!: string;
  //호출번호
  K!: string;
  //적재중량
  L!: number;
  //유창수량
  M!: number;
  //공차중량
  N!: number;
  //우편번호
  O!: string;
  //우편번호
  P!: string;
  //RFID번호
  Q!: string;
  //유류,화학
  R!: string;
}


//유류,화학
export class Option {
  ID!: string;
  Name!: string;
}
//소속회사
export class Company {
  ID!: string;
  Name!: string;
}
//차량 앞번호
export class Car {
  ID!: string;
  Name!: string;
}
//지역
export class Local {
  ID!: string;
  Name!: string;
}
//차량종류
const carsnumber: string[] = [  
  '소형',
  '중형',
  '대형',
  '특수'
];
//유류,화학
const options: Option[] = [{
  ID: 'A',
  Name: '유류출하',
},
  {
    ID: 'B',
    Name: '화학출하',
  }];
//소속회사
const company: Company[] = [{
  ID: 'A',
  Name: '주영광특운',
},
{
  ID: 'B',
  Name: '(주)대창',
},
{
  ID: 'C',
  Name: '(주)협성유조',
},];
//지역
const local: Local[] = [{
  ID: 'A',
  Name: '연천군',
},
{
  ID: 'B',
  Name: '포천시',
},
{
   ID: 'C',
   Name: '밀양시',
}];
//차량앞번호
const car: Car[] = [{
  ID: 'A',
  Name: '88하',
},
{
  ID: 'B',
  Name: '95다',
},
{
    ID: 'C',
    Name: '36바',
}];
//테스트데이터
const data: Data[] = [{
  vehNumber: '경기89가8278',
  affCompany: '주영광특운',
  drName: '이병천',
  homeCall: '02-159-4561',
  companyCall: '02-156-8745',
  cellPhone: '010-8456-2467',
  loWeight: 1000,
  toWeight: 1000,
  flQuantity: 1000,
  sortation: '유류출하',
  poCode: '07516',
  address: '전남순천시 남신월4길 (조례동)',
  rfid: '335',
  area: '08',
  year: '2022',
  prNumber: '경기89가',
  baNumber: 8278,
},
{
  vehNumber: '경기90아5137',
  affCompany: '(주)대창',
  drName: '유영한',
  homeCall: '02-889-4968',
  companyCall: '070-882-5648',
  cellPhone: '010-1548-6349',
  loWeight: 2000,
  toWeight: 2000,
  flQuantity: 2000,
  sortation: '유류출하',
  poCode: '08452',
  address: '대전광역시 동구 하소동 337-4',
  rfid: '328',
  area: '08',
  year: '2022',
  prNumber: '경기90아',
  baNumber: 5137,
},
{
  vehNumber: '경기92사2101',
  affCompany: '대일상운',
  drName: '이형일',
  homeCall: '02-848-6659',
  companyCall: '070-615-7594',
  cellPhone: '010-5134-7945',
  loWeight: 3000,
  toWeight: 3000,
  flQuantity: 3000,
  sortation: '유류출하',
  poCode: '03452',
  address: '경기도 연천군 연천읍 연천로 177',
  rfid: '229',
  area: '08',
  year: '2022',
  prNumber: '경기92사',
  baNumber: 2101,
},
]


@Injectable()
export class Service {
  getData() {
    return data;
  }
  getclient(): string[] {
    return carsnumber;
  }
  getOption(): Option[] {
    return options;
  }
  getCompany(): Company[] {
    return company;
  }
  getCar(): Car[] {
    return car;
  }
  getLocal(): Local[] {
    return local;
  }
}
