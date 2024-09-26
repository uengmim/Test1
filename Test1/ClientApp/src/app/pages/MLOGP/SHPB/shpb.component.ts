import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ImateInfo, QueryCacheType, QueryDataType, QueryMessage, QueryParameter, QueryRunMethod } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CommonCodeInfo, ParameterDictionary, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { Service, CarSeq, CSpart } from '../ALRC/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
  DxFormComponent,
  DxPopupComponent,
} from 'devextreme-angular';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';
import ArrayStore from 'devextreme/data/array_store';
import { confirm, alert } from "devextreme/ui/dialog";
import { ZSDS6430Model, ZSDIFPORTALSAPLELIQSndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqSnd';

import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZSDIFPORTALSAPGIYCLIQRcvModel, ZSDS6450Model, ZSDT6460Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapGiYcliqRcvProxy';
import { HeaderData, OilDepot } from '../SHPC/app.service';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { CarbynmfModel } from '../../../shared/dataModel/ORACLE/CARBYNMFProxy';
import { UtijisifModel } from '../../../shared/dataModel/ORACLE/UTIJISIFProxy';
import { ZSDIFPORTALSAPSHIPPINGInsModel, ZSDS6901Model, ZSDT6901Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingIns';
import { UtichulfModel } from '../../../shared/dataModel/ORACLE/UTICHULFProxy';
import { TestInData } from '../../../shared/dataModel/MLOGP/TestInData';
import { QmsInfResult } from '../../../shared/dataModel/QMSIF/QmsInfResult';
import { TestData } from '../../../shared/dataModel/MLOGP/TestData';
import { ZSDT7300Model } from '../../../shared/dataModel/MFSAP/Zsdt7300Proxy';
import { TestDataList } from './app.service';
import { MAKTEnModel } from '../../../shared/dataModel/MLOGP/MaktEn';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shpb.component.html',
  providers: [ImateDataService, Service]
})



export class SHPBComponent {
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr1Entery', { static: false }) tdlnr1CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoCodeEntery', { static: false }) zcarnoCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('unloadInfoCodeDynamic', { static: false }) unloadInfoCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('truckTypeCodeDynamic', { static: false }) truckTypeCodeDynamic!: CommonPossibleEntryComponent;

  /* Entry  선언 */
  //제품코드
  matnrCode!: TableCodeInfo;
  //하차 방법
  unloadInfoCode!: TableCodeInfo;
  //화물차종
  truckTypeCode!: TableCodeInfo;
  //1차운송사
  tdlnr1Code!: TableCodeInfo;
  //2차운송사
  tdlnrCode!: TableCodeInfo;
  //차량번호
  zcarnoCode!: TableCodeInfo;

  /*Entery value 선언*/
  //제품구분(비료:10, 친환경:40)
  matnrValue!: string | null;
  //허차정보
  unloadInfoValue: string | null;
  //화물차종
  truckTypeValue!: string | null;
  //1차운송사
  tdlnr1Value!: string | null;
  //2차운송사
  tdlnrValue!: string | null;
  //차량번호
  zcarnoValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  carFormData: any = {};  //차량 배차 메인 폼데이터

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "shpc";

  dataSource: any;
  //거래처

  numberPattern: any = /^[^0-9]+$/;
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
  saveButtonOptions: any;
  saveButtonOptions2: any;
  saveButtonOptions4: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //상세 추가 버튼
  addDetailButtonOptions: any;
  cheGiButtonOptions: any;

  oilPopupCloseButtonOptions: any;
  chePopupCloseButtonOptions: any;
  //편집 취소 버튼
  cancelEditButtonOptions: any;
  loadPanelOption: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //팝업줄 선택
  selectedRowIndex = -1;
  //메인줄 선택
  mainDataselectedRowIndex = -1;
  //팝업데이터
  popupData: ZSDS6450Model[] = []; // 팝업 안 그리드

  //출고팝업 헤더정보
  popHeaderData: HeaderData = new HeaderData();
  //출고팝업 아이템정보
  popItemData!: ZSDS6450Model;
  //출고팝업 유창정보
  popOilDepot: any

  popOilDepotData: OilDepot[] = [];

  //유창정보 온오프
  isPopVisible: boolean = true;

  popTabIndex: number = 0;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;
  closeButtonOptions: any;
  closeButtonOptions2: any;
  closeButtonOptions3: any;
  closeButtonOptions4: any;

  GiButtonOptions: any;
  CGiButtonOptions: any;

  popupVisible = false;
  popupVisible2 = false;
  popupVisible3 = false;
  popupVisible4 = false;
  collapsed: any;
  chePopupVisible = false;
  //배차팝업 선택값
  selectGrid2Data: ZSDS6450Model[] = [];
  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 시험성적서 출력";

    let thisObj = this;
    this.loadingVisible = true;

    //파서블엔트리 초기화

    this.popTabIndex = 0;

    //this._dataService = dataService;

    //선택값 초기화
    this.unloadInfoValue = "";
    this.matnrValue = "";
    this.truckTypeValue = "";
    this.tdlnrValue = "";
    this.tdlnr1Value = "";
    this.zcarnoValue = "";

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate()), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    this.dataLoad();

    this.popOilDepot = new ArrayStore(
      {
        key: ["C_PART"],
        data: thisObj.popOilDepotData
      });

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        this.loadingVisible = true;
        await this.dataLoad();
        this.loadingVisible = false;
      },
    };
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  //화학, 유류 구분
  onCSpartValueChanged(e: any) {

  }

  selectedChanged(e: any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }

  mainDataselectedChanged(e: any) {
    this.mainDataselectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }

  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  //첫화면 데이터 조회 RFC
  public async dataLoad() {

    var zsds6430: ZSDS6430Model[] = [];
    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", "", "", "20", new Date("0001-01-01"), new Date("0001-01-01"), "", "", "", "C", "", "", "", "", "", zsds6430 , this.startDate, this.endDate);


    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);

    this.orderGridData = resultModel[0].IT_DATA;
    this.loadingVisible = true;

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR", "ZSEQUENCY"],
        data: this.orderGridData
      });
    this.loadingVisible = false;
  }

  
  public async changeTimeToString(oldStr: string) {
    var newStr: string = "";
    if (oldStr === undefined) newStr = "00:00:00";
    else newStr = oldStr;

    return newStr;
  }
  //배차등록
  public async createOrder() {
    var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();
    var modelList: ZSDS6450Model[] = [];
    selectData.forEach(async (row: ZSDS6430Model) => {

    });

    //var zsd6440list: ZSDS6440Model[] = this.popupData;

    //zsd6440list.forEach(async (row: ZSDS6440Model) => {
    //  row.ZSHIPSTATUS = "30";
    //});

    //var createModel = new ZSDIFPORTALSAPLELIQRcvModel("", "", modelList);
    //var createModelList: ZSDIFPORTALSAPLELIQRcvModel[] = [createModel];

    //var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQRcvModelList", createModelList, QueryCacheType.None);
    //return insertModel[0];

  }



  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */
  onPEDataLoaded(e: any) {
    this.loadePeCount++;
    this.loadingVisible = true;

    console.info(`DATA LOAD COUNT: ${this.loadePeCount}`);
    /*
     if (e.component.ClearSelectedValue != undefined) {
       setTimeout(() => {
         e.component.ClearSelectedValue();
       });
     }
     */
    if (this.loadePeCount >= 6) {
      this.loadingVisible = false;
      this.loadePeCount = 0;
    }
  }

  async getOilDepot() {
    return this.popOilDepotData;
  }

  //저장 이벤트
  async refSaveData(e: any) {
    if (await confirm("저장하시겠습니까?", "알림")) {

      if (this.orderGrid.instance.getSelectedRowsData().length > 0) {
        this.loadingVisible = true;
        var result = await this.createOrder();
        this.loadingVisible = false;
        var reMSG = "";
        //result.T_DATA.forEach(async (row: ZSDS6440Model) => {
        //  if (row.MTY === "E")
        //    reMSG = row.MSG;
        //});

        //if (reMSG !== "") {
        //  alert(`배차등록 실패,\n\n오류 메세지: ${reMSG}`);
        //  return;
        //}
        //else if ((result.E_MTY === "S")) {
        //  alert("배차등록완료");
        //  this.popupVisible = false;
        //  /*            this.orderData.push(this.popupData);*/
        //  this.dataLoad();
        //}
      } else {

      }
    }
  }

  async refConfirmGI(e: any) {


  }

  async printRef(e: any) {
    if (this.orderGrid.instance.getSelectedRowsData().length > 1) {
      alert("단일 행 선택 후 시험성적서 출력이 가능합니다.", "알림");
      return;
    }
    else {

      var zsdt7300List: ZSDT7300Model[] = [];

      let selectData = this.orderGrid.instance.getSelectedRowsData()[0];


      let testInData = new TestInData(selectData.MATNR, selectData.ARKTX);
      let testDataStr = JSON.stringify(testInData);

      let maktData = await this.dataService.SelectModelData<MAKTEnModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.MAKTEnList",
        [this.appConfig.mandt, selectData.MATNR, "E"], "", "", QueryCacheType.None);


      let queryParam = new QueryParameter("testIn", QueryDataType.String, testDataStr, "", "", "", "");

      let TestResultQuery = new QueryMessage(QueryRunMethod.Alone, "testResult", "#func", "NBPDataModels@NAMHE.CustomFunction.QmsTestResultInterface", [], [queryParam]);

      var resultSet = await this.dataService.dbSelectToDataSet([TestResultQuery]);
      let result = resultSet.getDataObject("result", QmsInfResult);
      let resultT = resultSet.getDataObject("tData", TestData);
      let resultS = resultSet.getDataObject("tData", TestDataList);

      if (resultT.length == 0) {
        alert(result[0].msg, "알림");
      } else {

        var checkResult: ZSDT7300Model[] = [];
        checkResult = await this.dataService.SelectModelData<ZSDT7300Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7300CustomList",
          [this.appConfig.mandt, selectData.VBELN, formatDate(new Date(), "yyyyMMdd", "en-US")], "", "", QueryCacheType.None);

        var count = 0;
        if (checkResult.length === 0) {
          for (var row of resultS) {
            count = count + 1;
            zsdt7300List.push(new ZSDT7300Model(this.appConfig.mandt, selectData.VBELN, new Date(), count.toString().padStart(2, "0"), selectData.KUNNR, selectData.MATNR,
              selectData.ZMENGE3, selectData.VRKME, selectData.ZLIQORDER, row.testitem, "", row.spec ?? row.type, row.val, "", this.appConfig.interfaceId,
              new Date(), formatDate(new Date(), "hh:mm:ss", "en-US"), this.appConfig.interfaceId, new Date(), formatDate(new Date(), "hh:mm:ss", "en-US"), DIMModelStatus.Add));
          }

          await this.dataService.ModifyModelData(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7300ModelList", zsdt7300List);
        }
        var realWei = selectData.Z_N_WEI_TOT - selectData.Z_N_WEI_EMP;
          let params: ParameterDictionary =
          {
            "partno": selectData.MATNR,
            "des": selectData.ARKTX,
            "col1": selectData.VBELN,
            "col2": selectData.WADAT_IST,
            "col3": selectData.NAME1_AG,
            "col4": selectData.ARKTX,
            "col5": "남해 여수공장",
            "col6": "",
            "col7": selectData.ZLIQORDER, // 검사번호가 모든 결과데이터에 붙어서 나옴... 똑같은 데이터일테니 가장 첫번째꺼 보내주기 LOT번호 출하지시번호로 대체
            "col8": realWei.toString(),
            "col9": selectData.VRKME,
            "col10": maktData.length > 0 ? maktData[0].MAKTX : ""
        };

        setTimeout(() => { this.reportViewer.printReport("TestResult", params) });
     
      }
    }
  }

  //운송사 변경 이벤트
  onTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.Z4PARVW = e.selectedValue;
      /*this.tdlnrValue = e.selectedValue;*/
    });
  }

  //운송사 변경 이벤트
  onTdlnr1CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.Z3PARVW = e.selectedValue;
      /*this.tdlnrValue = e.selectedValue;*/
    });
  }

  //하차
  onzunloadCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.ZUNLOAD = e.selectedValue;
      /*this.unloadInfoValue = e.selectedValue;*/
    });
  }
  //화물차종
  onzcartypeCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.ZCARTYPE = e.selectedValue;
      /*this.truckTypeValue = e.selectedValue;*/
    });
  }

  //자재명 변경이벤트
  onmatnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.MATNR = e.selectedValue;
      /*this.matnrValue = e.selectedValue;*/
    });
  }

  //차량번호 선택이벤트
  onZcarnoCodeValueChanged(e: any) {
    /*    setTimeout(() => {*/
    /*this.zcarnoValue = e.selectedValue;*/
    this.popItemData.ZCARNO = e.selectedValue;
    this.popItemData.ZDRIVER = e.selectedItem.ZDERIVER1;
    this.popItemData.ZPHONE = e.selectedItem.ZPHONE1;
    this.popItemData.ZCARTYPE = e.selectedItem.ZCARTYPE1;
    /*    });*/
  }

  //팝업화면에 사용되는 엔트리 초기화
  public clearEntery() {
    /*this.unloadInfoCodeDynamic.ClearSelectedValue()*/
    this.matnrCodeDynamic.ClearSelectedValue();
    this.truckTypeCodeDynamic.ClearSelectedValue();
    this.tdlnrCodeDynamic.ClearSelectedValue();
    this.zcarnoCodeDynamic.ClearSelectedValue();
  }
}

