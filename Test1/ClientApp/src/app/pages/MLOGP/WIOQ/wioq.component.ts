import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { formatDate } from '@angular/common';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZMMT3051Model } from '../../../shared/dataModel/MLOGP/Zmmt3051';
import ArrayStore from 'devextreme/data/array_store';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZMMT3050Model } from '../../../shared/dataModel/MLOGP/Zmmt3050';
import { ZMMFROMGWGrirModel, ZMMS0210Model, ZMMS9900Model } from '../../../shared/dataModel/MLOGP/ZmmFromGwGrir';
import { ParameterDictionary, ThemeManager } from '../../../shared/app.utilitys';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { alert, confirm } from "devextreme/ui/dialog";
import { ZSDT6910Model } from '../../../shared/dataModel/MLOGP/Zsdt6910';

/**
 *
 *차량 입출문 현황 component
 * */


@Component({
  templateUrl: 'wioq.component.html',
  providers: [ImateDataService]
})

export class WIOQComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  @ViewChild('orderDataGrid', { static: false }) orderDataGrid!: DxDataGridComponent;
  @ViewChild('mainDataGrid', { static: false }) mainDataGrid!: DxDataGridComponent;
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;

  orderData: any;

  //그리드선택 행
  selectedRows: any;
  //줄 선택
  selectedRowIndex = -1;
  selectedItemKeys: any[] = [];

  //날짜 조회
  now: Date = new Date();
  startDate: any;
  endDate: any;

  //date box
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  zsdt6910: ZSDT6910Model;
  zmmt3051: ZMMT3051Model;
  zmmt3051Data: ZMMT3051Model;
  //필터
  loadPanelOption: any;
  customOperations!: Array<any>;
  collapsed: any;
  popupPosition: any;
  saleAmountHeaderFilter: any;
  rowCount1: any;
  rowCount2: any;
  rowCount3: any;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 석고 차량 입출문 현황";


    //조회날짜 초기값
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate()), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    this.dataLoad(this.dataService, this);
  }
  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  //조회버튼
  searchButton(e: any) {
    this.dataLoad(this.dataService, this);
  }


  //데이터로드
  public async dataLoad(dataService: ImateDataService, thisObj: WIOQComponent) {

    var sdate = formatDate(this.startDate, "yyyyMMdd", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMdd", "en-US")
    var resultModel = await dataService.SelectModelData<ZSDT6910Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT6910ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND LFDAT >= ${sdate} AND LFDAT <= ${edate}`, "", QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["DOCNO", "LFDAT","VBELN"],
        data: resultModel
      });
    this.orderDataGrid.instance.getScrollable().scrollTo(0);


    
  }


  
  //반출증 클릭
  takeOutSpecific() {
    let selectData = this.orderDataGrid.instance.getSelectedRowsData()[0];
    if (selectData.ZGW_GRIR_GUBUN == "입고") {
      alert("입고는 반출증을 뽑을 수 없습니다.", "알림");
      return;
    }

      /*let selectData = this.orderGrid.instance.getSelectedRowsData()[0];*/
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "mandt": this.appConfig.mandt,
        "izgwGubun": "G",
        "izgwSeq": selectData.ZGW_SEQ,
        "izgwDate": selectData.ZGW_DATE
      };

    setTimeout(() => { this.reportViewer.printReport("Discharge", params) });
    
  }

  //계량증명서 클릭
  weighingCertificate() {
    let selectData = this.orderDataGrid.instance.getSelectedRowsData()[0];
    /*let selectData = this.orderGrid.instance.getSelectedRowsData()[0];*/

    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "mandt": this.appConfig.mandt,
      "izgwGubun": "G",
      "izgwSeq": selectData.ZGW_SEQ,
      "izgwDate": selectData.ZGW_DATE
    };

    if (selectData.ZGW_MATNR == 103 || selectData.ZGW_MAKTX == "불화규산") {
      setTimeout(() => { this.reportViewer.printReport("Discharge_ver2", params) });

    } else {
      setTimeout(() => { this.reportViewer.printReport("WeighingCertificate", params) });
    }
  }
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }
}
