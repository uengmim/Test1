import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { formatDate } from '@angular/common';
import { ZMMT1320Model } from '../../../shared/dataModel/OWHP/Zmmt1320Proxy';
import { ZMMT1310Model } from '../../../shared/dataModel/OWHP/Zmmt1310Proxy';
import { ZMMT1311Model } from '../../../shared/dataModel/OWHP/Zmmt1311Proxy';
import { ZMMCURRStockModel, ZMMS3120Model, ZMMS3140Model } from '../../../shared/dataModel/OWHP/ZmmCurrStockProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data } from '../SBIV/app.service';
import { confirm, alert } from "devextreme/ui/dialog";
import { NavigationExtras, Router } from '@angular/router';
import { CodeInfoType, CommonCodeInfo, TableCodeInfo, ThemeManager } from '../../../shared/app.utilitys';
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxDateBoxModule,
  DxFormComponent,
  DxValidatorComponent,
} from 'devextreme-angular';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import ArrayStore from 'devextreme/data/array_store';
import dxValidator from 'devextreme/ui/validator';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AuthService } from '../../../shared/services';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { ActivatedRoute } from '@angular/router';
import { format } from 'crypto-js';
import { ZMMT1320MaxKeyModel } from '../../../shared/dataModel/OWHP/Zmmt1320MaxKeyProxy';
import { ZMMT1311GroupByModel } from '../../../shared/dataModel/OWHP/Zmmt1311GroupByProxy';
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { DomainModel } from '../../../shared/dataModel/common/Domain';
import { ZMMT1321Join1320Model } from '../../../shared/dataModel/MLOGP/Zmmt1320Join1321';
import { ZMMT1321Model } from '../../../shared/dataModel/MLOGP/Zmmt1321';
import { ZMMT1321GroupByModel } from '../../../shared/dataModel/OWHP/Zmmt1321GroupByProxy';

import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';

/**
 *
 *자재불출요청(임가공) component
 * */


@Component({
  templateUrl: 'sbmu.component.html',
  providers: [ImateDataService, Service]
})

export class SBMUComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  @ViewChild('drawalGrid', { static: false }) drawalGrid!: DxDataGridComponent
  @ViewChild('newMaterialsList', { static: false }) newMaterialsList!: DxDataGridComponent
  @ViewChild('GIrequestDate', { static: false }) GIrequestDate!: DxDateBoxComponent
  @ViewChild('ARrequestDate', { static: false }) ARrequestDate!: DxDateBoxComponent
  @ViewChild('formmm', { static: false }) formmm!: DxFormComponent
  @ViewChild('takeForm', { static: false }) takeForm!: DxFormComponent
  @ViewChild('newBtn', { static: false }) newBtn!: DxButtonComponent
  @ViewChild('Shipment', { static: false }) Shipment!: DxValidatorComponent
  @ViewChild('Request_Time', { static: false }) Request_Time!: DxValidatorComponent
  @ViewChild('Requester_Name', { static: false }) Requester_Name!: DxValidatorComponent
  @ViewChild('Request_Date', { static: false }) Request_Date!: DxValidatorComponent
  @ViewChild('ZSHIP_STATUS', { static: false }) ZSHIP_STATUS!: DxValidatorComponent
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('StatusEntery', { static: false }) StatusEntery!: CommonPossibleEntryComponent;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "sbmu";

  dataSource: any;
  popupData2: any;
  //자재불출
  drawalData: any;


  valiData: any;

  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;

  //데이터 조회 버튼
  searchButtonOptions: any;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //줄 선택
  selectedRowIndex = -1;
  selectedItemKeys: any[] = [];

  //데이터 삭제 버튼
  deleteButtonOptions: any;

  //신규저장버튼
  addMatSaveButtonOptions: any

  //신규버튼
  newButtonOptions: any;

  //저장버튼
  SaveBuutonOptions: any;

  //인수팝업 등록버튼
  addButtonOptions: any;

  //인수팝업 닫기버튼 
  closeButtonOptions: any;

  //인수팝업 폼데이터
  takeFormData: any;


  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;

  //현재날짜
  now: Date = new Date();
  startDate: any;
  endDate: any;

  //배차상태엔트리값
  StatusValue: string | null = null;
  StatusText: string | null = null;

  //업체정보
  lifnrValue: string | null = null;

  //생산지시 화면이동
  paramFlag: any;
  paramLifnr: any;
  requestNameValue: any;

  SelectKey: any[] = [];

  //form
  SupplyData: any;
  newList: any;
  private loadePeCount: number = 0;

  zshipCode: TableCodeInfo;
  matnrCode: TableCodeInfo;
  lifnrCode: TableCodeInfo;

  popupVisible: boolean = false;
  newPopupVisible: boolean = false;
  takePopupVisible: boolean = false;
  textVisible: boolean = false;

  matnrValue: string | null = "";

  displayModel: ZMMT1320Model[] = [];

  zmmt1320List: ZMMT1320Model[] = [];

  statusCodeInfo: DomainModel[] = [];

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService,
    private router: Router, private imInfo: ImateInfo, private authService: AuthService, private route: ActivatedRoute) {
    appInfo.title = AppInfoService.APP_TITLE + " | 인수확인(임가공)";
    //this._dataService = dataService;

    this.loadingVisible = true;

    let thisObj = this;
  

    var userInfo = this.authService.getUser().data;


    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    if (userInfo?.deptId != "") {
      this.lifnrValue = userInfo?.deptId;
    } else {
      //var userInfo = this.authService.getUser().data;
      this.lifnrValue = "0000302512";
    }
    //임시로직 세기로 첫고정
    //this.lifnrValue = "0000302512";

    this.zshipCode = appConfig.tableCode("RFC_배차상태");
    this.matnrCode = appConfig.tableCode("비료제품명");
    this.lifnrCode = appConfig.tableCode("구매업체");

    var giDate = formatDate(this.now.setDate(this.now.getDate()), "yyyy-MM-dd", "en-US");
    var pOneDate = formatDate(this.now.setDate(this.now.getDate() + 7), "yyyy-MM-dd", "en-US");

    this.paramLifnr = this.route.snapshot.queryParamMap.get("LIFNR");
    this.paramFlag = this.route.snapshot.queryParamMap.get("FLAG");
    let paraName = this.route.snapshot.queryParamMap.get("NAME");

   
    this.SupplyData = {
      Requester: this.paramLifnr ?? userInfo.deptId, SC_R_TIME: new Date(), Requester_Name: paraName ?? userInfo.userName,
      GIRequest_Date: giDate, ARRequest_Date: pOneDate, ZSHIP_STATUS: ""
    };
    this.newPopupVisible = false;

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zshipCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lifnrCode),
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    //등록버튼
    this.addButtonOptions  = {
      text: "등록",
      onClick: async (e: any) => {
        let result = this.takeForm.instance.validate();

          if (!result.isValid) {
            alert("인수정보를 입력하여 주십시오.", "알림");
            return;
          } 

          var selectData = this.drawalGrid.instance.getSelectedRowsData();
          selectData.forEach((array: any) => {

            array.SC_A_DATE = this.takeFormData.SC_A_DATE;
            array.SC_A_TIME = this.takeFormData.SC_A_TIME;
            array.SC_A_NAME = this.takeFormData.SC_A_NAME;
            array.SC_A_MENGE = this.takeFormData.SC_A_MENGE;
          });

          this.takePopupVisible = false;
        }
    };

    this.closeButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.takePopupVisible = false;
      }
    }


    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
        this.dataGrid.instance.clearSelection();
      },
    };



    this.SaveBuutonOptions = {
      text: "저장",
      onClick: async () => {

        thisObj.drawalGrid.instance.closeEditCell();

        var selectData = this.drawalGrid.instance.getSelectedRowsData();
        var checkFlag = false;
        if (selectData.length === 0) {
          await alert("저장할 데이터가 없습니다.", "알림");
          return;
        }
        selectData.forEach((row: ZMMT1321Model) => {
          if (row.SC_A_DATE === null || row.SC_A_MENGE === 0 || row.SC_A_NAME === "") {
            checkFlag = true;
          }
        });

        if (checkFlag) {
          await alert("인수 정보가 입력되지 않은 데이터가 존재합니다.", "알림");
          return;
        }

        if (await confirm("저장하시겠습니까?", "알림")) {
          var count = 0;
          var key = new Date().getFullYear().toString();

          this.zmmt1320List = [];

          selectData.forEach(async (row: ZMMT1321Model) => {
            row.SC_A_TIME = row.SC_A_TIME ?? "000000";
            row.BUDAT = row.BUDAT ?? new Date("0001-01-01");
            row.SC_G_TIME = row.SC_G_TIME ?? "000000";
            row.SC_R_DATE_R = row.SC_R_DATE_R ?? new Date("0001-01-01");
            row.SC_S_DATE = row.SC_S_DATE ?? new Date("0001-01-01");
            row.SC_G_DATE = row.SC_G_DATE ?? new Date("0001-01-01");
            row.SC_A_DATE = row.SC_A_DATE ?? new Date("0001-01-01");
              if (row.ZSHIP_STATUS === "")
                row.ModelStatus = DIMModelStatus.Modify;
                
              else if (row.ZSHIP_STATUS == "50" || row.SC_A_NAME != "") {
                row.ModelStatus = DIMModelStatus.Modify;
                row.ZSHIP_STATUS = "60"; //인수확인으로 상태 변경
              }
              else
                row.ModelStatus = DIMModelStatus.UnChanged;
                
            var zmmt1320Model = await this.dataService.SelectModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", [],
              `MANDT = '${this.appConfig.mandt}' AND VBELN = '${row.VBELN}'`, "VBELN", QueryCacheType.None);

            var sumModel = await this.dataService.SelectModelData<ZMMT1321GroupByModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321GroupByList", [this.appConfig.mandt, row.VBELN, "", "SC_S_MENGE"],
              "", "", QueryCacheType.None);
            zmmt1320Model[0].ModelStatus = DIMModelStatus.Modify;
            zmmt1320Model[0].SC_S_MENGE_T = sumModel[0].SUM_VALUE;
            zmmt1320Model[0].ZSHIP_STATUS = sumModel[0].ZSHIP_STATUS == "60" ? "50" : sumModel[0].ZSHIP_STATUS;
            zmmt1320Model[0].SC_G_DATE = zmmt1320Model[0].SC_G_DATE ?? new Date("0001-01-01");
            zmmt1320Model[0].SC_R_DATE_C = zmmt1320Model[0].SC_R_DATE_C ?? new Date("0001-01-01");
            zmmt1320Model[0].SC_R_DATE = zmmt1320Model[0].SC_R_DATE ?? new Date("0001-01-01");
            zmmt1320Model[0].SC_R_DATE_R = zmmt1320Model[0].SC_R_DATE_R ?? new Date("0001-01-01");
            zmmt1320Model[0].SC_L_DATE = zmmt1320Model[0].SC_L_DATE ?? new Date("0001-01-01");
            zmmt1320Model[0].SC_L_TIME = zmmt1320Model[0].SC_L_TIME ?? "000000";
            zmmt1320Model[0].SC_R_TIME = zmmt1320Model[0].SC_R_TIME ?? "000000";
            zmmt1320Model[0].AENAM = this.appConfig.interfaceId;
            zmmt1320Model[0].AEDAT = new Date();
            zmmt1320Model[0].AEZET = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
              new Date().getSeconds().toString().padStart(2, '0');

            this.zmmt1320List.push(zmmt1320Model[0]);
          });
          //저장
          var rowCount = await this.dataService.ModifyModelData<ZMMT1321Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321ModelList", selectData);

          /*await alert((rowCount.toString() + "건 저장되었습니다."), "알림");*/
          await alert("저장되었습니다.", "알림");
          this.imUpdate();

          this.refreshDataGrid(Object);
        }
      }
    }

  }



  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: SBMUComponent) {
    this.displayModel = [];
    var lifnr = thisObj.lifnrValue ?? "";

    var whereCondi;

    if (this.StatusValue == "") {
      whereCondi = ` AND A.LIFNR LIKE '%${lifnr}' AND A.SC_R_DATE BETWEEN '${thisObj.startDate.toString().replaceAll('-', "")}' AND '${thisObj.endDate.toString().replaceAll('-', "")}'`;
    } else {
      whereCondi = `AND B.ZSHIP_STATUS IN ('${thisObj.StatusValue}') AND A.LIFNR LIKE '%${lifnr}' AND A.SC_R_DATE BETWEEN '${thisObj.startDate.toString().replaceAll('-', "")}' AND '${thisObj.endDate.toString().replaceAll('-', "")}'`;
    }

    //if (thisObj.StatusValue !== null)
    //  whereCondi = whereCondi + ` AND ZSHIP_STATUS = '${thisObj.StatusValue}'`;

    var resultModel = await thisObj.dataService.SelectModelData<ZMMT1321Join1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321Join1320List",
      [thisObj.appConfig.mandt, this.appConfig.plant, ` '', '10', '20', '50' `, "19000101", "29991231", "", "X", `'${thisObj.StatusValue}'`, whereCondi],
        "", "A.VBELN", QueryCacheType.None);



    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("sbmu", this.appConfig, this.zshipCode);
    this.statusCodeInfo = dataSet.tables["CODES"].getDataObject(DomainModel);


    this.drawalData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: resultModel
      });

    this.dataGrid.instance.clearSelection();
    return resultModel;

  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid = async (e: Object) => {
 
    this.loadingVisible = true;
    var drawalData = await this.dataLoad(this.imInfo, this.dataService, this);
    this.loadingVisible = false;
    this.drawalData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: drawalData
      });

    this.textVisible = false;

  }


  async onPEDataLoaded(e: any) {
    this.loadePeCount++;

    console.info(`DATA LOAD COUNT: ${this.loadePeCount}`);
    if (this.loadePeCount >= 1) {
      this.loadingVisible = false;
      //패널 없애는 로직 추가

      this.StatusValue = "50";
      this.dataLoad(this.imInfo, this.dataService, this);
    }
  }

  //인수 이벤트
  public async takeOver(e: any) {

    var selectData = this.drawalGrid.instance.getSelectedRowsData();

    var check = selectData.findIndex(obj => obj.ZSHIP_STATUS != "50");

    var userInfo = this.authService.getUser().data;
    //폼 데이터 초기화
    this.takeFormData = { SC_A_DATE: new Date(), SC_A_TIME: formatDate(new Date(), "HH:mm:ss", "en-US"), SC_A_NAME: userInfo.userName, SC_A_MENGE: selectData[0].SC_G_MENGE };

    if (selectData.length == 0) {
      alert("인수하려는 행을 선택해주세요.", "알림");
      return;
    }
    if (check >= 0) {
      alert("배차상태가 출고인 경우에만 인수가 가능합니다.", "알림");
      return;
    }

    this.takePopupVisible = true;
  }
  
  //인수취소 이벤트
  public async takeCancel(e: any) {
    var nullDate = new Date("0001-01-01");
    var selectData = this.drawalGrid.instance.getSelectedRowsData();

    var zmmt1321List: ZMMT1321Model[] = [];
    var check = selectData.findIndex(obj => obj.ZSHIP_STATUS != "60" ||  obj.SC_A_NAME == "");
    
    //폼 데이터 초기화
    this.takeFormData = { SC_A_DATE: new Date(), SC_A_TIME: formatDate(new Date(), "HH:mm:ss", "en-US"), SC_A_NAME: "" };

    if (selectData.length == 0) {
      alert("인수취소 하려는 행을 선택해주세요.", "알림");
      return;
    }
    if (check >= 0) {
      alert("인수확인 된 데이터만 인수취소가 가능합니다.", "알림");
      return;
    }

    if (await confirm("인수취소 하시겠습니까 ?", "알림")) {
      this.zmmt1320List = [];

      selectData.forEach(async (array: any) => {
        zmmt1321List.push(new ZMMT1321Model(array.MANDT, array.VBELN, array.POSNR, array.WERKS, array.LIFNR, array.IDNRK, array.LGORT, array.BWART, array.MEINS,
          array.SC_R_MENGE, array.SC_R_DATE_R ?? nullDate, array.INCO1, array.TDLNR1, array.TDLNR2, array.ZCARTYPE, array.ZCARNO, array.ZDRIVER, array.ZPHONE, "50",
          array.ZSHIPMENT_NO, array.BLAND_F, array.BLAND_F_NM, array.BLAND_T, array.BLAND_T_NM, array.SC_S_MENGE, array.SC_S_DATE ?? nullDate, array.SC_G_MENGE, array.SC_G_DATE ?? nullDate,
          array.SC_G_TIME ?? "000000", array.ZPOST_RUN_MESSAGE, 0, new Date("0001-01-01"), "000000", "", array.MBLNR, array.MJAHR, array.MBLNR_C, array.MJAHR_C
          , array.WAERS, array.NETPR, array.DMBTR, array.BUKRS, array.BELNR, array.GJAHR, array.BUDAT ?? new Date("0001-01-01"), array.UNIQUEID, array.ERNAM
          , array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), "", "", DIMModelStatus.Modify));


        var zmmt1320Model = await this.dataService.SelectModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND VBELN = '${array.VBELN}'`, "VBELN", QueryCacheType.None);

        var sumModel = await this.dataService.SelectModelData<ZMMT1321GroupByModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321GroupByList", [this.appConfig.mandt, array.VBELN, "", "SC_S_MENGE"],
          "", "", QueryCacheType.None);
        zmmt1320Model[0].ModelStatus = DIMModelStatus.Modify;
        zmmt1320Model[0].SC_S_MENGE_T = sumModel[0].SUM_VALUE;
        zmmt1320Model[0].ZSHIP_STATUS = sumModel[0].ZSHIP_STATUS;
        zmmt1320Model[0].SC_G_DATE = zmmt1320Model[0].SC_G_DATE??new Date("0001-01-01");
        zmmt1320Model[0].SC_R_DATE_C = zmmt1320Model[0].SC_R_DATE_C ?? new Date("0001-01-01");
        zmmt1320Model[0].SC_R_DATE = zmmt1320Model[0].SC_R_DATE ?? new Date("0001-01-01");
        zmmt1320Model[0].SC_R_DATE_R = zmmt1320Model[0].SC_R_DATE_R ?? new Date("0001-01-01");
        zmmt1320Model[0].SC_L_DATE = zmmt1320Model[0].SC_L_DATE ?? new Date("0001-01-01");
        zmmt1320Model[0].SC_L_TIME = zmmt1320Model[0].SC_L_TIME ?? "000000";
        zmmt1320Model[0].SC_R_TIME = zmmt1320Model[0].SC_R_TIME ?? "000000";
        zmmt1320Model[0].AENAM = this.appConfig.interfaceId;
        zmmt1320Model[0].AEDAT = new Date();
        zmmt1320Model[0].AEZET = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
          new Date().getSeconds().toString().padStart(2, '0');

        this.zmmt1320List.push(zmmt1320Model[0]);
      });

      var rowCount1 = await this.dataService.ModifyModelData<ZMMT1321Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321ModelList", zmmt1321List);
      this.imUpdate();

      this.dataLoad(this.imInfo, this.dataService, this);
      alert("인수취소 되었습니다.", "알림");
    }

  }

  async imUpdate() {

    var row20Count = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", this.zmmt1320List);

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
      component: this.drawalGrid.instance,
      worksheet: worksheet,
      customizeCell: function (options) {
        const excelCell = options.excelCell;
        excelCell.font = { name: 'Arial', size: 12 };
        excelCell.alignment = { horizontal: 'left' };
      }
    }).then(function () {
      workbook.xlsx.writeBuffer()
        .then(function (buffer: BlobPart) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `인수내역_${formatDate(new Date(), "yyyyMMdd", "en-US")}.xlsx`);
        });
    }).then(function () {
      //e.component.columnOption('ID', 'visible', false);
      //e.component.endUpdate();
      return;
    });

    /*e.cancel = true;*/
  }

}

