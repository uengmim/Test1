// iMATE Auto generator Code
// (C)Copyright 2022 ISTN
// RUN : imatecc gen_md -title INA -object "ZXNSC_RFC_RESULT" -output "ZxnscRfcResult.ts" -mtype "proxy" -lang "ts"

import { DIMModelStatus } from '../imate/dimModelStatusEnum'
import { Injectable } from '@angular/core';

  /** 
    * ZXNSCRFCResultModel(ZXNSC_RFC_RESULT) Proxy class
    */
    export class ZXNSCRFCDetailModel {
      constructor(
        // DATA1 Field
        public dATA1: number,

        // iTMNO Field
        public iTMNO: string,

        // dETAIL1 Field
        public dETAIL1: string,

        // dETAIL2 Field
        public dETAIL2: string,

        // dETUM1 Field
        public dETNUM1: number,

        // dETUM2 Field
        public dATNUM2: number,

        // dETSEL1 Field
        public dETSEL1: string,

        // dETSEL2 Field
        public dETSEL2: string,

        // dETOPT Field
        public dETOPT: string,

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


