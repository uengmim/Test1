import { Injectable } from '@angular/core';

//데이터 정보
export class OrderInfo {
  //ID
  ID!: number;
  //등록일자
  registDate!: string;
  //관할지사
  competentBranch!: string;
  //거래처
  account!: string;
  //대표자
  representative!: string;
  //사용유무
  use!: string;
  //비고
  note!: string;
  //팝업데이터(작성일자=등록일자, 거래처 = 업체명, 대표자=대표자)
  //확인자
  checker!: string;
  //자가차량
  privateVehicle!: string;
  //부지면적
  landArea!: string;
  //용차계약
  leaseAgreement!: string;
  //비축가능량
  stockpileAmount!: string;
  //지게차
  forkLift!: string;
  //부지소유
  landOwnership!: string;
  //1. 제품 보관 창고(그늘막)
  productStorage!: string;
  //야적
  barbarian!: string;
  //2. 고결/파포 수량
  integrtiy!: string;
  //3. 복포 작업 상태
  workState!: string;
  //4. 복포 상태(구벙, 이물질)
  state!: string;
  //5. 제품 먼지, 이물질 청결 상태
  cleanliness!: string;
  //6. 바닥 물고임이나 파인 곳
  floor!: string;
  //7. 차량 및 지게차 청결 상태
  vehicle!: string;
  //8. 비료 재고 차이
  fertilizer!: string;
  //9. 파렛트 재고 차이(KPP대사결과)
  palette!: string;
  //10. 제품 고결/흡습 상태
  moistureAbsorption!: string;
  //11. 판매가 어려운 정상 제품(10톤이상)
  hradSale!: string;
  //12. 민원 발생 내용 및 경과사항(발생시)
  coplain!: string;
  //13. 기타(수급포함) 건의 사항
  tendinous!: string;
}

const orderInfo: OrderInfo[] = [
  {
    //ID
    ID!: 1,
    //등록일자
    registDate!: '2022-09-03',
    //관할지사
    competentBranch!: '강원',
    //거래처
    account!: '원주(물)',
    //대표자
    representative!: '박기훈',
    //사용유무
    use!: '사용',
    //비고
    note!: '',
    //확인자
    checker!: '김하영',
    //자가차량
    privateVehicle!: '1톤-2대',
    //부지면적
    landArea!: '창고(그늘막):500평, 야적:200평',
    //용차계약
    leaseAgreement!: '',
    //비축가능량
    stockpileAmount!: '창고(비축량):100톤, 야적비축:300톤',
    //지게차
    forkLift!: '4대',
    //부지소유
    landOwnership!: '자가',
    //1. 제품 보관 창고(그늘막)
    productStorage!: '100톤',
    //야적
    barbarian!: '500톤',
    //2. 고결/파포 수량
    integrtiy!: '31톤',
    //3. 복포 작업 상태
    workState!: '양호',
    //4. 복포 상태(구벙, 이물질)
    state!: '양호',
    //5. 제품 먼지, 이물질 청결 상태
    cleanliness!: '양호',
    //6. 바닥 물고임이나 파인 곳
    floor!: '양호',
    //7. 차량 및 지게차 청결 상태
    vehicle!: '양호',
    //8. 비료 재고 차이
    fertilizer!: '양호',
    //9. 파렛트 재고 차이(KPP대사결과)
    palette!: '양호',
    //10. 제품 고결/흡습 상태
    moistureAbsorption!: '양호',
    //11. 판매가 어려운 정상 제품(10톤이상)
    hradSale!: '양호',
    //12. 민원 발생 내용 및 경과사항(발생시)
    coplain!: '양호',
    //13. 기타(수급포함) 건의 사항
    tendinous!: '양호',
  },
  {
    //ID
    ID!: 2,
    //등록일자
    registDate!: '2022-10-02',
    //관할지사
    competentBranch!: '강원',
    //거래처
    account!: '횡설(물,대)',
    //대표자
    representative!: '김기호',
    //사용유무
    use!: '사용',
    //비고
    note!: '',
    //확인자
    checker!: '김수영',
    //자가차량
    privateVehicle!: '3.5톤-1대',
    //부지면적
    landArea!: '창고(그늘막):10평, 야적:30평',
    //용차계약
    leaseAgreement!: '',
    //비축가능량
    stockpileAmount!: '창고(비축량):10톤, 야적비축:30톤',
    //지게차
    forkLift!: '3대',
    //부지소유
    landOwnership!: '자가',
    //1. 제품 보관 창고(그늘막)
    productStorage!: '10톤',
    //야적
    barbarian!: '30톤',
    //2. 고결/파포 수량
    integrtiy!: '15톤',
    //3. 복포 작업 상태
    workState!: '양호',
    //4. 복포 상태(구벙, 이물질)
    state!: '양호',
    //5. 제품 먼지, 이물질 청결 상태
    cleanliness!: '양호',
    //6. 바닥 물고임이나 파인 곳
    floor!: '양호',
    //7. 차량 및 지게차 청결 상태
    vehicle!: '양호',
    //8. 비료 재고 차이
    fertilizer!: '양호',
    //9. 파렛트 재고 차이(KPP대사결과)
    palette!: '양호',
    //10. 제품 고결/흡습 상태
    moistureAbsorption!: '양호',
    //11. 판매가 어려운 정상 제품(10톤이상)
    hradSale!: '양호',
    //12. 민원 발생 내용 및 경과사항(발생시)
    coplain!: '양호',
    //13. 기타(수급포함) 건의 사항
    tendinous!: '양호',

  },
  {
    //ID
    ID!: 3,
    //등록일자
    registDate!: '2022-10-11',
    //관할지사
    competentBranch!: '경기',
    //거래처
    account!: '용인(물)',
    //대표자
    representative!: '김성주',
    //사용유무
    use!: '사용',
    //비고
    note!: '',
    //확인자
    checker!: '백시형',
    //자가차량
    privateVehicle!: '3.5톤-1대',
    //부지면적
    landArea!: '창고(그늘막):10평, 야적:20평',
    //용차계약
    leaseAgreement!: '',
    //비축가능량
    stockpileAmount!: '창고(비축량):10톤, 야적비추기30톤',
    //지게차
    forkLift!: '5대',
    //부지소유
    landOwnership!: '자가',
    //1. 제품 보관 창고(그늘막)
    productStorage!: '10톤',
    //야적
    barbarian!: '20톤',
    //2. 고결/파포 수량
    integrtiy!: '31톤',
    //3. 복포 작업 상태
    workState!: '양호',
    //4. 복포 상태(구벙, 이물질)
    state!: '양호',
    //5. 제품 먼지, 이물질 청결 상태
    cleanliness!: '양호',
    //6. 바닥 물고임이나 파인 곳
    floor!: '양호',
    //7. 차량 및 지게차 청결 상태
    vehicle!: '양호',
    //8. 비료 재고 차이
    fertilizer!: '양호',
    //9. 파렛트 재고 차이(KPP대사결과)
    palette!: '양호',
    //10. 제품 고결/흡습 상태
    moistureAbsorption!: '양호',
    //11. 판매가 어려운 정상 제품(10톤이상)
    hradSale!: '양호',
    //12. 민원 발생 내용 및 경과사항(발생시)
    coplain!: '양호',
    //13. 기타(수급포함) 건의 사항
    tendinous!: '양호',

  },
];

//콤보박스
export class Product {
  ID!: number;
  Name!: string;
}

const simpleProducts: string[] = [
  '원주(물)',
  '횡성(물,대)',
  '용인(물)'
];


export class PriorityEntity {
  id!: number;

  text!: string;
}

const priorityEntities: PriorityEntity[] = [
  { id: 0, text: '양호' },
  { id: 1, text: '불량' },
];



@Injectable()
export class Service {
  getOrderInfo() {
    return orderInfo;
  }
  getSimpleProducts(): string[] {
    return simpleProducts;
  }
  getPriorityEntities(): PriorityEntity[] {
    return priorityEntities;
  }


}
