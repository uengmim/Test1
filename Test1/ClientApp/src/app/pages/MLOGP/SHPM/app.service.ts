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

export class ShipStatus {
  code!: string;
  name!: string;
}

const shipStatus: ShipStatus[] = [
  {
    code: "30",
    name: "배차완료"
  },
  {
    code: "40",
    name: "출하지시"
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
export class ChemTRP {
  HWAMUL?: string;
  TANK?: string;
  RACK?: string;
  PIPE?: string;
}

const chemTRPList: ChemTRP[] = [
  {
    HWAMUL: "H98",
    TANK: "204",
    RACK: "06",
    PIPE: "6"
  },
  {
    HWAMUL: "H99",
    TANK: "204",
    RACK: "06",
    PIPE: "6"
  },
  {
    HWAMUL: "HB1",
    TANK: "109B",
    RACK: "05",
    PIPE: "8"
  },
  {
    HWAMUL: "I15",
    TANK: "109D",
    RACK: "05",
    PIPE: "5"
  },
  {
    HWAMUL: "P43",
    TANK: "109C",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "HY3",
    TANK: "430A",
    RACK: "05",
    PIPE: "8"
  },
  {
    HWAMUL: "N20",
    TANK: "201C",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "N25",
    TANK: "201A",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "N28",
    TANK: "201B",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "N29",
    TANK: "104A",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "NHX",
    TANK: "501",
    RACK: "07",
    PIPE: "7"
  },
]


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
  getChemTRP() {
    return chemTRPList;
  }
  getCSpart(): CSpart[] {
    return cspart;
  }

  getShipStatus(): ShipStatus[] {
    return shipStatus;
  }

  getCalculChem(): CalculChem[] {
    return calculChem;
  }
}
