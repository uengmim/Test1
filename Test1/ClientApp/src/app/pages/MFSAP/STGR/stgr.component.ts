import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService, } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType, QueryDataType, QueryMessage, QueryParameter, QueryRunMethod } from '../../../shared/imate/imateCommon';
import { Service, Employee, State, State2, State3, State4, State5, State6, State7, OrderInfo, PalletType, UnloadInfo, TruckType } from './app.service';
import { formatDate } from '@angular/common';
import ArrayStore from 'devextreme/data/array_store';
import { alert } from "devextreme/ui/dialog"
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
  DxTextBoxComponent,
} from 'devextreme-angular';
import { AppInfoService, AuthService } from '../../../shared/services';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZSDS0050Model } from '../../../shared/dataModel/MFSAP/ZsdStoOrderReceiveProxy';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ZMMS3100Model, ZMMS9000Model, ZMMSTOGRDuelistModel } from '../../../shared/dataModel/MFSAP/ZmmStoGrDuelistProxy';
import { ZMMS3110Model, ZMMSTOGrModel } from '../../../shared/dataModel/MFSAP/ZmmStoGrProxy';


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*STO주문 Component*/


@Component({
  templateUrl: 'stgr.component.html',
  providers: [ImateDataService, Service]
})

export class STGRComponent {
  @ViewChild('lgortInCodeDynamic', { static: false }) lgortInCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('ebelnText', { static: false }) ebelnText!: DxTextBoxComponent;

  @ViewChild('orderGridList', { static: false }) orderGridList!: DxDataGridComponent;

  //조회버튼
  searchButtonOptions: any;
  data: any;
  backButtonOption: any;

  /**
   * 데이터 스토어 키
   * */
  dataStoreKey: string = "stgr";

  //파서블엔트리
  lgortInCode: TableCodeInfo;
  matnrCode: TableCodeInfo;

  //파서블엔트리 선택값
  lgortInValue: string | null = "";
  lgortOutValue: string | null = "";
  matnrValue: string | null = "";

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  popupLoading: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;

  //화면제어용
  popupStat: boolean = false;

  dbTitle: string = "";

  selectedRows: any = [];



  //비료조건
  //구분
  zgubn: string = "A";
  //플랜트
  werks: string = "1000";
  //영업조직
  ekorg: string = "1000";
  //구매그룹
  ekgrp: string = "305";
  //회사코드
  bukrs: string = "1000";

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
  orderList: ZMMS3100Model[] = [];

  callbacks = [];
  //lgort 선택 값
  lgortValue!: string | null;

  //값 체크
  //validation Adapter
  lgortAdapter = {
    getValue: () => {
      return this.lgortValue;
    },
    applyValidationResults: (e: any) => {
      this.lgortInCodeDynamic.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };

  empid: string = "";
  rolid: string[] = [];
  isLgortDisabled = false;

  popupPosition: any;
  customOperations!: Array<any>;
  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService,
    private appConfig: AppConfigService, private authService: AuthService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | STO입고";
    let page = this;
    //로그인 사용자 정보
    let usrInfo = authService.getUser().data;
    this.empid = usrInfo.empId.padStart(10, '0');
    this.rolid = usrInfo.role;

    //QA test용 설정

    //데이터 로딩 패널 보이기
    this.loadingVisible = true;

    this.dbTitle = appConfig.dbTitle;

    this.endDate = formatDate(this.now.setDate(this.now.getDate()), "yyyy-MM-dd", "en-US");
    this.startDate = new Date();
    this.startDate = formatDate(this.now.setDate(this.now.getDate() - 7), "yyyy-MM-dd", "en-US");

    //파서블엔트리
    this.lgortInCode = appConfig.tableCode("비료창고");
    this.matnrCode = appConfig.tableCode("비료친환경제품명");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgortInCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    const that = this;
    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;

  

    //저장버튼 이벤트
    this.saveButtonOptions = {
      text: 'Save',
      useSubmitBehavior: true,
      onClick: async (e: any) => { 
        
      }
    };

    this.closeButtonOptions = {

      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      }
    }
    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadingVisible = true;
        await this.dataLoad(this.dataService, this.appConfig);
        this.loadingVisible = false;
      },
    };
  };

  onFormSubmit = function (e: any) {


    e.preventDefault();
  };


  //get diffInDay() {
  //  return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  //}

  saveDataGrid(e: any) {
    /*this.dataGrid.instance.saveEditData();*/
  }

   async receiveOrder(e: any) {
     if (this.selectedRows.length) {
       var checkFlag = true;
       var sendData: ZMMS3110Model[] = [];
       this.selectedRows.forEach( (key: any) => {

         var selectedRow: ZMMS3100Model = this.orderList.find(item => item.VBELN_ST === key.VBELN_ST) as ZMMS3100Model;
         if (checkFlag) {
           if (selectedRow.MENGE === null || selectedRow.MENGE === 0) {
             alert(`${selectedRow.VBELN_ST}의 수량이 없습니다.`, "알림");
             checkFlag = false; 
             return;
           }
         }

         sendData.push(new ZMMS3110Model(new Date(), selectedRow.MATNR, this.werks, selectedRow.LGORT, selectedRow.MENGE, selectedRow.MEINS, selectedRow.EBELN, selectedRow.EBELP, selectedRow.VBELN_ST, selectedRow.VBELP_ST, "", "", "", ""));

       });

       if (checkFlag) {
         var sendDataModel = new ZMMSTOGrModel(new ZMMS9000Model("",""), sendData);
         var sendDataList: ZMMSTOGrModel[] = [sendDataModel];
         var result = await this.dataService.RefcCallUsingModel<ZMMSTOGrModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMSTOGrModelList", sendDataList, QueryCacheType.None);
         var resultMsg = "";
         for (var row of result[0].CT_LIST) {
           if (row.TYPE !== "S") {
             resultMsg = resultMsg + `${row.EBELN}/${row.EBELP} : ${row.MESSAGE} <br/>`
           }
         }

         if (resultMsg !== "")
           await alert(resultMsg, "오류");
         else
           await alert("저장되었습니다.", "알림");

         this.dataLoad(this.dataService, this.appConfig);

         //this.gridDataSource = new ArrayStore(
         //  {
         //    key: ["EBELN", "EBELP", "VBELN_ST", "VBELP_ST"],
         //    data: result[0].CT_LIST
         //  });

         //alert(`입고처리가 완료되었습니다. 메세지와 상태를 확인해주세요.`, "알림");

         /*result[0].CT_LIST.forEach((array : any) => {
           if (array.TYPE === "E") {
             alert(`${array.VBELN_ST}오류 : ${array.MESSAGE}`, "입고실패");
           } else {
             alert(`${array.VBELN_ST} : ${array.MESSAGE}`, "입고성공");
           }
         });*/

       }
    } else {
      alert("선택된 행이 없습니다.", "알림");
      return;
    }
  }
  

  dbClickDataGrid(e: any) {
    this.popupVisible = false;
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };
  /* 20221116 미사용
  //오더목록 더블클릭
  orderDBClick(e: any) {
    var selectedData: ZSDS0060Model = e.data as ZSDS0060Model;

    this.popupLoading = true;
    //var model = new ZMMSTOGRDuelistModel([] ZMMS9000Model[], selectedData.ZSTVBELN, "", selectedData.LGORT, selectedData.MATNR, "", this.werks,);
    this.dataDetailLoad(this.dataService, this.appConfig, selectedData.EBELN, selectedData.LGORT, selectedData.MATNR, selectedData.WERKS)

    this.popupStat = true;
    this.popupVisible = !this.popupVisible;
  }
  */
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
      
      if (this.rolid.find(item => item !== "ADMIN") !== undefined) {
        var lValue = this.lgortInCodeDynamic.gridDataSource._array.find(item => item.KUNNR == this.empid);
        this.lgortValue = lValue.LGORT ?? "";
        this.isLgortDisabled = true;
      }

      this.dataLoad(this.dataService, this.appConfig);
      this.loadingVisible = false;
    }   
  }

  //STO입고목록 조회
  public async dataLoad( dataService: ImateDataService, appConfig: AppConfigService) {

    this.orderList = [];

    var zmm9000model = new ZMMS9000Model("", "");
    var condiModel = new ZMMSTOGRDuelistModel("", "", this.lgortValue ?? "", this.matnrValue ?? "", "", this.werks, zmm9000model, []);

    var condiModelList = [condiModel];

    var result = await this.dataService.RefcCallUsingModel<ZMMSTOGRDuelistModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMSTOGRDuelistModelList", condiModelList, QueryCacheType.None);
    this.orderList = result[0].ET_LIST;

    this.gridDataSource = new ArrayStore(
      {
        key: ["EBELN", "EBELP", "VBELN_ST", "VBELP_ST"],
        data: this.orderList
      });

    this.orderGridList.instance.getScrollable().scrollTo(0);
  }
}

