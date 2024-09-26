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
import { Service, Status, Data2 } from '../SHPR/app.service';
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
import { ZMMT1321Join1320Model } from '../../../shared/dataModel/MLOGP/Zmmt1320Join1321';
import { TdlType } from './app.service';
//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shpr.component.html',
  providers: [ImateDataService, Service]
})



export class SHPRComponent {
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
  dataStoreKey: string = "shpr";

  dataSource: any;
  //거래처

  tdlType: TdlType[] = [];
  selectTdlType = "1";

  //정보
  orderData: any;
  orderGridData: ZSDS6410Model[] = [];

  //임가공 원데이터
  imOrderList: ZMMT1321Join1320Model[] = [];

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

  empid: string = "";
  empid2: string = "";
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";
  rolid: string[] = [];

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService,
    private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 화물위수탁증 발행";

    //로그인 사용자 정보
    let usrInfo = authService.getUser().data;
    this.vorgid = usrInfo.orgOption.vorgid;
    this.corgid = usrInfo.orgOption.corgid;
    this.torgid = usrInfo.orgOption.torgid;

    this.rolid = usrInfo.role;
    if(this.rolid.find(item=>item ==="ADMIN") === undefined)
      this.empid = this.torgid.padStart(10, '0');

    if (this.rolid.find(item => item !== "R07" && item !== "R17" && item !== "ADMIN") !== undefined) {
      this.empid = "";
      this.empid2 = this.torgid.padStart(10, '0');
    }

    this.loadingVisible = true;

    this.tdlType = service.getTdlType();

    this.vsCode = appConfig.tableCode("출하지점");
    this.lgCode = appConfig.tableCode("저장위치");
    /*this.maraCode = appConfig.tableCode("제품구분");*/
    //this.dd07tCode = appConfig.tableCode("RFC_하차정보");
    //this.dd07tCarCode = appConfig.tableCode("RFC_화물차종");
    //this.tvlvCode = appConfig.tableCode("용도구분");
    //this.zpalCode = appConfig.tableCode("RFC_파레트유형");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    //this.tdlnr1Code = appConfig.tableCode("운송업체");
    //this.zcarnoCode = appConfig.tableCode("비료차량");
    //this.zcarnoModiCode = appConfig.tableCode("비료차량");
    //this.z4parvwCode = appConfig.commonCode("운송사");
    //this.matnrCode = appConfig.tableCode("비료제품명");
    //this.immatnrCode = appConfig.tableCode("임가공제품명");
    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.vsCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maraCode),*/
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tvlvCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnr1Code),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoModiCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.z4parvwCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.immatnrCode)
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;

    this.vsValue = "";
    this.lgValue = "";
    this.zunloadValue = "";
    this.vkausValue = "";
    this.zpalValue = "";
    this.zcarValue = "";
    this.zcarnoValue = "";
    this.zcarnoModiValue = "";
    this.z4parvwValue = ""
    this.tdlnrValue = ""
    this.tdlnrValue1 = ""
    this.matnrValue = "";
    this.immatnrValue = "";
    //date
    var now = new Date();
    /*this.startDate = formatDate(now.setDate(now.getDate() - 1), "yyyy-MM-dd", "en-US");*/
    this.startDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    //정보
    this.data2 = service.getData2();
    this.status = service.getStatus();
    //1차2차운송사 구분


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


      },
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
  //조회더블클릭
  //orderDBClick(e: any) {
  //  var selectData = this.orderGrid.instance.getSelectedRowsData();

  //  //this.popupData.push(new ZSDS6420Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].VRKME, 0, 0, this.startDate, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS, selectData[0].ZSHIPMENT_NO, this.endDate, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, 0, selectData[0].ZTEXT, selectData[0].MTY, selectData[0].MSG));
  //  //this.popupData2 = { VBELN: selectData[0].VBELN, POSNR: selectData[0].POSNR, ZMENGE2: selectData[0].ZMENGE2, WADAT_IST: selectData[0].WADAT_IST };
  //  this.popupVisible3 = !this.popupVisible3;
  //}


  async onData2ValueChanged(e: any) {
        this.loadingVisible = true;
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


            await this.dataLoad(this);
            this.loadingVisible = false;
    }, 100);
  }

  onStatusValueChanged(e: any) {
    this.selectStatus = e.value;


  }

  //운송사 구분
  onGubunValueChanged(e: any) {
    this.selectTdlType = e.value;
  }


  //첫화면 데이터 조회 RFC
  public async dataLoad(thisObj: SHPRComponent) {


    var zsds6410: ZSDS6410Model[] = [];
    thisObj.orderGridData = [];

    var tdlnr1 = "";
    var tdlnr2 = "";

    if (this.selectTdlType === "1")
      tdlnr1 = this.torgid.padStart(10, '0');
    else
      tdlnr2 = this.torgid.padStart(10, '0');

    //포장재 or 임가공
    if (thisObj.selectData2 !== "9999") {
      this.isColVisible = true;

      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "", "", this.startDate, this.endDate, "", "", this.selectData2, "X", tdlnr1, tdlnr2, "", "", this.selectStatus, zsds6410);

      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);

      thisObj.orderGridData = resultModel[0].IT_DATA.filter(item => item.SPART !== "30");
      /*thisObj.orderGridData = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C" && (item.ZSHIPSTATUS === "30" || item.ZSHIPSTATUS === "40"));*/
      thisObj.orderGridData.forEach(async (row: ZSDS6410Model) => {
        var tdlnrText = this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.Z4PARVW);
        if (tdlnrText !== undefined)
          row.Z4PARVWTXT = tdlnrText.NAME1;

        var lgortText = this.lgEntery.gridDataSource._array.find(item => item.LGORT === row.LGORT);
        if (lgortText !== undefined)
          row.LGOBE = lgortText.LGOBE;

        var zlgortText = this.lgEntery.gridDataSource._array.find(item => item.LGORT === row.ZLGORT);
        if (zlgortText !== undefined)
          row.ZLGOBE = zlgortText.LGOBE;
      });


    }
    else {
      this.isColVisible = false;
      //배차상태가 50이 생기면 없애도 됨
      var whereCondi = "";

      this.imOrderList = await thisObj.dataService.SelectModelData<ZMMT1321Join1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321Join1320List",
        [thisObj.appConfig.mandt, this.appConfig.plant, `'20', '30', '40'`, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', "")
          , this.empid, this.empid2, `'${this.selectStatus}'`, whereCondi], "", "A.VBELN", QueryCacheType.None);

      thisObj.imOrderList.forEach(async (row: ZMMT1321Join1320Model) => {
        thisObj.orderGridData.push(new ZSDS6410Model(row.VBELN, row.POSNR, "", "", "", "", "", "", row.SC_R_DATE_R, row.IDNRK, row.MAKTX, row.SC_R_MENGE, row.SC_L_MENGE,
          row.MEINS, "9999", row.SC_S_MENGE, row.SC_G_MENGE, row.SC_G_DATE, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_S_DATE, "", "", 0, "", "", "", "", "", "", row.BLAND_F_NM,
          this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.TDLNR1)?.NAME1, this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.TDLNR2)?.NAME1, row.BLAND_T_NM));
      })
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
    if (this.loadePeCount >= 2) {
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
    if (selectData[0].VSTEL !== "9999") {
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "itddatFrom": selectData[0].TDDAT,
        "itddatTo": selectData[0].TDDAT,
        "ivbeln": selectData[0].VBELN,
        "ivstel": selectData[0].VSTEL,
        "mandt": this.appConfig.mandt
      };

      setTimeout(() => { this.reportViewer.printReport("SHPQReport", params) });
    }
    else {
      //임가공 명세서
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "mandt": this.appConfig.mandt,
        "ivbeln": selectData[0].VBELN,
        "iposnr": selectData[0].POSNR
      };

      setTimeout(() => { this.reportViewer.printReport("SHPQReport2", params) });
    }
  }

  //거래명세서
  async TeansactionPrint(e: any) {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }
    if (selectData[0].VSTEL !== "9999") {
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "itddatFrom": selectData[0].TDDAT,
        "itddatTo": selectData[0].TDDAT,
        "ivbeln": selectData[0].VBELN,
        /*      "vbelnvl": "",*/
        "mandt": this.appConfig.mandt
      };

      setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction2", params) });
    } else {
      //임가공 명세서
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "mandt": this.appConfig.mandt,
        "ivbeln": selectData[0].VBELN,
        "iposnr": selectData[0].POSNR
      };

      setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction4", params) });
    }
  }

}
