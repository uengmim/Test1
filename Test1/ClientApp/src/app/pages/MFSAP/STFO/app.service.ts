import { Injectable } from '@angular/core';

//팔렛트유형
export class PalletType {
  code!: string;
  name!: string;
}

//하차정보
export class UnloadInfo {
  code!: string;
  name!: string;
}

//화물차종
export class TruckType {
  code!: string;
  name!: string;
}

//데이터 정보
export class Employee {
  //관할지사
  competentBranch!: string;
  //요청번호
  reqNum!: number;
  //주문처
  whereOrder!: string;
  //주문구분
  orderClass!: string;
  //제품
  product!: string;
  //포장
  packaging!: string;
  //주문량
  orderQuantity!: number;
  //생산량
  output!: number;
  //납기일자
  deliveryDate!: string;
  //도착지
  destination!: string;
  //실제운송사
  carrier!: string;
  //운송배정량
  quota!: string;
  ///출고된량
  releaseQuantity!: number;
  //배차량
  dispatchVehicle!: number;
  //배차번호
  dispatchNumber!: number;
  //인수도구분
  takeover!: string;
  //출고확인
  releaseConfirm!: string;
  //운송확인
  transit!: string;
  //용도
  purpose!: string;
  //비고
  note!: string;
  //FWDREQ_NUM
  fwdreqnum!: number;
  //대분류
  mainCategory!: string;
  //PROD
  prod!: string;
  //PACK
  pack!: string;
  //AGRI
  agri!: string;
  //출고
  release!: string;
  //배차증번호
  increaseNumber!: number;
}

//상세정보
export class OrderInfo {
  //주문번호
  orderNum!: string;
  //요청번호
  deliveryDate!: string;
  //주문구분
  orderClass!: string;
  //도착지
  destination!: string;
  //특기사항
  remarks!: string;
  //제품명
  productName!: string;
  //포장명
  packaging!: string;
  //상차
  car!: string;
  //운송
  transit!: string;
  //운송사
  carrier!: string;
  //주문수량
  orderQuantity!: string;
  //출고수량
  shipmentQuantity!: string;
  //차량번호
  carNUmber!: string;
  //차량종류
  carType!: string;
  //기사명
  driver!: string;
  //전화번호
  phoneNumber!: string;
  //원산지
  origin!: string;
  //출고일자
  releaseDate!: string;
  //팔렛트(P)
  palletP!: string;
  //팔렛트(W)
  palletW!: string;
  //추가포대량
  bagQuantity!: string;
  //인력하차량
  quitAmount!: string;
  //하차
  quit!: string;
  //용도
  purpose!: string;
  //출고자
  publisher!: string;
  //항차선택
  routeSelection!: string;
}

const pallettype: PalletType[] = [
  {
    code: "P",
    name: "플라스틱"
  },
  {
    code: "W",
    name: "목재"
  }]

const unloadinfo: UnloadInfo[] = [
  {
    code: "10",
    name: "기본"
  },
  {
    code: "20",
    name: "분산"
  }]

const trucktype: TruckType[] = [
  {
    code: "A1",
    name: "대형"
  },
  {
    code: "A2",
    name: "소형"
  },
  {
    code: "A3",
    name: "덤프"
  },
  {
    code: "A4",
    name: "택배"
  },
  {
    code: "B1",
    name: "화공탱크로리"
  },
  {
    code: "C1",
    name: "유류탱크로리"
  }]

const employees: Employee[] = [
  {
  //관할지사
  competentBranch!: '안동지점',
  //요청번호
  reqNum!: 1, 
  //주문처
  whereOrder!: '영업관리담당',
  //주문구분
  orderClass!: '주문완료',
  //제품
  product!: 'AB11',
  //포장
  packaging!: '20KG 표준백',
  //주문량
  orderQuantity!: 10,
  //생산량
  output!: 100,
  //납기일자
  deliveryDate!: '2022-09-22',
  //도착지
  destination!: '안동',
  //실제운송사
  carrier!: '아이에스티엔',
  //운송배정량
  quota!: '10',
  ///출고된량
  releaseQuantity!: 10,
  //배차량
  dispatchVehicle!: 2,
  //배차번호
  dispatchNumber!: 1211,
  //인수도구분
  takeover!: '인수',
  //출고확인
  releaseConfirm!: '출고완료',
  //운송확인
  transit!: '운송완료',
  //용도
  purpose!: '개인',
  //비고
  note!: '',
  //FWDREQ_NUM
  fwdreqnum!:11,
  //대분류
  mainCategory!: '농협',
  //PROD
  prod!: 'prod',
  //PACK
  pack!: 'pack',
  //AGRI
  agri!: 'agri',
  //출고
  release!: '출고완료',
  //배차증번호
  increaseNumber!: 11
  },
  {
    //관할지사
    competentBranch!: '여수지점',
    //요청번호
    reqNum!: 2,
    //주문처
    whereOrder!: '제품관리담당',
    //주문구분
    orderClass!: '주문완료',
    //제품
    product!: 'AB12',
    //포장
    packaging!: '20KG 표준백',
    //주문량
    orderQuantity!: 20,
    //생산량
    output!: 200,
    //납기일자
    deliveryDate!: '2022-08-22',
    //도착지
    destination!: '여수',
    //실제운송사
    carrier!: '아이에스티엔',
    //운송배정량
    quota!: '20',
    ///출고된량
    releaseQuantity!: 20,
    //배차량
    dispatchVehicle!: 4,
    //배차번호
    dispatchNumber!: 1212,
    //인수도구분
    takeover!: '인수',
    //출고확인
    releaseConfirm!: '출고완료',
    //운송확인
    transit!: '운송완료',
    //용도
    purpose!: '공용',
    //비고
    note!: '',
    //FWDREQ_NUM
    fwdreqnum!: 12,
    //대분류
    mainCategory!: '농협',
    //PROD
    prod!: 'prod',
    //PACK
    pack!: 'pack',
    //AGRI
    agri!: 'agri',
    //출고
    release!: '출고완료',
    //배차증번호
    increaseNumber!: 12
  },
  {
    //관할지사
    competentBranch!: '서울지점',
    //요청번호
    reqNum!: 3,
    //주문처
    whereOrder!: '제품관리담당',
    //주문구분
    orderClass!: '주문완료',
    //제품
    product!: 'AB11',
    //포장
    packaging!: '20KG 표준백',
    //주문량
    orderQuantity!: 10,
    //생산량
    output!: 10,
    //납기일자
    deliveryDate!: '2022-08-22',
    //도착지
    destination!: '서울',
    //실제운송사
    carrier!: '아이에스티엔',
    //운송배정량
    quota!: '10',
    ///출고된량
    releaseQuantity!: 10,
    //배차량
    dispatchVehicle!: 10,
    //배차번호
    dispatchNumber!: 1011,
    //인수도구분
    takeover!: '인수',
    //출고확인
    releaseConfirm!: '출고완료',
    //운송확인
    transit!: '운송완료',
    //용도
    purpose!: '공용',
    //비고
    note!: '',
    //FWDREQ_NUM
    fwdreqnum!: 13,
    //대분류
    mainCategory!: '농협',
    //PROD
    prod!: 'prod',
    //PACK
    pack!: 'pack',
    //AGRI
    agri!: 'agri',
    //출고
    release!: '출고완료',
    //배차증번호
    increaseNumber!: 13
  },
];

const orderInfo: OrderInfo = 
  {
    //주문번호
    orderNum!: '1',
    //납기일자
    deliveryDate!: '2022-09-22',
    //주문구분
    orderClass!: '주문완료',
    //도착지
    destination!: '안동',
    //특기사항
    remarks!: '없음',
    //제품명
    productName!: 'AB11',
    //포장명
    packaging!: '20KG 표준백',
    //상차
    car!: '상차완료',
    //운송
    transit!: '운송완료',
    //운송사
    carrier!: '아이에스티엔',
    //주문수량
    orderQuantity!: '10',
    //출고수량
    shipmentQuantity!: '10',
    //차량번호
    carNUmber!: '2050',
    //차량종류
    carType!: '중형',
    //기사명
    driver!: '김호연',
    //전화번호
    phoneNumber!: '010-2234-6366',
    //원산지
    origin!: '청주',
    //출고일자
    releaseDate!: '2022-09-22',
    //팔렛트(P)
    palletP!: '팔렛트(P)',
    //팔렛트(W)
    palletW!: '팔렛트(W)', 
    //추가포대량
    bagQuantity!: '1',
    //인력하차량
    quitAmount!: '10',
    //하차
    quit!: '하차완료',
    //용도
    purpose!: '개인', 
    //출고자
    publisher!: '김하영',
    //항차선택
    routeSelection!: '항차'
  }


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
  getOrderInfo() {
    return orderInfo;
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
  getPalletType() {
    return pallettype;
  }

  getUnloadInfo() {
    return unloadinfo;
  }

  getTruckType() {
    return trucktype;
  }
}
