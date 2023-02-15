import { formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  DxDataGridComponent, DxFormComponent,
  DxPopupComponent,
  DxSelectBoxComponent
} from 'devextreme-angular';
import { DxiItemComponent, DxiToolbarItemComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import 'devextreme/data/odata/store';
import { parseDate } from 'devextreme/localization';
import { alert, confirm } from "devextreme/ui/dialog";
import { List, Enumerable } from 'linqts'
import { deepCopy } from '../../../shared/imate/utility/object-copy';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { ZMMBIDDtlModel, ZMMS8020Model } from '../../../shared/dataModel/OBPPT/ZmmBidDtl';
import { ZMMBIDMstModel, ZMMS9000Model } from '../../../shared/dataModel/OBPPT/ZmmBidMst';
import { ZMMT8370Model } from '../../../shared/dataModel/OBPPT/Zmmt8370';
import { ZMMT8510Model } from '../../../shared/dataModel/OBPPT/Zmmt8510';
import { ZMMT8510Custom } from '../../../shared/dataModel/OBPPT/Zmmt8510Custom';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { AuthService } from '../../../shared/services';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { Seq } from './app.service';

/*입찰신청투찰 Component*/


@Component({
  templateUrl: 'obbg.component.html',
  providers: [ImateDataService]
})

export class OBBGComponent {
  @ViewChild('bidGrid', { static: false }) bidGrid!: DxDataGridComponent;
  @ViewChild('gretdIn', { static: false }) gretdIn!: DxiItemComponent;
  @ViewChild('PrgstatusEntry', { static: false }) PrgstatusEntry!: CommonPossibleEntryComponent;


  callbacks = [];

  //상단 조회조건
  startDate: any;
  endDate: any;
  bizNoValue: string;
  bidcstValue: number;
  bidListcstValue: number;
  //gird 데이터
  bidList!: ArrayStore;
  dtlList: any;

  //숨김처리변수
  loadingVisible: boolean = false;
  cstDisabled: boolean = false;
  detailVisible: boolean = false;
  bidVisible: boolean = false;
  bidListVisible: boolean = false;
  checkVisible: boolean = false;
  checkListVisible: boolean = false;

  //선택 키
  selectedItemKeys: any[] = [];

  //상세내역 팝업 데이터
  detailData: any;
  //검색데이터
  searchFormData: any;
  //투찰 자재내역
  bidGridData: any;
  //투찰내역 자재내역
  bidListGridData: any;

  //투찰데이터
  bidFormData: any;
  //투찰내역데이터
  bidListFormData: any;

  //로그인정보
  userInfo: any;

  //입찰 닫기 버튼
  closeButtonOptions: any;
  //내역 닫기 버튼
  BidcloseButtonOptions: any;
  //입찰조회 버튼
  searchButtonOptions: any;
  //입찰 저장 버튼
  saveButtonOptions: any;
  //입찰 삭제 버튼
  deleteButtonOptions: any;
  //입찰 수정 버튼
  modifyButtonOptions: any;
  //투찰차수select
  selectOptions: any;

  selectList: Seq[] = [];
  seqSelect: string;
  popupcloseButtonOptions: any;

  //결재조건 파서블엔트리
  RegulationCode: any;
  PrgstatusCode: CommonCodeInfo;
  loadePeCount = 0;
  RegulationValue: any;
  PrgstatusCodeValue: string | null = null;

  openFlag: boolean;

  //질문 파서블 엔트리 유효성 체크
  PrgstatusAdapter =
    {
      getValue: () => {
        return this.PrgstatusCodeValue;
      },
      applyValidationResults: (e: any) => {
        this.PrgstatusEntry.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };


  /**
  * 데이터 스토어 키
  * */
  dataStoreKey: string = "obbg";
  //동의 체크박스
  checkBoxValue: any;
  checkListBoxValue: any;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 입찰신청투찰";


    this.openFlag = false;
    this.PrgstatusCodeValue = "3";
    this.RegulationCode = appConfig.commonCode("결재조건");
    this.PrgstatusCode = appConfig.commonCode("공고진행상태");



    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.PrgstatusCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.RegulationCode)
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    // 로그인정보 가져오기
    this.userInfo = this.authService.getUser().data;

    this.bizNoValue = this.userInfo?.pin ?? "";

    this.bidcstValue = 0;
    this.startDate = formatDate(new Date().setDate(new Date().getDate() - 90), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")


    //팝업 닫기 버튼
    this.popupcloseButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.detailVisible = false;
        console.log(this.detailVisible);
      },
    };

    //팝업 닫기 버튼
    this.closeButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.bidVisible = !this.bidVisible;
      },
    };

    //팝업 닫기 버튼
    this.BidcloseButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.bidListVisible = !this.bidListVisible;
      },
    };

    //팝업 조회 버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async (e: any) => {
        if (this.searchFormData.BIDNO == "") {
          alert("공고번호 입력 후 조회하세요.", "알림");
        } else {

        }
      },
    };
    //팝업 저장 버튼
    this.saveButtonOptions = {
      text: '저장',
      onClick: async (e: any) => {
        if (this.checkCloseing(this.bidFormData, null)) {

          if (this.bidFormData.VATTY == "OUT") {

            this.bidFormData.BIDCAST_I = this.bidcstValue;
            this.bidFormData.BIDVAT_I = Math.floor(this.bidcstValue * 0.1) / 10 * 10;
            this.bidFormData.BIDAMT_I = this.bidFormData.BIDCST_I + this.bidFormData.BIDVAT_I;
          }
          else {
            this.bidFormData.BIDCST_I = this.bidcstValue;
            this.bidFormData.BIDVAT_I = 0;
            this.bidFormData.BIDAMT_I = this.bidcstValue;
          }

          if (await confirm("투찰하시겠습니까 ? ", "저장알림")) {



            if (this.bidFormData.BIDCST_I === 0) {
              alert("입력된 투찰금액이 없습니다.", "알림");
            }
            else if (this.checkVisible && !this.checkBoxValue) {
              alert("입력하신 투찰금액에 대한 동의가 필요합니다.", "알림");
            } else {
              var seq = this.bidFormData.BIDSEQ == "" ? "001" : (parseInt(this.bidFormData.BIDSEQ) + 1).toString().padStart(3, '0');
              var lifnr = this.authService.getUser().data?.deptId ?? "";
              var model = new ZMMT8510Model(this.appConfig.mandt, this.bidFormData.BIDNO.padStart(15, '0'), lifnr.padStart(10, '0'), seq, this.authService.getUser().data?.pin ?? "",
                new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), this.bidFormData.GRETD, this.bidFormData.BIDCST_I / 100, this.bidFormData.BIDVAT_I / 100, this.bidFormData.BIDAMT_I / 100, "KRW", "", "", "",
                this.appConfig.interfaceId, new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), this.appConfig.interfaceId, new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), DIMModelStatus.Add);

              var modelList: ZMMT8510Model[] = [model];
              var result = await this.dataService.ModifyModelData<ZMMT8510Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8510ModelList", modelList);

              var resultModel = await dataService.SelectModelData<ZMMT8510Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8510ModelList", [],
                `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${this.bidFormData.BIDNO.padStart(15, '0')}' AND LIFNR = '${lifnr.padStart(10, '0')}' AND BIDSEQ = '${seq}'`, "", QueryCacheType.None);

              if (resultModel.length > 0) {
                alert("투찰 제출이 완료되었습니다.", "알림");
                this.bidVisible = !this.bidVisible;
                this.dataLoad();
              }
            }
          }
        }
        //var rowCount1 = await this.dataService.ModifyModelData<ZMMT8510Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", mainmodelList);
      }
    }
    //팝업 수정 버튼
    this.modifyButtonOptions = {
      text: '저장',
      onClick: async (e: any) => {
        if (this.bidListFormData.VATTY == "OUT") {
          this.bidListFormData.BIDCST = this.bidListcstValue;
          this.bidListFormData.BIDVAT = Math.floor(this.bidListcstValue * 0.1) / 10 * 10;
          this.bidListFormData.BIDAMT_I = this.bidListFormData.BIDCST + this.bidListFormData.BIDVAT;
        }
        else {
          this.bidListFormData.BIDCST = this.bidListcstValue;
          this.bidListFormData.BIDVAT = 0;
          this.bidListFormData.BIDAMT = this.bidListcstValue;
        }

        if (await confirm("투찰정보를 수정하시겠습니까 ? ", "수정알림")) {

          if (this.bidListFormData.BIDCST === 0) {
            alert("입력된 투찰금액이 없습니다.", "알림");
          }
          else if (this.checkListVisible && !this.checkListBoxValue) {
            alert("입력하신 투찰금액에 대한 동의가 필요합니다.", "알림");
          } else {
            var seq = this.bidListFormData.BIDSEQ;
            var lifnr = this.authService.getUser().data?.deptId ?? "";
            var model = new ZMMT8510Model(this.appConfig.mandt, this.bidListFormData.BIDNO.padStart(15, '0'), lifnr.padStart(10, '0'), seq, this.authService.getUser().data?.pin ?? "",
              new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), this.bidListFormData.GRETD, this.bidListFormData.BIDCST / 100, this.bidListFormData.BIDVAT / 100, this.bidListFormData.BIDAMT / 100, "KRW", "", "", "",
              this.appConfig.interfaceId, new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), this.appConfig.interfaceId, new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), DIMModelStatus.Modify);

            var modelList: ZMMT8510Model[] = [model];
            console.log(model);
            var result = await this.dataService.ModifyModelData<ZMMT8510Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8510ModelList", modelList);

            var resultModel = await dataService.SelectModelData<ZMMT8510Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8510ModelList", [],
              `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${this.bidListFormData.BIDNO.padStart(15, '0')}' AND LIFNR = '${lifnr.padStart(10, '0')}' AND BIDSEQ = '${seq}'`, "", QueryCacheType.None);

            if (resultModel.length > 0) {
              alert("투찰 수정이 완료되었습니다.", "알림");

              var reulstList = await this.bidListDataLoad(this.bidListFormData.BIDNO, this.seqSelect);
              Object.assign(this.bidListFormData, reulstList);

              var resultGrid = await this.detaildataLoad(this.bidListFormData.BIDNO, this.seqSelect);

              this.bidListGridData = new ArrayStore({
                key: ['MATNR'],
                data: resultGrid.ET_DATA

              });
            }
          }
        }
        //var rowCount1 = await this.dataService.ModifyModelData<ZMMT8510Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", mainmodelList);
      }
    }
    //팝업 삭제 버튼
    this.deleteButtonOptions = {
      text: '삭제',
      onClick: async (e: any) => {
        if (await confirm("삭제하시겠습니까?", "알림")) {
          var lifnr = this.authService.getUser().data?.deptId ?? "";
          var model = new ZMMT8510Model(this.appConfig.mandt, this.bidListFormData.BIDNO.padStart(15, '0'), lifnr.padStart(10, '0'), this.bidListFormData.BIDSEQ, this.authService.getUser().data?.pin ?? "",
            (this.bidListFormData.BIDDTH == "" ? null : this.bidListFormData.BIDDTH) ?? new Date("0001-01-01"), "000000", this.bidListFormData.GRETD ?? new Date("0001-01-01"), this.bidListFormData.BIDCST, this.bidListFormData.BIDVAT, this.bidListFormData.BIDAMT, "KRW", "", "", "",
            this.appConfig.interfaceId, new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), this.appConfig.interfaceId, new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), DIMModelStatus.Delete);

          var modelList: ZMMT8510Model[] = [model];
          var result = await this.dataService.ModifyModelData<ZMMT8510Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8510ModelList", modelList);

          var resultModel = await dataService.SelectModelData<ZMMT8510Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8510ModelList", [],
            `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${this.bidListFormData.BIDNO.padStart(15, '0')}' AND LIFNR = '${lifnr.padStart(10, '0')}' AND BIDSEQ = '${this.bidListFormData.BIDSEQ.padStart(3, '0')}'`, "", QueryCacheType.None);

          if (resultModel.length > 0) {
            alert("삭제 중 오류가 발생했습니다.", "알림");
          } else {
            alert("삭제되었습니다.", "알림");
            this.bidListVisible = !this.bidListVisible;
            this.dataLoad();
          }
        }

      }
    }
  }

  selectionChanged(data: any) {
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }

  //리스트 조회 RFC
  public async dataLoad() {
    var zmms9000Model = new ZMMS9000Model("", "");

    var lifnr = this.authService.getUser().data?.deptId ?? "";

    var zmmbidmstModel = new ZMMBIDMstModel(zmms9000Model, this.startDate, this.endDate, this.PrgstatusCodeValue ?? "", lifnr.padStart(10, '0'), [], []);

    var modelList: ZMMBIDMstModel[] = [zmmbidmstModel];

    this.loadingVisible = true;
    var resultModel = await this.dataService.RefcCallUsingModel<ZMMBIDMstModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDMstModelList", modelList, QueryCacheType.None);
    this.loadingVisible = false;


    if (resultModel[0].ES_RESULT.TYPE !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].ES_RESULT.MESSAGE}`, "알림");
      this.bidList = new ArrayStore({
        key: ['BIDNO'],
        data: resultModel[0].ET_DATA

      });
    }
    else {
      this.bidList = new ArrayStore({
        key: ['BIDNO'],
        data: resultModel[0].ET_DATA

      });
    }


    this.PrgstatusEntry.possbleDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");
    this.PrgstatusEntry.popupDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");
  }
  //투찰내역 조회 
  public async bidListDataLoad(BIDNO: string, SEQ: string) {

    var lifnr = this.authService.getUser().data?.deptId ?? "";

    var queryModel = await this.dataService.SelectModelData<ZMMT8510Custom[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8510CustomModelList",
      ['3', 'MM', 'MM832', this.appConfig.mandt, BIDNO.padStart(15, '0'), lifnr.padStart(10, '0'), SEQ.padStart(3, '0')], "", "", QueryCacheType.None);
    console.log(queryModel[0]);
    return queryModel[0];
  }
  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */
  onDataLoaded(e: any) {
    this.loadePeCount++;

    if (this.loadePeCount >= 2) {
      this.loadePeCount = 0;
      this.dataLoad();

    }
  }
  /**
* 화면 종료
* */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore(this.dataStoreKey);
  }
  searchData() {
    this.dataLoad();

  }
  async DetailData() {
    this.detailVisible = !this.detailVisible;
    var selectData = this.bidGrid.instance.getSelectedRowsData()[0];
    this.RegulationValue = selectData.PAYTY;
    this.detailData = selectData;
    this.detailData.BIZNO = this.userInfo?.pin ?? "";
    this.detailData.NAME1 = this.userInfo?.deptName ?? "";
    this.detailData.RFQAMT = parseInt(this.detailData.RFQAMT);


    var result = await this.detaildataLoad(selectData.BIDNO, selectData.RFQSEQ ?? "");

    this.dtlList = new ArrayStore({
      key: ['BIDNO'],
      data: result.ET_DATA

    });

    this.dtlList._array.forEach(async (array: any) => {

      var MENGEdata = result.ET_DATA.find(obj => obj.BNFPO == array.BNFPO);

      if (MENGEdata != undefined) {
        if (this.detailData.BIDRUL == "A") {
          array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
          array.RFQVAT = parseInt(array.RFQCST1) * 0.1
          array.RFQAMT = parseInt(array.RFQCST1) + parseInt(array.RFQVAT)
        }

        else {
          array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
          if (this.detailData.VATTY == "OUT") {
            array.RFQVAT = parseInt(array.RFQCST1) * 0.1
          } else {
            array.RFQVAT = "0"
          }
          array.RFQAMT = parseInt(array.RFQCST1) + parseInt(array.RFQVAT)
        }
      }
      this.loadingVisible = false;

    });
  }
  async Bid() {
    var selectData = this.bidGrid.instance.getSelectedRowsData()[0];
    
    if (this.checkCloseing(selectData, null)) {

      this.bidFormData = {};
      this.bidcstValue = 0;

      if (selectData.S_BIDRST != "I") {
        alert("투찰이 불가능합니다.[부적격]", "알림");
        return;
      }
      if (selectData.BIDSEQ != "" && selectData.BIDRST != "C") {
        alert("입찰결과가 재입찰일 경우에만 투찰이 가능합니다.\t<br> ( 투찰 수정 및 삭제는 투찰 내역에서 가능합니다. )", "알림");
        return;
      }


      this.bidFormData = selectData;

      this.bidFormData.BIZNO = this.userInfo?.pin ?? "";
      this.bidFormData.NAME1 = this.userInfo?.deptName ?? "";
      this.bidFormData.GRETD = parseDate(this.bidFormData.GRETD??formatDate(new Date(),'yyyyMMdd','en-US'), 'yyyyMMdd');
      this.bidFormData.RFQCST = parseInt(this.bidFormData.RFQCST) ?? 0;
      this.bidFormData.RFQVAT = parseInt(this.bidFormData.RFQVAT) ?? 0;
      this.bidFormData.RFQAMT = parseInt(this.bidFormData.RFQAMT) ?? 0;
      Object.assign(this.bidFormData, { BIDCST_I: 0, BIDVAT_I: 0, BIDAMT_I: 0 });
      this.bidFormData.BIDCST = parseInt(this.bidFormData.BIDCST) ?? 0;
      this.bidFormData.BIDVAT = parseInt(this.bidFormData.BIDVAT) ?? 0;
      this.bidFormData.BIDAMT = parseInt(this.bidFormData.BIDAMT) ?? 0;

      var result = await this.detaildataLoad(selectData.BIDNO, selectData.RFQSEQ ?? "");

      this.bidGridData = new ArrayStore({
        key: ['MATNR'],
        data: result.ET_DATA

      });

      this.bidVisible = !this.bidVisible;
      
    }
  }
  async BidList() {
    this.bidListFormData = {};

    var selectData = this.bidGrid.instance.getSelectedRowsData()[0];
    var checkSeq = selectData.BIDSEQ ?? 0;
    if (checkSeq < 1) {
      alert("투찰 내역이 존재하지 않습니다.", "알림");
    }
    else {

      this.bidListcstValue = 0;

      this.bidListFormData = Object.assign({}, selectData); // 깊은복사

      this.bidListFormData.BIZNO = this.userInfo?.pin ?? "";
      this.bidListFormData.NAME1 = this.userInfo?.deptName ?? "";

      this.selectList = [];
      for (var i = 1; i <= parseInt(selectData.BIDSEQ ?? 0); i++) {
        var seq = i.toString().padStart(3, '0');
        this.selectList.push(new Seq(seq, "[차수] " + seq));
      }

      this.seqSelect = selectData.BIDSEQ.padStart(3, '0');;
      console.log(this.seqSelect);

      this.openFlag = true;
      var reulstList = await this.bidListDataLoad(selectData.BIDNO, selectData.BIDSEQ);
      console.log("확인 : ");
      console.log(reulstList);
      console.log(this.bidListFormData);
      Object.assign(this.bidListFormData, reulstList);
      console.log(this.bidListFormData);
      Object.assign(this.bidListFormData, { MAXSEQ: selectData.BIDSEQ ?? 0, BIZNO: this.userInfo?.pin ?? "" });
      console.log(this.bidListFormData);
      this.bidListcstValue = this.bidListFormData.BIDCST ?? 0;

      if (this.checkCloseing(this.bidListFormData, "")) {
        if (this.bidListFormData.BIDRST != "") {
          this.changeEditOption(false);
          this.checkListVisible = false;
        }
        else {
          this.changeEditOption(true);
        }
      } else {
        this.changeEditOption(false);
        this.checkListVisible = false;
      }

      this.bidListFormData.RFQCST = parseInt(this.bidListFormData.RFQCST) ?? 0;
      this.bidListFormData.RFQVAT = parseInt(this.bidListFormData.RFQVAT) ?? 0;
      this.bidListFormData.RFQAMT = parseInt(this.bidListFormData.RFQAMT) ?? 0;

      var resultGrid = await this.detaildataLoad(selectData.BIDNO, selectData.BIDSEQ ?? "");

      this.bidListGridData = new ArrayStore({
        key: ['MATNR'],
        data: resultGrid.ET_DATA

      });
      this.bidListVisible = !this.bidListVisible;
    }
  }
  //날짜 클릭
  dateCheck(e: any) {
    var staDate = new Date(this.startDate);
    var endDate = new Date(this.endDate);

    var diffDay = Math.floor(Math.abs((staDate.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000)));

    if (diffDay > 90) {
      alert("조회기간을 최대 3개월 이내로 설정해주세요.", "알림");
    } else {
      this.dataLoad();
    }
  }

  // 상세 데이터 로드
  public async detaildataLoad(BIDNO: string, RFQSEQ: string) {

    var lifnr = this.userInfo?.deptId ?? "";

    var zmms9000Model = new ZMMS9000Model("", "");

    var zmmbiddtlModel = new ZMMBIDDtlModel(zmms9000Model, BIDNO.padStart(15, '0'), lifnr.padStart(10, '0'), RFQSEQ.padStart(3, '0'), []);

    var modeldtlList: ZMMBIDDtlModel[] = [zmmbiddtlModel];

    var result = await this.dataService.RefcCallUsingModel<ZMMBIDDtlModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDDtlModelList", modeldtlList, QueryCacheType.None);

    return result[0]

  }
  async seqChange(e: any) {

    this.openFlag = true;

    var reulstList = await this.bidListDataLoad(this.bidListFormData.BIDNO, this.seqSelect);
    console.log(reulstList);
    Object.assign(this.bidListFormData, reulstList);
    this.bidListcstValue = reulstList.BIDCST;
    
    if (this.bidListFormData.MAXSEQ.padStart(3, '0') === this.seqSelect.padStart(3, '0')) {
      if (this.checkCloseing(this.bidListFormData, "")) {
        if (this.bidListFormData.BIDRST != "") {
          this.changeEditOption(false);
          this.checkListVisible = false;
        }
        else {
          this.changeEditOption(true);
        }
      } else {
        this.changeEditOption(false);
        this.checkListVisible = false;
      }
    }
    else {
      this.changeEditOption(false);
      this.checkListVisible = false;

    }

    var resultGrid = await this.detaildataLoad(this.bidListFormData.BIDNO, this.seqSelect);

    this.bidListGridData = new ArrayStore({
      key: ['MATNR'],
      data: resultGrid.ET_DATA

    });
  }

  checkCloseing(selectData: any, alertFlag: any) {

    console.log(selectData);
    //현재날짜 문자열 변환
    let nowDate = formatDate(new Date(), "yyyyMMdd", "en-US");
    //현재시간 문자열 변환
    let nowTime = formatDate(new Date(), "HHmmss", "en-US");
    //입찰개시일자 문자열 변환
    let staDate = selectData.BISDTH
    //입찰개시시간
    let staTime = selectData.BISDTT.replace(/:/g, '');
    //입찰마감일자 문자열 변환
    let endDate = selectData.BIFDTH
    //입찰마감시간
    let endTime = selectData.BIFDTT.replace(/:/g, '');
    console.log(nowDate + "," + staDate + "," + endDate);
    console.log(nowTime + "," + staTime + "," + endTime);
    if (selectData.BIDST == "6") {
      return true;
    }
    if (selectData.BIDST != "3" && selectData.BIDSEQ == "") {
      alertFlag ?? alert("투찰이 불가능합니다.[공고상태]", "알림");
      return false;
    }
    if (nowDate < staDate) {
      // 입찰개시일자 전이면
      alertFlag ?? alert("입찰 개시 전입니다.", "알림");
      return false;
    }
    if (nowDate > endDate) {
      alertFlag ?? alert("입찰이 마감되었습니다.", "알림");
      return false;
    }
    if (nowDate == staDate) {
      if (nowTime < staTime) {
        //입찰개시시간 전이면
        alertFlag ?? alert("입찰 개시 전입니다.", "알림");
        return false;
      }
    }
    if (nowDate == endDate) {  //입찰 마감 시간 후라면
      console.log(nowTime > endTime);
      if (nowTime > endTime) {
        alertFlag ?? alert("입찰이 마감되었습니다.", "알림");
        return false;
      }
    }
    return true;
  }
  changeEditOption(flag: boolean) {
    this.modifyButtonOptions = { visible: flag };
    this.deleteButtonOptions = { visible: flag };
    this.gretdIn.editorOptions = { disabled: !flag };
    this.cstDisabled = !flag;
  }

  amt(e: any) {
    if (e.value > this.bidFormData.RFQCST) {
      alert("견적가 이상 입력이 불가능합니다.", "알림");
      e.component.option('value', 0);
    }
    else {
      if (e.value != 0) {
        if (this.bidFormData.VATTY == "OUT") {
          this.bidFormData.BIDCST_I = e.value;
          this.bidFormData.BIDVAT_I = Math.floor(e.value * 0.1) / 10 * 10;
          this.bidFormData.BIDAMT_I = this.bidFormData.BIDCST_I + this.bidFormData.BIDVAT_I;
        }
        else {
          this.bidFormData.BIDCST_I = e.value;
          this.bidFormData.BIDVAT_I = 0;
          this.bidFormData.BIDAMT_I = e.value;
        }
        if (parseInt(this.bidFormData.BIDAMT_I) < parseInt(this.bidFormData.RFQAMT) * 0.7) {
          alert("총 금액차이 70%이상입니다.", "투찰금액 알림");
          this.checkBoxValue = false;
          this.checkVisible = true;
        } else {
          this.checkVisible = false;
        }
      }
    }

  }

  amtList(e: any) {
    if (!this.openFlag) {
      if (e.value > this.bidListFormData.RFQCST) {
        alert("견적가 이상 입력이 불가능합니다.", "알림");
        e.component.option('value', 0);
      }
      else {
        if (e.value != 0) {
          if (this.bidListFormData.VATTY == "OUT") {
            this.bidListFormData.BIDCST = e.value;
            this.bidListFormData.BIDVAT = Math.floor(e.value * 0.1) / 10 * 10;
            this.bidListFormData.BIDAMT_I = this.bidListFormData.BIDCST + this.bidListFormData.BIDVAT;
          }
          else {
            this.bidListFormData.BIDCST = e.value;
            this.bidListFormData.BIDVAT = 0;
            this.bidListFormData.BIDAMT = e.value;
          }
          if (parseInt(this.bidListFormData.BIDAMT) < parseInt(this.bidListFormData.RFQAMT) * 0.7) {
            alert("총 금액차이 70%이상입니다.", "투찰금액 알림");
            this.checkListBoxValue = false;
            this.checkListVisible = true;
          } else {
            this.checkListVisible = false;
          }
        }
      }

    }
    else {
      this.openFlag = false;
    }
  }
}
