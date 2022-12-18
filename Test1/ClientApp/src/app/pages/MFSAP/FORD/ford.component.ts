import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { ZXNSCRFCDataModel } from '../../../shared/dataModel/ZxnscRfcData';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import ArrayStore from 'devextreme/data/array_store';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { Service, RequestProcess, Product, Data2 } from './app.service';
import { alert, confirm } from "devextreme/ui/dialog"
import {
  DxDataGridComponent,
  DxButtonModule,
  DxFormComponent,
  DxPopupComponent
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ZSDEPSOListModel, ZSDS5000Model, ZSDS5001Model } from '../../../shared/dataModel/MFSAP/ZSdEpSoListProxy';
import dxForm from 'devextreme/ui/form';
import { AuthService } from '../../../shared/services';
import { ZSDEPSOENTRYInfoModel, ZSDS3013Model, ZSDS3014Model } from '../../../shared/dataModel/MFSAP/ZSdEpSoEntryInfoProxy';
import { ZSDCREATESODoModel, ZSDS3100Model, ZSDS6001Model, ZSDS6002Model } from '../../../shared/dataModel/MFSAP/ZsdCreateSodoProxy';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';

/*고객주문등록 Component*/

const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'ford.component.html',
  providers: [ImateDataService, Service]
})

export class FORDComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('sd007Entery1', { static: false }) sd007Entery1!: CommonPossibleEntryComponent;
  @ViewChild('sd007Entery2', { static: false }) sd007Entery2!: CommonPossibleEntryComponent;
  @ViewChild('sd007Entery3', { static: false }) sd007Entery3!: CommonPossibleEntryComponent;
  @ViewChild('maEntery', { static: false }) maEntery!: TablePossibleEntryComponent;
  @ViewChild('kunnrEntery', { static: false }) kunnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('kunnrEntery2', { static: false }) kunnrEntery2!: TablePossibleEntryComponent;
  @ViewChild('kunnrEntery3', { static: false }) kunnrEntery3!: TablePossibleEntryComponent;
  @ViewChild('maktEntery', { static: false }) maktEntery!: TablePossibleEntryComponent;
  @ViewChild('maktEntery2', { static: false }) maktEntery2!: TablePossibleEntryComponent;
  @ViewChild('kunnEntery', { static: false }) kunnEntery!: TablePossibleEntryComponent;
  @ViewChild('tvlvEntery', { static: false }) tvlvEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tEntery', { static: false }) dd07tEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnr2Entery', { static: false }) tdlnr2Entery!: TablePossibleEntryComponent;
  @ViewChild('mvgr1Entery', { static: false }) mvgr1Entery!: TablePossibleEntryComponent;
  @ViewChild('mvgr2Entery', { static: false }) mvgr2Entery!: TablePossibleEntryComponent;
  @ViewChild('mvgr3Entery', { static: false }) mvgr3Entery!: TablePossibleEntryComponent;
  @ViewChild('augruEntery', { static: false }) augruEntery!: TablePossibleEntryComponent;
/*  @ViewChild('tdlnr2Entery', { static: false }) tdlnr2Entery!: CommonPossibleEntryComponent;*/
  @ViewChild('t001Entery', { static: false }) t001Entery!: CommonPossibleEntryComponent;
  @ViewChild('incoEntery', { static: false }) incoEntery!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoModiCodeEntery', { static: false }) zcarnoModiCodeEntery!: TablePossibleEntryComponent;


  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;

  private loadePeCount: number = 0;

  /**
   * 데이터 스토어 키
   * */
  dataStoreKey: string = "ford";

  /* Entry  선언 */

  //주문구분 
  sd007Code1: CommonCodeInfo;
  sd007Code2: CommonCodeInfo;
  sd007Code3: CommonCodeInfo;
  //제품구분 정보
  maCode: TableCodeInfo;

  mvgr1Code!: TableCodeInfo;
  mvgr2Code!: TableCodeInfo;
  mvgr3Code!: TableCodeInfo;
  augruCode!: TableCodeInfo;
  //주문명 정보
  maktCode: TableCodeInfo;
  maktCode2: TableCodeInfo;
  //도착지 정보
  kunnCode: TableCodeInfo;
  /*kunnCode2: CommonCodeInfo;*/
  kunnCode2: TableCodeInfo;
  //용도 정보
  tvlvCode: TableCodeInfo;
  //하차 방법
  dd07tCode: TableCodeInfo;
  //화물차종
  dd07tCarCode: TableCodeInfo;
  //운송사
  tdlnrCode!: TableCodeInfo;
  //2차운송사
  tdlnr2Code!: TableCodeInfo;
  //출고사업장
  t001Code: CommonCodeInfo;
  //운송방법
  inco1Code: CommonCodeInfo;
  //차량번호(수정)
  zcarnoModiCode!: TableCodeInfo;
  /*Entery value 선언*/
  kunnrValue: string | null;
  kunnrValue2: string | null;
  maktValue: string | null;
  auartValue: string | null;
  vkausValue: string | null;
  zunloadValue: string | null;
  incoValue: string | null;
  lgortValue: string | null;
  tdlnrValue: string | null;
  tdlnr2Value!: string | null;
  zcarValue: string | null;
  vsbedValue: string | null;
  mvgr1Value!: string | null;
  mvgr2Value!: string | null;
  mvgr3Value!: string | null;
  augruValue!: string | null;
  //차량번호(수정)
  zcarnoModiValue!: string | null;
  sort: string[];

  //오더사유 입력가능., 불가능
  autruDisabled!: boolean;
  //셀렉트박스
  data2!: Data2[];
  products!: Product[];
  selectData2: string = "";
  //delete
  selectedItemKeys: any[] = [];

  //거래처
  clients: string[];
  //정보
  orderData: any;

  //날짜 조회
  startDate: any;
  endDate: any;

  //
  dataLoading: boolean = false;
  enteryLoading: boolean = false;


  //form

  labelMode: string;

  labelLocation: string;

  readOnly: boolean;

  showColon: boolean;

  minColWidth: number;

  colCount: number;

  width: any;
  ZDOFLG: any;
  popupData: any;

  popupTitle: string;

  addData: any;

  orderDataRow: any;

  auartFlag: boolean;
  nh!: boolean;
  auartFlag2: boolean;
  incoFilter: any = ["ZCM_CODE2", "<>", "NH"];


  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 저장 버튼
  saveButtonOptions: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //데이터 추가 버튼
  addButtonOptions: any;
  //데이터 참조추가 버튼
  RefaddButtonOptions: any;

  loadPanelOption: any;

  //편집 취소 버튼
  cancelEditButtonOptions: any;
  closeButtonOptions: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  collapsed: any;
  //줄 선택
  selectedRowIndex = -1;
  ;
  taxkData: any;

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;

  editFlag = false;
  saveVisible = true;
  popupVisible = false;
  //_dataService: ImateDataService;
  capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);


  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {


    appInfo.title = AppInfoService.APP_TITLE + " | 고객주문등록";


    this.sd007Code1 = appConfig.commonCode("주문구분");
    this.sd007Code2 = appConfig.commonCode("주문구분");
    this.sd007Code3 = appConfig.commonCode("주문구분");
    this.maCode = appConfig.tableCode("비료제품구분");
    this.maktCode = appConfig.tableCode("비료제품명");
    this.maktCode2 = appConfig.tableCode("비료제품명");
    this.kunnCode = appConfig.tableCode("비료납품처");
    /*this.kunnCode2 = appConfig.commonCode("비료고객번호");*/
    this.kunnCode2 = appConfig.tableCode("비료납품처");
    this.tvlvCode = appConfig.tableCode("RFC_용도");
    this.dd07tCode = appConfig.tableCode("RFC_하차정보");
    this.dd07tCarCode = appConfig.tableCode("화물차종");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.tdlnr2Code = appConfig.tableCode("운송업체");
    this.mvgr1Code = appConfig.tableCode("대분류");
    this.mvgr2Code = appConfig.tableCode("사업방식");
    this.mvgr3Code = appConfig.tableCode("계통구분");
    this.augruCode = appConfig.tableCode("오더사유");
/*    this.tdlnr2Code = appConfig.commonCode("운송사");*/
    this.t001Code = appConfig.commonCode("비료출고사업장");
    this.inco1Code = appConfig.commonCode("농협운송방법");
    this.zcarnoModiCode = appConfig.tableCode("비료차량");

    //if (this.selectData2 === "10") {

    //} else if (this.selectData2 === "20") {

    //} else if (this.selectData2 === "30") {

    //} else {

    //}
    this.selectData2 = "10";


    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.sd007Code1),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maktCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maktCode2),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnCode2),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tvlvCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.mvgr1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.mvgr2Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.mvgr3Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.augruCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnr2Code),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.t001Code),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.inco1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoModiCode),


    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    this.ZDOFLG = "X";
    this.kunnrValue = "";
    this.kunnrValue2 = "";
    this.maktValue = "";
    this.auartValue = "";
    this.zunloadValue = "";
    this.incoValue = "";
    this.lgortValue = "";
    this.tdlnrValue = "";
    this.tdlnr2Value = "";
    this.zcarValue = "";
    this.vsbedValue = "";
    this.vkausValue = "";
    this.mvgr1Value = "";
    this.mvgr2Value = "";
    this.mvgr3Value = "";
    this.augruValue = "";
    this.zcarnoModiValue = "";
    //form
    this.labelMode = 'floating';
    this.labelLocation = 'left';
    this.readOnly = false;
    this.showColon = true;
    this.auartFlag = true;
    this.nh = true;
    this.autruDisabled = true;
    this.auartFlag2 = false;
    this.minColWidth = 300;
    this.colCount = 2;
    let page = this;
    this.popupTitle = "";
    this.products = service.getProducts();
    let userInfo = authService.getUser().data;

    //정보
    this.data2 = service.getData2();
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")


    this.taxkData = new ArrayStore({
      data: this.products,
      key: 'ID',
    });
    //거래처
    this.clients = service.getclient();
    const that = this;
    //정보
    this.sort = service.getSort();
    let modelTest01 = this;

    //데이터 로딩 패널 보이기
    this.loadingVisible = true;

    this.loadPanelOption = { enabled: false };

    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $3000',
      value: ['PARAM9', '<', 3000],
    }, {
      text: '$3000 - $5000',
      value: [
        ['PARAM9', '>=', 3000],
        ['PARAM9', '<', 5000],
      ],
    }, {
      text: '$5000 - $10000',
      value: [
        ['PARAM9', '>=', 5000],
        ['PARAM9', '<', 10000],
      ],
    }, {
      text: '$10000 - $20000',
      value: [
        ['PARAM9', '>=', 10000],
        ['PARAM9', '<', 20000],
      ],
    }, {
      text: 'Greater than $20000',
      value: ['PARAM9', '>=', 20000],
    }];
    this.customOperations = [{
      name: 'weekends',
      caption: 'Weekends',
      dataTypes: ['date'],
      icon: 'check',
      hasValue: false,
      calculateFilterExpression() {
        return [[getOrderDay, '=', 0], 'or', [getOrderDay, '=', 6]];
      },
    }];


    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadPanelOption = { enabled: true };
        this.dataLoad();
      },
    };

    //팝업닫기
    this.closeButtonOptions = {
      text: '닫기',
      onClick(e: any) {

        that.popupVisible = false;

      },
    };

    //삭제버튼
    this.deleteButtonOptions = {
      icon: 'trash',
      onClick: () => {

        this.dataGrid.instance.deleteRow(this.selectedRowIndex)
      },
    };
    //저장버튼

    this.saveButtonOptions = {
      text: '저장',
      onClick: async () => {

        console.log(this.dxForm.instance.option('formData'));
        if (await confirm("저장하시겠습니까?", "알림")) { 
          this.loadingVisible2 = true;
        //this.dataGrid.instance.saveEditData();
        var result = await this.createOrder();
        this.loadingVisible2 = false;
        //var result2 = await this.detailDataLoad();
        //if (result2.E_RETURN.MVGR3 !== "1") {
        //  alert('검수처 코드와 계통구분이 일치하지 않습니다.', "알림");
        //  this.kunnrEntery.ClearSelectedValue();
        //  return;
          //}
          if (this.selectData2 === "10" || this.selectData2 === "40") {
            if (this.popupData.AVAILQTY < this.popupData.KWMENG) {
              alert(`주문가능량을 초과하였습니다.`, "알림");
              return;
            }
          }
        if (this.popupData.AUART === "Z400" || this.popupData.AUART === "Z410") {
          if (this.popupData.AUGRU === "") {
            alert('오더사유를 입력해주세요.', "알림");
            return;
          }
        }

        if (result.E_TYPESO === "E") {
          alert(`주문등록 실패,\n\n오류 메세지: ${result.E_MESSAGESO}`, "알림");
          return;
        } else if (result.E_TYPEDO === "E") {
          alert(`주문등록 실패,\n\n오류 메세지: ${result.E_MESSAGEDO}`, "알림");
          return;
        } else {
          alert("주문등록완료", "알림");
          this.popupVisible = false;
          this.dataLoad();
        }
      }
      },
    };
  }

  /**
 * 화면 종료
 * */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore(this.dataStoreKey);
  }


  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataLoad();

  }

  selectedChanged(e: any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }

  selectionChanged(data: any) {
    this.selectedItemKeys = data.selectedRowKeys;
  }

  getCompanySelectorLabelMode() {
    return this.labelMode === 'outside'
      ? 'hidden'
      : this.labelMode;
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };
  orderDBClick(e: any) {
    this.infoDataLoad("search");
    this.popupTitle = "주문조회";
    this.editFlag = true;
    //저장버튼 여부
    this.saveVisible = false;
    this.popupVisible = !this.popupVisible;
  }

  form_fieldDataChanged(e: any) {
    this.popupData = e.component.option("formData");
  }

  /* Entry Data Form에 바인딩 */
  //분할 차량번호 선택이벤트
  //onZcarno1CodeValueChanged(e: any) {
  //  setTimeout(() => {
  //    this.popupData.ZCARNO = e.selectedItem.ZCARNO;
  //    this.popupData.ZDRIVER = e.selectedItem.ZDRIVER;
  //    this.popupData.ZPHONE = e.selectedItem.ZPHONE;
  //    this.zcarValue = e.selectedItem.ZCARTYPE;
  //  });
  //}
  onKunnrCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.popupData.KUNNR = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 고객번호)
      this.loadingVisible2 = true;
      //유효성점검
      var result = await this.detailDataLoad();

      //if (this.selectData2 === "10" || this.selectData2 === "40")
      //{
      //  if (this.popupData.AUART !== "Z200") { 
      //  if (result.E_RETURN.MVGR3 !== "1") {
      //    alert('검수처 코드와 계통구분이 일치하지 않습니다.', "알림");
      //    this.kunnrEntery.ClearSelectedValue();
      //    return;
      //    }
      //  }
      //}
    });
  }
  onKunweCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.popupData.KUNWE = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 납품처)
      this.loadingVisible2 = true;

      //block 조건
      var result = await this.detailDataLoad();
      if (result.E_RETURN.BLOCK === "X" && result.E_RETURN.AVAILCHECK !== "Y") {     //블락x면 입력불가
        this.auartFlag2 = true;
      }
      else if (result.E_RETURN.UNBLOCK === "X") {  //언블락x면 입력가능
        this.auartFlag2 = false;
      }
      else if (result.E_RETURN.UNBLOCK === "" && this.popupData.REVQTY !== 0) {  //언블락이 공백이고 예약수량이면 예약수량-출고수량만큼 입력가능
        this.auartFlag2 = false;
        this.popupData.possible = (this.popupData.REVQTY - this.popupData.ACTQTY)
      }

      else if (result.E_RETURN.AVAILCHECK === "Y") {      //점검대상여부가 Y면 예약수량-출고수량 이랑 가용수량 중 더 작은값 이하로 입력가능
        this.auartFlag2 = false;
        if ((this.popupData.REVQTY - this.popupData.GIOTY) < this.popupData.AVAILQTY) {
          this.popupData.possible = this.popupData.REVQTY - this.popupData.GIOTY
        }
        else {
          this.popupData.possible=this.popupData.AVAILQTY
        }
      }
    });
  }
  onMatnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.MATNR = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 자재)
      //if (this.popupData.MATNR !== "" && this.popupData.AVAILQTY == "") {
      //  alert("주문 가능량이 없는 제품입니다.","알림");
      //  this.maktEntery2.ClearSelectedValue();
      //}
      this.loadingVisible2 = true;
      this.detailDataLoad();
    }); 
  }

  onMvgr1CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.MVGR1 = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 자재)
      this.loadingVisible2 = true;

    });
  }
  onMvgr2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.MVGR2 = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 자재)
      this.loadingVisible2 = true;

    });
  }
  onMvgr3CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.MVGR3 = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 자재)
      this.loadingVisible2 = true;

    });
  }
  onAugruCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.AUGRU = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 자재)
      this.loadingVisible2 = true;
      this.detailDataLoad();
    });
  }

  onValueChanged(e: any) {
    if (this.selectData2 === "10" || this.selectData2 === "40") {
      this.popupData.TAXK1 = e.value;
    }
  }


  onData2ValueChanged(e: any) {
    this.selectData2 = e.value;
    //비료
    if (this.selectData2 === "10") {
      this.sd007Entery1.ChangeCodeInfo(this.appConfig.commonCode("주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
      this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("비료제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "제품구분")
      this.maktEntery.ChangeCodeInfo(this.appConfig.tableCode("비료제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      this.sd007Entery2.ChangeCodeInfo(this.appConfig.commonCode("주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
      this.maktEntery2.ChangeCodeInfo(this.appConfig.tableCode("비료제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처")
      this.kunnEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처")
      this.t001Entery.ChangeCodeInfo(this.appConfig.commonCode("비료출고사업장"), "KUNNR", "%NAME1%(%KUNNR%)", "출고사업장")
      this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "", "%ZCARNO%", "차량")
      this.ZDOFLG = "X";
    }

    //화학
    else if (this.selectData2 === "20") {
      this.sd007Entery1.ChangeCodeInfo(this.appConfig.commonCode("액상주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
      this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("액상제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "제품구분")
      this.maktEntery.ChangeCodeInfo(this.appConfig.tableCode("액상제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      this.sd007Entery2.ChangeCodeInfo(this.appConfig.commonCode("액상주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
      this.maktEntery2.ChangeCodeInfo(this.appConfig.tableCode("액상제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("액상납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처")
      this.kunnEntery.ChangeCodeInfo(this.appConfig.tableCode("액상납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처")
      this.t001Entery.ChangeCodeInfo(this.appConfig.commonCode("액상출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장")
      this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "", "%ZCARNO%", "차량")
      this.ZDOFLG = "";
      return;
    }
    //유류
    else if (this.selectData2 === "30") {
      this.sd007Entery1.ChangeCodeInfo(this.appConfig.commonCode("유류주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
      this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("유류제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "제품구분")
      this.maktEntery.ChangeCodeInfo(this.appConfig.tableCode("유류제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      this.sd007Entery2.ChangeCodeInfo(this.appConfig.commonCode("유류주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
      this.maktEntery2.ChangeCodeInfo(this.appConfig.tableCode("유류제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("유류납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처")
      this.kunnEntery.ChangeCodeInfo(this.appConfig.tableCode("유류납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처")
      this.t001Entery.ChangeCodeInfo(this.appConfig.commonCode("유류출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장")
      this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "", "%ZCARNO%", "차량")
      this.ZDOFLG = "";
      return;
    }

    //친환경
    else if (this.selectData2 === "40") {
      this.sd007Entery1.ChangeCodeInfo(this.appConfig.commonCode("친환경주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
      this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "제품구분")
      this.maktEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      this.sd007Entery2.ChangeCodeInfo(this.appConfig.commonCode("친환경주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
      this.maktEntery2.ChangeCodeInfo(this.appConfig.tableCode("친환경제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
      this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처")
      this.kunnEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처")
      this.t001Entery.ChangeCodeInfo(this.appConfig.commonCode("친환경출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장")
      this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "", "%ZCARNO%", "차량")
      this.ZDOFLG = "X";
      return;
    }
  }

  onAuartCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.AUART = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 주문유형)
      this.loadingVisible2 = true;
      this.detailDataLoad();

      this.augruEntery.ClearSelectedValue();
      if (this.popupData.AUART === "Z410") {
        this.autruDisabled = false;
      }
      else {
        this.autruDisabled = true;
      }

      if (this.selectData2 === "10") {
        if (e.selectedValue.startsWith('Z1')) {

        //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");

        ////안내문
        //  alert(`주문처목록을 재설정 했습니다.`, "알림");
/*          this.kunnrEntery.setSelectedValue("0000102957");*/
          this.kunnrValue2 = "0000102957";
          this.popupData.KUNNR = this.kunnrValue2;
          
        ////edit막고
        //this.auartFlag = true;
        ////기본값 넣어주고
        //this.kunnrValue2 = "0000100028";
        //임시로직
        /*this.popupData.KUNNR = this.kunnrValue2;*/

        //2번rfc조회
        /*this.detailDataLoad();*/
        this.nh = true;
      } else if (e.selectedValue.startsWith('Z2')) {
          this.auartFlag = false;
          this.kunnrEntery.ClearSelectedValue();
        //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");
        //alert(`주문처를 직접 설정해주세요.`, "알림");
/*        this.nh = false;*/
      }
      else {
        this.auartFlag = false;
        //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");
        //alert(`주문처를 직접 설정해주세요.`, "알림");
          /*        this.nh = true;*/
          this.kunnrValue2 = "0000102957";
          this.popupData.KUNNR = this.kunnrValue2;
        }
      }

      if (this.selectData2 === "40") {
        if (e.selectedValue.startsWith('Z1')) {
          //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");

          ////안내문
          //alert(`주문처목록을 재설정 했습니다.`, "알림");
          this.kunnrValue2 = "0000102958";
          this.popupData.KUNNR = this.kunnrValue2;
          ////edit막고
          //this.auartFlag = true;
          ////기본값 넣어주고
          //this.kunnrValue2 = "0000100028";
          //임시로직
          /*this.popupData.KUNNR = this.kunnrValue2;*/

          //2번rfc조회
          /*this.detailDataLoad();*/
          this.nh = true;
        } else if (e.selectedValue.startsWith('Z2')) {
          this.auartFlag = false;
          this.kunnrEntery.ClearSelectedValue();
          //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");
          //alert(`주문처를 직접 설정해주세요.`, "알림");
          /*        this.nh = false;*/
        }
        else {
          this.auartFlag = false;
          //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");
          //alert(`주문처를 직접 설정해주세요.`, "알림");
          /*        this.nh = true;*/
                    this.kunnrValue2 = "0000102958";
          this.popupData.KUNNR = this.kunnrValue2;
        }
      }

      if (this.selectData2 === "10" || this.selectData2 === "40") {
      if (e.selectedValue.startsWith('Z2')) {
        this.nh = false;
      }
      else {
        this.nh = true;
        }
      }

    }, 100);
  }
  onTvlvCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.VKAUS = e.selectedValue;
    });
  }
  onZunloadCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.ZUNLOAD = e.selectedValue;
    });
  }
  onLgortCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.LGORT = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 저장위치)
      this.loadingVisible2 = true;
      this.detailDataLoad();
    });
  }
  onTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.TDLNR = e.selectedValue;
    });
  }
  onTdlnr2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.TDLNR2 = e.selectedValue;
    });
  }
  //onTdlnr2CodeValueChanged(e: any) {
  //  setTimeout(() => {
  //    this.popupData.TDLNR2 = e.selectedValue;
  //  });
  //}
  onZcartypeCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.ZCARTYPE = e.selectedValue;
    });
  }
  onVsbedCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.VSBED = e.selectedValue;
    });
  }
  onIncoCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.INCO1 = e.selectedValue;
    });
  }




  //고객주문리스트 조회 RFC
  public async dataLoad() {
    this.dataLoading = false;
    var zps5000Model = new ZSDS5000Model("", "", this.startDate, this.endDate, this.selectData2, this.sd007Entery1.selectedValue ? this.sd007Entery1.selectedValue : "", this.maEntery.selectedValue ? this.maEntery.selectedValue : "", this.maktEntery.selectedValue ? this.maktEntery.selectedValue : "");
    var modelList: ZSDS5001Model[] = [];
    var zpsModel = new ZSDEPSOListModel(zps5000Model, modelList);

    var zps500List: ZSDEPSOListModel[] = [zpsModel];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOListModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOListModelList", zps500List, QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "MATNR"],
        data: resultModel[0].E_RETURN
      });

    this.dataLoading = true;

    if (this.dataLoading == true && this.enteryLoading == true) {
      this.loadingVisible = false;
    }

  }

  //고객주문 정보 조회 RFC
  public async infoDataLoad(flag: string) {

    this.clearEntery();

    var selectData = this.dataGrid.instance.getSelectedRowsData();


    var zsd3013Model = new ZSDS3013Model(selectData[0].KUNNR, selectData[0].KUNWE, this.selectData2, selectData[0].MATNR, selectData[0].AUART, selectData[0].LGORT);
    var zsd3014Model = new ZSDS3014Model("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0, 0, 0, "", 0, "", "");


    var zsdModel = new ZSDEPSOENTRYInfoModel(zsd3014Model, zsd3013Model);
    var zsdList: ZSDEPSOENTRYInfoModel[] = [zsdModel];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOENTRYInfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOENTRYInfoModelList", zsdList, QueryCacheType.None);
    var allData = Object.assign(selectData[0], resultModel[0].E_RETURN);

    if (flag == "add") {
      allData.VBELN = "";
    }

    this.kunnrValue = allData.KUNWE;
    this.kunnrValue2 = allData.KUNNR;
    this.maktValue = allData.MATNR;
    this.auartValue = allData.AUART;
    this.zunloadValue = allData.ZUNLOAD;
    this.incoValue = allData.INCO1;
    this.lgortValue = allData.LGORT;
    this.tdlnrValue = allData.TDLNR;
   this.tdlnr2Value = allData.TDLNR2;
    this.zcarValue = allData.ZCARTYPE;
    this.vsbedValue = allData.VSBED;
    this.mvgr1Value = allData.MVGR1_N;
    this.mvgr2Value = allData.MVGR2_N;
    this.mvgr3Value = allData.MVGR3_N;
    this.augruValue = allData.AUGRU;
    this.orderData = allData;
    this.popupData = allData;
  }

  //고객주문 정보 조회 RFC
  public async detailDataLoad() {
    var selectData = this.popupData;

    var zsd3013Model = new ZSDS3013Model(selectData.KUNNR, selectData.KUNWE, this.selectData2, selectData.MATNR, selectData.AUART, selectData.LGORT);
    var zsd3014Model = new ZSDS3014Model("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0, 0, 0, "", 0, "", "");

    var zsdModel = new ZSDEPSOENTRYInfoModel(zsd3014Model, zsd3013Model);
    var zsdList: ZSDEPSOENTRYInfoModel[] = [zsdModel];

    
    //if (selectData.KUNNR === "" || selectData.KUNWE === "" || selectData.MATNR === "" || selectData.AUART === "") {
    //  return zsdList[0];
    //}
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOENTRYInfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOENTRYInfoModelList", zsdList, QueryCacheType.None);

    var allData = Object.assign(this.popupData, resultModel[0].E_RETURN);

    this.popupData = allData;
    this.popupData.AVAILQTY = Math.floor(parseInt(this.popupData.AVAILQTY));
    this.mvgr3Value = allData.MVGR3;
    this.mvgr2Value = allData.MVGR2;
    this.mvgr1Value = allData.MVGR1;
    this.loadingVisible2 = false;
    return resultModel[0];
  }

  // 주문생성
  public async createOrder() {
    var data = this.popupData;
    let fixData = { VKORG: "1000", VTWEG: "10",ZLOGFLG: "X", POSNR: "10", WERKS: "1000"/*, TAXK1: "2"*/ };
    
    let userInfo = this.authService.getUser().data; // 나중에 고객번호 가져올때 사용(업무포탈도)
    var zsds3100Model = new ZSDS3100Model(data.AUART, fixData.VKORG, fixData.VTWEG, this.selectData2, "", data.AUGRU, "", data.VDATU, new Date, data.KUNNR, "", data.KUNWE, data.TDLNR, data.TDLNR2, data.INCO1, "", "", this.popupData.TAXK1, "", "", "", data.ZCARTYPE, data.ZCARNO, data.ZDRIVER, data.ZPHONE, data.ZUNLOAD, fixData.ZLOGFLG, this.ZDOFLG, "", "", "", "");
    var zsds6001Model = new ZSDS6001Model(fixData.POSNR, data.MATNR, data.KWMENG, "", fixData.WERKS, data.LGORT, 0, 0, "", data.VKAUS, data.MVGR1, data.MVGR2, data.MVGR3);
    var zsds6002Model = new ZSDS6002Model(data.TEXT);

    var zsds6001List: ZSDS6001Model[] = [zsds6001Model];
    var zsds6002List: ZSDS6002Model[] = [zsds6002Model];

    var createModel = new ZSDCREATESODoModel("", "", "", "", "", "", zsds3100Model, zsds6001List, zsds6002List);
    var createModelList: ZSDCREATESODoModel[] = [createModel];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDCREATESODoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDCREATESODoModelList", createModelList, QueryCacheType.None);
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
    if (this.loadePeCount >= 19) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      this.enteryLoading = false;
 /*     this.dataLoad();*/

    }
  }
  addOrder(e: any) {

    if (this.selectData2 === "20" || this.selectData2 ==="30") {
       this.nh = false;
    }

    var model1 = new ZSDS3100Model("", "", "", "", "", "", "", new Date, new Date, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
    var model2 = new ZSDS6001Model("", "", 0, "", "", "", 0, 0, "", "", "", "", "");
    var model3 = new ZSDS6002Model("");


    var initData = Object.assign(model1, model2);
    initData = Object.assign(initData, model3);


    this.popupData = initData;
    console.log(this.popupData);

    //this.dxForm.instance.resetValues();
    this.popupTitle = "주문등록/수정";
    this.editFlag = false;
    this.auartFlag = false;

    this.saveVisible = true;
    this.loadingVisible = true;
    this.popupVisible = !this.popupVisible;
    
    this.clearEntery();

  }

  public clearEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    this.sd007Entery2.ClearSelectedValue();
    //this.sd007Entery3.ClearSelectedValue();
    this.maktEntery2.ClearSelectedValue();
    this.kunnEntery.ClearSelectedValue();
    this.dd07tEntery.ClearSelectedValue();
    this.dd07tCarEntery.ClearSelectedValue();
    this.tdlnrEntery.ClearSelectedValue();
    this.tdlnr2Entery.ClearSelectedValue();
    this.t001Entery.ClearSelectedValue();
    this.kunnrEntery.ClearSelectedValue();
    this.incoEntery.ClearSelectedValue();
    this.tvlvEntery.ClearSelectedValue();
    this.mvgr1Entery.ClearSelectedValue();
    this.mvgr2Entery.ClearSelectedValue();
    this.mvgr3Entery.ClearSelectedValue();
    this.augruEntery.ClearSelectedValue();
    this.zcarnoModiCodeEntery.ClearSelectedValue();
  }
  refAddOrder(e: any) {

    // 2022.10.31 참조추가 버튼 관련
    // 조회된 데이터를 팝업으로 넘겨줄때 파서블엔트리에 데이터를 바인딩 할 수 있도록 현재 엔트리html, cs 작업중 ( 공통적으로 )
    // 수정완료 시 정상적으로 엔트리에 값을 바인딩 시켜줄 예정 (현재는 정상작동이 안되서 화면에 데이터가 안뿌려짐)

    this.infoDataLoad("add");

    this.popupTitle = "주문등록/수정";
    this.editFlag = false;
    this.saveVisible = true;
    this.loadingVisible = true;
    this.popupVisible = !this.popupVisible;
    this.popupData.VBELN = "";
  }

  saveOrder(e: any) {
  }


}
