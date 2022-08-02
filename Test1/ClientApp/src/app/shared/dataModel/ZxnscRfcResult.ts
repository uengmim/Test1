// iMATE Auto generator Code
// (C)Copyright 2022 ISTN
// RUN : imatecc gen_md -title INA -object "ZXNSC_RFC_RESULT" -output "ZxnscRfcResult.ts" -mtype "proxy" -lang "ts"

import { DIMModelStatus } from '../imate/dimModelStatusEnum'

  /** 
    * ZXNSCRFCResultModel(ZXNSC_RFC_RESULT) Proxy class
    */
    export class ZXNSCRFCResultModel
    {
	  constructor(
        // DATA1 Field
        public dATA1 : number,

        // DATA2 Field
        public dATA2 : string,

        // DATA3 Field
        public dATA3 : string,

        // NUM1 Field
        public nUM1: number,

        // COD1 Field
        public cOD1: string,

        // SEL1 Field
        public sEL1: string,

        // UPDATE Field
        public updat: string,

        // UPTIM Field
        public uptim: string,  
               /**
	   *모델의 상태
 	   **/
	  public ModelStatus: DIMModelStatus = DIMModelStatus.UnChanged   

	  ) { }
    }

  //
  // Proxy List Define
  //private _ZXNSCRFCResultModelList: ZXNSCRFCResultModel[] = [];
  //


