import { Component, NgModule, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { BrowserModule } from '@angular/platform-browser';

import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { QueryCacheType } from '../../shared/imate/imateCommon';
import { AppInfoService } from '../../shared/services/app-info.service';
import { Service, Product } from './app.service';

@Component({
  templateUrl: './woprogress.component.html',
  styleUrls: ['./woprogress.component.scss'],
  providers: [ImateDataService, Service],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WOProgressComponent {
  //dataSource: any;

  //오더데이터
  orderData: any;
  //오더내역
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


}
