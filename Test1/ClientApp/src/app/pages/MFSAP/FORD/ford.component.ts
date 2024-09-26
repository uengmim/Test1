import { NgModule, Component, enableProdMode, ViewChild, ChangeDetectionStrategy } from '@angular/core';
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
import { ZSDT1100Model } from '../../../shared/dataModel/MFSAP/zsdt1100';
import { deepCopy } from '../../../shared/imate/utility/object-copy';
import { Title } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import { Table } from 'exceljs';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import saveAs from 'file-saver';
/*고객주문등록 Component*/

const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'ford.component.html',
  providers: [ImateDataService, Service]
})

export class FORDComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('sd007Entery1', { static: false }) sd007Entery1!: CommonPossibleEntryComponent;
  @ViewChild('sd007Entery2', { static: false }) sd007Entery2!: CommonPossibleEntryComponent;
  @ViewChild('sd007Entery3', { static: false }) sd007Entery3!: CommonPossibleEntryComponent;
  @ViewChild('maEntery', { static: false }) maEntery!: CommonPossibleEntryComponent;
  @ViewChild('kunnrEntery', { static: false }) kunnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('kunnrEntery2', { static: false }) kunnrEntery2!: CommonPossibleEntryComponent;
  @ViewChild('kunnrEntery3', { static: false }) kunnrEntery3!: CommonPossibleEntryComponent;
  @ViewChild('maktEntery', { static: false }) maktEntery!: CommonPossibleEntryComponent;
  @ViewChild('maktEntery2', { static: false }) maktEntery2!: CommonPossibleEntryComponent;
  @ViewChild('kunnEntery', { static: false }) kunnEntery!: CommonPossibleEntryComponent;
  @ViewChild('tvlvEntery', { static: false }) tvlvEntery!: CommonPossibleEntryComponent;
  @ViewChild('dd07tEntery', { static: false }) dd07tEntery!: CommonPossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr2Entery', { static: false }) tdlnr2Entery!: CommonPossibleEntryComponent;
  @ViewChild('mvgr1Entery', { static: false }) mvgr1Entery!: CommonPossibleEntryComponent;
  @ViewChild('mvgr2Entery', { static: false }) mvgr2Entery!: CommonPossibleEntryComponent;
  @ViewChild('zpalEntery', { static: false }) zpalEntery!: CommonPossibleEntryComponent;
  @ViewChild('mvgr3Entery', { static: false }) mvgr3Entery!: CommonPossibleEntryComponent;
  @ViewChild('augruEntery', { static: false }) augruEntery!: CommonPossibleEntryComponent;
  /*  @ViewChild('tdlnr2Entery', { static: false }) tdlnr2Entery!: CommonPossibleEntryComponent;*/
  @ViewChild('t001Entery', { static: false }) t001Entery!: CommonPossibleEntryComponent;
  @ViewChild('incoEntery', { static: false }) incoEntery!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoModiCodeEntery', { static: false }) zcarnoModiCodeEntery!: CommonPossibleEntryComponent;
  /*참조추가엔트리*/
  @ViewChild('sd007Entery2B', { static: false }) sd007Entery2B!: CommonPossibleEntryComponent;
  @ViewChild('maktEntery2B', { static: false }) maktEntery2B!: CommonPossibleEntryComponent;
  @ViewChild('kunnrEnteryB', { static: false }) kunnrEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('kunnEnteryB', { static: false }) kunnEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('t001EnteryB', { static: false }) t001EnteryB!: CommonPossibleEntryComponent;
  @ViewChild('tvlvEnteryB', { static: false }) tvlvEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('dd07tEnteryB', { static: false }) dd07tEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('zpalEnteryB', { static: false }) zpalEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('incoEnteryB', { static: false }) incoEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoModiCodeEnteryB', { static: false }) zcarnoModiCodeEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEnteryB', { static: false }) tdlnrEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr2EnteryB', { static: false }) tdlnr2EnteryB!: CommonPossibleEntryComponent;
  @ViewChild('dd07tCarEnteryB', { static: false }) dd07tCarEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('augruEnteryB', { static: false }) augruEnteryB!: CommonPossibleEntryComponent;
  @ViewChild('mvgr2EnteryB', { static: false }) mvgr2EnteryB!: CommonPossibleEntryComponent;
  @ViewChild('mvgr3EnteryB', { static: false }) mvgr3EnteryB!: CommonPossibleEntryComponent;
  @ViewChild('mvgr1EnteryB', { static: false }) mvgr1EnteryB!: CommonPossibleEntryComponent;
  /*상세조회*/
  @ViewChild('sd007Entery2A', { static: false }) sd007Entery2A!: CommonPossibleEntryComponent;
  @ViewChild('maktEntery2A', { static: false }) maktEntery2A!: CommonPossibleEntryComponent;
  @ViewChild('kunnrEnteryA', { static: false }) kunnrEnteryA!: CommonPossibleEntryComponent;
  @ViewChild('kunnEnteryA', { static: false }) kunnEnteryA!: CommonPossibleEntryComponent;
  @ViewChild('t001EnteryA', { static: false }) t001EnteryA!: CommonPossibleEntryComponent;
  @ViewChild('tvlvEnteryA', { static: false }) tvlvEnteryA!: CommonPossibleEntryComponent;
  @ViewChild('dd07tEnteryA', { static: false }) dd07tEnteryA!: CommonPossibleEntryComponent;
  @ViewChild('incoEnteryA', { static: false }) incoEnteryA!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoModiCodeEnteryA', { static: false }) zcarnoModiCodeEnteryA!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEnteryA', { static: false }) tdlnrEnteryA!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr2EnteryA', { static: false }) tdlnr2EnteryA!: CommonPossibleEntryComponent;
  @ViewChild('dd07tCarEnteryA', { static: false }) dd07tCarEnteryA!: CommonPossibleEntryComponent;
  @ViewChild('augruEnteryA', { static: false }) augruEnteryA!: CommonPossibleEntryComponent;
  @ViewChild('mvgr2EnteryA', { static: false }) mvgr2EnteryA!: CommonPossibleEntryComponent;
  @ViewChild('mvgr3EnteryA', { static: false }) mvgr3EnteryA!: CommonPossibleEntryComponent;
  @ViewChild('mvgr1EnteryA', { static: false }) mvgr1EnteryA!: CommonPossibleEntryComponent;


  orderPossible!: string;

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
  //파레트유형
  zpalCode!: TableCodeInfo;
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

  //참조추가용 운송방법
  refInco1Code: TableCodeInfo;

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
  zpalValue!: string | null;

  auartValueA: string | null;
  maktValueA: string | null;
  kunnrValue2A: string | null;
  kunnrValueA: string | null;
  lgortValueA: string | null;
  vkausValueA: string | null;
  zunloadValueA: string | null;
  incoValueA: string | null;
  zcarnoModiValueA: string | null;
  tdlnrValueA: string | null;
  tdlnr2ValueA: string | null;
  zcarValueA: string | null;
  augruValueA: string | null;
  mvgr2ValueA: string | null;
  mvgr3ValueA: string | null;
  mvgr1ValueA: string | null;

  auartValueB: string | null;
  maktValueB: string | null;
  kunnrValue2B: string | null;
  kunnrValueB: string | null;
  lgortValueB: string | null;
  vkausValueB: string | null;
  zunloadValueB: string | null;
  incoValueB: string | null;
  zcarnoModiValueB: string | null;
  tdlnrValueB: string | null;
  tdlnr2ValueB: string | null;
  zcarValueB: string | null;
  augruValueB: string | null;
  mvgr2ValueB: string | null;
  mvgr3ValueB: string | null;
  mvgr1ValueB: string | null;
  zpalValueB!: string | null;
  taxkValue: any;
  //차량번호(수정)
  zcarnoModiValue!: string | null;
  sort: string[];
  selectGridData: any;
  //오더사유 입력가능., 불가능
  autruDisabled!: boolean;
  volume!: boolean;
  //셀렉트박스
  data2!: Data2[];
  products!: Product[];

  selectData2: string = "";
  //delete
  selectedItemKeys: any[] = [];
  taxk1!: string;
  //거래처
  clients: string[];
  //정보
  orderData: any;

  //농협정보 더블클릭시 수정 불가능
  nh2: boolean = false;
  nh3: boolean = false;
  //날짜 조회
  startDate: any;
  endDate: any;
  popupData2: any;
  excelButtonOptions: any;

  //
  dataLoading: boolean = false;
  enteryLoading: boolean = false;

  saveFlag = false;

  //form

  labelMode: string;

  labelLocation: string;

  readOnly: boolean;

  showColon: boolean;

  minColWidth: number;

  colCount: number;

  width: any;
  ZDOFLG: string;
  popupData: any;
  popupData3: any;
  popupTitle: string;

  addData: any;

  orderDataRow: any;
  kunnrAbled: boolean;
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
  saveButtonOptions3: any;
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
  closeButtonOptions2: any;
  closeButtonOptions3: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  collapsed: any;
  //줄 선택
  selectedRowIndex = -1;
  ;
  taxkData: Product[] = [];
  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;
  editFlag = false;
  saveVisible = true;
  popupVisible = false;
  popupVisible2 = false;
  popupVisible3 = false;
  //_dataService: ImateDataService;
  capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

  refInitStat = "";

  empid: string = "";
  rolid: string[] = [];
  userid: string = "";
  username: string = "";
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";

  //참조추가 진입 구분
  refInFlag = false;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo,
    private authService: AuthService, private titleService: Title, private cdr: ChangeDetectorRef) {

    //로그인 사용자 정보
    let usrInfo = authService.getUser().data;
    this.rolid = usrInfo.role;
    //this.empid = usrInfo.empId.padStart(10, '0');

    this.userid = usrInfo.userId;
    this.username = usrInfo.userName;
    this.vorgid = usrInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = usrInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = usrInfo.orgOption.torgid.padStart(10, '0');
    this.empid = this.corgid;

    appInfo.title = AppInfoService.APP_TITLE + " | 고객주문등록";
    this.titleService.setTitle(appInfo.title);

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
    this.zpalCode = appConfig.tableCode("RFC_파레트유형");

    this.refInco1Code = appConfig.tableCode("인코텀스");
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
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),

      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.refInco1Code),
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
    this.zpalValue = "";
    this.zcarValue = "";
    this.vsbedValue = "";
    this.vkausValue = "";
    this.mvgr1Value = "";
    this.mvgr2Value = "";
    this.mvgr3Value = "";
    this.augruValue = "";
    this.zcarnoModiValue = "";
    this.taxk1 = "2";
    this.taxkValue = "";
    this.auartValueA = "";
    this.maktValueA = "";
    this.kunnrValue2A = "";;
    this.kunnrValueA = "";;
    this.lgortValueA = "";
    this.vkausValueA = "";
    this.zunloadValueA = "";
    this.incoValueA = "";
    this.zcarnoModiValueA = "";
    this.tdlnrValueA = "";
    this.tdlnr2ValueA = "";
    this.zcarValueA = "";
    this.augruValueA = "";
    this.mvgr2ValueA = "";
    this.mvgr3ValueA = "";
    this.mvgr1ValueA = "";

    this.zpalValueB = "";
    this.auartValueB = "";
    this.maktValueB = "";
    this.kunnrValue2B = "";;
    this.kunnrValueB = "";;
    this.lgortValueB = "";
    this.vkausValueB = "";
    this.zunloadValueB = "";
    this.incoValueB = "";
    this.zcarnoModiValueB = "";
    this.tdlnrValueB = "";
    this.tdlnr2ValueB = "";
    this.zcarValueB = "";
    this.augruValueB = "";
    this.mvgr2ValueB = "";
    this.mvgr3ValueB = "";
    this.mvgr1ValueB = "";

    //form
    this.labelMode = 'floating';
    this.labelLocation = 'left';
    this.readOnly = false;
    this.showColon = true;
    this.auartFlag = true;
    this.kunnrAbled = false;
    this.nh = true;
    this.autruDisabled = true;
    this.volume = true;
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
    this.startDate = formatDate(now.setDate(now.getDate() - 2), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")


    this.taxkData = this.products;

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
        this.loadingVisible = true;
        this.cdr.detectChanges();
        this.loadPanelOption = { enabled: true };
        await this.dataLoad();
        this.loadingVisible = false;
      },
    };

    //팝업닫기
    this.closeButtonOptions = {
      text: '닫기',
      onClick: async () => {

        that.popupVisible = false;
        that.popupData = [];
        this.cdr.detectChanges();
        /*this.dataLoad();*/
      },
    };

    //엑셀다운로드
    this.excelButtonOptions = {
      text: "엑셀다운로드",
      onClick: async (e: any) => {
        this.onExportingOrderData(e);
      }
    };

    //팝업닫기
    this.closeButtonOptions2 = {
      text: '닫기',
      onClick: async () => {

        that.popupVisible2 = false;
        that.popupData2 = [];
        this.cdr.detectChanges();
        /*this.dataLoad();*/
      },
    };

    //팝업닫기
    this.closeButtonOptions3 = {
      text: '닫기',
      onClick: async () => {

        that.popupVisible3 = false;
        that.popupData3 = [];
        this.cdr.detectChanges();
        /*this.dataLoad();*/
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
        try {
          if (this.saveFlag === true) {
            return;
          }

          this.saveFlag = true;

          console.log(this.dxForm.instance.option('formData'));
          this.loadingVisible2 = true;
          this.cdr.detectChanges();
          //this.dataGrid.instance.saveEditData();

          var info = await this.checkDetailDataLoad();

          //var result2 = await this.detailDataLoad();
          //if (result2.E_RETURN.MVGR3 !== "1") {
          //  alert('검수처 코드와 계통구분이 일치하지 않습니다.', "알림");
          //  this.kunnrEntery.ClearSelectedValue();
          //  return;
          //}
          if (this.popupData.AUART === "" || this.popupData.AUART === null) {
            alert(`필수 필드(주문구분) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData.MATNR === "" || this.popupData.MATNR === null) {
            alert(`필수 필드(제품명) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData.KUNNR === "" || this.popupData.KUNNR === null) {
            alert(`필수 필드(주문처) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData.VDATU === "" || this.popupData.VDATU === null || this.popupData.VDATU === undefined) {
            alert(`필수 필드(출하요청일) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData.KUNWE === "" || this.popupData.KUNWE === null) {
            alert(`필수 필드(도착지) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData.LGORT === "" || this.popupData.LGORT === null) {
            alert(`필수 필드(출고사업장) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData.KWMENG === "" || this.popupData.KWMENG === 0 || this.popupData.KWMENG === null) {
            alert(`필수 필드(주문수량) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if ((this.selectData2 !== "30" && this.popupData.VKAUS === "") || (this.selectData2 !== "30" && this.popupData.VKAUS === null)) {
            alert(`필수 필드(용도구분) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData.INCO1 === "" || this.popupData.INCO1 === null) {
            alert(`필수 필드(운송방법) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData.TDLNR === "" || this.popupData.TDLNR === null) {
            alert(`필수 필드(1차 운송사) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if ((this.nh === true && this.popupData.MVGR2 === "") || (this.nh === true && this.popupData.MVGR2 === null)) {
            alert(`필수 필드(사업방식) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if ((this.nh === true && this.popupData.MVGR3 === "") || (this.nh === true && this.popupData.MVGR3 === null)) {
            alert(`필수 필드(계통구분) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if ((this.nh === true && this.popupData.MVGR1 === "") || (this.nh === true && this.popupData.MVGR1 === null)) {
            alert(`필수 필드(대분류) 입력이 누락되었습니다.`, "알림");
            return;
          }
          //else if ((this.nh === true && this.popupData.TAXK1 === "") || (this.nh === true && this.popupData.TAXK1 === null)) {
          //  alert(`필수 필드(세무구분) 입력이 누락되었습니다.`, "알림");
          //  return;
          //}



          if (this.popupData.AUART === "Z400" || this.popupData.AUART === "Z410") {
            if (this.popupData.AUGRU === "") {
              alert('필수 필드(오더사유) 입력이 누락되었습니다.', "알림");
              return;
            }
          }

          //주문가능량 계산


          if (info.E_RETURN.AVAILCHECK !== "N") {
            if (this.popupData.orderPossible !== "") {
              if (this.popupData.orderPossible < this.popupData.KWMENG) {
                alert(`주문가능량을 초과하였습니다.`, "알림");
                return;
              }
            }

            if (info.E_RETURN.STOCKQTY < this.popupData.KWMENG && (this.popupData.AUART !== "Z410" && this.popupData.AUART !== "Z130")) {
              alert(`가용재고량을 초과하였습니다.`, "알림");
              return;
            }
          }

          var result = await this.createOrder();
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

        } catch (error) {
          alert(`주문등록 실패,\n\n오류 메세지: ${error.message}`, "오류");
        } finally {
          this.loadingVisible2 = false;
          this.saveFlag = false;
          this.cdr.detectChanges();
        }
      },
    };

    this.saveButtonOptions3 = {
      text: '저장',
      onClick: async () => {
        try {
          if (this.saveFlag === true) {
            return;
          }

          this.saveFlag = true;

          this.loadingVisible2 = true;
          this.cdr.detectChanges();
          //this.dataGrid.instance.saveEditData();

          //var result2 = await this.detailDataLoad();
          //if (result2.E_RETURN.MVGR3 !== "1") {
          //  alert('검수처 코드와 계통구분이 일치하지 않습니다.', "알림");
          //  this.kunnrEntery.ClearSelectedValue();
          //  return;
          //}

          var info = await this.checkDetailDataLoad2();

          if (info.E_RETURN.AVAILCHECK !== "N") {
            if (this.popupData3.orderPossible !== "") {
              if (this.popupData3.orderPossible < this.popupData3.KWMENG) {
                alert(`주문가능량을 초과하였습니다.`, "알림");
                return;
              }
            }

            if (info.E_RETURN.STOCKQTY < this.popupData3.KWMENG && (this.popupData3.AUART !== "Z410" && this.popupData3.AUART !== "Z130")) {
              alert(`가용재고량을 초과하였습니다.`, "알림");
              return;
            }
          }



          if (this.popupData3.AUART === "" || this.popupData3.AUART === null) {
            alert(`필수 필드(주문구분) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData3.MATNR === "" || this.popupData3.MATNR === null) {
            alert(`필수 필드(제품명) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData3.KUNNR === "" || this.popupData3.KUNNR === null) {
            alert(`필수 필드(주문처) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData3.VDATU === "" || this.popupData3.VDATU === null || this.popupData3.VDATU === undefined) {
            alert(`필수 필드(출하요청일) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData3.KUNWE === "" || this.popupData3.KUNWE === null) {
            alert(`필수 필드(도착지) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData3.LGORT === "" || this.popupData3.LGORT === null) {
            alert(`필수 필드(출고사업장) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData3.KWMENG === "" || this.popupData3.KWMENG === 0 || this.popupData3.KWMENG === null) {
            alert(`필수 필드(주문수량) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if ((this.selectData2 !== "30" && this.popupData3.VKAUS === "") || (this.selectData2 !== "30" && this.popupData3.VKAUS === null)) {
            alert(`필수 필드(용도구분) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData3.INCO1 === "" || this.popupData3.INCO1 === null) {
            alert(`필수 필드(운송방법) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if (this.popupData3.TDLNR === "" || this.popupData3.TDLNR === null) {
            alert(`필수 필드(1차 운송사) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if ((this.nh === true && this.popupData3.MVGR2 === "") || (this.nh === true && this.popupData3.MVGR2 === null)) {
            alert(`필수 필드(사업방식) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if ((this.nh === true && this.popupData3.MVGR3 === "") || (this.nh === true && this.popupData3.MVGR3 === null)) {
            alert(`필수 필드(계통구분) 입력이 누락되었습니다.`, "알림");
            return;
          }
          else if ((this.nh === true && this.popupData3.MVGR1 === "") || (this.nh === true && this.popupData3.MVGR1 === null)) {
            alert(`필수 필드(대분류) 입력이 누락되었습니다.`, "알림");
            return;
          }
          //else if ((this.nh === true && this.popupData.TAXK1 === "") || (this.nh === true && this.popupData.TAXK1 === null)) {
          //  alert(`필수 필드(세무구분) 입력이 누락되었습니다.`, "알림");
          //  return;
          //}

          if (this.popupData3.AUART === "Z400" || this.popupData3.AUART === "Z410") {
            if (this.popupData3.AUGRU === "") {
              alert('필수 필드(오더사유) 입력이 누락되었습니다.', "알림");
              return;
            }
          }

          if (this.popupData3.AUART === "Z200") {
            if (!this.popupData3.INCO1.startsWith('G')) {
              alert('선택한 주문유형에 선택할 수 없는 운송방법입니다.', "알림");
              return;
            }
          }
          else if (this.popupData3.AUART === "Z211") {
            if (!this.popupData3.INCO1.startsWith('G')) {
              alert('선택한 주문유형에 선택할 수 없는 운송방법입니다.', "알림");
              return;
            }
          }
          else {
            if (!this.popupData3.INCO1.startsWith('N')) {
              alert('선택한 주문유형에 선택할 수 없는 운송방법입니다.', "알림");
              return;
            }
          }

          var result = await this.createOrder3();
          if (result.E_TYPESO === "E") {
            alert(`주문등록 실패,\n\n오류 메세지: ${result.E_MESSAGESO}`, "알림");
            return;
          } else if (result.E_TYPEDO === "E") {
            alert(`주문등록 실패,\n\n오류 메세지: ${result.E_MESSAGEDO}`, "알림");
            return;
          } else {
            alert("주문등록완료", "알림");
            this.popupVisible3 = false;
            this.dataLoad();
          }

        } catch (error) {
          alert(`주문등록 실패,\n\n오류 메세지: ${error.message}`, "오류");
        } finally {
          this.loadingVisible2 = false;
          this.saveFlag = false;
          this.cdr.detectChanges();
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
    this.clearPopEntery();
    this.popupData2 = [];
    setTimeout(() => {
      this.selectGridData = this.orderGrid.instance.getSelectedRowsData();
      this.popupData2 = deepCopy(this.selectGridData[0]);
      this.popupData2.MEINS = this.selectGridData[0].VRKME
      this.auartValueA = this.selectGridData[0].AUART
      this.maktValueA = this.selectGridData[0].MATNR
      this.kunnrValue2A = this.selectGridData[0].KUNNR
      this.kunnrValueA = this.selectGridData[0].KUNWE
      this.lgortValueA = this.selectGridData[0].LGORT
      this.vkausValueA = this.selectGridData[0].VKAUS
      this.zunloadValueA = this.selectGridData[0].ZUNLOAD
      this.incoValueA = this.selectGridData[0].INCO1
      this.zcarnoModiValueA = this.selectGridData[0].ZCARNO
      this.tdlnrValueA = this.selectGridData[0].TDLNR
      this.tdlnr2ValueA = this.selectGridData[0].TDLNR2
      this.zcarValueA = this.selectGridData[0].ZCARTYPE
      this.augruValueA = this.selectGridData[0].AUGRU
      this.mvgr2ValueA = this.selectGridData[0].MVGR2
      this.mvgr3ValueA = this.selectGridData[0].MVGR3
      this.mvgr1ValueA = this.selectGridData[0].MVGR1
      this.taxkValue = this.selectGridData[0].TAXK1
      this.popupData2.TAXK1_N = this.selectGridData[0].TAXK1_N
      if (this.selectGridData[0].ZPALLTP === "N")
        this.popupData2.ZPALLTP = "없음";
      else if (this.selectGridData[0].ZPALLTP === "P")
        this.popupData2.ZPALLTP = "플라스틱";
      if (this.selectGridData[0].ZPALLTP === "W")
        this.popupData2.ZPALLTP = "목재";

      //this.zcarnoModiValue = this.selectGridData[0].ZCARNO;
      //this.popupData.ZCARNO = this.zcarnoModiValue;
      /*    this.infoDataLoad("search");*/
      this.popupTitle = "주문조회";
      this.editFlag = true;
      if ((this.selectData2 === "10" || this.selectData2 === "40") && this.popupData2.AUART !== "Z200") {
        this.nh2 = true;
      }
      else {
        this.nh2 = false;
      }
      //저장버튼 여부
      this.saveVisible = false;
      this.popupVisible2 = !this.popupVisible2;

      this.cdr.detectChanges();
    }, 500);
  }

  refAddOrder(e: any) {
    
    this.clearRefEntery();
    this.popupData3 = [];

    var selectGridData = this.orderGrid.instance.getSelectedRowsData();
    if (selectGridData.length === 0) {
      //초기값 설정후 이벤트 발생을 시작 한다.
      //this.BockingEnteryEvent(false);
      this.loadingVisible = false;
      this.cdr.detectChanges();
      alert("라인을 선택해야합니다.", "알림");

      return;
    }

    //this.refInitStat = "init";

    //이벤트를 Blocking한다.
    //this.BockingEnteryEvent(true);

    this.loadingVisible = true;
    this.cdr.detectChanges();

    setTimeout(async () => {
      //첫 참조추가 진입 시 출고사업장 변경 못하게 반영
      this.refInFlag = true;
      this.popupData3.TAXK1 = "";
      this.taxkValue = "";
      this.popupData3 = deepCopy(selectGridData[0]);


      this.incoEnteryB.SetDataFilter([["INCO1", "startswith", "G"], "or", ["INCO1", "startswith", "N"]])

      if (this.popupData3.AUART === "Z410") {
        this.autruDisabled = false;
      }
      else {
        this.autruDisabled = true;
      }

      this.saveVisible = true;

      this.popupData3.VBELN = "";
      this.popupData3.VDATU = new Date();

      this.auartValueB = selectGridData[0].AUART
      this.maktValueB = selectGridData[0].MATNR
      this.kunnrValue2B = selectGridData[0].KUNNR
      this.kunnrValueB = selectGridData[0].KUNWE
      
      this.vkausValueB = selectGridData[0].VKAUS
      this.zunloadValueB = selectGridData[0].ZUNLOAD
      this.incoValueB = selectGridData[0].INCO1
      this.zcarnoModiValueB = selectGridData[0].ZCARNO
      this.tdlnrValueB = selectGridData[0].TDLNR
      this.tdlnr2ValueB = selectGridData[0].TDLNR2
      this.zcarValueB = selectGridData[0].ZCARTYPE
      this.augruValueB = selectGridData[0].AUGRU
      //this.mvgr2ValueB = selectGridData[0].MVGR2
      //this.mvgr3ValueB = selectGridData[0].MVGR3
      //this.mvgr1ValueB = selectGridData[0].MVGR1
      this.zpalValueB = selectGridData[0].ZPALLTP
      this.taxkValue = 2

      //초기값 설정후 이벤트 발생을 시작 한다.
      //this.BockingEnteryEvent(false);

      this.lgortValueB = selectGridData[0].LGORT


      //this.taxkValue = parseInt(this.selectGridData[0].TAXK1)
      this.popupTitle = "참조추가";
      
      if ((this.selectData2 === "10" || this.selectData2 === "40") && this.popupData3.AUART !== "Z200") {
        this.nh3 = true;
      }
      else {
        this.nh3 = false;
      }

      this.loadingVisible = false;
      this.popupVisible3 = true;
      this.cdr.detectChanges();
    }, 1000);


  }

  form_fieldDataChanged(e: any) {
    this.popupData = e.component.option("formData");
  }

  /* Entry Data Form에 바인딩 */
  //분할 차량번호 선택이벤트
  onZcarno1CodeValueChanged(e: any) {
    setTimeout(() => {
      if (this.selectData2 === "10" || this.selectData2 === "40") {
        this.popupData.ZCARNO = e.selectedItem.ZCARNO;
        this.popupData.ZDRIVER = e.selectedItem.ZDRIVER;
        this.popupData.ZPHONE = e.selectedItem.ZPHONE;
        this.zcarValue = e.selectedItem.ZCARTYPE;
        this.popupData.ZCARTYPE = this.zcarValue
      }
      else if (this.selectData2 === "20") {
        this.popupData.ZCARNO = e.selectedItem.ZCARNO;
        this.popupData.ZDRIVER = e.selectedItem.ZDRIVER;
        this.popupData.ZPHONE = e.selectedItem.ZPHONE;
        this.zcarValue = e.selectedItem.ZCARTYPE;
        this.popupData.ZCARTYPE = this.zcarValue
        this.popupData.TDLNR = e.selectedItem.LIFNR;
        this.tdlnrValue = e.selectedItem.LIFNR;
      }
      else if (this.selectData2 === "30") {
        this.popupData.ZCARNO = e.selectedItem.ZCARNO;
        this.popupData.ZDRIVER = e.selectedItem.ZDERIVER1;
        this.popupData.ZPHONE = e.selectedItem.ZPHONE1;
        this.zcarValue = e.selectedItem.ZCARTYPE1;
        this.popupData.ZCARTYPE = this.zcarValue
        this.popupData.TDLNR = e.selectedItem.LIFNR;
        this.tdlnrValue = e.selectedItem.LIFNR;
      }
      this.cdr.detectChanges();
    }, 100);
  }

  //파레트유형
  onZpalltpCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.ZPALLTP = e.selectedValue;
    }, 100);
  }
  onKunnrCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.popupData.KUNNR = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 고객번호)
      this.loadingVisible2 = true;
      this.cdr.detectChanges();
      //유효성점검
      /*var result = await this.detailDataLoad();*/
      var info = await this.detailDataLoad();

      //에러뜨면 메시지
      if (info.E_RETURN.E_TYPE === "E") {
        alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
        this.loadingVisible2 = false;
        this.cdr.detectChanges();
        return;
      }
      //X면 주문입력 불가능
      if (info.E_RETURN.BLOCK === "X") {
        alert('예약발주 통제로 주문 불가합니다.', "알림");
        this.loadingVisible2 = false;
        this.maktEntery2.ClearSelectedValue();
        this.cdr.detectChanges();
        return;
      }
      //언블락X면 가용수량내 입력가능
      else if (info.E_RETURN.UNBLOCK === "X") {
        this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
      }
      //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
      else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
        if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
          if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
            this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
          }
          else {
            this.popupData.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
          }
        }
        else {
          this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
        }
      }
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
      this.cdr.detectChanges();
    }, 100);
  }
  onKunweCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.popupData.KUNWE = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 납품처)
      this.loadingVisible2 = true;
      this.cdr.detectChanges();
      var info = await this.detailDataLoad();

      //에러뜨면 메시지
      if (info.E_RETURN.E_TYPE === "E") {
        alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
        this.loadingVisible2 = false;
        this.cdr.detectChanges();
        return;
      }
      //도착지 -> 출고사업장 
      var resultModel = await this.dataService.SelectModelData<ZSDT1100Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT1100ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND VKORG='1000' AND SPART = '${this.selectData2}' AND KUNNR = '${this.popupData.KUNWE}'`, "", QueryCacheType.None);
      if (resultModel.length > 0) {
        this.lgortValue = resultModel[0].LGORT;
        this.popupData.LGORT = this.lgortValue;
      }


      //X면 주문입력 불가능
      if (info.E_RETURN.BLOCK === "X") {
        alert('예약발주 통제로 주문 불가합니다.', "알림");
        this.loadingVisible2 = false;
        this.maktEntery2.ClearSelectedValue();
        this.cdr.detectChanges();
        return;
      }
      //언블락X면 가용수량내 입력가능
      else if (info.E_RETURN.UNBLOCK === "X") {
        this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
      }
      //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
      else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
        if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
          if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
            this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
          }
          else {
            this.popupData.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
          }
        }
        else {
          this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
        }
      }
      //block 조건
      //var result = await this.detailDataLoad();
      //if (result.E_RETURN.BLOCK === "X" && result.E_RETURN.AVAILCHECK !== "Y") {     //블락x면 입력불가
      //  this.auartFlag2 = true;
      //}
      //else if (result.E_RETURN.UNBLOCK === "X") {  //언블락x면 입력가능
      //  this.auartFlag2 = false;
      //}
      //else if (result.E_RETURN.UNBLOCK === "" && this.popupData.REVQTY !== 0) {  //언블락이 공백이고 예약수량이면 예약수량-출고수량만큼 입력가능
      //  this.auartFlag2 = false;
      //  this.popupData.possible = (this.popupData.REVQTY - this.popupData.ACTQTY)
      //}

      //else if (result.E_RETURN.AVAILCHECK === "Y") {      //점검대상여부가 Y면 예약수량-출고수량 이랑 가용수량 중 더 작은값 이하로 입력가능
      //  this.auartFlag2 = false;
      //  if ((this.popupData.REVQTY - this.popupData.GIOTY) < this.popupData.AVAILQTY) {
      //    this.popupData.possible = this.popupData.REVQTY - this.popupData.GIOTY
      //  }
      //  else {
      //    this.popupData.possible=this.popupData.AVAILQTY
      //  }
      //}
      this.cdr.detectChanges();
    }, 100);
  }
  onMatnrCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.popupData.MATNR = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 자재)
      //if (this.popupData.MATNR !== "" && this.popupData.AVAILQTY == "") {
      //  alert("주문 가능량이 없는 제품입니다.","알림");
      //  this.maktEntery2.ClearSelectedValue();
      //}
      this.loadingVisible2 = true;
      this.cdr.detectChanges();
      /*this.detailDataLoad();*/
      var info = await this.detailDataLoad();

      //에러뜨면 메시지
      if (info.E_RETURN.E_TYPE === "E") {
        alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
        this.loadingVisible2 = false;
        this.cdr.detectChanges();
        return;
      }
      //X면 주문입력 불가능
      //X면 주문입력 불가능
      if (info.E_RETURN.BLOCK === "X") {
        alert('예약발주 통제로 주문 불가합니다.', "알림");
        this.loadingVisible2 = false;
        this.maktEntery2.ClearSelectedValue();
        this.cdr.detectChanges();
        return;
      }
      //언블락X면 가용수량내 입력가능
      else if (info.E_RETURN.UNBLOCK === "X") {
        this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
      }
      //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
      else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
        if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
          if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
            this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
          }
          else {
            this.popupData.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
          }
        }
        else {
          this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
        }
      }
      this.cdr.detectChanges();
    }, 100);
  }

  //onMvgr1CodeValueChanged(e: any) {
  //  setTimeout(() => {
  //    this.popupData.MVGR1 = e.selectedValue;
  //    //변경시 마다 RFC 2번 조회 (파라미터 중 자재)


  //  });
  //}
  //onMvgr2CodeValueChanged(e: any) {
  //  setTimeout(() => {
  //    this.popupData.MVGR2 = e.selectedValue;
  //    //변경시 마다 RFC 2번 조회 (파라미터 중 자재)


  //  });
  //}
  //onMvgr3CodeValueChanged(e: any) {
  //  setTimeout(() => {
  //    this.popupData.MVGR3 = e.selectedValue;
  //    //변경시 마다 RFC 2번 조회 (파라미터 중 자재)


  //  });
  //}
  onAugruCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.popupData.AUGRU = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 자재)
      this.loadingVisible2 = true;
      this.cdr.detectChanges();
      /*this.detailDataLoad();*/
      var info = await this.detailDataLoad();

      //에러뜨면 메시지
      if (info.E_RETURN.E_TYPE === "E") {
        alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
        this.loadingVisible2 = false;
        this.cdr.detectChanges();
        return;
      }
      //X면 주문입력 불가능
      if (info.E_RETURN.BLOCK === "X") {
        alert('예약발주 통제로 주문 불가합니다.', "알림");
        this.loadingVisible2 = false;
        this.maktEntery2.ClearSelectedValue();
        this.cdr.detectChanges();
        return;
      }
      //언블락X면 가용수량내 입력가능
      else if (info.E_RETURN.UNBLOCK === "X") {
        this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
      }
      //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
      else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
        if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
          if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
            this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
          }
          else {
            this.popupData.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
          }
        }
        else {
          this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
        }
      }
      this.cdr.detectChanges();
    }, 100);
  }

  onValueChanged(e: any) {
    if (this.selectData2 === "10" || this.selectData2 === "40") {
      this.taxk1 = e.value;
    }
  }


  onData2ValueChanged(e: any) {
    this.selectData2 = e.value;
    this.loadingVisible2 = true;

    this.maktValue = "";
    this.maktValueA = "";
    this.maktValueB = "";

    //this.BockingEnteryEvent(true);
    setTimeout(() => {
      //비료
      if (this.selectData2 === "10") {
        /*this.sd007Entery1.ChangeCodeInfo(this.appConfig.commonCode("주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");*/
        //this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("비료제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "제품구분")
        //this.maktEntery.ChangeCodeInfo(this.appConfig.tableCode("비료제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
        this.sd007Entery2.ChangeCodeInfo(this.appConfig.commonCode("주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.sd007Entery2A.ChangeCodeInfo(this.appConfig.commonCode("주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.sd007Entery2B.ChangeCodeInfo(this.appConfig.commonCode("주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.maktEntery2.ChangeCodeInfo(this.appConfig.tableCode("비료제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.maktEntery2A.ChangeCodeInfo(this.appConfig.tableCode("비료제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.maktEntery2B.ChangeCodeInfo(this.appConfig.tableCode("비료제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnrEnteryA.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnrEnteryB.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEnteryA.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEnteryB.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.t001Entery.ChangeCodeInfo(this.appConfig.commonCode("비료출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.t001EnteryA.ChangeCodeInfo(this.appConfig.commonCode("비료출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.t001EnteryB.ChangeCodeInfo(this.appConfig.commonCode("비료출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.zcarnoModiCodeEnteryA.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.zcarnoModiCodeEnteryB.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.dd07tCarEntery.ChangeCodeInfo(this.appConfig.tableCode("화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.dd07tCarEnteryA.ChangeCodeInfo(this.appConfig.tableCode("화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.dd07tCarEnteryB.ChangeCodeInfo(this.appConfig.tableCode("화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.ZDOFLG = "X";
        this.volume = true;
        //this.cdr.detectChanges();
      }

      //화학
      else if (this.selectData2 === "20") {
        //this.sd007Entery1.ChangeCodeInfo(this.appConfig.commonCode("액상주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
        //this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("액상제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "제품구분")
        //this.maktEntery.ChangeCodeInfo(this.appConfig.tableCode("액상제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
        this.sd007Entery2.ChangeCodeInfo(this.appConfig.commonCode("액상주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.sd007Entery2A.ChangeCodeInfo(this.appConfig.commonCode("액상주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.sd007Entery2B.ChangeCodeInfo(this.appConfig.commonCode("액상주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.maktEntery2.ChangeCodeInfo(this.appConfig.tableCode("액상제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.maktEntery2A.ChangeCodeInfo(this.appConfig.tableCode("액상제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.maktEntery2B.ChangeCodeInfo(this.appConfig.tableCode("액상제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("액상납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnrEnteryA.ChangeCodeInfo(this.appConfig.tableCode("액상납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnrEnteryB.ChangeCodeInfo(this.appConfig.tableCode("액상납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEntery.ChangeCodeInfo(this.appConfig.tableCode("액상납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEnteryA.ChangeCodeInfo(this.appConfig.tableCode("액상납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEnteryB.ChangeCodeInfo(this.appConfig.tableCode("액상납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.t001Entery.ChangeCodeInfo(this.appConfig.commonCode("액상출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.t001EnteryA.ChangeCodeInfo(this.appConfig.commonCode("액상출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.t001EnteryB.ChangeCodeInfo(this.appConfig.commonCode("액상출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("화학종합차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.zcarnoModiCodeEnteryA.ChangeCodeInfo(this.appConfig.tableCode("화학종합차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.zcarnoModiCodeEnteryB.ChangeCodeInfo(this.appConfig.tableCode("화학종합차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.dd07tCarEntery.ChangeCodeInfo(this.appConfig.tableCode("화학화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.dd07tCarEnteryA.ChangeCodeInfo(this.appConfig.tableCode("화학화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.dd07tCarEnteryB.ChangeCodeInfo(this.appConfig.tableCode("화학화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.ZDOFLG = "";
        this.volume = false;
        this.taxk1 = "";
        //this.cdr.detectChanges();
      }
      //유류
      else if (this.selectData2 === "30") {
        //this.sd007Entery1.ChangeCodeInfo(this.appConfig.commonCode("유류주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
        //this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("유류제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "제품구분")
        //this.maktEntery.ChangeCodeInfo(this.appConfig.tableCode("유류제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
        this.sd007Entery2.ChangeCodeInfo(this.appConfig.commonCode("유류주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.sd007Entery2A.ChangeCodeInfo(this.appConfig.commonCode("유류주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.sd007Entery2B.ChangeCodeInfo(this.appConfig.commonCode("유류주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.maktEntery2.ChangeCodeInfo(this.appConfig.tableCode("유류제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.maktEntery2A.ChangeCodeInfo(this.appConfig.tableCode("유류제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.maktEntery2B.ChangeCodeInfo(this.appConfig.tableCode("유류제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("유류납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnrEnteryA.ChangeCodeInfo(this.appConfig.tableCode("유류납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnrEnteryB.ChangeCodeInfo(this.appConfig.tableCode("유류납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEntery.ChangeCodeInfo(this.appConfig.tableCode("유류납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEnteryA.ChangeCodeInfo(this.appConfig.tableCode("유류납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEnteryB.ChangeCodeInfo(this.appConfig.tableCode("유류납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.t001Entery.ChangeCodeInfo(this.appConfig.commonCode("유류출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.t001EnteryA.ChangeCodeInfo(this.appConfig.commonCode("유류출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.t001EnteryB.ChangeCodeInfo(this.appConfig.commonCode("유류출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("유류차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.zcarnoModiCodeEnteryA.ChangeCodeInfo(this.appConfig.tableCode("유류차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.zcarnoModiCodeEnteryB.ChangeCodeInfo(this.appConfig.tableCode("유류차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.dd07tCarEntery.ChangeCodeInfo(this.appConfig.tableCode("유류화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.dd07tCarEnteryA.ChangeCodeInfo(this.appConfig.tableCode("유류화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.dd07tCarEnteryB.ChangeCodeInfo(this.appConfig.tableCode("유류화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.ZDOFLG = "";
        this.taxk1 = "";
        this.volume = false;
        //this.cdr.detectChanges();
      }

      //친환경
      else if (this.selectData2 === "40") {
        //this.sd007Entery1.ChangeCodeInfo(this.appConfig.commonCode("친환경주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분");
        //this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "제품구분")
        //this.maktEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명")
        this.sd007Entery2.ChangeCodeInfo(this.appConfig.commonCode("친환경주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.sd007Entery2A.ChangeCodeInfo(this.appConfig.commonCode("친환경주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.sd007Entery2B.ChangeCodeInfo(this.appConfig.commonCode("친환경주문구분"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "주문구분", "", 0, 2);
        this.maktEntery2.ChangeCodeInfo(this.appConfig.tableCode("친환경제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.maktEntery2A.ChangeCodeInfo(this.appConfig.tableCode("친환경제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.maktEntery2B.ChangeCodeInfo(this.appConfig.tableCode("친환경제품명"), "MATNR", "%MAKTX%(%MATNR%)", "제품명", "", 0, 2)
        this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnrEnteryA.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnrEnteryB.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEnteryA.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.kunnEnteryB.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "납품처", "", 0, 2)
        this.t001Entery.ChangeCodeInfo(this.appConfig.commonCode("친환경출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.t001EnteryA.ChangeCodeInfo(this.appConfig.commonCode("친환경출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.t001EnteryB.ChangeCodeInfo(this.appConfig.commonCode("친환경출고사업장"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "출고사업장", "", 0, 2)
        this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.zcarnoModiCodeEnteryA.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.zcarnoModiCodeEnteryB.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "ZCARNO", "%ZCARNO%", "차량")
        this.dd07tCarEntery.ChangeCodeInfo(this.appConfig.tableCode("화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.dd07tCarEnteryA.ChangeCodeInfo(this.appConfig.tableCode("화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.dd07tCarEnteryB.ChangeCodeInfo(this.appConfig.tableCode("화물차종"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "화물차종")
        this.ZDOFLG = "X";
        this.volume = true;
        //this.cdr.detectChanges();
      }

      setTimeout(async () => {
        await this.dataLoad();
        this.loadingVisible2 = false;
        //this.BockingEnteryEvent(false);
        this.cdr.detectChanges();
      }, 500);
    });
  }

  onEditorPreparing(e: any) {
    if (e.parentType === "filterRow") {
      e.updateValueTimeout = 2000;  // default: 700
    }
  }

  onAuartCodeValueChanged(e: any) {
    setTimeout(async () => {
      try {
        this.popupData.AUART = e.selectedValue;
        //변경시 마다 RFC 2번 조회 (파라미터 중 주문유형)
        this.loadingVisible2 = true;
        this.cdr.detectChanges();
        /*this.detailDataLoad();*/
        var info = await this.detailDataLoad();
        //if (info === null)
        //  return;

        //에러뜨면 메시지
        if (info.E_RETURN.E_TYPE === "E") {
          alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
          this.loadingVisible2 = false;
          this.cdr.detectChanges();
          return;
        }
        //X면 주문입력 불가능
        if (info.E_RETURN.BLOCK === "X") {
          alert('예약발주 통제로 주문 불가합니다.', "알림");
          this.loadingVisible2 = false;
          this.maktEntery2.ClearSelectedValue();
          this.cdr.detectChanges();
          return;
        }
        //언블락X면 가용수량내 입력가능
        else if (info.E_RETURN.UNBLOCK === "X") {
          this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
        }
        //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
        else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
          if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
            if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
              this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
            }
            else {
              this.popupData.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
            }
          }
          else {
            this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
          }
        }
        this.augruEntery.ClearSelectedValue();
        if (this.popupData.AUART === "Z200") {
          this.incoEntery.ChangeCodeInfo(this.appConfig.commonCode("운송방법"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "운송방법")
        }
        else if (this.popupData.AUART === "Z211") {
          this.incoEntery.ChangeCodeInfo(this.appConfig.commonCode("운송방법"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "운송방법")
        }
        else {
          this.incoEntery.ChangeCodeInfo(this.appConfig.commonCode("농협운송방법"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "운송방법")
        }
        if (this.popupData.AUART === "Z410") {
          this.autruDisabled = false;
        }
        else {
          this.autruDisabled = true;
        }



        //if (this.selectData2 === "10") {
        //  if (e.selectedValue.startsWith('Z1')) {

        //    this.kunnrValue2 = this.empid;
        //    this.popupData.KUNNR = this.kunnrValue2;
        //    this.nh = true;
        //  }
        //  else if (e.selectedValue.startsWith('Z2')) {
        //    this.auartFlag = false;
        //    this.kunnrEntery.ClearSelectedValue();
        //}
        //else {
        //  this.auartFlag = false;
        //    this.kunnrValue2 = this.empid;
        //    this.popupData.KUNNR = this.kunnrValue2;
        //  }
        //}

        //if (this.selectData2 === "40") {
        //  if (e.selectedValue.startsWith('Z1')) {
        //    this.kunnrValue2 = this.empid;
        //    this.popupData.KUNNR = this.kunnrValue2;
        //    this.nh = true;
        //  } else if (e.selectedValue.startsWith('Z2')) {
        //    this.auartFlag = false;
        //    this.kunnrEntery.ClearSelectedValue();
        //  }
        //  else {
        //    this.auartFlag = false;
        //    this.kunnrValue2 = this.empid;
        //    this.popupData.KUNNR = this.kunnrValue2;
        //  }
        //}

        if (this.selectData2 !== "40") {
          if (e.selectedValue.startsWith('Z2')) {
            this.nh = false;
            this.kunnrValue2 = this.empid;
            this.popupData.KUNNR = this.kunnrValue2;
          }
          else {
            this.kunnrValue2 = "0000102957";
            this.nh = true;
          }
        }
        else {
          if (e.selectedValue.startsWith('Z2')) {
            this.nh = false;
            this.kunnrValue2 = this.empid;
            this.popupData.KUNNR = this.kunnrValue2;
          }
          else {
            this.kunnrValue2 = "0000102958";
            this.nh = true;
          }
        }

        if (this.selectData2 === "10" || this.selectData2 === "40") {
          if (e.selectedValue.startsWith('Z1')) {
            this.taxk1 = "2";
          }
          else if (e.selectedValue.startsWith('Z4')) {
            this.taxk1 = "2";
          }
          else {
            this.taxk1 = "";
          }
        }
        this.cdr.detectChanges();
      } catch (error) {
        console.log(error);
      }
    }, 100);
  }
  onTvlvCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.VKAUS = e.selectedValue;
    }, 100);
  }
  onZunloadCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.ZUNLOAD = e.selectedValue;
    }, 100);
  }
  onLgortCodeValueChanged(e: any) {
    setTimeout(async () => {
      this.popupData.LGORT = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 저장위치)
      this.loadingVisible2 = true;
      this.cdr.detectChanges();
      /*this.detailDataLoad();*/
      var info = await this.detailDataLoad();

      //에러뜨면 메시지
      if (info.E_RETURN.E_TYPE === "E") {
        alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
        this.loadingVisible2 = false;
        this.cdr.detectChanges();
        return;
      }
      //X면 주문입력 불가능
      if (info.E_RETURN.BLOCK === "X") {
        alert('예약발주 통제로 주문 불가합니다.', "알림");
        this.loadingVisible2 = false;
        this.maktEntery2.ClearSelectedValue();
        this.cdr.detectChanges();
        return;
      }
      //언블락X면 가용수량내 입력가능
      else if (info.E_RETURN.UNBLOCK === "X") {
        this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
      }
      //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
      else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
        if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
          if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
            this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
          }
          else {
            this.popupData.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
          }
        }
        else {
          this.popupData.orderPossible = info.E_RETURN.AVAILQTY;
        }
      }
      this.cdr.detectChanges();
    }, 100);
  }
  onTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.TDLNR = e.selectedValue;
    }, 100);
  }
  onTdlnr2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.TDLNR2 = e.selectedValue;
    }, 100);
  }
  //onTdlnr2CodeValueChanged(e: any) {
  //  setTimeout(() => {
  //    this.popupData.TDLNR2 = e.selectedValue;
  //  });
  //}
  onZcartypeCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.ZCARTYPE = e.selectedValue;
    }, 100);
  }
  onVsbedCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.VSBED = e.selectedValue;
    }, 100);
  }
  onIncoCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.INCO1 = e.selectedValue;
      //if (this.selectData2 === "30") {
      //  if (e.selectedValue === "G00") {
      //    this.popupData.TDLNR = "자차운송사";
      //  }
      //}
    }, 100);
  }

  //참조추가 valuechange
  onAuartValueBValueChanged(e: any) {
    setTimeout(async () => {
      try {
        //var isInit = false;

        //if (this.popupData3.AUART === e.selectedValue)
        //  isInit = false;
        //else
        //  isInit = true;

        this.popupData3.AUART = e.selectedValue;
        //변경시 마다 RFC 2번 조회 (파라미터 중 주문유형)
        this.loadingVisible2 = true;
        this.cdr.detectChanges();
        /*this.detailDataLoad();*/
        var info = await this.detailDataLoad2();
        //if (info === null)
        //  return;

        //에러뜨면 메시지
        if (info.E_RETURN.E_TYPE === "E") {
          alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
          this.loadingVisible2 = false;
          this.cdr.detectChanges();
          return;
        }
        //X면 주문입력 불가능
        if (info.E_RETURN.BLOCK === "X") {
          alert('예약발주 통제로 주문 불가합니다.', "알림");
          this.loadingVisible2 = false;
          this.maktEntery2B.ClearSelectedValue();
          this.cdr.detectChanges();
          return;
        }
        //언블락X면 가용수량내 입력가능
        else if (info.E_RETURN.UNBLOCK === "X") {
          this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
        }
        //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
        else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
          if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
            if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
              this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
            }
            else {
              this.popupData3.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
            }
          }
          else {
            this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
          }
        }

        //if (isInit === true) {
        //오더유형 초기화일때만 파서블엔트리 변경
        //this.augruEnteryB.ClearSelectedValue();

        //if (this.popupData3.AUART === "Z200") {
        //  this.incoEnteryB.SetDataFilter(["INCO1", "startswith", "G"])
        //}
        //else if (this.popupData3.AUART === "Z211") {
        //  this.incoEnteryB.SetDataFilter(["INCO1", "startswith", "G"])
        //}
        //else {
        //  this.incoEnteryB.SetDataFilter(["INCO1", "startswith", "N"])
        //}
        if (this.popupData3.AUART === "Z410") {
          this.autruDisabled = false;
        }
        else {
          this.autruDisabled = true;
        }
        //} else {
        //this.incoValueB = this.selectGridData[0].INCO1;
        //}

        if (this.selectData2 === "10") {
          if (e.selectedValue.startsWith('Z1')) {

            //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");

            ////안내문
            //  alert(`주문처목록을 재설정 했습니다.`, "알림");
            /*          this.kunnrEntery.setSelectedValue("0000102957");*/
            //this.kunnrValue2 = "0000102957";
            //this.popupData3.KUNNR = this.kunnrValue2;

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
            this.kunnrEnteryB.ClearSelectedValue();
            //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");
            //alert(`주문처를 직접 설정해주세요.`, "알림");
            /*        this.nh = false;*/
          }
          else {
            this.auartFlag = false;
            //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("비료납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");
            //alert(`주문처를 직접 설정해주세요.`, "알림");
            /*        this.nh = true;*/
            /*          this.kunnrValue2B = "0000102957";*/
            /*       this.popupData3.KUNNR = this.kunnrValue2;*/
          }
        }

        if (this.selectData2 === "40") {
          if (e.selectedValue.startsWith('Z1')) {
            //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");

            ////안내문
            //alert(`주문처목록을 재설정 했습니다.`, "알림");
            //this.kunnrValue2B = "0000102958";
            //this.popupData3.KUNNR = this.kunnrValue2B;
            ////edit막고
            //this.auartFlag = true;
            ////기본값 넣어주고
            //this.kunnrValue2 = "0000100028";
            //임시로직
            /*this.popupData.KUNNR = this.kunnrValue2;*/

            //2번rfc조회
            /*this.detailDataLoad();*/
            this.nh3 = true;
          } else if (e.selectedValue.startsWith('Z2')) {
            this.auartFlag = false;
            this.kunnrEnteryB.ClearSelectedValue();
            //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");
            //alert(`주문처를 직접 설정해주세요.`, "알림");
            /*        this.nh = false;*/
          }
          else {
            this.auartFlag = false;
            //this.kunnrEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경납품처"), "KUNNR", "%NAME1%(%KUNNR%)", "주문처");
            //alert(`주문처를 직접 설정해주세요.`, "알림");
            /*        this.nh = true;*/
            //this.kunnrValue2B = "0000102958";
            //this.popupData3.KUNNR = this.kunnrValue2;
          }
        }

        if (this.selectData2 === "10" || this.selectData2 === "40") {
          if (e.selectedValue.startsWith('Z2')) {
            this.nh3 = false;
          }
          else {
            this.nh3 = true;
          }
        }

        if (this.selectData2 === "10" || this.selectData2 === "40") {
          if (e.selectedValue.startsWith('Z1')) {
            this.taxk1 = "2";
          }
          else if (e.selectedValue.startsWith('Z4')) {
            this.taxk1 = "2";
          }
          else {
            this.taxk1 = "";
          }
        }
        this.cdr.detectChanges();
      } catch (error) {
        console.log(error);
      }

    }, 100);
  }
  onMaktValueBValueChanged(e: any) {
    setTimeout(async () => {
      this.popupData3.MATNR = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 자재)
      //if (this.popupData.MATNR !== "" && this.popupData.AVAILQTY == "") {
      //  alert("주문 가능량이 없는 제품입니다.","알림");
      //  this.maktEntery2.ClearSelectedValue();
      //}
      this.loadingVisible2 = true;
      this.cdr.detectChanges();
      /*this.detailDataLoad();*/
      var info = await this.detailDataLoad2();

      //에러뜨면 메시지
      if (info.E_RETURN.E_TYPE === "E") {
        alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
        this.loadingVisible2 = false;
        this.cdr.detectChanges();
        return;
      }
      //X면 주문입력 불가능
      //X면 주문입력 불가능
      if (info.E_RETURN.BLOCK === "X") {
        alert('예약발주 통제로 주문 불가합니다.', "알림");
        this.loadingVisible2 = false;
        this.maktEntery2B.ClearSelectedValue();
        this.cdr.detectChanges();
        return;
      }
      //언블락X면 가용수량내 입력가능
      else if (info.E_RETURN.UNBLOCK === "X") {
        this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
      }
      //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
      else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
        if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
          if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
            this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
          }
          else {
            this.popupData3.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
          }
        }
        else {
          this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
        }
      }
      this.cdr.detectChanges();
    }, 100);
  }
  onKunnrValue2BValueChanged(e: any) {
    setTimeout(() => {
      this.popupData3.KUNNR = e.selectedValue;
    }, 100);
  }

  onZpalltpBCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData3.ZPALLTP = e.selectedValue;
    }, 100);
  }

  onKunnrValueBValueChanged(e: any) {
    setTimeout(async () => {

      this.popupData3.KUNWE = e.selectedValue;

      //첫 참조추가 진입 시 출고사업장 변경 못하게 반영
      var refFlag = this.refInFlag;
      if (refFlag) {
        this.refInFlag = false;
        return;
      }

      this.loadingVisible2 = true;
      this.cdr.detectChanges();

      //도착지 -> 출고사업장 
      var resultModel = await this.dataService.SelectModelData<ZSDT1100Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT1100ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND VKORG='1000' AND SPART = '${this.selectData2}' AND KUNNR = '${this.popupData3.KUNWE}'`, "", QueryCacheType.None);
      if (resultModel.length > 0) {
        this.lgortValueB = resultModel[0].LGORT;
        this.popupData3.LGORT = this.lgortValueB;
      }

      //도착지 변경해도 농협쪽 변경되게 수정 20230414--------------------------------
      var info = await this.detailDataLoad2();

      //에러뜨면 메시지
      if (info.E_RETURN.E_TYPE === "E") {
        alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
        this.loadingVisible2 = false;
        this.cdr.detectChanges();
        return;
      }
      //X면 주문입력 불가능
      //X면 주문입력 불가능
      if (info.E_RETURN.BLOCK === "X") {
        alert('예약발주 통제로 주문 불가합니다.', "알림");
        this.loadingVisible2 = false;
        this.maktEntery2B.ClearSelectedValue();
        this.cdr.detectChanges();
        return;
      }
      //언블락X면 가용수량내 입력가능
      else if (info.E_RETURN.UNBLOCK === "X") {
        this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
      }
      //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
      else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
        if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
          if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
            this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
          }
          else {
            this.popupData3.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
          }
        }
        else {
          this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
        }
      }
      this.loadingVisible2 = false;
      //--------------------------------------------------------------------------------------------------------
      this.cdr.detectChanges();
    }, 100);
  }
  onLgortValueBValueChanged(e: any) {
    setTimeout(async () => {
      this.popupData3.LGORT = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 저장위치)
      this.loadingVisible2 = true;
      this.cdr.detectChanges();
      /*this.detailDataLoad();*/
      var info = await this.detailDataLoad2();

      //에러뜨면 메시지
      if (info.E_RETURN.E_TYPE === "E") {
        alert(`오류 메세지: ${info.E_RETURN.E_MESSAGE}`, "알림");
        this.loadingVisible2 = false;
        this.cdr.detectChanges();
        return;
      }
      //X면 주문입력 불가능
      if (info.E_RETURN.BLOCK === "X") {
        alert('예약발주 통제로 주문 불가합니다.', "알림");
        this.loadingVisible2 = false;
        this.maktEntery2.ClearSelectedValue();
        this.cdr.detectChanges();
        return;
      }
      //언블락X면 가용수량내 입력가능
      else if (info.E_RETURN.UNBLOCK === "X") {
        this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
      }
      //둘다 빈값이면 예약-출고, 가용수량중 더 적은만큼
      else if ((info.E_RETURN.BLOCK === "" && info.E_RETURN.UNBLOCK === "") || info.E_RETURN.AVAILCHECK === "Y") {
        if (info.E_RETURN.REVQTY !== "0" && info.E_RETURN.REVQTY !== "" && info.E_RETURN.REVQTY !== null) {
          if ((parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY)) > parseInt(info.E_RETURN.AVAILQTY)) {
            this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
          }
          else {
            this.popupData3.orderPossible = parseInt(info.E_RETURN.REVQTY) - parseInt(info.E_RETURN.ACTQTY);
          }
        }
        else {
          this.popupData3.orderPossible = info.E_RETURN.AVAILQTY;
        }
      }
      this.cdr.detectChanges();
    }, 100);
  }
  onVkausValueBValueChanged(e: any) {
    setTimeout(() => {
      this.popupData3.VKAUS = e.selectedValue;
    }, 100);
  }
  onZunloadValueBValueChanged(e: any) {
    setTimeout(() => {
      this.popupData3.ZUNLOAD = e.selectedValue;
    }, 100);
  }
  onIncoValueBValueChanged(e: any) {
    setTimeout(() => {
      this.popupData3.INCO1 = e.selectedValue;
    }, 100);
  }
  onZcarnoModiValueBValueChanged(e: any) {
    setTimeout(async () => {
      //this.popupData3.ZCARNO = e.selectedValue;
      try {
        if (this.selectData2 === "10" || this.selectData2 === "40") {
          this.popupData3.ZCARNO = e.selectedItem.ZCARNO;
          this.popupData3.ZDRIVER = e.selectedItem.ZDRIVER;
          this.popupData3.ZPHONE = e.selectedItem.ZPHONE;
          this.zcarValueB = e.selectedItem.ZCARTYPE;
          this.popupData3.ZCARTYPE = this.zcarValueB;
          //console.log("onZcarnoModiValueBValueChanged(1)!!" + this.zcarValueB);
        }
        else if (this.selectData2 === "20") {
          this.popupData3.ZCARNO = e.selectedItem.ZCARNO;
          this.popupData3.ZDRIVER = e.selectedItem.ZDRIVER;
          this.popupData3.ZPHONE = e.selectedItem.ZPHONE;
          this.zcarValueB = e.selectedItem.ZCARTYPE;
          this.popupData3.ZCARTYPE = this.zcarValueB;
          this.popupData3.TDLNR = e.selectedItem.LIFNR;
          this.tdlnrValueB = e.selectedItem.LIFNR;
          //console.log("onZcarnoModiValueBValueChanged(2)!!" + this.zcarValueB);
        }
        else if (this.selectData2 === "30") {
          this.popupData3.ZCARNO = e.selectedItem.ZCARNO;
          this.popupData3.ZDRIVER = e.selectedItem.ZDERIVER1;
          this.popupData3.ZPHONE = e.selectedItem.ZPHONE1;
          this.zcarValueB = e.selectedItem.ZCARTYPE1;
          this.popupData3.ZCARTYPE = this.zcarValueB;
          this.popupData3.TDLNR = e.selectedItem.LIFNR;
          this.tdlnrValueB = e.selectedItem.LIFNR;
          //console.log("onZcarnoModiValueBValueChanged(3)!!" + this.zcarValueB);
        }
        this.cdr.detectChanges();
      } catch (error) {
        console.log(error);
      }
    }, 100);
  }
  onTdlnrValueBValueChanged(e: any) {
    setTimeout(() => {
      this.popupData3.TDLNR = e.selectedValue;
    }, 100);
  }
  onTdlnr2ValueBValueChanged(e: any) {
    setTimeout(() => {
      this.popupData3.TDLNR2 = e.selectedValue;
    }, 100);
  }
  onZcarValueBValueChanged(e: any) {
    //setTimeout(async() => {
    //  this.popupData3.ZCARTYPE = e.selectedValue;
    //}, 100);
  }

  onAugruValueBValueChanged(e: any) {
    setTimeout(() => {
      this.popupData3.AUGRU = e.selectedValue;
    }, 100);
  }

  onMvgr2ValueBValueChanged(e: any) {
    setTimeout(() => {
      //this.popupData3.MVGR2 = e.selectedValue;
    });
  }
  onMvgr3ValueBValueChanged(e: any) {
    setTimeout(() => {
      //this.popupData3.MVGR3 = e.selectedValue;
    });
  }
  onMvgr1ValueBValueChanged(e: any) {
    setTimeout(() => {
      //this.popupData3.MVGR1 = e.selectedValue;
    });
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
      component: this.orderGrid.instance,
      worksheet: worksheet,
      customizeCell: function (options) {
        const excelCell = options.excelCell;
        excelCell.font = { name: 'Arial', size: 12 };
        excelCell.alignment = { horizontal: 'left' };
      }
    }).then(function () {
      workbook.xlsx.writeBuffer()
        .then(function (buffer: BlobPart) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `고객주문등록_${formatDate(new Date(), "yyyyMMdd", "en-US")}.xlsx`);
        });
    }).then(function () {
      //e.component.columnOption('ID', 'visible', false);
      //e.component.endUpdate();
      return;
    });

    /*e.cancel = true;*/
  }


  //고객주문리스트 조회 RFC
  public async dataLoad() {
    this.dataLoading = false;
    
    var zps5000Model = new ZSDS5000Model(this.userid, this.empid, this.startDate, this.endDate, this.selectData2,  "",  "",  "");
    var modelList: ZSDS5001Model[] = [];
    var zpsModel = new ZSDEPSOListModel(zps5000Model, modelList);

    var zps500List: ZSDEPSOListModel[] = [zpsModel];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOListModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOListModelList", zps500List, QueryCacheType.None);

    for (var row of resultModel[0].E_RETURN) {
      if (row.ZPALLTP === "N")
        row.ZPALLTPT = "없음";
      else if (row.ZPALLTP === "P")
        row.ZPALLTPT = "플라스틱";
      else if (row.ZPALLTP === "W")
        row.ZPALLTPT = "목재";
    }

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "MATNR"],
        data: resultModel[0].E_RETURN
      });

    this.orderGrid.instance.getScrollable().scrollTo(0);

    this.dataLoading = true;

    if (this.dataLoading == true && this.enteryLoading == true) {
      this.loadingVisible = false;
    }
    this.cdr.detectChanges();
  }

  //고객주문 정보 조회 RFC
  public async infoDataLoad(flag: string) {

    this.clearEntery();

    var selectData = this.dataGrid.instance.getSelectedRowsData();


    var zsd3013Model = new ZSDS3013Model(selectData[0].KUNNR, selectData[0].KUNWE, this.selectData2, selectData[0].MATNR, selectData[0].AUART, selectData[0].LGORT, selectData[0].INCO1);
    var zsd3014Model = new ZSDS3014Model("", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "", 0, 0, 0, "", 0, "", "","");


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
    this.zcarnoModiValue = selectData[0].ZCARNO;
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

    var zsd3013Model = new ZSDS3013Model(selectData.KUNNR, selectData.KUNWE, this.selectData2, selectData.MATNR, selectData.AUART, selectData.LGORT, selectData.INCO1);
    var zsd3014Model = new ZSDS3014Model("", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "", 0, 0, 0, "", 0, "", "","");

    var zsdModel = new ZSDEPSOENTRYInfoModel(zsd3014Model, zsd3013Model);
    var zsdList: ZSDEPSOENTRYInfoModel[] = [zsdModel];


    if (selectData.KUNNR === "" || selectData.KUNWE === "" || selectData.MATNR === "" || selectData.AUART === "" || selectData.INCO1 === "") {
      this.loadingVisible2 = false;
      this.cdr.detectChanges();
      return zsdList[0];
    }
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOENTRYInfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOENTRYInfoModelList", zsdList, QueryCacheType.None);
  
    var allData = Object.assign(this.popupData, resultModel[0].E_RETURN);

    this.popupData = allData;
    this.popupData.AVAILQTY = Math.floor(parseInt(this.popupData.AVAILQTY));
    this.popupData.MVGR3 = this.mvgr3Value = allData.MVGR3;
    this.popupData.MVGR2 =  this.mvgr2Value = allData.MVGR2;
    this.popupData.MVGR1 = this.mvgr1Value = allData.MVGR1;
    this.loadingVisible2 = false;
    //this.cdr.detectChanges();
    return resultModel[0];
  }

  public async checkDetailDataLoad() {
    var selectData = this.popupData;

    var zsd3013Model = new ZSDS3013Model(selectData.KUNNR, selectData.KUNWE, this.selectData2, selectData.MATNR, selectData.AUART, selectData.LGORT, selectData.INCO1);
    var zsd3014Model = new ZSDS3014Model("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0, 0, 0, "", 0, "", "","");

    var zsdModel = new ZSDEPSOENTRYInfoModel(zsd3014Model, zsd3013Model);
    var zsdList: ZSDEPSOENTRYInfoModel[] = [zsdModel];


    if (selectData.KUNNR === "" || selectData.KUNWE === "" || selectData.MATNR === "" || selectData.AUART === "" || selectData.INCO1 === "") {
      this.loadingVisible2 = false;
      this.cdr.detectChanges();
      return zsdList[0];
    }
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOENTRYInfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOENTRYInfoModelList", zsdList, QueryCacheType.None);
    this.popupData.MEINS = resultModel[0].E_RETURN.MEINS;

    this.loadingVisible2 = false;
    //this.cdr.detectChanges();
    return resultModel[0];
  }

  //참조추가 rfc
  public async detailDataLoad2() {
    var selectData = this.popupData3;

    var zsd3013Model = new ZSDS3013Model(selectData.KUNNR, selectData.KUNWE, this.selectData2, selectData.MATNR, selectData.AUART, selectData.LGORT, selectData.INCO1);
    var zsd3014Model = new ZSDS3014Model("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0, 0, 0, "", 0, "", "","");

    var zsdModel = new ZSDEPSOENTRYInfoModel(zsd3014Model, zsd3013Model);
    var zsdList: ZSDEPSOENTRYInfoModel[] = [zsdModel];


    if (selectData.KUNNR === "" || selectData.KUNWE === "" || selectData.MATNR === "" || selectData.AUART === "" || selectData.INCO1 === "") {
      this.loadingVisible2 = false;
      this.cdr.detectChanges();
      return zsdList[0];
    }
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOENTRYInfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOENTRYInfoModelList", zsdList, QueryCacheType.None);

    var allData = Object.assign(this.popupData3, resultModel[0].E_RETURN);

    this.popupData3 = allData;
    this.popupData3.AVAILQTY = Math.floor(parseInt(this.popupData3.AVAILQTY));
    //this.mvgr3ValueB = allData.MVGR3;
    this.popupData3.MVGR1 = this.mvgr1ValueB = allData.MVGR1;
    this.popupData3.MVGR2 = this.mvgr2ValueB = allData.MVGR2;
    this.popupData3.MVGR3 = this.mvgr3ValueB = allData.MVGR3;
    //this.mvgr1ValueB = allData.MVGR1;
    //this.mvgr2ValueB = allData.MVGR2;
    this.loadingVisible2 = false;
    //this.cdr.detectChanges();
    return resultModel[0];
  }

  public async checkDetailDataLoad2() {
    var selectData = this.popupData3;
    var zsd3013Model = new ZSDS3013Model(selectData.KUNNR, selectData.KUNWE, this.selectData2, selectData.MATNR, selectData.AUART, selectData.LGORT, selectData.INCO1);
    var zsd3014Model = new ZSDS3014Model("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0, 0, 0, "", 0, "", "","");

    var zsdModel = new ZSDEPSOENTRYInfoModel(zsd3014Model, zsd3013Model);
    var zsdList: ZSDEPSOENTRYInfoModel[] = [zsdModel];


    if (selectData.KUNNR === "" || selectData.KUNWE === "" || selectData.MATNR === "" || selectData.AUART === "" || selectData.INCO1 === "") {
      this.loadingVisible2 = false;
      this.cdr.detectChanges();
      return zsdList[0];
    }
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOENTRYInfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOENTRYInfoModelList", zsdList, QueryCacheType.None);
    this.popupData3.MEINS = resultModel[0].E_RETURN.MEINS;

    this.loadingVisible2 = false;
    //this.cdr.detectChanges();
    return resultModel[0];
  }

  // 주문생성
  public async createOrder() {
    var data = this.popupData;
    let fixData = { VKORG: "1000", VTWEG: "10",ZLOGFLG: "X", POSNR: "10", WERKS: "1000"/*, TAXK1: "2"*/ };
    let bstkd = new Date();
    let userInfo = this.authService.getUser().data; // 나중에 고객번호 가져올때 사용(업무포탈도)
    var zsds3100Model = new ZSDS3100Model(data.AUART, fixData.VKORG, fixData.VTWEG, this.selectData2, "", data.AUGRU, "", data.VDATU, bstkd, data.KUNNR, "", data.KUNWE, data.TDLNR, data.TDLNR2, data.INCO1, "", "", this.taxk1, "", "", "", data.ZCARTYPE, data.ZCARNO, data.ZDRIVER, data.ZPHONE, data.ZUNLOAD, fixData.ZLOGFLG, this.ZDOFLG, "", this.userid, this.username, "", data.ZPALLTP);
    var zsds6001Model = new ZSDS6001Model(fixData.POSNR, data.MATNR, data.KWMENG, "", fixData.WERKS, data.LGORT, 0, 0, "", data.VKAUS, this.mvgr1Value, this.mvgr2Value, this.mvgr3Value, 0 ,new Date);
    var zsds6002Model = new ZSDS6002Model(data.TEXT);

    var zsds6001List: ZSDS6001Model[] = [zsds6001Model];
    var zsds6002List: ZSDS6002Model[] = [zsds6002Model];
    var createModel = new ZSDCREATESODoModel("", "", "", "", "", "", zsds3100Model, zsds6001List, zsds6002List);
    var createModelList: ZSDCREATESODoModel[] = [createModel];
    var insertModel = await this.dataService.RefcCallUsingModel<ZSDCREATESODoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDCREATESODoModelList", createModelList, QueryCacheType.None);
    //debugger;
    return insertModel[0];
  }

  // 참조추가 RFC
  public async createOrder3() {
    var data = this.popupData3;
    let fixData = { VKORG: "1000", VTWEG: "10", ZLOGFLG: "X", POSNR: "10", WERKS: "1000"/*, TAXK1: "2"*/ };
    let bstkd = new Date();
    let userInfo = this.authService.getUser().data; // 나중에 고객번호 가져올때 사용(업무포탈도)
    var zsds3100Model = new ZSDS3100Model(data.AUART, fixData.VKORG, fixData.VTWEG, this.selectData2, "", data.AUGRU, "", data.VDATU, bstkd, data.KUNNR, "", data.KUNWE, data.TDLNR, data.TDLNR2, data.INCO1, "", "", this.taxk1, "", "", "", data.ZCARTYPE, data.ZCARNO, data.ZDRIVER, data.ZPHONE, data.ZUNLOAD, fixData.ZLOGFLG, this.ZDOFLG, "", this.userid, this.username, "", data.ZPALLTP);
    /*var zsds6001Model = new ZSDS6001Model(fixData.POSNR, data.MATNR, data.KWMENG, "", fixData.WERKS, data.LGORT, 0, 0, "", data.VKAUS, data.MVGR1, data.MVGR2, data.MVGR3, 0, new Date);*/
    var zsds6001Model = new ZSDS6001Model(fixData.POSNR, data.MATNR, data.KWMENG, "", fixData.WERKS, data.LGORT, 0, 0, "", data.VKAUS, this.mvgr1ValueB, this.mvgr2ValueB, this.mvgr3ValueB, 0, new Date);
    var zsds6002Model = new ZSDS6002Model(data.TEXT);

    var zsds6001List: ZSDS6001Model[] = [zsds6001Model];
    var zsds6002List: ZSDS6002Model[] = [zsds6002Model];

    var createModel = new ZSDCREATESODoModel("", "", "", "", "", "", zsds3100Model, zsds6001List, zsds6002List);
    var createModelList: ZSDCREATESODoModel[] = [createModel];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDCREATESODoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDCREATESODoModelList", createModelList, QueryCacheType.None);
/*    debugger;*/
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
    if (this.loadePeCount >= 50) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      //this.enteryLoading = false;
      this.dataLoad();
    }
  }
  addOrder(e: any) {
    this.clearEntery();
    //이벤트를 Blocking한다.
    this.BockingEnteryEvent(true);

    this.popupData = [];
    if (this.selectData2 === "20" || this.selectData2 ==="30") {
       this.nh = false;
    }
    setTimeout(async () => {
      this.taxkValue = 2
      if (this.selectData2 === "10" || this.selectData2 === "40") {   
    this.vkausValue = "A"
    this.zunloadValue = "10"
        this.incoValue = "NH2"
      }

      //Event을 발생시작한다.
      this.BockingEnteryEvent(false);
      this.loadingVisible2 = true;
      this.cdr.detectChanges();

      var model1 = new ZSDS3100Model("", "", "", "", "", "", "", new Date, new Date, "", "", "", "", "", this.incoValue, "", "", this.taxkValue, "", "", "", "", "", "", "", this.zunloadValue, "", "", "", "", "", "","");
      var model2 = new ZSDS6001Model("", "", 0, "", "", "", 0, 0, "", this.vkausValue, "", "", "",0, new Date);
      var model3 = new ZSDS6002Model("");

      var initData = Object.assign(model1, model2);
      initData = Object.assign(initData, model3);

      this.popupData = initData;
      console.log(this.popupData);

      this.loadingVisible2 = false;

      this.popupVisible = !this.popupVisible;
      this.cdr.detectChanges();
    }, 500);

    //this.dxForm.instance.resetValues();
    this.popupTitle = "주문등록/수정";
    this.saveVisible = true;

    
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
    this.zpalEntery.ClearSelectedValue();
  }

  /**
   * 화면변동 감지를 DIsable한다.
   * 
   * @param isDeattach
   */
  public refEnteryDetatch(isDeattach: boolean) {
    //팝업화면에 사용되는 엔트리 초기화

    //참조추가클리어
    if (isDeattach) {
      this.sd007Entery2B.detachRef();
      this.maktEntery2B.detachRef();
      this.kunnrEnteryB.detachRef();
      this.kunnEnteryB.detachRef();
      this.t001EnteryB.detachRef();
      this.tvlvEnteryB.detachRef();
      this.dd07tEnteryB.detachRef();
      this.incoEnteryB.detachRef();
      this.zcarnoModiCodeEnteryB.detachRef();
      this.tdlnrEnteryB.detachRef();
      this.tdlnr2EnteryB.detachRef();
      this.dd07tCarEnteryB.detachRef();
      this.augruEnteryB.detachRef();
      this.mvgr2EnteryB.detachRef();
      this.mvgr3EnteryB.detachRef();
      this.mvgr1EnteryB.detachRef();
      this.zpalEnteryB.detachRef();
    }
    else {
      this.sd007Entery2B.reattachRef();
      this.maktEntery2B.reattachRef();
      this.kunnrEnteryB.reattachRef();
      this.kunnEnteryB.reattachRef();
      this.t001EnteryB.reattachRef();
      this.tvlvEnteryB.reattachRef();
      this.dd07tEnteryB.reattachRef();
      this.incoEnteryB.reattachRef();
      this.zcarnoModiCodeEnteryB.reattachRef();
      this.tdlnrEnteryB.reattachRef();
      this.tdlnr2EnteryB.reattachRef();
      this.dd07tCarEnteryB.reattachRef();
      this.augruEnteryB.reattachRef();
      this.mvgr2EnteryB.reattachRef();
      this.mvgr3EnteryB.reattachRef();
      this.mvgr1EnteryB.reattachRef();
      this.zpalEnteryB.reattachRef();
    }

  }

  public clearRefEntery() {
    //팝업화면에 사용되는 엔트리 초기화

    //this.refEnteryDetatch(true);

    //참조추가클리어
    this.sd007Entery2B.ClearSelectedValue();
    this.maktEntery2B.ClearSelectedValue();
    this.kunnrEnteryB.ClearSelectedValue();
    this.kunnEnteryB.ClearSelectedValue();
    this.t001EnteryB.ClearSelectedValue();
    this.tvlvEnteryB.ClearSelectedValue();
    this.dd07tEnteryB.ClearSelectedValue();
    this.incoEnteryB.ClearSelectedValue();
    this.zcarnoModiCodeEnteryB.ClearSelectedValue();
    this.tdlnrEnteryB.ClearSelectedValue();
    this.tdlnr2EnteryB.ClearSelectedValue();
    this.dd07tCarEnteryB.ClearSelectedValue();
    this.augruEnteryB.ClearSelectedValue();
    this.mvgr2EnteryB.ClearSelectedValue();
    this.mvgr3EnteryB.ClearSelectedValue();
    this.mvgr1EnteryB.ClearSelectedValue();
    this.zpalEnteryB.ClearSelectedValue();

    //this.cdr.detectChanges();

    //this.refEnteryDetatch(false);
   
  }

  public clearPopEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    
    //상세조회
    this.sd007Entery2A.ClearSelectedValue();
    this.maktEntery2A.ClearSelectedValue();
    this.kunnrEnteryA.ClearSelectedValue();
    this.kunnEnteryA.ClearSelectedValue();
    this.t001EnteryA.ClearSelectedValue();
    this.tvlvEnteryA.ClearSelectedValue();
    this.dd07tEnteryA.ClearSelectedValue();
    this.incoEnteryA.ClearSelectedValue();
    this.zcarnoModiCodeEnteryA.ClearSelectedValue();
    this.tdlnrEnteryA.ClearSelectedValue();
    this.tdlnr2EnteryA.ClearSelectedValue();
    this.dd07tCarEnteryA.ClearSelectedValue();
    this.augruEnteryA.ClearSelectedValue();
    this.mvgr2EnteryA.ClearSelectedValue();
    this.mvgr3EnteryA.ClearSelectedValue();
    this.mvgr1EnteryA.ClearSelectedValue();
  }

  /**
   * 이벤트 발생을 Block 할지 여부
   * 
   * @param isBocking Ture이면 Blocking
   */
  public BockingEnteryEvent(isBocking: boolean) {
    if (isBocking) {
      this.sd007Entery2.SetEventBocking();

      //this.sd007Entery3.SetEventBocking();
      this.maktEntery2.SetEventBocking();
      this.kunnEntery.SetEventBocking();
      this.dd07tEntery.SetEventBocking();
      this.dd07tCarEntery.SetEventBocking();
      this.tdlnrEntery.SetEventBocking();
      this.tdlnr2Entery.SetEventBocking();
      this.t001Entery.SetEventBocking();
      this.kunnrEntery.SetEventBocking();
      this.incoEntery.SetEventBocking();
      this.tvlvEntery.SetEventBocking();
      this.mvgr1Entery.SetEventBocking();
      this.mvgr2Entery.SetEventBocking();
      this.mvgr3Entery.SetEventBocking();
      this.augruEntery.SetEventBocking();
      this.zcarnoModiCodeEntery.SetEventBocking();
      this.zpalEntery.SetEventBocking();

      //참조추가클리어
      this.sd007Entery2B.SetEventBocking();
      this.maktEntery2B.SetEventBocking();
      this.kunnrEnteryB.SetEventBocking();
      this.kunnEnteryB.SetEventBocking();
      this.t001EnteryB.SetEventBocking();
      this.tvlvEnteryB.SetEventBocking();
      this.dd07tEnteryB.SetEventBocking();
      this.incoEnteryB.SetEventBocking();
      this.zcarnoModiCodeEnteryB.SetEventBocking();
      this.tdlnrEnteryB.SetEventBocking();
      this.tdlnr2EnteryB.SetEventBocking();
      this.dd07tCarEnteryB.SetEventBocking();
      this.augruEnteryB.SetEventBocking();
      this.mvgr2EnteryB.SetEventBocking();
      this.mvgr3EnteryB.SetEventBocking();
      this.mvgr1EnteryB.SetEventBocking();
      this.zpalEnteryB.SetEventBocking();
      //상세조회
      this.sd007Entery2A.SetEventBocking();
      this.maktEntery2A.SetEventBocking();
      this.kunnrEnteryA.SetEventBocking();
      this.kunnEnteryA.SetEventBocking();
      this.t001EnteryA.SetEventBocking();
      this.tvlvEnteryA.SetEventBocking();
      this.dd07tEnteryA.SetEventBocking();
      this.incoEnteryA.SetEventBocking();
      this.zcarnoModiCodeEnteryA.SetEventBocking();
      this.tdlnrEnteryA.SetEventBocking();
      this.tdlnr2EnteryA.SetEventBocking();
      this.dd07tCarEnteryA.SetEventBocking();
      this.augruEnteryA.SetEventBocking();
      this.mvgr2EnteryA.SetEventBocking();
      this.mvgr3EnteryA.SetEventBocking();
      this.mvgr1EnteryA.SetEventBocking();
    }
    else {
      this.sd007Entery2.ClearEventBlocking();

      //this.sd007Entery3.ClearEventBlocking();
      this.maktEntery2.ClearEventBlocking();
      this.kunnEntery.ClearEventBlocking();
      this.dd07tEntery.ClearEventBlocking();
      this.dd07tCarEntery.ClearEventBlocking();
      this.tdlnrEntery.ClearEventBlocking();
      this.tdlnr2Entery.ClearEventBlocking();
      this.t001Entery.ClearEventBlocking();
      this.kunnrEntery.ClearEventBlocking();
      this.incoEntery.ClearEventBlocking();
      this.tvlvEntery.ClearEventBlocking();
      this.mvgr1Entery.ClearEventBlocking();
      this.mvgr2Entery.ClearEventBlocking();
      this.mvgr3Entery.ClearEventBlocking();
      this.augruEntery.ClearEventBlocking();
      this.zcarnoModiCodeEntery.ClearEventBlocking();
      this.zpalEntery.ClearEventBlocking();

      //참조추가클리어
      this.sd007Entery2B.ClearEventBlocking();
      this.maktEntery2B.ClearEventBlocking();
      this.kunnrEnteryB.ClearEventBlocking();
      this.kunnEnteryB.ClearEventBlocking();
      this.t001EnteryB.ClearEventBlocking();
      this.tvlvEnteryB.ClearEventBlocking();
      this.dd07tEnteryB.ClearEventBlocking();
      this.incoEnteryB.ClearEventBlocking();
      this.zcarnoModiCodeEnteryB.ClearEventBlocking();
      this.tdlnrEnteryB.ClearEventBlocking();
      this.tdlnr2EnteryB.ClearEventBlocking();
      this.dd07tCarEnteryB.ClearEventBlocking();
      this.augruEnteryB.ClearEventBlocking();
      this.mvgr2EnteryB.ClearEventBlocking();
      this.mvgr3EnteryB.ClearEventBlocking();
      this.mvgr1EnteryB.ClearEventBlocking();
      this.zpalEnteryB.ClearEventBlocking();

      //상세조회
      this.sd007Entery2A.ClearEventBlocking();
      this.maktEntery2A.ClearEventBlocking();
      this.kunnrEnteryA.ClearEventBlocking();
      this.kunnEnteryA.ClearEventBlocking();
      this.t001EnteryA.ClearEventBlocking();
      this.tvlvEnteryA.ClearEventBlocking();
      this.dd07tEnteryA.ClearEventBlocking();
      this.incoEnteryA.ClearEventBlocking();
      this.zcarnoModiCodeEnteryA.ClearEventBlocking();
      this.tdlnrEnteryA.ClearEventBlocking();
      this.tdlnr2EnteryA.ClearEventBlocking();
      this.dd07tCarEnteryA.ClearEventBlocking();
      this.augruEnteryA.ClearEventBlocking();
      this.mvgr2EnteryA.ClearEventBlocking();
      this.mvgr3EnteryA.ClearEventBlocking();
      this.mvgr1EnteryA.ClearEventBlocking();
    }
  }
}
