import { Injectable } from '@angular/core';

//데이터 정보
export class Employee {
  A!: string;
  B!: string;
  C!: string;
  D!: string;
  E!: string;
  F!: string;
  G!: string;
  H!: string;
  I!: string;
  J!: string;
  K!: string;
  L!: string;
  M!: string;
  N!: string;
  O!: string;
  P!: string;
  Q!: string;
  R!: string;
  S!: string;
  T!: string;
  U!: string;
  V!: string;
  W!: string;
  X!: string;
  Y!: string;
  Z!: string;
  AA!: string;
  BB!: string;
  CC!: string;
  DD!: string;
  EE!: string;
  FF!: string;
  GG!: string;
  HH!: string;
  II!: string;
  JJ!: string;
  KK!: string;
  LL!: string;
  MM!: string;
  NN!: string;
  OO!: string;
  PP!: string;
  QQ!: string;
  RR!: string;
  SS!: string;
  TT!: string;
  UU!: string;
  VV!: string;
  
}

export class Option {
  ID!: string;
  Name!: string;
}

const employees: Employee[] = [
  {
    A: 'ISTN',
    B: '용인',
    C: '1',
    D: '영업관리담당',
    E: '2020/5/16',
    F: 'AB11',
    G: '포장',
    H: '10',
    I: '1',
    J: '1',
    K: '1',
    L: '서울',
    M: '쿠팡',
    N: '쿠팡',
    O: '2050',
    P: '싼타페',
    Q: '김기사',
    R: '010-3333-1111',
    S: '인수',
    T: '2021/11/11',
    U: '2020/12/12',
    V: '직송',
    W: '주문완료',
    X: '전송',
    Y: '배송',
    Z: '삼성',
    AA: '출고',
    BB: '완제품',
    CC: '검수완료',
    DD: '인도',
    EE: '하차',
    FF: '1',
    GG: '19',
    HH: '용인점',
    II: '용인시 처인구',
    JJ: '사업',
    KK: 'X',
    LL: '본사',
    MM: 'O',
    NN: 'X',
    OO: 'cm',
    PP: 'X',
    QQ: 'O',
    RR: 'O',
    SS: '직접',
    TT: '개인',
    UU: '출력',
    VV: '완제품'

  },

];

//콤보박스
export class Product {
  ID!: number;
  Name!: string;
}

const simpleProducts: string[] = [
  '영업관리담당',
  '제품관리담당',
];

const products: Product[] = [
  {
    ID: 1,
    Name: 'HD Video Player',
  },
  {
    ID: 2,
    Name: 'A'
  },
  {
    ID: 3,
    Name: 'B'
  },
  {
    ID: 4,
    Name: 'C'
  },
];

const options: Option[] = [{
  ID: 'A',
  Name: '쿠팡',
}];

@Injectable()
export class Service {
  getEmployees() {
    return employees;
  }
  getSimpleProducts(): string[] {
    return simpleProducts;
  }

  getProducts(): Product[] {
    return products;
  }

  getOption() : Option[] {
    return options;
  }
}
