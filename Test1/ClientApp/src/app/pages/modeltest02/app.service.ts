import { Injectable } from '@angular/core';


export class State {
  ID: string;
  Name: string;
}
export class Role {
  ID: string;
  Name: string;
}

export class Option {
  ID: string;
  Name: string;
}
export class PriorityEntity {
  id: number;

  text: string;
}

const priorityEntities: PriorityEntity[] = [
  { id: 1, text: 'OPTION1' },
  { id: 2, text: 'OPTION2' },
  { id: 3, text: 'OPTION3' },
  { id: 4, text: 'OPTION4' },
];

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



const option: Option[] = [{
  ID: 'B',
  Name: '버튼 추가',
}, {
  ID: 'A',
  Name: '악세사리 추가',
}, {
  ID: 'T',
  Name: '외부 안테나 추가',
  }];
1
@Injectable()
export class Service {

  getStates() {
    return states;
  }

  getRoles() {
    return roles;
  }

  getOption() {
    return option;
  }

  getPriorityEntities(): PriorityEntity[] {
    return priorityEntities;
  }
}
