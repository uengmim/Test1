/*
 * 재고현황확인
 */
import { NgModule, Component, enableProdMode, ViewChild, Input, AfterViewInit } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, OrderData, CheOrderData, Data } from '../OWIB/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZMMCURRStockModel, ZMMS3120Model, ZMMS3140Model } from '../../../shared/dataModel/OWHP/ZmmCurrStockProxy';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { debug } from 'util';
import { CodeInfoType, TableCodeInfo } from '../../../shared/app.utilitys';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AuthService } from '../../../shared/services';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZSDT7110Model } from '../../../shared/dataModel/MLOGP/Zsdt7110';
import { T001lModel } from '../../../shared/dataModel/MLOGP/T001l';
import ArrayStore from 'devextreme/data/array_store';



//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'owib.component.html',
  providers: [ImateDataService, Service]
})

export class OWIBComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('arehouseEntery', { static: false }) arehouseEntery!: CommonPossibleEntryComponent;

  //data
  dataSource: any;

  loadPanelOption: any;

  //셀렉트박스
  data!: Data[];
  selectData: string;

  //정보
  mainGridData: any;
  sort: string[];

  //날짜 조회
  startDate: any;
  endDate: any;

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;
  currentFilter: any;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 조회 버튼
  searchButtonOptions: any;
  exportSelectedData: any;


  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //파서블엔트리 선택값
  lgortValue: string | null = "";

  lgortCode: TableCodeInfo;
  lifnrValue: string | null = null;

  btnVisible: boolean;

  kunweValueA: string | null = "";

  private loadePeCount: number = 0;

  //줄 선택
  selectedRowIndex = -1;

  empId: string = "";
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";
  rolid: string[] = [];
  userid: string = "";

  checkList: ZMMS3140Model[] = [];

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  enteryLoading: boolean = false;

  lgNmList: T001lModel[] = [];

  //0재고 제외 체크박스
  isRemoveZeroStock = true;

  /**
* 데이터 스토어 키
* */
  dataStoreKey: string = "owib";

  constructor(private dataService: ImateDataService, service: Service, imInfo: ImateInfo, http: HttpClient, private appInfo: AppInfoService, private appConfig: AppConfigService, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 재고현황확인";
    let page = this;

    this.loadingVisible = true;

    this.lgortCode = appConfig.tableCode("전체창고");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgortCode),

    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    let userInfo = this.authService.getUser().data;

    //this.empId = userInfo?.empId.padStart(10, '0');
    this.rolid = userInfo?.role;
    this.vorgid = userInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = userInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = userInfo.orgOption.torgid.padStart(10, '0');
    this.empId = this.corgid;

    this.lgortValue = "";

    this.getLgortNm();

    //정보
    this.sort = service.getSort();

    //셀렉터 데이터
    this.selectData = "10";

    //정보
    this.data = service.getData();

    //this.mainGridData = new CustomStore(
    //  {
    //    key: ["LGORT", "MATNR"],
    //    load: function (loadOptions) {
    //      return page.dataLoad(this);
    //    }
    //  });

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadPanelOption = { enabled: true };
        this.loadingVisible = true;
        await this.dataLoad(this);
        this.loadingVisible = false;
      },
    };

    //엑셀버튼
    this.exportSelectedData = {
      icon: 'export',
      onClick: () => {
        //this.dataGrid.instance.exportToExcel(true);

      },
    };



    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $100',
      value: ['oilSetAmount', '<', 3000],
    }, {
      text: '$100 - $200',
      value: [
        ['PARoilSetAmountAM9', '>=', 3000],
        ['oilSetAmount', '<', 5000],
      ],
    }, {
      text: '$300 - $400',
      value: [
        ['oilSetAmount', '>=', 5000],
        ['oilSetAmount', '<', 10000],
      ],
    }, {
      text: '$400 - $500',
      value: [
        ['oilSetAmount', '>=', 10000],
        ['oilSetAmount', '<', 20000],
      ],
    }, {
      text: 'Greater than $500',
      value: ['oilSetAmount', '>=', 20000],
    }];
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


  private async dataLoad(thisObj: OWIBComponent) {
    var zeroStock = "";
    if (this.isRemoveZeroStock === true)
      zeroStock = "X";
    else
      zeroStock = "";

    var model: ZMMS3140Model = new ZMMS3140Model(this.lgortValue, "", "", "", "", "", "", this.selectData, "", "", DIMModelStatus.UnChanged);
    var rfcModelList: ZMMCURRStockModel[] = [new ZMMCURRStockModel(zeroStock, "1000", [], [model], DIMModelStatus.UnChanged)];
    
    var result = await this.dataService.RefcCallUsingModel<ZMMCURRStockModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMCURRStockModelList", rfcModelList, QueryCacheType.None);

    this.mainGridData = new ArrayStore(
      {
        key: ["LGORT", "MATNR"],
        data: result[0].ET_LIST
      });
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }

  onPEDataLoaded(e: any) {
    this.loadePeCount++;

    if (this.loadePeCount >= 1) {
      this.enteryLoading = true;
      var setVal = this.lgNmList.find(item => item.KUNNR === this.empId)
      if (setVal !== undefined)
        this.lgortValue = setVal.LGORT;
      else
        this.lgortValue = "3000";

      this.loadePeCount = 0;
      
      this.dataLoad(this);
      this.loadingVisible = false;
    }
  }

  async getLgortNm() {

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.lgortCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(T001lModel);
    this.lgNmList = resultModel;
  }

  /**
   * On Exporting Excel
   * */
  onExportingOrderData(e: any) {
    //e.component.beginUpdate();
    //e.component.columnOption('ID', 'visible', true);
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');
    exportDataGrid({
      component: this.dataGrid.instance,
      worksheet: worksheet,
      customizeCell: function (options) {
        const excelCell = options.excelCell;
        excelCell.font = { name: 'Arial', size: 12 };
        excelCell.alignment = { horizontal: 'left' };
      }
    }).then(function () {
      workbook.xlsx.writeBuffer()
        .then(function (buffer: BlobPart) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `재고현황_${formatDate(new Date(), "yyyyMMdd", "en-US")}.xlsx`);
        });
    }).then(function () {
      //e.component.columnOption('ID', 'visible', false);
      //e.component.endUpdate();
      return;
    });

    /*e.cancel = true;*/
  }
}
