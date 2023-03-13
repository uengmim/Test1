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
import { Service, Status, Data2 } from '../SHPQ/app.service';
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
import { ChangeDetectorRef } from '@angular/core';
//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shpx.component.html',
  providers: [ImateDataService, Service]
})



export class SHPXComponent {
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


  //운송사
  tdlnrCode!: TableCodeInfo;
  tdlnr1Code!: TableCodeInfo;
  //운송사
  imtdlnrCode!: TableCodeInfo;
  imtdlnr1Code!: TableCodeInfo;
  //2차운송사
  z4parvwCode!: CommonCodeInfo;

  //차량번호
  zcarnoCode!: TableCodeInfo;
  //차량번호
  imzcarnoCode!: TableCodeInfo;

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
  selectData2: string = "1000";
  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "shpx";

  dataSource: any;
  //거래처


  //정보
  orderData: any;
  orderGridData: ZSDS6410Model[] = [];

  //임가공 원데이터
  imOrderList: ZMMT1320Model[] = [];

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
  imaddFormData!: any; //팝업아래
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
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService,
    private imInfo: ImateInfo, private authService: AuthService, private cd: ChangeDetectorRef) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출하진행현황-포장재(테스트용)";

    this.loadingVisible = true;

    this.vsCode = appConfig.tableCode("출하지점");
    this.lgCode = appConfig.tableCode("비료창고");
    /*this.maraCode = appConfig.tableCode("제품구분");*/
    this.dd07tCode = appConfig.tableCode("RFC_하차정보");
    this.dd07tCarCode = appConfig.tableCode("RFC_화물차종");
    this.tvlvCode = appConfig.tableCode("용도구분");
    this.zpalCode = appConfig.tableCode("RFC_파레트유형");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.tdlnr1Code = appConfig.tableCode("운송업체");
    this.zcarnoCode = appConfig.tableCode("비료차량");
    this.zcarnoModiCode = appConfig.tableCode("비료차량");
    this.z4parvwCode = appConfig.commonCode("운송사");
    this.matnrCode = appConfig.tableCode("비료친환경제품명");

    //임가공용
    this.imdd07tCarCode = deepCopy(this.dd07tCarCode);
    this.imtdlnrCode = deepCopy(this.tdlnrCode);
    this.imtdlnr1Code = deepCopy(this.tdlnr1Code);
    this.imzcarnoCode = deepCopy(this.zcarnoCode);
    this.imzcarnoModiCode = deepCopy(this.zcarnoModiCode);
    this.immatnrCode = appConfig.tableCode("임가공제품명");

    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.vsCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maraCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tvlvCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnr1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoModiCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.z4parvwCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),

      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.imdd07tCarCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.imtdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.imtdlnr1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.imzcarnoCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.imzcarnoModiCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.immatnrCode),
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
    /*this.zcarnoValue = "";*/
    this.zcarnoModiValue = "";
    this.z4parvwValue = ""
    this.tdlnrValue = ""
    this.tdlnrValue1 = ""
    this.matnrValue = "";
    this.immatnrValue = "";
    this.imtdlnrValue = ""
    this.imtdlnrValue1 = ""
    this.imzcarnoModiValue = "";
    this.imzcarValue = "";

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 1), "yyyy-MM-dd", "en-US");
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
        if (this.selectStatus === "30") {
          this.modify = true;
          this.modify2 = false;
          this.certificate = false;
          this.releaseVisible = false;
          this.savebutton = true;
          this.cancelVisible = false;
        }
        else {
          this.modify = false;
          this.modify2 = true;
          this.certificate = true;
          this.releaseVisible = true;
          this.savebutton = false;
          this.cancelVisible = true;

        }

        if (this.selectData2 === "9999") {
          this.isColVisible = false;
          this.isDisableField = true;
          this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("임가공제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
        } else if (this.selectData2 === "1000") {
          this.isColVisible = true;
          this.isDisableField = false;
          this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("비료친환경제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
        } else {
          this.isColVisible = true;
          this.isDisableField = false;
          this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("화학제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
        }


      },
    };
    //삭제버튼
    this.deleteButtonOptions = {
      text: "삭제",
      onClick: () => {
        this.dataGrid.instance.deleteRow(this.selectedRowIndex);
        this.dataGrid.instance.deselectAll();
      },
    };
    //저장(출고확정대기)
    //this.saveButtonOptions = {
    //  text: "저장(출고확정대기)",
    //  onClick: async () => {

    //    var selectedData = this.orderGrid.instance.getSelectedRowsData();
    //    if (selectedData.length === 0) {
    //      alert("라인을 선택 후 저장하세요.", "알림");
    //      return;
    //    }

    //    if (await confirm("저장 하시겠습니까?", "알림")) {
    //      var result = await this.createOrder();
    //      if (result.E_MTY === "E") {
    //        alert(`저장 실패,\n\n오류 메세지: ${result.E_MSG}`, "알림");
    //        return;
    //      }
    //      else {
    //        alert("저장이 완료되었습니다.", "알림")

    //        this.dataLoad(this);
    //      }
    //    }
    //  }
    //}

    //상차지시 저장
    this.shipmentProcessing = {
      text: "저장",
      onClick: async () => {
        //포장재
        if (this.selectData2 !== "9999") {
          if (this.addFormData.ZMENGE3 === null || this.addFormData.ZMENGE3 === undefined || this.addFormData.ZMENGE3 === "") {
            alert(`출고수량은 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.WADAT_IST === null || this.addFormData.WADAT_IST === undefined || this.addFormData.WADAT_IST === "") {
            alert(`출고전기일자는 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.MATNR === null || this.addFormData.MATNR === undefined || this.addFormData.MATNR === "") {
            alert(`자재명은 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.Z3PARVW === null || this.addFormData.Z3PARVW === undefined || this.addFormData.Z3PARVW === "") {
            alert(`1차운송사는 필수값입니다.`, "알림");
            return;
          }
          //else if (this.addFormData.Z4PARVW === null || this.addFormData.Z4PARVW === undefined || this.addFormData.Z4PARVW === "") {
          //  alert(`2차운송사는 필수값입니다.`, "알림");
          //  return;
          //}
          else if (this.addFormData.ZSHIPMENT_NO === null || this.addFormData.ZSHIPMENT_NO === undefined || this.addFormData.ZSHIPMENT_NO === "") {
            alert(`배차번호는 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.ZSHIPMENT_DATE === null || this.addFormData.ZSHIPMENT_DATE === undefined || this.addFormData.ZSHIPMENT_DATE === "") {
            alert(`배차일자는 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.ZPALLTP === null || this.addFormData.ZPALLTP === undefined || this.addFormData.ZPALLTP === "") {
            alert(`파레트유형은 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.ZPALLETQTY === null || this.addFormData.ZPALLETQTY === undefined ||
            this.addFormData.ZPALLETQTY.toString().padStart(5, '0') === "00000" || this.addFormData.ZPALLETQTY === "") {
            alert(`파레트수량은 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.ZUNLOAD === null || this.addFormData.ZUNLOAD === undefined || this.addFormData.ZUNLOAD === "") {
            alert(`하차정보는 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.ZVKAUS === null || this.addFormData.ZVKAUS === undefined || this.addFormData.ZVKAUS === "") {
            alert(`용도는 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.ZCARTYPE === null || this.addFormData.ZCARTYPE === undefined || this.addFormData.ZCARTYPE === "") {
            alert(`화물차종은 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.ZCARNO === null || this.addFormData.ZCARNO === undefined || this.addFormData.ZCARNO === "") {
            alert(`차량번호는 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.ZDRIVER === null || this.addFormData.ZDRIVER === undefined || this.addFormData.ZDRIVER === "") {
            alert(`운전기사명은 필수값입니다.`, "알림");
            return;
          }
          else if (this.addFormData.ZPHONE === null || this.addFormData.ZPHONE === undefined || this.addFormData.ZPHONE === "") {
            alert(`전화번호는 필수값입니다.`, "알림");
            return;
          }
          //var selectData: ZSDS6410Model[] = this.orderGrid.instance.getSelectedRowsData();
          //selectData.forEach(async (row: ZSDS6410Model) => {
          //  row.ZMENGE3 = this.addFormData.ZMENGE3
          //  row.WADAT_IST = this.addFormData.WADAT_IST
          //  row.MATNR = this.addFormData.MATNR
          //  row.Z3PARVW = this.addFormData.Z3PARVW
          //  row.Z4PARVW = this.addFormData.Z4PARVW
          //  row.ZSHIPMENT_NO = this.addFormData.ZSHIPMENT_NO
          //  row.ZSHIPMENT_DATE = this.addFormData.ZSHIPMENT_DATE
          //  row.ZPALLTP = this.addFormData.ZPALLTP
          //  row.ZPALLETQTY = this.addFormData.ZPALLETQTY
          //  row.ZUNLOAD = this.addFormData.ZUNLOAD
          //  row.ZVKAUS = this.addFormData.ZVKAUS
          //  row.ZCARTYPE = this.addFormData.ZCARTYPE
          //  row.STREET = this.addFormData.STREET
          //  row.ZCARNO = this.addFormData.ZCARNO
          //  row.ZPHONE = this.addFormData.ZPHONE
          //  row.ZDRIVER1 = this.addFormData.ZDRIVER1
          //  row.ZPHONE1 = this.addFormData.ZPHONE1
          //  //row.ZDRIVER2 = this.addFormData.ZDRIVER2
          //  //row.ZPHONE2 = this.addFormData.ZPHONE2
          //  row.ZSHIPSTATUS = "40";

          //});
          var selectedData = this.orderGrid.instance.getSelectedRowsData();
          if (selectedData.length === 0) {
            alert("라인을 선택 후 저장하세요.", "알림");
            return;
          }




          if (await confirm("저장 하시겠습니까?", "알림")) {
            var result = await this.createOrder();
            if (result.E_MTY === "E") {
              alert(`저장 실패,\n\n오류 메세지: ${result.E_MSG}`, "알림");
              return;
            }
            else {
              alert("저장이 완료되었습니다.", "알림")
              //this.print(this);
              this.TeansactionPrint(this);
              this.dataLoad(this);
            }
          }


          this.popupVisible = false;
          this.popupVisibleIm = false;
          /*        this.dataLoad(this);*/
        }

        //임가공
        else if (this.selectData2 === "9999") {
          if (this.imaddFormData.ZMENGE3 === null || this.imaddFormData.ZMENGE3 === undefined || this.imaddFormData.ZMENGE3 === "") {
            alert(`출고수량은 필수값입니다.`, "알림");
            return;
          }
          else if (this.imaddFormData.WADAT_IST === null || this.imaddFormData.WADAT_IST === undefined || this.imaddFormData.WADAT_IST === "") {
            alert(`출고전기일자는 필수값입니다.`, "알림");
            return;
          }
          else if (this.imaddFormData.MATNR === null || this.imaddFormData.MATNR === undefined || this.imaddFormData.MATNR === "") {
            alert(`자재명은 필수값입니다.`, "알림");
            return;
          }
          else if (this.imaddFormData.Z3PARVW === null || this.imaddFormData.Z3PARVW === undefined || this.imaddFormData.Z3PARVW === "") {
            alert(`1차운송사는 필수값입니다.`, "알림");
            return;
          }
          else if (this.imaddFormData.ZSHIPMENT_NO === null || this.imaddFormData.ZSHIPMENT_NO === undefined || this.imaddFormData.ZSHIPMENT_NO === "") {
            alert(`배차번호는 필수값입니다.`, "알림");
            return;
          }
          else if (this.imaddFormData.ZSHIPMENT_DATE === null || this.imaddFormData.ZSHIPMENT_DATE === undefined || this.imaddFormData.ZSHIPMENT_DATE === "") {
            alert(`배차일자는 필수값입니다.`, "알림");
            return;
          }
          //else if (this.imaddFormData.ZPALLTP === null || this.imaddFormData.ZPALLTP === undefined || this.imaddFormData.ZPALLTP === "") {
          //  alert(`파레트유형은 필수값입니다.`, "알림");
          //  return;
          //}
          //else if (this.imaddFormData.ZPALLETQTY === null || this.imaddFormData.ZPALLETQTY === undefined ||
          //  this.imaddFormData.ZPALLETQTY.toString().padStart(5, '0') === "00000" || this.imaddFormData.ZPALLETQTY === "") {
          //  alert(`파레트수량은 필수값입니다.`, "알림");
          //  return;
          //}
          //else if (this.imaddFormData.ZUNLOAD === null || this.imaddFormData.ZUNLOAD === undefined || this.imaddFormData.ZUNLOAD === "") {
          //  alert(`하차정보는 필수값입니다.`, "알림");
          //  return;
          //}
          //else if (this.imaddFormData.ZVKAUS === null || this.imaddFormData.ZVKAUS === undefined || this.imaddFormData.ZVKAUS === "") {
          //  alert(`용도는 필수값입니다.`, "알림");
          //  return;
          //}
          else if (this.imaddFormData.ZCARTYPE === null || this.imaddFormData.ZCARTYPE === undefined || this.imaddFormData.ZCARTYPE === "") {
            alert(`화물차종은 필수값입니다.`, "알림");
            return;
          }
          else if (this.imaddFormData.ZCARNO === null || this.imaddFormData.ZCARNO === undefined || this.imaddFormData.ZCARNO === "") {
            alert(`차량번호는 필수값입니다.`, "알림");
            return;
          }
          else if (this.imaddFormData.ZDRIVER === null || this.imaddFormData.ZDRIVER === undefined || this.imaddFormData.ZDRIVER === "") {
            alert(`운전기사명은 필수값입니다.`, "알림");
            return;
          }
          else if (this.imaddFormData.ZPHONE === null || this.imaddFormData.ZPHONE === undefined || this.imaddFormData.ZPHONE === "") {
            alert(`전화번호는 필수값입니다.`, "알림");
            return;
          }



          var selectedData = this.orderGrid.instance.getSelectedRowsData();
          if (selectedData.length === 0) {
            alert("라인을 선택 후 저장하세요.", "알림");
            return;
          }

          if (await confirm("저장 하시겠습니까?", "알림")) {
            var result = await this.createOrder2();
            if (result.E_MTY === "E") {
              alert(`저장 실패,\n\n오류 메세지: ${result.E_MSG}`, "알림");
              return;
            }
            else {
              alert("저장이 완료되었습니다.", "알림")
              //this.print(this);
              //this.TeansactionPrint(this);
              this.dataLoad(this);
            }
          }

          this.popupVisible = false;
          this.popupVisibleIm = false;
        }


      },
    };



    //출고취소
    this.cancelEditButtonOptions =
    {
      text: '출고취소',
      onClick: async () => {
        this.dataGrid.instance.cancelEditData()
      },
    };

    //배차등록취소버튼
    this.closeButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.popupVisible = false;
        that.popupVisibleIm = false;
      },
    };

    ////상세조회취소버튼
    //this.closeButtonOptions3 = {
    //  text: '닫기',
    //  onClick(e: any) {
    //    that.popupVisible3 = false;
    //  },
    //};


  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
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
    /*    this.loadingVisible = true;*/
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


      /*      await this.dataLoad(this);*/
      /*      this.loadingVisible = false;*/
    }, 100);
  }

  onStatusValueChanged(e: any) {
    this.selectStatus = e.value;


  }


  //첫화면 데이터 조회 RFC
  public async dataLoad(thisObj: SHPXComponent) {


    var zsds6410: ZSDS6410Model[] = [];
    thisObj.orderGridData = [];

    //포장재 or 임가공
    if (thisObj.selectData2 !== "9999") {
      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "3000", "", this.startDate, this.endDate, "", "", this.selectData2, "", "", "", "", "",
        this.selectStatus, zsds6410);

      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);
      /*thisObj.orderGridData = resultModel[0].IT_DATA;*/

      resultModel[0].IT_DATA = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C" );
      resultModel[0].IT_DATA.forEach(async (row: ZSDS6410Model) => {
        row.ZMENGE3 = row.ZMENGE2;

        thisObj.orderGridData.push(row);
      });

      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "3200", "", this.startDate, this.endDate, "", "", this.selectData2, "", "", "", "", "",
        this.selectStatus, zsds6410);

      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);
      /*thisObj.orderGridData = resultModel[0].IT_DATA;*/

      resultModel[0].IT_DATA = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C" );
      resultModel[0].IT_DATA.forEach(async (row: ZSDS6410Model) => {
        row.ZMENGE3 = row.ZMENGE2;

        thisObj.orderGridData.push(row);
      });


    }
    else {
      //배차상태가 50이 생기면 없애도 됨
      /*var whereCondi = " AND ( ( A.MBLNR = '' AND A.MBLNR_C = '' ) OR ( A.MBLNR <> '' AND A.MBLNR_C <> '' ) )"*/

      thisObj.imOrderList = await thisObj.dataService.SelectModelData<ZMMT1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList",
        [thisObj.appConfig.mandt, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', ""), this.selectStatus, ""],
        "", "A.VBELN", QueryCacheType.None);

      thisObj.imOrderList.forEach(async (row: ZMMT1320Model) => {
        thisObj.orderGridData.push(new ZSDS6410Model(row.VBELN, "", "", "", "", "", "", "", row.SC_R_DATE, row.IDNRK, row.MAKTX, row.SC_R_MENGE, row.SC_L_MENGE,
          row.MEINS, "9999", row.SC_L_MENGE, 0, undefined, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_L_DATE, "", "", 0, "", "", "", "","", "", ""));
      })
      thisObj.orderGridData.forEach(async (row: ZSDS6410Model) => {
        row.ZMENGE3 = row.ZMENGE2;
      });
    }

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: thisObj.orderGridData
      });
  }


  //출고확정버튼

  async releaseButton(e: any) {
    if (this.selectData2 !== "9999") {
      var selectData = this.orderGrid.instance.getSelectedRowsData();
      if (selectData.length === 0) {
        alert("라인을 선택해야합니다.", "알림");
        return;
      }
      this.checkVal = true;
      await this.checkData(selectData);
      if (!this.checkVal)
        return;

      setTimeout(async () => {
        if (await confirm("출고처리 하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          var result = await this.release();
          this.loadingVisible = false;

          if (result.EV_TYPE === "E") {
            alert(`출고처리 실패,\n\n오류 메세지: ${result.EV_MESSAGE}`, "알림");
            return;
          }
          else if (result.EV_TYPE === "S") {
            alert("출고처리 완료", "알림"); this.popupVisible = false;
            this.popupVisibleIm = false;
            this.dataLoad(this);
          }
        }
      }, 500);
    }

    else if (this.selectData2 === "9999") {
      var selectData = this.orderGrid.instance.getSelectedRowsData();
      if (selectData.length === 0) {
        alert("라인을 선택해야합니다.", "알림");
        return;
      }


      setTimeout(async () => {
        if (await confirm("출고처리 하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          var result = await this.release();
          if (result.EV_TYPE === "E") {
            alert(`출고처리 실패,\n\n오류 메세지: ${result.EV_MESSAGE}`, "알림");
            return;
          }
          else if (result.EV_TYPE === "S") {
            alert("출고처리 완료", "알림"); this.popupVisible = false;
            this.popupVisibleIm = false;
            this.dataLoad(this);
          }
          this.loadingVisible = false;
        }
      }, 500);
    }

  }

  public async checkData(selectData: ZSDS6410Model[]) {
    if (this.selectData2 !== "9999") {
      for (var row of selectData) {
        if (row.ZMENGE3 === null || row.ZMENGE3 === undefined || row.ZMENGE3 === 0) {
          await alert(`출고수량은 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.WADAT_IST === null || row.WADAT_IST === undefined) {
          await alert(`출고전기일자는 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.MATNR === null || row.MATNR === undefined || row.MATNR === "") {
          await alert(`자재명은 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.Z3PARVW === null || row.Z3PARVW === undefined || row.Z3PARVW === "") {
          await alert(`1차운송사는 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZSHIPMENT_NO === null || row.ZSHIPMENT_NO === undefined || row.ZSHIPMENT_NO === "") {
          await alert(`배차번호는 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZSHIPMENT_DATE === null || row.ZSHIPMENT_DATE === undefined) {
          await alert(`배차일자는 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZPALLTP === null || row.ZPALLTP === undefined || row.ZPALLTP === "") {
          await alert(`파레트유형은 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZPALLETQTY === null || row.ZPALLETQTY === undefined || row.ZPALLETQTY === "" || row.ZPALLETQTY.padStart(5, '0') === "00000") {
          await alert(`파레트수량은 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZUNLOAD === null || row.ZUNLOAD === undefined || row.ZUNLOAD === "") {
          await alert(`하차정보는 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZVKAUS === null || row.ZVKAUS === undefined || row.ZVKAUS === "") {
          await alert(`용도는 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZCARTYPE === null || row.ZCARTYPE === undefined || row.ZCARTYPE === "") {
          await alert(`화물차종은 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZCARNO === null || row.ZCARNO === undefined || row.ZCARNO === "") {
          await alert(`차량번호는 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZDRIVER === null || row.ZDRIVER === undefined || row.ZDRIVER === "") {
          await alert(`운전기사명은 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
        if (row.ZPHONE === null || row.ZPHONE === undefined || row.ZPHONE === "") {
          await alert(`전화번호는 필수값입니다. 납품번호 : ${row.VBELN}`, "알림");
          this.checkVal = false;
          return;
        }
      }
    }
    //await selectData.forEach(async (row: ZSDS6410Model) => {

    //});
  }

  //출고처리 rfc
  public async release() {

    var data = this.addFormData
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    var zmmt1320List: ZMMT1320Model[] = [];
    var rowCount: number = 0;
    var rcv = new ZSDIFPORTALSAPGIRcvModel("", "", []);
    var insertModel: ZSDIFPORTALSAPGIRcvModel[] = [rcv]
    var zsdsList: ZSDS6400Model[] = [];

    var checkVSTEL = this.orderGrid.instance.getSelectedRowsData().find(item => item.VSTEL === "9999")
    //임가공 아닌 출하지점
    if (checkVSTEL === undefined) {
      selectData.forEach(async (row: ZSDS6400Model) => {
        zsdsList.push(new ZSDS6400Model(row.VBELN, row.POSNR, "I", row.ZSAPSTATUS, row.KZPOD, row.VGBEL,
          row.VGPOS, row.MATNR, row.ARKTX, 0, row.VRKME, row.VSTEL, row.ZMENGE3, row.WADAT_IST, 0,
          row.GEWEI, row.LGORT, row.ZLGORT, row.KUNNR, row.KUNAG, row.SPART, row.WERKS, row.LFART,
          row.Z3PARVW, row.Z4PARVW, row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, row.ZDRIVER1, row.ZDRIVER2, row.ZPHONE,
          row.ZPHONE1, row.ZPHONE2, row.ZUNLOAD, row.ZSHIPMENT_NO, row.ZSHIPMENT_DATE, row.ZPALLTP, row.ZPALLETQTY,
          row.ZVKAUS, row.ZVBELN2, row.ZSAPMESSAGE, row.ZIFMESSAGE, row.ZIFSTATUS, row.ZIFDELETE, new Date("9999-12-31"), "000000",
          row.ZERNAM, new Date("9999-12-31"), "000000", row.ZAENAM));


        rcv = new ZSDIFPORTALSAPGIRcvModel("", "", zsdsList)
      })

      var model: ZSDIFPORTALSAPGIRcvModel[] = [rcv];

      insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPGIRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPGIRcvModelList", model, QueryCacheType.None);
      debugger;
    } else { //임가공
      ////바피 모델
      //var zmms3130List = [new ZMMS3130Model(data.MATNR, data.LGORT, "", "", data.KUNNR, data.ZMENGE3, selectData[0].VRKME,
      //  "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0)];

      //var zmmGoodsMVT = [new ZMMGOODSMVTCommonModel([], "", "", "", "", this.addFormData.WADAT_IST, "04", "", "541",
      //  this.appConfig.plant, this.addFormData.WADAT_IST, "", zmms3130List)];

      ////바피 실행
      //var runGoodsMVT = await this.dataService.RefcCallUsingModel<ZMMGOODSMVTCommonModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMGOODSMVTCommonModelList", zmmGoodsMVT, QueryCacheType.None);

      //바피 오류체크 수정 시 오류부분 주석처리
      //var errorMSG = "";
      //var checkError = runGoodsMVT[0].ET_RESULT.filter(item => item.TYPE === "E");
      //if (checkError.length > 0) {
      //  insertModel[0].EV_TYPE = "E";
      //  insertModel[0].EV_MESSAGE = checkError[0].MESSAGE;
      //  return insertModel[0];

      //  //오픈 시 오류는 테이블에 메시지 저장 
      //  /*errorMSG = checkError[0].MESSAGE;*/
      //}

      //임가공 저장데이터 생성
      for (var array of this.orderGrid.instance.getSelectedRowsData() as ZSDS6410Model[]) {
        var getData = this.imOrderList.find(item => item.VBELN === array.VBELN)
        if (getData !== undefined) {
          getData.ModelStatus = DIMModelStatus.Modify;
          getData.ZCARNO = array.ZCARNO;
          getData.ZCARTYPE = array.ZCARTYPE;
          getData.ZDRIVER = array.ZDRIVER;
          getData.ZPHONE = array.ZPHONE;
          //getData.SC_G_DATE = this.addFormData.WADAT_IST;
          //getData.SC_G_MENGE = this.addFormData.ZMENGE3;
          getData.SC_G_DATE = array.WADAT_IST;
          getData.SC_G_MENGE = array.ZMENGE3;
          getData.SC_G_TIME = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
            new Date().getSeconds().toString().padStart(2, '0');


          getData.ZSHIP_STATUS = "50";

          //바피 모델
          var zmms3130List = [new ZMMS3130Model(array.MATNR, array.LGORT, "", "", array.KUNNR, array.ZMENGE3, array.VRKME,
            "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0)];

          var zmmGoodsMVT = [new ZMMGOODSMVTCommonModel([], "", "", "", "", array.WADAT_IST, "04", "", "541",
            this.appConfig.plant, array.WADAT_IST, "", zmms3130List)];

          //바피 실행
          var runGoodsMVT = await this.dataService.RefcCallUsingModel<ZMMGOODSMVTCommonModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMGOODSMVTCommonModelList", zmmGoodsMVT, QueryCacheType.None);

          //임가공 바피실행 세트
          getData.MBLNR = runGoodsMVT[0].E_MBLNR;
          getData.MJAHR = runGoodsMVT[0].E_MJAHR;
          getData.ZEILE = runGoodsMVT[0].E_ZEILE;
          getData.ZPOST_RUN_MESSAGE = runGoodsMVT[0].ET_RESULT[0].MESSAGE;

          getData.SC_A_DATE = new Date("0001-01-01");
          getData.AENAM = this.appConfig.interfaceId;
          getData.AEDAT = new Date();
          getData.AEZET = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
            new Date().getSeconds().toString().padStart(2, '0');
          zmmt1320List.push(getData);
        }
      }

      rowCount = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList", zmmt1320List);


      /*if (rowCount > 0) {*/
      insertModel[0].EV_TYPE = "S";

    }

    return insertModel[0];
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
    if (this.loadePeCount >= 14) {
      this.loadePeCount = 0;
      this.dataLoad(this);
      this.loadingVisible = false;

    }
  }

  //출고버튼
  async refAddOrder(e: any) {


    /*this.addFormData = [];*/
    this.clearEntery();
    this.addFormData = "";
    this.imaddFormData = "";
    //0.5초 뒤에 적용(숨김 상태의 컨트롤은 프로퍼티 변동이 안되므로 POPUP창이 보여진 상태에서 변경을 해 주어야 함)
    setTimeout(async () => {

      var selectData = this.orderGrid.instance.getSelectedRowsData();
      if (selectData.length === 0) {
        alert("라인을 선택해야합니다.", "알림");
        return;
      }

      var ZMENGE = 0;

      //출고수량 없으면 배차수량으로 대체해서 보여줌
      if (selectData[0].ZMENGE3 === 0)
        ZMENGE = selectData[0].ZMENGE4;
      else
        ZMENGE = selectData[0].ZMENGE3;

      this.popupData = { VBELN: selectData[0].VBELN, POSNR: selectData[0].POSNR, ZMENGE2: selectData[0].ZMENGE2, ZMENGE4: selectData[0].ZMENGE4, ARKTX: selectData[0].ARKTX }
      /*    this.addFormData = { MATNR: selectData[0].MATNR }*/
      var model1 = new ZSDS6400Model(selectData[0].VBELN, selectData[0].POSNR, "I", selectData[0].ZSAPSTATUS, selectData[0].KZPOD, selectData[0].VGBEL, selectData[0].VGPOS, selectData[0].MATNR,
        selectData[0].ARKTX, 0, selectData[0].VRKME, selectData[0].VSTEL, ZMENGE, new Date(), 0, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT,
        selectData[0].KUNNR, selectData[0].KUNAG, selectData[0].SPART, selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE,
        selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZDRIVER2, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZPHONE2, selectData[0].ZUNLOAD,
        selectData[0].ZSHIPMENT_NO, new Date(), selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, selectData[0].ZVKAUS, selectData[0].ZVBELN2, selectData[0].ZSAPMESSAGE,
        selectData[0].ZIFMESSAGE, selectData[0].ZIFSTATUS, selectData[0].ZIFDELETE, selectData[0].ZERDAT, selectData[0].ZERZET, selectData[0].ZERNAM, selectData[0].ZAEDAT, selectData[0].ZAEZET,
        selectData[0].ZAENAM);

      if (this.selectData2 !== "9999") {
        this.addFormData = model1;
        this.addFormData.STREET = selectData[0].STREET;
      } else {
        this.imaddFormData = model1;
        this.imaddFormData.STREET = selectData[0].STREET;
      }
      
      this.zunloadValue = selectData[0].ZUNLOAD;
      this.zpalValue = selectData[0].ZPALLTP;
      this.vkausValue = selectData[0].ZVKAUS;
      /*this.zcarValue = selectData[0].ZCARTYPE;*/

      /*this.matnrValue = selectData[0].MATNR;*/
      this.tdlnrValue1 = selectData[0].Z3PARVW

      if (model1.VSTEL !== "9999") {
        this.matnrValue = selectData[0].MATNR;
        this.tdlnrValue1 = selectData[0].Z3PARVW
        this.tdlnrValue = selectData[0].Z4PARVW
        this.zcarnoModiValue = selectData[0].ZCARNO;
        this.zcarValue = selectData[0].ZCARTYPE;
        this.popupVisible = true;
      }
      else {
        this.immatnrValue = selectData[0].MATNR;
        this.imtdlnrValue1 = selectData[0].Z3PARVW
        this.imtdlnrValue = selectData[0].Z4PARVW
        this.imzcarnoModiValue = selectData[0].ZCARNO;
        this.imzcarValue = selectData[0].ZCARTYPE;
        this.popupVisibleIm = true;
      }

    }, 500, this);
  }



  //하차
  onZunloadCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZUNLOAD = e.selectedValue;
    });
  }
  //용도
  onZvkausCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZVKAUS = e.selectedValue;
    });
  }
  //파레트유형
  onZpalltpCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZPALLTP = e.selectedValue;
    });
  }
  //화물차종
  onZcartypeCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZCARTYPE = e.selectedValue;
    }, 100);
  }

  //화물차종
  onimZcartypeCodeValueChanged(e: any) {
    setTimeout(() => {
      this.imaddFormData.ZCARTYPE = e.selectedValue;
    }, 100);
  }

  //1차운송사
  onTdlnrCode1ValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.Z3PARVW = e.selectedValue;
    });
  }
  //2차운송사
  onTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.Z4PARVW = e.selectedValue;
    });
  }

  //1차운송사
  onimTdlnrCode1ValueChanged(e: any) {
    setTimeout(() => {
      this.imaddFormData.Z3PARVW = e.selectedValue;
    });
  }
  //2차운송사
  onimTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.imaddFormData.Z4PARVW = e.selectedValue;
    });
  }

  //자재명 변경이벤트
  onmatnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.MATNR = e.selectedValue;
      /*this.matnrValue = e.selectedValue;*/
    });
  }
  //임가공자재명 변경이벤트
  onimmatnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.imaddFormData.MATNR = e.selectedValue;
      /*this.matnrValue = e.selectedValue;*/
    });
  }
  //onz4parvwCodeValueChanged(e: any) {
  //  setTimeout(() => {
  //    this.addFormData.Z4PARVW = e.selectedValue;
  //  });
  //}
  //분할 차량번호 선택이벤트
  onZcarno1CodeValueChanged(e: any) {
    setTimeout(() => {
      //this.addFormData.ZCARNO = e.selectedValue;
      //var carValue = this.zcarnoModiCodeEntery.gridDataSource._array.find(obj => obj.ZCARNO == e.selectedValue);

      //if (carValue !== undefined) {
      //  this.addFormData.ZDRIVER = carValue.ZDRIVER;
      //  this.addFormData.ZPHONE = carValue.ZPHONE
      //  this.addFormData.ZCARTYPE = this.zcarValue = carValue.ZCARTYPE;
      //}

      //if (e.selectedItem.ZCARTYPE === this.zcarValue)
      //  this.addFormData.ZCARTYPE = e.selectedItem.ZCARTYPE;
      //else
      //this.addFormData.ZCARTYPE = this.zcarValue = e.selectedItem.ZCARTYPE;

      this.addFormData.ZCARNO = e.selectedValue;
      this.addFormData.ZDRIVER = e.selectedItem.ZDRIVER;
      this.addFormData.ZPHONE = e.selectedItem.ZPHONE;
      this.addFormData.ZCARTYPE = this.zcarValue = e.selectedItem.ZCARTYPE;

    }, 100);
  }

  //수정 차량번호 선택이벤트
  onimZcarnoCodeValueChanged(e: any) {
    setTimeout(() => {

      //this.imaddFormData.ZCARNO = e.selectedValue;
      //var carValue = this.imzcarnoModiCodeEntery.gridDataSource._array.find(obj => obj.ZCARNO == e.selectedValue);

      //if (carValue !== undefined) {
      //  this.addFormData.ZDRIVER = carValue.ZDRIVER;
      //  this.addFormData.ZPHONE = carValue.ZPHONE
      //  this.addFormData.ZCARTYPE = this.zcarValue = carValue.ZCARTYPE;
      //}
      this.imaddFormData.ZCARNO = e.selectedValue;
      this.imaddFormData.ZDRIVER = e.selectedItem.ZDRIVER;
      this.imaddFormData.ZPHONE = e.selectedItem.ZPHONE;
      this.imaddFormData.ZCARTYPE = this.imzcarValue = e.selectedItem.ZCARTYPE;
      //console.info(`출하진행현황 임가공 차량번호 변경이벤트: ${e.selectedValue} / ${e.selectedItem} / ${carValue.ZDRIVER}`);
    }, 100);
  }

  public clearEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    this.dd07tEntery.ClearSelectedValue();
    this.tvlvEntery.ClearSelectedValue();
    this.zpalEntery.ClearSelectedValue();
    this.dd07tCarEntery.ClearSelectedValue();
    /*this.zcarnoCodeEntery.ClearSelectedValue();*/
    this.zcarnoModiCodeEntery.ClearSelectedValue();
    /*    this.z4parvwCodeEntery.ClearSelectedValue();*/
    this.tdlnrEntery.ClearSelectedValue();
    this.tdlnrEntery1.ClearSelectedValue();

    this.imdd07tCarEntery.ClearSelectedValue();
    this.imtdlnrEntery.ClearSelectedValue();
    this.imtdlnrEntery1.ClearSelectedValue();
    this.imzcarnoModiCodeEntery.ClearSelectedValue();
  }

  //화물 위수탁증
  async print(e: any) {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }
    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "itddatFrom": selectData[0].TDDAT,
      "itddatTo": selectData[0].TDDAT,
      "ivbeln": selectData[0].VBELN,
      "mandt": this.appConfig.mandt
    };

    setTimeout(() => { this.reportViewer.printReport("SHPQReport", params) });
  }

  //거래명세서
  async TeansactionPrint(e: any) {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }
    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "itddatFrom": selectData[0].TDDAT,
      "itddatTo": selectData[0].TDDAT,
      "ivbeln": selectData[0].VBELN,
      /*      "vbelnvl": "",*/
      "mandt": this.appConfig.mandt,
      "ivstel": selectData[0].VSTEL
    };

    setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction2", params) });
  }

  //수정저장 rfc
  public async createOrder() {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    var zsds6420List: ZSDS6420Model[] = [];

    if (this.selectData2 !== "9999") {
      var zsds6420Model = new ZSDS6420Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].VRKME, selectData[0].ZMENGE4,
        this.addFormData.ZMENGE3, this.addFormData.WADAT_IST, this.addFormData.Z3PARVW, this.addFormData.Z4PARVW, this.addFormData.ZCARTYPE,
        this.addFormData.ZCARNO, this.addFormData.ZDRIVER, selectData[0].ZDRIVER1, this.addFormData.ZPHONE, selectData[0].ZPHONE1,
        this.addFormData.ZVKAUS, this.addFormData.ZUNLOAD, "40", this.addFormData.ZSHIPMENT_NO, this.addFormData.ZSHIPMENT_DATE,
        this.addFormData.ZPALLTP, this.addFormData.ZPALLETQTY, selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT, selectData[0].MTY, selectData[0].MSG);

      zsds6420List = [zsds6420Model];
    } else {
      var zsds6420Model = new ZSDS6420Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].VRKME, selectData[0].ZMENGE4,
        this.imaddFormData.ZMENGE3, this.imaddFormData.WADAT_IST, this.imaddFormData.Z3PARVW, this.imaddFormData.Z4PARVW, this.imaddFormData.ZCARTYPE,
        this.imaddFormData.ZCARNO, this.imaddFormData.ZDRIVER, selectData[0].ZDRIVER1, this.imaddFormData.ZPHONE, selectData[0].ZPHONE1,
        this.imaddFormData.ZVKAUS, this.imaddFormData.ZUNLOAD, "40", this.imaddFormData.ZSHIPMENT_NO, this.imaddFormData.ZSHIPMENT_DATE,
        this.imaddFormData.ZPALLTP, this.imaddFormData.ZPALLETQTY, selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT, selectData[0].MTY, selectData[0].MSG);

      zsds6420List = [zsds6420Model];
    }
    
    var zsdModel = new ZSDIFPORTALSAPLE028RcvModel("", "", zsds6420List);
    var zsdList: ZSDIFPORTALSAPLE028RcvModel[] = [zsdModel];


    var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028RcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028RcvModelList", zsdList, QueryCacheType.None);
    return insertModel[0];
  }


  //임가공상차지시
  public async createOrder2() {

    var data = this.imaddFormData
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    var zmmt1320List: ZMMT1320Model[] = [];
    var rowCount: number = 0;
    var rcv = new ZSDIFPORTALSAPLE028RcvModel("", "", []);
    var insertModel: ZSDIFPORTALSAPLE028RcvModel[] = [rcv]
    var zsdsList: ZSDS6400Model[] = [];

    //임가공 CBO업데이트
    this.orderGrid.instance.getSelectedRowsData().forEach(async (array: ZSDS6410Model) => {
      var getData = this.imOrderList.find(item => item.VBELN === array.VBELN)
      if (getData !== undefined) {
        getData.ModelStatus = DIMModelStatus.Modify;
        getData.ZCARNO = data.ZCARNO;
        getData.ZCARTYPE = data.ZCARTYPE;
        getData.ZDRIVER = data.ZDRIVER;
        getData.ZPHONE = data.ZPHONE;
        //getData.SC_G_DATE = this.addFormData.WADAT_IST;
        //getData.SC_G_MENGE = this.addFormData.ZMENGE3;
        getData.SC_G_DATE = data.WADAT_IST;
        getData.SC_G_MENGE = data.ZMENGE3;
        getData.SC_G_TIME = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
          new Date().getSeconds().toString().padStart(2, '0');

        getData.SC_R_DATE_C = new Date();
        getData.ZSHIP_STATUS = "40";




        getData.SC_A_DATE = new Date("0001-01-01");
        getData.AENAM = this.appConfig.interfaceId;
        getData.AEDAT = new Date();
        getData.AEZET = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
          new Date().getSeconds().toString().padStart(2, '0');

        zmmt1320List.push(getData);
      }
    });
    rowCount = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList", zmmt1320List);

    /*if (rowCount > 0) {*/
    insertModel[0].E_MTY = "S";

    return insertModel[0];
  }

  async cancelButton(e: any) {
    var selectedData = this.orderGrid.instance.getSelectedRowsData();
    if (selectedData.length === 0) {
      alert("라인을 선택해야 합니다", "알림")
      return;
    }
    if (await confirm("취소 하시겠습니까?", "알림")) {
      selectedData[0].ZSHIPSTATUS = "30";
      this.createOrder();
      alert("취소 완료", "알림");
      this.dataLoad(this);
    }
  }
}
