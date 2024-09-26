import { Injectable } from '@angular/core';


export class Product {
  GCODE?: string;

  GCODENM?: string;

  SCODE?: string;

  SCODENM?: string;
}

const product: Product[] = [
  { GCODE: 'G01', GCODENM: '그룹1', SCODE: 'S01', SCODENM: '코드1' },
  { GCODE: 'G01', GCODENM: '그룹1', SCODE: 'S02', SCODENM: '코드2' },
  { GCODE: 'G02', GCODENM: '그룹2', SCODE: 'S03', SCODENM: '코드3' },
  { GCODE: 'G02', GCODENM: '그룹2', SCODE: 'S04', SCODENM: '코드4' },
];

export class AppStatus {
  CODE?: string;
  NAME?: string;
}

const appStatus: AppStatus[] = [
  { CODE: "", NAME: "전체" },
  { CODE: "O", NAME: "작업요청 " },
  { CODE: "I", NAME: "검수요청" },
  { CODE: "C", NAME: "검수완료" }
];


//오더데이터
export class OrderData {
  //오더번호
  AUFNR?: string;
  //오더유형
  AUART?: string;
  //내역
  KTEXT?: string;
  //회사코드
  BUKRS?: string;
  //프랜트
  WERKS?: string;
  //플랜트명
  WERKS_DESC?: string;
  //사업영역
  GSBER?: string;
  //사업영역명
  GSBER_DESC?: string;
  //관리회계영역
  KOKRS?: string;
  //상태
  STAT?: string;
  //삭제플래그
  LOEKZ?: string;
  //요청부서
  INGPR?: string;
  //요청부서명
  INGPR_DESC?: string;
  //작업부서
  VAPLZ?: string;
  //작업부서명
  VAPLZ_DESC?: string;
  //릴리즈일자
  IDAT1?: Date;
  //기본시작일
  GSTRP?: Date;
  //기본종료일
  GLTRP?: Date;
  //통지번호
  QMNUM?: string;
  //설비번호
  EQUNR?: string;
  //설비명
  EQUNR_DESC?: string;
  //기능위치
  TPLNR?: string;
  //기능위치명
  TPLNR_DESC?: string;
  //도급업체
  PARNR?: string;
  //도급업체명
  PARNR_DESC?: string;
  //입력아이디
  ERNAM?: string;
  //입력자
  ERNAM_DESC?: string;
  //입력일
  ERDAT?: Date;
  //변경아이디
  AENAM?: string;
  //변경자
  AENAM_DESC?: string;
  //변경일
  AEDAT?: Date;

}

//오더내역
export class OrderInfo {
  //오더번호
  AUFNR?: string;
  //내역
  KURZTEXT?: string;
  //작업시간
  ARBEI?: number;
  //작업단위
  MEINH?: string;
  //작업자수
  ANZZL?: number;
}

//사용자재정보
export class MaterialList {
  //오더번호
  AUFNR?: string;
  //예약번호
  RSNUM?: string;
  //플랜트
  WERKS?: string;
  //저장위치
  LGORT?: string;
  //저장위치명
  LGOBE?: string;
  //자재코드
  MATNR?: string;
  //자재명
  MATNR_DESC?: string;
  //요청수량
  QTY_REQ?: number;
  //사용수량
  QTY_CON?: number;
  //반납수량
  QTY_REC?: number;
  //수량단위
  MEINS?: string;
}

//고장정보
export class FaultInfo {
  //오더번호
  AUFNR?: string;
  //통지번호
  QMNUM?: string;
  //품목번호
  FENUM?: string;
  //원인 일련번호
  URNUM?: string;
  //문제/결함
  FEKAT?: string;
  //손상코드
  FECOD?: string;
  //버전
  FEVER?: string;
  //카달로그유형
  OTKAT?: string;
  //코드그룹
  OTGRP?: string;
  //오브젝트부품
  OTEIL?: string;
  //문제
  FEGRP?: string;
  //원인코드
  URCOD?: string;
  //원인
  URTXT?: string;
}

//항목단가
export class ItemPrice {
  //오더번호
  AUFNR?: string;
  //항목번호
  PAYITEM?: string;
  //항목명
  PAYITEM_DESC?: string;
  //요청수량
  QTY_REQ?: number;
  //승인수량
  QTY_CON?: number;
  //검수상태
  STAT?: string;
  //수량단위
  MEINS?: string;
  //금액
  WRBTR?: number;
  //금액단위
  WAERS?: string;
}

//고장해결
export class TroubleshootingList {
  //통지번호
  QMNUM?: string;
  //순번
  MANUM?: string;
  //품목번호
  FENUM?: string;
  //액티비티 코드그룹
  MNGRP?: string;
  //액티비티 코드
  MNCOD?: string;
  //액티비티
  MATXT?: string;
}

//오더데이터 테스트데이터
const OrderDatas: OrderData[] = [{
  AUFNR: '4000044',
  AUART: 'PM10',
  KTEXT: 'TEST2',
  BUKRS: '1000',
  WERKS: '1000',
  WERKS_DESC: '남해화학 여수공장',
  GSBER: '1100',
  GSBER_DESC: '비료 화학',
  KOKRS: '1000',
  STAT: '',
  LOEKZ: '',
  INGPR: '421',
  INGPR_DESC: '',
  VAPLZ: 'PM200',
  VAPLZ_DESC: '',
  IDAT1: new Date('2022-08-09'),
  GSTRP: new Date('2022-08-09'),
  GLTRP: new Date('2022-08-09'),
  QMNUM: '10000041',
  EQUNR: '421-R-608',
  EQUNR_DESC: 'ROTARY GRANULATOR',
  TPLNR: '1000-31-1',
  TPLNR_DESC: 'SA#1공장',
  PARNR: '300007',
  PARNR_DESC: '외주공사',
  ERNAM: 'CON08',
  ERNAM_DESC: '전종기',
  ERDAT: new Date('2022-08-09'),
  AENAM: 'CON08',
  AENAM_DESC: '',
  AEDAT: new Date('2022-08-09'),
}, {
  AUFNR: '4000047',
  AUART: 'PM10',
  KTEXT: '',
  BUKRS: '1000',
  WERKS: '1000',
  WERKS_DESC: '남해화학 여수공장',
  GSBER: '1100',
  GSBER_DESC: '비료 화학',
  KOKRS: '1000',
  STAT: '',
  LOEKZ: '',
  INGPR: '421',
  INGPR_DESC: '',
  VAPLZ: 'PM200',
  VAPLZ_DESC: '',
  //IDAT1: ,
  //GSTRP: new Date(),
  GLTRP: new Date('2022-08-09'),
  QMNUM: '10000043',
  EQUNR: '421-R-608',
  EQUNR_DESC: 'ROTARY GRANULATOR',
  TPLNR: '1000-31-1',
  TPLNR_DESC: 'SA#1공장',
  PARNR: '300007',
  PARNR_DESC: '외주공사',
  ERNAM: 'CON08',
  ERNAM_DESC: '전종기',
  ERDAT: new Date('2022-08-09'),
  AENAM: 'CON08',
  AENAM_DESC: '',
  AEDAT: new Date('2022-08-09'),
}, {
  AUFNR: '4000102',
  AUART: 'PM10',
  KTEXT: 'TEST',
  BUKRS: '1000',
  WERKS: '1000',
  WERKS_DESC: '남해화학 여수공장',
  GSBER: '1100',
  GSBER_DESC: '비료 화학',
  KOKRS: '1000',
  STAT: '',
  LOEKZ: '',
  INGPR: '311',
  INGPR_DESC: '',
  VAPLZ: 'PM400',
  VAPLZ_DESC: '',
  IDAT1: new Date('2022-08-25'),
  GSTRP: new Date('2022-08-27'),
  GLTRP: new Date('2022-08-29'),
  QMNUM: '10000066',
  EQUNR: '116-GD-1921',
  EQUNR_DESC: 'AMMONIA GAS DETECTOR',
  TPLNR: '1000-31-1',
  TPLNR_DESC: 'SA#1공장',
  PARNR: '300007',
  PARNR_DESC: '외주공사',
  ERNAM: 'CON08',
  ERNAM_DESC: '전종기',
  ERDAT: new Date('2022-08-25'),
  AENAM: 'CON08',
  AENAM_DESC: '',
  AEDAT: new Date('2022-08-25'),
}
]

const orderInfo: OrderInfo = {
  AUFNR: '4000102',
  KURZTEXT: 'TEST',
  ARBEI: 0.0,
  MEINH: '시간',
  ANZZL: 0,
}

const MaterialLists: MaterialList[] = [
  {
    AUFNR: '4000102',
    RSNUM: '216',
    WERKS: '1000',
    LGORT: '4201',
    LGOBE: '저장품공정(Shop)창고',
    MATNR: 'ERSA-001',
    MATNR_DESC: 'ERSA-001',
    QTY_REQ: 1,
    QTY_CON: 0,
    QTY_REC: 0,
    MEINS: 'EA',
  },
  {
    AUFNR: '4000102',
    RSNUM: '216',
    WERKS: '1000',
    LGORT: '4000',
    LGOBE: '저장품 창고(공통)',
    MATNR: 'M1300CH-014',
    MATNR_DESC: 'ELEVATOR BUCKET CHAIN',
    QTY_REQ: 2,
    QTY_CON: 0,
    QTY_REC: 0,
    MEINS: 'LK',

  }
]

const FaultInfos: FaultInfo[] = [
  {
    AUFNR: '4000102',
    QMNUM: '10000066',
    FENUM: '1',
    URNUM: '1',
    FEKAT: 'C',
    FECOD: 'EL01',
    FEVER: '1',
    OTKAT: 'B',
    OTGRP: 'PM-110',
    OTEIL: '1101',
    FEGRP: 'PM-EL-H',
    URCOD: 'BA01',
    URTXT: '원인1',
  },
  {
    AUFNR: '4000102',
    QMNUM: '10000066',
    FENUM: '1',
    URNUM: '2',
    FEKAT: 'C',
    FECOD: 'EL01',
    FEVER: '1',
    OTKAT: 'B',
    OTGRP: 'PM-110',
    OTEIL: '1101',
    FEGRP: 'PM-EL-H',
    URCOD: 'BA02',
    URTXT: '원인2',

  },
  {
    AUFNR: '4000102',
    QMNUM: '10000066',
    FENUM: '1',
    URNUM: '3',
    FEKAT: 'C',
    FECOD: 'EL01',
    FEVER: '1',
    OTKAT: 'B',
    OTGRP: 'PM-110',
    OTEIL: '1101',
    FEGRP: 'PM-EL-H',
    URCOD: 'BA03',
    URTXT: '원인3',

  }
]

const ItemPrices: ItemPrice[] = [
]

const TroubleshootingLists: TroubleshootingList[] = [
  {
    QMNUM: '10000066',
    MANUM: '1',
    FENUM: '1',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL01',
    MATXT: '해결1',
  },
  {
    QMNUM: '10000066',
    MANUM: '2',
    FENUM: '1',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL02',
    MATXT: '해결2',
  },
  {
    QMNUM: '10000066',
    MANUM: '3',
    FENUM: '1',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL03',
    MATXT: '해결3',
  },
  {
    QMNUM: '10000066',
    MANUM: '4',
    FENUM: '1',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL04',
    MATXT: '해결4',
  },
  {
    QMNUM: '10000066',
    MANUM: '5',
    FENUM: '',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL11',
    MATXT: '해결100',
  },
  {
    QMNUM: '10000066',
    MANUM: '6',
    FENUM: '1',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL05',
    MATXT: '',
  }
]

@Injectable()
export class Service {

  getProduct() {
    return product;
  }

  getOrderData() {
    return OrderDatas;
  }

  getOrderInfo() {
  return orderInfo;
  }

  getMaterialList() {
    return MaterialLists;
  }

  getFaultInfo() {
    return FaultInfos;
  }

  getItemPrice() {
    return ItemPrices;
  }

  getTroubleshootingList() {
    return TroubleshootingLists;
  }

  getAppStatusList() {
    return appStatus;
  }
}
