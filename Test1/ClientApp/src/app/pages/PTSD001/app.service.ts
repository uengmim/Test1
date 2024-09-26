import { Injectable } from '@angular/core';


export class Employee {
  PARAM1!: number;

  PARAM2!: string;

  PARAM3!: string;

  PARAM4!: string;

  PARAM5!: string;

  PARAM6!: string;
  
  PARAM7!: string;

  PARAM8!: string;

  PARAM9!: number;

  PARAM10!: number;

  PARAM11!: string;
}

const employees: Employee[] = [{
    PARAM1: 1,
    PARAM2: '2022/08/22',
    PARAM3: 'ISTN',
    PARAM4: 'ISTN-1',
    PARAM5: 'SEOUL',
    PARAM6: 'A001',
    PARAM7: '컴퓨터',
    PARAM8: '3',
    PARAM9: 5000,
    PARAM10: 6000,
    PARAM11: ''
  },
  {
    PARAM1: 2,
    PARAM2: '2022/08/22',
    PARAM3: 'ISTN',
    PARAM4: 'ISTN-1',
    PARAM5: 'SEOUL',
    PARAM6: 'A002',
    PARAM7: '키보드',
    PARAM8: '3',
    PARAM9: 2000,
    PARAM10: 4000,
    PARAM11: ''
  }
]

const clients: string[] = [
  '영업관리담당',
  '생산관리담당',
  '운송관리담당'

  ];




@Injectable()
export class Service {
    getEmployees() {
    return employees;
  }


  getclient(): string[] {
    return clients;
  }

}
