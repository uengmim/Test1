import { Injectable } from '@angular/core';

//데이터 정보
export class Employee {
  A!: number;
  B!: string;
  C!: string;
  D!: string;
  E!: string;
  F!: string;
  G!: string;
  H!: string;
  I!: number;
  J!: number;
  K!: number;
  L!: number;
  M!: number;
  N!: number;
  O!: string;
  P!: string;
  Q!: string;
  R!: string;
  S!: string;
  T!: number;
  U!: string;
  V!: string;
  W!: string;
}

export class Option {
  ID!: string;
  Name!: string;
}

const employees: Employee[] = [
  {
    A: 1,
    B: '영업관리담당',
    C: '아디다스',
    D: '배송전',
    E: 'O',
    F: '주문완료',
    G: '개인',
    H: '용인',
    I: 1,
    J: 20000,
    K: 1,
    L: 1,
    M: 10,
    N: 1,
    O: 'O',
    P: '2022/8/24',
    Q: '서울',
    R: '아이에스티엔',
    S: '쿠팡',
    T: 10,
    U: '여수',
    V: '완제품',
    W: '지정'
  },
  {
    A: 2,
    B: '제품관리담당',
    C: '나이키',
    D: '배송완료',
    E: 'X',
    F: '주문중',
    G: '공용',
    H: '천안',
    I: 100,
    J: 20000,
    K: 10,
    L: 10,
    M: 100,
    N: 10,
    O: 'X',
    P: '2020/8/24',
    Q: '아산',
    R: '쿠팡',
    S: '쿠팡',
    T: 10,
    U: '제주도',
    V: '완제품',
    W: '미지정'
  },
  {
    A: 3,
    B: '제품관리담당',
    C: '언더아머',
    D: '배송전',
    E: 'O',
    F: '주문취소',
    G: '공용',
    H: '성남',
    I: 10,
    J: 2000,
    K: 100,
    L: 100,
    M: 1000,
    N: 100,
    O: 'X',
    P: '2022/8/24',
    Q: '여주',
    R: '쿠팡',
    S: '쿠팡',
    T: 10,
    U: '서울',
    V: '완제품',
    W: '지정'
  },
  {
    A: 4,
    B: '영업관리담당',
    C: '구찌',
    D: '배송완료',
    E: 'O',
    F: '주문완료',
    G: '개인',
    H: '수원',
    I: 100,
    J: 20000,
    K: 1000,
    L: 1000,
    M: 10000,
    N: 1000,
    O: 'O',
    P: '2022/8/26',
    Q: '여수',
    R: '쿠팡',
    S: '쿠팡',
    T: 10,
    U: '서울',
    V: '완제품',
    W: '지정'
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
