import { Component, NgModule, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { BrowserModule } from '@angular/platform-browser';

import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { QueryCacheType, QueryParameter } from '../../shared/imate/imateCommon';
import { AppInfoService } from '../../shared/services/app-info.service';
import { Service, Product } from './app.service';
import { CommonCodeInfo, TableCodeInfo } from '../../shared/app.utilitys';
import { AppConfigService } from '../../shared/services/appconfig.service';
import { CommonPossibleEntryComponent } from '../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../shared/components/table-possible-entry/table-possible-entry.component';

@Component({
  templateUrl: './worequest.component.html',
  providers: [ImateDataService, Service],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WORequestComponent {
  @ViewChild('sd007Dynamic', { static: false }) sd007Dynamic!: CommonPossibleEntryComponent;
  @ViewChild('t023tDynamic', { static: false }) t023tDynamic!: TablePossibleEntryComponent;
  @ViewChild('t023tDynamic2', { static: false }) t023tDynamic2!: TablePossibleEntryComponent;
  //dataSource: any;

  selectedItem: Product;

  products: any;

  gridBoxValue: number[] = [4];

  isGridBoxOpened: boolean;

  displayExpr: string;

  simpleProducts: string[];

  gridColumns: any = ['그룹코드', '그룹명', '코드', '코드명'];

  sd007Code: CommonCodeInfo;

  t023tCode: TableCodeInfo

  maraCode: TableCodeInfo

  cCode: TableCodeInfo

  dCode: TableCodeInfo

  oCode: TableCodeInfo

  aCode: TableCodeInfo

  cartypeCode: TableCodeInfo

  selectedLike: string;

  localappConfig: AppConfigService;

  selectedValue: string;

  //_dataService: ImateDataService;

  constructor(private dataService: ImateDataService, private appInfo: AppInfoService, service: Service, private ref: ChangeDetectorRef, private appConfig: AppConfigService) {
    appInfo.title = AppInfoService.APP_TITLE + " | W/O 요청";
    //this._dataService = dataService;

    /*this.products = service.getProduct();*/
    this.products = this.makeAsyncDataSource(service);
    this.selectedItem = this.products[0];

    this.isGridBoxOpened = false;

    this.displayExpr = "";

    this.simpleProducts = service.getSimpleProducts();

    this.sd007Code = appConfig.commonCode("주문유형");

    this.t023tCode = appConfig.tableCode("제품구분");

    this.maraCode = appConfig.tableCode("비료납품처")

    this.cCode = appConfig.tableCode("오브젝트파트")

    this.dCode = appConfig.tableCode("손상")

    this.oCode = appConfig.tableCode("사유")

    this.aCode = appConfig.tableCode("액티비티")

    this.cartypeCode = appConfig.tableCode("RFC_화물차종")

    this.selectedValue = "Z100";

    this.selectedLike = "A%";

    this.localappConfig = appConfig;

    let model = this;
    model.displayExpr = "";
    //this.dataSource = new CustomStore(
    //  {
    //    key: ["PARAM1"],
    //    load: function (loadOptions) {
    //      return model.dataLoad(dataService);
    //    }
    //  });
  }
  makeAsyncDataSource(service: Service) {
    return new CustomStore({
      loadMode: 'raw',
      key: ['GCODE', 'GCODENM', 'SCODE', 'SCODENM'],
      load() {
        return service.getProduct();
      },
    });
  }

  gridBox_displayExpr = (item: any) => {
    var model = this;
    return model.displayExpr;
  }

  onGridBoxOptionChanged(e:any) {
    if (e.name === 'value') {
      var model = this;
      model.displayExpr = e.value[0].GCODENM + '-' + e.value[0].SCODENM;
      this.isGridBoxOpened = false;
      this.ref.detectChanges();
    }
  }

  onCodeValueChanged(e: any) {
    if (e.selectedValue == "Z100")
      this.selectedLike = "A";
    else if (e.selectedValue == "Z110")
      this.selectedLike = "B";
    else if (e.selectedValue == "Z120")
      this.selectedLike = "C";
    else
      this.selectedLike = "D";

    var selectLike = this.selectedLike;
    this.t023tCode.queryParams.forEach(function (value) {
      if (value.name == "like")
        value.value = selectLike;
    });

    this.t023tDynamic.ChangeCodeInfo(this.appConfig.tableCode("비료제품구분"), "MATKL", "%WGBEZ%", "제품구분");
    this.t023tDynamic2.SetDataFilter(["MATKL", "startswith", this.selectedLike]);
    this.t023tDynamic2.ClearSelectedValue();
    return;
  }

  ont023tCodeValueChanged(e: any) {
    return;
  }

  public async dataLoad(dataService: ImateDataService) {
    
    var itInput: ZIMATETESTStructModel[] = [];
    var input1 = new ZIMATETESTStructModel("ABCD", 1.21, 10000, new Date("2020-12-01"), "10:05:30.91");

    itInput.push(new ZIMATETESTStructModel("EGCH", 2.32, 20, new Date("2021-01-02"), "22:00:15.1"));
    itInput.push(new ZIMATETESTStructModel("IJKL", 3.43, 30, new Date("2022-05-11"), "09:20:27.540"));
    itInput.push(new ZIMATETESTStructModel("MNON", 4.54, 40, new Date("2022-04-20"), "16:00:20.101"));

    var rfcModel = new ZXNSCNEWRFCCALLTestModel(input1, itInput);
    var rfcMoelList: ZXNSCNEWRFCCALLTestModel[] = [rfcModel];

    var resultModel = await dataService.RefcCallUsingModel<ZXNSCNEWRFCCALLTestModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCNEWRFCCALLTestModelList",
                                                                          rfcMoelList, QueryCacheType.None);
    return resultModel[0].IT_RESULT;
  }
}
