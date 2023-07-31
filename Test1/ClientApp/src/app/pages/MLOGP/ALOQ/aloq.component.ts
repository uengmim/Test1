import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { Service, VsGubun } from '../ALOQ/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
  DxFormComponent, 
  DxPopupComponent,
  DxSelectBoxComponent,
  DxTextBoxComponent,
} from 'devextreme-angular';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';
import ArrayStore from 'devextreme/data/array_store';
import { ZSDS6410Model, ZSDIFPORTALSAPLE028SndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Snd';
import { ZSDS6420Model, ZSDIFPORTALSAPLE028RcvModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Rcv';
import { alert, confirm } from "devextreme/ui/dialog";
import dxTextBox from 'devextreme/ui/text_box';
import { ZMMT1320Model } from '../../../shared/dataModel/OWHP/Zmmt1320Proxy';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZMMT1321Join1320Model } from '../../../shared/dataModel/MLOGP/Zmmt1320Join1321';
import { ZMMT1321GroupByModel } from '../../../shared/dataModel/OWHP/Zmmt1321GroupByProxy';
import { ZMMT1321Model } from '../../../shared/dataModel/MLOGP/Zmmt1321';
import { Title } from '@angular/platform-browser';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'aloq.component.html',
  providers: [ImateDataService, Service]
})



export class ALOQComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('popupGrid', { static: false }) popupGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('vsEntery', { static: false }) vsEntery!: CommonPossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('vgpostText', { static: false }) vgpostText!: DxTextBoxComponent;
  @ViewChild('vbelnText', { static: false }) vbelnText!: DxTextBoxComponent;
  @ViewChild('vsSelect', { static: false }) vsSelect!: DxSelectBoxComponent;
  /* Entry  선언 */
  //출하지점
  vsCode!: TableCodeInfo;
  //비료창고
  lgCode!: TableCodeInfo;
  //2차운송사
  tdlnrCode!: TableCodeInfo;

  /*Entery value 선언*/
  //출하지점
  vsValue!: string | null;
  //비료창고
  lgValue!: string | null;
  //2차운송사
  tdlnrValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  vsList: VsGubun[] = [];


  zmmt1320List: ZMMT1320Model[] = [];

  selectedVs: VsGubun;
  addDisabled: boolean = true;

  keyArray: any = [];

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "aloq";

  dataSource: any;
  //거래처

  //정보
  orderData: any;
  orderList: ZSDS6410Model[] = [];

  imOrderList: ZMMT1321Join1320Model[] = [];

  //날짜 조회
  startDate: any;
  endDate: any;
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

  selectedItemKeys: any[] = [];

  loadPanelOption: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //줄 선택
  selectedRowIndex = -1;
  //팝업데이터
  popupData: ZSDS6420Model[] = []; // 팝업 폼 data

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;

  closeButtonOptions: any;
  addButtonOptions: any;
  popupVisible = false;
  collapsed: any;

  //분할버튼
  splitButtonOptions: any;
  //분할 취소버튼
  splitCancelButtonOptions: any;

  isButtonLimit: boolean = false;

  isColVisible: boolean = true;

  empid: string = "";
  rolid: string[] = [];

  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService,
    private imInfo: ImateInfo, private authService: AuthService, private titleService: Title) {
    appInfo.title = AppInfoService.APP_TITLE + " | 2차운송사지정-비료,고체화학";
    this.titleService.setTitle(appInfo.title);

    let thisObj = this;

    //로그인 사용자 정보
    let usrInfo = authService.getUser().data;
    this.rolid = usrInfo.role;
    if(this.rolid.find(item => item ==="ADMIN") === undefined)
      this.empid = usrInfo.empId.padStart(10, '0');

    this.loadingVisible = true;

    this.keyArray = ['VBELN', 'POSNR'];

    //this.vsCode = appConfig.tableCode("출하지점");
    this.lgCode = appConfig.tableCode("저장위치");
    this.tdlnrCode = appConfig.tableCode("운송업체")
    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.vsCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;

    this.vsValue = "";
    this.lgValue = "";

    this.vsList = service.getVsGubun();
    
    this.selectedVs = this.vsList[0];
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    this.loadPanelOption = { enabled: false };


    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        this.loadPanelOption = { enabled: true };
        that.loadingVisible = true;
        await this.dataLoad(that);
        that.loadingVisible = false;
      },
    };
    //등록버튼
    this.addButtonOptions = {
      text: "등록",
      onClick: async () => {
        if (this.tdlnrValue === "") {
          alert("선택된 2차 운송사가 없습니다.", "알림");
        } else {

          var selectData = this.orderGrid.instance.getSelectedRowsData();
          selectData.forEach((array: any) => {
            array.Z4PARVW = this.tdlnrValue;
            var tdlnrText = this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === array.Z4PARVW);
            if (tdlnrText !== undefined)
              array.Z4PARVWTXT = tdlnrText.NAME1;

            array.ZSHIPSTATUS = "20";
          });

          this.popupVisible = false;
          this.tdlnrEntery.ClearSelectedValue();
        }
      },
    };

    this.closeButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.popupVisible = false;
        this.tdlnrEntery.ClearSelectedValue();
      }
    }

    //배차등록 저장
    this.saveButtonOptions = {
      text: "저장",
      onClick: async () => {

        var sum = 0;
        var zeroCheck: boolean = true;
        var carCheck: boolean = true;
        var checkIndex: number[] = [];
        var checkVBELN: string = "";
        var checkSum: boolean = true;
        var checkTdlnr2: boolean = true;
        var confirmText: string = "";

        var selectedData = this.orderGrid.instance.getSelectedRowsData();

        if (selectedData.length === 0) {
          alert("라인을 선택 후 저장하세요.", "알림");
          return;
        }

        selectedData.forEach(async (array: ZSDS6410Model) => {
          if (array.ZMENGE4 === 0) {
            checkVBELN = array.VBELN + " / " + array.POSNR;
            zeroCheck = false;
          }

          //if (array.Z4PARVW === "" || array.Z4PARVW === undefined) {
          //  checkVBELN = array.VBELN + " / " + array.POSNR;
          //  checkTdlnr2 = false;
          //}

          //if (array.ZCARTYPE === "" || array.ZCARNO === "" || array.ZDRIVER === "") {
          //  checkVBELN = array.VBELN + " / " + array.POSNR;
          //  carCheck = false;
          //}
          var vbelnMenge = { VBELN: "", POSNR: "", ZMENGE2: 0, ZMENGE4: 0 };

          //납품번호/품번으로 같은 데이터가 있나 확인
          var sameKeyData = thisObj.orderList.filter(item => item.VBELN === array.VBELN && item.POSNR === array.POSNR);


          //임가공 추가
          if (thisObj.vsSelect.value == "9999") {
            sameKeyData = thisObj.orderList.filter(item => item.VBELN === array.VBELN);
          }


          if (sameKeyData.length > 1)
            confirmText = "분할납품이 포함되어 있습니다.<br/>선택하지않은 모든 납품정보가 함께 저장됩니다.<br/>저장하시겠습니까?";
          else
            confirmText = "저장하시겠습니까?";

          //분할데이터 합산
          sameKeyData.forEach(async (row: ZSDS6410Model) => {
            vbelnMenge.VBELN = row.VBELN;
            vbelnMenge.POSNR = row.POSNR;
            vbelnMenge.ZMENGE2 = row.ZMENGE2;
            vbelnMenge.ZMENGE4 = vbelnMenge.ZMENGE4 + row.ZMENGE4;

            //if (row.Z4PARVW === "" || row.Z4PARVW === undefined) {
            //  checkVBELN = array.VBELN + " / " + array.POSNR;
            //  checkTdlnr2 = false;
            //}
          });
          //임가공일때 한번 더 체크
          if (thisObj.vsSelect.value == "9999") {
            var resultModel = await thisObj.dataService.SelectModelData<ZMMT1321GroupByModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321GroupByList", [thisObj.appConfig.mandt, vbelnMenge.VBELN, " AND ZSHIP_STATUS <> '10' ", "SC_S_MENGE"],
              "", "", QueryCacheType.None);
            vbelnMenge.ZMENGE4 = vbelnMenge.ZMENGE4 + (resultModel.length > 0 ? resultModel[0].SUM_VALUE : 0);
          }
          //납품수량, 배차수량 비교
          if (vbelnMenge.ZMENGE2 < vbelnMenge.ZMENGE4) {
            checkSum = false;
            checkVBELN = vbelnMenge.VBELN + " / " + vbelnMenge.POSNR;
          }

        });

        setTimeout(async () => {
        if (!zeroCheck) {
          alert("배차수량 0은 지정할 수 없습니다.<br/>납품번호 : " + checkVBELN, "알림");
          return;
        }

          if (thisObj.vsSelect.value !== "9999") {
            if (!checkSum) {
              alert("납품수량보다 분할수량을 많이 입력할 수 없습니다.<br/>납품번호 : " + checkVBELN, "알림");
              return;
            }
          }

        //if (!checkTdlnr2) {
        //  alert("2차운송사가 지정되지 않습니다.<br/>납품번호 : " + checkVBELN, "알림");
        //  return;
        //}

        if (await confirm(confirmText, "알림")) {

          if (this.orderGrid.instance.getSelectedRowsData().length > 0) {

            that.loadingVisible = true;
            var result = await this.saveData();
            that.loadingVisible = false;

            if (result.E_MTY === "E") {
              alert(result.E_MSG, "저장오류");
            } else {
              alert("2차운송사 정보가 저장되었습니다.", "알림");
              this.loadPanelOption = { enabled: true };
              this.dataLoad(that);
            }
          } else {
            alert("2차운송사 정보를 저장행을 선택하세요.", "알림");
          }
        }

        }, 500);
      },
    };

    this.splitButtonOptions = {
      text: "분할",
      onClick: async () => {
        var selectData: ZSDS6410Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
        if (selectData.length === 0) {
          alert("하나의 라인은 선택 후 실행하세요.", "알림");
          return;
        } else if (selectData.length > 1) {
          alert("하나의 라인만 선택 후 실행하세요.", "알림");
          return;
        }
        if (this.vsSelect.value !== "9999") {
          //선택행 인덱스 구하기
          var selectedIndex = thisObj.orderList.findIndex(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR &&
            item.ZSEQUENCY === selectData[0].ZSEQUENCY);

          var newLine = new ZSDS6410Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].KZPOD, selectData[0].VGBEL,
            selectData[0].VGPOS, selectData[0].INCO1, selectData[0].VSBED, selectData[0].TDDAT, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE1,
            selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL, selectData[0].ZMENGE4, selectData[0].ZMENGE3, selectData[0].WADAT_IST,
            selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT, selectData[0].KUNNR, selectData[0].NAME1, selectData[0].CITY,
            selectData[0].STREET, selectData[0].TELF1, selectData[0].MOBILENO, selectData[0].KUNAG, selectData[0].NAME1_AG, selectData[0].SPART,
            selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO,
            selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS,
            selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT,
            selectData[0].WBSTK, "", "", selectData[0].VKBUR, selectData[0].BEZEI, selectData[0].LGOBE, selectData[0].Z3PARVWTXT, selectData[0].Z4PARVWTXT, selectData[0].ZLGOBE,
            selectData[0].STATUS_TEXT, selectData[0].ZPALLTPT, selectData[0].ZUNLOADT, selectData[0].ZTAXKD_NAME);

          var sameData = thisObj.orderList.filter(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR);

          //분할번호 +1
          var nSeq = sameData.length;
          newLine.ZSEQUENCY = nSeq.toString().padStart(9, '0');

          //분할데이터 인서트
          thisObj.orderList.splice(selectedIndex + nSeq, 0, newLine);

          thisObj.orderData = new ArrayStore(
            {
              key: ["VBELN", "POSNR", "ZSEQUENCY"],
              data: thisObj.orderList
            });
        } else {
          //임가공 분할로직...
          var selectedIndex = thisObj.orderList.findIndex(item => item.VBELN === selectData[0].VBELN);

          var newLine = new ZSDS6410Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].KZPOD, selectData[0].VGBEL,
            selectData[0].VGPOS, selectData[0].INCO1, selectData[0].VSBED, selectData[0].TDDAT, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE1,
            selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL, selectData[0].ZMENGE4, selectData[0].ZMENGE3, selectData[0].WADAT_IST,
            selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT, selectData[0].KUNNR, selectData[0].NAME1, selectData[0].CITY,
            selectData[0].STREET, selectData[0].TELF1, selectData[0].MOBILENO, selectData[0].KUNAG, selectData[0].NAME1_AG, selectData[0].SPART,
            selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO,
            selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS,
            selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT,
            selectData[0].WBSTK, "", "", "", "", selectData[0].LGOBE, selectData[0].Z3PARVWTXT, selectData[0].Z4PARVWTXT, selectData[0].ZLGOBE);

          var sameData = thisObj.orderList.filter(item => item.VBELN === selectData[0].VBELN);

          newLine.POSNR = (parseInt(sameData[sameData.length - 1].POSNR) + 1).toString().padStart(6, '0');
          //분할데이터 인서트
          console.log(selectedIndex);
          console.log(sameData.length);
          thisObj.orderList.splice(selectedIndex + sameData.length, 0, newLine);

          thisObj.orderData = new ArrayStore(
            {
              key: ["VBELN", "POSNR"],
              data: thisObj.orderList
            });
        }
      }
    };

    this.splitCancelButtonOptions = {
      text: "분할취소",
      onClick: async () => {
        var selectData: ZSDS6410Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
        if (selectData.length === 0) {
          alert("하나의 라인은 선택 후 실행하세요.", "알림");
          return;
        } else if (selectData.length > 1) {
          alert("하나의 라인만 선택 후 실행하세요.", "알림");
          return;
        }

        if (this.vsSelect.value !== "9999") {
          var sameData = thisObj.orderList.filter(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR);
          var nSeq = sameData.length - 1;

          if (nSeq === 0) {
            alert("원본 납품문서는 더이상 분할취소할 수 없습니다.", "알림");
            return;
          }

          var maxSeq = nSeq.toString().padStart(9, '0');

          var maxIndex = thisObj.orderList.findIndex(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR &&
            item.ZSEQUENCY === maxSeq);

          //분할데이터 삭제
          thisObj.orderList.splice(maxIndex, 1);

          thisObj.orderData = new ArrayStore(
            {
              key: ["VBELN", "POSNR", "ZSEQUENCY"],
              data: thisObj.orderList
            });
        }
        else {
          //임가공 분할취소
          var sameData = thisObj.orderList.filter(item => item.VBELN === selectData[0].VBELN);
          var nSeq = sameData.length - 1;

          if (nSeq === 0) {
            alert("원본 납품문서는 더이상 분할취소할 수 없습니다.", "알림");
            return;
          }

          var maxSeq = nSeq.toString().padStart(6, '0');

          var maxIndex = thisObj.orderList.findIndex(item => item.VBELN === selectData[0].VBELN && item.POSNR === maxSeq);

          //분할데이터 삭제
          thisObj.orderList.splice(maxIndex, 1);

          thisObj.orderData = new ArrayStore(
            {
              key: ["VBELN", "POSNR"],
              data: thisObj.orderList
            });
        }
      }
    };

  }

  public async dateLoad(dataService: ImateDataService) {

    var sdate = formatDate(this.startDate, "yyyyMMDD", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMDD", "en-US")

  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  selectedChanged(e:any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);

    this.orderGrid.instance.filter(['VBELN', '=', '0080002938']); 
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };




  //첫화면 데이터 조회 RFC
  public async dataLoad(thisObj:ALOQComponent) {
    thisObj.orderList = [];
    let fixData = { I_ZSHIPSTATUS: "10" };

    if (this.vsSelect.value === "9999") {
      this.orderGrid.instance.columnOption("POSNR", "visibleIndex", 1);
      this.orderGrid.instance.columnOption("POSNR", "caption", "분할순번");
      this.orderGrid.instance.columnOption("ZMENGE1", "caption", "출하요청량");
      this.orderGrid.instance.columnOption("ZMENGE2", "caption", "출하지시량");
      this.orderGrid.instance.columnOption("ZKETDAT", "visible", false);


      thisObj.isButtonLimit = true;
      thisObj.imOrderList = await thisObj.dataService.SelectModelData<ZMMT1321Join1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321Join1320List",
        [thisObj.appConfig.mandt, "1000", `'10', '20'`, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', ""), this.empid, "X", `'${fixData.I_ZSHIPSTATUS}'`, ""],
        "", "A.VBELN", QueryCacheType.None);

      thisObj.imOrderList.forEach(async (row: ZMMT1321Join1320Model) => {
        thisObj.orderList.push(new ZSDS6410Model(row.VBELN, row.POSNR == "000000" ? "000001" : row.POSNR, "", "", "", "", "", "", row.SC_R_DATE_R, row.IDNRK, row.MAKTX, row.SC_R_MENGE, row.SC_L_MENGE,
          row.MEINS, "9999", row.SC_S_MENGE, row.SC_G_MENGE, undefined, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_S_DATE, "", "", 0, "", "", "", "", "", "", row.BLAND_F_NM,
          this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.TDLNR1)?.NAME1, this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.TDLNR2)?.NAME1, row.BLAND_T_NM));

      })
        /*
        thisObj.orderList.push(new ZSDS6410Model(row.VBELN, "", "", "", "", "", "", "", row.SC_R_DATE, row.IDNRK, row.MAKTX, row.SC_R_MENGE, row.SC_L_MENGE,
          row.MEINS, "9999", 0, 0, undefined, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_L_DATE, "", "", 0, "", "", "", "", lgorttxt, tdlnr1txt, tdlnr2txt));
        */
    
     
    } else {

      if (this.vsSelect.value !== "1000") {
        this.orderGrid.instance.columnOption("ZKETDAT", "visible", true);
      } else {
        this.orderGrid.instance.columnOption("ZKETDAT", "visible", false);
      }
      this.orderGrid.instance.columnOption("POSNR", "visibleIndex", 19);
      this.orderGrid.instance.columnOption("POSNR", "caption", "납품품번");
      this.orderGrid.instance.columnOption("ZMENGE1", "caption", "주문수량");
      this.orderGrid.instance.columnOption("ZMENGE2", "caption", "납품수량");

      thisObj.isButtonLimit = false;
      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", this.lgEntery.selectedValue ?? "", "", this.startDate, this.endDate, "", "",
        this.vsSelect.value, "X", this.empid, "", "", "", fixData.I_ZSHIPSTATUS, []);

      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);
      this.orderList = resultModel[0].IT_DATA;

      //this.orderList = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C");
      thisObj.orderList.forEach(async (row: ZSDS6410Model) => {
        var tdlnr1Text = this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.Z3PARVW);
        if (tdlnr1Text !== undefined)
          row.Z3PARVWTXT = tdlnr1Text.NAME1;

        var tdlnr2Text = this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.Z4PARVW);
        if (tdlnr2Text !== undefined)
          row.Z4PARVWTXT = tdlnr2Text.NAME1;

        var lgortText = this.lgEntery.gridDataSource._array.find(item => item.LGORT === row.LGORT);
        if (lgortText !== undefined)
          row.LGOBE = lgortText.LGOBE;

        var zlgortText = this.lgEntery.gridDataSource._array.find(item => item.LGORT === row.ZLGORT);
        if (zlgortText !== undefined)
          row.ZLGOBE = zlgortText.LGOBE;

      });
      
    }

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: thisObj.orderList
      });

    this.loadingVisible = false;
  }

  //
  public async saveData() {
    var zsd6420list: ZSDS6420Model[] = [];
    this.zmmt1320List = [];
    var zmmt1321List: ZMMT1321Model[] = [];
    var insertMod: ZSDIFPORTALSAPLE028RcvModel = new ZSDIFPORTALSAPLE028RcvModel("", "", []);
    var insertModel: ZSDIFPORTALSAPLE028RcvModel[] = [insertMod];
    var rowCount: number = 0;
    var checkTdlnr2: boolean = true;

    var checkVSTEL = this.orderGrid.instance.getSelectedRowsData().find(item => item.VSTEL === "9999")

    //임가공인지 체크
    if (checkVSTEL === undefined) {
      this.orderGrid.instance.getSelectedRowsData().forEach(async (array: ZSDS6410Model) => {
        var dataModel: ZSDS6410Model[] = [];
        var checkKey = zsd6420list.findIndex(item => item.VBELN === array.VBELN && item.POSNR === array.POSNR);
        if (checkKey === -1) {
          dataModel = this.orderList.filter(item => item.VBELN === array.VBELN && item.POSNR === array.POSNR);
          dataModel.forEach(async (subRow: ZSDS6410Model) => {
            var shipStatus = "20";
            if (subRow.Z4PARVW === "" || subRow.Z4PARVW === undefined || subRow.Z4PARVW === null)
              shipStatus = "10";

            var ship_date = array.ZSHIPMENT_DATE;
            if (ship_date === null || ship_date === undefined)
              ship_date = new Date("9999-12-31");

            zsd6420list.push(new ZSDS6420Model(subRow.VBELN, subRow.POSNR, subRow.ZSEQUENCY, subRow.VRKME, subRow.ZMENGE4,
              0, new Date(), subRow.Z3PARVW, subRow.Z4PARVW, subRow.ZCARTYPE,
              subRow.ZCARNO, subRow.ZDRIVER, subRow.ZDRIVER1, subRow.ZPHONE, subRow.ZPHONE1,
              subRow.ZVKAUS, subRow.ZUNLOAD, shipStatus, subRow.ZSHIPMENT_NO, ship_date,
              subRow.ZPALLTP, subRow.ZPALLETQTY, subRow.ZCONFIRM_CUT, subRow.ZTEXT, "", ""));
          });
        }

        //var ship_date = array.ZSHIPMENT_DATE;
        //if (ship_date === null || ship_date === undefined)
        //  ship_date = new Date("9999-12-31");
        //zsd6420list.push(new ZSDS6420Model(array.VBELN, array.POSNR, array.ZSEQUENCY, array.VRKME, array.ZMENGE4, 0, new Date(), array.Z3PARVW, array.Z4PARVW,
        //  array.ZCARTYPE, array.ZCARNO, array.ZDRIVER, array.ZDRIVER1, array.ZPHONE, array.ZPHONE1, array.ZVKAUS, array.ZUNLOAD, array.ZSHIPSTATUS, array.ZSHIPMENT_NO,
        //  ship_date, array.ZPALLTP, array.ZPALLETQTY, array.ZCONFIRM_CUT, array.ZTEXT, array.MTY, array.MSG));
      });

      //if (!checkTdlnr2) {
      //  insertModel[0].E_MTY = "E";
      //  insertModel[0].E_MSG = "저장데이터중 2차운송사가 지정되지 않은 행이 있습니다.";
      //  return insertModel[0];
      //}

      var createModel = new ZSDIFPORTALSAPLE028RcvModel("", "", zsd6420list);
      var createModelList: ZSDIFPORTALSAPLE028RcvModel[] = [createModel];
      
      insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028RcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028RcvModelList", createModelList, QueryCacheType.None);
      
    } else {
      this.orderGrid.instance.getSelectedRowsData().forEach(async (row: ZSDS6410Model) => {
        var dataModel: ZSDS6410Model[] = [];
        var checkKey = zsd6420list.findIndex(item => item.VBELN === row.VBELN);
        if (checkKey === -1) {
          dataModel = this.orderList.filter(item => item.VBELN === row.VBELN);
          var getData = this.imOrderList.find(item => item.VBELN === row.VBELN);
          dataModel.forEach(async (subRow: ZSDS6410Model) => {
            zmmt1321List.push(new ZMMT1321Model(this.appConfig.mandt, getData.VBELN, subRow.POSNR, getData.WERKS, getData.LIFNR, getData.IDNRK, getData.LGORT, getData.BWART
              , getData.MEINS, getData.SC_R_MENGE, getData.SC_R_DATE_R, getData.INCO1, getData.TDLNR1, subRow.Z4PARVW, subRow.ZCARTYPE, subRow.ZCARNO, subRow.ZDRIVER, subRow.ZPHONE
              , subRow.Z4PARVW == "" ? "10" : "20", subRow.ZSHIPMENT_NO, getData.BLAND_F, getData.BLAND_F_NM, getData.BLAND_T, getData.BLAND_T_NM, subRow.ZMENGE4, subRow.ZSHIPMENT_DATE ?? new Date("0001-01-01")
              , 0, new Date("0001-01-01"), "000000", getData.ZPOST_RUN_MESSAGE, 0, new Date("0001-01-01"), "000000", "", getData.MBLNR, getData.MJAHR, getData.MBLNR_C, getData.MJAHR_C
              , getData.WAERS, getData.NETPR, getData.DMBTR, getData.BUKRS, getData.BELNR, getData.GJAHR, getData.BUDAT ?? new Date("0001-01-01"), getData.UNIQUEID, getData.SAVEKEY == "" ? this.appConfig.interfaceId : getData.ERNAM
              , getData.SAVEKEY == "" ? new Date() : getData.ERDAT, getData.SAVEKEY == "" ? formatDate(new Date(), "HH:mm:ss", "en-US") : getData.ERZET, this.appConfig.interfaceId
              , new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), "", "", getData.SAVEKEY == "" ? DIMModelStatus.Add : DIMModelStatus.Modify));
          });

          var row21Count = await this.dataService.ModifyModelData<ZMMT1321Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321ModelList", zmmt1321List);

          var zmmt1320Model = await this.dataService.SelectModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", [],
            `MANDT = '${this.appConfig.mandt}' AND VBELN = '${getData.VBELN}'`, "VBELN", QueryCacheType.None);

          var sumModel = await this.dataService.SelectModelData<ZMMT1321GroupByModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321GroupByList", [this.appConfig.mandt, getData.VBELN, "", "SC_S_MENGE"],
            "", "", QueryCacheType.None);
          zmmt1320Model[0].ModelStatus = DIMModelStatus.Modify;
          zmmt1320Model[0].SC_S_MENGE_T = sumModel[0].SUM_VALUE;
          zmmt1320Model[0].ZSHIP_STATUS = "20";
          zmmt1320Model[0].SC_G_DATE = new Date("0001-01-01");
          zmmt1320Model[0].AENAM = this.appConfig.interfaceId;
          zmmt1320Model[0].AEDAT = new Date();
          zmmt1320Model[0].AEZET = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
            new Date().getSeconds().toString().padStart(2, '0');

          this.zmmt1320List.push(zmmt1320Model[0]);

        }
        this.imUpdate();
      });
      /*if (rowCount > 0) {*/
        insertModel[0].E_MTY = "S";
      //}else {
      //  insertModel[0].E_MTY = "E";
      //  insertModel[0].E_MSG = "저장하지 못했습니다.";
      //}
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

    if (this.loadePeCount >= 2) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      this.vsSelect.instance.option("value", "1000");
      this.dataLoad(this);
      this.loadingVisible = false;

    }
  }

  //배차등록버튼
  AddOrder(e: any) {
    this.popupVisible = !this.popupVisible;
  }
  
  //하차
  onZunloadCodeValueChanged(e: any) {
    setTimeout(() => {
     // this.popupData.ZUNLOAD = e.selectedValue;
    });
  }

  //화물차종
  onTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      //this.addFormData.ZCARTYPE = e.selectedValue;
    });
  }

  //화학, 유류 구분
  onCSpartValueChanged(e: any) {
    this.loadingVisible = true;
    setTimeout(async () => {
      this.vsSelect.value = e.value;
      if (this.vsSelect.value === "9999") {
        this.isColVisible = false;
      } else {
        this.isColVisible = true;
      }

      await this.dataLoad(this);
      this.loadingVisible = false;
    });
  }
  

  selectionChanged(data: any) {
    this.selectedItemKeys = data.currentSelectedRowKeys;
    if (this.orderGrid.instance.getSelectedRowsData().length > 0) {
      this.addDisabled = false;
    } else {
      this.addDisabled = true;
    }
  }
  async imUpdate() {

    var row20Count = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", this.zmmt1320List);

  }
}
