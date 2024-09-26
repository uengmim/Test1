import { Injectable } from '@angular/core';


export class Data {
  PARAM1!: number;

  PARAM2!: string;

  PARAM3!: string;

  PARAM4!: number;

  PARAM5!: string;

  PARAM6!: string;

  PARAM7!: string;

  PARAM8!: string;

  PARAM9!: string;

  PARAM10!: string;

  PARAM11!: string;

  PARAM12!: string;

  PARAM13!: string;

  PARAM14!: string;

  PARAM15!: number;

  PARAM16!: number;

  PARAM17!: string;

  PARAM18!: string;

  PARAM19!: string;

  PARAM20!: string;

  PARAM21!: string;

  PARAM22!: string;

}

const clients: string[] = [
  '영업관리담당',
  '생산관리담당',
  '운송관리담당'

];
const data: Data[] = [{
  PARAM1: 3,
  PARAM2: '전북',
  PARAM3: '쿠팡',
  PARAM4: 1123,
  PARAM5: '2022-08-25',
  PARAM6: '냉장고',
  PARAM7: 'O',
  PARAM8: 'O',
  PARAM9: '5',
  PARAM10: '10',
  PARAM11: '2',
  PARAM12: '2022-08-30',
  PARAM13: '서울',
  PARAM14: '부산',
  PARAM15: 51,
  PARAM16: 11,
  PARAM17: '남해',
  PARAM18: '서울',
  PARAM19: '전자레인지',
  PARAM20: '쿠팡',
  PARAM21: '쿠팡',
  PARAM22: '[C]화학출하'

},

]

@Injectable()
export class Service {
  getData() {
    return data;
  }
  getclient(): string[] {
    return clients;
  }
}
