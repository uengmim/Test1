import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, CSpart, Product } from '../TRMTv2/app.service'
import {
  DxCheckBoxComponent,
  DxDataGridComponent,
  DxDateBoxModule,
  DxFormComponent,
  DxPopupComponent,
  DxTextBoxComponent,
} from 'devextreme-angular';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZSDT7010Model } from '../../../shared/dataModel/MLOGP/zsdt7010';
import { ZSDT7000Model } from '../../../shared/dataModel/MLOGP/zsdt7000';
import { ZIFPORTALSAPCARGORcvModel } from '../../../shared/dataModel/MLOGP/ZifPortalSapCargoRcv';
import { ZSDS7000Model } from '../../../shared/dataModel/MLOGP/ZifPortalSapCargoRcv';
import { ZIFPORTALSAPCARTANKRcvModel } from '../../../shared/dataModel/MLOGP/ZifPortalSapCartankRcv';
import { ZSDS7020Model } from '../../../shared/dataModel/MLOGP/ZifPortalSapCartankRcv';
import { ZIFPORTALSAPTANKLORRYRcvModel } from '../../../shared/dataModel/MLOGP/ZifPortalSapTanklorryRcv';
import { ZSDS7010Model } from '../../../shared/dataModel/MLOGP/ZifPortalSapTanklorryRcv';
import ArrayStore from 'devextreme/data/array_store';
import { CodeInfoType, TableCodeInfo, ThemeManager } from '../../../shared/app.utilitys';
import notify from 'devextreme/ui/notify';
import { confirm, alert } from "devextreme/ui/dialog";
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZSDT7020Model } from '../../../shared/dataModel/MFSAP/Zsdt7020Proxy';
import { Title } from '@angular/platform-browser';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

/**
 *
 *챠량마스터 등록 component
 * */

@Component({
  templateUrl: 'trmtv2.component.html',
  providers: [ImateDataService, Service]
})

export class TRMTV2Component {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('CarNumText', { static: false }) CarNumText!: DxTextBoxComponent;
  @ViewChild('maindataGrid', { static: false }) maindataGrid!: DxDataGridComponent;
  @ViewChild('masterform', { static: false }) masterform!: DxFormComponent;
  @ViewChild('carDataCodeEntery', { static: false }) carDataCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('carDataCodeEntery2', { static: false }) carDataCodeEntery2!: CommonPossibleEntryComponent;
  @ViewChild('cargoDataCodeEntery', { static: false }) cargoDataCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('zproductEntery', { static: false }) zproductEntery!: CommonPossibleEntryComponent;
  @ViewChild('zproductEntery2', { static: false }) zproductEntery2!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('chkgbox', { static: false }) chkgbox!: DxCheckBoxComponent;

  callbacks = [];
  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "trmtv2";
  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  /* Entry  선언 */
  //화물차종
  carDataCode: TableCodeInfo;
  carDataCode2: TableCodeInfo;
  zproductCode: TableCodeInfo;
  //운송사
  tdlnrCode!: TableCodeInfo;
  carDataValue!: string | null;
  carDataValue2!: string | null;
  zproductValue: string | null;
  tdlnrValue: string | null;
  isReadOnly: boolean = true;
  cheReadOnly: boolean = true;
  oilReadOnly: boolean = true;
  tankVisible: boolean = true;
  cargoVisible: boolean = false;
  dataSource: any;
  popupTitle: any;
  zproduct1: any;
  zproduct2: any;

  quantity: boolean;
  carFormData: any;
  ownValue: any;
  carSelectCloseOptions: any;
  carSelectButtonOptions: any;
  changyou: any;
  ZCARTYPE2!: string | null;
  products!: Product[];
  ownData: Product[] = [];
  //차 값
  idValue: string;
  //조회 값
  cSpart: CSpart[];
  //선택값
  selectCSpart: string = "20";
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  zsds7010: ZSDS7010Model[] = [];
  zsds7020: ZSDS7020Model[] = [];
  //메인 데이터
  mainData: any;
  //날짜 조회
  startDate: any;
  endDate: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 조회 버튼
  searchButtonOptions: any;
  //--------------------------------------------------------------------------------유창 팝업
  //유창 등록 이벤트
  youchangRegisterOpenButtonOptions: any;
  youchangRegisterPopupVisible: any;
  youchangRegisterVisible: any;
  youchangRegisterSaveButtonOptions: any;
  youchangRegisterCloseButtonOptions: any;
  youchangRegisterFormData: any;
  //유창 수정 이벤트
  youchangUpdateOpenButtonOptions: any;
  youchangUpdatePopupVisible: any;
  youchangUpdateVisible: any;
  youchangUpdateSaveButtonOptions: any;
  youchangUpdateCloseButtonOptions: any;
  youchangUpdateFormData: any;
  //--------------------------------------------------------------------------------탱크로리 팝업
  //탱크 등록 이벤트
  tankRegisterPopupVisible: any; 
  tankRegisterSaveButtonOptions: any;
  tankRegisterCloseButtonOptions: any;
  tankRegisterFormData: any = {};  
  //탱크 수정 이벤트
  tankUpdatePopupVisible: any;
  tankUpdateSaveButtonOptions: any;
  tankUpdateCloseButtonOptions: any;
  tankUpdateFormData: any = {};
  //--------------------------------------------------------------------------------카고 팝업
  //카고 등록 이벤트
  cargoRegisterPopupVisible: any; 
  cargoRegisterSaveButtonOptions: any;
  cargoRegisterCloseButtonOptions: any;
  cargoRegisterFormData: any = {};
  //카고 수정 이벤트
  cargoUpdatePopupVisible: any;
  cargoUpdateSaveButtonOptions: any;
  cargoUpdateCloseButtonOptions: any;
  cargoUpdateFormData: any = {};
  //--------------------------------------------------------------------------------
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //줄 선택
  selectedRowIndex = -1;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;
  tankCarSelectVisible: any;
  //상세팝업 오픈
  popupVisible = false;
  validValue = true;
  documentValue = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private titleService: Title) {
    appInfo.title = AppInfoService.APP_TITLE + " | 차량마스터 등록";
    this.titleService.setTitle(appInfo.title);

    //탱크, 카고 구분
    this.cSpart = service.getCSpart();
    this.tankDataLoad(this.dataService, this);
    //파서블엔트리
    this.products = service.getProducts();
    this.carDataCode = appConfig.tableCode("RFC_화물차종");
    this.carDataCode2 = appConfig.tableCode("RFC_화물차종");
    this.zproductCode = appConfig.tableCode("RFC_화학취급제품");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.carDataCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    this.zproduct1 = "";
    this.tdlnrValue = "";
    this.zproduct2 = "";
    this.carDataValue = "";
    this.carDataValue2 = "";
    this.ZCARTYPE2 = "";
    this.ownValue = "";
    this.zproductValue = "";
    this.ownData = this.products;
    this.youchangRegisterPopupVisible = false;
    this.youchangUpdatePopupVisible = false;

    this.tankVisible = true;
    this.cargoVisible = false;
    const that = this;
    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        this.loadingVisible = true;
        if (this.selectCSpart === "20") {
          await this.tankDataLoad(this.dataService, this);
        } else {
          await this.cargoDataLoad(this.dataService, this);
        }
        this.loadingVisible = false;
      },
    };
    //차선택
    this.carSelectButtonOptions = {
      text: '확인',
      onClick: async () => {
        if (this.carDataValue2 === null || this.carDataValue2 === "" || this.carDataValue2 === undefined) {
          alert("차종을 선택해주세요.", "알림")
          return;
        }
        this.carFormData = [];
        if (this.carDataValue2 === "C1") {
          this.zproductEntery.ChangeCodeInfo(this.appConfig.tableCode("RFC_유류취급제품"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "취급제품", "", 0, 2);
          this.popupTitle = " 유류탱크로리 차량 등록"
          this.youchangRegisterPopupVisible = true;

        }
        else {
          this.zproductEntery.ChangeCodeInfo(this.appConfig.tableCode("RFC_화학취급제품"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "취급제품", "", 0, 2);
          this.popupTitle = " 화공탱크로리 차량 등록"
          this.youchangRegisterPopupVisible = false;

        }
        this.tankCarSelectVisible = false;
        this.tankRegisterPopupVisible = true;
        setTimeout(async () => {
          this.carDataValue = this.carDataValue2
          this.ownValue = "01"
          this.clearEntery();
          this.tankRegisterFormData = [];
          this.zproductValue = "";

        }, 500);
        setTimeout(async () => {
          if (this.carDataValue2 === "C1") {
            this.tankRegisterFormData.VRKME = "L"
            this.tankRegisterFormData.MEINS = "MT"

          }
          else {
            this.tankRegisterFormData.VRKME = "MT"
            this.tankRegisterFormData.MEINS = "MT"

          }
        }, 100);
      },
    };

    //차선택닫기
    this.carSelectCloseOptions = {
      text: '닫기',
      onClick: async () => {
        this.tankCarSelectVisible = false;
      },
    };
    //탱크팝업저장버튼
    this.tankRegisterSaveButtonOptions = {
      text: '저장',
      onClick: async () => {

        //지시사항 체크 로직
        var insertText = this.tankRegisterFormData.ZCARNO;
        var zcarno = encodeURI(insertText).split(/%..|./).length - 1;

        if (zcarno > 50) {
          alert("차량번호는 12자리까지만 허용합니다.", "알림");
          return;
        }

        //저장
        if (await confirm("저장하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          if (this.tankRegisterFormData.ZCARTYPE1 === "C1") {
            var result2 = await that.youchangCreate();
            this.loadingVisible = false;
            if (result2.T_DATA[0].ZIFSTATUS === "E") {
              alert(result2.T_DATA[0].ZIFMESSAGE, "알림");
              return;
            }
            this.loadingVisible = true;
          }
          var result = await this.tankCreate();
          this.loadingVisible = false;
          if (result.E_MTY === "E")
            alert(result.E_MSG, "알림");
          else {
            alert("저장되었습니다.", "알림");
            await this.tankDataLoad(this.dataService, this);
            that.tankRegisterPopupVisible = false;
          }
        }
      },
    };
    //탱크팝업저장버튼
    this.tankUpdateSaveButtonOptions = {
      text: '저장',
      onClick: async () => {

        //지시사항 체크 로직
        var insertText = this.tankUpdateFormData.ZCARNO;
        var zcarno = encodeURI(insertText).split(/%..|./).length - 1;

        if (zcarno > 50) {
          alert("차량번호는 12자리까지만 허용합니다.", "알림");
          return;
        }
        //저장
        if (await confirm("저장하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          if (this.tankUpdateFormData.ZCARTYPE1 === "C1") {
            var result2 = await that.youchangUpdate();
            this.loadingVisible = false;
            if (result2.T_DATA[0].ZIFSTATUS === "E") {
              alert(result2.T_DATA[0].ZIFMESSAGE, "알림");
              return;
            }
            this.loadingVisible = true;
          }

          var result = await this.tankUpdate();
          this.loadingVisible = false;
          if (result.E_MTY === "E")
            alert(result.E_MSG, "알림");
          else {
            alert("저장되었습니다.", "알림");
            await this.tankDataLoad(this.dataService, this);
            that.tankUpdatePopupVisible = false;
          }
        }
      },
    };
    //탱크팝업닫기버튼
    this.tankRegisterCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.tankRegisterPopupVisible = false;
      }
    };

    //유창열기
    this.youchangRegisterOpenButtonOptions = {
      text: '유창정보',
      onClick(e: any) {
        if (that.tankRegisterFormData.ZCARNO === "" || that.tankRegisterFormData.ZCARNO === null || that.tankRegisterFormData.ZCARNO === undefined) {
          alert("차량번호를 입력하세요.", "알림");
          return;
        }
        else if (that.tankRegisterFormData.ZQUAN === "" || that.tankRegisterFormData.ZQUAN === null || that.tankRegisterFormData.ZQUAN === undefined) {
          alert("적재량 입력하세요.", "알림");
          return;
        }
        else if (that.tankRegisterFormData.ZCARTANK === "" || that.tankRegisterFormData.ZCARTANK === null || that.tankRegisterFormData.ZCARTANK === undefined) {
          alert("유창수량을 입력하세요.", "알림");
          return;
        }
        that.youchangRegisterFormData = []
        setTimeout(async () => {
          that.youchangRegisterFormData.ZCARNO = that.tankRegisterFormData.ZCARNO;
          that.youchangRegisterFormData.ZLITER = that.tankRegisterFormData.ZQUAN;
          that.youchangRegisterFormData.ZCARTANK = that.tankRegisterFormData.ZCARTANK;
          that.youchangRegisterVisible = true;
        }, 500);
      }
    };

    //수정유창열기
    this.youchangUpdateOpenButtonOptions = {
      text: '유창정보',
      onClick(e: any) {
        var selectData = that.maindataGrid.instance.getSelectedRowsData();
        if (that.tankUpdateFormData.ZCARNO === "" || that.tankUpdateFormData.ZCARNO === null || that.tankUpdateFormData.ZCARNO === undefined) {
          alert("차량번호를 입력하세요.", "알림");
          return;
        }
        else if (that.tankUpdateFormData.ZQUAN === "" || that.tankUpdateFormData.ZQUAN === null || that.tankUpdateFormData.ZQUAN === undefined) {
          alert("적재량 입력하세요.", "알림");
          return;
        }
        else if (that.tankUpdateFormData.ZCARTANK === "" || that.tankUpdateFormData.ZCARTANK === null || that.tankUpdateFormData.ZCARTANK === undefined) {
          alert("유창수량을 입력하세요.", "알림");
          return;
        }
        that.youchangUpdateFormData = []
        setTimeout(async () => {
          var resultModel = await dataService.SelectModelData<ZSDT7020Model[]>(that.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7020ModelList", [],
            `MANDT = '${that.appConfig.mandt}' AND ZCARNO LIKE '%${selectData[0].ZCARNO}%' `, "", QueryCacheType.None);
          that.youchangUpdateFormData.ZCARNO = resultModel[0].ZCARNO;
          that.youchangUpdateFormData.ZLITER = resultModel[0].ZLITER;
          that.youchangUpdateFormData.ZCARTANK = resultModel[0].ZCARTANK;
          that.youchangUpdateFormData.ZTANKLITER1 = resultModel[0].ZTANKLITER1;
          that.youchangUpdateFormData.ZTANKLITER2 = resultModel[0].ZTANKLITER2;
          that.youchangUpdateFormData.ZTANKLITER3 = resultModel[0].ZTANKLITER3;
          that.youchangUpdateFormData.ZTANKLITER4 = resultModel[0].ZTANKLITER4;
          that.youchangUpdateFormData.ZTANKLITER5 = resultModel[0].ZTANKLITER5;
          that.youchangUpdateFormData.ZTANKLITER6 = resultModel[0].ZTANKLITER6;
          that.youchangUpdateFormData.ZTANKLITER7 = resultModel[0].ZTANKLITER7;
          that.youchangUpdateFormData.ZTANKLITER8 = resultModel[0].ZTANKLITER8;
          that.youchangUpdateFormData.ZTANKLITER9 = resultModel[0].ZTANKLITER9;
          that.youchangUpdateFormData.ZTANKLITER10 = resultModel[0].ZTANKLITER10;
          that.youchangUpdateFormData.ZTEXT = resultModel[0].ZTEXT;
          that.youchangUpdateVisible = true;
        }, 500);
      }
    };
    //탱크수정팝업닫기버튼
    this.tankUpdateCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.tankUpdatePopupVisible = false;
      }
    };
    //카고팝업저장버튼
    this.cargoRegisterSaveButtonOptions = {
      text: '저장',
      onClick: async () => {
        //지시사항 체크 로직
        var insertText = this.cargoRegisterFormData.ZCARNO;
        var zcarno = encodeURI(insertText).split(/%..|./).length - 1;

        if (zcarno > 50) {
          alert("차량번호는 12자리까지만 허용합니다.", "알림");
          return;
        }

        //저장
        if (await confirm("저장하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          var result = await this.cargoCreate();
          this.loadingVisible = false;
          if (result.E_MTY === "E")
            alert(result.E_MSG, "알림");
          else {
            alert("저장되었습니다.", "알림");
            await this.cargoDataLoad(this.dataService, this);
            that.cargoRegisterPopupVisible = false;
          }
        }
      },
    };

    //카고수정버튼
    this.cargoUpdateSaveButtonOptions = {
      text: '저장',
      onClick: async () => {
        //지시사항 체크 로직
        var insertText = this.cargoUpdateFormData.ZCARNO;
        var zcarno = encodeURI(insertText).split(/%..|./).length - 1;

        if (zcarno > 50) {
          alert("차량번호는 12자리까지만 허용합니다.", "알림");
          return;
        }
        //저장
        if (await confirm("저장하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          var result = await this.cargoUpdate();
          this.loadingVisible = false;
          if (result.E_MTY === "E")
            alert(result.E_MSG, "알림");
          else {
            alert("저장되었습니다.", "알림");
            await this.cargoDataLoad(this.dataService, this);
            that.cargoUpdatePopupVisible = false;
          }
        }
      },
    };
    //카고팝업닫기버튼
    this.cargoRegisterCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.cargoRegisterPopupVisible = false;
      }
    };

    //카고수정닫기버튼
    this.cargoUpdateCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.cargoUpdatePopupVisible = false;
      }
    };

    //유창저장
    this.youchangRegisterSaveButtonOptions = {
      text: '저장',
      onClick: async () => {
        that.youchangRegisterVisible = false;
      },
    };

    //유창저장
    this.youchangUpdateSaveButtonOptions = {
      text: '저장',
      onClick: async () => {

        that.youchangUpdateVisible = false;
      },
    };
    //유창닫기
    this.youchangRegisterCloseButtonOptions = {
      text: '닫기',
      onClick: async () => {
        that.youchangRegisterVisible = false;
      },
    };

    //수정유창닫기
    this.youchangUpdateCloseButtonOptions = {
      text: '닫기',
      onClick: async () => {
        that.youchangUpdateVisible = false;
      },
    };
  }

  //탱크 데이터로드
  public async tankDataLoad(dataService: ImateDataService, thisObj: TRMTV2Component) {

    var searchQuery = "";
    if (this.CarNumText.value !== undefined && this.CarNumText.value !== null) {
      searchQuery = this.CarNumText.value
    } else {
      searchQuery = ""
    }
    var resultModel = await dataService.SelectModelData<ZSDT7010Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7010ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND ZCARNO LIKE '%${searchQuery}%' `, "", QueryCacheType.None);

    this.mainData = new ArrayStore(
      {
        key: ["ZCARNO", "LIFNR", "ZDERIVER1", "ZDRIVER"],
        data: resultModel,

      });

    if (resultModel.length > 0) {
      resultModel.forEach(async (array: any) => {
        if (array.ZCARTYPE1 == "B1") {
          array.ZCARTYPE1NAME = "화공탱크로리"
        } else {
          array.ZCARTYPE1NAME = "유류탱크로리"
        }
      });
    }
    this.maindataGrid.instance.getScrollable().scrollTo(0);
    return resultModel;
  }
  //카고 데이터로드
  public async cargoDataLoad(dataService: ImateDataService, thisObj: TRMTV2Component) {
    var searchQuery = "";
    if (this.CarNumText.value !== undefined && this.CarNumText.value !== null) {
      searchQuery = this.CarNumText.value
    } else {
      searchQuery = ""
    }
    var resultModel = await dataService.SelectModelData<ZSDT7000Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7000ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND ZCARNO LIKE '%${searchQuery}%'`, "", QueryCacheType.None);

    this.mainData = new ArrayStore(
      {
        key: ["ZCARNO", "ZDERIVER1", "ZDRIVER"],
        data: resultModel,
      });

    if (resultModel.length > 0) {
      resultModel.forEach(async (array: any) => {
        if (array.ZCARTYPE == "A1") {
          array.ZCARTYPE1NAME = "대형"
        }
        else if (array.ZCARTYPE == "A2") {
          array.ZCARTYPE1NAME = "소형"
        }
        else if (array.ZCARTYPE == "A3") {
          array.ZCARTYPE1NAME = "덤프"
        }
        else if (array.ZCARTYPE == "A4") {
          array.ZCARTYPE1NAME = "택배"
        }
        else if (array.ZCARTYPE == "A5") {
          array.ZCARTYPE1NAME = "대형윙바디"
        }
        else if (array.ZCARTYPE == "A6") {
          array.ZCARTYPE1NAME = "BCT"
        }
      });
    }
    this.maindataGrid.instance.getScrollable().scrollTo(0);

    return resultModel;
  }
  //탱크, 카고 구분
  onCSpartValueChanged(e: any) {
    if (e.value === "20") {
      this.tankVisible = true;
      this.cargoVisible = false;

    } else {
      this.tankVisible = false;
      this.cargoVisible = true;
    }

    this.loadingVisible = true;

    setTimeout(async () => {
      this.selectCSpart = e.value;

      if (this.selectCSpart === "20") {
        await this.tankDataLoad(this.dataService, this);

      } else {
        await this.cargoDataLoad(this.dataService, this);
      }
      this.loadingVisible = false;

    }, 100);
  }

  //탱크차량팝업
  tankCar() {
    this.carDataCodeEntery2.SetDataFilter([["DOMVALUE_L", "=", "B1"], "or", ["DOMVALUE_L", "=", "C1"]]);
    this.tankCarSelectVisible = true;
  }
  //더블클릭이벤트
  orderDBClick(e: any) {

    if (this.selectCSpart === "20") {
      var selectGridData = this.maindataGrid.instance.getSelectedRowsData();
      if (selectGridData[0].ZCARTYPE1 === 'C1') {
        this.zproductEntery2.ChangeCodeInfo(this.appConfig.tableCode("RFC_유류취급제품"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "취급제품", "", 0, 2);
        this.carDataValue2 === "C1"
        this.popupTitle = " 유류탱크로리 차량 등록"
        this.youchangRegisterPopupVisible = false;
        this.youchangUpdatePopupVisible = true;
      }
      else {
        this.zproductEntery2.ChangeCodeInfo(this.appConfig.tableCode("RFC_화학취급제품"), "DOMVALUE_L", "%DDTEXT%(%DOMVALUE_L%)", "취급제품", "", 0, 2);
        this.carDataValue2 === "B1"
        this.popupTitle = " 화공탱크로리 차량 등록"
        this.youchangRegisterPopupVisible = false;
        this.youchangUpdatePopupVisible = false;
      }
      this.tankUpdateFormData = []

      this.carDataValue = "";
      this.clearEntery();
      setTimeout(async () => {
        this.tankUpdatePopupVisible = true;
        this.tdlnrValue = selectGridData[0].LIFNR;
        this.tankUpdateFormData.ZCAROWNER = selectGridData[0].ZCAROWNER;
        this.tankUpdateFormData = selectGridData[0];
        this.carDataValue = selectGridData[0].ZCARTYPE1;
        this.ownValue = selectGridData[0].ZCAROWNER;
        if (selectGridData[0].ZPRODUCT1 !== "" && selectGridData[0].ZPRODUCT1 !== null && selectGridData[0].ZPRODUCT1 !== undefined) {
          this.zproductValue = selectGridData[0].ZPRODUCT1;
        }
        else {
          this.zproductValue = selectGridData[0].ZPRODUCT2;
        }

        if (selectGridData[0].ZCARTYPE1 === 'C1') {
          this.tankUpdateFormData.ZQUAN = selectGridData[0].ZLITER
        }
        else {
          this.tankUpdateFormData.ZQUAN = selectGridData[0].ZCARTON
        }

        if (selectGridData[0].ZDOCUMENT === "X")
          this.documentValue = true;
        else
          this.documentValue = false;

        if (selectGridData[0].ZVALID1 === "X")
          this.validValue = true;
        else
          this.validValue = false;
      }, 500);
    }
    else {
      this.cargoUpdateFormData = []
      setTimeout(async () => {
        var selectGridData2 = this.maindataGrid.instance.getSelectedRowsData();
        this.cargoUpdatePopupVisible = true;
        this.cargoUpdateFormData = selectGridData2[0];
        this.carDataValue = selectGridData2[0].ZCARTYPE
      }, 500);
    }
  }
  //탱크 저장
  public async tankCreate() {
    var valid = this.validValue ? "X" : "";
    var document = this.documentValue ? "X" : "";

    var liter
    var ton
    if (this.tankRegisterFormData.ZCARTYPE1 === "B1") {
      this.zproduct1 = this.zproductValue;
      this.zproduct2 = "";
      ton = this.tankRegisterFormData.ZQUAN;
      liter = 0;
    }
    else {
      this.zproduct1 = "";
      this.zproduct2 = this.zproductValue;

      liter = this.tankRegisterFormData.ZQUAN;
      ton = liter / 1000;
    }
    var data = this.tankRegisterFormData;
    var zsds7010Model = new ZSDS7010Model(data.ZCARNO, this.tdlnrValue, data.ZDERIVER1, data.ZCARTYPE1, data.ZCARNO_NAME, valid, this.zproduct1, this.zproduct2, ton, liter, data.VRKME, data.ZWEIGHT1, data.ZCARTANK, data.MEINS,
      data.ZOWNERNAME, data.ZADDRESS, this.ownValue, document, data.ZLEGION, data.ZCARYEAR, data.ZRFID, data.REGNO1, data.ZPHONE1, data.ZLICENCE1, data.ZADDRESS1, data.ZDOCNO, data.ZIFMESSAGE, "I", data.ERNAM, new Date(), "000000", data.AENAM, new Date(),
      "000000", "", data.ZQUAN);
    var zsds7010List: ZSDS7010Model[] = [zsds7010Model];
    var tankModel = new ZIFPORTALSAPTANKLORRYRcvModel("", "", zsds7010List);
    var tankList: ZIFPORTALSAPTANKLORRYRcvModel[] = [tankModel]
    var insertModel = await this.dataService.RefcCallUsingModel<ZIFPORTALSAPTANKLORRYRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZIFPORTALSAPTANKLORRYRcvModelList", tankList, QueryCacheType.None);

    return insertModel[0];
  }

  // 탱크차량수정
  public async tankUpdate() {
    var valid = this.validValue ? "X" : "";
    var document = this.documentValue ? "X" : "";
    var liter
    var ton
    if (this.tankUpdateFormData.ZCARTYPE1 === "B1") {
      this.zproduct1 = this.zproductValue;
      this.zproduct2 = "";
      ton = this.tankUpdateFormData.ZQUAN;
      liter = 0;
    }
    else {
      this.zproduct1 = "";
      this.zproduct2 = this.zproductValue;
      liter = this.tankUpdateFormData.ZQUAN;
      ton = liter / 1000;
    }
    var data = this.tankUpdateFormData;
    var zsds7010Model = new ZSDS7010Model(data.ZCARNO, this.tdlnrValue, data.ZDERIVER1, data.ZCARTYPE1, data.ZCARNO_NAME, valid, this.zproduct1, this.zproduct2, ton, liter, data.VRKME, data.ZWEIGHT1, data.ZCARTANK, data.MEINS,
      data.ZOWNERNAME, data.ZADDRESS, this.ownValue, document, data.ZLEGION, data.ZCARYEAR, data.ZRFID, data.REGNO1, data.ZPHONE1, data.ZLICENCE1, data.ZADDRESS1, data.ZDOCNO, data.ZIFMESSAGE, "U", data.ERNAM, new Date(), "000000", data.AENAM, new Date(),
      "000000", "", data.ZQUAN);
    var zsds7010List: ZSDS7010Model[] = [zsds7010Model];
    var tankModel = new ZIFPORTALSAPTANKLORRYRcvModel("", "", zsds7010List);
    var tankList: ZIFPORTALSAPTANKLORRYRcvModel[] = [tankModel]
    var insertModel = await this.dataService.RefcCallUsingModel<ZIFPORTALSAPTANKLORRYRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZIFPORTALSAPTANKLORRYRcvModelList", tankList, QueryCacheType.None);

    return insertModel[0];
  }
  //카고차량등록
  public async cargoRegis() {
    this.loadingVisible = true;
    this.cargoRegisterPopupVisible = true;
    this.cargoDataCodeEntery.SetDataFilter([["DOMVALUE_L", "=", "A1"], "or", ["DOMVALUE_L", "=", "A2"], "or", ["DOMVALUE_L", "=", "A3"], "or", ["DOMVALUE_L", "=", "A4"], "or", ["DOMVALUE_L", "=", "A5"], "or", ["DOMVALUE_L", "=", "A6"]]);
    this.cargoRegisterFormData = {};
    this.cargoDataCodeEntery.ClearSelectedValue();
    this.loadingVisible = false;
  }

  // 카고차량생성
  public async cargoCreate() {
    var data = this.cargoRegisterFormData;
    var zsds7000Model = new ZSDS7000Model(data.ZCARNO, data.LIFNR, data.ZDRIVER, data.ZPHONE, data.ZCARTYPE, data.ZCARYEAR, data.ZRFID, data.REGNO, new Date(),
      new Date("9999-12-30"), data.ZVALID1, data.ZIFMESSAGE, "I", data.ERNAM, new Date(), "000000", data.AENAM, new Date(), "000000")
    var zsds7000List: ZSDS7000Model[] = [zsds7000Model]
    var cargoModel = new ZIFPORTALSAPCARGORcvModel("", "", zsds7000List);
    var cargoModelList: ZIFPORTALSAPCARGORcvModel[] = [cargoModel]
    var insertModel = await this.dataService.RefcCallUsingModel<ZIFPORTALSAPCARGORcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZIFPORTALSAPCARGORcvModelList", cargoModelList, QueryCacheType.None);
    return insertModel[0];
  }

  // 카고차량수정
  public async cargoUpdate() {
    var data = this.cargoUpdateFormData;
    var zsds7000Model = new ZSDS7000Model(data.ZCARNO, data.LIFNR, data.ZDRIVER, data.ZPHONE, data.ZCARTYPE, data.ZCARYEAR, data.ZRFID, data.REGNO, new Date(),
      new Date("9999-12-30"), data.ZVALID1, data.ZIFMESSAGE, "U", data.ERNAM, new Date(), "000000", data.AENAM, new Date(), "000000")
    var zsds7000List: ZSDS7000Model[] = [zsds7000Model]
    var cargoModel = new ZIFPORTALSAPCARGORcvModel("", "", zsds7000List);
    var cargoModelList: ZIFPORTALSAPCARGORcvModel[] = [cargoModel]
    var insertModel = await this.dataService.RefcCallUsingModel<ZIFPORTALSAPCARGORcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZIFPORTALSAPCARGORcvModelList", cargoModelList, QueryCacheType.None);
    return insertModel[0];
  }

  //유창등록
  public async youchangCreate() {
    var data = this.youchangRegisterFormData;
    var zsds7020Model = new ZSDS7020Model(data.ZCARNO, data.ZLITER, data.ZCARTANK, data.VRKME, data.ZTANKLITER1, data.ZTANKLITER2, data.ZTANKLITER3,
      data.ZTANKLITER4, data.ZTANKLITER5, data.ZTANKLITER6, data.ZTANKLITER7, data.ZTANKLITER8, data.ZTANKLITER9, data.ZTANKLITER10, data.ZTEXT, data.ZIFMESSAGE, "I",
      data.ERNAM, new Date(), "000000", data.AENAM, new Date(), "000000");
    var zsds8020List: ZSDS7020Model[] = [zsds7020Model]
    var youchangModel = new ZIFPORTALSAPCARTANKRcvModel("", "", zsds8020List);
    var youchangList: ZIFPORTALSAPCARTANKRcvModel[] = [youchangModel]
    var insertModel = await this.dataService.RefcCallUsingModel<ZIFPORTALSAPCARTANKRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZIFPORTALSAPCARTANKRcvModelList", youchangList, QueryCacheType.None);

    return insertModel[0];
  }

  //유창수정
  public async youchangUpdate() {
    var data = this.youchangUpdateFormData;

    var zsds7020Model = new ZSDS7020Model(data.ZCARNO, data.ZLITER, data.ZCARTANK, data.VRKME, data.ZTANKLITER1, data.ZTANKLITER2, data.ZTANKLITER3,
      data.ZTANKLITER4, data.ZTANKLITER5, data.ZTANKLITER6, data.ZTANKLITER7, data.ZTANKLITER8, data.ZTANKLITER9, data.ZTANKLITER10, data.ZTEXT, data.ZIFMESSAGE, "U",
      data.ERNAM, new Date(), "000000", data.AENAM, new Date(), "000000");
    var zsds8020List: ZSDS7020Model[] = [zsds7020Model]
    var youchangModel = new ZIFPORTALSAPCARTANKRcvModel("", "", zsds8020List);
    var youchangList: ZIFPORTALSAPCARTANKRcvModel[] = [youchangModel]
    var insertModel = await this.dataService.RefcCallUsingModel<ZIFPORTALSAPCARTANKRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZIFPORTALSAPCARTANKRcvModelList", youchangList, QueryCacheType.None);

    return insertModel[0];
  }

  //탱크 화물차종 코드 값 변경
  onCarTypeCodeCodeValueChanged(e: any) {
    this.carDataValue = e.selectedValue
    this.tankRegisterFormData.ZCARTYPE1 = e.selectedValue
    this.tankRegisterFormData.VRKME = null;
    this.tankRegisterFormData.ZCARTANK = null;
    this.tankRegisterFormData.MEINS = null;
    if (this.tankRegisterFormData.ZCARTYPE1 == "B1") {
      this.tankRegisterFormData.VRKME = "MT"
      this.tankRegisterFormData.ZCARTANK = "1"
      this.tankRegisterFormData.MEINS = "MT"
      this.cheReadOnly = false;
      this.oilReadOnly = true;
      this.isReadOnly = true;

    } else {
      this.tankRegisterFormData.VRKME = "L"
      this.tankRegisterFormData.MEINS = "MT"
      this.cheReadOnly = true;
      this.oilReadOnly = false;
      this.isReadOnly = false
    }
    return;
  }
  onZprocutValueChanged(e: any) {
    this.zproductValue = e.selectedValue;
  }

  onTdlnrCodeValueChanged(e: any) {
    this.tdlnrValue = e.selectedValue;
  }
  onCarTypeCodeCodeValueChanged2(e: any) {
    this.carDataValue2 = e.selectedValue
    this.carFormData.ZCARTYPE1 = this.carDataValue2
  }
  onOwnValueChanged(e: any) {
    this.ownValue = e.value;
  }
  //탱크 화물차종 코드 값 변경
  onChargoCarTypeCodeCodeValueChanged(e: any) {
    this.cargoRegisterFormData.ZCARTYPE = e.selectedValue
  }
  //화물 차종 파서블 엔트리 유효성 체크
  carTypeAdapter =
    {
      getValue: () => {
        return this.carDataValue;
      },
      applyValidationResults: (e: any) => {
        this.carDataCodeEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  public clearEntery() {
    this.zproductEntery.ClearSelectedValue();
    this.tdlnrEntery.ClearSelectedValue();
  }
}
