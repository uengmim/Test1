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
import { Service, CarSeq, CSpart, MatType } from '../ALRF/app.service';
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
import { ZSDS6410Model, ZSDIFPORTALSAPLE028SndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Snd';
import { ZSDS6420Model, ZSDIFPORTALSAPLE028RcvModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Rcv';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ThisReceiver } from '@angular/compiler';
import { ZMMT1320Model } from '../../../shared/dataModel/OWHP/Zmmt1320Proxy';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'alrf.component.html',
  providers: [ImateDataService, Service]
})



export class ALRFComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('orderGrid2', { static: false }) orderGrid2!: DxDataGridComponent;
  @ViewChild('popupGrid', { static: false }) popupGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('vsEntery', { static: false }) vsEntery!: CommonPossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: CommonPossibleEntryComponent;
  @ViewChild('maraEntery', { static: false }) maraEntery!: CommonPossibleEntryComponent;
  //@ViewChild('dd07tEntery', { static: false }) dd07tEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: CommonPossibleEntryComponent;
  //@ViewChild('tvlvEntery', { static: false }) tvlvEntery!: TablePossibleEntryComponent;
  //@ViewChild('zpalEntery', { static: false }) zpalEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: CommonPossibleEntryComponent;
  /*@ViewChild('zcarnoCodeEntery', { static: false }) zcarnoCodeEntery!: CommonPossibleEntryComponent;*/
  @ViewChild('zcarnoModiCodeEntery', { static: false }) zcarnoModiCodeEntery!: CommonPossibleEntryComponent;

  /* Entry  선언 */
  //출하지점
  vsCode!: TableCodeInfo;
  //비료창고
  lgCode!: TableCodeInfo;
  //제품구분(비료:10, 친환경:40)
  maraCode!: TableCodeInfo;
  //하차 방법
  //dd07tCode!: TableCodeInfo;
  //화물차종
  dd07tCarCode: TableCodeInfo;
  //용도 정보
  //tvlvCode: TableCodeInfo;
  //파레트유형
  //zpalCode!: TableCodeInfo;

  //2차운송사
  tdlnrCode!: TableCodeInfo;

  //차량번호
  /*zcarnoCode!: TableCodeInfo;*/

  //차량번호(수정)
  zcarnoModiCode!: TableCodeInfo;

  /*Entery value 선언*/
  ////출하지점
  //vsValue!: string | null;
  ////비료창고
  //lgValue!: string | null;
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
  //2차운송사
  tdlnrValue!: string | null;

  //차량번호
  /*zcarnoValue!: string | null;*/
  //차량번호(수정)
  zcarnoModiValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  carSeq: CarSeq[];
  cSpart: CSpart[];
  matType: MatType[];

  selectStatus: string = "10";
  selectCSpart: string = "1000";
  selectMatType: string = "1000";

  isButtonLimit: boolean = false;

  isColVisible: boolean = true;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "alrf";

  dataSource: any;
  //거래처

  numberPattern: any = /^[^0-9]+$/;
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
  saveButtonOptions: any;
  saveButtonOptions2: any;
  saveButtonOptions4: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //상세 추가 버튼
  addDetailButtonOptions: any;

  //분할버튼
  splitButtonOptions: any;
  //분할 취소버튼
  splitCancelButtonOptions: any;

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
  popupData: ZSDS6420Model[] = []; // 팝업 안 그리드

  popCarSetHeaderData: any; // 배차추가 팝업 안 상단내용
  popCarSetData: any; // 등록팝업 form데이터

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;
  closeButtonOptions: any;
  closeButtonOptions2: any;
  closeButtonOptions3: any;
  closeButtonOptions4: any;

  popSaveButtonOptions: any;
  popCloseButtonOptions: any;

  popupCarSetupVisible = false;
  collapsed: any;

  //배차팝업 선택값
  selectGrid2Data: ZSDS6420Model[] = [];
  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 배차등록-포장재";

    let thisObj = this;

    this.loadingVisible = true;

    //1차2차운송사 구분
    this.carSeq = service.getCarSeq();

    //화학, 유류 구분
    this.cSpart = service.getCSpart();

    this.matType = service.getMatType();

    //this.vsCode = appConfig.tableCode("출하지점");
    //this.lgCode = appConfig.tableCode("비료창고");
    this.maraCode = appConfig.tableCode("제품구분");
    /*this.dd07tCode = appConfig.tableCode("하차정보");*/
    this.dd07tCarCode = appConfig.tableCode("RFC_화물차종");
    //this.tvlvCode = appConfig.tableCode("용도구분");
    //this.zpalCode = appConfig.tableCode("파레트유형");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.zcarnoModiCode = appConfig.tableCode("비료차량");


    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.vsCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maraCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tvlvCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.zcarnoCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.zcarnoModiCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;

    //this.vsValue = "";
    //this.lgValue = "";
    this.zunloadValue = "";
    this.vkausValue = "";
    this.zpalValue = "";
    this.zcarValue = "";
    this.tdlnrValue = "";
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    //배차등록 팝업 초기화
    this.popCarSetData = { ZMENGE4: 0, ZCARTYPE: "", ZCARNO: "", ZDRIVER: "", ZPHONE: "", ZSHIPMENT_DATE: this.endDate, ZDRIVER1: "", ZPHONE1: "", ZSHIPMENT_NO: "" }

    this.dataLoad(this);

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
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
    //배차등록 저장
    this.saveButtonOptions = {
      text: "저장",
      onClick: async () => {
        /*this.orderData.push(this.popupData);*/

        var sum = 0;
        var zeroCheck: boolean = true;
        var carCheck: boolean = true;
        var checkIndex: number[] = [];
        var checkVBELN: string = "";
        var checkSum: boolean = true;
        var confirmText: string = "";

        var selectedData = this.orderGrid.instance.getSelectedRowsData();

        if (selectedData.length === 0) {
          alert("라인을 선택 후 저장하세요.", "알림");
          return;
        }

        selectedData.forEach((array: ZSDS6410Model) => {
          if (array.ZMENGE4 === 0) {
            checkVBELN = array.VBELN + " / " + array.POSNR;
            zeroCheck = false;
          }


          if (array.ZCARTYPE === "" || array.ZCARNO === "" || array.ZDRIVER === "") {
            checkVBELN = array.VBELN + " / " + array.POSNR;
            carCheck = false;
          }
          var vbelnMenge = { VBELN: "", POSNR: "", ZMENGE2: 0, ZMENGE4: 0 };

          //납품번호/품번으로 같은 데이터가 있나 확인
          var sameKeyData = thisObj.orderGridData.filter(item => item.VBELN === array.VBELN && item.POSNR === array.POSNR);

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
          });

          //납품수량, 배차수량 비교
          if (vbelnMenge.ZMENGE2 < vbelnMenge.ZMENGE4) {
            checkSum = false;
            checkVBELN = vbelnMenge.VBELN + " / " + vbelnMenge.POSNR;
          }

        });

        if (!zeroCheck) {
          alert("배차수량 0은 지정할 수 없습니다.<br/>납품번호 : " + checkVBELN, "알림");
          return;
        }

        if (!carCheck) {
          alert("차량정보 및 운전기사정보는 필수입니다.<br/>납품번호 : " + checkVBELN, "알림");
          return;
        }

        if (!checkSum) {
          alert("납품수량보다 배차수량을 많이 입력할 수 없습니다.<br/>납품번호 : " + checkVBELN, "알림");
          return;
        }

        if (await confirm(confirmText, "알림")) {

          this.loadingVisible = true;
          var result = await this.createOrder(thisObj);
          this.loadingVisible = false;
          var reMSG = "";
          result.T_DATA.forEach(async (row: ZSDS6420Model) => {
            if (row.MTY === "E")
              reMSG = row.MSG;
          });

          if (reMSG !== "") {
            alert(`실패했습니다.<br/> SAP오류 메세지: ${reMSG}`, "알림");
            return;
          }
          if ((result.E_MTY === "S")) {
            alert("등록완료되었습니다.", "알림");
            /*            this.orderData.push(this.popupData);*/
            this.dataLoad(this);

          } else {
            alert(result.E_MSG, "알림");
          }
        }
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
        //선택행 인덱스 구하기
        var selectedIndex = thisObj.orderGridData.findIndex(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR &&
          item.ZSEQUENCY === selectData[0].ZSEQUENCY);

        var newLine = new ZSDS6410Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].KZPOD, selectData[0].VGBEL,
          selectData[0].VGPOS, selectData[0].INCO1, selectData[0].VSBED, selectData[0].TDDAT, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE1,
          selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL, selectData[0].ZMENGE4, selectData[0].ZMENGE3, selectData[0].WADAT_IST,
          selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT, selectData[0].KUNNR, selectData[0].NAME1, selectData[0].CITY,
          selectData[0].STREET, selectData[0].TELF1, selectData[0].MOBILENO, selectData[0].KUNAG, selectData[0].NAME1_AG, selectData[0].SPART,
          selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO,
          selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS,
          selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY,selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT, "", "");

        var sameData = thisObj.orderGridData.filter(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR);

        //분할번호 +1
        var nSeq = sameData.length;
        newLine.ZSEQUENCY = nSeq.toString().padStart(9, '0');

        //분할데이터 인서트
        thisObj.orderGridData.splice(selectedIndex + nSeq, 0, newLine);

        thisObj.orderData = new ArrayStore(
          {
            key: ["VBELN", "POSNR", "ZSEQUENCY"],
            data: thisObj.orderGridData
          });
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

        var sameData = thisObj.orderGridData.filter(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR);
        var nSeq = sameData.length - 1;

        if (nSeq === 0) {
          alert("원본 납품문서는 더이상 분할취소할 수 없습니다.", "알림");
          return;
        }

        var maxSeq = nSeq.toString().padStart(9, '0');

        var maxIndex = thisObj.orderGridData.findIndex(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR &&
          item.ZSEQUENCY === maxSeq);

        //분할데이터 삭제
        thisObj.orderGridData.splice(maxIndex, 1);

        thisObj.orderData = new ArrayStore(
          {
            key: ["VBELN", "POSNR", "ZSEQUENCY"],
            data: thisObj.orderGridData
          });
      }
    };

    //수정 저장
    this.popSaveButtonOptions = {
      text: "등록",
      onClick: () => {

        //if (this.popCarSetHeaderData.possible < this.popCarSetData.ZMENGE4) {
        //  alert("분할가능수량을 넘을 수 없습니다.", "알림");
        //  this.popCarSetData.ZMENGE4 = this.popCarSetHeaderData.possible;
        //  return;
        //}

        //if (this.popCarSetData.ZMENGE4 === 0) {
        //  alert("배차수량을 입력해야합니다.", "알림");
        //  return;
        //}

        if (this.popCarSetData.ZCARTYPE === "" || this.popCarSetData.ZCARNO === "" || this.popCarSetData.ZDRIVER === "") {
          alert("차량정보 및 운전기사정보를 입력해야합니다.", "알림");
          return;
        }

        if (this.popCarSetData.ZSHIPMENT_DATE === null) {
          alert("상차일자를 입력해야합니다.", "알림");
          return;
        }

        //if (this.popCarSetData.WADAT_IST === null || this.popCarSetData.WADAT_IST === undefined)
        //  this.popCarSetData.WADAT_IST = new Date("0001-01-01");

        var selectData: ZSDS6410Model[] = this.orderGrid.instance.getSelectedRowsData();

        //배차 키 생성 년 + 월 + 일 + 시간 + 차량뒷번호 4자리
        var now = new Date();
        var key = now.getFullYear().toString().substr(2, 2).padStart(2, '0') + now.getMonth().toString().padStart(2, '0') + now.getDay().toString().padStart(2, '0')
          + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');

        selectData.forEach(async (row: ZSDS6410Model) => {
          row.ZMENGE4 = this.popCarSetData.ZMENGE4;
          row.ZCARTYPE = this.popCarSetData.ZCARTYPE;
          row.ZCARNO = this.popCarSetData.ZCARNO;
          row.ZDRIVER = this.popCarSetData.ZDRIVER;
          row.ZDRIVER1 = this.popCarSetData.ZDRIVER1;
          row.ZSHIPMENT_DATE = this.popCarSetData.ZSHIPMENT_DATE;
          row.ZPHONE = this.popCarSetData.ZPHONE;
          row.ZPHONE1 = this.popCarSetData.ZPHONE1;

          var carkey = row.ZCARNO.substr(row.ZCARNO.length - 4, row.ZCARNO.length - 1);
          row.ZSHIPMENT_NO = "";
          row.ZSHIPMENT_NO = row.ZSHIPMENT_NO.concat(key, carkey)
        });

        this.popupCarSetupVisible = false;
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

    //수정팝업취소버튼
    this.popCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.popupCarSetupVisible = false;
      },
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

  //1차2차운송사 구분변경 이벤트
  onGubunValueChanged(e: any) {
    if (e.value === "1") {
      this.selectStatus = "10";
    } else {
      this.selectStatus = "20";
    }
      
  }

  //화학, 유류 구분
  onCSpartValueChanged(e: any) {
    this.loadingVisible = true;
    setTimeout(async() => {
      this.selectCSpart = e.value;
      if (this.selectCSpart === "9999") {
        this.isColVisible = false;
      } else {
        this.isColVisible = true;
      }
      
      await this.dataLoad(this);
      this.loadingVisible = false;
      //if (this.selectCSpart === "10") {
      //  /*this.zcarnoCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("화학차량"), "ZCARNO", "%ZCARNO%", "차량정보");*/
      //  this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "ZCARNO", "%ZCARNO%", "차량정보");
      //} 
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
  //조회더블클릭
  //orderDBClick(e: any) {
  //  var selectData = this.orderGrid.instance.getSelectedRowsData();

  //  //this.popupData.push(new ZSDS6420Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].VRKME, 0, 0, this.startDate, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS, selectData[0].ZSHIPMENT_NO, this.endDate, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, 0, selectData[0].ZTEXT, selectData[0].MTY, selectData[0].MSG));
  //  //this.popupData2 = { VBELN: selectData[0].VBELN, POSNR: selectData[0].POSNR, ZMENGE2: selectData[0].ZMENGE2, WADAT_IST: selectData[0].WADAT_IST };
  //  this.popupVisible3 = !this.popupVisible3;
  //}

  onTdlnrCodeValueChanged(e: any) {
    /*this.tdlnrValue = e.value;*/
  }

  onMatTypeValueChanged(e: any) {
    this.selectMatType = e.value;
  }

  //첫화면 데이터 조회 RFC
  public async dataLoad(thisObj:ALRFComponent) {
    let fixData = { I_ZSHIPSTATUS: this.selectStatus };
    var zsds6410: ZSDS6410Model[] = [];
    thisObj.orderGridData = [];

    //포장재 or 임가공
    if (thisObj.selectCSpart !== "9999") {
      thisObj.isButtonLimit = false;

      var tdlnr1 = "";
      var tdlnr2 = "";

      if (this.selectStatus === "10")
        tdlnr1 = thisObj.tdlnrValue ?? "";
      else
        tdlnr2 = thisObj.tdlnrValue ?? ""
     
      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "", "", thisObj.startDate, thisObj.endDate, "", "", thisObj.selectCSpart, tdlnr1, tdlnr2, "", fixData.I_ZSHIPSTATUS, zsds6410);

      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

      var resultModel = await thisObj.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);

      thisObj.orderGridData = resultModel[0].IT_DATA;
    } else {
      thisObj.isButtonLimit = true;

      var addWhereCondi = "";

      if (this.selectStatus === "10" && this.tdlnrValue !== "")
        addWhereCondi = "AND A.TDLNR1 = " + this.tdlnrValue;
      else if (this.selectStatus === "20" && this.tdlnrValue !== "")
        addWhereCondi = "AND A.TDLNR2 = " + this.tdlnrValue;

      thisObj.imOrderList = await thisObj.dataService.SelectModelData<ZMMT1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320CustomList",
        [thisObj.appConfig.mandt, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', ""), fixData.I_ZSHIPSTATUS, addWhereCondi],
        "", "A.VBELN", QueryCacheType.None);

      thisObj.imOrderList.forEach(async (row: ZMMT1320Model) => {
        thisObj.orderGridData.push(new ZSDS6410Model(row.VBELN, "", "", "", "", "", "", "", row.SC_R_DATE, row.IDNRK, row.MAKTX, row.SC_R_MENGE, row.SC_L_MENGE,
          row.MEINS, "9999", 0, 0, undefined, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_L_DATE, "", "", 0, "", "", ""));
      })
    }
    
    thisObj.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR", "ZSEQUENCY"],
        data: thisObj.orderGridData
      });
  }

  //배차등록
  public async createOrder(thisObj: ALRFComponent) {
    //var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();
    //var modelList: ZSDS6440Model[] = [];
    //selectData.forEach(async (row: ZSDS6430Model) => {
    //  modelList.push(new ZSDS6440Model(row.VBELN, row.POSNR, row.ZSEQUENCY, row.KZPOD, row.VGBEL, row.VGPOS,
    //    row.TDDAT, row.MATNR, row.ARKTX, row.ZMENGE1, row.ZMENGE2, row.VRKME, row.VSTEL,
    //    row.ZMENGE4, row.ZMENGE3, row.WADAT_IST, row.BRGEW, row.GEWEI, row.LGORT, row.ZLGORT,
    //    row.INCO1, row.VSBED, row.KUNNR, row.NAME1, row.CITY, row.STREET, row.TELF1,
    //    row.MOBILENO, row.KUNAG, row.NAME1_AG, row.SPART, row.WERKS, row.LFART, row.Z3PARVW,
    //    row.Z4PARVW, row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, row.ZDRIVER1, row.ZPHONE, row.ZPHONE1,
    //    row.ZSHIPMENT, "30", row.ZSHIPMENT_NO, row.ZSHIPMENT_DATE, row.ZCONFIRM_CUT, row.ZTEXT,
    //    row.MTY, row.MSG, DIMModelStatus.UnChanged));
    //});

    var zsd6420list: ZSDS6420Model[] = [];
    var zmmt1320List: ZMMT1320Model[] = [];
    var insertMod: ZSDIFPORTALSAPLE028RcvModel = new ZSDIFPORTALSAPLE028RcvModel("", "", []);
    var insertModel: ZSDIFPORTALSAPLE028RcvModel[] = [insertMod]
    var rowCount: number = 0;

    var selectedData = this.orderGrid.instance.getSelectedRowsData();

    var checkVSTEL = this.orderGrid.instance.getSelectedRowsData().find(item => item.VSTEL === "9999")

    //포장재 or 임가공 로직 분기
    if (checkVSTEL === undefined) {
      selectedData.forEach(async (row: ZSDS6410Model) => {
        var dataModel: ZSDS6410Model[] = [];
        var checkKey = zsd6420list.findIndex(item => item.VBELN === row.VBELN && item.POSNR === row.POSNR);
        if (checkKey === -1) {
          dataModel = thisObj.orderGridData.filter(item => item.VBELN === row.VBELN && item.POSNR === row.POSNR);
          dataModel.forEach(async (subRow: ZSDS6410Model) => {
            zsd6420list.push(new ZSDS6420Model(subRow.VBELN, subRow.POSNR, subRow.ZSEQUENCY, subRow.VRKME, subRow.ZMENGE4,
              subRow.ZMENGE3, new Date("9999-12-31"), subRow.Z3PARVW, subRow.Z4PARVW, subRow.ZCARTYPE,
              subRow.ZCARNO, subRow.ZDRIVER, subRow.ZDRIVER1, subRow.ZPHONE, subRow.ZPHONE1,
              subRow.ZVKAUS, subRow.ZUNLOAD, "30", subRow.ZSHIPMENT_NO, subRow.ZSHIPMENT_DATE,
              subRow.ZPALLTP, subRow.ZPALLETQTY, subRow.ZCONFIRM_CUT, subRow.ZTEXT, "", ""));
          });
        }

      });

      var createModel = new ZSDIFPORTALSAPLE028RcvModel("", "", zsd6420list);
      var createModelList: ZSDIFPORTALSAPLE028RcvModel[] = [createModel];

      insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028RcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028RcvModelList", createModelList, QueryCacheType.None);
    } else {
      this.orderGrid.instance.getSelectedRowsData().forEach(async (array: ZSDS6410Model) => {
        var getData = this.imOrderList.find(item => item.VBELN === array.VBELN)
        if (getData !== undefined) {
          getData.ModelStatus = DIMModelStatus.Modify;
          getData.ZSHIP_STATUS = "30";
          getData.SC_L_MENGE = array.ZMENGE4;
          getData.SC_L_DATE = array.ZSHIPMENT_DATE;
          getData.ZSHIPMENT_NO = array.ZSHIPMENT_NO;
          getData.ZCARNO = array.ZCARNO;
          getData.ZCARTYPE = array.ZCARTYPE;
          getData.ZDRIVER = array.ZDRIVER;
          getData.ZPHONE = array.ZPHONE;
          getData.SC_G_DATE = new Date("0001-01-01");
          getData.SC_A_DATE = new Date("0001-01-01");
          getData.SC_R_DATE_C = new Date("0001-01-01");
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
    if (this.loadePeCount >= 2) {
      this.loadingVisible = false;
      this.loadePeCount = 0;
    }
  }

  //저장 이벤트
  async refSaveData(e: any) {
    //if (await confirm("저장하시겠습니까?", "알림")) {

    //  if (this.orderGrid.instance.getSelectedRowsData().length > 0) {
    //    this.loadingVisible = true;
    //      var result = await this.createOrder();
    //      this.loadingVisible = false;
    //      var reMSG = "";
    //      result.T_DATA.forEach(async (row: ZSDS6440Model) => {
    //        if (row.MTY === "E")
    //          reMSG = row.MSG;
    //      });

    //      if (reMSG !== "") {
    //        alert(`배차등록 실패,\n\n오류 메세지: ${reMSG}`, "알림");
    //        return;
    //      }
    //      else if ((result.E_MTY === "S")) {
    //        alert("등록완료되었습니다.", "알림");
    //        /*            this.orderData.push(this.popupData);*/
    //        this.dataLoad();
    //      }
    //  } else {
    //    alert("2차운송사 정보를 저장행을 선택하세요.", "알림");
    //  }
    //}
  }

  //배차등록버튼
  async refAddOrder(e: any) {

    
      //this.dataLoad("search");
      this.popCarSetData = [];
      this.clearEntery();
      var selectData: ZSDS6410Model[] = this.orderGrid.instance.getSelectedRowsData();
      var ZMENGE = 0;
      if (selectData.length === 0) {
        alert("라인을 선택한 후 실행하세요.", "알림");
        return;
      } else if (selectData.length === 1) {
        if (selectData[0].ZMENGE4 === 0)
          ZMENGE = selectData[0].ZMENGE1;
        else
          ZMENGE = selectData[0].ZMENGE4;

        this.popCarSetData = {
          ZMENGE4: ZMENGE, ZCARTYPE: selectData[0].ZCARTYPE, ZCARNO: selectData[0].ZCARNO, ZDRIVER: selectData[0].ZDRIVER,
          ZPHONE: selectData[0].ZPHONE, ZSHIPMENT_DATE: new Date(), ZDRIVER1: selectData[0].ZDRIVER1, ZPHONE1: selectData[0].ZPHONE1, ZSHIPMENT_NO: selectData[0].ZSHIPMENT_NO
        }
        this.zcarnoModiValue = selectData[0].ZCARNO;
        this.zcarValue = selectData[0].ZCARTYPE;
      } else {
        this.popCarSetData = { ZMENGE4: 0, ZCARTYPE: "", ZCARNO: "", ZDRIVER: "", ZPHONE: "", ZSHIPMENT_DATE: new Date(), ZDRIVER1: "", ZPHONE1: "", ZSHIPMENT_NO: "" };
        this.zcarnoModiValue = "";
        this.zcarValue = "";

        //alert("한 라인만 선택하세요.", "알림");
        //return;
      }
    setTimeout(async () => {
      this.popupCarSetupVisible = true;

      //if (selectData.length > 1)
      //
    }, 100);
  }

  //수정더블클릭
  orderDBClick2(e: any) {

  }

  //하차
  onZunloadCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZUNLOAD = e.selectedValue;
    });
  }
  //용도
  onZvkausCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZVKAUS = e.selectedValue;
    });
  }
  //파레트유형
  onZpalltpCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZPALLTP = e.selectedValue;
    });
  }
  //화물차종
  onZcartypeCode1ValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZCARTYPE = e.selectedValue;
    });
  }

  //화물차종
  onZcartypeCode2ValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZCARTYPE = e.selectedValue;
    });
  }

  //수정 차량번호 선택이벤트
  onZcarno2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZCARNO = e.selectedValue;
      this.popCarSetData.ZDRIVER = e.selectedItem.ZDRIVER;
      this.popCarSetData.ZPHONE = e.selectedItem.ZPHONE;
      this.zcarValue = e.selectedItem.ZCARTYPE;
    });
  }

  public clearEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    //this.vsEntery.ClearSelectedValue();
    //this.lgEntery.ClearSelectedValue();
    //this.dd07tEntery.ClearSelectedValue();
    //this.tvlvEntery.ClearSelectedValue();
    //this.zpalEntery.ClearSelectedValue();
    this.dd07tCarEntery.ClearSelectedValue();
    //this.zcarnoCodeEntery.ClearSelectedValue();
    this.zcarnoModiCodeEntery.ClearSelectedValue();
  }
}

