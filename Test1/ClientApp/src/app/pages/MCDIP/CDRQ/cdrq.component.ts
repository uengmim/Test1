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
import { Service } from './app.service';
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
import { ZSDIFPORTALSAPSHIPPINGReqModel, ZSDS6900Model, ZSDT6900Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingReqProxy';
if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  templateUrl: 'cdrq.component.html',
  providers: [ImateDataService, Service],

})

//any
export class CDRQComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('kunnrEntery', { static: false }) kunnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('matnrEntery', { static: false }) matnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('kunweEntery', { static: false }) kunweEntery!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoEntery', { static: false }) zcarnoEntery!: CommonPossibleEntryComponent;
  @ViewChild('inco1CodeDynamic', { static: false }) inco1CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('t001Entery', { static: false }) t001Entery!: CommonPossibleEntryComponent;
  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "cdrq";
  //조회데이터
  orderData: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //삭제버튼
  state: boolean = true;
  //조회날짜
  startDate: any;
  endDate: any;
  reqVisible = false;
  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;
  //주문처 정보
  kunnrCode: TableCodeInfo;
  matnrCode: TableCodeInfo;
  kunweCode: TableCodeInfo;
  zcarnoCode: TableCodeInfo;
  inco1Code: TableCodeInfo;
  t001Code: CommonCodeInfo;
  /*Entery value 선언*/
  kunnrValue: string | null;
  matnrValue: string | null;
  kunweValue: string | null;
  zcarnoValue: string | null;
  inco1Value: string | null;
  lgortValue: string | null;
  //요청팝업
  reqPopupData: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //load
  loadPanelOption: any;
  customOperations!: Array<any>;
  collapsed: any;
  incoFilter: any = ["ZCM_CODE2", "<>", "NH"];
  //
  dataLoading: boolean = false;
  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {

    appInfo.title = AppInfoService.APP_TITLE + " | 출하요청 등록";

    this.kunnrCode = appConfig.tableCode("유류납품처");
    this.kunweCode = appConfig.tableCode("유류납품처");
    this.matnrCode = appConfig.tableCode("유류제품명");
    this.zcarnoCode = appConfig.tableCode("유류차량");
    this.inco1Code = appConfig.tableCode("인코텀스");
    this.t001Code = appConfig.commonCode("유류출고사업장");
    //조회날짜 초기값
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 30), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunweCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.inco1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.t001Code),
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------

    this.kunnrValue = "";
    this.matnrValue = "";
    this.kunweValue = "";
    this.zcarnoValue = "";
    this.inco1Value = "";
    this.lgortValue = "";
    this.dataLoad();


  }



  onKunnrCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.KUNNR = e.selectedValue;
    });
  }

  onMatnrCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.MATNR = e.selectedValue;
      this.reqPopupData.MEINS = e.selectedItem.MEINS;
      this.reqPopupData.MAKTX = e.selectedItem.MAKTX;
    });
  }

  onKunweCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.KUNWE = e.selectedValue;
    });
  }

  onZcarnoCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.ZCARNO = e.selectedItem.ZCARNO;
      this.reqPopupData.ZDRIVER = e.selectedItem.ZDERIVER1;
    });
  }

  onLgortCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.LGORT = e.selectedValue;
    });
  }
  oninco1CodeValueChanged(e: any) {
    this.reqPopupData.INCO1 = e.selectedItem.INCO1;
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  //요청팝업닫기버튼
  reqCloseButton(e: any) {
    this.reqVisible = false;
  }


  //조회버튼
  searchButton(e: any) {
    this.dataLoad();
  }

  //버튼활성화
  selectionChanged(data: any) {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
   if (selectData[0].ZSTAT === "R") {
      this.state = false;
    }
    else {
      this.state = true;
    }
  }
  //삭제버튼
  async deleteButton(e: any) {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }
    //if (selectData[0].ZSTAT === "R") {
    //  this.state = false;
    //}
    //else {
    //  this.state = true;
    //}
    if (await confirm("삭제하시겠습니까?", "알림")) {
      alert("삭제되었습니다.","알림")
      this.deleteData();
      this.dataLoad();
      this.state = true;
    }
  }
  //조회 RFC
  public async dataLoad() {
    var zsdsList: ZSDS6900Model[] = [];
    var zsdtList: ZSDT6900Model[] = [];
    var model = new ZSDIFPORTALSAPSHIPPINGReqModel("", "", this.endDate, "", "", this.startDate, "D", "", "",zsdsList, zsdtList);
    var modelList: ZSDIFPORTALSAPSHIPPINGReqModel[] = [model];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGReqModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGReqModelList", modelList, QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN"],
        data: resultModel[0].ET_DATA
      });



  }

  //등록버튼
  addButton(e: any) {
    this.clearEntery();
    var model1 = new ZSDS6900Model("", "", "", "", "", "", "", "", "", "", "", "", "", new Date(), new Date(), "", "", "", "", "", "", 0, "", "", "", "", "", "");
    var model2 = new ZSDS6900Model("", "", "", "", "", "", "", "", "", "", "", "", "", new Date(), new Date(), "", "", "", "", "", "", 0, "", "", "", "", "", "")
    var initDat = Object.assign(model1, model2);
    this.reqPopupData = initDat;
    this.reqVisible = true;
  }


  //저장버튼
  async reqSaveButton(e: any) {


    if (await confirm("저장하시겠습니까?", "알림")) {
      if (this.reqPopupData.KUNNR === "" || this.reqPopupData.S_OILNO === null) {
        alert("주문처는 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.MATNR === "" || this.reqPopupData.S_OILNO === null) {
        alert("제품명은 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.KUNWE === "" || this.reqPopupData.S_OILNO === null) {
        alert("도착지는 필수값입니다.", "알림");
        return;
      }

      else if (this.reqPopupData.ZCARNO === "" || this.reqPopupData.S_OILNO === null) {
        alert("차량번호 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.ZDRIVER === "" || this.reqPopupData.S_OILNO === null) {
        alert("기사명은 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.INCO1 === "" || this.reqPopupData.S_OILNO === null) {
        alert("운송방법은 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.S_OILNO === "" || this.reqPopupData.S_OILNO === null) {
        alert("선적번호는 필수값입니다.", "알림");
        return;
      }
     
      var result = this.createOrder();

      this.dataLoad();
      alert("저장 완료되었습니다","알림");

      this.reqVisible = false;

    }
  }


  //저장rfc
  public async createOrder() {
    var data = this.reqPopupData;
    var zsdsModel = new ZSDS6900Model("", "", "", "", "", "", "", "", "", "", "", "", "", new Date(), new Date(), "", "", "", "", "", "", 0, "", "", "", "", "", "");
    var zsdtModel = new ZSDT6900Model("", data.VBELN, data.KUNNR, data.KUNWE, data.LGORT, data.MATNR, data.RQDAT, data.VRDAT, data.ZCARNO, data.ZDRIVER, data.INCO1, data.ZMENGE, data.MEINS, data.S_OILNO, data.ZTEXT, data.ZSTAT, "", "", new Date(), "000000", "", new Date(), "000000");

    var zsdsList: ZSDS6900Model[] = [zsdsModel];
    var zsdtList: ZSDT6900Model[] = [zsdtModel];

    var createModel = new ZSDIFPORTALSAPSHIPPINGReqModel("", "", data.VRDAT, data.KUNNR, data.LGORT, data.VRDAT, "R",data.VBELN, "",zsdsList, zsdtList);
    var createList: ZSDIFPORTALSAPSHIPPINGReqModel[] = [createModel];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGReqModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGReqModelList", createList, QueryCacheType.None);

    return insertModel[0].IT_DATA;

  }

  //삭제 RFC
  public async deleteData() {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    var zsdsList: ZSDS6900Model[] = [];
    var zsdtList: ZSDT6900Model[] = [];
    var model = new ZSDIFPORTALSAPSHIPPINGReqModel("", "", this.endDate, "", "", this.startDate, "C", selectData[0].VBELN, "",zsdsList, zsdtList);
    var modelList: ZSDIFPORTALSAPSHIPPINGReqModel[] = [model];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGReqModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGReqModelList", modelList, QueryCacheType.None);
    return resultModel[0];
  }

  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */
  onPEDataLoaded(e: any) {
    this.loadePeCount++;
    console.info(`DATA LOAD COUNT: ${this.loadePeCount}`);
    /*
     if (e.component.ClearSelectedValue != undefined) {
       setTimeout(() => {
         e.component.ClearSelectedValue();
       });
     }
     */
    if (this.loadePeCount >= 7) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      /*      this.enteryLoading = false;*/
      this.dataLoad();

    }
  }

  //엔트리 클리어
  public clearEntery() {
    this.kunnrEntery.ClearSelectedValue();
    this.matnrEntery.ClearSelectedValue();
    this.kunweEntery.ClearSelectedValue();
    this.zcarnoEntery.ClearSelectedValue();
    this.inco1CodeDynamic.ClearSelectedValue();
    this.t001Entery.ClearSelectedValue();
  }





}



