import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService, } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { Service, Employee, State, State2, State3, State4, State5, State6, State7 } from './app.service';
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
import { AppInfoService, AuthService } from '../../../shared/services';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CodeInfoType, TableCodeInfo } from '../../../shared/app.utilitys';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ZSDIFPORTALSAPSDNHISPSndModel, ZSDS5050Model } from '../../../shared/dataModel/MFSAP/ZsdIfPortalSapSdNhispSndProxy';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*보관검수 대비 실출고량 Component*/


@Component({
  templateUrl: 'ksre.component.html',
  providers: [ImateDataService, Service]
})

export class KSREComponent {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;
  @ViewChild('kunnrEntery3', { static: false }) kunnrEntery3!: TablePossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: TablePossibleEntryComponent;
  //UI 데이터 로딩 패널

  loadingVisible: boolean = false;
  kunnCode: TableCodeInfo;
  lgCode: TableCodeInfo;

  orderInfo: any;
  dataSource: any;
  orderData: any;
  //조회버튼
  searchButtonOptions: any;
  data: any;
  backButtonOption: any;
  private loadePeCount: number = 0;
  dataLoading: boolean = false;
  enteryLoading: boolean = false;
  loadPanelOption: any;
  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "ksre";
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

  /*Entery value 선언*/
  kunnrValue!: string | null;
  //비료창고
  lgValue!: string | null;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | 보관검수대비 실출고량";
    this.dataSource = this.makeAsyncDataSource(service);
    this.kunnCode = appConfig.tableCode("비료납품처");
    this.lgCode = appConfig.tableCode("비료창고");
    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),

    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------

    this.kunnrValue = "";
    this.lgValue = "";
    const that = this;
    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;
    let modelTest01 = this;
    this.loadingVisible = true;
    this.loadPanelOption = { enabled: false };
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
        this.dataLoad();
      },
    };
    };
    
  makeAsyncDataSource(service: Service) {
    return new CustomStore({
      loadMode: 'raw',
      key: ['placeOrder', 'placeDeli', 'PlaceTarget', 'deliNum', "product"],
      load() {
        return service.getEmployees();
      },
    });
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

  //데이터로드
  public async dataLoad() {
    var zsds5050: ZSDS5050Model[] = [];
    var zsdsIf = new ZSDIFPORTALSAPSDNHISPSndModel("", "", this.startDate, new Date(), "", "", this.kunnrEntery3.selectedValue ?? "", "", this.lgEntery.selectedValue ?? "", "",  "", "", "", "", "", "", "", "", "", "", "", "", "", "", zsds5050);
    var model: ZSDIFPORTALSAPSDNHISPSndModel[] = [zsdsIf];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSDNHISPSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSDNHISPSndModelList", model, QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: resultModel[0].T_DATA
      });
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
    if (this.loadePeCount >= 2) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      this.dataLoad();

    }
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
}
