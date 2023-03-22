import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { formatDate } from '@angular/common';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, CSpart, SpData, SelectTdlData } from '../CTOC/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';
import { CodeInfoType, TableCodeInfo } from '../../../shared/app.utilitys';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { alert, confirm } from "devextreme/ui/dialog"
import { ZSDIFPORTALSAPLE29SndModel, ZSDS6310Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe29Snd';
import ArrayStore from 'devextreme/data/array_store';
import { ZSDIFPORTALSAPLE028RcvModel, ZSDS6420Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Rcv';
import { ZSDIFPORTALSAPLE29RcvModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe29Rcv';

/**
 *
 *인수확인(화학) component
 * */

@Component({
  templateUrl: 'ctoc.component.html',
  providers: [ImateDataService, Service]
})

export class CTOCComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: TablePossibleEntryComponent
  @ViewChild('tdlnr2Entery', { static: false }) tdlnr2Entery!: TablePossibleEntryComponent

  selectedItemKeys: any[] = [];
  selectedRowIndex = -1;


  callbacks = [];

  //조회조건
  wadatIstDatefrom: any;
  wadatIstDateto: any;
  cSpart: CSpart[];
  Spdata: SpData[];
  tdlnrCode!: TableCodeInfo;
  tdlnr2Code!: TableCodeInfo;
  tdlnrValue!: string | null;
  tdlnr2Value!: string | null;
  spartValue: string | null;
  spdataValue: string | null;


  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "ctoc";

  //파서블엔트리 로딩 카운트
  private loadePeCount: number = 0;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //데이터 조회 버튼
  searchButtonOptions: any;

  gridDataSource: any;
  orderList: ZSDS6310Model[] = [];

  tdlData: SelectTdlData[] = [];
  selectTdlValue: string = "10";

  //값 체크
  //validation Adapter
 tdlnrAdapter = {
    getValue: () => {
      return this.tdlnrValue;
    },
    applyValidationResults: (e: any) => {
      this.tdlnrEntery.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };


  //버튼
  saveButtonOptions: any;

  //필터
  customOperations!: Array<any>;
  saleAmountHeaderFilter: any;
  popupPosition: any;

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  selectedOption: string[] = [];

  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";
  rolid: string[] = [];
  is1chDisabled: boolean = false;
  is2chDisabled: boolean = false;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 인수확인(화학)";

    this.loadingVisible = true;

    //로그인 사용자 정보
    let usrInfo = authService.getUser().data;
    this.vorgid = usrInfo.orgOption.vorgid.padStart(10, "0");
    this.corgid = usrInfo.orgOption.corgid.padStart(10, "0");
    this.torgid = usrInfo.orgOption.torgid.padStart(10, "0");
    this.rolid = usrInfo.role;

    this.tdlData = service.getSelectTdlData();

    // 값세팅
    this.spartValue = "20";
    this.spdataValue = "2000";

    //화학 구분
    this.cSpart = service.getCSpart();
    //화학 출하지점
    this.Spdata = service.getSpData();
    //운송사 code정보
    this.tdlnrCode = appConfig.tableCode("운송업체");
    //운송사 code정보
    this.tdlnr2Code = appConfig.tableCode("운송업체");
    //출고일자 Default
    this.wadatIstDatefrom = new Date();
    this.wadatIstDateto = new Date();

    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnr2Code)
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------

    this.tdlnrValue = "";


    //저장버튼
    this.saveButtonOptions = {
      text: "검색",
      onClick: async () => {
        this.loadingVisible = true;
        //await this.dataLoad();
        this.loadingVisible = false;
      },
    };

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async (e: any) => {
        /*let result = e.validationGroup.validate();
        if (!result.isValid) {
          alert("필수값을 입력하여 주십시오.", "알림");
          return;
        }
        else {*/
          this.loadingVisible = true;
          await this.dataLoad();
          this.loadingVisible = false;
        
      },
    };


    this.loadingVisible = false;
  }
  /*
  * 파서블 엔트리 데이터 로딩 완료
  * @param e
  */
onPEDataLoaded(e: any) {
  this.loadePeCount++; 
  if (this.loadePeCount >= 1) {

    if (this.rolid.find(item => item === "ADMIN") === undefined) {
      //if (this.rolid.find(item => item === "R17") !== undefined) {
      //  this.tdlnrValue = this.torgid;
      //  this.is1chDisabled = true;
      //} else if (this.rolid.find(item => item === "R18") !== undefined) {
      //  this.tdlnr2Value = this.torgid;
      //  this.is2chDisabled = true;
      //}

      /*this.tdlnrValue = this.torgid;*/
      /*this.is1chDisabled = true;*/
    }

    this.dataLoad();
    this.loadingVisible = false;
    this.loadePeCount = 0;
  }
}

  //고객인수확인 목록 조회
  public async dataLoad() {
    var tdlnrVal = "";
    var tdlnr2Val = "";

    if (this.selectTdlValue === "10")
      tdlnrVal = this.tdlnrValue;
    else
      tdlnr2Val = this.tdlnrValue;

    //if (this.tdlnrValue === "") {
    //  await alert("운송사코드는 필수입니다.", "알림");
    //  return;
    //}

    var sendModel = new ZSDIFPORTALSAPLE29SndModel("", "", this.corgid, "", "", this.spartValue, this.spdataValue, this.wadatIstDatefrom, this.wadatIstDateto, tdlnrVal, tdlnr2Val, "", []);

    var sendModelList: ZSDIFPORTALSAPLE29SndModel[] = [sendModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE29SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE29SndModelList", sendModelList, QueryCacheType.None);
    console.log(result);
    this.orderList = result[0].T_DATA;

    this.gridDataSource = new ArrayStore(
      {
        key: ["VBELN", "POSNR", "VBELN", "VGPOS" ],
        data: this.orderList
      });
  }

  async saveData() {
    var selectData = this.dataGrid.instance.getSelectedRowsData();
    if (selectData.length > 0) {

      var sendData: ZSDS6310Model[] = [];

      selectData.forEach((array : any) => {

        if (array.ZCONFIRM_CUT === null || array.ZCONFIRM_CUT === 0) {
          return;
        }
        else {
          sendData.push(array);
        }


      });

      console.log(sendData);

      if (selectData.length != sendData.length) {
        alert("고객확인 수량이 입력되지 않은 데이터가 존재합니다.", "알림");
        return;
      }

      if (await confirm("저장하시겠습니까?", "알림")) {

        var sendDataModel = new ZSDIFPORTALSAPLE29RcvModel("", "", sendData);
        var sendDataList: ZSDIFPORTALSAPLE29RcvModel[] = [sendDataModel];
        var result = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE29RcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE29RcvModelList", sendDataList, QueryCacheType.None);

        if (result[0].E_MTY === "E") {
          alert(`저장 오류 : ${result[0].E_MSG}`, "저장실패");
        } else {
          alert(`[ ${result[0].E_MTY}] 저장되었습니다.`, "저장성공");
          this.dataGrid.instance.clearSelection();
          this.dataLoad();
        }
      }
      console.log(result[0]);

    } else {
      alert("저장할 데이터 행을 선택해주세요.", "알림");
      return;
    }
  }

}
