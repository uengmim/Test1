import { Injectable } from '@angular/core';


export class Datainq {
  //주문번호
  orderNum!: number;
  //주문일자
  orderDate!: string;
  //출고사업장
  releBusi!: string;
  //사업장코드
  busiCode!: string;
  //도칙사업장
  roughBusi!: string;
  //제품코드
  proCode!: string;
  //제품명
  proName!: string;
  //수량
  quant!: number;
  //단가
  unitPrice!: number;
  //금액
  price!: number;
  //비고
  note!: string;
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
  orderNum: 1,
  orderDate: '2022/08/22',
  releBusi: 'ISTN',
  busiCode: 'ISTN-1',
  roughBusi: 'SEOUL',
  proCode: 'A001',
  proName: '컴퓨터',
  quant: 3,
  unitPrice: 5000,
  price: 6000,
  note: ''
  },
  {
    orderNum: 2,
    orderDate: '2022/08/22',
    releBusi: 'ISTN',
    busiCode: 'ISTN-1',
    roughBusi: 'SEOUL',
    proCode: 'A002',
    proName: '키보드',
    quant: 5,
    unitPrice: 2000,
    price: 4000,
    note: ''
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
