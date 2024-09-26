// iMATE Auto generator Code
// (C)Copyright 2022 ISTN
// RUN : imatecc gen_md -title INA -object "ZXNSC_NEW_RFCCALL_TEST" -output "ZxnscNewRfcCalltestFNProxy.ts" -mtype "proxy" -lang "ts" -serial "field"

import { DIMModelStatus } from '../imate/dimModelStatusEnum'

   /** 
    * ZXNSCNEWRFCCALLTestModel(ZXNSC_NEW_RFCCALL_TEST) Proxy class
    */
    export class ZXNSCNEWRFCCALLTestModel
    {
	  constructor(
        // INPUT1(iNPUT1) Field
        public INPUT1 : ZIMATETESTStructModel,

        // IT_INPUT(iTInput) Field
        public IT_INPUT : ZIMATETESTStructModel[] = [],

        // IT_RESULT(iTResult) Field
        public IT_RESULT : ZIMATETESTStructModel[] = [],


               /**
	   *모델의 상태
	  **/
	  public ModelStatus: DIMModelStatus = DIMModelStatus.UnChanged   
	  ) { }
	  
    }

   /** 
    * ZIMATETESTStructModel(ZIMATE_TEST_STRUCT) Proxy class
    */
    export class ZIMATETESTStructModel
    {
	  constructor(
        // PARAM1(pARAM1) Field
        public PARAM1 : string,

        // PARAM2(pARAM2) Field
        public PARAM2 : number,

        // PARAM3(pARAM3) Field
        public PARAM3 : number,

        // UPDDAT(upddat) Field
        public UPDDAT : Date,

        // UPDTIM(updtim) Field
        public UPDTIM : string,


               /**
	   *모델의 상태
	  **/
	  public ModelStatus: DIMModelStatus = DIMModelStatus.UnChanged   
	  ) { }
	  
    }

//
  // Proxy List Define 
  //private _ZXNSCNEWRFCCALLTestModelList: ZXNSCNEWRFCCALLTestModel[] = [];
  //
