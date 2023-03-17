import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService, } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { async, lastValueFrom } from 'rxjs';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType, QueryDataType, QueryMessage, QueryParameter, QueryRunMethod } from '../../../shared/imate/imateCommon';
import { CancelStatus, Service } from './app.service';
import { formatDate } from '@angular/common';
import ArrayStore from 'devextreme/data/array_store';
import { confirm, alert } from "devextreme/ui/dialog";
import {
  DxDataGridComponent,
  DxRangeSelectorModule,
  DxDropDownBoxModule,
  DxBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxTemplateModule,
} from 'devextreme-angular';
import { AppInfoService, AuthService } from '../../../shared/services';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZSDS0050Model, ZSDSTOORDERReceiveModel } from '../../../shared/dataModel/MFSAP/ZsdStoOrderReceiveProxy';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZSDS0060Model, ZSDS0061Model, ZSDSTOORDERManageModel } from '../../../shared/dataModel/MFSAP/ZSdStoOrderManageProxy';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ZSDS0062Model, ZSDSTODELIVERYCancelModel } from '../../../shared/dataModel/MFSAP/ZSdStoDeliveryCancelProxy';
import { ZSDT7110Model } from '../../../shared/dataModel/MLOGP/Zsdt7110';
import { T001lModel } from '../../../shared/dataModel/MLOGP/T001l';
import { ZSDIFPORTALSAPSHIPPINGInsModel, ZSDS6901Model, ZSDT6901Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingIns';
import { ZMMT3063Model } from '../../../shared/dataModel/MLOGP/Zmmt3063';
import { ZMMOILGirecvModel, ZMMS3210Model, ZMMS9900Model } from '../../../shared/dataModel/MCDIP/ZmmOilGirecv';


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*STO주문 Component*/


@Component({
  templateUrl: 'stcc.component.html',
  providers: [ImateDataService, Service]
})

export class STCCComponent {
  @ViewChild('deleteGrid', { static: false }) deleteGrid!: DxDataGridComponent;
  @ViewChild('lgortInCodeDynamic', { static: false }) lgortInCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('lgortOutCodeDynamic', { static: false }) lgortOutCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  //조회버튼
  searchButtonOptions: any;
  data: any;
  backButtonOption: any;

  /**
   * 데이터 스토어 키
   * */
  dataStoreKey: string = "stcc";

  //파서블엔트리
  lgortInCode: TableCodeInfo;
  lgortOutCode: TableCodeInfo;

  //파서블엔트리 선택값
  lgortInValue: string | null;
  lgortOutValue: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;

  //화면제어용
  popupStat: boolean = false;

  dbTitle: string = "";
  rowCount1: any;

  selectedRows: any = [];

  //비료조건
  //구분
  zgubn: string = "A";
  //플랜트
  werks: string = "1000";
  //영업조직
  ekorg: string = "1000";
  //구매그룹
  ekgrp: string = "301";
  //회사코드
  bukrs: string = "1000";

  cancelCodeList: CancelStatus[] = [];
  empId: string = "";
  /**
   * 로딩된 PeCount
   * */
  private loadePeCount: number = 0;

  //insert,modify,delete 
  rowCount: number;
  _dataService: ImateDataService;
  //date box
  now: Date = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  startDate: any;
  endDate: any;
  refreshButtonOptions: any;
  startEditAction = 'click';
  selectTextOnEditStart = true;
  saveButtonOptions: any;
  closeButtonOptions: any;
  popupVisible = false;
  collapsed: any;

  //multiseletbox
  gridDataSource: any;
  orderInfo: ZSDS0062Model;
  orderList: ZSDS0062Model[] = [];

  //lgort 선택 값
  lgortInSelectValue!: string | null;
  lgortOutSelectValue!: string | null;

  callbacks = [];

  lgNmList: T001lModel[] = [];

  empid: string = "";
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";

  rolid: string[] = [];

  //값 체크
  //validation Adapter
  lgortAdapter = {
    getValue: () => {
      return this.lgortInSelectValue;
    },
    applyValidationResults: (e: any) => {
      this.lgortInCodeDynamic.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };
 

  popupPosition: any;
  customOperations!: Array<any>;
  constructor(private dataService: ImateDataService, service: Service,private authService: AuthService, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService, private appConfig: AppConfigService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | STO진행현황-유류";
    let page = this;
    this.cancelCodeList = service.getCancelStatus();
    //QA test용 설정
    let userInfo = this.authService.getUser().data;

    this.rolid = userInfo.role;
    this.vorgid = userInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = userInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = userInfo.orgOption.torgid.padStart(10, '0');
    this.empid = this.corgid;

    //데이터 로딩 패널 보이기
    this.loadingVisible = true;

    this.dbTitle = appConfig.dbTitle;

    this.endDate = formatDate(this.now.setDate(this.now.getDate()), "yyyy-MM-dd", "en-US");
    this.startDate = new Date();
    this.startDate = formatDate(this.now.setDate(this.now.getDate() - 7), "yyyy-MM-dd", "en-US");

    //파서블엔트리
    this.lgortInCode = appConfig.tableCode("유류창고");
    this.lgortOutCode = appConfig.tableCode("유류창고");


    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgortInCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgortOutCode)
      ]
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
 
    var newdata = new ZSDS0050Model("", this.zgubn, this.ekorg, this.ekgrp, this.bukrs, "", this.werks, "", "", "", "", "", "", "", 0, 0, 0, 0, 0, 0, 0, 0,
      new Date(), new Date(), "", "", "", "", "", "", "", "", "", "", "", "", "", 0, "", 0, 0, this.werks, "", "", "", "", "", "", "", "",
      new Date(), "", "", new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged);

    this.orderInfo = Object.assign(newdata);

    const that = this;
    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;

    this.getLgortNm();
      
    //저장버튼 이벤트
    this.saveButtonOptions = {
      text: 'Save',
      useSubmitBehavior: false,
      onClick: async (e: any) => {
        let vali = e.validationGroup.validate();

        if (await confirm("저장하시겠습니까?", "알림")) {

          //this.loadingVisible = true;
          //var result: ZSDSTODELIVERYCancelModel = await this.createOrder(appConfig);
          //this.loadingVisible = false;
          //if (result.MTY === "E")
          //  alert(result.MSG, "알림");
          //else
          //  alert("저장완료", "알림");

          //this.orderInfo.ZSTVBELN = result.T_DATA[0].ZVBELN1;
          //this.orderInfo.EBELN = result.T_DATA[0].EBELN;
          //this.orderInfo.ZABGRU = result.T_DATA[0].ZABGRU;
          //this.orderInfo.ZBLOCK = result.T_DATA[0].ZBLOCK;
          /*that.popupVisible = false;*/
        }
      }
    };

    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      }
    };

    this.searchButtonOptions = {
      text: '조회',
      onClick: async (e: any) => {
        this.loadingVisible = true;
        await this.dataLoad(dataService, appConfig);
        this.loadingVisible = false;
      }
    };
    
  };


  //get diffInDay() {
  //  return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  //}

  //취소 클릭 이벤트
  async cancelDataB(e: any) {
    var selectData = this.deleteGrid.instance.getSelectedRowsData();
    let minDate = new Date("0001-01-01");
    let minTime = formatDate(new Date("0001-01-01"), "HHmmss", "en-US");
    let oilCVTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
    let oilNowDate = new Date();
    if (this.selectedRows.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }

    if (await confirm("취소하시겠습니까?", "알림")) {
     

      var selectedRow: ZSDS0062Model = this.dataGrid.instance.getSelectedRowsData()[0];

      if (selectedRow.CAN_STATUS !== "02") {
        alert("해당 주문은 출고 전기 취소가 불가능합니다.", "알림");
        return;
      }
      else {
        this.loadingVisible = true;
        var result = await this.cancelData(this.appConfig, selectedRow, "B");
        //ZSDIFPORTALSAPSHIPPINGInsModel에서 조건 넣어서 검색
        var zsds6901List: ZSDS6901Model[] = [];
        var zsdt6901List: ZSDT6901Model[] = [];
        var oilDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List, selectData[0].ZVBELN1 ?? "", "", "");
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
          "", "C", 0, 0, oilGireCVDeleteResult[0].ZGI_QTY, oilGireCVDeleteResult[0].ZADJ_QTY, minDate, minTime, oilNowDate, oilCVTIme, "", minDate, minTime, DIMModelStatus.Add));
        
        console.log(zmms3210Model)

        var oilSub = new ZMMOILGirecvModel(zmms9900, "C", this.appConfig.plant, zmms3210Model);
        var oilSubModelList: ZMMOILGirecvModel[] = [oilSub];
        this.rowCount1 = await this.dataService.RefcCallUsingModel<ZMMOILGirecvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMOILGirecvModelList", oilSubModelList, QueryCacheType.None);


        if (result.T_CAN[0].TYPE === "E") {
          alert(result.T_CAN[0].MSG, "오류");
          return;
        }
        else
          alert("출고전기취소완료", "알림");

        this.dataLoad(this.dataService, this.appConfig);
        this.loadingVisible = false;
      }
    }
  }

  //취소 클릭 이벤트
  async cancelDataC(e: any) {
    if (this.selectedRows.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }

    if (await confirm("취소하시겠습니까?", "알림")) {
     

      var selectedRow: ZSDS0062Model = this.dataGrid.instance.getSelectedRowsData()[0];

      if (selectedRow.CAN_STATUS !== "03") {
        alert("해당 주문은 납품문서 삭제가 불가능합니다.", "알림");
        return;
      }
      else {
        this.loadingVisible = true;
        var result = await this.cancelData(this.appConfig, selectedRow, "C");
        if (result.T_CAN[0].TYPE === "E") {
          alert(result.T_CAN[0].MSG, "오류");
          return;
        }
        else
          alert("출고전기취소완료", "알림");

        this.dataLoad(this.dataService, this.appConfig);
        this.loadingVisible = false;
        
      }
    }
  }

  getDataGrid(e: any) {
    let result = e.validationGroup.validate();
    if (!result.isValid) {
      alert("필수값을 입력하여 주십시오.", "알림");
      return;
    }
    else {
      this.dataGrid.instance.refresh();
    }
  }

  dbClickDataGrid(e: any) {
    this.popupVisible = false;
  }


  //Data refresh
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  onCodeValueChanged(e: any) {
    return;
  }

  /**
   * 파서블 엔트리 데이터 로딩 완료
   * @param e
   */
  onPEDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 2) {
      if (this.rolid.find(item => item === "ADMIN") === undefined) {
        this.lgortOutSelectValue = this.corgid;
      }

      this.loadingVisible = false;

      this.dataLoad(this.dataService, this.appConfig)
    }
      

  }

  //STO주문목록 조회
  public async dataLoad(dataService: ImateDataService, appConfig: AppConfigService) {


    var condiModel = new ZSDSTODELIVERYCancelModel("", "", this.startDate, this.endDate, "",
      this.lgortInSelectValue, "A", this.lgortOutSelectValue, this.werks, "", this.werks, "", [], [], DIMModelStatus.UnChanged);

    var condiModelList = [condiModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDSTODELIVERYCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDSTODELIVERYCancelModelList", condiModelList, QueryCacheType.None);

    result[0].T_DATA.forEach(array => {
      var data = this.cancelCodeList.find(obj => obj.code == array.CAN_STATUS);
      
      Object.assign(array, { CAN_STATUS_TXT: data != undefined ? data.name : "" });

    });

    this.orderList = result[0].T_DATA;
    //메인데이터
    this.gridDataSource = new ArrayStore(
      {
        key: ["ZVBELN1", "EBELN"],
        data: this.orderList
      });
  }


  public async cancelData(appConfig: AppConfigService, cancelModel: ZSDS0062Model, canStatus : string) {
    var condiModel = new ZSDSTODELIVERYCancelModel("", "", this.startDate, this.endDate, cancelModel.KUNNR,
      cancelModel.LGORT, canStatus, cancelModel.RESLO, cancelModel.RESWK, cancelModel.TDLNR1, cancelModel.WERKS, cancelModel.ZVBELN1, [], [], DIMModelStatus.UnChanged);

    var condiModelList = [condiModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDSTODELIVERYCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDSTODELIVERYCancelModelList", condiModelList, QueryCacheType.None);
    return result[0];
  }

  async getLgortNm() {

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.lgortInCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(T001lModel);
    this.lgNmList = resultModel;
  }

}
