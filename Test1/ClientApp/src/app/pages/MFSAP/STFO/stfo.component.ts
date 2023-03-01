import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService, } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType, QueryDataType, QueryMessage, QueryParameter, QueryRunMethod } from '../../../shared/imate/imateCommon';
import { Service, Employee, State, State2, State3, State4, State5, State6, State7, OrderInfo, PalletType, UnloadInfo, TruckType, zStatus } from './app.service';
import { formatDate } from '@angular/common';
import ArrayStore from 'devextreme/data/array_store';
import { confirm, alert } from "devextreme/ui/dialog";
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
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZSDS0050Model, ZSDSTOORDERReceiveModel } from '../../../shared/dataModel/MFSAP/ZsdStoOrderReceiveProxy';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZSDS0060Model, ZSDS0061Model, ZSDSTOORDERManageModel } from '../../../shared/dataModel/MFSAP/ZSdStoOrderManageProxy';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { userInfo } from 'os';
import { ChangeDetectorRef } from '@angular/core';
import { T001lModel } from '../../../shared/dataModel/MLOGP/T001l';


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*STO주문 Component*/


@Component({
  templateUrl: 'stfo.component.html',
  providers: [ImateDataService, Service]
})

export class STFOComponent {
  @ViewChild('lgortInCodeDynamic', { static: false }) lgortInCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('lgortOutCodeDynamic', { static: false }) lgortOutCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('kunnrCodeDynamic', { static: false }) kunnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('kunweCodeDynamic', { static: false }) kunweCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('inco1CodeDynamic', { static: false }) inco1CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr1CodeDynamic', { static: false }) tdlnr1CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr2CodeDynamic', { static: false }) tdlnr2CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('sublgortOutCodeDynamic', { static: false }) sublgortOutCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('stockTypeCodeDynamic', { static: false }) stockTypeCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('cancelCodeDynamic', { static: false }) cancelCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('palletTypeCodeDynamic', { static: false }) palletTypeCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('truckTypeCodeDynamic', { static: false }) truckTypeCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('unloadInfoCodeDynamic', { static: false }) unloadInfoCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('zvkausCodeDynamic', { static: false }) zvkausCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoCodeEntery', { static: false }) zcarnoCodeEntery!: CommonPossibleEntryComponent;

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  //조회버튼
  searchButtonOptions: any;
  data: any;
  backButtonOption: any;

  /**
   * 데이터 스토어 키
   * */
  dataStoreKey: string = "stfo";

  //파서블엔트리
  lgortInCode: TableCodeInfo;
  lgortOutCode: TableCodeInfo;
  kunnrCode: TableCodeInfo;
  kunweCode: TableCodeInfo;
  matnrCode: TableCodeInfo;
  inco1Code: CommonCodeInfo;
  tdlnr1Code: TableCodeInfo;
  //tdlnr2Code: TableCodeInfo;
  sublgortOutCode: TableCodeInfo;
  stockTypeCode: TableCodeInfo;
  /*cancelCode: TableCodeInfo;*/
  palletTypeCode: TableCodeInfo;
  //truckTypeCode: TableCodeInfo;
  unloadInfoCode: TableCodeInfo;
  zvkausCode: TableCodeInfo;
  //zcarnoCode: TableCodeInfo

  kunnrCode2: TableCodeInfo;
  kunweCode2: TableCodeInfo;
  matnrCode2: TableCodeInfo;
  inco1Code2: CommonCodeInfo;
  tdlnr1Code2: TableCodeInfo;
  //tdlnr2Code: TableCodeInfo;
  sublgortOutCode2: TableCodeInfo;
  stockTypeCode2: TableCodeInfo;
  /*cancelCode: TableCodeInfo;*/
  palletTypeCode2: TableCodeInfo;
  //truckTypeCode: TableCodeInfo;
  unloadInfoCode2: TableCodeInfo;
  zvkausCode2: TableCodeInfo;
  //zcarnoCode: TableCodeInfo

  //파서블엔트리 선택값
  lgortInValue: string | null = "";
  lgortOutValue: string | null = "";
  kunnrValue: string | null = "";
  kunweValue: string | null = "";
  matnrValue: string | null = "";
  inco1Value: string | null = "";
  tdlnr1Value: string | null = "";
  tdlnr2Value: string | null = "";
  sublgortOutValue: string | null = "";
  stockTypeValue: string | null = "";
  /*cancelValue: string | null = "";*/
  palletTypeValue: string | null = "";
  truckTypeValue: string | null = "";
  unloadInfoValue: string | null = "";
  zvkausValue: string | null = "";
  zcarnoValue: string | null = "";

  kunnrValue2: string | null = "";
  kunweValue2: string | null = "";
  matnrValue2: string | null = "";
  inco1Value2: string | null = "";
  tdlnr1Value2: string | null = "";
  tdlnr2Value2: string | null = "";
  sublgortOutValue2: string | null = "";
  stockTypeValue2: string | null = "";
  /*cancelValue: string | null = "";*/
  palletTypeValue2: string | null = "";
  truckTypeValue2: string | null = "";
  unloadInfoValue2: string | null = "";
  zvkausValue2: string | null = "";
  zcarnoValue2: string | null = "";

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;

  //화면제어용
  popupStat: boolean = false;

  dbTitle: string = "";

  selectedRows: any = [];

  //비료조건
  //구분
  zgubn: string = "A";
  //플랜트
  werks: string = "1000";
  //영업조직
  ekorg: string = "1000";
  //구매그룹
  ekgrp: string = "305";
  //회사코드
  bukrs: string = "1000";

  /**
   * 로딩된 PeCount
   * */
  private loadePeCount: number = 0;

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
  popupVisible2 = false;
  collapsed: any;

  //multiseletbox
  gridDataSource: any;
  orderInfo: ZSDS0050Model;
  orderList: ZSDS0060Model[] = [];
  callbacks = [];
  popupPosition: any;
  customOperations!: Array<any>;

  empid: string = "";
  rolid: string[] = [];
  isRoleDisabled = false;
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";

  selectYN: boolean = false;

  //lgort 선택 값
  lgortValue!: string | null;

  ZStatus: zStatus[] = [];

  lgNmList: T001lModel[] = [];
  //값 체크
  //validation Adapter
  lgortAdapter = {
    getValue: () => {
      return this.lgortValue;
    },
    applyValidationResults: (e: any) => {
      this.lgortInCodeDynamic.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };
  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, private imInfo: ImateInfo, private appInfo: AppInfoService,
    private appConfig: AppConfigService, private authService: AuthService, private cd: ChangeDetectorRef) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | STO주문-포장재";
    let page = this;

    //로그인 사용자 정보
    let usrInfo = authService.getUser().data;
    this.rolid = usrInfo.role;
    this.vorgid = usrInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = usrInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = usrInfo.orgOption.torgid.padStart(10, '0');

    if (this.rolid.find(item => item === "ADMIN") === undefined)
      this.empid = this.corgid;

    //STO 진행상태
    this.ZStatus = service.getZStatus();

    //데이터 로딩 패널 보이기
    this.loadingVisible = true;

    this.dbTitle = appConfig.dbTitle;

    this.endDate = formatDate(this.now.setDate(this.now.getDate()), "yyyy-MM-dd", "en-US");
    this.startDate = new Date();
    this.startDate = formatDate(this.now.setDate(this.now.getDate() - 7), "yyyy-MM-dd", "en-US");

    //파서블엔트리
    this.lgortInCode = appConfig.tableCode("비료창고");
    this.lgortOutCode = appConfig.tableCode("비료창고");

    this.kunnrCode = appConfig.tableCode("RFC_비료고객정보");
    this.kunweCode = appConfig.tableCode("비료창고");
    this.matnrCode = appConfig.tableCode("비료친환경제품명");
    this.inco1Code = appConfig.commonCode("운송방법");
    this.tdlnr1Code = appConfig.tableCode("운송업체");
    /*this.tdlnr2Code = appConfig.tableCode("운송업체");*/
    this.sublgortOutCode = appConfig.tableCode("비료창고");
    this.stockTypeCode = appConfig.tableCode("RFC_재고유형");
    /*this.cancelCode = appConfig.tableCode("RFC_취소코드");*/
    this.palletTypeCode = appConfig.tableCode("RFC_파레트유형");
    /*this.truckTypeCode = appConfig.tableCode("RFC_화물차종");*/
    this.unloadInfoCode = appConfig.tableCode("RFC_하차정보");
    this.zvkausCode = appConfig.tableCode("RFC_용도");
    /*this.zcarnoCode = appConfig.tableCode("비료차량");*/

    this.kunnrCode2 = appConfig.tableCode("RFC_비료고객정보");
    this.kunweCode2 = appConfig.tableCode("비료창고");
    this.matnrCode2 = appConfig.tableCode("비료친환경제품명");
    this.inco1Code2 = appConfig.commonCode("운송방법");
    this.tdlnr1Code2 = appConfig.tableCode("운송업체");
    /*this.tdlnr2Code = appConfig.tableCode("운송업체");*/
    this.sublgortOutCode2 = appConfig.tableCode("비료창고");
    this.stockTypeCode2 = appConfig.tableCode("RFC_재고유형");
    /*this.cancelCode = appConfig.tableCode("RFC_취소코드");*/
    this.palletTypeCode2 = appConfig.tableCode("RFC_파레트유형");
    /*this.truckTypeCode = appConfig.tableCode("RFC_화물차종");*/
    this.unloadInfoCode2 = appConfig.tableCode("RFC_하차정보");
    this.zvkausCode2 = appConfig.tableCode("RFC_용도");
    /*this.zcarnoCode = appConfig.tableCode("비료차량");*/

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgortInCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgortOutCode),

      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunweCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.inco1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnr1Code),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnr2Code),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.sublgortOutCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.stockTypeCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.palletTypeCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.truckTypeCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.unloadInfoCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zvkausCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoCode)*/

      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnrCode2),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunweCode2),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode2),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.inco1Code2),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnr1Code2),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnr2Code),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.sublgortOutCode2),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.stockTypeCode2),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.palletTypeCode2),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.truckTypeCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.unloadInfoCode2),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zvkausCode2),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoCode)*/
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
 
    var newdata = new ZSDS0050Model("", this.zgubn, this.ekorg, this.ekgrp, this.bukrs, "", this.werks, "", "", "", "", "", "", "", 0, 0, 0, 0, 0, 0, 0, 0,
      new Date(), new Date(), "", "", "", "", "", "", "", "", "", "", "", "", "", 0, "", 0, 0, this.werks, "", "", "", "", "", "", "", "",
      new Date(), "", "", new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged);

    this.orderInfo = Object.assign(newdata);

    const that = this;
    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;

    this.getLgortNm();

    //this.orderList = Object.assign(page.dataLoad(imInfo, dataService, appConfig)) as ZSDS0060Model[];

    ////메인데이터
    //this.gridDataSource = new CustomStore(
    //  {
    //    key: ["ZSTVBELN", "EBELN"],
    //    load: function (loadOptions) {
    //      return page.dataLoad(imInfo, dataService, appConfig);
    //    }
    //  });

    //저장버튼 이벤트
    this.saveButtonOptions = {
      text: '저장',
      useSubmitBehavior: false,
      onClick: async (e: any) => {
        let vali = e.validationGroup.validate();

        if (this.orderInfo.ZUNLOAD === "" || this.orderInfo.ZUNLOAD === null) {
          alert("하차정보는 필수값입니다.", "알림")
          return;
        }
        if (await confirm("저장하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          var result: ZSDSTOORDERReceiveModel = await this.createOrder(appConfig);
          this.loadingVisible = false;
          if (result.MTY === "E") {
            alert(result.MSG, "알림");
            this.orderInfo.ZSTVBELN = result.T_DATA[0].ZSTVBELN;
            this.orderInfo.EBELN = result.T_DATA[0].EBELN;
            this.orderInfo.ZABGRU = result.T_DATA[0].ZABGRU;
            this.orderInfo.ZBLOCK = result.T_DATA[0].ZBLOCK;
          } else {
            alert("저장완료", "알림");
          }
          this.popupVisible = false;
        }
      }
    };

      this.closeButtonOptions = {
        text: '닫기',
        onClick(e: any) {
          that.popupVisible = false;
          that.popupVisible2 = false;
        }
    }
    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadingVisible = true;
        await this.dataLoad(this.imInfo, this.dataService, this.appConfig);
        this.loadingVisible = false;
      },
    };
  };

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  asyncValidation(params: any) {
    var ad = params;
    return;
  }

  onFormSubmit = function (e: any) {
   

    e.preventDefault();
  };
    
  onlgortInCodeValueChanged(e: any) {
    return;
  }

  onlgortOutCodeValueChanged(e: any) {
    return;
  }

  //고객코드 변경이벤트
  onkunnrCodeValueChanged(e: any) {
    setTimeout(() => {
/*      this.kunweCodeDynamic.ClearSelectedValue();*/
/*      this.kunweCodeDynamic.SetDataFilter(["KUNNR", "=", e.selectedValue]);*/
      var resultValue = this.kunweCodeDynamic.gridDataSource._array.find(obj => obj.KUNNR == e.selectedValue);
      if (resultValue != undefined) {
        this.kunweValue = resultValue.LGORT;
      }

      /*if (this.selectYN = false) {*/
        var kna1Value = this.kunnrCodeDynamic.gridDataSource._array.find(obj => obj.KUNNR == e.selectedValue);
        this.orderInfo.LGORT = resultValue.LGORT;
        this.orderInfo.KUNNR = kna1Value.KUNNR;
        this.orderInfo.NAME1 = kna1Value.NAME1;
        this.orderInfo.CITY1 = kna1Value.CITY1;
        this.orderInfo.STREET = kna1Value.STREET;
        this.orderInfo.TELF1 = kna1Value.TELF1;
        this.orderInfo.MOBILENO = kna1Value.MOBILENO;
      //}
      
    }, 100);
  }

  //자재코드변경
  onmatnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.orderInfo.MATNR = e.selectedItem.MATNR;
      this.orderInfo.VRKME = e.selectedItem.MEINS;
    });
    return;
  }

  //팔렛트유형변경
  onpalletCodeValueChanged(e: any) {
    this.orderInfo.ZPALLTP = e.selectedItem.DOMVALUE_L;
    return;
  }

  //하차정보변경
  onzunloadCodeValueChanged(e: any) {
    this.orderInfo.ZUNLOAD = e.selectedItem.DOMVALUE_L;
    return;
  }

  //운송방법변경
  oninco1CodeValueChanged(e: any) {
    this.orderInfo.INCO1 = e.selectedItem.ZCM_CODE3;
    return;
  }

  //도착지변경
  onlgortCodeValueChanged(e: any) {
    this.orderInfo.LGORT = e.selectedItem.LGORT;
    return;
  }

  //운송사변경
  ontdlnr1CodeValueChanged(e: any) {
    this.orderInfo.TDLNR1 = e.selectedItem.LIFNR;
    return;
  }

  //실제운송사변경
  ontdlnr2CodeValueChanged(e: any) {
    this.orderInfo.TDLNR2 = e.selectedItem.LIFNR;
    return;
  }

  //화물차종
  onzcartypeCodeValueChanged(e: any) {
    this.orderInfo.ZCARTYPE = e.selectedItem.DOMVALUE_L;
    return;
  }

  //출고사업장
  onumlgoCodeValueChanged(e: any) {
    this.orderInfo.UMLGO = e.selectedItem.LGORT;
    return;
  }

  //재고유형
  oninsmkCodeValueChanged(e: any) {
    this.orderInfo.INSMK = e.selectedItem.DOMVALUE_L;
    return;
  }

  //취소코드
  //onzabgruCodeValueChanged(e: any) {
  //  this.orderInfo.ZABGRU = e.selectedItem.DOMVALUE_L;
  //  return;
  //}

  //용도코드
  onzvkausCodeValueChanged(e: any) {
    this.orderInfo.ZVKAUS = e.selectedItem.DOMVALUE_L;
    return;
  }

  //차량번호 선택이벤트
  onZcarnoCodeValueChanged(e: any) {
    /*    setTimeout(() => {*/
    /*this.zcarnoValue = e.selectedValue;*/
    this.orderInfo.ZCARNO = e.selectedValue;
    this.orderInfo.ZDRIVER = e.selectedItem.ZDRIVER;
    this.truckTypeValue = e.selectedItem.ZCARTYPE;
    /*    });*/
  }

  //get diffInDay() {
  //  return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  //}

  addDataGrid(e: any) {
    this.dataGrid.instance.addRow();
  }


  saveDataGrid(e: any) {
    /*this.dataGrid.instance.saveEditData();*/
  }

  //취소 클릭 이벤트
  async cancelDataGrid(e: any) {
    var ynCheck: Boolean = true;
    var cancelModelList: ZSDS0061Model[] = [];
    var keyValue: string = "";
    if (this.selectedRows.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }

    if (await confirm("취소하시겠습니까?", "알림")) {
      await this.selectedRows.forEach(async (key: any) => {
        if (ynCheck === false)
          return;

        var selectedRow: ZSDS0060Model = await this.orderList.find(item => item.ZSTVBELN === key.ZSTVBELN) as ZSDS0060Model;
        keyValue = key.ZSTVBELN;
        if (selectedRow.ZCANCEL === "N") {
          ynCheck = false;
          alert("배치가 진행되었거나, 취소가 완료된 문건은 체크할 수 없습니다.", "알림");
          return;
        }

        if (selectedRow.EINDT === null) {
          selectedRow.EINDT = new Date("0001-01-01");
        }
        if (selectedRow.ZBUDAT === null) {
          selectedRow.ZBUDAT = new Date("0001-01-01");
        }
        await cancelModelList.push(new ZSDS0061Model(selectedRow.ZCANCEL, selectedRow.ZSTVBELN, selectedRow.EBELN, selectedRow.EBELP, selectedRow.BSART,
          selectedRow.ZSTATS, selectedRow.WERKS, selectedRow.LGORT, selectedRow.AEDAT, selectedRow.EINDT, selectedRow.TDLNR1, selectedRow.TDLNR2,
          selectedRow.MATNR, selectedRow.TXZ01, selectedRow.ZMENGE1, selectedRow.MEINS, selectedRow.RESWK, selectedRow.RESLO, selectedRow.ZVBELN1,
          selectedRow.ZMENGE2, selectedRow.ZVBELN2, selectedRow.ZBUDAT, selectedRow.ZMENGE3, selectedRow.ZVBELN3, selectedRow.ZTRANSITQTY, selectedRow.INSMK,
          selectedRow.LOEKZ, selectedRow.ZABGRU, selectedRow.ZBLOCK, selectedRow.INCO1, selectedRow.NAME1, selectedRow.CITY1, selectedRow.STREET, selectedRow.KUNNR,
          selectedRow.ZSHIPSTATUS, selectedRow.ZSHIPMENT_NO, selectedRow.ZCARNO, selectedRow.ZDRIVER, selectedRow.ZPHONE, selectedRow.ZPALLTP,
          selectedRow.ZPALLETQTY, selectedRow.ZCARTYPE, selectedRow.ZUNLOAD, selectedRow.ZVKAUS, selectedRow.REMARK, "", "", DIMModelStatus.UnChanged));
      });

      if (cancelModelList.length > 0) {
        this.loadingVisible = true;
        var result: ZSDSTOORDERManageModel = Object.assign(await this.cancelData(this.appConfig, cancelModelList, keyValue)) as ZSDSTOORDERManageModel;
        if (result.MTY === "E")
          alert(result.MSG, "알림");
        else
          alert("취소완료", "알림");
      }

      await this.dataLoad(this.imInfo, this.dataService, this.appConfig);

      this.loadingVisible = false;
    }
  }


    getDataGrid(e: any) {
      let result = e.validationGroup.validate();
      if (!result.isValid) {
        alert("필수값을 입력하여 주십시오.", "알림");
        return;
      }
      else {
        this.loadingVisible = true;
        this.dataLoad(this.imInfo, this.dataService, this.appConfig);
        this.loadingVisible = false;
      }
    }



  dbClickDataGrid(e: any) {
    this.popupVisible = false;
  }

  //파서블엔트리 선택값 삭제
  clearPossibleEntrys() {
    //this.lgortInCodeDynamic.ClearSelectedValue();
    //this.lgortOutCodeDynamic.ClearSelectedValue();
    this.kunnrCodeDynamic.ClearSelectedValue();
    this.kunweCodeDynamic.ClearSelectedValue();
    this.matnrCodeDynamic.ClearSelectedValue();
    this.inco1CodeDynamic.ClearSelectedValue();
    this.tdlnr1CodeDynamic.ClearSelectedValue();
    //this.tdlnr2CodeDynamic.ClearSelectedValue();
    this.sublgortOutCodeDynamic.ClearSelectedValue();
    this.stockTypeCodeDynamic.ClearSelectedValue();
    /*this.cancelCodeDynamic.ClearSelectedValue();*/
    this.palletTypeCodeDynamic.ClearSelectedValue();
    //this.truckTypeCodeDynamic.ClearSelectedValue();
    this.unloadInfoCodeDynamic.ClearSelectedValue();
    this.zvkausCodeDynamic.ClearSelectedValue();
    //this.zcarnoCodeEntery.ClearSelectedValue();
  }

  //주문등록
  requestOrder(e: any) {
    this.selectYN = false;
    this.clearPossibleEntrys();

    
    var newdata = new ZSDS0050Model("", this.zgubn, this.ekorg, this.ekgrp, this.bukrs, "", this.werks, "", "", "", "", "", "", "", 0, 0, 0, 0, 0, 0, 0, 0,
      new Date(), new Date(), "", "", "", "", "", "", "", "", "", "", "", "", "", 0, "", 0, 0, this.werks, "", "", "", "", "", "", "", "",
      new Date(), "", "", new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged);

    this.orderInfo = Object.assign(newdata);

    this.popupStat = false;
    this.popupVisible = true;

    //0.5초 뒤에 적용(숨김 상태의 컨트롤은 프로퍼티 변동이 안되므로 POPUP창이 보여진 상태에서 변경을 해 주어야 함)

    setTimeout(async (that: STFOComponent) => {
      this.kunnrValue = this.empid;
      that.truckTypeCodeDynamic.ApplyFilter();
    }, 500, this);
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

  //오더목록 더블클릭
  orderDBClick(e: any) {
    this.selectYN = true;
    this.clearPossibleEntrys();

    setTimeout(async (that: STFOComponent) => {
      var selectedData: ZSDS0060Model = e.data as ZSDS0060Model;

      this.orderInfo = new ZSDS0050Model(selectedData.ZSTVBELN, this.zgubn, this.ekorg, this.ekgrp, this.bukrs, "", this.werks, selectedData.LGORT, selectedData.NAME1,
        selectedData.CITY1, selectedData.STREET, "", "", "", 0, 0, 0, 0, 0, 0, 0, 0, selectedData.AEDAT, selectedData.EINDT, selectedData.INCO1, selectedData.TDLNR1,
        selectedData.TDLNR2, selectedData.ZCARTYPE, selectedData.ZCARNO, selectedData.ZDRIVER, selectedData.ZUNLOAD, selectedData.ZPALLTP, selectedData.ZVKAUS,
        selectedData.REMARK, "", "", selectedData.MATNR, selectedData.ZMENGE1, selectedData.MEINS, 0, 0, selectedData.RESWK, selectedData.RESLO, selectedData.INSMK,
        selectedData.ZABGRU, selectedData.ZBLOCK, selectedData.EBELN, selectedData.EBELP,
        selectedData.ZSTATS, "", new Date(), "", "", new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged);

      this.kunnrValue2 = selectedData.KUNNR;
      this.kunweValue2 = selectedData.LGORT;
      this.matnrValue2 = selectedData.MATNR;
      this.inco1Value2 = selectedData.INCO1;
      this.tdlnr1Value2 = selectedData.TDLNR1;
      this.tdlnr2Value2 = selectedData.TDLNR2;
      this.sublgortOutValue2 = selectedData.RESLO;
      this.stockTypeValue2 = selectedData.INSMK;
      /*this.cancelValue = selectedData.;*/
      this.palletTypeValue2 = selectedData.ZPALLTP;
      this.truckTypeValue2 = selectedData.ZCARTYPE;
      this.unloadInfoValue2 = selectedData.ZUNLOAD;
      this.zvkausValue2 = selectedData.ZVKAUS;
      this.zcarnoValue2 = selectedData.ZCARNO;

      this.popupStat = true;
      this.popupVisible2 = !this.popupVisible;
    }, 500, this);
  }

  onCodeValueChanged(e: any) {
    return;
  }

  /**
   * 파서블 엔트리 데이터 로딩 완료
   * @param e
   */
  onPEDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 12) {
      
      this.loadingVisible = true;

      var lgortText = this.lgortInCodeDynamic.gridDataSource._array.find(item => item.KUNNR === this.empid);
      if (lgortText !== undefined)
        this.lgortValue = lgortText.LGORT;

      this.dataLoad(this.imInfo, this.dataService, this.appConfig)

      this.loadingVisible = false;
    }
      

    //if (e.component.popupTitle === "화물차종")
    //  this.truckTypeCodeDynamic.SetDataFilter(["DOMVALUE_L", "startswith", "A"]);
  }

  //STO주문목록 조회
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, appConfig: AppConfigService) {
    //var queryParams: QueryParameter[] = [];

    //queryParams.push(new QueryParameter("mandt", QueryDataType.String, "600", "", "", "", ""));
    //queryParams.push(new QueryParameter("zgubn", QueryDataType.String, "A", "", "", "", ""));
    //queryParams.push(new QueryParameter("startdate", QueryDataType.String, formatDate(this.startDate, 'yyyyMMdd', 'en-US'), "", "", "", ""));
    //queryParams.push(new QueryParameter("enddate", QueryDataType.String, formatDate(this.endDate, 'yyyyMMdd', 'en-US'), "", "", "", ""));

    ////queryParams.push(new QueryParameter("lgort", QueryDataType.String, "600", "", "", "", ""));
    ////queryParams.push(new QueryParameter("umlgo", QueryDataType.String, "600", "", "", "", ""));

    //var codeQuery = new QueryMessage(QueryRunMethod.Alone, "ZSDT6030", appConfig.dbTitle, "#commonSql.ZSDT6030", [], queryParams, QueryCacheType.Cached);
    //var dataSet = await dataService.dbSelectToDataSet([codeQuery]);

    //return dataSet.tables["ZSDT6030"].getDataObjectAny();

    var condiModel = new ZSDSTOORDERManageModel("", "", this.startDate, this.endDate, "",
      this.lgortValue ?? "", "D", this.lgortOutCodeDynamic.selectedValue ?? "", this.werks, "", this.werks, "", [], [], DIMModelStatus.UnChanged);

    var condiModelList = [condiModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDSTOORDERManageModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDSTOORDERManageModelList", condiModelList, QueryCacheType.None);
    this.orderList = result[0].T_DATA;

    for (var row of this.orderList) {
      if (row.ZCANCEL === "Y")
        row.ZCANCELNM = "취소가능";
      else
        row.ZCANCELNM = "취소불가";

      var statnm = this.ZStatus.find(item => item.code === row.ZSTATS);
      if (statnm !== undefined)
        row.ZSTATSNM = statnm.name;

      row.LGOBE = this.lgNmList.find(item => item.LGORT === row.LGORT)?.LGOBE;

      row.RESLOT = this.lgNmList.find(item => item.LGORT === row.RESLO)?.LGOBE;
    }

    this.gridDataSource = new ArrayStore(
      {
        key: ["ZSTVBELN", "EBELN"],
        data: this.orderList
      });

    return result[0].T_DATA;
  }

  //주문등록 저장
  public async createOrder(appConfig: AppConfigService) {
    
    var tdataModel: ZSDS0050Model[] = [this.orderInfo];
    var receiveModel: ZSDSTOORDERReceiveModel = new ZSDSTOORDERReceiveModel("", "", tdataModel);
    var receiveModelList: ZSDSTOORDERReceiveModel[] = [receiveModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDSTOORDERReceiveModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDSTOORDERReceiveModelList", receiveModelList, QueryCacheType.None);
    return result[0];
  }

  public async cancelData(appConfig: AppConfigService, cancelModelList: ZSDS0061Model[], keyValue:string) {
    var condiModel = new ZSDSTOORDERManageModel("", "", this.startDate, this.endDate, this.empid,
      this.lgortInCodeDynamic.selectedValue ?? "", "C", this.lgortOutCodeDynamic.selectedValue ?? "", this.werks, "", this.werks, keyValue, cancelModelList, [], DIMModelStatus.UnChanged);

    var condiModelList = [condiModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDSTOORDERManageModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDSTOORDERManageModelList", condiModelList, QueryCacheType.None);
    return result[0];
  }

  async getLgortNm() {

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.lgortInCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(T001lModel);
    this.lgNmList = resultModel;
  }

}
