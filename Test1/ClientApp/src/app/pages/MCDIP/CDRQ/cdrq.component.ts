import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { ZXNSCRFCDataModel } from '../../../shared/dataModel/ZxnscRfcData';
import { ImateInfo, QueryCacheType, QueryDataType, QueryMessage, QueryParameter, QueryRunMethod } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import ArrayStore from 'devextreme/data/array_store';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { CommonCodeInfo, ParameterDictionary, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { CarList, Service } from './app.service';
import { alert, confirm } from "devextreme/ui/dialog"
import {
  DxDataGridComponent,
  DxButtonModule,
  DxFormComponent,
  DxPopupComponent
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import dxForm from 'devextreme/ui/form';
import { AuthService } from '../../../shared/services';;
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ZSDIFPORTALSAPSHIPPINGReqModel, ZSDS6900Model, ZSDT6900Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingReqProxy';
import { Title } from '@angular/platform-browser';
import { ZSDIFPORTALSAPSHIPPINGInsModel, ZSDS6901Model, ZSDT6901Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingIns';
import { ZMMOILBLGrinfoModel, ZMMS3200Model, ZMMS9900Model } from '../../../shared/dataModel/MCDIP/ZmmOilBlGrinfo';
import { ZSDIFPORTALSAPGIYCLIQRcvModel, ZSDS6450Model, ZSDT6460Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapGiYcliqRcvProxy';
import { TestInData } from '../../../shared/dataModel/MLOGP/TestInData';
import { HeaderData, OilDepot, TestDataList } from '../../MLOGP/SHPB/app.service';
import { UtijisifModel } from '../../../shared/dataModel/ORACLE/UTIJISIFProxy';
import { CarbynmfModel } from '../../../shared/dataModel/ORACLE/CARBYNMFProxy';
import { UtichulfModel } from '../../../shared/dataModel/ORACLE/UTICHULFProxy';
import { CHMWkodModel } from '../../../shared/dataModel/ORACLE/CHM_WKODProxy';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZMMT3063Model } from '../../../shared/dataModel/MLOGP/Zmmt3063';
import { ZMMOILGirecvModel, ZMMS3210Model } from '../../../shared/dataModel/MCDIP/ZmmOilGirecv';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { UTIGGDENFCustomModel } from '../../../shared/dataModel/MCSHP/UTIGGDENFCustomProxy';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  templateUrl: 'cdrq.component.html',
  providers: [ImateDataService, Service],

})

//any
export class CDRQComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('kunnrEntery', { static: false }) kunnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('matnrEntery', { static: false }) matnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('kunweEntery', { static: false }) kunweEntery!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoEntery', { static: false }) zcarnoEntery!: CommonPossibleEntryComponent;
  @ViewChild('inco1CodeDynamic', { static: false }) inco1CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('t001Entery', { static: false }) t001Entery!: CommonPossibleEntryComponent;
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr1Entery', { static: false }) tdlnr1CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoCodeEntery', { static: false }) zcarnoCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('unloadInfoCodeDynamic', { static: false }) unloadInfoCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('truckTypeCodeDynamic', { static: false }) truckTypeCodeDynamic!: CommonPossibleEntryComponent;
  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "cdrq";
  //조회데이터
  orderData: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  //삭제버튼
  state: boolean = true;
  add: boolean = true;
  popTabIndex: number = 0;

  //조회날짜
  startDate: any;
  endDate: any;
  reqVisible = false;
  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;
  //주문처 정보
  kunnrCode: TableCodeInfo;
  matnrCode: TableCodeInfo;
  kunweCode: TableCodeInfo;
  zcarnoCode: TableCodeInfo;
  inco1Code: TableCodeInfo;
  t001Code: CommonCodeInfo;
  //하차 방법
  unloadInfoCode!: TableCodeInfo;
  //화물차종
  truckTypeCode!: TableCodeInfo;
  //1차운송사
  tdlnr1Code!: TableCodeInfo;
  //2차운송사
  tdlnrCode!: TableCodeInfo;
  /*Entery value 선언*/
  kunnrValue: string | null;
  matnrValue: string | null;
  matnrReqValue: string | null;
  kunweValue: string | null;
  zcarnoValue: string | null;
  inco1Value: string | null;
  lgortValue: string | null;
  //화물차종
  truckTypeValue!: string | null;
  //1차운송사
  tdlnr1Value!: string | null;
  //2차운송사
  tdlnrValue!: string | null;
  carnoValue!: string | null;

  //요청팝업
  reqPopupData: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  oilSubData: any;
  oilSubGridData: ZMMS3200Model[] = [];
  oilSubFormData: any = {};   //유류 메인 폼데이터
  //출고팝업 유창정보
  popOilDepot: any
  popOilDepotData: OilDepot[] = [];
  carFormData: any = {};  //차량 배차 메인 폼데이터
  oilFormData: any = {};   //유류 메인 폼데이터
  popHeaderData: HeaderData = new HeaderData();
  zcarList: CarList[] = [];
  oilPopupCloseButtonOptions: any;
  GiButtonOptions: any;

  resultS: TestDataList[] = [];
  popupVisible = false;
  //허차정보
  unloadInfoValue: string | null;
  //출고지시(SAP) 데이터
  resultInsModel: ZSDS6901Model[] = [];
  //출고팝업 아이템정보
  popItemData!: ZSDS6450Model;
  //load
  loadPanelOption: any;
  customOperations!: Array<any>;
  collapsed: any;
  incoFilter: any = ["ZCM_CODE2", "<>", "NH"];
  //
  dataLoading: boolean = false;
  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo,
    private authService: AuthService, private titleService: Title) {

    appInfo.title = AppInfoService.APP_TITLE + " | S-OIL 출하등록";
    this.titleService.setTitle(appInfo.title);

    this.kunnrCode = appConfig.tableCode("유류납품처");
    this.kunweCode = appConfig.tableCode("유류납품처");
    this.matnrCode = appConfig.tableCode("유류제품명");
    this.zcarnoCode = appConfig.tableCode("유류차량");
    this.inco1Code = appConfig.tableCode("인코텀스");
    this.t001Code = appConfig.commonCode("유류출고사업장");
    this.unloadInfoCode = appConfig.tableCode("RFC_하차정보");
    this.truckTypeCode = appConfig.tableCode("RFC_화물차종");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.tdlnr1Code = appConfig.tableCode("운송업체");
    //조회날짜 초기값
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 120), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunweCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.inco1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.t001Code),
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    this.popTabIndex = 0;

    this.kunnrValue = "";
    this.matnrValue = "";
    this.matnrReqValue = "";
    this.kunweValue = "";
    this.zcarnoValue = "";
    this.inco1Value = "";
    this.lgortValue = "";
    this.truckTypeValue = "";
    this.tdlnrValue = "";
    this.tdlnr1Value = "";
    this.zcarnoValue = "";
    this.carnoValue = "";

    this.dataLoad();


    const that = this;
    //출고처리버튼
    this.GiButtonOptions = {
      text: "출고처리",
      onClick: async () => {


          var GIData = this.popItemData;

          if (GIData.ZMENGE3 === null || GIData.ZMENGE3 === 0 || GIData.ZMENGE3 === undefined) {
            alert("출고수량 은 필수입니다.", "알림");
            return;
          }

          if (GIData.WADAT_IST === null || GIData.WADAT_IST === undefined) {
            alert("출고전기일자는 필수입니다.", "알림");
            return;
          }
          if (GIData.Z_N_WEI_NET === null || GIData.Z_N_WEI_NET === 0 || GIData.Z_N_WEI_NET === undefined) {
            alert("정산수량은 필수입니다.", "알림");
            return;
          }
          if (GIData.ZRACK === null || GIData.ZRACK === undefined || GIData.ZRACK === "") {
            alert("RACK은 필수입니다.", "알림");
            return;
          }
          if (GIData.ZPUMP === null || GIData.ZPUMP === undefined || GIData.ZPUMP === "") {
            alert("PUMP는 필수입니다.", "알림");
            return;
          }
          if (GIData.ZTANK === null || GIData.ZTANK === undefined || GIData.ZTANK === "") {
            alert("TANK는 필수입니다.", "알림");
            return;
          }
          if (GIData.ZTEMP === null || GIData.ZTEMP === undefined) {
            alert("온도는 필수입니다.", "알림");
            return;
          }
          if (GIData.ZCARNO === null || GIData.ZCARNO === undefined || GIData.ZCARNO === "") {
            alert("차량번호는 필수입니다.", "알림");
            return;
          }
          if (GIData.ZDRIVER === null || GIData.ZDRIVER === undefined || GIData.ZDRIVER === "") {
            alert("운전기사는 필수입니다.", "알림");
            return;
          }
          if (GIData.ZUNLOAD === null || GIData.ZUNLOAD === undefined || GIData.ZUNLOAD === "") {
            alert("하차정보는 필수입니다.", "알림");
            return;
          }
          if (await confirm("출고 처리하시겠습니까?", "알림")) {
            this.loadingVisible = true;
            var result = await that.saveData(this);
            this.loadingVisible = false;

            if (result.E_MTY === "E")
              alert(result.E_MSG, "알림");
            else {
              var resultMessage = "";

              if (resultMessage === "") {
                await alert("출고 처리되었습니다.", "알림");
                that.popupVisible = false;
                await this.printRef(null);
                await this.dataLoad();
              } else {
                await alert(resultMessage, "오류");
              }
            }
          
        }
      },
    };
    //유류팝업닫기버튼
    this.oilPopupCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.popupVisible = false;
      }
    }

  }
  public async changeTimeToString(oldStr: string) {
    var newStr: string = "";
    if (oldStr === undefined) newStr = "00:00:00";
    else newStr = oldStr;

    return newStr;
  }


  onKunnrCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.KUNNR = e.selectedValue;
    });
  }

  onMatnrCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.MATNR = e.selectedValue;
      this.reqPopupData.MEINS = e.selectedItem.MEINS;
      this.reqPopupData.MAKTX = e.selectedItem.MAKTX;
    });
  }

  onKunweCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.KUNWE = e.selectedValue;
    });
  }

  onZcarnoCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.ZCARNO = e.selectedItem.ZCARNO;
      this.reqPopupData.ZDRIVER = e.selectedItem.ZDERIVER1;
    });
  }

  onLgortCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.reqPopupData.LGORT = e.selectedValue;
    });
  }
  oninco1CodeValueChanged(e: any) {
    this.reqPopupData.INCO1 = e.selectedItem.INCO1;
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };
  //자재명 변경이벤트
  onReqMatnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.MATNR = e.selectedvalue;
      //  this.matnrReqValue = e.selectedValue;
    });
  }

  //요청팝업닫기버튼
  reqCloseButton(e: any) {
    this.reqVisible = false;
  }


  //조회버튼
  searchButton(e: any) {
    this.dataLoad();
  }

  //버튼활성화
  selectionChanged(data: any) {
    var selectData: ZSDS6900Model[] = this.orderGrid.instance.getSelectedRowsData();
    if (selectData.length > 0) {
      this.add = false;
    } else {
      this.add = true;

    }
    if (selectData[0].ZSTAT === "R") {
      this.state = false;
    }
    else {
      this.state = true;
    }
  }
  //삭제버튼
  async deleteButton(e: any) {
    var selectData: ZSDS6900Model[] = this.orderGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }
    if (selectData[0].ZSTAT == "C") {
      alert("완료된 출하는 삭제할 수 없습니다.", "알림");
      return;
    }
    if (await confirm("삭제하시겠습니까?", "알림")) {
      alert("삭제되었습니다.", "알림")
      this.deleteData();
      this.dataLoad();
      this.state = true;
    }
  }
  //조회 RFC
  public async dataLoad() {
    var zsdsList: ZSDS6900Model[] = [];
    var zsdtList: ZSDT6900Model[] = [];
    var model = new ZSDIFPORTALSAPSHIPPINGReqModel("", "", this.endDate, "", "", this.startDate, "D", "", "", zsdsList, zsdtList);
    var modelList: ZSDIFPORTALSAPSHIPPINGReqModel[] = [model];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGReqModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGReqModelList", modelList, QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN"],
        data: resultModel[0].ET_DATA
      });



  }
  public async yuchangDataLoad() {
    var selectData: ZSDS6900Model[] = this.orderGrid.instance.getSelectedRowsData();


    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")
    var zsds6901List: ZSDS6901Model[] = [];
    var zsdt6901List: ZSDT6901Model[] = [];
    var DataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", selectData[0].DONUM, "O", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List);
    var modelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [DataResult];
    var resultInsModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", modelList, QueryCacheType.None);
    this.resultInsModel = resultInsModel[0].ET_DATA;
    var InsModelData = resultInsModel[0].ET_DATA;


    var jisiilja = InsModelData[0].DONUM.substring(0, 8);
    var jisiseq = InsModelData[0].DONUM.substring(9, 11);
    var jisiDataResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
      ` JIYYMM = '${parseInt(jisiilja)}' AND JISEQ = '${parseInt(jisiseq)}'`, "", QueryCacheType.None);

    var byilja = jisiDataResult[0].JIBCNO1
    var byseq = jisiDataResult[0].JIBCNO2
    var oilDataResult = await this.dataService.SelectModelData<CarbynmfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CarbynmfModelList", [],
      ` BYILJA = '${byilja}' AND BYSEQ = '${byseq}'`, "", QueryCacheType.None);


    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")
    var zsds6901List: ZSDS6901Model[] = [];
    var zsdt6901List: ZSDT6901Model[] = [];

    var oilRFCDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", selectData[0].DONUM, "O", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List);

    var modelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilRFCDataResult];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", modelList, QueryCacheType.None);
    var utiChulDataResult = await this.dataService.SelectModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", [],
      ` CHYYMM = '${resultModel[0].ET_DATA[0].CHDAT}' AND CHSEQ = '${resultModel[0].ET_DATA[0].CHSEQ}'`, "", QueryCacheType.None);


    this.carFormData = oilDataResult[0];
    this.carFormData.BYSTTIME01 = (oilDataResult[0].BYSTTIME01 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYSTTIME02 = (oilDataResult[0].BYSTTIME02 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYSTTIME03 = (oilDataResult[0].BYSTTIME03 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYSTTIME04 = (oilDataResult[0].BYSTTIME04 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYSTTIME05 = (oilDataResult[0].BYSTTIME05 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYSTTIME06 = (oilDataResult[0].BYSTTIME06 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYSTTIME07 = (oilDataResult[0].BYSTTIME07 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYSTTIME08 = (oilDataResult[0].BYSTTIME08 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYSTTIME09 = (oilDataResult[0].BYSTTIME09 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYSTTIME10 = (oilDataResult[0].BYSTTIME10 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME01 = (oilDataResult[0].BYENTIME01 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME02 = (oilDataResult[0].BYENTIME02 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME03 = (oilDataResult[0].BYENTIME03 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME04 = (oilDataResult[0].BYENTIME04 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME05 = (oilDataResult[0].BYENTIME05 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME06 = (oilDataResult[0].BYENTIME06 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME07 = (oilDataResult[0].BYENTIME07 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME08 = (oilDataResult[0].BYENTIME08 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME09 = (oilDataResult[0].BYENTIME09 ?? "000000").toString().padEnd(6, '0');
    this.carFormData.BYENTIME10 = (oilDataResult[0].BYENTIME10 ?? "000000").toString().padEnd(6, '0');
    //this.popItemData.ZSTARTTIME = (utiChulDataResult[0].CHSTTIME ?? "000000").toString().padEnd(6, '0');
    //this.popItemData.ZENDTIME = (utiChulDataResult[0].CHENTIME ?? "000000").toString().padEnd(6, '0');
    //this.popItemData.ZMENGE3 = this.carFormData.BYCHQTY01 + this.carFormData.BYCHQTY02 + this.carFormData.BYCHQTY03 + this.carFormData.BYCHQTY04 + this.carFormData.BYCHQTY05
    //  + this.carFormData.BYCHQTY06 + this.carFormData.BYCHQTY07 + this.carFormData.BYCHQTY08 + this.carFormData.BYCHQTY09 + this.carFormData.BYCHQTY10

  }
  //유류서브데이터로드   //ZMMOILBLGrinfoModel(RFC 조회)
  public async oilSubDataLoad() {
    this.oilSubData = [];
    var selectedData = [];

    selectedData = this.orderGrid.instance.getSelectedRowsData();
    var matnr = selectedData[0].MATNR
    var werks = selectedData[0].WERKS
    var zmms3200: ZMMS3200Model[] = [];
    var zmms9900 = new ZMMS9900Model("", "");
    var gridModel: ZMMS3200Model[] = [];
    var insertData = this.popItemData;

    var oilBlGr = new ZMMOILBLGrinfoModel(zmms9900, matnr, werks, zmms3200);

    var grModel: ZMMOILBLGrinfoModel[] = [oilBlGr];
    var oilSubModel = await this.dataService.RefcCallUsingModel<ZMMOILBLGrinfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMOILBLGrinfoModelList", grModel, QueryCacheType.None);
    if (oilSubModel[0].ES_RESULT.MTY == "S") {
      debugger;
      if (selectedData[0].S_OILNO === "" || selectedData[0].S_OILNO === undefined) {
        var filterModel = oilSubModel[0].T_DATA.filter(item => item.ZTANK == insertData.ZTANK);
        gridModel = filterModel.filter(item => item.GRTYP !== "S");
      } else {
        var filterModel = oilSubModel[0].T_DATA.filter(item => item.ZTANK == insertData.ZTANK);

        gridModel = filterModel.filter(item => item.GRTYP === "S");
      }
    }
    else if (oilSubModel[0].ES_RESULT.MTY == "E") {
      gridModel = [];
    }


    //gridModel = this.oilSubData._array;
    if (gridModel.length > 0) {
      gridModel.forEach(async (array: any) => {
        if (array.ZGI_RSV_QTY == 0 || array.ZGI_RSV_QTY == undefined || Number.isNaN(array.ZGI_RSV_QTY)) {
          array.ZGI_RSV_QTY = 0
        }
        array.ChulHaJaeGo = parseInt(array.ZSTOCK) - parseInt(array.ZGI_RSV_QTY)
      });

    } else {
      gridModel = [];
    }
    this.oilSubGridData = gridModel

    this.loadingVisible = true;
    this.oilSubData = new ArrayStore(
      {
        key: ["ZARRDT", "ZTANK"],
        data: this.oilSubGridData
      });
    this.orderGrid.instance.getScrollable().scrollTo(0);

    this.loadingVisible = false;


    if (this.oilSubGridData.length == 0) {
      this.oilSubFormData = [];
    } else {

      var model: ZMMS3200Model[] = this.oilSubGridData as ZMMS3200Model[]

      var selectSubGridData = model.find(item => item.MATNR === selectedData[0].MATNR && item.ZSTOCK >= selectedData[0].ZMENGE4)

      if (selectSubGridData !== undefined)
        this.oilSubFormData = selectSubGridData;

      else {
        alert("출하지시수량에 맞는 통관재고가 없습니다.", "알림");
        return;
      }

    }
  }


  //출고확정버튼
  async releaseButton(e: any) {
    this.loadingVisible = true;


    var selectData: ZSDS6900Model[] = this.orderGrid.instance.getSelectedRowsData();

    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")
    var zsds6901List: ZSDS6901Model[] = [];
    var zsdt6901List: ZSDT6901Model[] = [];
    var DataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", selectData[0].DONUM, "O", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List);
    var modelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [DataResult];
    var resultInsModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", modelList, QueryCacheType.None);
    this.resultInsModel = resultInsModel[0].ET_DATA;
    var InsModelData = resultInsModel[0].ET_DATA;



    var jisiilja = InsModelData[0].DONUM.substring(0, 8);
    var jisiseq = InsModelData[0].DONUM.substring(8, 11);
    var jisiDataResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
      ` JIYYMM = '${parseInt(jisiilja)}' AND JISEQ = '${parseInt(jisiseq)}'`, "", QueryCacheType.None);
    console.log(jisiDataResult[0])
    var byilja = jisiDataResult[0].JIBCNO1
    var byseq = jisiDataResult[0].JIBCNO2
    var oilDataResult = await this.dataService.SelectModelData<CarbynmfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CarbynmfModelList", [],
      ` BYILJA = '${byilja}' AND BYSEQ = '${byseq}'`, "", QueryCacheType.None);

    var chulDataResult = await this.dataService.SelectModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", [],
      ` CHJIYYMM = '${parseInt(jisiilja)}' AND CHJISEQ = '${parseInt(jisiseq)}'`, "", QueryCacheType.None);

    if (oilDataResult.length > 0) {
      if (oilDataResult[0].BYSTATUS !== "E" && oilDataResult[0].BYSTATUS !== "C") {
        await alert("출하지시가 완료되지 않았습니다.", "알림");
        this.popupVisible = false;
        return;
      }
    }
    setTimeout((
    ) => {
      this.yuchangDataLoad();
    if (jisiDataResult.length > 0) {
      this.popHeaderData.VBELN = InsModelData[0].VBELN;
      this.popHeaderData.KUNNR = InsModelData[0].KUNNR;
      this.popHeaderData.ZMENGE = InsModelData[0].JISIMENGE;
      //팝업 아이템정보 입력
      this.popItemData = new ZSDS6450Model(InsModelData[0].VBELN, InsModelData[0].POSNR, "", "", "", "", "", InsModelData[0].MATNR,
        InsModelData[0].MAKTX, 0, InsModelData[0].MEINS, "", InsModelData[0].JISIMENGE, selectData[0].VRDAT, 0, "", "", InsModelData[0].KUNNR, "", "",
        "", "", 0, 0, InsModelData[0].Z_N_WEI_NET, 0, InsModelData[0].ZRACK, InsModelData[0].ZTANK, InsModelData[0].ZPUMP, InsModelData[0].ZTEMP, InsModelData[0].ZSTARTTIME, InsModelData[0].ZENDTIME,
        "", "", selectData[0].ZCARTYPE, InsModelData[0].ZCARNO, InsModelData[0].ZDRIVER, "", "", InsModelData[0].ZPHONE, "", "", "10", InsModelData[0].BACHNUM, selectData[0].RQDAT, "", "", DIMModelStatus.UnChanged);

      //파서블엔트리 값설정
      this.matnrReqValue = InsModelData[0].MATNR;
      this.zcarnoValue = InsModelData[0].ZCARNO;
      this.unloadInfoValue = "10";
      Object.assign(this.popItemData, {  ZRACK: jisiDataResult[0].JIRACK ?? "", ZPUMP: jisiDataResult[0].JIPUMP ?? "", ZTANK: jisiDataResult[0].JITANKNO ?? "" });

      //this.oilSubDataLoad();



    }

    if (chulDataResult.length > 0) {
      Object.assign(this.popItemData, { Z_N_WEI_EMP: chulDataResult[0].CHEMPTY ?? "", Z_N_WEI_TOT: chulDataResult[0].CHTOTAL ?? "", Z_N_WEI_TOT_OIL: chulDataResult[0].CHMTQTY ?? "" });

      this.popItemData.ZSTARTTIME = oilDataResult[0].BYSTTIME01.padEnd(6, '0')

      if (oilDataResult[0].BYENTIME10 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME10.padEnd(6, '0') });
      else if (oilDataResult[0].BYENTIME09 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME09.padEnd(6, '0') });
      else if (oilDataResult[0].BYENTIME08 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME08.padEnd(6, '0') });
      else if (oilDataResult[0].BYENTIME07 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME07.padEnd(6, '0') });
      else if (oilDataResult[0].BYENTIME06 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME06.padEnd(6, '0') });
      else if (oilDataResult[0].BYENTIME05 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME05.padEnd(6, '0') });
      else if (oilDataResult[0].BYENTIME04 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME04.padEnd(6, '0') });
      else if (oilDataResult[0].BYENTIME03 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME03.padEnd(6, '0') });
      else if (oilDataResult[0].BYENTIME02 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME02.padEnd(6, '0') });
      else if (oilDataResult[0].BYENTIME01 !== null)
        Object.assign(this.popItemData, { ZENDTIME: oilDataResult[0].BYENTIME01.padEnd(6, '0') });

      Object.assign(this.popItemData, { ZTEMP: oilDataResult[0].BYTEMP });

    }

    if (jisiDataResult.length > 0) {
      Object.assign(this.popItemData, { ZRACK: jisiDataResult[0].JIRACK ?? "", ZPUMP: jisiDataResult[0].JIPUMP ?? "", ZTANK: jisiDataResult[0].JITANKNO ?? "" });
    }

    //this.popItemData.ZSHIPMENT_NO = InsModelData[0].ZSHIPMENT_NO;

    if (this.resultInsModel.length > 0) {
      var ddd = this.resultInsModel[0].ZDRIVER;
      if (this.resultInsModel[0].ZDRIVER === "" || this.resultInsModel[0].ZDRIVER === null || this.resultInsModel[0].ZDRIVER === undefined)
        this.popItemData.ZDRIVER = selectData[0].ZDRIVER;
      else
        this.popItemData.ZDRIVER = this.resultInsModel[0].ZDRIVER;

      if (this.resultInsModel[0].ZPHONE === "" || this.resultInsModel[0].ZPHONE === null || this.resultInsModel[0].ZPHONE === undefined)
        this.popItemData.ZPHONE = selectData[0].ZPHONE;
      else
        this.popItemData.ZPHONE = this.resultInsModel[0].ZPHONE;
    } else {
      this.popItemData.ZDRIVER = selectData[0].ZDRIVER;
      this.popItemData.ZPHONE = selectData[0].ZPHONE;
    }

    this.loadingVisible = false;

    this.popupVisible = true;
    }, 100);


  }

  //데이터 저장로직
  public async saveData(thisObj: CDRQComponent) {
    try {
      var selectData: ZSDS6900Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
      var GIData = thisObj.popItemData;
      var carData = thisObj.carFormData;
      var headData = thisObj.popHeaderData;
      let oilCVTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
      let oilNowDate = new Date();
      let oilNowTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
      let minDate = new Date("0001-01-01");
      let minTime = formatDate(new Date("0001-01-01"), "HH:mm:ss", "en-US");
      let oilDate = new Date();
      let oilTime = formatDate(new Date(), "HH:mm:ss", "en-US");
      var model: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [];
      let now = formatDate(new Date(), 'yyyyMMdd', "en-US");



      var oilSelectResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
        `JIYYMM = '${parseInt(now)}' `, "JISEQ DESC", QueryCacheType.None);
      //지시순번
      if (oilSelectResult.length > 0) {
        var jiseq = oilSelectResult[0].JISEQ + 1
      } else {
        var jiseq = 1;
      }


      GIData.ZUNLOAD = this.unloadInfoValue;

      if (GIData.ZMENGE3 === 0) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("출고수량입력은 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.WADAT_IST === null) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("출고전기일자는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.Z_N_WEI_NET === null || GIData.Z_N_WEI_NET === 0 || GIData.Z_N_WEI_NET === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("정산수량은 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZRACK === null || GIData.ZRACK === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("RACK은 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZPUMP === null || GIData.ZPUMP === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("PUMP는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZTANK === null || GIData.ZTANK === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("TANK는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZTEMP === null || GIData.ZTEMP === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("온도는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZCARNO === null || GIData.ZCARNO === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("차량번호는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZDRIVER === null || GIData.ZDRIVER === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("운전기사는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZUNLOAD === null || GIData.ZUNLOAD === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("하차정보는 필수입니다.", "E"));
        return model[0];
      }


      var matnr = this.matnrReqValue
      var doNum = now + jiseq.toString().padStart(3, '0');

      var doNumDate = selectData[0].DONUM.substring(0, 8);
      var doNumSeq = selectData[0].DONUM.substring(8, 11);

      GIData.ZSTARTTIME = GIData.ZSTARTTIME.substr(0, 2) + ":" + GIData.ZSTARTTIME.substr(2, 2) + ":" + GIData.ZSTARTTIME.substr(4, 2)
      GIData.ZENDTIME = GIData.ZENDTIME.substr(0, 2) + ":" + GIData.ZENDTIME.substr(2, 2) + ":" + GIData.ZENDTIME.substr(4, 2)


      var zsds6901 = new ZSDS6901Model("", "", 0, new Date(), "", "", "", "", "", "", "", "", "", "", 0, "", "", "", "", "", "", "", new Date(), new Date(), "", "", "", 0, new Date(), "", 0, "");
      var zsdt6901 = new ZSDT6901Model(thisObj.appConfig.mandt, selectData[0].DONUM, doNumDate, parseInt(doNumSeq), GIData.WADAT_IST, headData.KUNNR, matnr ?? "", GIData.ZCARNO, GIData.ZDRIVER,
        "C", GIData.ZMENGE3, GIData.VRKME ?? "", "S", "", headData.VBELN, "", selectData[0].S_OILNO, minDate, minDate, GIData.ZTANK ?? ""
        , "", minDate, "", 0, GIData.ZPHONE, this.appConfig.interfaceId, oilNowDate, oilNowTIme, this.appConfig.interfaceId, oilNowDate, oilNowTIme, DIMModelStatus.UnChanged,
        GIData.ZMENGE3, GIData.ZTEMP, GIData.ZRACK, GIData.ZPUMP, GIData.ZSTARTTIME, GIData.ZENDTIME, GIData.Z_N_WEI_NET, GIData.WADAT_IST);


      var zsds6901List: ZSDS6901Model[] = [zsds6901];
      var zsdt6901List: ZSDT6901Model[] = [zsdt6901];
      var oilRFCData = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", doNum, "O", new Date(), new Date(), "G", zsds6901List, zsdt6901List);

      var oilRFCModelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilRFCData];
      var resultOilModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", oilRFCModelList, QueryCacheType.None);

      this.loadingVisible = false;

      return resultOilModel[0];
    } catch (error) {
      alert(error, "알림");
      return null;

    }
  }


  //등록버튼
  addButton(e: any) {
    this.clearEntery();
    var model1 = new ZSDS6900Model("", "", "", "", "", "", "", "", "", "", "", "", "", new Date(), new Date(), "", "", "", "", "", "", 0, "", "", "", "", "", "");
    var model2 = new ZSDS6900Model("", "", "", "", "", "", "", "", "", "", "", "", "", new Date(), new Date(), "", "", "", "", "", "", 0, "", "", "", "", "", "")
    var initDat = Object.assign(model1, model2);
    this.reqPopupData = initDat;
    this.reqVisible = true;
  }
  async DataChanged(e: any) {
    if (e.dataField === "ZTANK") {
      //this.oilSubDataLoad();
    }
    if (e.dataField === "ZMENGE3") {
      var ggdenSelectResult = await this.dataService.SelectModelData<UTIGGDENFCustomModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UTIGGDENFCustomModelList", ["1", this.popItemData.ZTEMP.toString()],
        ``, "", QueryCacheType.None);
      if (ggdenSelectResult.length > 0) {
        this.popItemData.Z_N_WEI_NET = this.popItemData.ZMENGE3 * ggdenSelectResult[0].GGVCF
      } else {
        this.popItemData.Z_N_WEI_NET = this.popItemData.ZMENGE3
      }
    }
  }

  //저장버튼
  async reqSaveButton(e: any) {


    if (await confirm("저장하시겠습니까?", "알림")) {
      if (this.reqPopupData.KUNNR === "" || this.reqPopupData.S_OILNO === null) {
        alert("주문처는 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.MATNR === "" || this.reqPopupData.S_OILNO === null) {
        alert("제품명은 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.KUNWE === "" || this.reqPopupData.S_OILNO === null) {
        alert("도착지는 필수값입니다.", "알림");
        return;
      }

      else if (this.reqPopupData.ZCARNO === "" || this.reqPopupData.S_OILNO === null) {
        alert("차량번호 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.ZDRIVER === "" || this.reqPopupData.S_OILNO === null) {
        alert("기사명은 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.INCO1 === "" || this.reqPopupData.S_OILNO === null) {
        alert("운송방법은 필수값입니다.", "알림");
        return;
      }
      else if (this.reqPopupData.S_OILNO === "" || this.reqPopupData.S_OILNO === null) {
        alert("선적번호는 필수값입니다.", "알림");
        return;
      }
     
      var result = this.createOrder();

      this.dataLoad();
      alert("저장 완료되었습니다","알림");

      this.reqVisible = false;

    }
  }


  //저장rfc
  public async createOrder() {
    var data = this.reqPopupData;
    var zsdsModel = new ZSDS6900Model("", "", "", "", "", "", "", "", "", "", "", "", "", new Date(), new Date(), "", "", "", "", "", "", 0, "", "", "", "", "", "");
    var zsdtModel = new ZSDT6900Model("", data.VBELN, data.KUNNR, data.KUNWE, data.LGORT, data.MATNR, data.RQDAT, data.VRDAT, data.ZCARNO, data.ZDRIVER, data.INCO1, data.ZMENGE, data.MEINS, data.S_OILNO, data.ZTEXT, data.ZSTAT, "", "", new Date(), "000000", "", new Date(), "000000");

    var zsdsList: ZSDS6900Model[] = [zsdsModel];
    var zsdtList: ZSDT6900Model[] = [zsdtModel];

    var createModel = new ZSDIFPORTALSAPSHIPPINGReqModel("", "", data.VRDAT, data.KUNNR, data.LGORT, data.VRDAT, "R",data.VBELN, "",zsdsList, zsdtList);
    var createList: ZSDIFPORTALSAPSHIPPINGReqModel[] = [createModel];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGReqModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGReqModelList", createList, QueryCacheType.None);

    return insertModel[0].IT_DATA;

  }

  //삭제 RFC
  public async deleteData() {
    var selectData: ZSDS6900Model[] = this.orderGrid.instance.getSelectedRowsData();
    var zsdsList: ZSDS6900Model[] = [];
    var zsdtList: ZSDT6900Model[] = [];
    var model = new ZSDIFPORTALSAPSHIPPINGReqModel("", "", this.endDate, "", "", this.startDate, "C", selectData[0].VBELN, "",zsdsList, zsdtList);
    var modelList: ZSDIFPORTALSAPSHIPPINGReqModel[] = [model];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGReqModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGReqModelList", modelList, QueryCacheType.None);
    return resultModel[0];
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
    if (this.loadePeCount >= 7) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      /*      this.enteryLoading = false;*/
      this.dataLoad();

    }
  }
  async printRef(e: any) {

    var selectData: ZSDS6900Model[] = this.orderGrid.instance.getSelectedRowsData();

    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")
    var zsds6901List: ZSDS6901Model[] = [];
    var zsdt6901List: ZSDT6901Model[] = [];
    var DataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", selectData[0].DONUM, "O", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List);
    var modelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [DataResult];
    var resultInsModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", modelList, QueryCacheType.None);
    this.resultInsModel = resultInsModel[0].ET_DATA;
    var InsModelData = resultInsModel[0].ET_DATA;


    if (this.orderGrid.instance.getSelectedRowsData().length > 1) {
      alert("단일 행 선택 후 전표 출력이 가능합니다.", "알림");
      return;
    }
    else {

      let selectData = this.orderGrid.instance.getSelectedRowsData()[0];
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "Ivbeln": InsModelData[0].VBELN,
        "Tddat": selectData.TDDAT
      };

      setTimeout(() => { this.reportViewer.printReport("MeterTicketOil", params) });
    }
  }
  //엔트리 클리어
  public clearEntery() {
    this.kunnrEntery.ClearSelectedValue();
    this.matnrEntery.ClearSelectedValue();
    this.kunweEntery.ClearSelectedValue();
    this.zcarnoEntery.ClearSelectedValue();
    this.inco1CodeDynamic.ClearSelectedValue();
    this.t001Entery.ClearSelectedValue();
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
  ////화물차종
  //onzcartypeCodeValueChanged(e: any) {
  //  setTimeout(() => {
  //    this.popItemData.ZCARTYPE = e.selectedValue;
  //    /*this.truckTypeValue = e.selectedValue;*/
  //  });
  //}


  //차량번호 선택이벤트
  onzZcarnoCodeValueChanged(e: any) {
    /*    setTimeout(() => {*/
    /*this.zcarnoValue = e.selectedValue;*/
    this.popItemData.ZCARNO = e.selectedValue;
    //this.popItemData.ZDRIVER = e.selectedItem.ZDERIVER1;
    //this.popItemData.ZPHONE = e.selectedItem.ZPHONE1;
    //this.popItemData.ZCARTYPE = e.selectedItem.ZCARTYPE1;
    /*    });*/
  }


  async ZcarNoCodeValueChanged(e: any) {
    setTimeout(() => {
      this.carnoValue = e.selectedValue;
      console.log(this.carnoValue)
      this.oilFormData.ZCARNO = e.selectedValue;
      if (e.selectedItem !== null) {
        this.oilFormData.ZDRIVER = e.selectedItem.ZDERIVER1;
        this.oilFormData.ZPHONE = e.selectedItem.ZPHONE1;
        this.oilFormData.ZRFID = e.selectedItem.ZRFID;
      }
    });
  }

}



