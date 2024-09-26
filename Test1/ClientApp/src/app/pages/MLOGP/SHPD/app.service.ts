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

@Injectable()
export class Service {
  getCarSeq(): CarSeq[] {
    return carSeq;
  }

  getCSpart(): CSpart[] {
    return cspart;
  }
}
