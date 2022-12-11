import { formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
    DxDataGridComponent, DxFormComponent,
    DxPopupComponent,
    DxTextBoxComponent
} from 'devextreme-angular';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import 'devextreme/data/odata/store';
import dxDataGrid from 'devextreme/ui/data_grid';
import { alert } from "devextreme/ui/dialog";
import dxTextBox from 'devextreme/ui/text_box';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
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

/*고객주문처리(액상) Component*/


@Component({
  templateUrl: 'obpc.component.html',
  providers: [ImateDataService]
})



export class OBPCComponent {

  @ViewChild('dataList', { static: false }) dataList!: DxDataGridComponent;
  @ViewChild('bizNoText', { static: false }) bizNoText!: DxTextBoxComponent;
  @ViewChild('companyText', { static: false }) companyText!: DxTextBoxComponent;

  //날짜 선언
  startDate: any;
  endDate: any;

  //그리드 데이터
  gridList!: ArrayStore;
  conFormData: any;

  applyButtonText: string = "계약서<br>접수";


  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 구매계약확인";

    this.startDate = formatDate(new Date().setDate(new Date().getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US");
    this.dataLoad();

    

  }


  // 데이터 조회
  public async dataLoad() {
    try {

      var resultModel = await this.dataService.SelectModelData<ZMMT8700Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8700ModelList", [],
        "", "", QueryCacheType.None);
      //`BIZNO = ${this.bizNoText.value} `,
      this.gridList = new ArrayStore(
        {
          key: ["CONNO"],
          data: resultModel
        });

      //임시 (데이터없어서)
      this.gridList = new ArrayStore(
        {
          key: ["CONNO"],
          data: [{ CONDT: new Date(), CONNO: "1111111", BIDNO: "1212121212", BIDDT: new Date(), CONNM: "공고1입니다.", DUEDT: new Date(), BIZDT: new Date() }
            , { CONDT: new Date(2022, 11, 11), CONNO: "2222222", BIDNO: "3434343434", BIDDT: new Date(2022, 11, 11), CONNM: "공고2입니다.", DUEDT: new Date(2022, 11, 11), BIZDT: new Date(2022, 11, 11) }          ]
        });

      ;

      return resultModel;
    } catch {
      alert("오류", "오류");
      return Error;
    }
  }

  onDateChange(e: any) {
    var staDate = new Date(this.startDate);
    var endDate = new Date(this.endDate);

    var diffDay = Math.floor(Math.abs((staDate.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000)));

    if (diffDay > 60) {
      alert("조회기간을 최대 60일로 설정해주세요.", "알림");
    } else {
      this.dataLoad();
    }

  }
  selectedChanged(e: any) {
    
    var selectData = this.dataList.instance.getSelectedRowsData();
    this.conFormData = { CONNM: selectData[0].CONNM, CONDT: selectData[0].CONDT, CONNO: selectData[0].CONNO, BIZDT: selectData[0].BIZDT };
  }
  async apply() {
    var selectData = this.dataList.instance.getSelectedRowsData()[0];
    var model: ZMMT8700Model;
    var result = await this.dataService.SelectModelData<ZMMT8700Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8700ModelList", [], `CONNO = ${selectData.CONNO}`, "", QueryCacheType.None);
    model = result[0];
    //model.ModelStatus = DIMModelStatus.Modify;

    //var resultRow = this.dataService.ModifyModelData<ZMMT8700Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8700ModelList", [model]);

    alert("접수완료","알림");
  }
}
