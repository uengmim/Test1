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
import { Service, CarSeq, CSpart } from '../SHPC/app.service';
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
import { CalculChem, CarList, HeaderData, OilDepot } from '../SHPC/app.service';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { CarbynmfModel } from '../../../shared/dataModel/ORACLE/CARBYNMFProxy';
import { UtijisifModel } from '../../../shared/dataModel/ORACLE/UTIJISIFProxy';
import { ZSDIFPORTALSAPSHIPPINGInsModel, ZSDS6901Model, ZSDT6901Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingIns';
import { UtichulfModel } from '../../../shared/dataModel/ORACLE/UTICHULFProxy';
import { CHMWkodModel } from '../../../shared/dataModel/ORACLE/CHM_WKODProxy';
import { UTIGGDENFCustomModel } from '../../../shared/dataModel/MCSHP/UTIGGDENFCustomProxy';
import { ZMMOILGirecvModel, ZMMS3210Model, ZMMS9900Model } from '../../../shared/dataModel/MCDIP/ZmmOilGirecv';
import { ZMMOILBLGrinfoModel, ZMMS3200Model } from '../../../shared/dataModel/MCDIP/ZmmOilBlGrinfo';
import { ZMMT3063Model } from '../../../shared/dataModel/MLOGP/Zmmt3063';
import { ZSDT7020Model } from '../../../shared/dataModel/MFSAP/Zsdt7020Proxy';
import { TestInData } from '../../../shared/dataModel/MLOGP/TestInData';
import { TestDataList } from '../SHPB/app.service';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shpc.component.html',
  providers: [ImateDataService, Service]
})



export class SHPCComponent {
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
  carnoValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  cSpart: CSpart[];
  carFormData: any = {};  //차량 배차 메인 폼데이터

  selectStatus: string = "10";
  selectCSpart: string = "20";

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
  chepopHeaderData: HeaderData = new HeaderData();
  //출고팝업 아이템정보
  popItemData!: ZSDS6450Model;
  chepopItemData!: ZSDS6450Model;
  //출고팝업 유창정보
  popOilDepot: any

  popOilDepotData: OilDepot[] = [];

  //유창정보 온오프
  isPopVisible: boolean = true;

  popTabIndex: number = 0;

  //출고지시(SAP) 데이터
  resultInsModel: ZSDS6901Model[] = [];

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
  rowCount: any;
  oilSubData: any;
  oilSubGridData: ZMMS3200Model[] = [];
  oilSubFormData: any = {};   //유류 메인 폼데이터
  oilFormData: any = {};   //유류 메인 폼데이터
  enteryLoading: boolean = false;

  calculChemList: CalculChem[];

  resultS: TestDataList[] = [];

  zcarList: CarList[] = [];
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출하진행현황-액상";
    this.popItemData = new ZSDS6450Model("", "", "", "", "", "", "", "", "", 0, "", "", 0, new Date(), 0, "", "", "", "", "", "", "", 0, 0, 0, 0, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", new Date(), "", "");

    let thisObj = this;
    this.loadingVisible = true;

    //화학 정산량
    this.calculChemList = service.getCalculChem();
    //화학, 유류 구분
    this.cSpart = service.getCSpart();

    //파서블엔트리 초기화
    this.unloadInfoCode = appConfig.tableCode("RFC_하차정보");
    this.truckTypeCode = appConfig.tableCode("RFC_화물차종");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.tdlnr1Code = appConfig.tableCode("운송업체");

    this.popTabIndex = 0;

    if (this.selectCSpart === "20") {
      this.zcarnoCode = appConfig.tableCode("화학차량");
      this.matnrCode = appConfig.tableCode("화학제품명");
      this.isPopVisible = true;
    } else {
      this.zcarnoCode = appConfig.tableCode("유류차량");
      this.matnrCode = appConfig.tableCode("유류제품명");
      this.isPopVisible = false;
    }

    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.truckTypeCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnr1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.unloadInfoCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;

    //선택값 초기화
    this.unloadInfoValue = "10";
    this.matnrValue = "";
    this.truckTypeValue = "";
    this.tdlnrValue = "";
    this.tdlnr1Value = "";
    this.zcarnoValue = "";
    this.carnoValue = "";
    this.oilSubGridData = [];
    //date
    var now = new Date();
    /*this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");*/
    this.startDate = formatDate(new Date(), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US");
    const that = this;

    this.dataLoad();

    this.getcarnoNm();

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

    //출고처리버튼
    this.GiButtonOptions = {
      text: "출고처리",
      onClick: async () => {

        if (this.carFormData.BYSTATUS !== "C" && this.carFormData.BYSTATUS !== "E") {
          await alert("완료되지 않았습니다.", "알림");

        } else {
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
          if (GIData.ZTEMP === null || GIData.ZTEMP === undefined || GIData.ZTEMP === "") {
            alert("온도는 필수입니다.", "알림");
            return;
          }
          if (GIData.ZSHIPMENT_NO === null || GIData.ZSHIPMENT_NO === undefined || GIData.ZSHIPMENT_NO === "") {
            alert("배차번호는 필수입니다.", "알림");
            return;
          }
          if (GIData.ZSHIPMENT_DATE === null || GIData.ZSHIPMENT_DATE === undefined) {
            alert("배차일자는 필수입니다.", "알림");
            return;
          }
          if (GIData.ZCARTYPE === null || GIData.ZCARTYPE === undefined || GIData.ZCARTYPE === "") {
            alert("화물차종은 필수입니다.", "알림");
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
            var result = await thisObj.saveData(thisObj);
            this.loadingVisible = false;

            if (result.E_MTY === "E")
              alert(result.E_MSG, "알림");
            else {
              var resultMessage = "";
              for (var row of result.T_DATA) {
                if (row.ZSAPSTATUS === "E") {
                  resultMessage = resultMessage.concat(row.ZSAPMESSAGE, "</br>");
                }
              }

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
        }
      },
    };
    //출고처리버튼
    this.cheGiButtonOptions = {
      text: "출고처리",
      onClick: async () => {

        var GIData = this.chepopItemData;

        if (GIData.ZMENGE3 === null || GIData.ZMENGE3 === 0 || GIData.ZMENGE3 === undefined) {
          alert("출고수량 은 필수입니다.", "알림");
          return;
        }

        if (GIData.WADAT_IST === null || GIData.WADAT_IST === undefined) {
          alert("출고전기일자는 필수입니다.", "알림");
          return;
        }

        if (GIData.Z_N_WEI_EMP === null || GIData.Z_N_WEI_EMP === 0 || GIData.Z_N_WEI_EMP === undefined) {
          alert("공차중량은 필수입니다.", "알림");
          return;
        }
        if (GIData.Z_N_WEI_TOT === null || GIData.Z_N_WEI_TOT === 0 || GIData.Z_N_WEI_TOT === undefined) {
          alert("만차중량은 필수입니다.", "알림");
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
        if (GIData.ZSHIPMENT_NO === null || GIData.ZSHIPMENT_NO === undefined || GIData.ZSHIPMENT_NO === "") {
          alert("배차번호는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZSHIPMENT_DATE === null || GIData.ZSHIPMENT_DATE === undefined) {
          alert("배차일자는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZCARTYPE === null || GIData.ZCARTYPE === undefined || GIData.ZCARTYPE === "") {
          alert("화물차종은 필수입니다.", "알림");
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
          var result = await thisObj.chesaveData(thisObj);
          this.loadingVisible = false;
        }
        if (result.E_MTY === "E")
          alert(result.E_MSG, "알림");
        else {
          var resultMessage = "";
          for (var row of result.T_DATA) {
            if (row.ZSAPSTATUS === "E") {
              resultMessage = resultMessage.concat(row.ZSAPMESSAGE, "</br>");
            }
          }

          if (resultMessage === "") {
            await alert("출고 처리되었습니다.", "알림");
            that.chePopupVisible = false;
            await this.printRef(null);
            await this.dataLoad();
          } else {
            await alert(resultMessage, "오류");
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
    //유류팝업닫기버튼
    this.chePopupCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.chePopupVisible = false;
      }
    }
    //출고취소버튼
    this.CGiButtonOptions = {
      text: "출고취소",
      onClick: async () => {

      },
    };

    //취소버튼
    this.cancelEditButtonOptions =
    {
      text: '닫기',
      onClick: async () => {
        this.dataGrid.instance.cancelEditData()
      },
    };

    this.loadingVisible = false;
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  //화학, 유류 구분
  onCSpartValueChanged(e: any) {
    setTimeout(async () => {
      this.selectCSpart = e.value;

      if (this.selectCSpart === "20") {
        this.zcarnoCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("화학차량"), "ZCARNO", "%ZCARNO%", "차량정보");
        this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("화학제품명"), "MATNR", "%MAKTX%(%MATNR%)", "자재명");
        this.popTabIndex = 0;
        this.isPopVisible = true;

      } else {
        this.zcarnoCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("유류차량"), "ZCARNO", "%ZCARNO%", "차량정보");
        this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("유류제품명"), "MATNR", "%MAKTX%(%MATNR%)", "자재명");
        this.popTabIndex = 0;
        this.isPopVisible = false;

      }
      this.loadingVisible = true;
      await this.dataLoad();
      this.loadingVisible = false;

    });
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
    let fixData = { I_ZSHIPSTATUS: "40" };
    var zsds6430: ZSDS6430Model[] = [];
    var lgort = "";
    if (this.selectCSpart === "30")
      lgort = "6000";

    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", lgort, "", this.selectCSpart, new Date("0001-01-01"), new Date("0001-01-01"), "", "", "4000", "X", "", "", "", "", fixData.I_ZSHIPSTATUS, zsds6430, this.startDate, this.endDate);

    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);

    this.orderGridData = resultModel[0].IT_DATA;
    //this.orderGridData = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C");
    this.loadingVisible = true;

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR", "ZSEQUENCY"],
        data: this.orderGridData
      });
    this.loadingVisible = false;
  }

  public async yuchangDataLoad() {
    var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();
    var jisiilja = selectData[0].ZLIQORDER.substring(0, 8);
    var jisiseq = selectData[0].ZLIQORDER.substring(9, 11);
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

    var oilRFCDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", selectData[0].ZLIQORDER, "O", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List);

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
    this.popItemData.ZMENGE3 = this.carFormData.BYCHQTY01 + this.carFormData.BYCHQTY02 + this.carFormData.BYCHQTY03 + this.carFormData.BYCHQTY04 + this.carFormData.BYCHQTY05
      + this.carFormData.BYCHQTY06 + this.carFormData.BYCHQTY07 + this.carFormData.BYCHQTY08 + this.carFormData.BYCHQTY09 + this.carFormData.BYCHQTY10

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
  //데이터 저장로직
  public async saveData(thisObj: SHPCComponent) {
    try {
      var selectData: ZSDS6430Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
      var GIData = thisObj.popItemData;
      var carData = thisObj.carFormData;
      var headData = thisObj.popHeaderData;
      let oilCVTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
      let oilNowDate = new Date();
      let minDate = new Date("0001-01-01");
      let minTime = formatDate(new Date("0001-01-01"), "HH:mm:ss", "en-US");

      let oilDate = new Date();
      let oilTime = formatDate(new Date(), "HH:mm:ss", "en-US");
      var model: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [];

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

      if (GIData.ZSHIPMENT_NO === null || GIData.ZSHIPMENT_NO === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("배차번호는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZSHIPMENT_DATE === null || GIData.ZSHIPMENT_DATE === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("배차일자는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZCARTYPE === null || GIData.ZCARTYPE === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("화물차종은 필수입니다.", "E"));
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

      if (selectData[0].VSBED === "Z4") {
        await alert("온도기준 출고수량은 정산량으로 설정됩니다.", "알림");
        GIData.ZMENGE3 = GIData.Z_N_WEI_NET;
      }

      GIData.ZREQTYPE = "I";
      GIData.Z_N_WEI_EMP = 1;
      GIData.Z_N_WEI_TOT = 1;
      GIData.Z_N_WEI_TOT_OIL = 1;
      GIData.ZSTARTTIME = GIData.ZSTARTTIME.substr(0, 2) + ":" + GIData.ZSTARTTIME.substr(2, 2) + ":" + GIData.ZSTARTTIME.substr(4, 2)
      GIData.ZENDTIME = GIData.ZENDTIME.substr(0, 2) + ":" + GIData.ZENDTIME.substr(2, 2) + ":" + GIData.ZENDTIME.substr(4, 2)

      var zsdt6460: ZSDT6460Model;
      var zsdt6460List: ZSDT6460Model[] = [];

      if (this.selectCSpart === "30") {
        zsdt6460 = new ZSDT6460Model(thisObj.appConfig.mandt, GIData.VBELN, GIData.POSNR, GIData.ZSHIPMENT_NO, GIData.ZCARNO, GIData.KUNAG, GIData.VRKME,
          "01", carData.ZTANKLITER1 ?? "0", carData.load1 ?? "0", carData.outData1 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime1 ?? "54000000", 'HH:mm:ss', "en-US")), formatDate(carData.endTime1 ?? "54000000", 'HH:mm:ss', "en-US"),
          "02", carData.ZTANKLITER2 ?? "0", carData.load2 ?? "0", carData.outData2 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime2 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime2 ?? "54000000", 'HH:mm:ss', "en-US")),
          "03", carData.ZTANKLITER3 ?? "0", carData.load3 ?? "0", carData.outData3 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime3 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime3 ?? "54000000", 'HH:mm:ss', "en-US")),
          "04", carData.ZTANKLITER4 ?? "0", carData.load4 ?? "0", carData.outData4 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime4 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime4 ?? "54000000", 'HH:mm:ss', "en-US")),
          "05", carData.ZTANKLITER5 ?? "0", carData.load5 ?? "0", carData.outData5 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime5 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime5 ?? "54000000", 'HH:mm:ss', "en-US")),
          "06", carData.ZTANKLITER6 ?? "0", carData.load6 ?? "0", carData.outData6 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime6 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime6 ?? "54000000", 'HH:mm:ss', "en-US")),
          "07", carData.ZTANKLITER7 ?? "0", carData.load7 ?? "0", carData.outData7 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime7 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime7 ?? "54000000", 'HH:mm:ss', "en-US")),
          "08", carData.ZTANKLITER8 ?? "0", carData.load8 ?? "0", carData.outData8 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime8 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime8 ?? "54000000", 'HH:mm:ss', "en-US")),
          "09", carData.ZTANKLITER9 ?? "0", carData.load9 ?? "0", carData.outData9 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime9 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime9 ?? "54000000", 'HH:mm:ss', "en-US")),
          "10", carData.ZTANKLITER10 ?? "0", carData.load10 ?? "0", carData.outData10 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime10 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime10 ?? "54000000", 'HH:mm:ss', "en-US")),
          "", this.appConfig.interfaceId, oilDate, oilTime, this.appConfig.interfaceId, oilDate, oilTime, DIMModelStatus.Add);

        zsdt6460List = [zsdt6460];
      } else {
        zsdt6460List = [];

      }

      var gidataList = [GIData]

      var liqModel = new ZSDIFPORTALSAPGIYCLIQRcvModel("", "", gidataList, zsdt6460List);
      var modelList: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [liqModel];

      //ZMMOILGirecvModel

      this.loadingVisible = true;
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPGIYCLIQRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPGIYCLIQRcvModelList", modelList, QueryCacheType.None);
      if (resultModel[0].E_MTY !== "E") {
        if (resultModel[0].T_DATA.find(item => item.ZSAPMESSAGE !== "") !== undefined) {
          var zsds6901List: ZSDS6901Model[] = [];
          var zsdt6901List: ZSDT6901Model[] = [];

          var oilDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "", this.endDate, this.startDate, "G", zsds6901List, zsdt6901List, selectData[0].VBELN, "", "");
          var insModelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilDataResult];
          var rModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", insModelList, QueryCacheType.None);
        }

      //  var oilGireCVDeleteResult = await this.dataService.SelectModelData<ZMMT3063Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3063ModelList", [],
      //    `MANDT = '${this.appConfig.mandt}' AND ZVBELN = '${this.popHeaderData.VBELN}' AND ZPOSNR = '${this.popHeaderData.POSNR}'AND MATNR = '${this.popItemData.MATNR}' AND ZTANK = '${this.popItemData.ZTANK}' `, "", QueryCacheType.None);
      //  console.log(oilGireCVDeleteResult)

      //  var zmms9900 = new ZMMS9900Model("", "");
      //  var zmms3210Model: ZMMS3210Model[] = [];

      //  if (oilGireCVDeleteResult.length > 0) {
      //    //탱크재고처리 RFC
      //    zmms3210Model.push(new ZMMS3210Model("O", oilGireCVDeleteResult[0].GI_GUBUN, oilGireCVDeleteResult[0].ZVBELN, oilGireCVDeleteResult[0].ZPOSNR, oilGireCVDeleteResult[0].MATNR, oilGireCVDeleteResult[0].ZTANK,
      //      oilGireCVDeleteResult[0].ZIIPNO, oilGireCVDeleteResult[0].BUDAT, oilGireCVDeleteResult[0].GRTYP,
      //      "", "O", 0, 0, this.popItemData.ZMENGE3, this.popItemData.Z_N_WEI_NET, minDate, minTime, oilNowDate, oilCVTIme, "", minDate, minTime, DIMModelStatus.Add));
      //    var oilSub = new ZMMOILGirecvModel(zmms9900, "O", this.appConfig.plant, zmms3210Model);
      //    var oilSubModelList: ZMMOILGirecvModel[] = [oilSub];
      //    console.log(zmms3210Model)

      //    var tankResult = await this.dataService.RefcCallUsingModel<ZMMOILGirecvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMOILGirecvModelList", oilSubModelList, QueryCacheType.None);
      //  }
        
      }
        
      this.loadingVisible = false;

      return resultModel[0];
    } catch (error) {
      alert("error", "알림");
      return null;

    }
  }

  //데이터 저장로직
  public async chesaveData(thisObj: SHPCComponent) {
    try {
      var selectData: ZSDS6430Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
      var GIData = thisObj.chepopItemData;
      var carData = thisObj.carFormData;
      var headData = thisObj.chepopHeaderData;
      let minTime = formatDate(new Date("0001-01-01"), "HH:mm:ss", "en-US");

      let oilDate = new Date();
      let oilTime = formatDate(new Date(), "HH:mm:ss", "en-US");
      var model: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [];

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

      if (GIData.ZSHIPMENT_NO === null || GIData.ZSHIPMENT_NO === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("배차번호는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZSHIPMENT_DATE === null || GIData.ZSHIPMENT_DATE === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("배차일자는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZCARTYPE === null || GIData.ZCARTYPE === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("화물차종은 필수입니다.", "E"));
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
      
      GIData.ZREQTYPE = "I";
      GIData.ZTEMP = "1";



      GIData.ZSTARTTIME = GIData.ZSTARTTIME.substr(0, 2) + ":" + GIData.ZSTARTTIME.substr(2, 2) + ":" + GIData.ZSTARTTIME.substr(4, 2)
      GIData.ZENDTIME = GIData.ZENDTIME.substr(0, 2) + ":" + GIData.ZENDTIME.substr(2, 2) + ":" + GIData.ZENDTIME.substr(4, 2)
      console.log(GIData)
      var zsdt6460: ZSDT6460Model;
      var zsdt6460List: ZSDT6460Model[] = [];

      if (this.selectCSpart === "30") {
        zsdt6460 = new ZSDT6460Model(thisObj.appConfig.mandt, GIData.VBELN, GIData.POSNR, GIData.ZSHIPMENT_NO, GIData.ZCARNO, GIData.KUNAG, GIData.VRKME,
          "01", carData.ZTANKLITER1 ?? "0", carData.load1 ?? "0", carData.outData1 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime1 ?? "54000000", 'HH:mm:ss', "en-US")), formatDate(carData.endTime1 ?? "54000000", 'HH:mm:ss', "en-US"),
          "02", carData.ZTANKLITER2 ?? "0", carData.load2 ?? "0", carData.outData2 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime2 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime2 ?? "54000000", 'HH:mm:ss', "en-US")),
          "03", carData.ZTANKLITER3 ?? "0", carData.load3 ?? "0", carData.outData3 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime3 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime3 ?? "54000000", 'HH:mm:ss', "en-US")),
          "04", carData.ZTANKLITER4 ?? "0", carData.load4 ?? "0", carData.outData4 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime4 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime4 ?? "54000000", 'HH:mm:ss', "en-US")),
          "05", carData.ZTANKLITER5 ?? "0", carData.load5 ?? "0", carData.outData5 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime5 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime5 ?? "54000000", 'HH:mm:ss', "en-US")),
          "06", carData.ZTANKLITER6 ?? "0", carData.load6 ?? "0", carData.outData6 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime6 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime6 ?? "54000000", 'HH:mm:ss', "en-US")),
          "07", carData.ZTANKLITER7 ?? "0", carData.load7 ?? "0", carData.outData7 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime7 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime7 ?? "54000000", 'HH:mm:ss', "en-US")),
          "08", carData.ZTANKLITER8 ?? "0", carData.load8 ?? "0", carData.outData8 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime8 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime8 ?? "54000000", 'HH:mm:ss', "en-US")),
          "09", carData.ZTANKLITER9 ?? "0", carData.load9 ?? "0", carData.outData9 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime9 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime9 ?? "54000000", 'HH:mm:ss', "en-US")),
          "10", carData.ZTANKLITER10 ?? "0", carData.load10 ?? "0", carData.outData10 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime10 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime10 ?? "54000000", 'HH:mm:ss', "en-US")),
          "", this.appConfig.interfaceId, oilDate, oilTime, this.appConfig.interfaceId, oilDate, oilTime, DIMModelStatus.Add);

        zsdt6460List = [zsdt6460];
      } else {
        zsdt6460List = [];

      }

      var gidataList = [GIData]


      var liqModel = new ZSDIFPORTALSAPGIYCLIQRcvModel("", "", gidataList, zsdt6460List);
      var modelList: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [liqModel];
      this.loadingVisible = true;
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPGIYCLIQRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPGIYCLIQRcvModelList", modelList, QueryCacheType.None);
      if (resultModel[0].E_MTY !== "E") {
        if (resultModel[0].T_DATA.find(item => item.ZSAPMESSAGE !== "") === undefined) {
          var zsds6901List: ZSDS6901Model[] = [];
          var zsdt6901List: ZSDT6901Model[] = [];

          var oilDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "", this.endDate, this.startDate, "G", zsds6901List, zsdt6901List, selectData[0].VBELN, "", "");
          var insModelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilDataResult];
          var rModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", insModelList, QueryCacheType.None);
        }
      }
      this.loadingVisible = false;

      return resultModel[0];
    } catch (error) {
      alert("error", "알림");
      return null;

    }
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
    if (this.loadePeCount >= 10) {
      this.loadingVisible = false;
    }
  }

  //메인데이터 더블클릭 이벤트
  async mainDBClick(e: any) {
    this.loadingVisible = true;

    this.oilSubDataLoad();

    var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();

    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")
    var zsds6901List: ZSDS6901Model[] = [];
    var zsdt6901List: ZSDT6901Model[] = [];

    var DataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List, selectData[0].VBELN, "", "");
    var modelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [DataResult];
    var resultInsModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", modelList, QueryCacheType.None);
    this.resultInsModel = resultInsModel[0].ET_DATA;

    let testInData = new TestInData(selectData[0].MATNR, selectData[0].ARKTX);
    let testDataStr = JSON.stringify(testInData);
    let queryParam = new QueryParameter("testIn", QueryDataType.String, testDataStr, "", "", "", "");

    let TestResultQuery = new QueryMessage(QueryRunMethod.Alone, "testResult", "#func", "NBPDataModels@NAMHE.CustomFunction.QmsTestResultInterface", [], [queryParam]);
    var resultSet = await this.dataService.dbSelectToDataSet([TestResultQuery]);
    this.resultS = resultSet.getDataObject("tData", TestDataList);

    var jisiilja = selectData[0].ZLIQORDER.substring(0, 8);
    var jisiseq = selectData[0].ZLIQORDER.substring(8, 11);
    var jisiDataResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
      ` JIYYMM = '${parseInt(jisiilja)}' AND JISEQ = '${parseInt(jisiseq)}'`, "", QueryCacheType.None);
    console.log(jisiDataResult[0])
    var byilja = jisiDataResult[0].JIBCNO1
    var byseq = jisiDataResult[0].JIBCNO2
    var oilDataResult = await this.dataService.SelectModelData<CarbynmfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CarbynmfModelList", [],
      ` BYILJA = '${byilja}' AND BYSEQ = '${byseq}'`, "", QueryCacheType.None);

    var chulDataResult = await this.dataService.SelectModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", [],
      ` CHJIYYMM = '${parseInt(jisiilja)}' AND CHJISEQ = '${parseInt(jisiseq)}'`, "", QueryCacheType.None);
    
    var chmwDataResult = await this.dataService.SelectModelData<CHMWkodModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CHMWkodModelList", [],
      ` JIYYMM = '${parseInt(jisiilja)}' AND JISEQ = '${parseInt(jisiseq)}'`, "", QueryCacheType.None);

    if (oilDataResult.length > 0) {
      if (oilDataResult[0].BYSTATUS !== "E" && oilDataResult[0].BYSTATUS !== "C") {
        await alert("출하지시가 완료되지 않았습니다.", "알림");
        this.popupVisible = false;
        return;
      }
    }
    if (chmwDataResult.length > 0) {
      if (chmwDataResult[0].JISTATUS !== "E" && chmwDataResult[0].JISTATUS !== "C") {
        await alert("출하지시가 완료되지 않았습니다.", "알림");
        this.popupVisible = false;
        return;
      }
    }
    //파서블엔트리 초기화
    this.clearEntery();
    this.loadingVisible = false;

    setTimeout((
    ) => {
      var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();
      var ZMENGE = 0;
      //출고수량이 없으면 배차수량으로 대신함
      //if (selectData[0].ZMENGE3 === 0)
      //  ZMENGE = selectData[0].ZMENGE4;
      //else
      //  ZMENGE = selectData[0].ZMENGE3;

      //유창정보 초기화
      this.popOilDepotData = [];

      this.popOilDepot = new ArrayStore(
        {
          key: ["C_PART"],
          data: this.popOilDepotData
        });

      if (this.selectCSpart === "20") {
        this.loadingVisible = true;

        if (chmwDataResult.length > 0) {
          //팝업 헤더정보 입력
          this.chepopHeaderData.VBELN = selectData[0].VBELN;
          this.chepopHeaderData.POSNR = selectData[0].POSNR;
          this.chepopHeaderData.ZMENGE2 = selectData[0].ZMENGE2;
          //팝업 아이템정보 입력
          this.chepopItemData = new ZSDS6450Model(selectData[0].VBELN, selectData[0].POSNR, "", selectData[0].ZSHIPSTATUS, selectData[0].KZPOD, selectData[0].VGBEL,
            selectData[0].VGPOS, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL, ZMENGE,
            new Date(), selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].KUNNR, selectData[0].KUNAG, selectData[0].SPART,
            selectData[0].WERKS, selectData[0].LFART, 0, 0, 0, 0, "", "", "", "", "000000", "000000", selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE,
            selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, "", selectData[0].ZPHONE, selectData[0].ZPHONE1, "", "10", selectData[0].ZSHIPMENT_NO,
            selectData[0].ZSHIPMENT_DATE, "", "", DIMModelStatus.UnChanged);

          //파서블엔트리 값설정
          this.matnrValue = selectData[0].MATNR;
          this.tdlnrValue = selectData[0].Z4PARVW;
          this.tdlnr1Value = selectData[0].Z3PARVW;
          this.truckTypeValue = selectData[0].ZCARTYPE;
          this.zcarnoValue = chmwDataResult[0].JICARNO;
          Object.assign(this.chepopItemData, { ZRACK: jisiDataResult[0].JIRACK ?? "", ZPUMP: jisiDataResult[0].JIPUMP ?? "", ZTANK: jisiDataResult[0].JITANKNO ?? "" });
          var carList = this.zcarList.find(item => item.ZCARNO === this.zcarnoValue)
          if (carList !== undefined) {
            this.chepopItemData.ZCARNO = carList.ZCARNO;
            this.truckTypeValue = carList.ZCARTYPE1;
            
            if (this.resultInsModel.length > 0) {
              if (this.resultInsModel[0].ZDRIVER === "" || this.resultInsModel[0].ZDRIVER === null || this.resultInsModel[0].ZDRIVER === undefined)
                this.chepopItemData.ZDRIVER = carList.ZDERIVER1;
              else
                this.chepopItemData.ZDRIVER = this.resultInsModel[0].ZDRIVER;

              if (this.resultInsModel[0].ZPHONE === "" || this.resultInsModel[0].ZPHONE === null || this.resultInsModel[0].ZPHONE === undefined)
                this.chepopItemData.ZPHONE = carList.ZPHONE1;
              else
                this.chepopItemData.ZPHONE = this.resultInsModel[0].ZPHONE;

            } else {
              this.chepopItemData.ZDRIVER = carList.ZDERIVER1;
              this.chepopItemData.ZPHONE = carList.ZPHONE1;
            }
            
          }

          Object.assign(this.chepopItemData, {
            Z_N_WEI_EMP: Number((chmwDataResult[0].JIEMPTY / 1000 ?? 0).toFixed(3)),
            Z_N_WEI_TOT: Number((chmwDataResult[0].JITOTAL / 1000 ?? 0).toFixed(3)),
            Z_N_WEI_TOT_OIL: Number((chmwDataResult[0].JICHQTY / 1000 ?? 0).toFixed(3)),
            Z_N_WEI_NET: Number((chmwDataResult[0].JICHQTY / 1000 ?? 0).toFixed(3))
          });

          if (chmwDataResult[0].JISTIME !== null) {
            Object.assign(this.chepopItemData, { ZSTARTTIME: chmwDataResult[0].JISTIME.padEnd(6, '0') });

          }
          if (chmwDataResult[0].JISTIME !== null) {
            Object.assign(this.chepopItemData, { ZENDTIME: chmwDataResult[0].JIETIME.padEnd(6, '0') });

          }

        } 
        this.loadingVisible = false;
        this.chePopupVisible = true;

      } else {
        this.loadingVisible = true;
        this.yuchangDataLoad();
        var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();
        this.oilFormData = selectData[0];

        if (jisiDataResult.length > 0) {
          //팝업 헤더정보 입력
          this.popHeaderData.VBELN = selectData[0].VBELN;
          this.popHeaderData.POSNR = selectData[0].POSNR;
          this.popHeaderData.ZMENGE2 = selectData[0].ZMENGE2;
          //팝업 아이템정보 입력
          this.popItemData = new ZSDS6450Model(selectData[0].VBELN, selectData[0].POSNR, "", selectData[0].ZSHIPSTATUS, selectData[0].KZPOD, selectData[0].VGBEL,
            selectData[0].VGPOS, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL, ZMENGE,
            new Date(), selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].KUNNR, selectData[0].KUNAG, selectData[0].SPART,
            selectData[0].WERKS, selectData[0].LFART, 0, 0, 0, 0, "", "", "", "", "000000", "000000", selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE,
            selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, "", selectData[0].ZPHONE, selectData[0].ZPHONE1, "", "10", selectData[0].ZSHIPMENT_NO,
            selectData[0].ZSHIPMENT_DATE, "", "", DIMModelStatus.UnChanged);

          //파서블엔트리 값설정
          this.matnrValue = selectData[0].MATNR;

          Object.assign(this.popItemData, { ZRACK: jisiDataResult[0].JIRACK ?? "", ZPUMP: jisiDataResult[0].JIPUMP ?? "", ZTANK: jisiDataResult[0].JITANKNO ?? "" });
        }

        Object.assign(this.oilFormData, { CHJANG: "1", OrderDate: new Date(), jisija: "30189", gubun: "1" });
        if (oilDataResult.length > 0) {
          this.zcarnoValue = oilDataResult[0].BYCARNO;
          var carList = this.zcarList.find(item => item.ZCARNO === this.zcarnoValue)
          if (carList !== undefined) {
            this.truckTypeValue = carList.ZCARTYPE1;

            if (this.resultInsModel.length > 0) {
              if (this.resultInsModel[0].ZDRIVER === "" || this.resultInsModel[0].ZDRIVER === null || this.resultInsModel[0].ZDRIVER === undefined)
                this.popItemData.ZDRIVER = carList.ZDERIVER1;
              else
                this.popItemData.ZDRIVER = this.resultInsModel[0].ZDRIVER;

              if (this.resultInsModel[0].ZPHONE === "" || this.resultInsModel[0].ZPHONE === null || this.resultInsModel[0].ZPHONE === undefined)
                this.popItemData.ZPHONE = carList.ZPHONE1;
              else
                this.popItemData.ZPHONE = this.resultInsModel[0].ZPHONE;
            } else {
              this.popItemData.ZDRIVER = carList.ZDERIVER1;
              this.popItemData.ZPHONE = carList.ZPHONE1;
            }
          }
          
        }
        this.matnrValue = selectData[0].MATNR;
        this.tdlnrValue = selectData[0].Z4PARVW;
        this.tdlnr1Value = selectData[0].Z3PARVW;
        this.truckTypeValue = selectData[0].ZCARTYPE;
        if (chulDataResult.length > 0) {
          Object.assign(this.popItemData, { Z_N_WEI_EMP: chulDataResult[0].CHEMPTY ?? "", Z_N_WEI_TOT: chulDataResult[0].CHTOTAL ?? "", Z_N_WEI_TOT_OIL: chulDataResult[0].CHMTQTY ?? "" });

          /*if (chulDataResult[0].CHSTTIME !== null) {*/
/*            Object.assign(this.popItemData, { ZSTARTTIME: oilDataResult[0].BYSTTIME01.padEnd(6, '0') });*/
            this.popItemData.ZSTARTTIME = oilDataResult[0].BYSTTIME01.padEnd(6, '0')

          //}
          //if (chulDataResult[0].CHENTIME !== null) {
          if(oilDataResult[0].BYENTIME10 !== null)
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
          //}
          //if (chulDataResult[0].CHTEMP !== null) {
            Object.assign(this.popItemData, { ZTEMP: oilDataResult[0].BYTEMP });

          //}
        }
        if (jisiDataResult.length > 0) {
          Object.assign(this.popItemData, { ZRACK: jisiDataResult[0].JIRACK ?? "", ZPUMP: jisiDataResult[0].JIPUMP ?? "", ZTANK: jisiDataResult[0].JITANKNO ?? "" });
        }

        this.popItemData.ZSHIPMENT_NO = selectData[0].ZSHIPMENT_NO;

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
      }
    }, 100);

  }

  async getOilDepot() {
    return this.popOilDepotData;
  }
  /* Entry Data Form에 바인딩 */
  //분할 차량번호 선택이벤트
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
      alert("단일 행 선택 후 전표 출력이 가능합니다.", "알림");
      return;
    }
    else {

      let selectData = this.orderGrid.instance.getSelectedRowsData()[0];
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "Ivbeln": selectData.VBELN,
        "Tddat": selectData.TDDAT
      };
      if (selectData.SPART === "20")
        setTimeout(() => { this.reportViewer.printReport("MeterTicket", params) });
      else
        setTimeout(() => { this.reportViewer.printReport("MeterTicketOil", params) });
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
    //this.popItemData.ZDRIVER = e.selectedItem.ZDERIVER1;
    //this.popItemData.ZPHONE = e.selectedItem.ZPHONE1;
    //this.popItemData.ZCARTYPE = e.selectedItem.ZCARTYPE1;
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
  async DataChanged(e: any) {
    if (e.dataField === "ZTANK") {
      //this.oilSubDataLoad();
    }
    if (e.dataField === "ZMENGE3") {
      var ggdenSelectResult = await this.dataService.SelectModelData<UTIGGDENFCustomModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UTIGGDENFCustomModelList", ["1", this.popItemData.ZTEMP],
        ``, "", QueryCacheType.None);
      if (ggdenSelectResult.length > 0) {
        this.popItemData.Z_N_WEI_NET = this.popItemData.ZMENGE3 * ggdenSelectResult[0].GGVCF
      } else {
        this.popItemData.Z_N_WEI_NET = this.popItemData.ZMENGE3
      }
    }
  }


  async cheform_fieldDataChanged(e: any) {
    this.chepopItemData.Z_N_WEI_TOT_OIL = this.chepopItemData.Z_N_WEI_TOT - this.chepopItemData.Z_N_WEI_EMP
    this.chepopItemData.ZMENGE3 = this.chepopItemData.Z_N_WEI_TOT_OIL

    var calcul = this.calculChemList.find(item => item.MATNR === this.chepopItemData.MATNR);
    if (calcul !== undefined) {
      if (calcul.TYPE === "VAL") {
        this.chepopItemData.Z_N_WEI_NET = calcul.VAL * this.chepopItemData.ZMENGE3;
      } else {
        
        var testitm = this.resultS.find(item => item.testitem.startsWith("H2SO4"));
        if (testitm !== undefined) {
          this.chepopItemData.Z_N_WEI_NET = (Number(testitm.val) / 100) * this.chepopItemData.ZMENGE3;
        } else {
          this.chepopItemData.Z_N_WEI_NET = this.chepopItemData.ZMENGE3;
        }
      }
    } else {
      this.chepopItemData.Z_N_WEI_NET = this.chepopItemData.ZMENGE3;
    }
  }

  async getcarnoNm() {

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.zcarnoCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(CarList);
    this.zcarList = resultModel;
    return resultModel;
  }
}

