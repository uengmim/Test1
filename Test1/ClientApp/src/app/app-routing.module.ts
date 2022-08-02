import { NgModule, Component, enableProdMode } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent, ResetPasswordFormComponent, CreateAccountFormComponent, ChangePasswordFormComponent } from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import {
  DxDataGridModule,
  DxFormModule,
  DxDropDownBoxModule,
  DxBoxModule,
  DxButtonModule,
  DxDateBoxModule
} from 'devextreme-angular';
import { Modeltest01Component } from './pages/modeltest01/modeltest01.component';
import { Modeltest02Component } from './pages/modeltest02/modeltest02.component';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';

  
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
    path: 'modeltest02',
    component: Modeltest02Component,
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
    path: 'create-account',
    component: CreateAccountFormComponent,
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
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), BrowserModule, DxDataGridModule, DxFormModule, DxDropDownBoxModule, DxButtonModule, DxBoxModule, DxDateBoxModule],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    ProfileComponent,
    TasksComponent,
    Modeltest01Component,
    Modeltest02Component,

    
  ],
  bootstrap: [Modeltest02Component],
})
export class AppRoutingModule { }
platformBrowserDynamic().bootstrapModule(AppRoutingModule);


