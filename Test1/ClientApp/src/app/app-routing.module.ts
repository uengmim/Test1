import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginFormComponent, ResetPasswordFormComponent, ChangePasswordFormComponent } from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TasksComponent } from './pages/tasks/tasks.component';

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
  DxRadioGroupModule
} from 'devextreme-angular';

import { Modeltest01Component } from './pages/modeltest01/modeltest01.component';
import { Modeltest03Component } from './pages/modeltest03/modeltest03.component';

import { WORequestComponent } from './pages/worequest/worequest.component';
import { WOProgressComponent } from './pages/woprogress/woprogress.component';
import { PTSD001Component } from './pages/PTSD001/PTSD001.component';
import { PTSD002Component } from './pages/PTSD002/PTSD002.component';
import { PTSD003Component } from './pages/PTSD003/PTSD003.component';
<<<<<<< HEAD
import { PTSD004Component } from './pages/PTSD004/PTSD004.component';
import { PTSD007Component } from './pages/PTSD007/PTSD007.component';
import { PTSD008Component } from './pages/PTSD008/PTSD008.component';

=======
>>>>>>> 55dfd025d25305dd75506e41eab5c1e4d4785f2d

const routes: Routes = [
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [ AuthGuardService ]
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
    path: 'PTSD001',
    component: PTSD001Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'PTSD002',
    component: PTSD002Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'PTSD003',
    component: PTSD003Component,
    canActivate: [AuthGuardService]
  },
  {
<<<<<<< HEAD
    path: 'PTSD004',
    component: PTSD004Component,
    canActivate: [AuthGuardService]
  },
  {
    path: 'PTSD007',
    component: PTSD007Component,
=======
    path: 'worequest',
    component: WORequestComponent,
>>>>>>> 55dfd025d25305dd75506e41eab5c1e4d4785f2d
    canActivate: [AuthGuardService]
  },
  {
    path: 'woprogress',
    component: WOProgressComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'reset-password',
    component: ResetPasswordFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'change-password/:recoveryCode',
    component: ChangePasswordFormComponent,
    canActivate: [ AuthGuardService ]
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
    DxDataGridModule,
    DxButtonModule,
    DxDateBoxModule,
    DxRadioGroupModule,
    DxFormModule,
    DxCheckBoxModule,
    DxSpeedDialActionModule,
    DxToolbarModule,
    DxSelectBoxModule,
    DxDropDownBoxModule],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    ProfileComponent,
    TasksComponent,
    Modeltest01Component,
    Modeltest03Component,
    PTSD001Component,
    PTSD002Component,
    PTSD003Component,
<<<<<<< HEAD
    PTSD004Component,
    PTSD007Component,
    PTSD008Component

=======
>>>>>>> 55dfd025d25305dd75506e41eab5c1e4d4785f2d
  ]
})
export class AppRoutingModule { }
