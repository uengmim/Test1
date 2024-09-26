/*
 * 계약현황확인 및 단가작업표
 */
import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { BrowserModule, Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Product } from './app.service';
import { DxDataGridComponent, DxFormComponent, DxPopupComponent, } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import { confirm, alert } from "devextreme/ui/dialog";
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { AppStatus } from '../WORR/app.service';
import { userInfo } from 'os';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ZPMF0006Model, ZPMS0024Model, ZPMS0008Model } from '../../../shared/dataModel/MFMPO/ZPmF0006Proxy';
import { AutoPrintInput, jsPDF } from 'jspdf';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { bottom } from '@devexpress/analytics-core/analytics-elements-metadata';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'wosu.component.html',
  providers: [ImateDataService, Service],

})

export class WOSUComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('masterGrid', { static: false }) masterGrid!: DxDataGridComponent;
  closeButtonOptions: any;


  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  /**
* 데이터 스토어 키
* */
  dataStoreKey: string = "wosu";
  zpms0024List: ZPMS0024Model[] = [];
  zpms0008List: ZPMS0008Model[] = [];
  orderData: any;
  masterData: any;
  //날짜
  startDate: any;
  endDate: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  popupVisible: any;
  collapsed: any;
  customOperations: Array<any>;
  //고객정보가져오기
  popupTitle: string = "구매오더 품목"
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";
  rolid: string[] = [];
  empId: string = "";
  userid: string = "";
  //데이터 조회 버튼
  searchButtonOptions: any;
  loadPanelOption: any;
  masterData2: any;
  dbcData: any;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private authService: AuthService, private appInfo: AppInfoService,
    private http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, service: Service, private titleService: Title) {
    appInfo.title = AppInfoService.APP_TITLE + " | 계약현황확인 및 단가작업표";
    this.titleService.setTitle(appInfo.title);

    this.startDate = new Date();
    let userInfo = this.authService.getUser().data;
    this.rolid = userInfo?.role;
    var role = this.rolid.find(item => item === "ADMIN");
    if (role !== undefined)
      this.empId = "";
    else
      this.empId = userInfo?.empId.padStart(10, '0');

    this.dataLoad();
    //데이터 로딩 패널 보이기
/*    this.loadingVisible = true;*/
    this.loadPanelOption = { enabled: false };
    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadingVisible = true;
        this.loadPanelOption = { enabled: true };
        await this.dataLoad();
        this.loadingVisible = false;
      },
    };
    //팝업닫기
    this.closeButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.popupVisible = false;
        this.dataLoad();
        this.masterData = [];
      },
    };

    this.customOperations = [{
      name: 'weekends',
      caption: 'Weekends',
      dataTypes: ['date'],
      icon: 'check',
      hasValue: false,
      calculateFilterExpression() {
        return [[getOrderDay, '=', 0], 'or', [getOrderDay, '=', 6]];
      },
    }];

  }


  onEditorPreparing(e: any) {
    if (e.parentType === "filterRow") {
      e.updateValueTimeout = 2000;  // default: 700
    }
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  //데이터 로드
  public async dataLoad() {
    this.zpms0008List = [];
    var zpmf0006 = new ZPMF0006Model("", "", this.startDate, this.empId, this.appConfig.plant, zpms0024, zpms0008);
    var zpms0024: ZPMS0024Model[] = [];
    var zpms0008: ZPMS0008Model[] = [];
    var zpmf0006List: ZPMF0006Model[] = [zpmf0006];
    var resultModel = await this.dataService.RefcCallUsingModel<ZPMF0006Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0006ModelList", zpmf0006List, QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["EBELN"],
        data: resultModel[0].ITAB_DATA1
      });

    this.dbcData = resultModel[0].ITAB_DATA2;

  
  }
  

  orderDBClick(e: any) {

    var selectData = this.orderGrid.instance.getSelectedRowsData();
    this.masterData = [];


    setTimeout(async () => {
  
      this.masterData2 = this.dbcData.filter(item => item.EBELN === selectData[0].EBELN)
      this.masterData = new ArrayStore(
        {
          key: ["EBELN", "EBELP"],
          data: this.masterData2
        });

      this.masterGrid.instance.getScrollable().scrollTo(0);
      this.popupVisible = true;
      /* this.masterData = this.dbcData;*/
    }, 500);


  }
}
