/*
 * W/O 작업결과등록
 */
import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Output } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { BrowserModule } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { ZPMF0001Model, ZPMS0002Model } from '../../../shared/dataModel/MFMPO/ZPmF0001Proxy';
import { ZPMF0002Model, ZPMS0004Model } from '../../../shared/dataModel/MFMPO/ZPmF0002Proxy';
import { ZPMF0004Model } from '../../../shared/dataModel/MFMPO/ZPmF0004Proxy';
import { ZPMF0003Model, ZPMT0010Model, ZPMT0020Model, ZPMS0009Model, ZPMS0012Model } from '../../../shared/dataModel/MFMPO/ZPmF0003Proxy';
import { ZPMF0006Model, ZPMS0008Model, ZPMS0024Model } from '../../../shared/dataModel/MFMPO/ZPmF0006Proxy';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Product, ConHeadFormData, AppStatus, equipFormModel } from './app.service';
import { DxDataGridComponent, DxTextBoxComponent, } from 'devextreme-angular';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import ArrayStore from 'devextreme/data/array_store';
import { confirm, alert } from "devextreme/ui/dialog";
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import dxTextBox from 'devextreme/ui/text_box';
import { async } from '@angular/core/testing';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid } from 'devextreme/excel_exporter';
import jsPDF from 'jspdf';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: './worr.component.html',
  styleUrls: ['./worr.component.scss'],
  providers: [ImateDataService, Service],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WORRComponent implements OnInit {
  @ViewChild('gcOrderGrid', { static: false }) gcOrderGrid!: DxDataGridComponent;
  @ViewChild('gcContractList', { static: false }) gcContractList!: DxDataGridComponent;
  @ViewChild('gcMatList', { static: false }) gcMatList!: DxDataGridComponent;
  
  @ViewChild('test1Entery', { static: false }) test1Entery!: CommonPossibleEntryComponent;
  @ViewChild('test2Entery', { static: false }) test2Entery!: CommonPossibleEntryComponent;
  @ViewChild('test3Entery', { static: false }) test3Entery!: CommonPossibleEntryComponent;
  @ViewChild('test4Entery', { static: false }) test4Entery!: CommonPossibleEntryComponent;
  @ViewChild('popupDataGrid', { static: false }) popupDataGrid!: DxDataGridComponent;
  @ViewChild('gcMaterialList', { static: false }) gcMaterialList!: DxDataGridComponent;
  @ViewChild('text1', { static: false }) text1!: DxTextBoxComponent;
  @ViewChild('text2', { static: false }) text2!: DxTextBoxComponent;
  @ViewChild('text3', { static: false }) text3!: DxTextBoxComponent;
  callbacks = [];

  /**
 * 선택한 코드의 전체 키 값
 */
  @Output()
  selectedCodes: string[] = [];
  products: any;
  gridBoxValue: number[] = [4];
  isGridBoxOpened: boolean;
  displayExpr: string;
  gridColumns: any = ['그룹코드', '그룹명', '코드', '코드명'];
  test1Code: TableCodeInfo
  test2Code: TableCodeInfo
  test3Code: TableCodeInfo
  test4Code: TableCodeInfo
  selectedLike: string;
  t023tCode: TableCodeInfo
  localappConfig: AppConfigService;
  selectedValue: string;

  test1Value: string | null = null;
  test2Value: string | null = null;
  test3Value: string | null = null;
  test4Value: string | null = null;

  test1Adapter =
    {
      getValue: () => {
        return this.test1Value;
      },
      applyValidationResults: (e: any) => {
        this.test1Entery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //dataSource: any;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;

  //오더데이터
  orderData: any;
  //오더내역
  orderInfo: any;
  //작업목록
  workOrderList: any;
  //작업계약리스트
  workContractList: any;
  //고장원인
  FaultInfo: ZPMS0009Model[] = [];
  //고장원인 그리드
  FaultInfoList: any;
  //계약리스트
  contractList: any;
  //작업계약헤더리스트
  contHeadList: ZPMS0024Model[] = [];
  //고장(사유)추가
  ReasonInfo: any;
  //고장(액티비티)추가
  ActiInfo: any;

  appStatus: AppStatus[] = [];

  selectedAppStatus: string = "O";

  //버튼
  exportSelectedData: any;
  searchButtonOptions: any;
  closeButtonOptions: any;
  applyPopupButton: any;
  popupcloseButtonOptions: any;
  fapopupcloseButtonOptions: any;
  savesButtonOptions: any;
  conSaveButtonOptions: any;

  zpmF002Models: ZPMF0002Model[] = [];
  zpmF003Models: ZPMS0009Model[] = [];

  //현재날짜
  now: Date = new Date();
  startDate: any;
  endDate: any;
  //date box
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  collapsed = false;
  selectedMaterKey: number = -1;
  rowCount: number;

  _dataService: ImateDataService;
  //상세팝업 오픈
  popupVisible = false;

  //줄 선택
  selectedOrderRowIndex = -1;
  selectedOrderItemKeys: any[] = [];

  //줄 선택
  selectedRowIndex = -1;
  selectedItemKeys: any[] = [];

  //줄 선택
  reasonselectedOrderRowIndex = -1;
  reasonselectedOrderItemKeys: any[] = [];

  //줄 선택
  selectedFaultInfoRowIndex = -1;
  selectedFaultInfoItemKeys: any[] = [];

  selectedMerterialRowIndex = -1;
  selectedMerterialItemKeys: any[] = [];
  formData: any = {};
  popupMode = 'Add';
  customOperations: Array<any>;
  isPopupVisible = false;
  faPopupVisible = false;

  //설비 폼데이터
  equipFormData: equipFormModel = new equipFormModel();

  //계약리스트 선택행
  gcMaterialListSelectedRows: ZPMS0008Model[] = [];
  //고장추가 사유
  gcReasonListSelectedRows: ZPMS0009Model[] = [];
  //고장추가 액티비티
  gcActivityListSelectedRows: ZPMS0009Model[] = [];

  workList: ZPMT0020Model[] = [];
  contList: ZPMT0010Model[] = [];
  faultList: ZPMS0009Model[] = [];
  matUseList: ZPMS0004Model[] = [];

  conGroupKDATBText: any;

  //선택된 통지번호
  qmnum: string = "";

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //버튼 제한
  isDisabled: boolean = false;

  //그리드 수정제한
  isEditing: boolean = true;
  empId: string = "";
  rolid: string[] = [];

  private loadePeCount: number = 0;

  selectedRows: any;

  workingDate: any;

  //_dataService: ImateDataService;
  /**
 * 생성자
 * @param appConfig 앱 수정 정보
 * @param nbpAgetService nbpAgent Service
 * @param authService 사용자 인증 서버스
 */

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private authService: AuthService, private appInfo: AppInfoService,
    private http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, service: Service) {
    appInfo.title = AppInfoService.APP_TITLE + " | W/O 작업결과등록";
    //possible-entry
    this.isGridBoxOpened = false;
    this.displayExpr = "";
    this.localappConfig = appConfig;
    this.selectedValue = "Z100";
    this.selectedLike = "A%";

    this.appStatus = service.getAppStatusList();
    let userInfo = this.authService.getUser().data;
    this.rolid = userInfo?.role;
    if(this.rolid.find(item=>item==="ADMIN") === undefined)
      this.empId = userInfo?.empId.padStart(10, '0');
    
    let usrInfo = authService.getUser();
    console.info(usrInfo);
    console.info();

    //date
    var now = new Date();
    this.startDate = formatDate(new Date(), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(now.setDate(now.getDate() + 1), "yyyy-MM-dd", "en-US");

    this.workingDate = formatDate(new Date(), "yyyy-MM-dd", "en-US");

    const that = this;
    let test = this;
    this.rowCount = 0;
    
    //필터
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
    this._dataService = dataService;
    this.imInfo = imInfo;
    /*this.t023tCode = appConfig.tableCode("제품구분");*/

    this.test1Code = appConfig.tableCode("오브젝트파트")
    this.test2Code = appConfig.tableCode("손상")
    this.test3Code = appConfig.tableCode("사유")
    this.test4Code = appConfig.tableCode("액티비티")

    this.rowCount = 0;


    //엑셀버튼
    this.exportSelectedData = {
      icon: 'print',
      text: "프린터",
      onClick: async () => {
        const doc = new jsPDF('landscape', 'mm', [297, 210]);
        let malgun = await this.http.get('assets/malgun.ttf', { responseType: "text" }).toPromise();

        doc.addFileToVFS('malgun.ttf', malgun);
        doc.addFont('malgun.ttf', 'malgun', 'normal');
        doc.setFont('malgun');
        doc.setLanguage("ko-KR");

        exportDataGridToPdf({
          jsPDFDocument: doc,
          component: this.gcOrderGrid.instance,
          margin: { top: 10, left: 5, right: 5, bottom: 5 },
          customizeCell: function (options) {
            const { gridCell, pdfCell } = options;

            if (gridCell.rowType === 'data') {
              pdfCell.font = { size: 10 };
              pdfCell.wordWrapEnabled = true;
            }
          }
        }).then(() => {
          doc.autoPrint({ variant: 'non-conform' });
          doc.output('dataurlnewwindow');
          //doc.save('wost.pdf');
        })

      },
    };

    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadingVisible = true;
        await this.dataLoad(this.imInfo, this.dataService);
        this.loadingVisible = false;
        /*this.dataGrid.instance.refresh();*/
      },
    };

    //팝업닫기버튼
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;

      },
    };

    this.popupcloseButtonOptions = {
      icon: 'close',
      onClick(e: any) {
        that.isPopupVisible = false;
      },
    };

    this.fapopupcloseButtonOptions = {
      icon: 'close',
      onClick(e: any) {
        that.faPopupVisible = false;
        this.test1Entery.ClearSelectedValue();
        this.test2Entery.ClearSelectedValue();
        this.test3Entery.ClearSelectedValue();
        this.test4Entery.ClearSelectedValue();
        this.text1.value = "";
        this.text2.value = "";
        this.text3.value = "";
      },
    };

    //팝업저장버튼
    this.savesButtonOptions = {
      text: 'Save',
      onClick: () => {

        that.popupVisible = false;
      },
    };

    //적용 버튼
    this.applyPopupButton = {
      text: "등록",
      onClick: async (e: any) => {

        let result = e.validationGroup.validate();
        if (!result.isValid) {
          alert("필수값을 입력하세요.", "알림");
        }
        else {
          /*var count: number = 1;*/
          var objCount: number = 1;
          var damCount: number = 1;
          var reaCount: number = 1;
          var actCount: number = 1;

          var deleteIndex: number[] = [];

          var selectedValue = this.orderInfo;

          //선택된 키에 해당하는 데이터 이동
          this.FaultInfo.forEach(async (row: any, index) => {
            if (row.POSNR === selectedValue.POSNR) deleteIndex.push(index);
          });

          //역순으로 정렬
          deleteIndex.sort((a, b) => (a > b ? -1 : 1));

          //선택한 키에 해당하는 데이터 삭제
          deleteIndex.forEach(async (index: number) => {
            this.FaultInfo.splice(index, 1);
          });

          /*this.FaultInfo = [];*/
          var objPart = this.test1Entery.popupDataGridComm.instance.getSelectedRowsData();
          var damPart = this.test2Entery.popupDataGridComm.instance.getSelectedRowsData();
          var reaPart = this.test3Entery.popupDataGridComm.instance.getSelectedRowsData();
          var actPart = this.test4Entery.popupDataGridComm.instance.getSelectedRowsData();
          if (objPart.length > 0) {
            // 나중에 원인번호 바꾸기 (this.orderInfo.CAUSE_KEY)
            this.FaultInfo.push(new ZPMS0009Model(this.orderInfo.NOTIF_NO, this.orderInfo.POSNR, objCount.toString().padStart(4, '0'), "B", objPart[0].CODEGRUPPE, objPart[0].KURZTEXT_GR, objPart[0].CODE, objPart[0].KURZTEXT_CODE, "", "위치", 0));
            objCount = objCount +1;
          }
          if (damPart.length > 0) {
            this.FaultInfo.push(new ZPMS0009Model(this.orderInfo.NOTIF_NO, this.orderInfo.POSNR, damCount.toString().padStart(4, '0'), "C", damPart[0].CODEGRUPPE, damPart[0].KURZTEXT_GR, damPart[0].CODE, damPart[0].KURZTEXT_CODE, this.text1.value, "손상", 1));
            damCount = damCount + 1;
          }

          console.log(this.ActiInfo);
          console.log(this.ReasonInfo);

          this.ActiInfo.forEach(async (row: ZPMS0009Model) => {

            //var checkData = this.faultList.find(item => item.CODE === row.CODE);
            //if (checkData === undefined) {
            this.FaultInfo.push(new ZPMS0009Model(this.orderInfo.NOTIF_NO, this.orderInfo.POSNR, actCount.toString().padStart(4, '0'), "A", row.CODEGRUPPE, row.KURZTEXT_GR, row.CODE, row.KURZTEXT_CODE, row.FETXT, "해결", 3));
            actCount = actCount + 1;
            //}
          });
          this.ReasonInfo.forEach(async (row: ZPMS0009Model) => {

            //var checkData = this.faultList.find(item => item.CODE === row.CODE);
            //if (checkData === undefined) {
            this.FaultInfo.push(new ZPMS0009Model(this.orderInfo.NOTIF_NO, this.orderInfo.POSNR, reaCount.toString().padStart(4, '0'), "5", row.CODEGRUPPE, row.KURZTEXT_GR, row.CODE, row.KURZTEXT_CODE, row.FETXT, "원인", 2));
            reaCount = reaCount + 1;
            //}
          });

        }

        this.test1Entery.ClearSelectedValue();
        this.test2Entery.ClearSelectedValue();
        this.test3Entery.ClearSelectedValue();
        this.test4Entery.ClearSelectedValue();
        this.text1.value = "";
        this.text2.value = "";
        this.text3.value = "";


        that.faPopupVisible = false;

        this.FaultInfoList = new ArrayStore(
          {
            key: ["NOTIF_NO", "POSNR", "CAUSE_KEY", "KATALOGART", "CODEGRUPPE", "CODE"],
            data: this.FaultInfo
          });

        /*this.gcMaterialList.instance.refresh();*/

      },
    }

    this.conSaveButtonOptions = {
      text: "등록",
      onClick: async () => {
        await this.ReqRecords();
      }
    }



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
    if (this.loadePeCount >= 4) {

      this.dataLoad(this.imInfo, this.dataService);
      this.loadingVisible = false;
      this.loadePeCount = 0;
    }
  }

  //단가항목등록 데이터 변경이벤트
  async gridDataUpdating(e: any) {
    var inputTotpay = e.oldData.NETPR * Number(e.newData.QTY_REQ);
    var changeHeadData = this.contHeadList.find(item => item.EBELN === e.oldData.EBELN);
    var wrbtr_bas = changeHeadData?.WRBTR_BAS ?? 0;
    var netwr = changeHeadData?.RLWRT ?? 0;
    /*var wrbtr_m =  Number(changeItemData?.ZZPAY_MENGE ?? 0) * Number(changeItemData?.ZZPAY_NETPR ?? 0) + wrbtr_bas;*/
    var mnsPay = netwr - wrbtr_bas;

    var addData = { QTY_BPREI_TOT: inputTotpay };

    if (mnsPay < inputTotpay) {
      alert("남은 계약금액보다 크게 입력할 수 없습니다. 남은금액 : " + mnsPay.toString(), "오류")
      addData = { QTY_BPREI_TOT: 0 };
      e.newData.QTY_REQ = "0";
    }

    e.newData = Object.assign(e.newData, addData);
  }

  /**
   * Angular 초가화
   **/
  async ngOnInit() {
    this.loadingVisible = true;
  }

  workingDateChange(e: any) {
    //for (var row of this.contList) {
    //  row.REDAT = e.value;
    //} 
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  //메인 더블클릭시 팝업
  async dblClick(e: any) {
    /*this.showPopup('Add', {}); //change undefined to {}*/
    

    this.loadingVisible = true;
    this.isPopupVisible = false;
    this.faPopupVisible = false;
    this.qmnum = e.data.QMNUM;

    //설비정보 추가
    this.equipFormData.EQUNR = e.data.EQUNR;
    this.equipFormData.EQUNR_DESC = e.data.EQUNR_DESC;
    this.equipFormData.AUFNR = e.data.AUFNR;
    this.equipFormData.KTEXT = e.data.KTEXT;
    this.equipFormData.STAT = e.data.STAT;

    await this.detaildatareload(this);
    this.popupVisible = true;
    this.loadingVisible = false;
    //this.showPopup('Add', {}); //change undefined to {}
  }

  //데이터 다시 로드
  async detaildatareload(thisObj: WORRComponent) {
    /*thisObj.loadingVisible = true;*/
    thisObj.zpmF002Models = await thisObj.detaildataLoad(thisObj, thisObj.selectedOrderItemKeys[0].AUFNR);

    var resultModel = thisObj.zpmF002Models;

    //if (resultModel[0].E_TYPE !== "S") {
    //  alert(`상세 자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`);
    //}

    thisObj.workList = resultModel[0].ITAB_DATA6;
    thisObj.contList = resultModel[0].ITAB_DATA5;

    
    thisObj.FaultInfo = resultModel[0].ITAB_DATA4

    thisObj.matUseList = resultModel[0].ITAB_DATA3;

    var checkStat = thisObj.contList.find(row => row.STAT === "I" || row.STAT === "C");

    if (checkStat !== undefined) {
      thisObj.isDisabled = true;
      thisObj.isEditing = false;
    } else {
      thisObj.isDisabled = false;
      thisObj.isEditing = true;
    }

    thisObj.workOrderList = new ArrayStore(
      {
        key: ["AUFNR", "PAY_CNT", "QMNUM", "EBELN", "EBELP", "PAYITEM"],
        data: thisObj.workList
      });

    thisObj.workContractList = new ArrayStore(
      {
        key: ["AUFNR", "PAY_CNT", "EBELN"],
        data: thisObj.contList
      });

    thisObj.FaultInfo.forEach(async (row: ZPMS0009Model) => {
      if (row.KATALOGART === "C") {
        row.KATALNAME = "손상";
        row.SORT = 1;
      } else if (row.KATALOGART === "B") {
        row.KATALNAME = "위치";
        row.SORT = 0;
      } else if (row.KATALOGART === "5") {
        row.KATALNAME = "원인";
        row.SORT = 2;
      } else if (row.KATALOGART === "A") {
        row.KATALNAME = "해결";
        row.SORT = 3;
      }
    });
    
    thisObj.FaultInfoList = new ArrayStore(
      {
        key: ["NOTIF_NO", "POSNR", "CAUSE_KEY", "KATALOGART", "CODEGRUPPE", "CODE"],
        data: thisObj.FaultInfo
      });
      
    /*thisObj.loadingVisible = false;*/

  }
  //팝업이벤트
  showPopup(popupMode: any, data: any): void {
    this.formData = {};
    console.log(data);
    console.log(this.formData);

    this.formData = data;
    this.popupMode = popupMode;
    this.popupVisible = true;
    this.isPopupVisible = true;
    console.log(this.formData);
  }

  //팝업이벤트2
  showPopup2(popupMode: any, data: any): void {
    this.formData = {};
    console.log(data);
    console.log(this.formData);

    this.formData = data;
    this.popupMode = popupMode;
    this.faPopupVisible = true;
    console.log(this.formData);
  }

  //검수구분 변경 이벤트
  onAppStatusChanged(e: any) {
    this.selectedAppStatus = e.value;
  }

  //날짜
  //get diffInDay() {
  //  return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  //}
  makeAsyncDataSource(service: Service) {
    return new CustomStore({
      loadMode: 'raw',
      key: ['GCODE', 'GCODENM', 'SCODE', 'SCODENM'],
      load() {
        return service.getProduct();
      },
    });
  }

  //작업결과등록
  //AddRecords() {
  //  this.selectedOrderItemKeys.forEach((key: any) => {
  //    this.orderData.addRow();
  //  });
  //  this.dataGrid.instance.saveEditData();
  //}

  //계약추가 팝업
  addRow: any = async (e: any) => {
    this.loadingVisible = true;

    this.contractList = new ArrayStore(
      {
        key: ["EBELN", "EBELP"],
        data: []
      });

    var selectData = this.gcOrderGrid.instance.getSelectedRowsData();

    //잘못된 단가도출을 방지하기위해 로그인 업체코드와 데이터 업체코드 체크로직 추가
    if (this.rolid.find(item => item === "ADMIN") === undefined) {
      if (this.empId !== selectData[0].PARNR.toString().padStart(10, "0")) {
        await alert("로그인 업체와 데이터가 상이합니다.</br>담당자에게 문의하세요.", "알림");
        return;
      }
    }

    var resultModel = await this.popupdataLoad(this.imInfo, this.dataService) as ZPMF0006Model;
    this.loadingVisible = false;
    if (resultModel.ITAB_DATA2.length === 0) {
      alert("해당 W/O에 단가항목정보가 없습니다.", "알림");
      
      return;
    }

    var dataModel = resultModel.ITAB_DATA2;

    //계약명 추가
    dataModel.forEach(async (row: ZPMS0008Model) => {
      var connm = resultModel.ITAB_DATA1.find(item => item.EBELN === row.EBELN);
      if (connm !== undefined) {
        row.CONNM = connm.CONNM;
        //row.KDATB = connm.KDATB.getFullYear().toString() + "-" + connm.KDATB.getMonth().toString() + "-" + connm.KDATB.getDay().toString();
        //row.KDATE = connm.KDATE.getFullYear().toString() + "-" + connm.KDATE.getMonth().toString() + "-" + connm.KDATE.getDay().toString();
        row.KDATB = connm.KDATB;
        row.KDATE = connm.KDATE;

      } 
    });
    
    this.contHeadList = resultModel.ITAB_DATA1;
    this.contractList = new ArrayStore(
      {
        key: ["EBELN", "EBELP"],
        data: resultModel.ITAB_DATA2
      });

    this.gcMatList.instance.clearSelection();
    this.gcMatList.instance.getScrollable().scrollTo(0);

    var selectKeys = [];
    for (var row of this.workList) {
      var selectKey = { EBELN: row.EBELN, EBELP: row.EBELP };
      selectKeys.push(selectKey);
    }
    this.selectedRows = selectKeys;
    /*this.gcMatList.instance.selectRows(selectKeys, false);*/

    this.loadingVisible = false;
    this.isPopupVisible = true;
    //this.showPopup('Add', {}); //change undefined to {}
  }

  //고장추가 팝업
  addRow2: any = async (e: any) => {
    if (this.qmnum === "") {
      alert("통지번호가 없습니다.", "알림");
      return;
    }

    var posnr: string = "";
    var causeKey: string = "";
      
    var selectData = this.gcMaterialList.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      if (this.FaultInfo.length === 0) {
        posnr = "1".padStart(4, '0');
        causeKey = "1".padStart(4, '0');
      } else {
        var iPosnr = Number(this.FaultInfo.reduce((op, item: any) => op = op > item.POSNR ? op : item.POSNR, "0")) + 1;
        var iCauseKey = Number(this.FaultInfo.reduce((op, item: any) => op = op > item.CAUSE_KEY ? op : item.CAUSE_KEY, "0")) + 1;
        posnr = iPosnr.toString().padStart(4, '0');
        causeKey = iCauseKey.toString().padStart(4, '0');
      }

      this.test1Entery.ClearSelectedValue();
      this.test2Entery.ClearSelectedValue();
      this.test3Entery.ClearSelectedValue();
      this.test4Entery.ClearSelectedValue();

    } else {
      posnr = selectData[0].POSNR;
      causeKey = selectData[0].CAUSE_KEY
    }
        

    this.showPopup2('Add', {}); //change undefined to {}
    this.orderInfo = { NOTIF_NO: this.qmnum, POSNR: posnr, CAUSE_KEY: causeKey };

    /*팝업에 데이터 넣어주기*/
    //this.test1Value = selectData[0].CODE;

    /*넣어주기 끝*/
    this.ReasonInfo = [];
    this.ActiInfo = [];

    this.FaultInfo.forEach(async (row: ZPMS0009Model) => {

      if (row.NOTIF_NO === selectData[0].NOTIF_NO && row.POSNR === selectData[0].POSNR) {
        if (row.KATALOGART === "B") {
          this.test1Value = row.CODE;
        }
        else if (row.KATALOGART === "C") {
          this.test2Value = row.CODE;
          this.text1.value = row.FETXT;
        }
        else if (row.KATALOGART === "5") {
          this.ReasonInfo.push(new ZPMS0009Model(this.qmnum, posnr, row.CAUSE_KEY, "5", row.CODEGRUPPE, row.KURZTEXT_GR, row.CODE, row.KURZTEXT_CODE, row.FETXT));
        }
          else if (row.KATALOGART === "A") {
          this.ActiInfo.push(new ZPMS0009Model(this.qmnum, posnr, row.CAUSE_KEY, "A", row.CODEGRUPPE, row.KURZTEXT_GR, row.CODE, row.KURZTEXT_CODE, row.FETXT));
        }
        
      }
    });


    /*this.loadingVisible = true; */
    //await this.faultdataload(this, selectData[0].NOTIF_NO);
    /*this.loadingVisible = false;*/


  }

  //검수요청, 작업결과등록 저장
  public async datainsert2(thisObj: WORRComponent) {
    /*
    var zpf0003Model = new ZPMF0003Model("", "", "", []);

    var contract = await (thisObj.contractList as ArrayStore)

    zpf0003Model.ITAB_DATA2.push(new ZPMS0009Model(this.FaultInfo.NOTIF_NO, this.FaultInfo.POSNR, this.FaultInfo.CAUSE_KEY, this.FaultInfo.KARALOGART, this.FaultInfo.CODEGRUPPE, this.FaultInfo.KURZTEXT_GR, this.FaultInfo.CODE, this.FaultInfo.KURZTEXT_CODE, this.FaultInfo.FETXT));

    zpf0003Model.ITAB_DATA3.push(new ZPMT0010Model(thisObj.appConfig.mandt, this.workContractList.AUFNR, this.workContractList.PAT_CNT, this.workContractList.REDAT, this.workContractList.CODAT, this.workContractList.BUDAT, this.workContractList.EBELN, this.workContractList.BELNR, this.workContractList.LIFNR, this.workContractList.GJAHR, this.workContractList.STAT,
      this.workContractList.ERNAM, this.workContractList.ERDAT, this.workContractList.ERZET, this.workContractList.AENAM, this.workContractList.AEDAT, this.workContractList.AEZET));

    zpf0003Model.ITAB_DATA4.push(new ZPMT0020Model(thisObj.appConfig.mandt, this.workOrderList.AUFNR, this.workOrderList.PAY_CNT, this.workOrderList.EBELN, this.workOrderList.EBELP, this.workOrderList.PAYITEM, this.workOrderList.QTY_REQ, this.workOrderList.QTY_CON,
      this.workOrderList.AENAM, this.workOrderList.ERNAM, this.workOrderList.ERZAT, this.workOrderList.AENAM, this.workOrderList.AEDAT, this.workOrderList.AEZET));
      */

    //var zpm0009mo = new ZPMS0009Model(this.FaultInfo.NOTIF_NO, this.FaultInfo.POSNR, this.FaultInfo.CAUSE_KEY, this.FaultInfo.KARALOGART, this.FaultInfo.CODEGRUPPE, this.FaultInfo.KURZTEXT_GR, this.FaultInfo.CODE, this.FaultInfo.KURZTEXT_CODE, this.FaultInfo.FETXT);

    //var zpm0010mo = new ZPMT0010Model(thisObj.appConfig.mandt, this.workContractList.AUFNR, this.workContractList.PAT_CNT, this.workContractList.REDAT, this.workContractList.CODAT, this.workContractList.BUDAT, this.workContractList.EBELN, this.workContractList.BELNR, this.workContractList.LIFNR, this.workContractList.GJAHR, this.workContractList.STAT,
    //  this.workContractList.ERNAM, this.workContractList.ERDAT, this.workContractList.ERZET, this.workContractList.AENAM, this.workContractList.AEDAT, this.workContractList.AEZET);

    //var zpm0020mo = new ZPMT0020Model(thisObj.appConfig.mandt, this.workOrderList.AUFNR, this.workOrderList.PAY_CNT, this.workOrderList.EBELN, this.workOrderList.EBELP, this.workOrderList.PAYITEM, this.workOrderList.QTY_REQ, this.workOrderList.QTY_CON,
    //  this.workOrderList.AENAM, this.workOrderList.ERNAM, this.workOrderList.ERZAT, this.workOrderList.AENAM, this.workOrderList.AEDAT, this.workOrderList.AEZET)

    //var zpm09List: ZPMS0009Model[] = [zpm0009mo]; 
    //var zpm10List: ZPMT0010Model[] = [zpm0010mo];
    //var zpm20List: ZPMT0020Model[] = [zpm0020mo];
    //var zpm12List: ZPMS0012Model[] = [];


    //작업항목담기
    //var zpmt0020List: ZPMT0020Model[] = [];
    //thisObj.workList.forEach(async (row: ZPMT10011Model) => {
    //  zpmt0020List.push(new ZPMT0020Model(thisObj.appConfig.mandt, thisObj.selectedOrderItemKeys[0].AUFNR, "1", "", "",
    //    row.PAYITEM, row.QTY_REQ, row.QTY_CON, "", new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged));
    //});
    //계약정보담기
    //var zpmt0010List: ZPMT0010Model[] = [];
    //thisObj.contList.forEach(async (row: ZPMT10010Model) => {
    //  zpmt0010List.push(new ZPMT0010Model(thisObj.appConfig.mandt, thisObj.selectedOrderItemKeys[0].AUFNR, "1", new Date(), new Date(), new Date(),
    //    row.EBELN, "", row.LIFNR, "", "", "", new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged));
    //});

    var zpmt0010List: ZPMT0010Model[] = thisObj.contList as ZPMT0010Model[];
    zpmt0010List.forEach(async (row: ZPMT0010Model) => {
      if (row.REDAT === null)
        row.REDAT = new Date();

      if (row.CODAT === null)
        row.CODAT = new Date("0001-01-01");

      if (row.BUDAT === null)
        row.BUDAT = new Date("0001-01-01");

      if (row.ALDAT === null)
        row.ALDAT = new Date("0001-01-01");

      if (row.ERDAT === null)
        row.ERDAT = new Date();

      if (row.AEDAT === null)
        row.AEDAT = new Date();
    });
    var zpmt0020List: ZPMT0020Model[] = thisObj.workList as ZPMT0020Model[];
    var zpms0009List: ZPMS0009Model[] = [];

    if (this.equipFormData.STAT === "REL")
      zpms0009List = thisObj.FaultInfo as ZPMS0009Model[];

    var ZPMF0003Modellist = new ZPMF0003Model("", "", thisObj.selectedOrderItemKeys[0].AUFNR, [], zpms0009List, zpmt0010List, zpmt0020List, [], DIMModelStatus.UnChanged);

    var modelList: ZPMF0003Model[] = [ZPMF0003Modellist];
    var insertModel = await this.dataService.RefcCallUsingModel<ZPMF0003Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0003ModelList", modelList, QueryCacheType.None);

    return insertModel[0];
  }

  //사유 - 추가 버튼
  Addapply: any = async () => {

    if (this.ReasonInfo === undefined) {
      this.ReasonInfo = [];
    }
    var objPart = this.test3Entery.popupDataGridComm.instance.getSelectedRowsData();

    var model: ZPMS0009Model[] = this.ReasonInfo;

    var causeKey = (model.length + 1).toString().padStart(4, '0');

    this.ReasonInfo.push(new ZPMS0009Model(this.orderInfo, this.orderInfo.POSNR, causeKey, "5", objPart[0].CODEGRUPPE, objPart[0].KURZTEXT_GR, objPart[0].CODE, objPart[0].KURZTEXT_CODE, this.text2.value));


  }
  //액티비티 - 추가 버튼
  Addapply2: any = async () => {

    if (this.ActiInfo === undefined) {
      this.ActiInfo = [];
    }
    var objPart = this.test4Entery.popupDataGridComm.instance.getSelectedRowsData();

    var model: ZPMS0009Model[] = this.ActiInfo;

    var causeKey = (model.length + 1).toString().padStart(4, '0');

    this.ActiInfo.push(new ZPMS0009Model(this.orderInfo, this.orderInfo.POSNR, causeKey, "A", objPart[0].CODEGRUPPE, objPart[0].KURZTEXT_GR, objPart[0].CODE, objPart[0].KURZTEXT_CODE, this.text3.value));


  }


  //계약추가 팝업 내의 추가 버튼
  ReqRecords: any = async () => {

    //this.selectedMerterialItemKeys.forEach(async (key: any) => {
    //  var resultModel = await this.datainsert(this, key);
    //  if (resultModel === null)
    //    return;

    //  //this.contractList = resultModel.ITAB_DATA3[0]
    //  //this.contractList = resultModel.ITAB_DATA4[0]
    //});

    //this.isPopupVisible = false;
    //this.detaildatareload(this);

    var count: number = 0;

    this.contList = [];
    this.workList = [];
    var checkNetwr = true;
    var checkPay = true;
    var checkEBELN = true;

    if (this.gcMaterialListSelectedRows.length === 0) {
      await alert("한개 이상의 행을 선택한 후 실행하세요.", "알림")
      return;
    }

    this.gcMaterialListSelectedRows.forEach(async (row: ZPMS0008Model) => {

      var headData = this.contHeadList.find(item => item.EBELN === row.EBELN);
      if (headData?.RLWRT === 0)
        checkNetwr = false;

      var netwr = headData?.RLWRT ?? 0;
      var wrbtr = headData?.WRBTR_BAS ?? 0;

      if (netwr - wrbtr < Number(row.ZZPAY_NETPR))
        checkPay = false;

      var checkEbeln = this.contList.find(item => item.EBELN !== row.EBELN);
      if (checkEbeln !== undefined) {
        checkEBELN = false;
        return;
      }

      var checkData = this.contList.find(item => item.EBELN === row.EBELN);
      if (checkData === undefined) {
        this.contList.push(new ZPMT0010Model(this.appConfig.mandt, this.selectedOrderItemKeys[0].AUFNR, "01",
          new Date(), undefined, undefined, undefined, row.EBELN, "", row.PARNR, "", "", "",
          new Date(), "000000", "", new Date(), "000000", DIMModelStatus.UnChanged));
      }

      this.workList.push(new ZPMT0020Model(this.appConfig.mandt, this.selectedOrderItemKeys[0].AUFNR, "01",
        row.EBELN, row.EBELP, row.TXZ01, "1", "0", Number(row.ZZPAY_NETPR), Number(row.ZZPAY_NETPR), row.WAERS, "", new Date(), "000000", "", new Date(), "000000", row.TXZ01, DIMModelStatus.UnChanged));
    });

    if (!checkEBELN) {
      await alert("서로다른 계약번호데이터는 입력할 수 없습니다.", "알림")
      return;
    }

    if (!checkNetwr) {
      await alert("총금액이 없습니다.", "알림")
      return;
    }

    this.isPopupVisible = false;

    //임시로 수행되지 않게 수정
    //if (!checkPay) {
    //  await alert("남은 계약금액보다 많은 금액은 입력할 수 없습니다.", "알림")
    //  return;
    //}

    this.workOrderList = new ArrayStore(
      {
        key: ["AUFNR", "EBELN", "EBELP"],
        data: this.workList
      });
    this.workContractList = new ArrayStore(
      {
        key: ["AUFNR", "EBELN"],
        data: this.contList
      });

    //this.gcMaterialListRowKeys.forEach(async (key: any) => {
    //ctlist.forEach(async (item: ZPMS0008Model) => {
    //  if (key.EBELN === item.EBELN && key.EBELP === item.EBELP) {

    //  }
    //});
    //var selectedRow = ctlist.filter(function (item: any) {
    //  return item.EBELN === key.EBELN && item.EBELP === key.EBELP;
    //});

    //wclist.push(new ZPMT10010Model("", this.selectedOrderItemKeys[0].AUFNR, row.EBELP, new Date(), new Date(), new Date(), row.EBELN, "", row.PARNR, "", "", "",
    //  new Date(), "000000", "", new Date(), "", DIMModelStatus.Add));
    //wolist.push(new ZPMT10011Model("", this.selectedOrderItemKeys[0].AUFNR, row.EBELP, row.PAYITEM, row.MENGE.toString(), "0", "",
    //  new Date(), "000000", "", new Date(), "000000", DIMModelStatus.Add))
    //});

    //this.selectedMerterialItemKeys.forEach(async (key: any) => {

    //  var row: ZPMS0008Model = ctlist.(k => k.EBELN === key.EBELN && k.EBELP === key.EBELP) as ZPMS0008Model;


    //  wclist.push(new ZPMT10010Model("", this.selectedOrderItemKeys[0].AUFNR, row.EBELP, new Date(), new Date(), new Date(), row.EBELN, "", row.PARNR, "", "", "",
    //    new Date(), "000000", "", new Date(), "", DIMModelStatus.Add));
    //  wolist.push(new ZPMT10011Model("", this.selectedOrderItemKeys[0].AUFNR, row.EBELP, row.PAYITEM, row.MENGE.toString(), "0", "",
    //    new Date(), "000000", "", new Date(), "000000", DIMModelStatus.Add))

    //});
  }

  //검수요청 버튼
  ReqRecords2: any = async () => {

    var check: number = 0;
    var checkQty: boolean = true;
    var confirmText = `요청하시겠습니까? </br> 작업완료일 : ${this.workingDate}`;

    //if (this.matUseList.length === 0)
    //  confirmText = "자재사용 입력이 남아있습니다. 진행하겠습니까?";

    for (var row of this.matUseList) {
      if (row.QTY_REV > row.QTY_CON)
        confirmText = `자재사용 입력이 남아있습니다. 진행하겠습니까? </br> 작업완료일 : ${this.workingDate}`;
    }

    if (await confirm(confirmText, "알림")) {
      //검수요청 상태업데이트
      this.contList.forEach(async (row: ZPMT0010Model) => {
        row.STAT = "I";

      });

      for (var arr of this.contList) {
        arr.REDAT = this.workingDate;
      }

      this.loadingVisible = true;
      var resultModel = await this.datainsert2(this);
      this.loadingVisible = false;
      if (resultModel === null)
        return;

      if (resultModel.E_TYPE === "E")
        alert(resultModel.E_MSG, "오류");
      else
        alert("요청되었습니다.", "알림");

      //this.contractList = resultModel.ITAB_DATA3[0]
      //this.contractList = resultModel.ITAB_DATA4[0]

      this.isPopupVisible = false;
      this.detaildatareload(this);
    }
  }

  //작업결과등록 버튼
  ReqRecords3: any = async () => {
    if (await confirm("저장하시겠습니까?", "알림")) {
      this.loadingVisible = true;
      var resultModel = await this.datainsert2(this);
      this.loadingVisible = false;
      if (resultModel === null)
        return;

      if (resultModel.E_TYPE === "E")
        alert(resultModel.E_MSG, "오류");
      else {
        alert("저장되었습니다.", "알림");
        this.detaildatareload(this);
      }

      //this.contractList = resultModel.ITAB_DATA3[0]
      //this.contractList = resultModel.ITAB_DATA4[0]

      this.isPopupVisible = false;
    }
  }

  onCodeValueChanged(e: any) {

    return;
  }

  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }
  //클릭 키
  selectionOrderChanged(data: any) {
    this.selectedOrderRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedOrderItemKeys = data.currentSelectedRowKeys;
  }

  //클릭 키(고장리스트 선택)
  selectionFaultInfoChanged(data: any) {
    this.selectedFaultInfoRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedFaultInfoItemKeys = data.currentSelectedRowKeys;
  }

  //사유
  ReasonselectionOrderChanged(data: any) {

    var modelData1: ZPMS0009Model[] = data.selectedRowsData as ZPMS0009Model[];

    this.gcReasonListSelectedRows = [];

    modelData1.forEach(async (row: ZPMS0009Model) => {
      this.gcReasonListSelectedRows.push(row);
    });
  }

  //액티비티
  ActivityselectionOrderChanged(data: any) {

    var modelData1: ZPMS0009Model[] = data.selectedRowsData as ZPMS0009Model[];

    this.gcActivityListSelectedRows = [];

    modelData1.forEach(async (row: ZPMS0009Model) => {
      this.gcActivityListSelectedRows.push(row);
    });
  }

  selectionMeterialChanged(data: any) {
    this.selectedMerterialRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedMerterialItemKeys = data.currentSelectedRowKeys;

    //선택된 계약추가리스트를 프로퍼티에 담아 놓는다.
    var modelData: ZPMS0008Model[] = data.selectedRowsData as ZPMS0008Model[];


    var deselectedData = data.currentDeselectedRowKeys;

    this.gcMaterialListSelectedRows = [];


    modelData.forEach(async (row: ZPMS0008Model) => {
      this.gcMaterialListSelectedRows.push(row);
    });

   
  }
  //데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {
    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")

    var appStatus = this.selectedAppStatus;

    //작업요청 선택 시 RFC는 빈값으로 수행 후 데이터 조정
    if (appStatus === "O") appStatus = "";

    var zpf0001Model = new ZPMF0001Model("", "", "", "", this.endDate, this.startDate, "", this.empId, "", appStatus, "", this.appConfig.plant, []);
    var modelList: ZPMF0001Model[] = [zpf0001Model];

    console.log(`저장진입 - > ${formatDate(new Date(), "yyyy-MM-dd hh:mm:ss", "en-US")}`);

    var resultModel = await dataService.RefcCallUsingModel<ZPMF0001Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0001ModelList", modelList, QueryCacheType.None);
    if (resultModel[0].E_TYPE !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`, "알림");
      return;
    }
    console.log(resultModel);

    console.log(`RFC호출후 -> ${formatDate(new Date(), "yyyy-MM-dd hh:mm:ss", "en-US")}`);

    resultModel[0].ITAB_DATA.forEach(async (row: ZPMS0002Model) => {
      if (row.STAT1 === "") row.STATNAME = "작업요청";
      else if (row.STAT1 === "I") row.STATNAME = "검수요청";
      else if (row.STAT1 === "C") row.STATNAME = "검수승인"
    });

    var returnData = resultModel[0].ITAB_DATA;

    //작업요청 선택 시 RFC는 빈값으로 수행 후 데이터 조정
    if (this.selectedAppStatus === "O")
      returnData = returnData.filter(item => item.STAT1 === "");

    console.log(`RFC결과 반복문 후 -> ${formatDate(new Date(), "yyyy-MM-dd hh:mm:ss", "en-US")}`);


    this.orderData = new ArrayStore(
      {
        key: ["AUFNR"],
        data: returnData
      });

    console.log(`ArrayStore 후 -> ${formatDate(new Date(), "yyyy-MM-dd hh:mm:ss", "en-US")}`);
  }

  // 상세 데이터 로드
  public async detaildataLoad(parent: WORRComponent, aufnr: string) {
    var zpf0002Model = new ZPMF0002Model("", "", aufnr, [], [], [], [], [], []);

    var modelList: ZPMF0002Model[] = [zpf0002Model];
    //Test
    return await parent.dataService.RefcCallUsingModel<ZPMF0002Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0002ModelList", modelList, QueryCacheType.None);
  }

  // 팝업 데이터 로드
  public popupdataLoad = async (iminfo: ImateInfo, dataService: ImateDataService) => {

    var selectData = this.gcOrderGrid.instance.getSelectedRowsData();

    var idat1 = selectData[0].IDAT1;
    if (idat1 === null)
      idat1 = new Date("9999-12-31");

    var zpf0006Model = new ZPMF0006Model("", "", idat1, selectData[0].PARNR, this.zpmF002Models[0].ITAB_DATA1[0].WERKS, []);
    var modelList: ZPMF0006Model[] = [zpf0006Model];

    var resultModel = await dataService.RefcCallUsingModel<ZPMF0006Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0006ModelList", modelList, QueryCacheType.None);
    if (resultModel[0].E_TYPE === "E") {
      alert(`데이터가 없습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`, "알림");
      return [];
    }
    return resultModel[0];
  }

  // 계약추가 데이터 삽입
  public async datainsert(thisObj: WORRComponent, key: any) {
    //try {
    //  var contract = await (thisObj.contractList as ArrayStore).byKey(key) as ZPMS0008Model;

    //  var order = await (thisObj.orderData as ArrayStore).byKey(thisObj.selectedOrderItemKeys[0]) as ZPMS0002Model;
    //  var currDate = new Date();
    //  var currTim = formatDate(currDate, "HH:mm:ss", "en-US");


    //  var zpf0003Model = new ZPMF0003Model("", "", thisObj.selectedOrderItemKeys[0].AUFNR, []);
    //  zpf0003Model.ITAB_DATA3.push(new ZPMT0010Model(thisObj.appConfig.mandt, order.AUFNR, "", currDate, undefined, undefined,
    //    contract!.EBELN, "", contract!.PARNR, "", "", "", currDate, currTim, "", currDate, currTim));

    //  zpf0003Model.ITAB_DATA4.push(new ZPMT0020Model(thisObj.appConfig.mandt, order.AUFNR, "", contract!.EBELN, contract!.EBELP,
    //    contract!.PAYITEM, contract!.MENGE.toString(), "", "", currDate, currTim, "", currDate, currTim));

    //  var modelList: ZPMF0003Model[] = [zpf0003Model];

    //  var insertModel = await thisObj.dataService.RefcCallUsingModel<ZPMF0003Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0003ModelList", modelList, QueryCacheType.None);

    //  return insertModel[0];
    //}
    //catch (error) {
    //  var errorData = error as Error
    //  alert(errorData.message, "알림");
    //  return null;
    //}
  }


  // 상세 데이터 삽입
  public async codeinsert() {
    //var zpf0003Model = new ZPMF0003Model("", "", this.FaultInfo[0].AUFNR, []);
    var zpf0003Model = new ZPMF0003Model("", "", "", []);
    zpf0003Model.ITAB_DATA2.push(new ZPMS0009Model("", "", "", "", "", "", "", "", ""));
    var modelList: ZPMF0003Model[] = [zpf0003Model];

    var insertModel = await this.dataService.RefcCallUsingModel<ZPMF0003Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0003ModelList", modelList, QueryCacheType.None);

    return insertModel[0];
  }

  //Data refresh 날짜 새로고침 이벤트

  //public refreshDataGrid = async (e: Object) => {
  //  this.loadingVisible = true;
  //  var orderData = await this.dataLoad(this.imInfo, this.dataService);
  //  this.loadingVisible = false;
  //  this.orderData = new ArrayStore(
  //    {
  //      key: ["AUFNR"],
  //      data: orderData
  //    });
  //}


  /**
   * On Exporting Excel
   * */
  onExportingOrderData(e) {
    //e.component.beginUpdate();
    //e.component.columnOption('ID', 'visible', true);
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');
    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      customizeCell: function (options) {
        const excelCell = options.excelCell;
        excelCell.font = { name: 'Arial', size: 12 };
        excelCell.alignment = { horizontal: 'left' };
      }
    }).then(function () {
      workbook.xlsx.writeBuffer()
        .then(function (buffer: BlobPart) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `W/O 작업결과등록_${formatDate(new Date(), "yyyyMMdd", "en-US")}.xlsx`);
        });
    }).then(function () {
      //e.component.columnOption('ID', 'visible', false);
      //e.component.endUpdate();
      return;
    });

    e.cancel = true;
  }
}

