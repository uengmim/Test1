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

@Injectable()
export class Service {

  getStates() {
    return states;
  }

  getRoles() {
    return roles;
  }
}
