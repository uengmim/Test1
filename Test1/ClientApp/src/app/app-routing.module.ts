import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginFormComponent, ResetPasswordFormComponent, ChangePasswordFormComponent } from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { CommonPossibleEntryModule } from './shared/components/comm-possible-entry/comm-possible-entry.component'
import { TablePossibleEntryModule } from './shared/components/table-possible-entry/table-possible-entry.component'

import {
  DxDataGridModule,
  DxSpeedDialActionModule,
  DxFormModule,
  DxToolbarModule,
  DxSelectBoxModule,
  DxDropDownBoxModule,
  DxButtonModule,
  DxDateBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxBoxModule,
  DxTextBoxModule,
  DxBulletModule,
  DxTemplateModule,
  DxPopupModule,
  DxScrollViewModule,
  DxRangeSelectorModule,
  DxListModule,
  DxNumberBoxModule,
  DxPopoverModule,
} from 'devextreme-angular';

import { Modeltest01Component } from './pages/modeltest01/modeltest01.component';
import { Modeltest03Component } from './pages/modeltest03/modeltest03.component';
import { BondInqComponent } from './pages/bondinq/bondinq.component';
import { OrderProcessComponent } from './pages/orderprocess/orderprocess.component';
import { WeightComponent } from './pages/weight/weight.component';
import { VehiclereComponent } from './pages/Vehiclere/Vehiclere.component';
import { DispatchinComponent } from './pages/Dispatchin/Dispatchin.component';
import { FSHSComponent } from './pages/MFSAP/FSHS/fshs.component';
import { SecondaryCarrierComponent } from './pages/SecondaryCarrier/SecondaryCarrier.component';
import { ShippingRegistrationComponent } from './pages/ShippingRegistration/ShippingRegistration.component';
import { WORequestComponent } from './pages/worequest/worequest.component';
import { WOProgressComponent } from './pages/woprogress/woprogress.component';
import { WOSTComponent } from './pages/MFMPO/WOST/wost.component';
import { CSRQComponent } from './pages/MCSHP/CSRQ/csrq.component';
import { CSSOComponent } from './pages/MCSHP/CSSO/csso.component';
import { CSSQComponent } from './pages/MCSHP/CSSQ/cssq.component';
import { OWDRComponent } from './pages/MCSHP/OWDR/owdr.component';
import { SOSHComponent } from './pages/MCSHP/SOSH/sosh.component';
import { TRMTComponent } from './pages/MLOGP/TRMT/trmt.component';


const routes: Routes = [
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'modeltest01',
    component: Modeltest01Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'modeltest03',
    component: Modeltest03Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'bondinq',
    component: BondInqComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'orderprocess',
    component: OrderProcessComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'weight',
    component: WeightComponent,
    canActivate: [AuthGuardService]
  },

  {
    path: 'trmt',
    component: TRMTComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'csrq',
    component: CSRQComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'csso',
    component: CSSOComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'cssq',
    component: CSSQComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'owdr',
    component: OWDRComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'sosh',
    component: SOSHComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'Vehiclere',
    component: VehiclereComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'Dispatchin',
    component: DispatchinComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'fshs',
    component: FSHSComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'SecondaryCarrier',
    component: SecondaryCarrierComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'ShippingRegistration',
    component: ShippingRegistrationComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'worequest',
    component: WORequestComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'woprogress',
    component: WOProgressComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'wost',
    component: WOSTComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'reset-password',
    component: ResetPasswordFormComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'change-password/:recoveryCode',
    component: ChangePasswordFormComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    CommonModule,
    CommonPossibleEntryModule,
    TablePossibleEntryModule,
    DxDataGridModule,
    DxButtonModule,
    DxDateBoxModule,
    DxRadioGroupModule,
    DxFormModule,
    DxCheckBoxModule,
    DxSpeedDialActionModule,
    DxToolbarModule,
    DxSelectBoxModule,
    DxDropDownBoxModule,
    DxTextBoxModule,
    DxBulletModule,
    DxTemplateModule,
    DxPopupModule,
    DxScrollViewModule,
    DxRangeSelectorModule,
    DxListModule,
    DxNumberBoxModule,
    DxBoxModule,
    DxPopoverModule  ],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    ProfileComponent,
    TasksComponent,
    Modeltest01Component,
    Modeltest03Component,
    BondInqComponent,
    OrderProcessComponent,
    TRMTComponent,
    WeightComponent,
    CSRQComponent,
    CSSOComponent,
    CSSQComponent,
    OWDRComponent,
    SOSHComponent,
    VehiclereComponent,
    DispatchinComponent,
    FSHSComponent,
    SecondaryCarrierComponent,
    ShippingRegistrationComponent,
    WORequestComponent,
    WOProgressComponent,
    WOSTComponent,
  ]
})
export class AppRoutingModule { }
