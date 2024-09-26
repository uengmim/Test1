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
import { CodeInfoType, ParameterDictionary, TableCodeInfo, ThemeManager } from '../../../shared/app.utilitys';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { alert, confirm } from "devextreme/ui/dialog";
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { CarList } from '../SHPC/app.service';
import { ZSDIFPORTALSAPLELIQSndModel, ZSDS6430Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqSnd';
import { ZMMT1321Join1320Model } from '../../../shared/dataModel/MLOGP/Zmmt1320Join1321';
import { ZSDIFPORTALSAPLE028SndModel, ZSDS6410Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Snd';
import { ZSDIFPORTALSAPLE028RcvModel, ZSDS6420Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Rcv';
import { ZMMT1321Model } from '../../../shared/dataModel/MLOGP/Zmmt1321';
import { exportDataGrid } from 'devextreme/excel_exporter';
import jsPDF from 'jspdf';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';

/**
 *
 *차량 입출문 현황 component
 * */


@Component({
  templateUrl: 'vioq.component.html',
  providers: [ImateDataService]
})

export class VIOQComponent {
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

  CarNmList: CarList[] = [];

  //차량번호
  carDataCode: TableCodeInfo;

  dataStoreKey: string = "vioq";

  //date box
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  zmmt3050: ZMMT3050Model;
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
    appInfo.title = AppInfoService.APP_TITLE + " | 차량 입출문 현황";

    //파서블엔트리
    this.carDataCode = appConfig.tableCode("종합차량");
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.carDataCode),

    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    //차량데이터 가져오기
    this.getCarNm();

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
  public async dataLoad(dataService: ImateDataService, thisObj: VIOQComponent) {

    var sdate = formatDate(this.startDate, "yyyyMMdd", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMdd", "en-US")
    var resultModel = await dataService.SelectModelData<ZMMT3050Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3050ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND ZGW_DATE >= ${sdate} AND ZGW_DATE <= ${edate}`, "", QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["ZGW_DATE", "ZGW_SEQ"],
        data: resultModel
      });
    this.orderDataGrid.instance.getScrollable().scrollTo(0);

    if (resultModel.length > 0) {
      resultModel.forEach(async (array: any) => {
        if (array.ZGW_GRIR_GUBUN == "GR") {
          array.ZGW_GRIR_GUBUN = "입고"
        } else {
          array.ZGW_GRIR_GUBUN = "출고"

        }
      });
    }
  }
  //데이터 삭제
  public async deleteRecords(thisObj: VIOQComponent) {
    let selectData = this.orderDataGrid.instance.getSelectedRowsData()[0];
    let fmZGWDate = formatDate(new Date(selectData.ZGW_DATE), 'yyyyMMdd', "en-US");

    if (await confirm("삭제하시겠습니까?", "알림")) {
      var dataService = this.dataService
      var result3050Model = await dataService.SelectModelData<ZMMT3050Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3050ModelList", [],
        `MANDT = '${thisObj.appConfig.mandt}' AND ZGW_DATE = '${fmZGWDate}' AND ZGW_SEQ = '${selectData.ZGW_SEQ}'`, "", QueryCacheType.None);
      this.zmmt3050 = result3050Model[0];
      this.zmmt3050.ModelStatus = DIMModelStatus.Delete;
      var model3050List: ZMMT3050Model[] = [thisObj.zmmt3050];


      var result3051Model = await dataService.SelectModelData<ZMMT3051Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3051ModelList", [],
        `MANDT = '${thisObj.appConfig.mandt}' AND ZGW_DATE = '${fmZGWDate}' AND ZGW_TIME = '${selectData.ZGW_GR_TIME.replace(/:/g, '')}'`, "", QueryCacheType.None);
      if (result3051Model.length > 0) {

        this.zmmt3051 = result3051Model[0];
        this.zmmt3051.ModelStatus = DIMModelStatus.Delete;
        var model3051List: ZMMT3051Model[] = [thisObj.zmmt3051];
        this.rowCount2 = await this.dataService.ModifyModelData<ZMMT3051Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3051ModelList", model3051List);
      }
      var result3051ModelData = await dataService.SelectModelData<ZMMT3051Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3051ModelList", [],
        `MANDT = '${thisObj.appConfig.mandt}' AND ZGW_DATE = '${fmZGWDate}' AND ZGW_TIME = '${selectData.ZGW_GI_TIME.replace(/:/g, '')}'`, "", QueryCacheType.None);
      if (result3051ModelData.length > 0) {
        this.zmmt3051Data = result3051ModelData[0];
        this.zmmt3051Data.ModelStatus = DIMModelStatus.Delete;
        var modelzmmt3051List: ZMMT3051Model[] = [thisObj.zmmt3051Data];
        this.rowCount3 = await this.dataService.ModifyModelData<ZMMT3051Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3051ModelList", modelzmmt3051List);
      }
      alert("삭제되었습니다.", "알림");

      this.rowCount1 = await this.dataService.ModifyModelData<ZMMT3050Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3050ModelList", model3050List);

      this.dataLoad(this.dataService, this);
    }

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

  //남우진흥거래명세서 클릭
  async printNamwooGI() {
    let selectData = this.orderDataGrid.instance.getSelectedRowsData()[0];

    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }

    //var result = await this.datainsert(this);
    //if (result === null)
    //  return;
    var sVBELN = selectData.ZGW_DONO;
    var sVSTEL = "";
    var sPOSNR = selectData.POSNR;
    var imOrderList: ZMMT1321Join1320Model[] = []
    if (selectData.ZGW_DONO.toString().substring(0, 2) !== "00")
      sVSTEL = "9999";

    if (selectData.ZGW_DONO === "") {
      await alert("출고정보가 없는 계근정보입니다.", "알림");
      this.loadingVisible = false;
      return;

      //var realCarno = "";
      //var realCarData = this.CarNmList.find(item => item.ZCARNO.includes(selectData.ZCARNO));
      //if (realCarData === undefined)
      //  realCarno = selectData.ZCARNO;
      //else
      //  realCarno = realCarData.ZCARNO;

      //this.loadingVisible = true;
      //var zsds6430: ZSDS6430Model[] = [];
      //var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", "", "", "", new Date("0001-01-01"), new Date("0001-01-01"), "", "", "", "", "", "", realCarno, "", "", zsds6430, selectData.ZGW_DATE, selectData.ZGW_DATE);
      //var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];
      //var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);
      //if (resultModel[0].IT_DATA.length === 0) {

      //  var whereCondi = "";

      //  //일반주문 없을경우 임가공 정보 찾기
      //  imOrderList = await this.dataService.SelectModelData<ZMMT1321Join1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321Join1320CustomList",
      //    [this.appConfig.mandt, this.appConfig.plant, selectDate, realCarno, whereCondi],
      //    "", "A.VBELN", QueryCacheType.None);

      //  if (imOrderList.length === 0) {
      //    await alert("선택한 차량에 해당하는 출고정보가 없습니다.", "알림");
      //    return;
      //  } else {
      //    sVBELN = imOrderList[0].VBELN;
      //    sPOSNR = imOrderList[0].POSNR;
      //    sVSTEL = "9999";
      //  }

      //} else {
      //  sVBELN = resultModel[0].IT_DATA[0].VBELN;
      //  sVSTEL = resultModel[0].IT_DATA[0].VSTEL;
      //  sPOSNR = "000010";
      //}

      
    }

    if (sVSTEL === "9999") {
      var whereCondi = ` AND A.VBELN = '${selectData.ZGW_DONO}' AND B.POSNR = '${sPOSNR}' AND B.ZSHIP_STATUS = '30'`;
      imOrderList = await this.dataService.SelectModelData<ZMMT1321Join1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321Join1320CustomList",
        [this.appConfig.mandt, this.appConfig.plant, selectData.ZCARNO ?? "", whereCondi],
        "", "A.VBELN, B.POSNR", QueryCacheType.None);

      if (imOrderList.length > 0) {
        sVBELN = imOrderList[0].VBELN;
        sPOSNR = imOrderList[0].POSNR;

        var zmmt1321List: ZMMT1321Model[] = [];
        zmmt1321List.push(new ZMMT1321Model(this.appConfig.mandt, imOrderList[0].VBELN, imOrderList[0].POSNR, imOrderList[0].WERKS, imOrderList[0].LIFNR,
          imOrderList[0].IDNRK, imOrderList[0].LGORT, imOrderList[0].BWART
          , imOrderList[0].MEINS, imOrderList[0].SC_R_MENGE, imOrderList[0].SC_R_DATE_R, imOrderList[0].INCO1, imOrderList[0].TDLNR1, imOrderList[0].TDLNR2,
          imOrderList[0].ZCARTYPE, imOrderList[0].ZCARNO, imOrderList[0].ZDRIVER, imOrderList[0].ZPHONE
          , "40", imOrderList[0].ZSHIPMENT_NO, imOrderList[0].BLAND_F, imOrderList[0].BLAND_F_NM, imOrderList[0].BLAND_T, imOrderList[0].BLAND_T_NM,
          imOrderList[0].SC_S_MENGE, imOrderList[0].SC_S_DATE ?? new Date("0001-01-01")
          , selectData.ZGW_ATGEW / 1000, selectData.ZGW_DATE, "000000", imOrderList[0].ZPOST_RUN_MESSAGE, 0, new Date("0001-01-01"), "000000", "", imOrderList[0].MBLNR,
          imOrderList[0].MJAHR, imOrderList[0].MBLNR_C, imOrderList[0].MJAHR_C
          , imOrderList[0].WAERS, imOrderList[0].NETPR, imOrderList[0].DMBTR, imOrderList[0].BUKRS, imOrderList[0].BELNR, imOrderList[0].GJAHR,
          imOrderList[0].BUDAT ?? new Date("0001-01-01"), imOrderList[0].UNIQUEID, imOrderList[0].ERNAM
          , imOrderList[0].ERDAT, imOrderList[0].ERZET, this.appConfig.interfaceId, new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), "", "",
          DIMModelStatus.Modify))

        var rowCount = await this.dataService.ModifyModelData<ZMMT1321Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321ModelList", zmmt1321List);
      }
    } else {
      var zsds6410: ZSDS6410Model[] = [];
      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "", "", new Date("0001-01-01"), new Date("0001-01-01"), sVBELN, "", "", "X", "", "", "", "", "30", zsds6410, new Date("0001-01-01"), new Date("0001-01-01"));
      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);
      if (resultModel[0].IT_DATA.length > 0) {
        var zsds6420Model = new ZSDS6420Model(resultModel[0].IT_DATA[0].VBELN, resultModel[0].IT_DATA[0].POSNR, resultModel[0].IT_DATA[0].ZSEQUENCY,
          resultModel[0].IT_DATA[0].VRKME, resultModel[0].IT_DATA[0].ZMENGE4,
          selectData.ZGW_ATGEW / 1000, selectData.ZGW_DATE, resultModel[0].IT_DATA[0].Z3PARVW, resultModel[0].IT_DATA[0].Z4PARVW,
          resultModel[0].IT_DATA[0].ZCARTYPE, resultModel[0].IT_DATA[0].ZCARNO, resultModel[0].IT_DATA[0].ZDRIVER, resultModel[0].IT_DATA[0].ZDRIVER1,
          resultModel[0].IT_DATA[0].ZPHONE, resultModel[0].IT_DATA[0].ZPHONE1, resultModel[0].IT_DATA[0].ZVKAUS, resultModel[0].IT_DATA[0].ZUNLOAD, "40",
          resultModel[0].IT_DATA[0].ZSHIPMENT_NO, resultModel[0].IT_DATA[0].ZSHIPMENT_DATE, resultModel[0].IT_DATA[0].ZPALLTP, resultModel[0].IT_DATA[0].ZPALLETQTY,
          resultModel[0].IT_DATA[0].ZCONFIRM_CUT, resultModel[0].IT_DATA[0].ZTEXT, resultModel[0].IT_DATA[0].MTY, resultModel[0].IT_DATA[0].MSG);

        var zsds6420List: ZSDS6420Model[] = [zsds6420Model];
        var zsdModel = new ZSDIFPORTALSAPLE028RcvModel("", "", zsds6420List);
        var zsdList: ZSDIFPORTALSAPLE028RcvModel[] = [zsdModel];


        var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028RcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028RcvModelList", zsdList, QueryCacheType.None);
      }
    }

    if (sVSTEL === "9999") {
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "mandt": this.appConfig.mandt,
        "ivbeln": sVBELN,
        "iposnr": sPOSNR
      };

      setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction4", params) });
    } else {
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "itddatFrom": selectData.ZGW_DATE,
        "itddatTo": selectData.ZGW_DATE,
        "ivbeln": sVBELN,
        "mandt": this.appConfig.mandt,
        "ivstel": "8888"
      };

      setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction2", params) });
    }
  }

    //차량정보 찾기
    async getCarNm() {
      let chemCarSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.carDataCode);
      this.CarNmList = chemCarSet?.tables["CODES"].getDataObject(CarList);
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
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `차량입출문_${formatDate(new Date(), "yyyyMMdd", "en-US")}.xlsx`);
        });
    }).then(function () {
      //e.component.columnOption('ID', 'visible', false);
      //e.component.endUpdate();
      return;
    });

    e.cancel = true;
  }
}
