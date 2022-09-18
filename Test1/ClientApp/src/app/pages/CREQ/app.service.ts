import { Injectable } from '@angular/core';


export class Datainq {
  //주문번호
  OrderNum!: number;
  //주문일자
  OrderDate!: string;
  //출고사업장
  FWBs!: string;
  //사업장코드
  BsCod!: string;
  //도칙사업장
  DCBs!: string;
  //제품코드
  PrCod!: string;
  //제품명
  PrName!: string;
  //수량
  Quantity!: number;
  //단가
  UnitPri!: number;
  //금액
  Amount!: number;
  //비고
  Note!: string;
}
export class Sum {
  //담보합계
  totalColl!: number;
  //부동산
  estate!: number;
  //질권
  pledge!: number;
  //보증보험
  suretyIns!: number;
  //가수금
  surplusMoney!: number;
  //채권합계
  totalBond!: number;
  //외상매출
  accReceivable!: number;
  //미수금
  outstanding!: number;
  //보유재고
  invenRetained!: number;
  //주문승인물량
  orderAppQuan!: number;
  //당하출하(화공)
  sameTimShip!: number;
}
const Summary: Sum = {
  totalColl: 1242124,
  estate: 521312,
  pledge: 5324,
  suretyIns: 123124,
  surplusMoney: 44654,
  totalBond: 954353,
  accReceivable: 453,
  outstanding: 645,
  invenRetained: 64,
  orderAppQuan: 345,
  sameTimShip: 6777
}
const datainq: Datainq[] = [{
    OrderNum: 1,
    OrderDate: '2022/08/22',
    FWBs: 'ISTN',
    BsCod: 'ISTN-1',
    DCBs: 'SEOUL',
    PrCod: 'A001',
    PrName: '컴퓨터',
    Quantity: 3,
    UnitPri: 5000,
    Amount: 6000,
    Note: ''
  },
  {
    OrderNum: 2,
    OrderDate: '2022/08/22',
    FWBs: 'ISTN',
    BsCod: 'ISTN-1',
    DCBs: 'SEOUL',
    PrCod: 'A002',
    PrName: '키보드',
    Quantity: 5,
    UnitPri: 2000,
    Amount: 4000,
    Note: ''
  }
]



const clients: string[] = [
  '영업관리담당',
  '생산관리담당',
  '운송관리담당'

  ];




@Injectable()
export class Service {
  getDatainq() {
    return datainq;
  }


  getclient(): string[] {
    return clients;
  }
  getsum() {
    return Summary;
  }
}
