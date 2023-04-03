import { Injectable } from '@angular/core';






export class Data2 {
  code!: string;

  name!: string;
}

const data2: Data2[] = [
  {
    code: '20',
    name: '화학'
  },

  {
    code: '30',
    name: '유류'
  },
];

export class Status {
  code!: string;

  name!: string;
}

const status: Status[] = [
  {
    code: '30',
    name: '출고처리 대기'
  },

  {
    code: '40',
    name: '출고확정 대기'
  },
];




@Injectable()
export class Service {
  getData2(): Data2[] {
    return data2;
  }

  getStatus(): Status[] {
    return status;
  }

}
