import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { ZXNSCRFCDataModel } from '../../../shared/dataModel/ZxnscRfcData';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import ArrayStore from 'devextreme/data/array_store';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { Service, Product, Data2 } from './app.service';
import { alert, confirm } from "devextreme/ui/dialog"
import {
  DxDataGridComponent,
  DxButtonModule,
  DxFormComponent,
  DxPopupComponent
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import dxForm from 'devextreme/ui/form';
import { AuthService } from '../../../shared/services';;
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ZSDDOCUMENTCancelModel, ZSDS0090Model } from '../../../shared/dataModel/MFSAP/ZsdDocumentCancelProxy';
import { ZMMOILGirecvModel, ZMMS3210Model, ZMMS9900Model } from '../../../shared/dataModel/MCDIP/ZmmOilGirecv';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZSDIFPORTALSAPSHIPPINGInsModel, ZSDS6901Model, ZSDT6901Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingIns';
import { ZMMT3063Model } from '../../../shared/dataModel/MLOGP/Zmmt3063';
if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  templateUrl: 'foic.component.html',
  providers: [ImateDataService, Service],

})

//any
export class FOICComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('deleteGrid', { static: false }) deleteGrid!: DxDataGridComponent;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //조회데이터
  orderData: any;
  //주문문서 삭제버튼
  deleteButton!: boolean;
  //납품문서 삭제버튼
  deliveryButton!: boolean;
  //출고문서 삭제 버튼
  releaseButton!: boolean;
  //조회날짜
  startDate: any;
  endDate: any;

  //데이터 선택
  selectGridData: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //load
  loadPanelOption: any;
  customOperations!: Array<any>;
  collapsed: any;
  //제품구분
  selectData2: string = "";
  data2!: Data2[];

  empId: string = "";
  rolid: string[] = [];
  userid: string = "";
  rowCount: any;


  //this
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService,
    private imInfo: ImateInfo, private authService: AuthService) {

    appInfo.title = AppInfoService.APP_TITLE + " | 고객주문조회 및 취소";

    let userInfo = this.authService.getUser().data;
    this.rolid = userInfo?.role;
    if (this.rolid.find(item => item === "ADMIN") === undefined) {
      this.empId = userInfo?.empId.padStart(10, '0');
      this.userid = userInfo?.userId;
    }
      
   
    //조회날짜 초기값
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //주문문서삭제 버튼 활성화
    this.deleteButton = true;
    this.deliveryButton = true;
    this.releaseButton = true;

    //제품구분 초기값
    this.selectData2 = "10";
    this.data2 = service.getData2();

    //바로 조회
    this.dataLoad();
  }

 
  
  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  //버튼활성화
  selectionChanged(data: any) {
    var selectData = this.deleteGrid.instance.getSelectedRowsData();
    if (selectData[0].STATUS === "01") {
      this.deleteButton = false;
    }
    else {
      this.deleteButton = true;
    }

    if (selectData[0].STATUS === "02") {
      this.deliveryButton = false;
    }
    else {
      this.deliveryButton = true;
    }

    if (selectData[0].STATUS === "03") {
      this.releaseButton = false;
    }
    else {
      this.releaseButton = true;
    }
  }

  //고객주문리스트 조회 RFC
  public async dataLoad() {
    var modelList: ZSDS0090Model[] = [];
    var zsdDocument = new ZSDDOCUMENTCancelModel("", "", "", this.startDate, this.endDate, this.userid, "", "", "", "", "A", this.selectData2, "", "", "", "", modelList, modelList);
    var list: ZSDDOCUMENTCancelModel[] = [zsdDocument];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDDOCUMENTCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDDOCUMENTCancelModelList", list, QueryCacheType.None);



    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR", "VBELN_VL", "POSNR_VL"],
        data: resultModel[0].T_DATA
      });

    this.deleteGrid.instance.getScrollable().scrollTo(0);
  }

  //제품군 선택 이벤트
  onData2ValueChanged(e: any) {
    this.selectData2 = e.value;
  }

  //조회버튼
  searchButton(e: any) {
    this.dataLoad();
    this.deleteButton = true;
    this.deliveryButton = true;
    this.releaseButton = true;

  }

  //주문문서삭제 rfc
  public async orderDelete() {
    var selectData = this.deleteGrid.instance.getSelectedRowsData();
    var modelList: ZSDS0090Model[] = [];
    var zsdDocument = new ZSDDOCUMENTCancelModel("", "", "", selectData[0].VDATU, selectData[0].VDATU, "", "", "", "", selectData[0].MATNR, "B", "", selectData[0].VBELN, "", "", "", modelList, modelList);
    var list: ZSDDOCUMENTCancelModel[] = [zsdDocument];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDDOCUMENTCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDDOCUMENTCancelModelList", list, QueryCacheType.None);
    return resultModel[0].T_CAN;
  }

  //주문문서삭제 버튼
  async orderDeleteButton(e: any) {
    if (await confirm("주문문서 삭제하시겠습니까?", "알림")) {
      var result = await this.orderDelete();
      if (result[0].TYPE === "E") {
        alert(`주문문서삭제 실패,\n\n오류 메세지: ${result[0].MSG}`, "알림");
        return;
      }
      else {
        alert(`주문문서삭제 완료`, "알림");
        this.dataLoad();
        this.deleteButton = true;
        this.deliveryButton = true;
        this.releaseButton = true;
      }

      
    }
  }

  //납품문서삭제 rfc
  public async deliveryDelete() {
    var selectData = this.deleteGrid.instance.getSelectedRowsData();
    var modelList: ZSDS0090Model[] = [];
    var zsdDocument = new ZSDDOCUMENTCancelModel("", "", "", selectData[0].VDATU, selectData[0].VDATU, "", "", "", "", selectData[0].MATNR, "C", "", selectData[0].VBELN, "", "", "", modelList, modelList);
    var list: ZSDDOCUMENTCancelModel[] = [zsdDocument];

    if (this.selectData2 === "30") {
      let minDate = new Date("0001-01-01");
      let minTime = formatDate(new Date("0001-01-01"), "HHmmss", "en-US");
      let oilCVTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
      let oilNowDate = new Date();
      //ZSDIFPORTALSAPSHIPPINGInsModel에서 조건 넣어서 검색
      var zsds6901List: ZSDS6901Model[] = [];
      var zsdt6901List: ZSDT6901Model[] = [];
      var oilDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List, selectData[0].VBELN_VL ?? "", "", "");
      var oilModelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilDataResult];
      var resultOilModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", oilModelList, QueryCacheType.None);
      //위에서 나온 데이터로 ZMMT3063Model 조회
      var deleteData = resultOilModel[0].ET_DATA
      var oilGireCVDeleteResult = await this.dataService.SelectModelData<ZMMT3063Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3063ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND ZVBELN = '${deleteData[0].VBELN}' AND ZPOSNR = '${deleteData[0].POSNR}'AND MATNR = '${deleteData[0].MATNR}' AND ZTANK = '${deleteData[0].ZTANK}' `, "", QueryCacheType.None);

      var zmms9900 = new ZMMS9900Model("", "");
      var zmms3210Model: ZMMS3210Model[] = [];

      //위에서 나온 데이터 값 넣기
      zmms3210Model.push(new ZMMS3210Model("C", oilGireCVDeleteResult[0].GI_GUBUN, oilGireCVDeleteResult[0].ZVBELN, oilGireCVDeleteResult[0].ZPOSNR, oilGireCVDeleteResult[0].MATNR,
        oilGireCVDeleteResult[0].ZTANK, oilGireCVDeleteResult[0].ZIIPNO, oilGireCVDeleteResult[0].BUDAT, oilGireCVDeleteResult[0].GRTYP,
        "", "C", 0, 0, oilGireCVDeleteResult[0].ZGI_QTY, oilGireCVDeleteResult[0].ZADJ_QTY, minDate, minTime, oilNowDate, oilCVTIme, "", minDate, minTime, DIMModelStatus.Add)); console.log(zmms3210Model)

      var oilSub = new ZMMOILGirecvModel(zmms9900, "C", this.appConfig.plant, zmms3210Model);


      console.log(oilSub)

      var oilSubModelList: ZMMOILGirecvModel[] = [oilSub];
      this.rowCount = await this.dataService.RefcCallUsingModel<ZMMOILGirecvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMOILGirecvModelList", oilSubModelList, QueryCacheType.None);
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDDOCUMENTCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDDOCUMENTCancelModelList", list, QueryCacheType.None);

    } else {
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDDOCUMENTCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDDOCUMENTCancelModelList", list, QueryCacheType.None);
    }
    return resultModel[0].T_CAN;
  }

  //납품문서삭제 버튼
  async deliveryDeleteButton(e: any) {
    if (await confirm("납품문서 삭제하시겠습니까?", "알림")) {
      var result = await this.deliveryDelete();
      if (result[0].TYPE === "E") {
        alert(`납품문서삭제 실패,\n\n오류 메세지: ${result[0].MSG}`, "알림");
        return;
      }
      else {
        alert(`납품문서삭제 완료`, "알림");
        this.dataLoad();
        this.deleteButton = true;
        this.deliveryButton = true;
        this.releaseButton = true;
      }
    }
  }

  //출고문서삭제 rfc
  public async releaseDelete() {
    var selectData = this.deleteGrid.instance.getSelectedRowsData();
    var modelList: ZSDS0090Model[] = [];
    var zsdDocument = new ZSDDOCUMENTCancelModel("", "", "", selectData[0].VDATU, selectData[0].VDATU, "", "", "", "", selectData[0].MATNR, "D", "", selectData[0].VBELN, "", "", "", modelList, modelList);
    var list: ZSDDOCUMENTCancelModel[] = [zsdDocument];


    if (this.selectData2 === "30") {
      let minDate = new Date("0001-01-01");
      let minTime = formatDate(new Date("0001-01-01"), "HHmmss", "en-US");
      let oilCVTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
      let oilNowDate = new Date();
      //ZSDIFPORTALSAPSHIPPINGInsModel에서 조건 넣어서 검색
      var zsds6901List: ZSDS6901Model[] = [];
      var zsdt6901List: ZSDT6901Model[] = [];
      var oilDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List, selectData[0].VBELN_VL ?? "", "", "");
      var oilModelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilDataResult];
      var resultOilModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", oilModelList, QueryCacheType.None);
      //위에서 나온 데이터로 ZMMT3063Model 조회
      var deleteData = resultOilModel[0].ET_DATA
      var oilGireCVDeleteResult = await this.dataService.SelectModelData<ZMMT3063Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3063ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND ZVBELN = '${deleteData[0].VBELN}' AND ZPOSNR = '${deleteData[0].POSNR}'AND MATNR = '${deleteData[0].MATNR}' AND ZTANK = '${deleteData[0].ZTANK}' `, "", QueryCacheType.None);

      var zmms9900 = new ZMMS9900Model("", "");
      var zmms3210Model: ZMMS3210Model[] = [];

      //위에서 나온 데이터 값 넣기
      zmms3210Model.push(new ZMMS3210Model("C", oilGireCVDeleteResult[0].GI_GUBUN, oilGireCVDeleteResult[0].ZVBELN, oilGireCVDeleteResult[0].ZPOSNR, oilGireCVDeleteResult[0].MATNR,
        oilGireCVDeleteResult[0].ZTANK, oilGireCVDeleteResult[0].ZIIPNO, oilGireCVDeleteResult[0].BUDAT, oilGireCVDeleteResult[0].GRTYP,
        "", "C", 0, 0, oilGireCVDeleteResult[0].ZGI_QTY, oilGireCVDeleteResult[0].ZADJ_QTY, minDate, minTime, oilNowDate, oilCVTIme, "", minDate, minTime, DIMModelStatus.Add)); console.log(zmms3210Model)

      var oilSub = new ZMMOILGirecvModel(zmms9900, "C", this.appConfig.plant, zmms3210Model);

      console.log(oilSub)

      var oilSubModelList: ZMMOILGirecvModel[] = [oilSub];
      this.rowCount = await this.dataService.RefcCallUsingModel<ZMMOILGirecvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMOILGirecvModelList", oilSubModelList, QueryCacheType.None);
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDDOCUMENTCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDDOCUMENTCancelModelList", list, QueryCacheType.None);

    } else {
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDDOCUMENTCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDDOCUMENTCancelModelList", list, QueryCacheType.None);
    }
    return resultModel[0].T_CAN;
  }

  //출고문서삭제 버튼
  async releaseDeleteButton(e: any) {
    if (await confirm("출고문서 삭제하시겠습니까?", "알림")) {
      var result = await this.releaseDelete();
      if (result[0].TYPE === "E") {
        alert(`출고문서삭제 실패,\n\n오류 메세지: ${result[0].MSG}`, "알림");
        return;
      }
      else {
        alert(`출고문서삭제 완료`, "알림");
        this.dataLoad();
        this.deleteButton = true;
        this.deliveryButton = true;
        this.releaseButton = true;
      }
    }
  }


}



