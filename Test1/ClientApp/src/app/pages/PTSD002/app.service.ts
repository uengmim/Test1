import { Injectable } from '@angular/core';

export const directions: any = {
  auto: {
    icon: 'rowfield',
    shading: true,
    position: {
      of: '#grid',
      my: 'right bottom',
      at: 'right bottom',
      offset: '-16 -16',
    },
  },
  up: {
    icon: 'rowfield',
    shading: true,
    direction: 'up',
    position: {
      of: '#grid',
      my: 'right bottom',
      at: 'right bottom',
      offset: '-16 -16',
    },
  },
  down: {
    icon: 'rowfield',
    shading: true,
    direction: 'down',
    position: {
      of: '.dx-datagrid-rowsview',
      my: 'right top',
      at: 'right top',
      offset: '-16 16',
    },
  },
};


export class Employee2 {
  PARAM1!: number;

  PARAM2!: string;

  PARAM3!: string;

  PARAM4!: string;

  PARAM5!: string;

  PARAM6!: string;

  PARAM7!: string;

  PARAM8!: string;

  PARAM9!: number;

  PARAM10!: string;

  PARAM11!: string;

  PARAM12!: string;

  PARAM13!: string;

  PARAM14!: string;

  PARAM15!: string;

  PARAM16!: string;

  PARAM17!: string;

  PARAM18!: string;

}


const employees2: Employee2[] = [{
  PARAM1: 202204220187,
  PARAM2: '안동남해화학',
  PARAM3: '슈퍼고추(세기)',
  PARAM4: '20KG 표준백',
  PARAM5: '[N]정상',
  PARAM6: '[A]농업용',
  PARAM7: '북안동농현원천지',
  PARAM8: '60',
  PARAM9: 14100,
  PARAM10: '0',
  PARAM11: '720',
  PARAM12: '0',
  PARAM13: '[1]팔렛트',
  PARAM14: '4/29/2018',
  PARAM15: '횡성',
  PARAM16: '씨제이',
  PARAM17: '전체',
  PARAM18: '전체'
},
  {
    PARAM1: 20220422131,
    PARAM2: '남해',
    PARAM3: '슈퍼고추(세기)',
    PARAM4: '20KG 표준백',
    PARAM5: '[N]정상',
    PARAM6: '[A]농업용',
    PARAM7: '북안동농현원천지',
    PARAM8: '60',
    PARAM9: 1400,
    PARAM10: '0',
    PARAM11: '145',
    PARAM12: '0',
    PARAM13: '[2]삐레',
    PARAM14: '4/29/2014',
    PARAM15: '횡성',
    PARAM16: '씨제이',
    PARAM17: '전체',
    PARAM18: '전체'
  },
  {
    PARAM1: 1231231231,
    PARAM2: '북해',
    PARAM3: '슈퍼고추(세기)',
    PARAM4: '20KG 표준백',
    PARAM5: '[N]정상',
    PARAM6: '[A]농업용',
    PARAM7: '북안동농현원천지',
    PARAM8: '60',
    PARAM9: 14100,
    PARAM10: '0',
    PARAM11: '884',
    PARAM12: '0',
    PARAM13: '[3]파렛',
    PARAM14: '4/29/2017',
    PARAM15: '횡성',
    PARAM16: '씨제이',
    PARAM17: '전체',
    PARAM18: '전체'
  },
]
const clients: string[] = [
  '영업관리담당',
  '생산관리담당',
  '운송관리담당'

  ];


@Injectable()
export class Service {


  getEmployees2() {
    return employees2;
  }
  getclient(): string[] {
    return clients;
  }

}
