import { Injectable } from '@angular/core';

export class Employee {
  //ID
  ID!: number;
  //출고일자
  releaseDate!: string;
  //출고지
  releasePlace!: string;
  //관할지사
  competentBranch!: string;
  //주문처
  orderCompany!: string;
  //배송처
  shippingCompnay!: string;
  //배송전표
  deliverySlip!: string;
  //제품구분
  productCategory!: string;
  //제품
  product!: string;
  //출고수량
  releaseNumber!: number;
  //출고톤
  releaseTon!: number;
  //전송사태
  transmissionState!: string;
  //검수상태
  inspectionState!: string;
  //삭제여부
  delete!: string;
  //차량번호
  carNumber!: string;
  //하차방법
  quit!: string;
  //도서구분
  bookClass!: string;
  //농협제품
  nhProduct!: string;
  //농협사무소
  nhOffice!: string;
  //인수도구분
  takeover!: string;
  //검수번호
  inspectionNumber!: number;
  //검수일자
  inspectionDate!: string;
  //검수수량
  inspectionQuantity!: number;
  //검수단가
  inspectionPrice!: number;
  //공급가
  supplyPrice!: number;
  //P-수량
  pQuantity!: number;
  //W-수량
  wQuantity!: number;
  //세무구분
  tax!: string;
  //관할대리
  jurisdiction!: string;
  //시군명
  address!: string;
  //주문구분
  orderClass!: string;
  //운송사
  carrier!: string;
  //담당자
  manager!: string;
  //비고
  note!: string;
  //CUST
  cust!: string;
  //DEST
  dest!: string;
  //PROD
  prod!: string;
  //농협코드
  nhCode!: string;
  //주문번호
  orderNumber!: number;
  //출하요청
  shipmentReq!: string;
  //order
  order!: string;
  //사번
  companyNumber!: number;
  //color
  color!: string;
  //lock
  lock!: string;
  //전표번호
  slipNumber!: number;
}

export class Task {
  //ID
  ID!: number;
  //출하지
  shipmentPlace!: string;
  //출하일자
  shipmentDate!: string;
  //순번
  turn!: string;
  //지사
  prefect!: string;
  //거래처명
  accountName!: string;
  //도착지
  destination!: string;
  //제품
  product!: string;
  //포장
  packaging!: string;
  //주문량
  orderQuantity!: string;
  //출고량
  releaseVolume!: string;
  //주문구분
  orderClass!: string;
  //인수여부
  takeOver!: string;
  //주문번호
  orderNumber!: string;
  //출하요청번호
  shipmentReq!: string;
  //배송예정서번호
  dsNumber!: string;
  //검수상태(출하)
  shipmentInspectionState!: string;
  //검수상태(매입)
  purchaseInspectionState!: string;
  //검수일자
  inspectionDate!: string;
  //검수물량
  inspectionQuantity!: string;
  //검수FLAG
  inspectionFlag!: string;
  //검수상태
  inspectionState!: string;
  //차량번호
  carNumber!: string;
  //기사
  driver!: string;
  //비고
  note!: string;
  //출고지
  releasePlace!: string;
  //지사장승인
  managerApproval!: string;
  //EmployeeID
  EmployeeID!: number;
}

export class OrderInfo {
  //주문번호
  orderNumber!: string;
  //주문일자
  orderDate!: string;
  //제품명
  productName!: string;
  //주문처
  whereOrder!: string;
  //운송사
  carrier!: string;
  //납기일자
  deliveryDate!: string;
  //포장명
  packName!: string;
  //출고지
  shipPlace!: string;
  //주문구분
  orderClass!: string;
  //수량(포)
  pack!: string;
  //도착지
  destination!: string;
  //특기사항
  remarks!: string;
  //승인구분
  approval!: string;
  //수량(톤)
  ton!: string;
  //승인자
  approver!: string;
}

export class Management {
  //전표코드
  slipCode!: string;
  //농협코드
  nhCode!: string;
  //농협이름
  nhName!: string;
  //제품코드
  prductCode!: string;
  //농협제품
  nhProduct!: string;
  //대분류
  mainCategory!: string;
  //계통구분
  phylogeny!: string;
  //주관사업장
  hostBusiness!: string;
  //응답코드
  reponseCode!: string;
  //응답결과
  responseResult!: string;
  //사업구분
  businessClass!: string;
  //세무구분
  taxClass!: string;
  //검수여부
  inspection!: string;
  //검수일자
  inspectionDate!: string;
  //거래구분
  transClass!: string;
  //수량
  Quantity!: string;
  //단가
  unitPrice!: string;
  //금액
  amount!: string;
  //부가세
  vat!: string;
  //검수상태
  inspectionState!: string;
  //삭제여부
  deleteWhether!: string;
  //전송상태
  transState!: string;
  //등록구분
  registration!: string;
  //공급처
  supply!: string;
  //수주처
  order!: string;
  //정산처
  calculate!: string;
  //비고(남해+1)
  note!: string;
  //인수도구분
  division!: string;
  //인수여부
  whether!: string;
}

const employees: Employee[] = [
  {
    ID: 1,
    releaseDate: '2020-05-16',
    releasePlace: '용인',
    competentBranch: '아이에스티엔',
    orderCompany: '여수점',
    shippingCompnay: '여수점',
    deliverySlip: '배송',
    productCategory: '완제품',
    product: '화물차',
    releaseNumber: 100,
    releaseTon: 10,
    transmissionState: '전송완료',
    inspectionState: '검수완료',
    delete: '삭제',
    carNumber: '경기85가 2020',
    quit: '하차',
    bookClass: '상',
    nhProduct: 'O',
    nhOffice: '용인점',
    takeover: 'O',
    inspectionNumber: 1,
    inspectionDate: '2020-05-20',
    inspectionQuantity: 10,
    inspectionPrice: 10000000,
    supplyPrice: 1000000,
    pQuantity: 10,
    wQuantity: 10,
    tax: 'X',
    jurisdiction: 'O',
    address: '용인시 처인구',
    orderClass: '주문완료',
    carrier: '여수점',
    manager: '홍인호',
    note: 'X',
    cust: 'cust',
    dest: 'dest',
    prod: 'prod',
    nhCode: '1110011',
    orderNumber: 1,
    shipmentReq: 'O',
    order: 'O',
    companyNumber: 12,
    color: 'blue',
    lock: 'lock',
    slipNumber: 11,
  },
  {
    ID: 2,
    releaseDate: '2020-04-16',
    releasePlace: '서울',
    competentBranch: '아이에스티엔',
    orderCompany: '안동점',
    shippingCompnay: '안동점',
    deliverySlip: '배송',
    productCategory: '완제품',
    product: '화물차',
    releaseNumber: 1000,
    releaseTon: 100,
    transmissionState: '전송완료',
    inspectionState: '검수완료',
    delete: '삭제',
    carNumber: '경기85가 1211',
    quit: '하차',
    bookClass: '상',
    nhProduct: 'O',
    nhOffice: '용인점',
    takeover: 'O',
    inspectionNumber: 1,
    inspectionDate: '2020-04-20',
    inspectionQuantity: 10,
    inspectionPrice: 10000000,
    supplyPrice: 1000000,
    pQuantity: 10,
    wQuantity: 10,
    tax: 'X',
    jurisdiction: 'O',
    address: '용인시 처인구',
    orderClass: '주문완료',
    carrier: '안동점',
    manager: '김호열',
    note: 'X',
    cust: 'cust',
    dest: 'dest',
    prod: 'prod',
    nhCode: '1110011',
    orderNumber: 2,
    shipmentReq: 'O',
    order: 'O',
    companyNumber: 13,
    color: 'blue',
    lock: 'lock',
    slipNumber: 12,
  },
  {
    ID: 3,
    releaseDate: '2020-07-15',
    releasePlace: '용인',
    competentBranch: '아이에스티엔',
    orderCompany: '서울점',
    shippingCompnay: '서울점',
    deliverySlip: '배송',
    productCategory: '완제품',
    product: '화물차',
    releaseNumber: 1000,
    releaseTon: 100,
    transmissionState: '전송완료',
    inspectionState: '검수완료',
    delete: '삭제',
    carNumber: '경기81너 1220',
    quit: '하차',
    bookClass: '상',
    nhProduct: 'O',
    nhOffice: '서울점',
    takeover: 'O',
    inspectionNumber: 1,
    inspectionDate: '2020-05-20',
    inspectionQuantity: 10,
    inspectionPrice: 100000,
    supplyPrice: 10000,
    pQuantity: 10,
    wQuantity: 10,
    tax: 'X',
    jurisdiction: 'O',
    address: '용인시 처인구',
    orderClass: '주문완료',
    carrier: '서울점',
    manager: '송민호',
    note: 'X',
    cust: 'cust',
    dest: 'dest',
    prod: 'prod',
    nhCode: '1110011',
    orderNumber: 1,
    shipmentReq: 'O',
    order: 'O',
    companyNumber: 14,
    color: 'blue',
    lock: 'lock',
    slipNumber: 15,
  },
];

const tasks: Task[] = [
  {
    ID: 1,
    shipmentPlace: '용인',
    shipmentDate: '2020-05-05',
    turn: '1',
    prefect: '아이에스티엔',
    accountName: '삼성',
    destination: '성남',
    product: '컴퓨터',
    packaging: '진공파장',
    orderQuantity: '100',
    releaseVolume: '100',
    orderClass: '주문완료',
    takeOver: '인수완료',
    orderNumber: '10',
    shipmentReq: '11',
    dsNumber: '1',
    shipmentInspectionState: '검수완료',
    purchaseInspectionState: '검수완료',
    inspectionDate: '2021-01-01',
    inspectionQuantity: '100',
    inspectionFlag: 'FLAG',
    inspectionState: '검수완료',
    carNumber: '82너 2050',
    driver: '김영호',
    note: 'X',
    releasePlace: '서울',
    managerApproval: '승인',
    EmployeeID: 1,
  },
];

const orderInfo: OrderInfo = {
    orderNumber!: '111011',
    orderDate!: '2022-11-11',
    productName!: 'abcd',
    whereOrder!: '삼성',
    carrier!: '쿠팡',
    deliveryDate!: '2022-11-25',
    packName!:'AB00',
    shipPlace!: '용인',
    orderClass!: '주문완료',
    pack!: '10' ,
    destination!: '서울',
    remarks!: '없음',
    approval!: '승인완료',
    ton!: '10',
    approver!: '홍인호',
  }

const management: Management = {
  slipCode!: '120010110',
  nhCode!: '808088044',
  nhName!: '강진농업협동조합',
  prductCode!: '212425661',
  nhProduct!: '엔케이플러스인',
  mainCategory!: '원예용비료',
  phylogeny!: '본부계통',
  hostBusiness!: '자재부(구매)',
  reponseCode!: '',
  responseResult!: '',
  businessClass!: '수탁매취',
  taxClass!: '영세',
  inspection!: '매입',
  inspectionDate!: '2022-08-03',
  transClass!: '매입',
  Quantity!: '360',
  unitPrice!: '16,030',
  amount!: '5,770,800',
  vat!: '0',
  inspectionState!: '검수완료',
  deleteWhether!: '정상',
  transState!: '전송완료',
  registration!: '주문등록',
  supply!: '2910000',
  order!: '2910000',
  calculate!: '29100000',
  note!: '',
  division!: '지역농협창고인수도',
  whether!: '예',
}






//콤보박스
export class Product {
  ID!: number;
  Name!: string;
}

const simpleProducts: string[] = [
  '영업관리담당',
  '주문관리담당',
];

const simpleProducts2: string[] = [
  '인수완료본',
  '인수미완료본',

];

const simpleProducts3: string[] = [
  '출하일자기준',
  '검수일자기준',
  '검수취소현황'
];




@Injectable()
export class Service {
  getSimpleProducts(): string[] {
    return simpleProducts;
  }
  getSimpleProducts2(): string[] {
    return simpleProducts2;
  }
  getSimpleProducts3(): string[] {
    return simpleProducts3;
  }
  getTasks() {
    return tasks;
  }
  getEmployees(): Employee[] {
    return employees;
  }
  getOrderInfo() {
    return orderInfo;
  }
  getMangement() {
    return management;
  }
}
