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
import { Service, Status, Data2 } from '../SHPI/app.service';
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
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';
import { LFA1BpModel } from '../../../shared/dataModel/OBPPT/Lfa1Bp';
import { LFA1Model } from '../../../shared/dataModel/MLOGP/Lfa1CustomProxy';
import { ZSDIFPORTALSAPLELIQSndModel, ZSDS6430Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqSnd';
import { CarList } from '../SHPC/app.service';
//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shpi.component.html',
  providers: [ImateDataService, Service]
})



export class SHPIComponent {
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
  @ViewChild('imtdlnrEntery', { static: false }) imtdlnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('imtdlnrEntery1', { static: false }) imtdlnrEntery1!: CommonPossibleEntryComponent;
  @ViewChild('imzcarnoModiCodeEntery', { static: false }) imzcarnoModiCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('imdd07tCarEntery', { static: false }) imdd07tCarEntery!: CommonPossibleEntryComponent;
  /* Entry  선언 */


  //출하지점
  vsCode!: TableCodeInfo;
  //비료창고
  lgCode!: TableCodeInfo;
  //제품구분(비료:10, 친환경:40)
  maraCode!: TableCodeInfo;

  //제품코드
  matnrCode!: TableCodeInfo;
  //임가공제품코드
  immatnrCode!: TableCodeInfo;
  //하차 방법
  dd07tCode!: TableCodeInfo;

  //화물차종
  dd07tCarCode: TableCodeInfo;
  //화물차종
  imdd07tCarCode: TableCodeInfo;
  //용도 정보
  tvlvCode: TableCodeInfo;

  //파레트유형
  zpalCode!: TableCodeInfo;

  lgNmList: T001lModel[] = [];
  tdNmList: LFA1Model[] = [];
  chemCarNmList: CarList[] = [];
  oilCarNmList: CarList[] = [];

  //운송사
  tdlnrCode!: TableCodeInfo;
  tdlnr1Code!: TableCodeInfo;
  //운송사
  imtdlnrCode!: TableCodeInfo;
  imtdlnr1Code!: TableCodeInfo;
  //2차운송사
  z4parvwCode!: CommonCodeInfo;

  //차량번호
  zcarnoChemCode!: TableCodeInfo;
  //차량번호
  zcarnoOilCode!: TableCodeInfo;

  //차량번호(수정)
  zcarnoModiCode!: TableCodeInfo;
  //차량번호(수정)
  imzcarnoModiCode!: TableCodeInfo;

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
  //화물차종
  imzcarValue!: string | null;

  cancelVisible: boolean = false;
  //자재코드
  matnrValue: string | null;
  //임가공자재코드
  immatnrValue: string | null;
  //운송사
  tdlnrValue!: string | null;
  tdlnrValue1!: string | null;
  //운송사
  imtdlnrValue!: string | null;
  imtdlnrValue1!: string | null;

  //차량번호(수정)
  zcarnoModiValue!: string | null;
  //차량번호(수정)
  imzcarnoModiValue!: string | null;

  //2차운송사
  z4parvwValue!: string | null;

  savebutton: boolean = true;
  ////차량번호
  //zcarnoValue!: string | null;

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
  modify2: boolean = false;
  selectStatus: string = "30";
  selectData2: string = "20";
  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "shpi";

  dataSource: any;
  //거래처


  rolid: string[] = [];

  //유류전용 필드 여부
  isOilVisible = false;

  //화학전용 필드 여부
  isChemVisible = false;

  //정보
  orderData: any;
  orderGridData: ZSDS6430Model[] = [];

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

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출고내역조회 - 액상";

    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.lgCode = appConfig.tableCode("저장위치");
    this.zcarnoChemCode = appConfig.tableCode("화학차량");
    this.zcarnoOilCode = appConfig.tableCode("유류차량");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoChemCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoOilCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    let usrInfo = authService.getUser().data;

    this.rolid = usrInfo.role;

    this.getLgortNm();

    //date
    var now = new Date();
    /*this.startDate = formatDate(now.setDate(now.getDate()), "yyyy-MM-dd", "en-US");*/
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

        if (this.startDate > this.endDate) {
          alert("종료일자를 시작일자 이후로 설정해주세요.", "알림");
          return;
        }

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
      if (e.value === "20") {
        this.isOilVisible = false;
        this.isChemVisible = true;
      }
      else {
        this.isOilVisible = true;
        this.isChemVisible = false;
      }
        

    }, 100);
  }

  onStatusValueChanged(e: any) {
    this.selectStatus = e.value;


  }


  //첫화면 데이터 조회 RFC
  public async dataLoad(thisObj: SHPIComponent) {

    var tdlnr1 = "";
    var tdlnr2 = "";

    var zsds6430: ZSDS6430Model[] = [];
    //thisObj.orderGridData = [];

    var lgort = "";
    var vstel = "";

    if (this.selectData2 === "20")
      vstel = "4000";
    else
      lgort = "6000";

    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", lgort, "", this.selectData2, new Date("0001-01-01"), new Date("0001-01-01"), "", "", vstel,
      "C", "", "", "", "", "", zsds6430, this.startDate, this.endDate);

    //var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", lgort, "", this.selectData2, new Date("0001-01-01"), new Date("0001-01-01"), "", "", vstel,
    //  "", "", "", "", "", "40", zsds6430, this.startDate, this.endDate);


    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);
    thisObj.orderGridData = resultModel[0].IT_DATA;
    console.log(resultModel);
    /*thisObj.orderGridData = resultModel[0].IT_DATA.filter(item => item.ZSHIPSTATUS === "40" || item.ZSHIPSTATUS === "30");*/
    thisObj.orderGridData.forEach(async (row: ZSDS6430Model) => {
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

      row.Z_N_WEI_REL = row.Z_N_WEI_TOT - row.Z_N_WEI_EMP;

      if (this.selectData2 === "20") {
        var lifnr = thisObj.chemCarNmList.find(item => item.ZCARNO === row.ZCARNO)
        if (lifnr !== undefined) {
          row.LIFNRT = lifnr.ZOWNERNAME;
        }
      } else {
        var lifnr = thisObj.oilCarNmList.find(item => item.ZCARNO === row.ZCARNO)
        if (lifnr !== undefined) {
          row.LIFNRT = lifnr.ZOWNERNAME;
        }
      }

      
    });

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

    let tdDataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.tdlnrCode);
    let chemCarSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.zcarnoChemCode);
    let oilCarSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.zcarnoOilCode);

    this.tdNmList = tdDataSet?.tables["CODES"].getDataObject(LFA1Model);
    this.chemCarNmList = chemCarSet?.tables["CODES"].getDataObject(CarList);
    this.oilCarNmList = oilCarSet?.tables["CODES"].getDataObject(CarList);
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
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `출고내역-포장재_${formatDate(new Date(), 'yyyyMMdd', "en-US")}.xlsx`);
        });
    }).then(function () {
      //e.component.columnOption('ID', 'visible', false);
      //e.component.endUpdate();
      return;
    });

    e.cancel = true;
  }
}
