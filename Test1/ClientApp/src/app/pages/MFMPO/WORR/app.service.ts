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


//사용자재정보
export class MaterialList {
  //오더번호
  AUFNR?: string;
  //순번
  RSNUM?: string;
  //자재번호
  MATNR?: string;
  //의뢰수량
  QTY_REQ?: number;
  //승인수량
  QTY_CON?: number;
}

//고장정보
export class FaultInfo {
  //오더번호
  AUFNR?: string;
  //순번
  QMNUM?: string;
  //요청일
  FENUM?: string;
  //승인일
  URNUM?: string;
  //전기일
  FEKAT?: string;
  //구매문서번호
  FECOD?: string;
  //회계전표번호
  FEVER?: string;
  //공급업체
  OTKAT?: string;
  //회계연도
  OTGRP?: string;
  //상태
  OTEIL?: string;
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
  //오더번호
  QMNUM?: string;
  //순번
  MANUM?: string;
  //요청일
  FENUM?: string;
  //승인일
  MNGRP?: string;
  //전기일
  MNCOD?: string;
  //구매문서번호
  MATXT?: string;
  //회계전표번호
  AACSL?: string;
  //공급업체
  SUPPL?: string;
  //회계연도
  FYFCY?: string;
  //상태
  STATE?: string;
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

const MaterialLists: MaterialList[] = [
  {
    AUFNR: '4000102',
    RSNUM: '216',
    MATNR: 'ERSA-001',
    QTY_REQ: 1,
    QTY_CON: 0,
  },
  {
    AUFNR: '4000102',
    RSNUM: '216',
    MATNR: 'M1300CH-014',
    QTY_REQ: 2,
    QTY_CON: 0,
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
    AACSL: '1234',
    SUPPL: 'AAAA',
    FYFCY: '2022',
    STATE: '좋음'
  },
  {
    QMNUM: '10000066',
    MANUM: '2',
    FENUM: '1',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL02',
    MATXT: '해결2',
    AACSL: '4568',
    SUPPL: 'BBBB',
    FYFCY: '2022',
    STATE: '나쁨'
  },
  {
    QMNUM: '10000066',
    MANUM: '3',
    FENUM: '1',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL03',
    MATXT: '해결3',
    AACSL: '8568',
    SUPPL: 'CCCC',
    FYFCY: '2022',
    STATE: '보통'
  },
  {
    QMNUM: '10000066',
    MANUM: '4',
    FENUM: '1',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL04',
    MATXT: '해결4',
    AACSL: '6123',
    SUPPL: 'DDDD',
    FYFCY: '2022',
    STATE: '좋음'
  },
  {
    QMNUM: '10000066',
    MANUM: '5',
    FENUM: '',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL11',
    MATXT: '해결100',
    AACSL: '7235',
    SUPPL: 'EEEE',
    FYFCY: '2022',
    STATE: '보통'
  },
  {
    QMNUM: '10000066',
    MANUM: '6',
    FENUM: '1',
    MNGRP: 'PM-ALL',
    MNCOD: 'AL05',
    MATXT: '',
    AACSL: '8641',
    SUPPL: 'FFFF',
    FYFCY: '2022',
    STATE: '좋음'
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
}
