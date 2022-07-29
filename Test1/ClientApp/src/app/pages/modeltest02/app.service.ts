import { Injectable } from '@angular/core';


export class State {
  ID: string;
  Name: string;
}
export class Role {
  ID: string;
  Name: string;
}
const states: State[] = [{
  ID: 'A',
  Name: 'Active',
}, {
  ID: 'D',
  Name: 'Dactive',
}, {
  ID: 'R',
  Name: 'Removed',
  }];


const roles: Role[] = [{
  ID: 'A',
  Name: '시스템관리자',
}, {
  ID: 'U',
  Name: '일반유저',
}, {
  ID: 'S',
  Name: '수퍼유저',
  }];

const federalHolidays: Date[] = [
  new Date(2017, 0, 1),
  new Date(2017, 0, 2),
  new Date(2017, 0, 16),
  new Date(2017, 1, 20),
  new Date(2017, 4, 29),
  new Date(2017, 6, 4),
  new Date(2017, 8, 4),
  new Date(2017, 9, 9),
  new Date(2017, 10, 11),
  new Date(2017, 10, 23),
  new Date(2017, 11, 25),
];

@Injectable()
export class Service {

  getStates() {
    return states;
  }

  getRoles() {
    return roles;
  }
  getFederalHolidays(): Date[] {
    return federalHolidays;
  }
}
