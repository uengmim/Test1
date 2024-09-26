/*
 * 재고유형변경 보류->가용
 */
import { NgModule, Component, enableProdMode, ViewChild, Input, AfterViewInit } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, OrderData, CheOrderData, Data } from '../OWIB/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZMMCURRStockModel, ZMMS3120Model, ZMMS3140Model } from '../../../shared/dataModel/OWHP/ZmmCurrStockProxy';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { debug } from 'util';
import { CodeInfoType, TableCodeInfo } from '../../../shared/app.utilitys';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AuthService } from '../../../shared/services';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZSDT7110Model } from '../../../shared/dataModel/MLOGP/Zsdt7110';
import { T001lModel } from '../../../shared/dataModel/MLOGP/T001l';
import ArrayStore from 'devextreme/data/array_store';
import { confirm, alert } from "devextreme/ui/dialog";
import { ZMMGOODSMVTCommonModel, ZMMS3130Model } from '../../../shared/dataModel/OWHP/ZmmGoodsmvtCommonProxy';
import { changeForm } from './app.service';



//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'owic.component.html',
  providers: [ImateDataService, Service]
})

export class OWICComponent {
  @ViewChild('dataGrid', { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('arehouseEntery', { static: false }) arehouseEntery!: CommonPossibleEntryComponent;

  //data
  dataSource: any;

  loadPanelOption: any;

  //셀렉트박스
  data!: Data[];
  selectData: string;

  //정보
  mainGridData: any;
  sort: string[];

  //날짜 조회
  startDate: any;
  endDate: any;

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;
  currentFilter: any;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 조회 버튼
  searchButtonOptions: any;
  exportSelectedData: any;
  changeButtonOptions: any;
  saveButtonOptions: any;
  closeButtonOptions: any;

  changeFormData: changeForm;

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //파서블엔트리 선택값
  lgortValue: string | null = "";

  lgortCode: TableCodeInfo;
  lifnrValue: string | null = null;

  btnVisible: boolean;

  kunweValueA: string | null = "";

  private loadePeCount: number = 0;

  popupVisible = false;

  //줄 선택
  selectedRowIndex = -1;

  empId: string = "";
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";
  rolid: string[] = [];
  userid: string = "";

  checkList: ZMMS3140Model[] = [];

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  enteryLoading: boolean = false;

  lgNmList: T001lModel[] = [];

  isDisabled: boolean = false;

  /**
* 데이터 스토어 키
* */
  dataStoreKey: string = "owic";

  constructor(private dataService: ImateDataService, service: Service, imInfo: ImateInfo, http: HttpClient, private appInfo: AppInfoService, private appConfig: AppConfigService, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 재고유형변경 보류->가용";
    let page = this;

    this.loadingVisible = true;

    this.lgortCode = appConfig.tableCode("전체창고");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgortCode),

    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    let userInfo = this.authService.getUser().data;

    //this.empId = userInfo?.empId.padStart(10, '0');
    this.rolid = userInfo?.role;
    this.vorgid = userInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = userInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = userInfo.orgOption.torgid.padStart(10, '0');
    this.empId = this.corgid;

    this.lgortValue = "";

    this.getLgortNm();

    this.changeFormData = { MATNR: "", MAKTX: "", SPEME: 0, LABST: 0, INPUT: 0, MEMO: "", LGORT: "", MEINS: "" };

    //정보
    this.sort = service.getSort();

    //셀렉터 데이터
    this.selectData = "10";

    //정보
    this.data = service.getData();

    //this.mainGridData = new CustomStore(
    //  {
    //    key: ["LGORT", "MATNR"],
    //    load: function (loadOptions) {
    //      return page.dataLoad(this);
    //    }
    //  });

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadPanelOption = { enabled: true };
        this.loadingVisible = true;
        await this.dataLoad(this);
        this.loadingVisible = false;
      },
    };

    //엑셀버튼
    this.exportSelectedData = {
      icon: 'export',
      onClick: () => {
        //this.dataGrid.instance.exportToExcel(true);

      },
    };

    this.changeButtonOptions = {
      text: '보류->가용',
      onClick: async () => {
        var selectData = this.dataGrid.instance.getSelectedRowsData();
        if (selectData.length === 0) {
          await alert("한 라인을 선택 후 실행하세요.", "알림");
          return;
        }

        if (selectData[0].SPEME === 0) {
          await alert("변환할 보류재고가 없습니다.", "알림");
          return;
        }

        this.changeFormData.MATNR = selectData[0].MATNR;
        this.changeFormData.MAKTX = selectData[0].MAKTX;
        this.changeFormData.LGORT = selectData[0].LGORT;
        this.changeFormData.SPEME = selectData[0].SPEME;
        this.changeFormData.MEINS = selectData[0].MEINS;
        this.changeFormData.INPUT = 0;
        this.changeFormData.MEMO = "";

        this.popupVisible = true;
      },
    };

    this.saveButtonOptions = {
      text: '저장',
      onClick: async () => {

        if (this.changeFormData.INPUT < 0) {
          alert("0보다작은 수량은 입력할 수 없습니다.", "오류");
          return;
        }

        if (this.changeFormData.INPUT > this.changeFormData.SPEME) {
          alert("보류수량보다 많은 수량은 입력할 수 없습니다.", "오류");
          this.changeFormData.INPUT = this.changeFormData.SPEME;
          return;
        }

        var textCount = encodeURI(this.changeFormData.MEMO).split(/%..|./).length - 1;
        if (textCount > 25) {
          alert("입력된 메모가 너무깁니다.", "오류");
          return;
        }

        if (await confirm("저장 하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          var result: ZMMGOODSMVTCommonModel = await this.saveChangeMattype();
          this.loadingVisible = false;

          if (result.E_MBLNR === "") {
            await alert("저장이 실패했습니다.", "오류");
            return;
          } else {
            await alert(`저장이 완료되었습니다. 문서번호 : ${result.E_MBLNR}`, "알림");
            await this.dataLoad(this);
            return;
          }

          this.popupVisible = false;
        }
      },
    };

    this.closeButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.popupVisible = false;
      },
    };
  }

  form_fieldDataChanged(e) {
    if (e.dataField === "INPUT") {
      if (e.value < 0) {
        alert("0보다작은 수량은 입력할 수 없습니다.", "오류");
        return;
      }

      if (e.value > this.changeFormData.SPEME) {
        alert("보류수량보다 많은 수량은 입력할 수 없습니다.", "오류");
        this.changeFormData.INPUT = this.changeFormData.SPEME;
        return;
      }
    } else if (e.dataField === "MEMO") {
      var textCount = encodeURI(e.value).split(/%..|./).length - 1;
      if (textCount > 25) {
        alert("입력된 메모가 너무깁니다.", "오류");
        return;
      }
    }
  }


  private async dataLoad(thisObj: OWICComponent) {

    var model: ZMMS3140Model = new ZMMS3140Model(this.lgortValue, "", "", "", "", "", "", this.selectData, "", "", DIMModelStatus.UnChanged);
    var rfcModelList: ZMMCURRStockModel[] = [new ZMMCURRStockModel("", "1000", [], [model], DIMModelStatus.UnChanged)];
    
    var result = await this.dataService.RefcCallUsingModel<ZMMCURRStockModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMCURRStockModelList", rfcModelList, QueryCacheType.None);

    this.mainGridData = new ArrayStore(
      {
        key: ["LGORT", "MATNR"],
        data: result[0].ET_LIST
      });
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }

  onPEDataLoaded(e: any) {
    this.loadePeCount++;

    if (this.loadePeCount >= 1) {
      this.enteryLoading = true;
      var setVal = this.lgNmList.find(item => item.KUNNR === this.empId)
      if (setVal !== undefined)
        this.lgortValue = setVal.LGORT;
      else
        this.lgortValue = "3000";

      if (this.rolid.find(item => item === "ADMIN") === undefined)
        this.isDisabled = true;

      this.loadePeCount = 0;
      
      this.dataLoad(this);
      this.loadingVisible = false;
    }
  }

  async getLgortNm() {

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.lgortCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(T001lModel);
    this.lgNmList = resultModel;
  }

  private async saveChangeMattype() {

    //바피 모델
    var zmms3130List = [new ZMMS3130Model(this.changeFormData.MATNR, this.changeFormData.LGORT, "", "", "", this.changeFormData.INPUT, this.changeFormData.MEINS,
      "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0)];

    var zmmGoodsMVT = [new ZMMGOODSMVTCommonModel([], "", "", "", "X", new Date(), "04", this.changeFormData.MEMO, "343",
      this.appConfig.plant, new Date(), "", zmms3130List)];

    //바피 실행
    var runGoodsMVT = await this.dataService.RefcCallUsingModel<ZMMGOODSMVTCommonModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMGOODSMVTCommonModelList", zmmGoodsMVT, QueryCacheType.None);

    return runGoodsMVT[0];
  }
}
