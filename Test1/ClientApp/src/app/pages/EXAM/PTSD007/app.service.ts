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
  T!: string;
  U!: string;
  V!: string;
  W!: string;
}

const employees: Employee[] = [
  {
  A: 1,
  B: '영업관리담당',
  C: '컴퓨터',
  D: 'O',
  E: 'O',
  F: '개인',
  G: '개인',
  H: '용인',
  I: 100,
  J: 20000,
  K: 100,
  L: 10,
  M: 10,
  N: 10,
  O: '서울',
  P: 'O',
  Q: 'X',
  R: 'O',
  S: '2022/05/14',
  T: '서울',
  U: '주문',
  V: '완제품',
  W: '승인'
  },
  {
    A: 2,
    B: '제품관리담당',
    C: '냉장고',
    D: 'X',
    E: 'X',
    F: '개인',
    G: '공용',
    H: '부산',
    I: 1000,
    J: 200000,
    K: 1000,
    L: 100,
    M: 100,
    N: 100,
    O: '서울',
    P: 'O',
    Q: 'O',
    R: 'O',
    S: '2020/01/14',
    T: '수원',
    U: '비주문',
    V: '완제품',
    W: '미승인'
  },
  {
    A: 3,
    B: '영업관리담당',
    C: '김치냉장고',
    D: 'X',
    E: 'O',
    F: '개인',
    G: '공용',
    H: '성남',
    I: 100000,
    J: 20000000,
    K: 1000,
    L: 100,
    M: 10,
    N: 10,
    O: '강릉',
    P: 'X',
    Q: 'X',
    R: 'X',
    S: '2020/05/16',
    T: '여수',
    U: '주문',
    V: '완제품',
    W: '미승인'
  },
  {
    A: 3,
    B: '제품관리담당',
    C: '침대',
    D: 'X',
    E: 'X',
    F: '공용',
    G: '공용',
    H: '대구',
    I: 10000,
    J: 2000000,
    K: 100,
    L: 10,
    M: 1,
    N: 1,
    O: '강릉',
    P: 'O',
    Q: 'X',
    R: 'X',
    S: '2021/01/11',
    T: '용인',
    U: '주문',
    V: '완제품',
    W: '승인'
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
    Name:'A'
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

}
