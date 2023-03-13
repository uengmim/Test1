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
import { Service, Status, Data2 } from '../SHPQ/app.service';
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
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { T001lModel } from '../../../shared/dataModel/MLOGP/T001l';
import { ZSDS0030Model } from '../../../shared/dataModel/MLOGP/ZSDS0030';
//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shps.component.html',
  providers: [ImateDataService, Service]
})



export class SHPSComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('vsEntery', { static: false }) vsEntery!: CommonPossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: CommonPossibleEntryComponent;
  @ViewChild('maraEntery', { static: false }) maraEntery!: CommonPossibleEntryComponent;
  @ViewChild('dd07tEntery', { static: false }) dd07tEntery!: CommonPossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: CommonPossibleEntryComponent;
  @ViewChild('tvlvEntery', { static: false }) tvlvEntery!: CommonPossibleEntryComponent;
  @ViewChild('zpalEntery', { static: false }) zpalEntery!: CommonPossibleEntryComponent;
  @ViewChild('sort', { static: false }) sort!: DxSelectBoxComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEntery1', { static: false }) tdlnrEntery1!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoCodeEntery', { static: false }) zcarnoCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoModiCodeEntery', { static: false }) zcarnoModiCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('z4parvwCodeEntery', { static: false }) z4parvwCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('immatnrCodeDynamic', { static: false }) immatnrCodeDynamic!: CommonPossibleEntryComponent;
  /* Entry  선언 */
  //제품코드
  matnrCode!: TableCodeInfo;
  //임가공제품코드
  immatnrCode!: TableCodeInfo;

  //출하지점
  vsCode!: TableCodeInfo;
  //비료창고
  lgCode!: TableCodeInfo;
  //제품구분(비료:10, 친환경:40)
  maraCode!: TableCodeInfo;
  //하차 방법
  dd07tCode!: TableCodeInfo;
  //화물차종
  dd07tCarCode: TableCodeInfo;
  //용도 정보
  tvlvCode: TableCodeInfo;
  //파레트유형
  zpalCode!: TableCodeInfo;

  //운송사
  tdlnrCode!: TableCodeInfo;
  tdlnr1Code!: TableCodeInfo;
  //2차운송사
  z4parvwCode!: CommonCodeInfo;

  //차량번호
  zcarnoCode!: TableCodeInfo;

  //차량번호(수정)
  zcarnoModiCode!: TableCodeInfo;

  /*Entery value 선언*/
  //출하지점
  vsValue!: string | null;
  //비료창고
  lgValue!: string | null;
  //제품구분(비료:10, 친환경:40)
  maraValue!: string | null;
  //허처
  zunloadValue: string | null;
  //용도
  vkausValue!: string | null;
  //용도
  zpalValue!: string | null;
  //화물차종
  zcarValue!: string | null;
  cancelVisible: boolean = false;
  //자재코드
  matnrValue: string | null;
  //임가공자재코드
  immatnrValue: string | null;
  //운송사
  tdlnrValue!: string | null;
  tdlnrValue1!: string | null;
  //2차운송사
  z4parvwValue!: string | null;

  savebutton: boolean = true;
  //차량번호
  zcarnoValue!: string | null;
  //차량번호(수정)
  zcarnoModiValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;
  saveButtonOptions: any;
  //셀렉트박스
  data2!: Data2[];
  status!: Status[];
  sort2!: string[];
  releaseVisible: boolean = false;
  //조회컬럼조절
  isColVisible: boolean = true;

  isDisableField: boolean = false;
  modify: boolean = true;
  selectStatus: string = "30";
  selectData2: string = "1000";
  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "shps";

  dataSource: any;
  //거래처


  //정보
  orderData: any;
  orderGridData: ZSDS6410Model[] = [];

  //임가공 원데이터
  imOrderList: ZMMT1320Model[] = [];

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

  excelButtonOptions: any;

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
  rolid: string[] = [];

  zunloadList: ZSDS0030Model[] = [];
  zpaltypeList: ZSDS0030Model[] = [];
  lgNmList: T001lModel[] = [];

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 거래명세서 출력";

    this.loadingVisible = true;

    //사용자정보
    let userInfo = this.authService.getUser().data;

    //this.empId = userInfo?.empId.padStart(10, '0');
    this.rolid = userInfo?.role;
    this.vorgid = userInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = userInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = userInfo.orgOption.torgid.padStart(10, '0');

    this.lgCode = appConfig.tableCode("비료창고");
    this.tdlnrCode = appConfig.tableCode("운송업체")
    this.dd07tCode = appConfig.tableCode("RFC_하차정보");
    this.zpalCode = appConfig.tableCode("RFC_파레트유형");

    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;

    this.lgValue = "";

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 1), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    //정보
    this.data2 = service.getData2();
    this.status = service.getStatus();
    //1차2차운송사 구분

    this.getLgortNm();

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        /*this.loadPanelOption = { enabled: true };*/
        this.loadingVisible = true;

        await this.dataLoad(this);
        this.loadingVisible = false;
        //if (this.selectStatus === "30") {
        //  this.modify = true;
        //  this.certificate = false;
        //  this.releaseVisible = false;
        //  this.savebutton = true;
        //  this.cancelVisible = false;
        //}
        //else {
        //  this.modify = false;
        //  this.certificate = true;
        //  this.releaseVisible = true;
        //  this.savebutton = false;
        //  this.cancelVisible = true;
   
        //}

        if (this.selectData2 === "9999") {
          this.isColVisible = false;
          this.isDisableField = true;
        } else if (this.selectData2 === "1000") {
          this.isColVisible = true;
          this.isDisableField = false;
        } else {
          this.isColVisible = true;
          this.isDisableField = false;
        }


      },
    };

    this.excelButtonOptions = {
      text: "엑셀다운로드",
      onClick: async (e: any) => {
        this.onExportingOrderData(e);
      }
    };

  }

  public async dateLoad(dataService: ImateDataService) {

    var sdate = formatDate(this.startDate, "yyyyMMDD", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMDD", "en-US")



  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  selectedChanged(e: any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };


  async onData2ValueChanged(e: any) {
    /*    this.loadingVisible = true;*/
    setTimeout(async () => {
      this.selectData2 = e.value;
      //if (this.selectData2 === "9999") {
      //  this.isColVisible = false;
      //  this.isDisableField = true;
      //  this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("임가공제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      //} else if (this.selectData2 === "1000") {
      //  this.isColVisible = true;
      //  this.isDisableField = false;
      //  this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("비료제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      //} else {
      //  this.isColVisible = true;
      //  this.isDisableField = false;
      //  this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("화학제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      //}


      /*      await this.dataLoad(this);*/
      /*      this.loadingVisible = false;*/
    }, 100);
  }

  onStatusValueChanged(e: any) {
    this.selectStatus = e.value;


  }

  /**
   * On Exporting Excel
   * */
  onExportingOrderData(e:any) {
    //e.component.beginUpdate();
    //e.component.columnOption('ID', 'visible', true);
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');
    exportDataGrid({
      component: this.orderGrid.instance,
      worksheet: worksheet,
      customizeCell: function (options) {
        const excelCell = options.excelCell;
        excelCell.font = { name: 'Arial', size: 12 };
        excelCell.alignment = { horizontal: 'left' };
      }
    }).then(function () {
      workbook.xlsx.writeBuffer()
        .then(function (buffer: BlobPart) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `거래명세서_${formatDate(new Date(), "yyyyMMdd", "en-US")}.xlsx`);
        });
    }).then(function () {
      //e.component.columnOption('ID', 'visible', false);
      //e.component.endUpdate();
      return;
    });

    /*e.cancel = true;*/
  }


  //첫화면 데이터 조회 RFC
  public async dataLoad(thisObj: SHPSComponent) {


    var zsds6410: ZSDS6410Model[] = [];
    thisObj.orderGridData = [];

    //포장재 or 임가공
    if (thisObj.selectData2 !== "9999") {
      //var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "", "", this.startDate, this.endDate, "", "", this.selectData2, "", "", "", "", "",
      //  this.selectStatus, zsds6410);
      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", this.lgValue, "", this.startDate, this.endDate, "", "", this.selectData2, "C", "", "", "", "",
        "", zsds6410);

      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);
      /*thisObj.orderGridData = resultModel[0].IT_DATA;*/

      thisObj.orderGridData = resultModel[0].IT_DATA;

      thisObj.orderGridData.forEach(async (row: ZSDS6410Model) => {
        var tdlnrText = thisObj.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.Z4PARVW);
        if (tdlnrText !== undefined)
          row.Z4PARVWTXT = tdlnrText.NAME1;

        var tdlnr1Text = thisObj.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.Z3PARVW);
        if (tdlnr1Text !== undefined)
          row.Z3PARVWTXT = tdlnr1Text.NAME1;

        var lgortText = thisObj.lgEntery.gridDataSource._array.find(item => item.LGORT === row.LGORT);
        if (lgortText !== undefined)
          row.LGOBE = lgortText.LGOBE;

        var zlgortText = thisObj.lgEntery.gridDataSource._array.find(item => item.LGORT === row.ZLGORT);
        if (zlgortText !== undefined)
          row.ZLGOBE = zlgortText.LGOBE;

        var zpaltype = thisObj.zpaltypeList.find(item => item.DOMVALUE_L === row.ZPALLTP);
        if (zpaltype !== undefined)
          row.ZPALLTPT = zpaltype.DDTEXT;

        var zunload = thisObj.zunloadList.find(item => item.DOMVALUE_L === row.ZUNLOAD);
        if (zunload !== undefined)
          row.ZUNLOADT = zunload.DDTEXT;
      });
      
    }
    else {
      //배차상태가 50이 생기면 없애도 됨
      /*var whereCondi = " AND ( ( A.MBLNR = '' AND A.MBLNR_C = '' ) OR ( A.MBLNR <> '' AND A.MBLNR_C <> '' ) )"*/

      //thisObj.imOrderList = await thisObj.dataService.SelectModelData<ZMMT1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList",
      //  [thisObj.appConfig.mandt, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', ""), this.selectStatus, whereCondi],
      //  "", "A.VBELN", QueryCacheType.None);
      thisObj.imOrderList = await thisObj.dataService.SelectModelData<ZMMT1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList",
        [thisObj.appConfig.mandt, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', ""), "50", ""],
        "", "A.VBELN", QueryCacheType.None);

      thisObj.imOrderList.forEach(async (row: ZMMT1320Model) => {
        var tdlnrtxt = "";
        var tdlnrText = this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.TDLNR2);
        if (tdlnrText !== undefined)
          tdlnrtxt = tdlnrText.NAME1;

        var tdlnr1txt = "";
        var tdlnr1Text = this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.TDLNR1);
        if (tdlnr1Text !== undefined)
          tdlnr1txt = tdlnr1Text.NAME1;

        var lgorttxt = "";
        var lgortText = this.lgEntery.gridDataSource._array.find(item => item.LGORT === row.LGORT);
        if (lgortText !== undefined)
          lgorttxt = lgortText.LGOBE;

        thisObj.orderGridData.push(new ZSDS6410Model(row.VBELN, "", "", "", "", "", "", "", row.SC_R_DATE, row.IDNRK, row.MAKTX, row.SC_R_MENGE, row.SC_L_MENGE,
          row.MEINS, "9999", row.SC_L_MENGE, 0, undefined, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_L_DATE, "", "", 0, "", "", "", "", lgorttxt, tdlnr1txt, tdlnrtxt));
      })
    }

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: thisObj.orderGridData
      });

    this.orderGrid.instance.getScrollable().scrollTo(0);
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
      if (this.rolid.find(item => item === "ADMIN") === undefined) {
        var lgVal = this.lgNmList.find(item => item.KUNNR === this.corgid);
        if (lgVal !== undefined)
          this.lgValue = lgVal.LGORT;
        else
          this.lgValue = "3000";
      }

      this.loadePeCount = 0;
      this.dataLoad(this);
      this.loadingVisible = false;

    }
  }

  //화물 위수탁증
  async print(e: any) {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }
    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "itddatFrom": selectData[0].TDDAT,
      "itddatTo": selectData[0].TDDAT,
      "ivbeln": selectData[0].VBELN,
      "mandt": this.appConfig.mandt
    };
    
    setTimeout(() => { this.reportViewer.printReport("SHPQReport", params) });
  }

  //거래명세서
  async TeansactionPrint(e: any) {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }
    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "itddatFrom": selectData[0].TDDAT,
      "itddatTo": selectData[0].TDDAT,
      "ivbeln": selectData[0].VBELN,
/*      "vbelnvl": "",*/
      "mandt": this.appConfig.mandt,
      "ivstel": selectData[0].VSTEL
    };
    if (selectData[0].LGORT === "3000" || selectData[0].LGORT === "3200")
      setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction2", params) });
    else
      setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction3", params) });

  }

  //수정저장 rfc
  public async createOrder() {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    var zsds6420Model = new ZSDS6420Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].VRKME, selectData[0].ZMENGE4,
      this.addFormData.ZMENGE3, this.addFormData.WADAT_IST, this.addFormData.Z3PARVW, this.addFormData.Z4PARVW, this.addFormData.ZCARTYPE,
      this.addFormData.ZCARNO, this.addFormData.ZDRIVER, selectData[0].ZDRIVER1, this.addFormData.ZPHONE, selectData[0].ZPHONE1,
      this.addFormData.ZVKAUS, this.addFormData.ZUNLOAD, "40", this.addFormData.ZSHIPMENT_NO, this.addFormData.ZSHIPMENT_DATE,
      this.addFormData.ZPALLTP, this.addFormData.ZPALLETQTY, selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT, selectData[0].MTY, selectData[0].MSG);

    var zsds6420List: ZSDS6420Model[] = [zsds6420Model];
    var zsdModel = new ZSDIFPORTALSAPLE028RcvModel("", "", zsds6420List);
    var zsdList: ZSDIFPORTALSAPLE028RcvModel[] = [zsdModel];


    var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028RcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028RcvModelList", zsdList, QueryCacheType.None);
    return insertModel[0];
  }


  //임가공상차지시
  public async createOrder2() {

    var data = this.addFormData
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    var zmmt1320List: ZMMT1320Model[] = [];
    var rowCount: number = 0;
    var rcv = new ZSDIFPORTALSAPLE028RcvModel("", "", []);
    var insertModel: ZSDIFPORTALSAPLE028RcvModel[] = [rcv]
    var zsdsList: ZSDS6400Model[] = [];

      //임가공 CBO업데이트
      this.orderGrid.instance.getSelectedRowsData().forEach(async (array: ZSDS6410Model) => {
        var getData = this.imOrderList.find(item => item.VBELN === array.VBELN)
        if (getData !== undefined) {
          getData.ModelStatus = DIMModelStatus.Modify;
          getData.ZCARNO = data.ZCARNO;
          getData.ZCARTYPE = data.ZCARTYPE;
          getData.ZDRIVER = data.ZDRIVER;
          getData.ZPHONE = data.ZPHONE;
          //getData.SC_G_DATE = this.addFormData.WADAT_IST;
          //getData.SC_G_MENGE = this.addFormData.ZMENGE3;
          getData.SC_G_DATE = data.WADAT_IST;
          getData.SC_G_MENGE = data.ZMENGE3;
          getData.SC_G_TIME = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
            new Date().getSeconds().toString().padStart(2, '0');
          
          getData.SC_R_DATE_C = new Date();
          getData.ZSHIP_STATUS = "40";
          



          getData.SC_A_DATE = new Date("0001-01-01");
          getData.AENAM = this.appConfig.interfaceId;
          getData.AEDAT = new Date();
          getData.AEZET = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
            new Date().getSeconds().toString().padStart(2, '0');

          zmmt1320List.push(getData);
        }
      });
      rowCount = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList", zmmt1320List);

    /*if (rowCount > 0) {*/
    insertModel[0].E_MTY = "S";

    return insertModel[0];
  }

  async cancelButton(e: any) {
    var selectedData = this.orderGrid.instance.getSelectedRowsData();
    if (selectedData.length === 0) {
      alert("라인을 선택해야 합니다", "알림")
      return;
    }
    if (await confirm("취소 하시겠습니까?", "알림")) {
      selectedData[0].ZSHIPSTATUS = "30";
      this.createOrder();
      alert("취소 완료", "알림");
      this.dataLoad(this);
    }
  }

  async getLgortNm() {

    let zunloadDataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.dd07tCode);
    var zunloadModel = zunloadDataSet?.tables["CODES"].getDataObject(ZSDS0030Model);
    this.zunloadList = zunloadModel;

    let zpaltypeDataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.zpalCode);
    var zpaltypeModel = zpaltypeDataSet?.tables["CODES"].getDataObject(ZSDS0030Model);
    this.zpaltypeList = zpaltypeModel;

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.lgCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(T001lModel);
    this.lgNmList = resultModel;
  }
}
