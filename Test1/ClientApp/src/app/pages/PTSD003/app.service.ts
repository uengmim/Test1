import { Injectable } from '@angular/core';


export class Data {
  PARAM1!: string;

  PARAM2!: number;

  PARAM3!: string;

  PARAM4!: string;

  PARAM5!: string;

  PARAM6!: string;

  PARAM7!: number;

  PARAM8!: number;

  PARAM9!: number;

  PARAM10!: string;

  PARAM11!: string;

  PARAM12!: number;

  PARAM13!: string;

  PARAM14!: string;

  PARAM15!: string;

  PARAM16!: string;

  PARAM17!: string;

  PARAM18!: string;

  PARAM19!: string;

}

const data: Data[] = [{
  PARAM1: '2022/04/15',
  PARAM2: 1,
  PARAM3: '전북91사8414',
  PARAM4: '황산98%',
  PARAM5: '(주)엘지화학',
  PARAM6: '엘지화학',
  PARAM7: 20.65,
  PARAM8: 17.920,
  PARAM9: 380,
  PARAM10: '',
  PARAM11: '204',
  PARAM12: 6,
  PARAM13: '07:00 ~ 07:23',
  PARAM14: '판매',
  PARAM15: '채승민',
  PARAM16: 'V2',
  PARAM17: '02-2220-9500',
  PARAM18: 'NCC15154896',
  PARAM19: '[C]화학출하'
},
  {
    PARAM1: '2022/08/17',
    PARAM2: 2,
    PARAM3: '전북17사8485',
    PARAM4: '암모니아수',
    PARAM5: '(주)백광산업',
    PARAM6: '신아화공',
    PARAM7: 20,
    PARAM8: 11.911,
    PARAM9: 140,
    PARAM10: '',
    PARAM11: '104A',
    PARAM12: 5,
    PARAM13: '04:00 ~ 05:43',
    PARAM14: '판매',
    PARAM15: '강용덕',
    PARAM16: 'V2',
    PARAM17: '02-1922-1346',
    PARAM18: 'NCC15158452',
    PARAM19: '[C]화학출하'
  },
  {
    PARAM1: '2022/01/11',
    PARAM2: 3,
    PARAM3: '전남11사1234',
    PARAM4: '염산',
    PARAM5: '(주)코아텍',
    PARAM6: '코아텍',
    PARAM7: 60.45,
    PARAM8: 13.410,
    PARAM9: 330,
    PARAM10: '',
    PARAM11: '501',
    PARAM12: 7,
    PARAM13: '19:00 ~ 20:00',
    PARAM14: '판매',
    PARAM15: '윤현철',
    PARAM16: 'V2',
    PARAM17: '02-1323-1244',
    PARAM18: 'NCC14123225',
    PARAM19: '[O]유류출하'
  },
  {
    PARAM1: '2022/02/24',
    PARAM2: 4,
    PARAM3: '전북34사4122',
    PARAM4: '암모니아수',
    PARAM5: '(주)비봉케미칼',
    PARAM6: '에스피시',
    PARAM7: 21.79,
    PARAM8: 27.220,
    PARAM9: 222,
    PARAM10: '',
    PARAM11: '201A',
    PARAM12: 2,
    PARAM13: '17:00 ~ 19:23',
    PARAM14: '판매',
    PARAM15: '함정우',
    PARAM16: 'V2',
    PARAM17: '02-1324-9912',
    PARAM18: 'NCC32214896',
    PARAM19: '[C]화학출하'
  },
  {
    PARAM1: '2022/10/14',
    PARAM2: 5,
    PARAM3: '서울14사2211',
    PARAM4: '발연황산',
    PARAM5: '(주)이지테크',
    PARAM6: '이화산업',
    PARAM7: 71.11,
    PARAM8: 22.224,
    PARAM9: 101,
    PARAM10: '',
    PARAM11: '430A',
    PARAM12: 5,
    PARAM13: '23:00 ~ 23:23',
    PARAM14: '판매',
    PARAM15: '황창식',
    PARAM16: 'V2',
    PARAM17: '02-1155-9852',
    PARAM18: 'NCC15151101',
    PARAM19: '[O]유류출하'
  }
]

@Injectable()
export class Service {
  getData() {
    return data;
  }

}
