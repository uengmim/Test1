import { formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Service, YnGubun } from '../OBPC/app.service';
import {
    DxDataGridComponent, DxFormComponent,
    DxPopupComponent,
    DxSelectBoxComponent,
    DxTextBoxComponent
} from 'devextreme-angular';
import { DxiItemComponent, DxoGridComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import 'devextreme/data/odata/store';
import dxDataGrid from 'devextreme/ui/data_grid';
import { alert, confirm } from "devextreme/ui/dialog";
import dxTextBox from 'devextreme/ui/text_box';
import { AttachFileInfo, CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { ZMMT8700Model } from '../../../shared/dataModel/OBPPT/Zmmt8700';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { AuthService } from '../../../shared/services';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZMMCONMstModel } from '../../../shared/dataModel/OBPPT/ZmmConMst';
import { ZMMS9000Model } from '../../../shared/dataModel/OBPPT/ZmmBidMst';
import { OfficeXPUtility } from '../../../shared/officeXp.utility';
import { HttpClient } from '@angular/common/http';
import { AttachFileComponent } from '../../../shared/components/attach-file/attach-file.component';

/* 구매계약확인 Component*/


@Component({
  templateUrl: 'obpc.component.html',
  providers: [ImateDataService, Service]
})



export class OBPCComponent {

  @ViewChild('dataList', { static: false }) dataList!: DxDataGridComponent;
  @ViewChild('bizNoText', { static: false }) bizNoText!: DxTextBoxComponent;
  @ViewChild('companyText', { static: false }) companyText!: DxTextBoxComponent;
  @ViewChild('chkgbox', { static: false }) chkgbox!: DxTextBoxComponent;
  @ViewChild('AttachFile', { static: false }) AttachFile!: AttachFileComponent;
  @ViewChild('conInDate', { static: false }) conInDate!: DxiItemComponent;

  //날짜 선언
  startDate: any;
  endDate: any;

  //로그인 정보 담기
  userInfo: any;

  bizNoValue: string;
  comNmValue: string;

  //그리드 데이터
  gridList!: ArrayStore;
  conFormData: any;

  //접수구분 데이터소스
  ynList: YnGubun[] = [];
  selectBoxValue: string;
  content: string;

  //접수버튼
  btnDisabledValue: boolean = true;
  btnVisible: boolean = true;
  btnFileDisabledValue: boolean = true;

  applyButtonText: string = "계약서<br>접수";
  fileShowButtonText: string = "첨부<br>파일";


  //--------------------------------------------------------------------

  /**
   * 첨부 파일들
   * */
  attachFiles: AttachFileInfo[] = [];

  /**
   * 업로드 문서 번호
   * */
  uploadDocumentNo: string;

  /**
   * OffcieXP 유틸리티
   * */
  offceXPUtility: OfficeXPUtility;

  /*
   *첨부파일 팝업
   */
  takePopupVisible: boolean = false;


  closeFileButtonOptions: any;


  editingMode: boolean = false;

  //--------------------------------------------------------------------
  checkValue: boolean = false;

  noText: string = "조회된 계약이 없습니다.";

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService, private httpClient: HttpClient) {
    appInfo.title = AppInfoService.APP_TITLE + " | 구매계약확인";
    //첨부파일

    this.offceXPUtility = new OfficeXPUtility(httpClient, appConfig);

    this.closeFileButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.takePopupVisible = !this.takePopupVisible;
      },
    };

    //문구 가져오기
    this.content = service.getContent();

    // 로그인정보 가져오기
    this.userInfo = this.authService.getUser().data;

    this.bizNoValue = this.userInfo?.pin ?? "";
    this.comNmValue = this.userInfo?.deptName ?? "";
    
    // 접수구분 콤보박스 세팅

    this.ynList = service.getYnGubun();
    this.selectBoxValue = "";

    this.startDate = formatDate(new Date().setDate(new Date().getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US");
    this.dataLoad();

    

  }


  // 데이터 조회
  public async dataLoad() {
    try {

      this.btnFileDisabledValue = true;
      var zmms9000Model = new ZMMS9000Model("", "");

      var zmmconmstModel = new ZMMCONMstModel(zmms9000Model, "X", this.startDate, this.endDate, this.userInfo?.deptId ?? "", []);

      var modeldtlList: ZMMCONMstModel[] = [zmmconmstModel];

      var result = await this.dataService.RefcCallUsingModel<ZMMCONMstModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMCONMstModelList", modeldtlList, QueryCacheType.None);

      this.gridList = new ArrayStore(
        {
          key: ["CONNO"],
          data: result[0].ET_DATA
        });
      this.dataList.instance.getScrollable().scrollTo(0);

      this.dataList.instance.clearSelection();
      this.dataList.instance.option("focusedRowIndex", -1);
      var selectData = this.dataList.instance.getSelectedRowsData();

      this.conInDate.editorOptions = { disabled: true };
      //this.dataList.onSelectionChanged.emit();
      //return resultModel;

      if (this.selectBoxValue == "ALL") {
        this.dataList.instance.clearFilter();
      } else {
        this.dataList.instance.filter(['BIZAPPYN', '=', this.selectBoxValue]);
      }

    } catch (error) {
      console.log(error);
      alert("오류", "오류");
      return error;
    }
  }

  onDateChange(e: any) {
    var staDate = new Date(this.startDate);
    var endDate = new Date(this.endDate);

    var diffDay = Math.floor(Math.abs((staDate.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000)));

    if (diffDay >= 60) {
      alert("조회기간을 최대 60일로 설정해주세요.", "알림");
    } else {
      this.dataLoad();
    }

  }
  selectedChanged(e: any) {
    if (e.selectedRowsData.length > 0) {
      this.btnFileDisabledValue = false;
      var selectData = e.selectedRowsData;
      this.conFormData = { CONNM: selectData[0].CONNM, CONDT: selectData[0].CONDT, CONNO: selectData[0].CONNO, BIZDT: selectData[0].BIZDT };

      if (selectData[0].BIZAPPYN == "" && (selectData[0].BIDST == "A" || selectData[0].BIDST == "X")) {
        this.btnDisabledValue = false;

        this.conInDate.editorOptions = { disabled: false };

      } else {
        this.btnDisabledValue = true;

      }
    }
    else {

      this.conFormData = {};
      this.btnDisabledValue = true;
    }
    
    this.editingMode = true;
    this.attachFiles = [];
    this.uploadDocumentNo = `MM${selectData[0].CONNO}${selectData[0].LIFNR.padStart(10,'0')}`;
    this.offceXPUtility.getOffiXpAttachFileInfo(`MM${selectData[0].CONNO}${selectData[0].LIFNR.padStart(10, '0')}`).then((fileInfos) => {
      this.attachFiles = fileInfos
    });
  }
  async apply() {
    console.log(this.conFormData.BIZDT);
    if (this.conFormData.BIZDT === null) {
      alert("계약서 접수입자를 입력하세요.", "알림");
      return;
    }
    if (!this.checkValue) {
      alert("동의를 눌러주세요.", "알림");
      return;
    }

    if (await confirm("계약서를 접수하시겠습니까 ?", "알림")) {

      var selectData = this.dataList.instance.getSelectedRowsData()[0];
      var model: ZMMT8700Model;
      var cleanDate = new Date("0001-01-01");

      var result = await this.dataService.SelectModelData<ZMMT8700Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8700ModelList", [], `MANDT = '${this.appConfig.mandt}' AND CONNO = '${selectData.CONNO}'`, "", QueryCacheType.None);
      model = result[0];
      model.ModelStatus = DIMModelStatus.Modify;
      model.BIZAPPYN = "X";
      model.BIDDT = model.BIDDT ?? cleanDate;
      model.CONDT = model.CONDT ?? cleanDate;
      model.DUEDT = model.DUEDT ?? cleanDate;
      model.FEXPDT = model.FEXPDT ?? cleanDate;
      model.TEXPDT = model.TEXPDT ?? cleanDate;
      model.INSDT = model.INSDT ?? cleanDate;
      model.MOMDT = model.MOMDT ?? cleanDate;
      model.AENAM = this.appConfig.interfaceId;
      model.PRICE = model.PRICE/100;
      model.VAT = model.VAT/100;
      model.AMOUNT = model.AMOUNT/100;
      model.AEDAT = new Date();
      model.AEZET = formatDate(new Date(), "HH:mm:ss", "en-US");
      model.BIZDT = this.conFormData.BIZDT;
     // model.BIZDT = new Date(); 

      console.log(model);
      var resultRow = await this.dataService.ModifyModelData<ZMMT8700Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8700ModelList", [model]);

      // 파일첨부 저장 같이 넣어주기
      this.AttachFile.upload();
      this.checkValue = false;

      alert("접수완료", "알림");
      this.dataLoad();

     
    }
  }
  selectApply(e: any) {
    if (e.value == "ALL") {
      this.dataList.instance.clearFilter();
    } else {
      this.dataList.instance.filter(['BIZAPPYN', '=', e.value]);
    }
  }

  attachFileChanged(e: any) {

    this.AttachFile.upload();
  }

  // 첨부파일
  fileShowPopup() {
    this.takePopupVisible = true;
  }
  uploadComplete(e: any) {
    alert("첨부하신 파일이 저장되었습니다.", "알림");
  }
}
