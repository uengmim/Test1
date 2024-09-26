import { Injectable } from '@angular/core';

//데이터 정보
export class Employee {
  //주문처
  placeOrder!: string;
  //선검수 출고지
  placeDeli!: string;
  //선검수 도착처
  placeTarget!: string;
  //선검수 출고번호
  deliNum!: string;
  //제품
  product!: string;
  //포장
  packaging!: string;
  //선검수량
  inspQuantity!: number;
  //실주문량
  orderQuantity!: number;
  //실출고량
  deliQuantity!: number;
}

const employees: Employee[] = [
  {
    placeOrder: "대풍농자재",
    placeDeli: "담양(물,농)",
    placeTarget: "전남 황룡농협자재센터(구매)",
    deliNum: "202206270040",
    product: "고 BBNK",
    packaging: "0020A",
    inspQuantity: 840,
    orderQuantity: 0,
    deliQuantity: 0
  },
  {
    placeOrder: "대풍농자재",
    placeDeli: "담양(물,농)",
    placeTarget: "전남 옥과농협 오산지점(구매)",
    deliNum: "202204290541",
    product: "고 BBNK",
    packaging: "0020A",
    inspQuantity: 720,
    orderQuantity: 720,
    deliQuantity: 720
  }
];

//콤보박스
export class State {
  ID!: number;
  Name!: string;
}


const states: string[] = [
  '영업관리담당',
  '제품관리담당',
];

export class State2 {
  ID!: number;
  Name!: string;
}

const states2: State2[] = [
  {
    ID: 1,
    Name: '경북86거5042',
  },
  {
    ID: 2,
    Name: '경북86거1123',
  },
];

export class State3 {
  ID!: number;
  Name!: string;
}

const states3: State3[] = [
  {
    ID: 1,
    Name: '소형',
  },
  {
    ID: 2,
    Name: '중형',
  },
  {
    ID: 3,
    Name: '대형',
  },
];

export class State4 {
  ID!: number;
  Name!: string;
}

const states4: State4[] = [
  {
    ID: 1,
    Name: '김효연',
  },
  {
    ID: 2,
    Name: '안동현',
  },
];

export class State5 {
  ID!: number;
  Name!: string;
}

const states5: State5[] = [
  {
    ID: 1,
    Name: '기본',
  },
  {
    ID: 2,
    Name: '분산',
  },
  {
    ID: 3,
    Name: 'unloading',
  },
];

export class State6 {
  ID!: number;
  Name!: string;
}

const states6: State6[] = [
  {
    ID: 1,
    Name: '농업용',
  },
  {
    ID: 2,
    Name: '골프장공업용',
  },
  {
    ID: 3,
    Name: '수출용',
  },
];


export class State7 {
  ID!: number;
  Name!: string;
}

const states7: State7[] = [
  {
    ID: 1,
    Name: '항차',
  },
  {
    ID: 2,
    Name: '비항차',
  }
];


@Injectable()
export class Service {
  getEmployees() {
    return employees;
  }
  getStates() {
    return states;
  }
  getStates2() {
    return states2;
  }
    getStates3() {
      return states3;
    }
    getStates4() {
      return states4;
    }
    getStates5() {
      return states5;
    }
    getStates6() {
      return states6;
    }
    getStates7() {
      return states7;
    }

}
