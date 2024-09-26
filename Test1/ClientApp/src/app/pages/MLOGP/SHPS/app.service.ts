import { Injectable } from '@angular/core';


export class TINCT {
  INCO1: string;
  BEZEI: string;
}



export class Data2 {
  code!: string;

  name!: string;
}

const data2: Data2[] = [
  {
    code: '1000',
    name: '비료'
  },

  {
    code: '2000',
    name: '화학'
  },

  {
    code: '9999',
    name: '임가공'
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
