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
/**
 *
 *자재불출요청(임가공) component
 * */


@Component({
  templateUrl: 'sbmr.component.html',
  providers: [ImateDataService, Service]
})

export class SBMRComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  @ViewChild('drawalGrid', { static: false }) drawalGrid!: DxDataGridComponent
  @ViewChild('newMaterialsList', { static: false }) newMaterialsList!: DxDataGridComponent
  @ViewChild('GIrequestDate', { static: false }) GIrequestDate!: DxDateBoxComponent
  @ViewChild('ARrequestDate', { static: false }) ARrequestDate!: DxDateBoxComponent
  @ViewChild('formmm', { static: false }) formmm!: DxFormComponent
  @ViewChild('newBtn', { static: false }) newBtn!: DxButtonComponent
  @ViewChild('Shipment', { static: false }) Shipment!: DxValidatorComponent
  @ViewChild('Request_Time', { static: false }) Request_Time!: DxValidatorComponent
  @ViewChild('Requester_Name', { static: false }) Requester_Name!: DxValidatorComponent
  @ViewChild('Request_Date', { static: false }) Request_Date!: DxValidatorComponent
  @ViewChild('ZSHIP_STATUS', { static: false }) ZSHIP_STATUS!: DxValidatorComponent
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: TablePossibleEntryComponent;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "sbmr";

  dataSource: any;
  popupData2: any;
  //자재불출
  drawalData: any;

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

  //업체정보
  lifnrValue: string | null = null;

  //생산지시 화면이동
  paramFlag: any;
  paramLifnr: any;
  requestNameValue: any;

  //form
  SupplyData: any;
  newList: any;
  private loadePeCount: number = 0;

  zshipCode: TableCodeInfo;
  matnrCode: TableCodeInfo;
  lifnrCode: TableCodeInfo;

  popupVisible: boolean = false;
  newPopupVisible: boolean = false;
  textVisible: boolean = false;

  matnrValue: string | null = "";

  displayModel: ZMMT1320Model[] = [];

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService,
    private router: Router, private imInfo: ImateInfo, private authService: AuthService, private route: ActivatedRoute) {
    appInfo.title = AppInfoService.APP_TITLE + " | 자재불출요청(임가공)";
    //this._dataService = dataService;

    let thisObj = this;

    thisObj.loadingVisible = true;

    //임시로직 세기로 첫고정
    this.lifnrValue = "0000302512";

    this.zshipCode = appConfig.tableCode("RFC_배차상태");
    this.matnrCode = appConfig.tableCode("비료제품명");
    this.lifnrCode = appConfig.tableCode("구매업체");

    var giDate = formatDate(this.now.setDate(this.now.getDate()), "yyyy-MM-dd", "en-US");
    var pOneDate = formatDate(this.now.setDate(this.now.getDate() + 7), "yyyy-MM-dd", "en-US");

    this.paramLifnr = this.route.snapshot.queryParamMap.get("LIFNR");
    this.paramFlag = this.route.snapshot.queryParamMap.get("FLAG");
    let paraName = this.route.snapshot.queryParamMap.get("NAME");

    //필수데이터 test
    this.SupplyData = {
      Requester: this.paramLifnr ?? "", SC_R_TIME: new Date(), Requester_Name: paraName ?? "",
      GIRequest_Date: giDate, ARRequest_Date: pOneDate, ZSHIP_STATUS: ""
    };
    this.newPopupVisible = false;

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zshipCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lifnrCode),
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);




    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };

    //삭제버튼
    this.deleteButtonOptions = {
      icon: 'trash',
      onClick: async (e: any) => {
          this.dataGrid.instance.deleteRow(this.selectedRowIndex)

        }
    }


    //신규저장버튼
    this.addMatSaveButtonOptions = {
      text: '저장',
      onClick: async (e: any) => {

        var selectData = this.newList._array;
        var zmmt1320List: ZMMT1320Model[] = [];
        var count = 2;
        var max_vbeln = await dataService.SelectModelData<ZMMT1320MaxKeyModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320MaxKeyList", [thisObj.appConfig.mandt], "", "", QueryCacheType.None);
        
        var VBELN: string;
        if (max_vbeln[0].VBELN.substring(0, 4) == formatDate(new Date(), "yyyy", "en-US")) {
          VBELN = (parseInt(max_vbeln[0].VBELN) + 1).toString();
        } else {
          VBELN = formatDate(new Date(),"yyyy","en-US") + "000001";
        }

        selectData.forEach((array: any) => {
          zmmt1320List.push(new ZMMT1320Model(this.appConfig.mandt, VBELN, this.appConfig.plant, this.authService.getUser().data?.deptId ?? "",
            array.MATNR, "", "", array.MEINS, array.SC_R_MENGE, this.popupData2.SC_R_DATE_R,
            this.popupData2.SC_R_DATE, formatDate(new Date(), "HH:mm:ss", "en-US"), this.popupData2.SC_R_NAME, "", "", "", "",
            "", "", "", "", "", "", "", "", "", undefined, 0, undefined, "000000",
            "", 0, undefined, "000000", "", 0, undefined, "000000", "", "", "", "", "", "", "", "", undefined, "000000", "", undefined, "000000", DIMModelStatus.Add));
          VBELN = (parseInt(VBELN) + 1).toString();
        });
        var rowCount1 = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", zmmt1320List);


      }
    }

    //신규버튼 이벤트
    this.newButtonOptions = {
      text: "신규",
      onClick: async () => {
        if (thisObj.SupplyData.Requester_Name === "") {
          alert("요청자이름은 필수입니다.", "알림");
          return;
        }
        if (thisObj.SupplyData.ARRequest_Date === null) {
          alert("도착요청일자는 필수입니다.", "알림");
          return;
        }
        if (thisObj.SupplyData.GIRequest_Date === null) {
          alert("출하요청일자는 필수입니다.", "알림");
          return;
        }

        if (thisObj.SupplyData.GIRequest_Date >= thisObj.SupplyData.ARRequest_Date) {
          alert("출하요청일자는 도착요청일자보다 같거나 클수 없습니다.", "알림");
          return;
        }

        var result = await this.getNewData(thisObj);

        //시간 설정
        var r_time: Date = thisObj.SupplyData.SC_R_TIME as Date;
        var r_timeString = r_time.getHours().toString().padStart(2, '0') + ":" + r_time.getMinutes().toString().padStart(2, '0') + ":" +
          r_time.getSeconds().toString().padStart(2, '0');

        thisObj.displayModel = [];

        var nowTime = new Date().getHours().toString().padStart(2, "0") + ":" + new Date().getMinutes().toString().padStart(2, "0") + ":" +
          new Date().getSeconds().toString().padStart(2, "0")

        result.forEach(async (row: ZMMT1311GroupByModel) => {
          thisObj.displayModel.push(new ZMMT1320Model(thisObj.appConfig.mandt, "", thisObj.appConfig.plant, this.lifnrValue??"", row.MATNR, "", "", row.MEINS, 0,
            thisObj.SupplyData.ARRequest_Date, thisObj.SupplyData.GIRequest_Date, r_timeString, thisObj.SupplyData.Requester_Name, "", "", "",
            "", "", "", "", "", "", "", "", "", "", undefined, 0, undefined, "00:00:00", "", 0, undefined, "00:00:00",
            "", 0, undefined, "00:00:00", "", "", "", "", "", "", "", thisObj.appConfig.interfaceId, new Date(), nowTime, thisObj.appConfig.interfaceId, new Date(), nowTime, row.MAKTX));
        });

        this.drawalData = new ArrayStore(
          {
            key: ["VBELN", "IDNRK"],
            data: thisObj.displayModel
          });
      }
    }

    this.SaveBuutonOptions = {
      text: "저장",
      onClick: async () => {
        if (thisObj.displayModel.length === 0) {
          await alert("저장할 데이터가 없습니다.", "알림");
          return;
        }

        /*var checkMenge = thisObj.displayModel.find(i => i.SC_R_MENGE === 0);*/
        var checkMenge = thisObj.displayModel.filter(item => item.SC_R_MENGE > 0)
        if (checkMenge.length === 0) {
          await alert("요청수량없이 저장할 수 없습니다.", "알림");
          return;
        }

        if (await confirm("저장하시겠습니까?", "알림")) {
          var count = 0;
          var key = new Date().getFullYear().toString();

          //MAX 키값
          var max_vbeln = await dataService.SelectModelData<ZMMT1320MaxKeyModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320MaxKeyList", [thisObj.appConfig.mandt, new Date().getFullYear().toString()], "", "", QueryCacheType.None);
          if (max_vbeln[0].VBELN === "")
            count = 0;
          else
            count = Number(max_vbeln[0].VBELN.substr(4, max_vbeln[0].VBELN.length));

          checkMenge.forEach(async (row: ZMMT1320Model) => {
            if (row.VBELN === "") {
              count = count + 1;
              row.VBELN = key + count.toString().padStart(6, '0');
              row.SC_R_TIME = row.SC_R_TIME;
              row.ModelStatus = DIMModelStatus.Add;
              row.SC_R_DATE_C = new Date("0001-01-01");
              row.SC_L_DATE = new Date("0001-01-01");
              row.SC_G_DATE = new Date("0001-01-01");
              row.SC_A_DATE = new Date("0001-01-01");

            } else {
              if (row.ZSHIP_STATUS === "")
                row.ModelStatus = DIMModelStatus.Modify;
              else
                row.ModelStatus = DIMModelStatus.UnChanged;
            }
            
          });

          //저장
          var rowCount = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", thisObj.displayModel);

          /*await alert((rowCount.toString() + "건 저장되었습니다."), "알림");*/
          await alert("저장되었습니다.", "알림");
        }
      }
    }

  }
  async ngOnInit() {
    /*생산지시 접수화면에서 넘어오면 신규로직, 메뉴일 경우는 조회*/


    if (this.paramFlag == "sbmo") {
      this.lifnrValue = this.paramLifnr;

      var result = await this.getNewData(this);

      //시간 설정
      var r_time: Date = this.SupplyData.SC_R_TIME as Date;
      var r_timeString = r_time.getHours().toString().padStart(2, '0') + ":" + r_time.getMinutes().toString().padStart(2, '0') + ":" +
        r_time.getSeconds().toString().padStart(2, '0');

      this.displayModel = [];

      var nowTime = new Date().getHours().toString().padStart(2, "0") + ":" + new Date().getMinutes().toString().padStart(2, "0") + ":" +
        new Date().getSeconds().toString().padStart(2, "0")

      result.forEach(async (row: ZMMT1311GroupByModel) => {
        this.displayModel.push(new ZMMT1320Model(this.appConfig.mandt, "", this.appConfig.plant, this.lifnrValue ?? "", row.MATNR, "", "", row.MEINS, 0,
          this.SupplyData.ARRequest_Date, this.SupplyData.GIRequest_Date, r_timeString, this.SupplyData.Requester_Name, "", "", "",
          "", "", "", "", "", "", "", "", "", "", undefined, 0, undefined, "00:00:00", "", 0, undefined, "00:00:00",
          "", 0, undefined, "00:00:00", "", "", "", "", "", "", "", this.appConfig.interfaceId, new Date(), nowTime, this.appConfig.interfaceId, new Date(), nowTime, row.MAKTX));
      });

      var matList = await this.getNewData(this);

      this.displayModel.forEach(async (row: ZMMT1320Model) => {
        row.MAKTX = matList.find(item => item.MATNR === row.IDNRK)?.MAKTX;
      });

      this.drawalData = new ArrayStore(
        {
          key: ["VBELN", "IDNRK"],
          data: this.displayModel
        });


    } else {
      this.dataLoad(this.imInfo, this.dataService, this)
    }
  }
  async gridDataUpdating(e: any) {
    if (e.oldData.ZSHIP_STATUS !== "") {
      await alert("배차진행이 되지않은 건만 수정할 수 있습니다.", "알림");
      var isCancel = new Promise((resolve, reject) => {
            return resolve(true);
      });
      e.cancel = isCancel;
    }
  }

  async onEditorPreparing(e: any) {
    if (e.dataField === "SC_R_MENGE" && e.row !== undefined) {
      if (e.row.data.ZSHIP_STATUS !== "") {
        await alert("배차진행이 되지않은 건만 수정할 수 있습니다.", "알림");
        e.allowEditing = false;
      }
    }
  }

  async getNewData(thisObj: SBMRComponent) {
    var selectedValue = thisObj.lifnrValue ?? "";
    var whereCondi = "( SELECT CONCAT(EBELN, EBELP) FROM ZMMT1310 WHERE MANDT = '" + thisObj.appConfig.mandt + "' AND PRD_STATUS IN ('10', '20') AND LIFNR = '" + selectedValue + "' )";

    var resultModel = await thisObj.dataService.SelectModelData<ZMMT1311GroupByModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1311GroupByList", [thisObj.appConfig.mandt, whereCondi],
      "", "", QueryCacheType.None);

    return resultModel;
  }

  onPEDataLoaded(e: any) {
    this.loadePeCount++;

    console.info(`DATA LOAD COUNT: ${this.loadePeCount}`);
    if (this.loadePeCount >= 3) {
      this.loadingVisible = false;
      //패널 없애는 로직 추가

    }
  }

  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: SBMRComponent) {
    var selectedValue = thisObj.lifnrValue ?? "";
    this.SupplyData.GIRequest_Date
    var giDateFormat = this.SupplyData.GIRequest_Date.replaceAll('-', "");
    var whereCondi = `MANDT = '${thisObj.appConfig.mandt}' AND LIFNR = '${selectedValue}' AND SC_R_DATE = '${giDateFormat}'`;

    //if (thisObj.StatusValue !== null)
    //  whereCondi = whereCondi + ` AND ZSHIP_STATUS = '${thisObj.StatusValue}'`;

    var resultModel = await dataService.SelectModelData<ZMMT1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", [],
      whereCondi, "", QueryCacheType.None);

    var matList = await this.getNewData(thisObj);

    resultModel.forEach(async (row: ZMMT1320Model) => {
      row.MAKTX = matList.find(item => item.MATNR === row.IDNRK)?.MAKTX;
    });

    this.drawalData = new ArrayStore(
      {
        key: ["VBELN", "IDNRK"],
        data: resultModel
      });

    return resultModel;
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid = async (e: Object) => {
 
    this.loadingVisible = true;
    var drawalData = await this.dataLoad(this.imInfo, this.dataService, this);
    this.loadingVisible = false;
    this.drawalData = new ArrayStore(
      {
        key: ["VBELN", "IDNRK"],
        data: drawalData
      });

    this.textVisible = false;
  }

  //저장 이벤트
  public async modifyRow(e: any) {

      var selectData = this.drawalGrid.instance.getSelectedRowsData();
      var zmmt1320List: ZMMT1320Model[] = [];

      selectData.forEach((array: any) => {
        zmmt1320List.push(new ZMMT1320Model(array.MANDT, array.VBELN, array.WERKS, array.LIFNR, array.IDNRK, array.LGORT, array.BWART, array.MEINS,
          array.SC_R_MENGE, array.SC_R_DATE_R, array.SC_R_DATE, array.SC_R_TIME, array.SC_R_NAME, array.INCO1,
          array.TDLNR1, array.TDLNR2, array.ZCARTYPE, array.ZCARNO, array.ZDRIVER, array.ZPHONE,
          array.ZSHIP_STATUS, array.ZSHIPMENT_NO, array.BLAND_F, array.BLAND_F_NM, array.BLAND_T, array.BLAND_T_NM,
          array.SC_R_DATE_C, array.SC_L_MENGE, array.SC_L_DATE, array.SC_L_TIME, array.SC_L_NAME,
          array.SC_G_MENGE, array.SC_G_DATE, array.SC_G_TIME, array.ZPOST_RUN_MESSAGE, array.SC_A_MENGE, array.SC_A_DATE, array.SC_A_TIME, array.SC_A_NAME, array.MBLNR, array.MJAHR,
          array.ZEILE, array.MBLNR_C, array.MJAHR_C, array.ZEILE_C, array.ERNAM, array.ERDAT, array.ERZET, array.AENAM, array.AEDAT, array.AEZET, DIMModelStatus.Modify));
      });
      var rowCount1 = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", zmmt1320List);
    
    this.dataLoad(this.imInfo, this.dataService, this);
  }


  //삭제 이벤트
  public async deleteRow(e : any) {

      var selectData = this.drawalGrid.instance.getSelectedRowsData();
      var zmmt1320List: ZMMT1320Model[] = [];

      selectData.forEach((array: any) => {
        zmmt1320List.push(new ZMMT1320Model(array.MANDT, array.VBELN, array.WERKS, array.LIFNR, array.IDNRK, array.LGORT, array.BWART, array.MEINS,
          array.SC_R_MENGE, array.SC_R_DATE_R, array.SC_R_DATE, array.SC_R_TIME, array.SC_R_NAME, array.INCO1,
          array.TDLNR1, array.TDLNR2, array.ZCARTYPE, array.ZCARNO, array.ZDRIVER, array.ZPHONE,
          array.ZSHIP_STATUS, array.ZSHIPMENT_NO, array.BLAND_F, array.BLAND_F_NM, array.BLAND_T, array.BLAND_T_NM,
          array.SC_R_DATE_C, array.SC_L_MENGE, array.SC_L_DATE, array.SC_L_TIME, array.SC_L_NAME,
          array.SC_G_MENGE, array.SC_G_DATE, array.SC_G_TIME, array.ZPOST_RUN_MESSAGE, array.SC_A_MENGE, array.SC_A_DATE, array.SC_A_TIME, array.SC_A_NAME, array.MBLNR, array.MJAHR,
          array.ZEILE, array.MBLNR_C, array.MJAHR_C, array.ZEILE_C, array.ERNAM, array.ERDAT, array.ERZET, array.AENAM, array.AEDAT, array.AEZET, DIMModelStatus.Delete));
      });
      var rowCount1 = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", zmmt1320List);
  
    this.dataLoad(this.imInfo, this.dataService, this);
  }

  //저장 이벤트
 /*public async saveRow2() {

    console.log(this.Shipment.instance.validate().isValid);
    if (!this.Shipment.instance.validate().isValid) {
    }
    else {
      var selectData = this.drawalGrid.instance.getSelectedRowsData();
      var zmmt1320List: ZMMT1320Model[] = [];
      var count = 2;
      selectData.forEach((array: any) => {
        var VBELN = "2022" + count.toString().padStart(6, '0');
        zmmt1320List.push(new ZMMT1320Model(this.appConfig.mandt, VBELN, this.appConfig.plant, this.SupplyData.Requester, array.IDNRK, "", "", array.MEINS, array.SC_R_MENGE, new Date(1, 1, 1),
          new Date(1, 1, 1), "000000", "", "", "", "", "",
          "", "", "", "", "", "", "", "", "", new Date(1, 1, 1), 0, new Date(1, 1, 1), "000000",
          "", 0, new Date(1, 1, 1), "000000", "", 0, new Date(1, 1, 1), "000000", "", "", "", "", "", "", "", "", new Date(1, 1, 1), "000000", "", new Date(1, 1, 1), "000000", DIMModelStatus.Add));
        count = count + 1;
      });
      var rowCount1 = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", zmmt1320List);


    }
  }*/

  //신규 이벤트
  public async datainsert(thisObj: SBMRComponent) {
      var resultModel = await this.dataService.SelectModelData<ZMMT1311Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1311ModelList", [],
        "", "", QueryCacheType.None);

      var dataList : any = [];
    resultModel.forEach((array: any, index : number) => {
      dataList.push({ VBELN: "", IDNRK: array.MATNR, MEINS: array.MEINS, SC_R_MENGE: 0, TXZ01: array.MAKTX, NO : index });
        /*var VBELN = "2022" + count.toString().padStart(6, '0');
        zmmt1320List.push(new ZMMT1320Model(this.appConfig.mandt, VBELN, this.appConfig.plant, this.SupplyData.Requester, array.MATNR, "1", "1", array.MEINS, 0, new Date(1, 1, 1),
          this.drawalData.SC_R_DATE, "000000", "", "1", "1", "1", "1",
          "1", "1", "1", "", "1", "1","1", "1", "1", new Date(1, 1, 1), 0, new Date(1, 1, 1),"000000",
          "1", 0, new Date(1, 1, 1), "000000", "1", 0, new Date(1, 1, 1), "000000", "1", "1", "1", "1", "1", "1", "1", "1", new Date(1, 1, 1), "000000", "1", new Date(1, 1, 1), "000000"));
        count = count + 1;*/
      });
    return dataList;
  }

  //신규 버튼 이벤트
  /*registRow: any = async () => {
    if (!this.Shipment.instance.validate().isValid) {
    }
    if (!this.Requester_Name.instance.validate().isValid) {
      alert("요청자이름은 필수입니다.","알림");
    }
    if (!this.Request_Date.instance.validate().isValid) {
      alert("도착요청날자는 필수입니다.","알림");
    }
    else {
      this.popupVisible = false;
      this.loadingVisible = true;
      this.textVisible = true;
      var result = await this.datainsert(this);
      this.drawalData = new ArrayStore(
        {
          key: ["NO"],
          data: result
        });

    }*/
  

  addOrder(e: any) {
    this.newPopupVisible = !this.newPopupVisible;
    this.popupData2 = { SC_R_NAME: "세기",SC_R_MENGE: "" };
    this.newList = new ArrayStore(
      {
        //key: ["VBELN"],
        data: []
      });
    this.clearEntery();
    
  }

  //저장버튼
  saveRow: any = async () => {
    this.loadingVisible = true;
   // this.saveRow2();

    //var resultModel = await this.(this);
    this.loadingVisible = false;
   // if (resultModel === null)
   //   return;

    this.dataLoad(this.imInfo, this.dataService, this);
  }

  //자재코드변경
  onmatnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData2.MATNR = e.selectedItem.MATNR;
      this.popupData2.MEINS = e.selectedItem.MEINS;
    });
    return;
  }
  //신규추가버튼
  refAddMat(e: any) {
    if (this.popupData2.SC_R_MENGE === "") {
      alert("요청수량은 필수입니다.", "알림");
      return;
    }

    this.newList.insert({
      useSubmitBehavior: true,
        MATNR: this.popupData2.MATNR, SC_R_MENGE: this.popupData2.SC_R_MENGE,
        SC_R_DATE: this.popupData2.SC_R_DATE, SC_R_NAME: this.popupData2.SC_R_NAME,
        MEINS: this.popupData2.MEINS, SC_R_DATE_R: this.popupData2.SC_R_DATE_R
      });
        
  }
  public clearEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    this.matnrCodeDynamic.ClearSelectedValue();
  }

  selectStatus(data: any) {
    if (data.selectedValue !== null)
      this.drawalGrid.instance.filter(['ZSHIP_STATUS', '=', data.selectedValue]);
    else
      this.drawalGrid.instance.clearFilter();
  }

  //생산지시확인으로 이동
  backPage(e: any) {

    this.router.navigate(['sbmo']);
  }
}

