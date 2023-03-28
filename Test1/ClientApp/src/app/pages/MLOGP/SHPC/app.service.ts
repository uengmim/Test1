import { Injectable } from '@angular/core';

export class CarSeq {
  code!: string;
  name!: string;
}

const carSeq: CarSeq[] = [
  {
    code: "1",
    name: "1차운송사"
  },
  {
    code: "2",
    name: "2차운송사"
  }
]

export class CSpart {
  code!: string;
  name!: string;
}

const cspart: CSpart[] = [
  {
    code: "20",
    name: "화학"
  },
  {
    code: "30",
    name: "유류"
  }
]

export class HeaderData {
  VBELN!: string;
  POSNR!: string;
  ZMENGE2!: number;
  ZMENGE4!: number;
}

//유창정보
export class OilDepot {
  VBELN!: string;
  POSNR!: string;
  ZSHIPMENT_NO!: string;
  ZCARNO!: string;
  KUNAG!: string;
  VRKME!: string;
  //유창번호0~9
  C_PART!: string;
  //유창용량
  ZTANKLITER!: number;
  //지시수량
  N_ALLOC!: number;
  //출고수량
  N_CHUL!: number;
  S_START!: string;
  S_END!: string;
}

export class CarList {
  ZCARNO!: string;
  ZDERIVER1!: string;
  ZPHONE1!: string;
  ZCARTYPE1!: string;
  ZRFID!: string;
  ZCARTON!: number;
  ZWEIGHT1!: number;
  LIFNR!: string;
  ZOWNERNAME!: string;
}

export class CalculChem {
  MATNR!: string;
  TYPE!: string;
  VAL!: number;
}

const calculChem: CalculChem[] = [
  {
    MATNR: "B010030",
    TYPE: "API",
    VAL: 0
  },
  {
    MATNR: "B010040",
    TYPE: "API",
    VAL: 0
  },
  {
    MATNR: "B010050",
    TYPE: "VAL",
    VAL: 1
  },
  {
    MATNR: "B010060",
    TYPE: "VAL",
    VAL: 1
  },
  {
    MATNR: "B010080",
    TYPE: "VAL",
    VAL: 0.35
  },
  {
    MATNR: "B010080",
    TYPE: "VAL",
    VAL: 0.35
  },
  {
    MATNR: "B010090",
    TYPE: "VAL",
    VAL: 0.25
  },
  {
    MATNR: "B010100",
    TYPE: "VAL",
    VAL: 0.29
  },
  {
    MATNR: "B010110",
    TYPE: "VAL",
    VAL: 0.28
  },
  {
    MATNR: "B010120",
    TYPE: "VAL",
    VAL: 0.25
  },
]

@Injectable()
export class Service {
  getCarSeq(): CarSeq[] {
    return carSeq;
  }

  getCSpart(): CSpart[] {
    return cspart;
  }

  getCalculChem(): CalculChem[] {
    return calculChem;
  }
}
