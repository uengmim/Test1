import { Injectable } from '@angular/core';

//데이터 정보
export class Employee {
  //출하일자
  shipDate!: string;
  //출하지
  shipPlace!: string;
  //번호
  number!: number;
  //출하요청번호
  shipNumber!: string;
  //지사
  prefect!: string;
  //주문처
  whereOrder!: string;
  //약명
  abbreviation!: string;
  //관할대리점
  competentAgency!: string;
  //도착지
  destination!: string;
  //대분류
  mainCategory!: string;
  //제품명
  productName!: string;
  //포장
  packaging!: string;
  //출하량(포)
  shipmentPack!: number;
  //출하량(톤)
  shipmentTon!: number;
  //배송전표번호
  shipSlipNumber!: string;
  //대분류
  mainCategory2!: string;
  //검수번호
  inspectionNumber!: string;
  //검수일자
  inspectionDate!: string;
  //검수구분
  inspectionClassification!: string;
  //제품명
  productName2!: string;
  //포장
  packaging2!: string;
  //검수량(포)
  inspectionPack!: number;
  //검수량(톤)
  inspectionTon!: number;
  //단가
  unitPrice!: number;
  //금액
  amount!: number;
  //차량번호
  carNumber!: string;
  //기사
  driver!: string;
  //차량구분
  vehicleClassification!: string;
  //기본/분산
  basicDistributed!: string;
  //운송사(1차)
  carrier1!: string;
  //운송사(2차)
  carrier2!: string;
  //우편번호
  zipCode!: number;
  //착지(출하지)
  landing!: string;
  //출고지
  releasePlace!: string;
  //거래처
  account!: string;
  //파렛트
  pallet!: string;
  //인수도
  takeoverDegree!: string;
  //매입코드
  purchaseCode!: string;
  //세무구분
  taxClass!: string;
  //시군
  city!: string;
  //거리
  distance!: string;
  //납품단가
  deliveryPrice!: number;
  //사업장코드
  businessCode!: string;
  //주문구분
  orderClass!: string;
  //실출고지
  releaseNotice!: string;
  //본/지소
  headOffice!: string;
  //특기사항
  remarks!: string;
  //남해제품
  namhaeProduct!: string;
  //남해
  namhae!: string;
  //농협
  nh!: string;
}

const employees: Employee[] = [
  {
    //출하일자
    shipDate: '2022-05-05',
    //출하지
    shipPlace: '애월항(출)',
    //번호
    number: 405,
    //출하요청번호
    shipNumber: '2022-IKC-001092',
    //지사
    prefect: '제주',
    //주문처
    whereOrder: '제주대리점',
    //약명
    abbreviation: '제주(대)',
    //관할대리점
    competentAgency: '제주(대)',
    //도착지
    destination: '제주감귤농협 애월점',
    //대분류
    mainCategory: '화학',
    //제품명
    productName: '염화관리(MOP)',
    //포장
    packaging: '0020A',
    //출하량(포)
    shipmentPack: 20,
    //출하량(톤)
    shipmentTon: 1,
    //배송전표번호
    shipSlipNumber: '122-0432-3253',
    //대분류
    mainCategory2: '일반화학',
    //검수번호
    inspectionNumber: '88089-901-0822',
    //검수일자
    inspectionDate: '2022-08-01',
    //검수구분
    inspectionClassification: '검수완료',
    //제품명
    productName2: '골드측조',
    //포장
    packaging2: '0020A',
    //검수량(포)
    inspectionPack: 20,
    //검수량(톤)
    inspectionTon: 0.40,
    //단가
    unitPrice: 10000,
    //금액
    amount: 10000,
    //차량번호
    carNumber: '85너 2050',
    //기사
    driver: '채승민',
    //차량구분
    vehicleClassification: '아반떼',
    //기본/분산
    basicDistributed: '기본/분산',
    //운송사(1차)
    carrier1: '쿠팡',
    //운송사(2차)
    carrier2: '쿠팡',
    //우편번호
    zipCode: 92424,
    //착지(출하지)
    landing: '제주',
    //출고지
    releasePlace: '제주',
    //거래처
    account: '제주점',
    //파렛트
    pallet: '파렛트',
    //인수도
    takeoverDegree: '인수도',
    //매입코드
    purchaseCode: '11-111',
    //세무구분
    taxClass: '비관세',
    //시군
    city: '제주시',
    //거리
    distance: '1000km',
    //납품단가
    deliveryPrice: 10000,
    //사업장코드
    businessCode: '22-15',
    //주문구분
    orderClass: '주문완료',
    //실출고지
    releaseNotice: '제주도',
    //본/지소
    headOffice: '제주도',
    //특기사항
    remarks: '',
    //남해제품
    namhaeProduct: '남해제품',
    //남해
    namhae: '남해',
    //농협
    nh: '농협',
  },
  {
    //출하일자
    shipDate: '2022-04-05',
    //출하지
    shipPlace: '애월항(출)',
    //번호
    number: 406,
    //출하요청번호
    shipNumber: '2021-IKC-001092',
    //지사
    prefect: '여수',
    //주문처
    whereOrder: '여수대리점',
    //약명
    abbreviation: '여수(대)',
    //관할대리점
    competentAgency: '여수(대)',
    //도착지
    destination: '여수농협 여수점',
    //대분류
    mainCategory: '화학',
    //제품명
    productName: '염화관리(MOP)',
    //포장
    packaging: '0020B',
    //출하량(포)
    shipmentPack: 200,
    //출하량(톤)
    shipmentTon: 10,
    //배송전표번호
    shipSlipNumber: '111-0432-3253',
    //대분류
    mainCategory2: '일반화학',
    //검수번호
    inspectionNumber: '88822-901-0822',
    //검수일자
    inspectionDate: '2022-08-01',
    //검수구분
    inspectionClassification: '검수완료',
    //제품명
    productName2: '골드측조',
    //포장
    packaging2: '0020B',
    //검수량(포)
    inspectionPack: 200,
    //검수량(톤)
    inspectionTon: 2,
    //단가
    unitPrice: 100000,
    //금액
    amount: 100000,
    //차량번호
    carNumber: '85가 1050',
    //기사
    driver: '김인성',
    //차량구분
    vehicleClassification: '아반떼',
    //기본/분산
    basicDistributed: '기본/분산',
    //운송사(1차)
    carrier1: '서울점',
    //운송사(2차)
    carrier2: '서울점',
    //우편번호
    zipCode: 92424,
    //착지(출하지)
    landing: '여수',
    //출고지
    releasePlace: '여수',
    //거래처
    account: '여수점',
    //파렛트
    pallet: '파렛트',
    //인수도
    takeoverDegree: '인수도',
    //매입코드
    purchaseCode: '11-121',
    //세무구분
    taxClass: '비관세',
    //시군
    city: '여수시',
    //거리
    distance: '10km',
    //납품단가
    deliveryPrice: 1000000,
    //사업장코드
    businessCode: '22-16',
    //주문구분
    orderClass: '주문완료',
    //실출고지
    releaseNotice: '여수',
    //본/지소
    headOffice: '여수',
    //특기사항
    remarks: '',
    //남해제품
    namhaeProduct: '남해제품',
    //남해
    namhae: '남해',
    //농협
    nh: '농협',
  },
  {
    //출하일자
    shipDate: '2022-06-07',
    //출하지
    shipPlace: '애월항(출)',
    //번호
    number: 407,
    //출하요청번호
    shipNumber: '2011-IKC-001092',
    //지사
    prefect: '용인',
    //주문처
    whereOrder: '용인대리점',
    //약명
    abbreviation: '용인(대)',
    //관할대리점
    competentAgency: '용인(대)',
    //도착지
    destination: '용인농협 처인점',
    //대분류
    mainCategory: '화학',
    //제품명
    productName: '염화관리(MOP)',
    //포장
    packaging: '0020C',
    //출하량(포)
    shipmentPack: 200,
    //출하량(톤)
    shipmentTon: 10,
    //배송전표번호
    shipSlipNumber: '123-0432-3253',
    //대분류
    mainCategory2: '일반화학',
    //검수번호
    inspectionNumber: '33212-901-0822',
    //검수일자
    inspectionDate: '2022-07-01',
    //검수구분
    inspectionClassification: '검수완료',
    //제품명
    productName2: '골드측조',
    //포장
    packaging2: '0020C',
    //검수량(포)
    inspectionPack: 200,
    //검수량(톤)
    inspectionTon: 20,
    //단가
    unitPrice: 10000,
    //금액
    amount: 10000,
    //차량번호
    carNumber: '81너 1233',
    //기사
    driver: '강민호',
    //차량구분
    vehicleClassification: '아반떼',
    //기본/분산
    basicDistributed: '기본/분산',
    //운송사(1차)
    carrier1: '용인점',
    //운송사(2차)
    carrier2: '용인점',
    //우편번호
    zipCode: 92414,
    //착지(출하지)
    landing: '용인',
    //출고지
    releasePlace: '용인',
    //거래처
    account: '용인점',
    //파렛트
    pallet: '파렛트',
    //인수도
    takeoverDegree: '인수도',
    //매입코드
    purchaseCode: '11-121',
    //세무구분
    taxClass: '비관세',
    //시군
    city: '제주시',
    //거리
    distance: '10km',
    //납품단가
    deliveryPrice: 1000,
    //사업장코드
    businessCode: '22-11',
    //주문구분
    orderClass: '주문완료',
    //실출고지
    releaseNotice: '용인',
    //본/지소
    headOffice: '용인',
    //특기사항
    remarks: '',
    //남해제품
    namhaeProduct: '남해제품',
    //남해
    namhae: '남해',
    //농협
    nh: '농협',
  },
];

//콤보박스
export class Product {
  ID!: number;
  Name!: string;
}

const simpleProducts: string[] = [
  '서울',
  '용인',
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
