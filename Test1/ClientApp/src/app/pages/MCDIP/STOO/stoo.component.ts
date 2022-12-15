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
import { Service, Gubun } from './app.service';
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
import { AppInfoService } from '../../../shared/services';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZSDS0050Model, ZSDSTOORDERReceiveModel } from '../../../shared/dataModel/MFSAP/ZsdStoOrderReceiveProxy';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZSDS0060Model, ZSDS0061Model, ZSDSTOORDERManageModel } from '../../../shared/dataModel/MFSAP/ZSdStoOrderManageProxy';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { mode } from 'crypto-js';


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*STO주문 Component*/


@Component({
  templateUrl: 'stoo.component.html',
  providers: [ImateDataService, Service]
})

export class STOOComponent {
  @ViewChild('lgortInCodeDynamic', { static: false }) lgortInCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('lgortOutCodeDynamic', { static: false }) lgortOutCodeDynamic!: TablePossibleEntryComponent;
  /*@ViewChild('kunnrCodeDynamic', { static: false }) kunnrCodeDynamic!: TablePossibleEntryComponent;*/
  @ViewChild('kunweCodeDynamic', { static: false }) kunweCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('inco1CodeDynamic', { static: false }) inco1CodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('tdlnr1CodeDynamic', { static: false }) tdlnr1CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr2CodeDynamic', { static: false }) tdlnr2CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('sublgortOutCodeDynamic', { static: false }) sublgortOutCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('stockTypeCodeDynamic', { static: false }) stockTypeCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('cancelCodeDynamic', { static: false }) cancelCodeDynamic!: TablePossibleEntryComponent;
  /*@ViewChild('palletTypeCodeDynamic', { static: false }) palletTypeCodeDynamic!: TablePossibleEntryComponent;*/
  @ViewChild('truckTypeCodeDynamic', { static: false }) truckTypeCodeDynamic!: TablePossibleEntryComponent;
  /*@ViewChild('unloadInfoCodeDynamic', { static: false }) unloadInfoCodeDynamic!: TablePossibleEntryComponent;*/
  @ViewChild('zvkausCodeDynamic', { static: false }) zvkausCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('zproductCodeDynamic', { static: false }) zproductCodeDynamic!: TablePossibleEntryComponent;
  @ViewChild('zcarnoCodeDynamic', { static: false }) zcarnoCodeDynamic!: TablePossibleEntryComponent;

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;
  
  //조회버튼
  searchButtonOptions: any;
  data: any;
  backButtonOption: any;

  /**
   * 데이터 스토어 키
   * */
  dataStoreKey: string = "stoo";

  //파서블엔트리
  lgortInCode: TableCodeInfo;
  lgortOutCode: TableCodeInfo;
  /*kunnrCode: TableCodeInfo;*/
  kunweCode: TableCodeInfo;
  matnrCode: TableCodeInfo;
  inco1Code: TableCodeInfo;
  tdlnr1Code: TableCodeInfo;
  tdlnr2Code: TableCodeInfo;
  sublgortOutCode: TableCodeInfo;
  stockTypeCode: TableCodeInfo;
  /*cancelCode: TableCodeInfo;*/
  /*palletTypeCode: TableCodeInfo;*/
  truckTypeCode: TableCodeInfo;
  /*unloadInfoCode: TableCodeInfo;*/
  /*zvkausCode: TableCodeInfo;*/
  zproductCode: TableCodeInfo;
  zcarnoCode: TableCodeInfo

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
  /*palletTypeValue: string | null = "";*/
  truckTypeValue: string | null = "";
  /*unloadInfoValue: string | null = "";*/
  zvkausValue: string | null = "";
  zproductValue: string | null = "";
  zcarnoValue: string | null = "";

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;

  //화면제어용
  popupStat: boolean = false;

  dbTitle: string = "";

  selectedRows: any = [];

  gubunList: Gubun[] = [];

  //선택조건
  //구분
  selectedGubun: Gubun;

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
  collapsed: any;

  //multiseletbox
  gridDataSource: any;
  orderInfo: ZSDS0050Model;
  orderList: ZSDS0060Model[] = [];

  popupPosition: any;
  customOperations!: Array<any>;
  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService, private appConfig: AppConfigService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | STO주문-유류/액상";
    let page = this;

    //QA test용 설정

    //데이터 로딩 패널 보이기
    this.loadingVisible = true;

    this.gubunList = service.getGubun();
    this.selectedGubun = this.gubunList[0];

    this.dbTitle = appConfig.dbTitle;

    this.endDate = formatDate(this.now.setDate(this.now.getDate()), "yyyy-MM-dd", "en-US");
    this.startDate = new Date();
    this.startDate = formatDate(this.now.setDate(this.now.getDate() - 7), "yyyy-MM-dd", "en-US");

    //파서블엔트리
    this.lgortInCode = appConfig.tableCode("유류창고");
    this.lgortOutCode = appConfig.tableCode("유류창고");

    /*this.kunnrCode = appConfig.tableCode("RFC_유류고객정보");*/
    /*this.kunweCode = appConfig.tableCode("유류창고");*/
    this.kunweCode = appConfig.tableCode("RFC_유류고객정보");
    this.matnrCode = appConfig.tableCode("유류제품명");
    this.inco1Code = appConfig.tableCode("인코텀스");
    this.tdlnr1Code = appConfig.tableCode("운송업체");
    this.tdlnr2Code = appConfig.tableCode("운송업체");
    this.sublgortOutCode = appConfig.tableCode("유류창고");
    this.stockTypeCode = appConfig.tableCode("RFC_재고유형");
    /*this.cancelCode = appConfig.tableCode("RFC_취소코드");*/
    /*this.palletTypeCode = appConfig.tableCode("RFC_파레트유형");*/
    this.truckTypeCode = appConfig.tableCode("RFC_화물차종");
    /*this.unloadInfoCode = appConfig.tableCode("RFC_하차정보");*/
    //this.zvkausCode = appConfig.tableCode("RFC_용도");

    if (this.selectedGubun.zgubn === "B") {
      this.zproductCode = appConfig.tableCode("RFC_유류취급제품");
      this.zcarnoCode = appConfig.tableCode("화학차량");
    }
    else {
      this.zproductCode = appConfig.tableCode("RFC_화학취급제품");
      this.zcarnoCode = appConfig.tableCode("유류차량");
    }

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgortInCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgortOutCode),

      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnrCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunweCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.inco1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnr1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnr2Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.sublgortOutCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.stockTypeCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.palletTypeCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.truckTypeCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.unloadInfoCode),*/
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zvkausCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zproductCode)
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
 
    var newdata = new ZSDS0050Model("", this.selectedGubun.zgubn, this.selectedGubun.ekorg, this.selectedGubun.ekgrp, this.selectedGubun.bukrs, "",
      this.selectedGubun.werks, "", "", "", "", "", "", "", 0, 0, 0, 0, 0, 0, 0, 0,
      new Date(), new Date(), "", "", "", "", "", "", "", "", "", "", "", "", "", 0, "", 0, 0, this.selectedGubun.werks, "", "", "", "", "", "", "", "",
      new Date(), "", "", new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged);

    this.orderInfo = Object.assign(newdata);

    const that = this;
    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;

    this.orderList = Object.assign(page.dataLoad(imInfo, dataService, appConfig)) as ZSDS0060Model[];

    //메인데이터
    this.gridDataSource = new CustomStore(
      {
        key: ["ZSTVBELN", "EBELN"],
        load: function (loadOptions) {
          return page.dataLoad(imInfo, dataService, appConfig);
        }
      });

    //저장버튼 이벤트
    this.saveButtonOptions = {
      text: 'Save',
      useSubmitBehavior: true,
      onClick: async (e: any) => {
        let vali = e.validationGroup.validate();

        if (await confirm("저장하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          var result: ZSDSTOORDERReceiveModel = await this.createOrder(appConfig);
          this.loadingVisible = false;
          if (result.MTY === "E")
            alert(result.MSG, "알림");
          else
            alert("저장되었습니다.", "알림");

          this.orderInfo.ZSTVBELN = result.T_DATA[0].ZSTVBELN;
          this.orderInfo.EBELN = result.T_DATA[0].EBELN;
          this.orderInfo.ZABGRU = result.T_DATA[0].ZABGRU;
          this.orderInfo.ZBLOCK = result.T_DATA[0].ZBLOCK;
          /*that.popupVisible = false;*/
        }
      }
    };

      this.closeButtonOptions = {
        text: 'Close',
        onClick(e: any) {
          that.popupVisible = false;
        }
    }
    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
  };

  onGubunValueChanged(e: any) {
    setTimeout(() => {
      var selectedVal: string = e.value;
      if (selectedVal === "O") {
        this.zproductCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("RFC_유류취급제품"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "취급제품");
        this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("유류제품명"), "MATNR", "%MAKTX%(%MATNR%)", "유류제품");
        this.truckTypeCodeDynamic.SetDataFilter(["DOMVALUE_L", "startswith", "C"], false);
        this.zcarnoCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("유류차량"), "ZCARNO", "%ZCARNO%", "차량정보");
      } else {
        this.zproductCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("RFC_화학취급제품"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "취급제품");
        this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("화학제품명"), "MATNR", "%MAKTX%(%MATNR%)", "화학제품");
        this.truckTypeCodeDynamic.SetDataFilter(["DOMVALUE_L", "startswith", "B"], false);
        this.zcarnoCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("화학차량"), "ZCARNO", "%ZCARNO%", "차량정보");
      }
      this.truckTypeCodeDynamic.ClearSelectedValue();
    });
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
      this.kunweCodeDynamic.ClearSelectedValue();
      this.kunweCodeDynamic.SetDataFilter(["KUNNR", "=", e.selectedValue]);

      this.orderInfo.KUNNR = e.selectedItem.KUNNR;
      this.orderInfo.NAME1 = e.selectedItem.NAME1;
      this.orderInfo.CITY1 = e.selectedItem.CITY1;
      this.orderInfo.STREET = e.selectedItem.STREET;
      this.orderInfo.TELF1 = e.selectedItem.TELF1;
      this.orderInfo.MOBILENO = e.selectedItem.MOBILENO;
    });
    return;
  }

  onzproductCodeValueChanged(e: any) {
    if(this.selectedGubun.zgubn === "B")
      this.orderInfo.ZPRODUCT2 = e.selectedItem.DOMVALUE_L;
    else
      this.orderInfo.ZPRODUCT1 = e.selectedItem.DOMVALUE_L;

    this.truckTypeCodeDynamic.SetDataFilter(["DOMVALUE_L", "startswith", "B"]);
    return;
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
    this.orderInfo.INCO1 = e.selectedItem.INCO1;
    return;
  }

  //도착지변경
  onlgortCodeValueChanged(e: any) {
    setTimeout(() => {
      this.orderInfo.LGORT = e.selectedItem.LGORT;
      this.orderInfo.NAME1 = e.selectedItem.NAME1;
      this.orderInfo.CITY1 = e.selectedItem.CITY1;
      this.orderInfo.STREET = e.selectedItem.STREET;
      this.orderInfo.TELF1 = e.selectedItem.TELF1;
      this.orderInfo.MOBILENO = e.selectedItem.MOBILENO;
    });

    return;
  }

  //운송사변경
  ontdlnr1CodeValueChanged(e: any) {
    this.orderInfo.TDLNR1 = e.selectedItem.ZCM_CODE3;
    return;
  }

  //실제운송사변경
  ontdlnr2CodeValueChanged(e: any) {
    this.orderInfo.TDLNR2 = e.selectedItem.ZCM_CODE3;
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
    this.orderInfo.ZDRIVER = e.selectedItem.ZDERIVER1;
    this.truckTypeValue = e.selectedItem.ZCARTYPE1;
    /*    });*/
  }

  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }

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
          alert("배치가 진행되었거나, 취소가 완료된 문건은 체크할 수 없습니다.", "오류");
          return;
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
          alert("취소되었습니다.", "알림");
      }
      this.loadingVisible = false;
      this.dataGrid.instance.refresh();
    }
  }

  getDataGrid(e: any) {
    this.dataGrid.instance.refresh();
  }

  dbClickDataGrid(e: any) {
    this.popupVisible = false;
  }

  //파서블엔트리 선택값 삭제
  clearPossibleEntrys() {
    //this.lgortInCodeDynamic.ClearSelectedValue();
    //this.lgortOutCodeDynamic.ClearSelectedValue();
    /*this.kunnrCodeDynamic.ClearSelectedValue();*/
    this.kunweCodeDynamic.ClearSelectedValue();
    this.matnrCodeDynamic.ClearSelectedValue();
    this.inco1CodeDynamic.ClearSelectedValue();
    this.tdlnr1CodeDynamic.ClearSelectedValue();
    this.tdlnr2CodeDynamic.ClearSelectedValue();
    this.sublgortOutCodeDynamic.ClearSelectedValue();
    this.stockTypeCodeDynamic.ClearSelectedValue();
    /*this.cancelCodeDynamic.ClearSelectedValue();*/
    /*this.palletTypeCodeDynamic.ClearSelectedValue();*/
    this.truckTypeCodeDynamic.ClearSelectedValue();
    /*this.unloadInfoCodeDynamic.ClearSelectedValue();*/
    /*this.zvkausCodeDynamic.ClearSelectedValue();*/
    this.zcarnoCodeDynamic.ClearSelectedValue();
  }

  //주문등록
  requestOrder(e: any) {
    this.clearPossibleEntrys();

    var newdata = new ZSDS0050Model("", this.selectedGubun.zgubn, this.selectedGubun.ekorg, this.selectedGubun.ekgrp, this.selectedGubun.bukrs, "",
      this.selectedGubun.werks, "", "", "", "", "", "", "", 0, 0, 0, 0, 0, 0, 0, 0,
      new Date(), new Date(), "", "", "", "", "", "", "", "", "", "", "", "", "", 0, "", 0, 0, this.selectedGubun.werks, "", "", "", "", "", "", "", "",
      new Date(), "", "", new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged);

    this.orderInfo = Object.assign(newdata);

    this.popupStat = false;
    this.popupVisible = true;

    //0.5초 뒤에 적용(숨김 상태의 컨트롤은 프로퍼티 변동이 안되므로 POPUP창이 보여진 상태에서 변경을 해 주어야 함)
    setTimeout((that : STOOComponent) => {
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
    var selectedData: ZSDS0060Model = e.data as ZSDS0060Model;

    this.orderInfo = new ZSDS0050Model(selectedData.ZSTVBELN, this.selectedGubun.zgubn, this.selectedGubun.ekorg, this.selectedGubun.ekgrp, this.selectedGubun.bukrs, "",
      this.selectedGubun.werks, selectedData.LGORT, selectedData.NAME1,
      selectedData.CITY1, selectedData.STREET, "", "", "", 0, 0, 0, 0, 0, 0, 0, 0, selectedData.AEDAT, selectedData.EINDT, selectedData.INCO1, selectedData.TDLNR1,
      selectedData.TDLNR2, selectedData.ZCARTYPE, selectedData.ZCARNO, selectedData.ZDRIVER, selectedData.ZUNLOAD, selectedData.ZPALLTP, selectedData.ZVKAUS,
      selectedData.REMARK, "", "", selectedData.MATNR, selectedData.ZMENGE1, selectedData.MEINS, 0, 0, selectedData.RESWK, selectedData.RESLO, selectedData.INSMK,
      selectedData.ZABGRU, selectedData.ZBLOCK, selectedData.EBELN, selectedData.EBELP,
      selectedData.ZSTATS, "", new Date(), "", "", new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged);

    this.kunnrValue = selectedData.KUNNR;
    this.kunweValue = selectedData.RESLO;
    this.matnrValue = selectedData.MATNR;
    this.inco1Value = selectedData.INCO1;
    this.tdlnr1Value = selectedData.TDLNR1;
    this.tdlnr2Value = selectedData.TDLNR2;
    this.sublgortOutValue = selectedData.RESLO;
    this.stockTypeValue = selectedData.INSMK;
    /*this.cancelValue = selectedData.;*/
    /*this.palletTypeValue = selectedData.ZPALLTP;*/
    this.truckTypeValue = selectedData.ZCARTYPE;
    /*this.unloadInfoValue = selectedData.ZUNLOAD;*/
    this.zvkausValue = selectedData.ZVKAUS;

    this.popupStat = true;
    this.popupVisible = !this.popupVisible;
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
    if (this.loadePeCount >= 12)
      this.loadingVisible = false;

    if (e.component.popupTitle === "화물차종")
      this.truckTypeCodeDynamic.SetDataFilter(["DOMVALUE_L", "startswith", "C"]);
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
      this.lgortInCodeDynamic.selectedValue ?? "", "D", this.lgortOutCodeDynamic.selectedValue ?? "", this.selectedGubun.werks, "", this.selectedGubun.werks, "", [], [], DIMModelStatus.UnChanged);

    var condiModelList = [condiModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDSTOORDERManageModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDSTOORDERManageModelList", condiModelList, QueryCacheType.None);
    this.orderList = result[0].T_DATA;
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
    var condiModel = new ZSDSTOORDERManageModel("", "", this.startDate, this.endDate, "",
      this.lgortInCodeDynamic.selectedValue ?? "", "C", this.lgortOutCodeDynamic.selectedValue ?? "", this.selectedGubun.werks, "", this.selectedGubun.werks,
      keyValue, cancelModelList, [], DIMModelStatus.UnChanged);

    var condiModelList = [condiModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDSTOORDERManageModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDSTOORDERManageModelList", condiModelList, QueryCacheType.None);
    return result[0];
  }

}
