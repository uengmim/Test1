import { Injectable } from '@angular/core';


export class OilShip {
  //출하일
  oilShipDate: string;
  //순번
  oilNum: number;
  //거래처
  oilClient?: string;
  //상태
  oilState?: string;
  //유종
  oilType?: string;
  //차량번호
  oilVehNum?: string;
  //도착지
  oilDesti?: string;
  //지시량
  oilInsQuan?: number;
  //유창#1
  oilYuchang1?: string;
  //유창#2
  oilYuchang2?: string;
  //유창#3
  oilYuchang3?: string;
  //유창#4
  oilYuchang4!: string;
  //유창#5
  oilYuchang5?: string;
  //유창#6
  oilYuchang6?: string;
  //유창#7
  oilYuchang7?: string;
  //유창#8
  oilYuchang8?: string;
  //유창#9
  oilYuchang9?: string;
  //유창#10
  oilYuchang10?: string;
  //배차일자
  oilBACHDAT: string;
  //배차순번
  oilBACHNUM: number;
}

export class ChemShip {
  //출하일
  chemShipDate?: string;
  //순번
  chemNum?: number;
  //거래처
  chemClient?: string;
  //상태
  chemState?: string;
  //제품
  chemProduct?: string;
  //차량번호
  chemVehNum?: string;
  //도착지
  chemDesti?: string;
  //지시량
  chemInsQuan?: number;
  //출하량
  chemShipQuan?: number;
  //공차중량
  chemWeight?: number;
  //총중량
  chemTWeight?: number;
  //시작시간
  chemStaTim!: string;
  //종료시간
  chemEndTim?: string;

}




@Injectable()
export class Service {


}
