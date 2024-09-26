import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CommonCodeInfo, ParameterDictionary, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { Service, Status, Data2 } from '../SHPO/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
  DxFormComponent,
  DxPopupComponent,
  DxSelectBoxComponent,
} from 'devextreme-angular';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';
import ArrayStore from 'devextreme/data/array_store';
import { ZSDS6410Model, ZSDIFPORTALSAPLE028SndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Snd';
import { ZSDS6400Model, ZSDIFPORTALSAPGIRcvModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapGiRcvProxy';
import { ZSDS6420Model, ZSDIFPORTALSAPLE028RcvModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Rcv';

import { confirm, alert } from "devextreme/ui/dialog";
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { ZMMT1320Model } from '../../../shared/dataModel/OWHP/Zmmt1320Proxy';
import { async } from 'rxjs';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZMMGOODSMVTCommonModel, ZMMS3130Model } from '../../../shared/dataModel/OWHP/ZmmGoodsmvtCommonProxy';
import { deepCopy } from '../../../shared/imate/utility/object-copy';
import { T001lModel } from '../../../shared/dataModel/MLOGP/T001l';

import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { bottom } from '@devexpress/analytics-core/analytics-elements-metadata';
import { ZSDT7110Model } from '../../../shared/dataModel/MLOGP/Zsdt7110';
import { LFA1Model } from '../../../shared/dataModel/MLOGP/Lfa1CustomProxy';
//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shpo.component.html',
  providers: [ImateDataService, Service]
})



export class SHPOComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('sort', { static: false }) sort!: DxSelectBoxComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: CommonPossibleEntryComponent;
  //비료창고
  lgCode!: TableCodeInfo;
  //제품구분(비료:10, 친환경:40)
  maraCode!: TableCodeInfo;


  lgNmList: T001lModel[] = [];
  tdNmList: LFA1Model[] = [];

  //운송사
  tdlnrCode!: TableCodeInfo;
  tdlnr1Code!: TableCodeInfo;
  //운송사
  imtdlnrCode!: TableCodeInfo;
  imtdlnr1Code!: TableCodeInfo;
  //2차운송사
  z4parvwCode!: CommonCodeInfo;


  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //셀렉트박스
  data2!: Data2[];
  status!: Status[];
  sort2!: string[];
  releaseVisible: boolean = false;
  //조회컬럼조절
  isColVisible: boolean = true;

  isDisableField: boolean = false;

  selectData2: string = "1000";
  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "shpo";

  dataSource: any;
  //거래처


  rolid: string[] = [];

  //비료창고
  lgCodeValue: string | null = null;

  //정보
  orderData: any;
  orderGridData: ZSDS6410Model[] = [];

  //임가공 원데이터
  imOrderList40: ZMMT1320Model[] = [];
  imOrderList50: ZMMT1320Model[] = [];

  //납품총수량-배차량
  possible!: number;
  //날짜 조회
  startDate: any;
  endDate: any;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 추가 버튼
  addButtonOptions: any;
  addButtonOptions2: any;
  //데이터 저장 버튼
  shipmentProcessing: any;
  saveButtonOptions2: any;
  saveButtonOptions4: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //상세 추가 버튼
  addDetailButtonOptions: any;

  //편집 취소 버튼
  cancelEditButtonOptions: any;
  loadPanelOption: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //줄 선택
  selectedRowIndex = -1;
  //팝업데이터
  popupData: any; // 팝업위
  addFormData!: any; //팝업아래
  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;
  closeButtonOptions: any;
  closeButtonOptions2: any;
  closeButtonOptions3: any;
  closeButtonOptions4: any;
  popupVisible = false;
  popupVisibleIm = false;
  //버튼
  certificate: boolean = false;
  collapsed: any;
  //배차팝업 선택값
  selectGrid2Data: ZSDS6400Model[] = [];
  //_dataService: ImateDataService;

  checkVal: boolean = true;

  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";
  empId: string = "";

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출고내역조회 - 포장재(사외창고)";


    //정보
    this.data2 = service.getData2();

    this.lgCode = appConfig.tableCode("저장위치");
    this.tdlnrCode = appConfig.tableCode("운송업체")

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnrCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    let userInfo = authService.getUser().data;

    //this.lgCodeValue = userInfo?.empId.padStart(10, '0') ?? "";
    this.rolid = userInfo.role;
    this.corgid = userInfo.orgOption.corgid.padStart(10, '0');
    this.empId = this.corgid;

    this.getLgortNm();

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        /*this.loadPanelOption = { enabled: true };*/
        this.loadingVisible = true;

        await this.dataLoad(this);
        this.loadingVisible = false;


      },
    };

  }
  public async dateLoad(dataService: ImateDataService) {

    var sdate = formatDate(this.startDate, "yyyyMMDD", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMDD", "en-US")

  };



  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };


  async onData2ValueChanged(e: any) {
    setTimeout(async () => {
      this.selectData2 = e.value;
    }, 100);
  }

  //첫화면 데이터 조회 RFC
  public async dataLoad(thisObj: SHPOComponent) {

    var lgortVal = "";
    var role = this.rolid.find(item => item === "ADMIN");

    if (role === undefined) {
      var result7110Model = await this.dataService.SelectModelData<ZSDT7110Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7110ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND KUNNR = '${this.empId}' `, "", QueryCacheType.None);

      if (result7110Model.length > 0) {
        lgortVal = result7110Model[0].LGORT ?? "X";
        this.lgCodeValue = result7110Model[0].LGORT ?? "X";
      }
    }

    var tdlnr1 = "";
    var tdlnr2 = "";

    //권한 구분하기(비료, 화학 1차운송사)
    var tdl1 = this.rolid.find(item => item !== "R08" && item !== "R18");
    //권한 구분하기(비료, 화학 2차운송사)
    var tdl2 = this.rolid.find(item => item === "R08" || item === "R18");

    //var td1Value = tdl1 !== undefined ? this.torgid : "";
    var td2Value = tdl2 !== undefined ? this.torgid : "";
    var td1Value = tdl1 !== undefined ? "" : "";

    var zsds6410: ZSDS6410Model[] = [];
    //thisObj.orderGridData = [];

    //포장재 or 임가공
    if (thisObj.selectData2 !== "9999") {
      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", this.lgCodeValue, "", new Date("0001-01-01"), new Date("0001-01-01"), "", "", this.selectData2, "", td1Value, td2Value, "", "", "", zsds6410, this.startDate, this.endDate);

      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);
      /*thisObj.orderGridData = resultModel[0].IT_DATA;*/

      thisObj.orderGridData = resultModel[0].IT_DATA.filter(item => (item.ZSHIPSTATUS === "40" || item.ZSHIPSTATUS === "30") && (item.LGORT !== "3000" && item.LGORT !== "3200"));

      thisObj.orderGridData.forEach(async (row: ZSDS6410Model) => {
        row.ZMENGE3 = row.ZMENGE2;
        row.LGOBE = thisObj.lgNmList.find(item => item.LGORT === row.LGORT)?.LGOBE;
        row.ZLGOBE = thisObj.lgNmList.find(item => item.LGORT === row.ZLGORT)?.LGOBE;
        row.Z4PARVWTXT = thisObj.tdNmList.find(item => item.LIFNR === row.Z4PARVW)?.NAME1;
        if (row.WBSTK == "C") {
          row.STATUS_TEXT = "출고확정";
        }
        else {
          row.STATUS_TEXT = "출고확정 대기";
        }
      });


    }
    else {
      /*
      //대기상태
      thisObj.imOrderList40 = await thisObj.dataService.SelectModelData<ZMMT1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList",
        [thisObj.appConfig.mandt, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', ""), "40", ""],
        "", "A.VBELN", QueryCacheType.None);

      thisObj.imOrderList40.forEach(async (row: ZMMT1320Model) => {
        thisObj.orderGridData.push(new ZSDS6410Model(row.VBELN, "", "", "", "", "", "", "", row.SC_R_DATE, row.IDNRK, row.MAKTX, row.SC_R_MENGE, row.SC_L_MENGE,
          row.MEINS, "9999", row.SC_L_MENGE, 0, undefined, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_L_DATE, "", "", 0, "", "", "", "","", "", ""));
      })
      
      //확정상태
      thisObj.imOrderList50 = await thisObj.dataService.SelectModelData<ZMMT1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList",
        [thisObj.appConfig.mandt, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', ""), "50", ""],
        "", "A.VBELN", QueryCacheType.None);

      thisObj.imOrderList50.forEach(async (row: ZMMT1320Model) => {
        thisObj.orderGridData.push(new ZSDS6410Model(row.VBELN, "", "", "", "", "", "", "", row.SC_R_DATE, row.IDNRK, row.MAKTX, row.SC_R_MENGE, row.SC_L_MENGE,
          row.MEINS, "9999", row.SC_L_MENGE, 0, undefined, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_L_DATE, "", "", 0, "", "", "", "", "", "", ""));
      })

      thisObj.orderGridData.forEach(async (row: ZSDS6410Model) => {
        row.ZMENGE3 = row.ZMENGE2;
        if (row.ZSHIPSTATUS == "50") {
          row.STATUS_TEXT = "출고확정";
        } else {
          row.STATUS_TEXT = "출고확정 대기";
        }
      });
      */
    }

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: thisObj.orderGridData
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
    if (this.loadePeCount >= 1) {
      this.loadePeCount = 0;
      this.dataLoad(this);
      this.loadingVisible = false;

    }
  }
  async getLgortNm() {

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.lgCode);
    let dataSet2 = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.tdlnrCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(T001lModel);
    var resultModel2 = dataSet?.tables["CODES"].getDataObject(LFA1Model);
    this.lgNmList = resultModel;
    this.tdNmList = resultModel2;
  }

  /**
   * On Exporting Excel
   * */
  onExportingOrderData(e) {
    //e.component.beginUpdate();
    //e.component.columnOption('ID', 'visible', true);
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');
    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      customizeCell: function (options) {
        const excelCell = options.excelCell;
        excelCell.font = { name: 'Arial', size: 12 };
        excelCell.alignment = { horizontal: 'left' };
      }
    }).then(function () {
      workbook.xlsx.writeBuffer()
        .then(function (buffer: BlobPart) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `출고내역-포장재(사외창고)_${formatDate(new Date(), 'yyyyMMdd', "en-US")}.xlsx`);
        });
    }).then(function () {
      //e.component.columnOption('ID', 'visible', false);
      //e.component.endUpdate();
      return;
    });

    e.cancel = true;
  }
}
