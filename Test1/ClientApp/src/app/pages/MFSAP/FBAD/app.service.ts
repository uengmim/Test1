import { Injectable } from '@angular/core';

//데이터 정보
export class Employee {
  //ID
  ID!: number;
  //구분
  division!: string;
  //관할지사
  competentBracnh!: string;
  //주문처
  whereOrder!: string;
  //등록일자
  registrationDate!: string;
  //제품
  product!: string;
  //포장
  packaging!: string;
  //등록수량
  registeredQuantity!: number;
  //처리수량
  throughput!: number;
  //발생처
  origin!: string;
  //처리예정일
  processingDate!: string;
  //상태
  situation!: string;
  //비고
  note!: string;
  //차량번호
  carNumber!: string;
  //차종
  carType!: string;
  //기사
  driver!: string;
  //전화번호
  phoneNumber!: string;
  //승인
  approval!: string;
  //등록번호
  registrationNumber!: string;
  //순번
  turn!: number;
  //SECT
  sect!: string;
  //제품명
  productName!: string;
  //검수구분
  inspectionClass!: string;
  //도착지
  destination!: string;
  //등록구분
  registration!: string;
}

export class OrderInfo {
   //주문처
  whereOrder!: string;
  //제품명
  productName!: string;
  //발생장소
  origin!: string;
  //특기사항
  remarks!: string;
  //포장명
  packagingName!: string;
  //차량번호
  carNumber!: string;
  //등록일자
  registrationDate!: string;
  //등록수량
  registeredQuantity!: string;
  //기사명
  driver!: string;
  //생산/완료일
  dueDate!: string;
  //처리수량
  throughput!: string;
  //전화번호
  phoneNumber!: string;
  //완료여부
  completed!: string;
  //소분류
  subCategory!: string;
  //등록구분
  registration!: string;
  //고결성분
  integrityIngredient!: string;
  //대분류
  mainCategory!: string;
}

const employees: Employee[] =[
  {
    //ID
    ID!: 1,
    //구분
    division!: '농가배송',
    //관할지사
    competentBracnh!: '경북',
    //주문처
    whereOrder!: '(주)농협물류(안동)',
    //등록일자
    registrationDate!: '2022-08-03',
    //제품
    product!: '맞춤17호',
    //포장
    packaging!: '20KG 표준백',
    //등록수량
    registeredQuantity!: 28,
    //처리수량
    throughput!: 10000,
    //발생처
    origin!: '우표농협(구매처)',
    //처리예정일
    processingDate!: '2022-08-03',
    //상태
    situation!: '미처리',
    //비고
    note!: '농가배송',
    //차량번호
    carNumber!: '경북86거 5042',
    //차종
    carType!: 'Y',
    //기사
    driver!: '신현학',
    //전화번호
    phoneNumber!: '010-3331-2222',
    //승인
    approval!: '승인' ,
    //등록번호
    registrationNumber!: '12-11',
    //순번
    turn!: 2,
    //SECT
    sect!: 'sect',
    //제품명
    productName!: '골드측조',
    //검수구분
    inspectionClass!: '검수완료',
    //도착지
    destination!: '용인',
    //등록구분
    registration!: '등록'
  },
  {
    //ID
    ID!: 2,
    //구분
    division!: '농가배송',
    //관할지사
    competentBracnh!: '서울',
    //주문처
    whereOrder!: '(주)농협물류(서울)',
    //등록일자
    registrationDate!: '2022-09-03',
    //제품
    product!: '맞춤17호',
    //포장
    packaging!: '20KG 표준백',
    //등록수량
    registeredQuantity!: 289,
    //처리수량
    throughput!: 10,
    //발생처
    origin!: '우표농협(구매처)',
    //처리예정일
    processingDate!: '2022-03-03',
    //상태
    situation!: '미처리',
    //비고
    note!: '농가배송',
    //차량번호
    carNumber!: '경북86거 4332',
    //차종
    carType!: 'Y',
    //기사
    driver!: '김우형',
    //전화번호
    phoneNumber!: '010-1232-2242',
    //승인
    approval!: '승인',
    //등록번호
    registrationNumber!: '12-12',
    //순번
    turn!: 2,
    //SECT
    sect!: 'sect',
    //제품명
    productName!: '골드측조',
    //검수구분
    inspectionClass!: '검수완료',
    //도착지
    destination!: '서울',
    //등록구분
    registration!: '등록'
  },
  {
    //ID
    ID!: 3,
    //구분
    division!: '농가배송',
    //관할지사
    competentBracnh!: '천안',
    //주문처
    whereOrder!: '(주)농협물류(천안)',
    //등록일자
    registrationDate!: '2022-09-05',
    //제품
    product!: '맞춤17호',
    //포장
    packaging!: '20KG 표준백',
    //등록수량
    registeredQuantity!: 2892,
    //처리수량
    throughput!: 100,
    //발생처
    origin!: '우표농협(구매처)',
    //처리예정일
    processingDate!: '2022-09-13',
    //상태
    situation!: '미처리',
    //비고
    note!: '농가배송',
    //차량번호
    carNumber!: '경기86거 2422',
    //차종
    carType!: 'Y',
    //기사
    driver!: '김준형',
    //전화번호
    phoneNumber!: '010-2252-2222',
    //승인
    approval!: '승인',
    //등록번호
    registrationNumber!: '12-14',
    //순번
    turn!: 4,
    //SECT
    sect!: 'sect',
    //제품명
    productName!: '골드측조',
    //검수구분
    inspectionClass!: '검수완료',
    //도착지
    destination!: '천안',
    //등록구분
    registration!: '등록'
  },
]

const orderInfo: OrderInfo = {
  //주문처
  whereOrder!: '(주)농협물류(안동)',
  //제품명
  productName!: '맞춤17호',
  //발생장소
  origin!: '우표농협(구매처)',
  //특기사항
  remarks!: '22.1.24 영암 박성연 농가배송',
  //포장명
  packagingName!: '0020A',
  //차량번호
  carNumber!: '경북86거5042',
  //등록일자
  registrationDate!: '2022-12-16',
  //등록수량
  registeredQuantity!: '15',
  //기사명
  driver!: '김하영',
  //생산/완료일
  dueDate!: '2022-12-22',
  //처리수량
  throughput!: '0',
  //전화번호
  phoneNumber!: '010-2324-8475',
  //완료여부
  completed!: '완료',
  //소분류
  subCategory!: 'A',
  //등록구분
  registration!: '등록',
  //고결성분
  integrityIngredient!: '고결성분',
  //대분류
  mainCategory!: '농협'

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
    Name: '맞춤17호',
  },
  {
    ID: 2,
    Name: '골드측조',
  },
];

export class State3 {
  ID!: number;
  Name!: string;
}

const states3: State3[] = [
  {
    ID: 1,
    Name: '0020A',
  },
  {
    ID: 2,
    Name: '0020B',
  },
];

export class State4 {
  ID!: number;
  Name!: string;
}

const states4: State4[] = [
  {
    ID: 1,
    Name: '우표농협(구매처)',
  },
  {
    ID: 2,
    Name: '고촌농협 장곡지점',
  },
];

export class State5 {
  ID!: number;
  Name!: string;
}

const states5: State5[] = [
  {
    ID: 1,
    Name: '경북86거5042',
  },
  {
    ID: 2,
    Name: '경북86거1123',
  },
];

export class State6 {
  ID!: number;
  Name!: string;
}

const states6: State6[] = [
  {
    ID: 1,
    Name: '완료',
  },
  {
    ID: 2,
    Name: '미완료',
  },
];

export class State7 {
  ID!: number;
  Name!: string;
}

const states7: State7[] = [
  {
    ID: 1,
    Name: 'A',
  },
  {
    ID: 2,
    Name: 'B',
  },
];

export class State8 {
  ID!: number;
  Name!: string;
}

const states8: State8[] = [
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

export class State9 {
  ID!: number;
  Name!: string;
}

const states9: State9[] = [
  {
    ID: 1,
    Name: '전체',
  },
  {
    ID: 2,
    Name: '고결',
  },
  {
    ID: 3,
    Name: '파포',
  },
];


export class State10 {
  ID!: number;
  Name!: string;
}

const states10: State10[] = [
  {
    ID: 1,
    Name: '농협',
  },
  {
    ID: 2,
    Name: '물류기지',
  },
  {
    ID: 3,
    Name: '제품',
  },
  {
    ID: 4,
    Name: '기타',
  }
];

export class State11 {
  ID!: number;
  Name!: string;
}

const states11: State11[] = [
  {
    ID: 1,
    Name: '영업관리담당',
  },
  {
    ID: 2,
    Name: '제품관리담당',
  },
];


@Injectable()
export class Service {
  getEmployees() {
    return employees;
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

  getStates8() {
    return states8;
  }

  getStates9() {
    return states9;
  }

  getStates10() {
    return states10;
  }

  getStates11() {
    return states11;
  }

  getOrderInfo() {
    return orderInfo;
  }
}
