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
import { AppInfoService } from '../../../shared/services';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AppConfigService } from '../../../shared/services/appconfig.service';


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*STO주문 Component*/


@Component({
  templateUrl: 'stfo.component.html',
  providers: [ImateDataService, Service]
})

export class STFOComponent {
  @ViewChild('lgortInCodeDynamic', { static: false }) lgortInCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('lgortOutCodeDynamic', { static: false }) lgortOutCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('kunnrCodeDynamic', { static: false }) kunnrCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('kunweCodeDynamic', { static: false }) kunweCodeDynamic!: TablePossibleEntryComponent;

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;
  
  //조회버튼
  searchButtonOptions: any;
  data: any;
  backButtonOption: any;

  //파서블엔트리
  lgortInCode: TableCodeInfo;
  lgortOutCode: TableCodeInfo;
  kunnrCode: TableCodeInfo;
  kunweCode: TableCodeInfo;
  matnrCode: TableCodeInfo;
  inco1Code: TableCodeInfo;
  tdlnr1Code: CommonCodeInfo;
  tdlnr2Code: CommonCodeInfo;
  sublgortOutCode: TableCodeInfo;
  stockTypeCode: TableCodeInfo;
  cancelCode: TableCodeInfo;

  //콤보박스
  palletType: PalletType[] = [];
  unloadInfo: UnloadInfo[] = [];
  truckType: TruckType[] = [];

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;

  //화면제어용
  popupStat: boolean = false;

  dbTitle: string = "";

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
  startDate: Date;
  endDate: Date;
  refreshButtonOptions: any;
  startEditAction = 'click';
  selectTextOnEditStart = true;
  saveButtonOptions: any;
  closeButtonOptions: any;
  popupVisible = false;
  collapsed: any;

  //multiseletbox
  gridDataSource: any;
  orderInfo: any;

  popupPosition: any;
  customOperations!: Array<any>;
  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService, private appConfig: AppConfigService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | STO주문-포장재";
    let page = this;

    //데이터 로딩 패널 보이기
    this.loadingVisible = true;

    this.dbTitle = appConfig.dbTitle;

    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setDate(this.endDate.getDate() - 7);

    //파서블엔트리
    this.lgortInCode = appConfig.tableCode("비료창고");
    this.lgortOutCode = appConfig.tableCode("비료창고");

    this.kunnrCode = appConfig.tableCode("비료납품처");
    this.kunweCode = appConfig.tableCode("비료창고");
    this.matnrCode = appConfig.tableCode("비료제품명");
    this.inco1Code = appConfig.tableCode("인코텀스");
    this.tdlnr1Code = appConfig.commonCode("운송사");
    this.tdlnr2Code = appConfig.commonCode("운송사");
    this.sublgortOutCode = appConfig.tableCode("비료창고");
    this.stockTypeCode = appConfig.tableCode("RFC_재고유형");
    this.cancelCode = appConfig.tableCode("RFC_취소코드");

    //콤보박스
    this.palletType = service.getPalletType();
    this.unloadInfo = service.getUnloadInfo();
    this.truckType = service.getTruckType();


    const that = this;
    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;

    //this.gridDataSource = new CustomStore(
    //  {
    //    key: ["ZSTVBELN"],
    //    load: function (loadOptions) {
    //      return page.dataLoad(imInfo, dataService, appConfig);
    //    }
    //  });


    this.saveButtonOptions = {
      text: 'Save',
      onClick: () => {
        that.popupVisible = false;
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
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
  };
    
  onlgortInCodeValueChanged(e: any) {
    return;
  }

  onlgortOutCodeValueChanged(e: any) {
    return;
  }

  //고객코드 변경이벤트
  onkunnrCodeValueChanged(e: any) {
    this.kunweCodeDynamic.SetDataFilter(["KUNNR", "=", e.selectedValue]);
    this.kunweCodeDynamic.ClearSelectedValue();
    return;
  }

  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }

  addDataGrid(e: any) {
    this.dataGrid.instance.addRow();
  }


  saveDataGrid(e: any) {
    this.dataGrid.instance.saveEditData();
  }

  dbClickDataGrid(e: any) {
    this.popupVisible = false;
  }

  requestOrder(e: any) {
    this.popupStat = false;
    this.popupVisible = true;
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

  orderDBClick(e: any) {
    this.popupStat = true;
    this.popupVisible = !this.popupVisible;
  }

  onCodeValueChanged(e: any) {
    return;
  }

  /**
   * 파서블 엔트리 데이터 로딩 완료
   * @param e
   */
  onPEDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 11)
      this.loadingVisible = false;
  }

  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, appConfig: AppConfigService) {
    var queryParams: QueryParameter[] = [];

    queryParams.push(new QueryParameter("mandt", QueryDataType.String, "600", "", "", "", ""));
    queryParams.push(new QueryParameter("zgubn", QueryDataType.String, "A", "", "", "", ""));
    queryParams.push(new QueryParameter("startdate", QueryDataType.String, formatDate(this.startDate, 'yyyyMMdd', 'en-US'), "", "", "", ""));
    queryParams.push(new QueryParameter("enddate", QueryDataType.String, formatDate(this.endDate, 'yyyyMMdd', 'en-US'), "", "", "", ""));

    //queryParams.push(new QueryParameter("lgort", QueryDataType.String, "600", "", "", "", ""));
    //queryParams.push(new QueryParameter("umlgo", QueryDataType.String, "600", "", "", "", ""));

    var codeQuery = new QueryMessage(QueryRunMethod.Alone, "ZSDT6030", appConfig.dbTitle, "#commonSql.ZSDT6030", [], queryParams, QueryCacheType.Cached);
    var dataSet = await dataService.dbSelectToDataSet([codeQuery]);

    return dataSet.tables["ZSDT6030"].getDataObjectAny();
  }

}
