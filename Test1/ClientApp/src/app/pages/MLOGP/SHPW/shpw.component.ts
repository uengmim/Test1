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
import { Service, Data, Data2, CarSeq } from '../SHPW/app.service';
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
import { confirm, alert } from "devextreme/ui/dialog";
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { ZMMT1320Model } from '../../../shared/dataModel/OWHP/Zmmt1320Proxy';
import { async } from 'rxjs';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZMMGOODSMVTCommonModel, ZMMS3130Model } from '../../../shared/dataModel/OWHP/ZmmGoodsmvtCommonProxy';
import { ZSDT7110Model } from '../../../shared/dataModel/MLOGP/Zsdt7110';
import { ChangeDetectorRef } from '@angular/core';
import { T001lModel } from '../../../shared/dataModel/MLOGP/T001l';
import { ZMMT1321Join1320Model } from '../../../shared/dataModel/MLOGP/Zmmt1320Join1321';
//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shpw.component.html',
  providers: [ImateDataService, Service]
})



export class SHPWComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('vsEntery', { static: false }) vsEntery!: CommonPossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: CommonPossibleEntryComponent;
  @ViewChild('lglgEntery', { static: false }) lglgEntery!: CommonPossibleEntryComponent;
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
  @ViewChild('popFormDynamic', { static: false }) popFormDynamic!: DxFormComponent;
  /* Entry  선언 */
  //제품코드
  matnrCode!: TableCodeInfo;
  //임가공제품코드
  immatnrCode!: TableCodeInfo;

  //출하지점
  vsCode!: TableCodeInfo;
  //비료창고
  lgCode!: TableCodeInfo;
  //제품구분(비료:10, 친환경:40)
  maraCode!: TableCodeInfo;
  //하차 방법
  dd07tCode!: TableCodeInfo;
  //화물차종
  dd07tCarCode: TableCodeInfo;
  //용도 정보
  tvlvCode: TableCodeInfo;
  //파레트유형
  zpalCode!: TableCodeInfo;

  //운송사
  tdlnrCode!: TableCodeInfo;
  tdlnr1Code!: TableCodeInfo;
  //2차운송사
  z4parvwCode!: CommonCodeInfo;

  //차량번호
  zcarnoCode!: TableCodeInfo;

  //차량번호(수정)
  zcarnoModiCode!: TableCodeInfo;

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

  //자재코드
  matnrValue: string | null;
  //임가공자재코드
  immatnrValue: string | null;
  //운송사
  tdlnrValue!: string | null;
  tdlnrValue1!: string | null;
  //2차운송사
  z4parvwValue!: string | null;

  //차량번호
  zcarnoValue!: string | null;
  //차량번호(수정)
  zcarnoModiValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;

  //셀렉트박스
  data2!: Data2[];
  carSeq: CarSeq[];
  sort2!: string[];

  //조회컬럼조절
  isColVisible: boolean = true;

  isDisableField: boolean = false;
  //비료창고
  lgCodeValue: string | null = null;

  selectStatus: string = "30";
  selectData2: string = "1000";
  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "shpw";

  dataSource: any;
  //거래처


  //정보
  orderData: any;
  orderGridData: ZSDS6410Model[] = [];

  //임가공 원데이터
  imOrderList: ZMMT1321Join1320Model[] = [];

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
  FormData: any = {};
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
  empId: string = "";
  rolid: string[] = [];
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";

  lgNmList: T001lModel[] = [];

  isDisabled: boolean = false;

  collapsed: any;
  //배차팝업 선택값
  selectGrid2Data: ZSDS6400Model[] = [];
  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService,
    private imInfo: ImateInfo, private authService: AuthService, private cd: ChangeDetectorRef) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출하진행현황-포장재(사외창고)";

    this.loadingVisible = true;

    let userInfo = this.authService.getUser().data;

    //this.empId = userInfo?.empId.padStart(10, '0');
    this.rolid = userInfo?.role;
    this.vorgid = userInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = userInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = userInfo.orgOption.torgid.padStart(10, '0');
    this.empId = this.corgid;

    ////임시하드코딩 로직
    //if (this.empId === "0000300043")
    //  this.empId = "0000102960";

    this.vsCode = appConfig.tableCode("출하지점");
    this.lgCode = appConfig.tableCode("전체창고");
   /* this.maraCode = appConfig.tableCode("제품구분");*/
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
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.immatnrCode)
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;
    this.lgCodeValue = "";
    this.vsValue = "";
    this.lgValue = "";
    this.zunloadValue = "";
    this.vkausValue = "";
    this.zpalValue = "";
    this.zcarValue = "";
    this.zcarnoValue = "";
    this.zcarnoModiValue = "";
    this.z4parvwValue = ""
    this.tdlnrValue = ""
    this.tdlnrValue1 = ""
    this.matnrValue = "";
    this.immatnrValue = "";
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 1), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    this.getLgortNm();

    //정보
    this.data2 = service.getData2();
    //1차2차운송사 구분
    this.carSeq = service.getCarSeq();

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        /*this.loadPanelOption = { enabled: true };*/
        this.loadingVisible = true;
        await this.dataLoad(this);
        this.loadingVisible = false;
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
    //출고처리
    this.shipmentProcessing = {
      text: "출고처리",
      onClick: async () => {
        if (this.addFormData.WADAT_IST === null || this.addFormData.WADAT_IST === undefined) {
          alert(`출고전기일자는 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZSHIPMENT_DATE === null || this.addFormData.ZSHIPMENT_DATE === undefined) {
          alert(`배차일자는 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZMENGE3 === null || this.addFormData.ZMENGE3 === undefined || this.addFormData.ZMENGE3 <= 0) {
          alert(`출고수량은 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.Z3PARVW === null || this.addFormData.Z3PARVW === undefined || this.addFormData.Z3PARVW === "") {
          alert(`1차운송사는 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZSHIPMENT_NO === null || this.addFormData.ZSHIPMENT_NO === undefined || this.addFormData.ZSHIPMENT_NO === "") {
          alert(`배차번호는 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZPALLTP === null || this.addFormData.ZPALLTP === undefined || this.addFormData.ZPALLTP === "") {
          alert(`파레트유형은 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZUNLOAD === null || this.addFormData.ZUNLOAD === undefined || this.addFormData.ZUNLOAD === "") {
          await alert(`하차정보는 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZVKAUS === null || this.addFormData.ZVKAUS === undefined || this.addFormData.ZVKAUS === "") {
          await alert(`용도는 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZCARTYPE === null || this.addFormData.ZCARTYPE === undefined || this.addFormData.ZCARTYPE === "") {
          await alert(`화물차종은 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZCARNO === null || this.addFormData.ZCARNO === undefined || this.addFormData.ZCARNO === "") {
          await alert(`차량번호는 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZDRIVER === null || this.addFormData.ZDRIVER === undefined || this.addFormData.ZDRIVER === "") {
          await alert(`운전기사명은 필수값입니다.`, "알림");
          return;
        }
        if (this.addFormData.ZPHONE === null || this.addFormData.ZPHONE === undefined || this.addFormData.ZPHONE === "") {
          await alert(`전화번호는 필수값입니다.`, "알림");
          return;
        }
        if (await confirm("출고처리 하시겠습니까?", "알림")) {
          var result = await this.release();

          //if (this.popupData.ZMENGE4 < this.addFormData.ZMENGE3) {
          //  alert("출고수량은 배차수량을 넘길 수 없습니다.");
          //  return;
          //}

          if (result.EV_TYPE === "E") {
            alert(`출고처리 실패,\n\n오류 메세지: ${result.EV_MESSAGE}`, "알림");
            return;
          }
          else if (result.EV_TYPE === "S") {

            var resultMessage = "";
            for (var row of result.T_DATA) {
              if (row.ZSAPMESSAGE !== "")
                resultMessage = resultMessage.concat(row.ZSAPMESSAGE, "</br>");
            }

            if (resultMessage === "") {
              await alert("출고처리 완료", "알림"); this.popupVisible = false;
              this.popupVisibleIm = false;
              this.TeansactionPrint(this);
              await this.dataLoad(this);
            }
            else {
              await alert(resultMessage, "오류");
            }

          }
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
    this.loadingVisible = true;
    setTimeout(async () => {
      this.selectData2 = e.value;
      if (this.selectData2 === "9999") {
        this.isColVisible = false;
        this.isDisableField = true;
        this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("임가공제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      } else if (this.selectData2 === "1000") {
        this.isColVisible = true;
        this.isDisableField = false;
        this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("비료제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      } else {
        this.isColVisible = true;
        this.isDisableField = false;
        this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("화학제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      }


      await this.dataLoad(this);
      this.loadingVisible = false;
    }, 100);
  }


  //1차2차운송사 구분변경 이벤트
  onGubunValueChanged(e: any) {
    if (e.value === 1)
      this.selectStatus = "10";
    else
      this.selectStatus = "20";
  }



  //첫화면 데이터 조회 RFC
  public async dataLoad(thisObj: SHPWComponent) {
    let fixData = { I_ZSHIPSTATUS: this.selectStatus };
    var zsds6410: ZSDS6410Model[] = [];
    thisObj.orderGridData = [];
    //if (this.lgEntery.selectedValue == undefined) {
    //  this.lgEntery.selectedValue = "";
    //}

    //var lgortVal = "";
    //var role = this.rolid.find(item => item === "ADMIN");
    
    //if (role === undefined) {
    //  var result7110Model = await this.dataService.SelectModelData<ZSDT7110Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7110ModelList", [],
    //    `MANDT = '${this.appConfig.mandt}' AND KUNNR = '${this.empId}' `, "", QueryCacheType.None);

    //  if (result7110Model.length > 0)
    //    lgortVal = result7110Model[0].LGORT ?? "X";
    //}

    //포장재 or 임가공
    if (thisObj.selectData2 !== "9999") {
      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", this.lgCodeValue, "", this.startDate, this.endDate, "", "", this.selectData2, "X", "", "", "", "", fixData.I_ZSHIPSTATUS, zsds6410);

      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);
      thisObj.orderGridData = resultModel[0].IT_DATA;

      for (var row of thisObj.orderGridData) {
        if (row.ZUNLOAD === "10")
          row.ZUNLOADT = "기본";
        else if (row.ZUNLOAD === "20")
          row.ZUNLOADT = "분산"
      }

      /*thisObj.orderGridData = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C");*/
    } else {
      /*
      var whereCondi = " AND ( ( A.MBLNR = '' AND A.MBLNR_C = '' ) OR ( A.MBLNR <> '' AND A.MBLNR_C <> '' ) )"

      thisObj.imOrderList = await thisObj.dataService.SelectModelData<ZMMT1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList",
        [thisObj.appConfig.mandt, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', ""), fixData.I_ZSHIPSTATUS, whereCondi],
        "", "A.VBELN", QueryCacheType.None);

      thisObj.imOrderList.forEach(async (row: ZMMT1320Model) => {
        thisObj.orderGridData.push(new ZSDS6410Model(row.VBELN, "", "", "", "", "", "", "", row.SC_R_DATE, row.IDNRK, row.MAKTX, row.SC_R_MENGE, row.SC_L_MENGE,
          row.MEINS, "9999", row.SC_L_MENGE, 0, undefined, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_L_DATE, "", "", 0, "", "", "", "", "", "", ""));
      })
      */
    }

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: thisObj.orderGridData
      });
  }

  //출고처리 rfc
  public async release() {
    var data = this.addFormData
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    var zmmt1320List: ZMMT1320Model[] = [];
    var rowCount: number = 0;
    var rcv = new ZSDIFPORTALSAPGIRcvModel("", "", []);
    var insertModel: ZSDIFPORTALSAPGIRcvModel[] = [rcv]

    var checkVSTEL = this.orderGrid.instance.getSelectedRowsData().find(item => item.VSTEL === "9999")
    if (checkVSTEL === undefined) {
      var zsds6400 = new ZSDS6400Model(this.popupData.VBELN, this.popupData.POSNR, "I", selectData[0].ZSAPSTATUS, selectData[0].KZPOD, selectData[0].VGBEL, selectData[0].VGPOS, selectData[0].MATNR, data.ARKTX, 0, selectData[0].VRKME, selectData[0].VSTEL, data.ZMENGE3, data.WADAT_IST, 0, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT, selectData[0].KUNNR, selectData[0].KUNAG, selectData[0].SPART, selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, data.Z4PARVW, data.ZCARTYPE, data.ZCARNO, data.ZDRIVER, data.ZDRIVER1, data.ZDRIVER2, data.ZPHONE, data.ZPHONE1, data.ZPHONE2, data.ZUNLOAD, data.ZSHIPMENT_NO, data.ZSHIPMENT_DATE, data.ZPALLTP, data.ZPALLETQTY, data.ZVKAUS, selectData[0].ZVBELN2, selectData[0].ZSAPMESSAGE, selectData[0].ZIFMESSAGE, selectData[0].ZIFSTATUS, selectData[0].ZIFDELETE, new Date("9999-12-31"), "000000", selectData[0].ZERNAM, new Date("9999-12-31"), "000000", selectData[0].ZAENAM);
      var zsdsList: ZSDS6400Model[] = [zsds6400];
      rcv = new ZSDIFPORTALSAPGIRcvModel("", "", zsdsList)


      var model: ZSDIFPORTALSAPGIRcvModel[] = [rcv];

      insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPGIRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPGIRcvModelList", model, QueryCacheType.None);

    } else {
      //바피 모델
      var zmms3130List = [new ZMMS3130Model(data.MATNR, data.LGORT, "", "", data.KUNNR, data.ZMENGE3, selectData[0].VRKME,
        "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0)];

      var zmmGoodsMVT = [new ZMMGOODSMVTCommonModel([], "", "", "", "", this.addFormData.WADAT_IST, "04", "", "541",
        this.appConfig.plant, this.addFormData.WADAT_IST, "", zmms3130List)];

      //바피 실행
      var runGoodsMVT = await this.dataService.RefcCallUsingModel<ZMMGOODSMVTCommonModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMGOODSMVTCommonModelList", zmmGoodsMVT, QueryCacheType.None);

      //바피 오류체크
      var errorMSG = "";
      var checkError = runGoodsMVT[0].ET_RESULT.filter(item => item.TYPE === "E");
      if (checkError.length > 0) {
        insertModel[0].EV_TYPE = "E";
        insertModel[0].EV_MESSAGE = checkError[0].MESSAGE;
        return insertModel[0];

        //오픈 시 오류는 테이블에 메시지 저장 
        /*errorMSG = checkError[0].MESSAGE;*/
      }
      /*
      //임가공 CBO업데이트
      this.orderGrid.instance.getSelectedRowsData().forEach(async (array: ZSDS6410Model) => {
        var getData = this.imOrderList.find(item => item.VBELN === array.VBELN)
        if (getData !== undefined) {
          getData.ModelStatus = DIMModelStatus.Modify;
          getData.ZCARNO = array.ZCARNO;
          getData.ZCARTYPE = array.ZCARTYPE;
          getData.ZDRIVER = array.ZDRIVER;
          getData.ZPHONE = array.ZPHONE;
          getData.SC_G_DATE = this.addFormData.WADAT_IST;
          getData.SC_G_MENGE = this.addFormData.ZMENGE3;
          getData.SC_G_TIME = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
            new Date().getSeconds().toString().padStart(2, '0');

          getData.MBLNR = runGoodsMVT[0].E_MBLNR;
          getData.MJAHR = runGoodsMVT[0].E_MJAHR;
          getData.ZEILE = runGoodsMVT[0].E_ZEILE;
          getData.ZPOST_RUN_MESSAGE = errorMSG;

          getData.SC_A_DATE = new Date("0001-01-01");
          getData.AENAM = this.appConfig.interfaceId;
          getData.AEDAT = new Date();
          getData.AEZET = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
            new Date().getSeconds().toString().padStart(2, '0');
          zmmt1320List.push(getData);
        }
      });
      */
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
    if (this.loadePeCount >= 9) {
      if (this.rolid.find(item => item === "ADMIN") === undefined) {
        var lgVal = this.lgNmList.find(row => row.KUNNR === this.empId);
        if (lgVal !== undefined)
          this.lgCodeValue = lgVal.LGORT;
        else
          this.lgCodeValue = "3000";

        this.isDisabled = true;
      }

      this.loadePeCount = 0;
      this.dataLoad(this);
      this.loadingVisible = false;

    }
  }

  //출고버튼
  async refAddOrder(e: any) {

    this.clearEntery();
    this.addFormData = [(this.addFormData)];
    //0.5초 뒤에 적용(숨김 상태의 컨트롤은 프로퍼티 변동이 안되므로 POPUP창이 보여진 상태에서 변경을 해 주어야 함)
    setTimeout(() => {
      var selectData = this.orderGrid.instance.getSelectedRowsData();
      this.popupData = { VBELN: selectData[0].VBELN, POSNR: selectData[0].POSNR, ZMENGE2: selectData[0].ZMENGE2, ZMENGE4: selectData[0].ZMENGE4, ARKTX: selectData[0].ARKTX }
      /*    this.addFormData = { MATNR: selectData[0].MATNR }*/
      var model1 = new ZSDS6400Model(selectData[0].VBELN, selectData[0].POSNR, "I", selectData[0].ZSAPSTATUS, selectData[0].KZPOD, selectData[0].VGBEL, selectData[0].VGPOS, selectData[0].MATNR,
        selectData[0].ARKTX, 0, selectData[0].VRKME, selectData[0].VSTEL, selectData[0].ZMENGE3, new Date(), 0, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT,
        selectData[0].KUNNR, selectData[0].KUNAG, selectData[0].SPART, selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE,
        selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZDRIVER2, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZPHONE2, selectData[0].ZUNLOAD,
        selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, selectData[0].ZVKAUS, selectData[0].ZVBELN2, selectData[0].ZSAPMESSAGE,
        selectData[0].ZIFMESSAGE, selectData[0].ZIFSTATUS, selectData[0].ZIFDELETE, selectData[0].ZERDAT, selectData[0].ZERZET, selectData[0].ZERNAM, selectData[0].ZAEDAT, selectData[0].ZAEZET,
        selectData[0].ZAENAM);

      this.addFormData = model1;
      this.zunloadValue = selectData[0].ZUNLOAD;
      this.zpalValue = selectData[0].ZPALLTP;
      this.zcarValue = selectData[0].ZCARTYPE;
      this.vkausValue = selectData[0].ZVKAUS;
      /*this.zcarValue = selectData[0].ZCARTYPE;*/
      this.tdlnrValue = selectData[0].Z4PARVW
      this.zcarnoModiValue = selectData[0].ZCARNO;
      /*this.matnrValue = selectData[0].MATNR;*/
      this.tdlnrValue1 = selectData[0].Z3PARVW

      if (model1.VSTEL !== "9999") {
        this.popupVisible = true;
        this.matnrValue = selectData[0].MATNR;
      }
      else {
        this.popupVisibleIm = true;
        this.immatnrValue = selectData[0].MATNR;
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
      this.addFormData.MATNR = e.selectedValue;
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
      this.addFormData.ZCARNO = e.selectedValue;
      this.addFormData.ZDRIVER = e.selectedItem.ZDRIVER;
      this.addFormData.ZPHONE = e.selectedItem.ZPHONE;
      this.zcarValue = e.selectedItem.ZCARTYPE;
    }, 100);
  }

  //수정 차량번호 선택이벤트
  onZcarno2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZCARNO = e.selectedValue;
      this.addFormData.ZDRIVER = e.selectedItem.ZDRIVER;
      this.addFormData.ZPHONE = e.selectedItem.ZPHONE;
      this.zcarValue = e.selectedItem.ZCARTYPE;
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
  }

  //화물 위수탁증
  //async TeansactionPrint(e: any) {
  //  var selectData = this.orderGrid.instance.getSelectedRowsData();
  //  let params: ParameterDictionary =
  //  {
  //    "dbTitle": this.appConfig.dbTitle,
  //    "itddatFrom": selectData[0].TDDAT,
  //    "itddatTo": selectData[0].TDDAT,
  //    "ivbeln": selectData[0].VBELN,
  //    "mandt": this.appConfig.mandt
  //  };

  //  setTimeout(() => { this.reportViewer.printReport("owReport", params) });
  //}

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

    setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction3", params) });
  }

  async getLgortNm() {

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.lgCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(T001lModel);
    this.lgNmList = resultModel;
  }
}

