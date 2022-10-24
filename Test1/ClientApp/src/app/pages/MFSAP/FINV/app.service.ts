import { Injectable } from '@angular/core';

//데이터 정보
export class Employee {
  //제품구분
  productCategory!: string;
  //제품
  product!: string;
  //포장
  packaging!: string;
  //현재고
  nowStock!: number;
  //고내재고
  storageStock!: number;
  //가용재고
  availableStock!: number;
  //전마감
  fullClosing!: string;
  //보관검수량
  inspection!: number;
  //정상
  normal!: number;
  //샘플
  sample!: string;
  //파포
  papo!: string;
  //서비스
  service!: string;
  //반품
  return!: string;
  //교환
  exchange!: string;
  //전배
  evangelism!: string;
  //보관검수
  storageInspection!: string;
  //기검수
  inspector!: string;
  //생산
  produce!: string;
  //정상
  normal2!: number;
  //샘플
  sample2!: string;
  //서비스
  service2!: string;
  //교환
  exchange2!: string;
  //수배
  wanted!: string;
  //실재고
  actualStock!: number;
  //회계재고
  accountInventory!: number;
  //검수요청량
  insepctionReq!: number;
  //검수된량
  inspectAmount!: number;
}

const employees: Employee[] = [
  {
    //제품구분
    productCategory!: '석고',
    //제품
    product!: '분상칼슘유황비료',
    //포장
    packaging!: '20KG 표준백',
    //현재고
    nowStock!: 1200,
    //고내재고
    storageStock!: 2000,
    //가용재고
    availableStock!: 1200,
    //전마감
    fullClosing!: '전마감',
    //보관검수량
    inspection!: 2000,
    //정상
    normal!: 1500,
    //샘플
    sample!: '샘플',
    //파포
    papo!: '파포',
    //서비스
    service!: '서비스',
    //반품
    return!: '반품완료',
    //교환
    exchange!: '교환완료',
    //전배
    evangelism!: '전배',
    //보관검수
    storageInspection!: '보관검수 완료',
    //기검수
    inspector!: '기검수 완료',
    //생산
    produce!: '생산 완료',
    //정상
    normal2!: 2000,
    //샘플
    sample2!: '샘플',
    //서비스
    service2!: '서비스',
    //교환
    exchange2!: '교환완료',
    //수배
    wanted!: '수배',
    //실재고
    actualStock!: 2500,
    //회계재고
    accountInventory!: 3000,
    //검수요청량
    insepctionReq!: 2500,
    //검수된량
    inspectAmount!: 3000,
  },
  {
    //제품구분
    productCategory!: '수용성',
    //제품
    product!: '슈퍼솔 고인산(20KG)',
    //포장
    packaging!: '10KG 표준백',
    //현재고
    nowStock!: 1500,
    //고내재고
    storageStock!: 3000,
    //가용재고
    availableStock!: 3200,
    //전마감
    fullClosing!: '전마감',
    //보관검수량
    inspection!: 3000,
    //정상
    normal!: 2500,
    //샘플
    sample!: '샘플',
    //파포
    papo!: '파포',
    //서비스
    service!: '서비스',
    //반품
    return!: '반품완료',
    //교환
    exchange!: '교환완료',
    //전배
    evangelism!: '전배',
    //보관검수
    storageInspection!: '보관검수 완료',
    //기검수
    inspector!: '기검수 완료',
    //생산
    produce!: '생산 완료',
    //정상
    normal2!: 3000,
    //샘플
    sample2!: '샘플',
    //서비스
    service2!: '서비스',
    //교환
    exchange2!: '교환완료',
    //수배
    wanted!: '수배',
    //실재고
    actualStock!: 3500,
    //회계재고
    accountInventory!: 4000,
    //검수요청량
    insepctionReq!: 4500,
    //검수된량
    inspectAmount!: 5000,
  },
  {
    //제품구분
    productCategory!: '원예',
    //제품
    product!: '골드측조',
    //포장
    packaging!: '20KG 표준백',
    //현재고
    nowStock!: 3200,
    //고내재고
    storageStock!: 5000,
    //가용재고
    availableStock!: 2200,
    //전마감
    fullClosing!: '전마감',
    //보관검수량
    inspection!: 3000,
    //정상
    normal!: 4500,
    //샘플
    sample!: '샘플',
    //파포
    papo!: '파포',
    //서비스
    service!: '서비스',
    //반품
    return!: '반품완료',
    //교환
    exchange!: '교환완료',
    //전배
    evangelism!: '전배',
    //보관검수
    storageInspection!: '보관검수 완료',
    //기검수
    inspector!: '기검수 완료',
    //생산
    produce!: '생산 완료',
    //정상
    normal2!: 3000,
    //샘플
    sample2!: '샘플',
    //서비스
    service2!: '서비스',
    //교환
    exchange2!: '교환완료',
    //수배
    wanted!: '수배',
    //실재고
    actualStock!: 3500,
    //회계재고
    accountInventory!: 4000,
    //검수요청량
    insepctionReq!: 5500,
    //검수된량
    inspectAmount!: 2000,
  },
];

//콤보박스
export class Product {
  ID!: number;
  Name!: string;
}

const simpleProducts: string[] = [
  '서울점',
  '용인점',
];



@Injectable()
export class Service {
  getEmployees() {
    return employees;
  }
  getSimpleProducts(): string[] {
    return simpleProducts;
  }



}
