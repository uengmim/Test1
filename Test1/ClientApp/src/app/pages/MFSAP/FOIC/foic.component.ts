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
  //this
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {

    appInfo.title = AppInfoService.APP_TITLE + " | 고객주문조회 및 취소";
   
    //조회날짜 초기값
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 30), "yyyy-MM-dd", "en-US");
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
    var zsdDocument = new ZSDDOCUMENTCancelModel("", "", "", this.startDate, this.endDate, "", "", "", "", "", "A", this.selectData2, "", "", "", "", modelList, modelList);
    var list: ZSDDOCUMENTCancelModel[] = [zsdDocument];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDDOCUMENTCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDDOCUMENTCancelModelList", list, QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN","MBLNR","POSNR_VL","POSNR"],
        data: resultModel[0].T_DATA
      });
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

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDDOCUMENTCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDDOCUMENTCancelModelList", list, QueryCacheType.None);
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

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDDOCUMENTCancelModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDDOCUMENTCancelModelList", list, QueryCacheType.None);
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



