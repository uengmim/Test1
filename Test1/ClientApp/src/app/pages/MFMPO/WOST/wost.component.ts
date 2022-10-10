import { Component, NgModule, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { BrowserModule } from '@angular/platform-browser';

import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Product } from './app.service';

@Component({
  templateUrl: './wost.component.html',
  styleUrls: ['./wost.component.scss'],
  providers: [ImateDataService, Service],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WOSTComponent {
  //dataSource: any;

  //오더데이터
  orderData: any;
  //오더내역
  orderInfo: any;
  //사용자재정보
  MaterialList: any;
  //고장정보
  FaultInfo: any;
  //항목단가
  ItemPrice: any;
  //고장해결
  TroubleshootingList: any;

  //현재날짜
  now: Date = new Date();

  collapsed = false;

  //상세팝업 오픈
  popupVisible = false;

  //_dataService: ImateDataService;

  constructor(private dataService: ImateDataService, private appInfo: AppInfoService, service: Service, private ref: ChangeDetectorRef) {
    appInfo.title = AppInfoService.APP_TITLE + " | W/O 진행현황";

    this.orderData = service.getOrderData();
    this.orderData = new CustomStore(
      {
        key: ["AUFNR"],
        load: function (loadOptions) {
          return service.getOrderData();
        }
      });

    this.orderInfo = service.getOrderInfo();

    this.MaterialList = new CustomStore(
      {
        key: ["AUFNR", "RSNUM", "WERKS", "LGORT", "MATNR"],
        load: function (loadOptions) {
          return service.getMaterialList();
        }
      });

    this.FaultInfo = new CustomStore(
      {
        key: ["AUFNR", "QMNUM", "FENUM", "URNUM", "FEKAT", "FECOD", "FEVER", "OTKAT", "OTGRP", "OTEIL", "FEGRP"],
        load: function (loadOptions) {
          return service.getFaultInfo();
        }
      });

    this.ItemPrice = new CustomStore(
      {
        key: ["AUFNR", "PAYITEM"],
        load: function (loadOptions) {
          return service.getItemPrice();
        }
      });

    this.TroubleshootingList = new CustomStore(
      {
        key: ["QMNUM", "MANUM"],
        load: function (loadOptions) {
          return service.getTroubleshootingList();
        }
      });
  }

  contentReady = (e:any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  orderDBClick(e: any) {
    this.popupVisible = !this.popupVisible;
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
