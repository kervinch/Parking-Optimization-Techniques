import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { OrderComponent } from './order/order.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlotComponent } from './dashboard/slot/slot.component';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatTableModule, MatDatepickerModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatSelectModule, MatTooltipModule, MatIconModule, MatSnackBarModule, MatProgressBarModule, MatFormFieldModule, MatToolbarModule, MatPaginatorModule, MatCheckboxModule, MatSortModule } from '@angular/material';
import { dbService } from './shared/dbService'
import { SimulatorComponent } from './simulator/simulator.component';
import { NgPipesModule } from 'ngx-pipes';
import { CancelComponent } from './cancel/cancel.component';
import { BooleanAlternativePipe } from '../pipes/boolean-alternative.pipes';
import { ControlComponent } from './control/control.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    OrderComponent,
    DashboardComponent,
    SimulatorComponent,
    ControlComponent,
    SlotComponent,
    CancelComponent,
    BooleanAlternativePipe,
    ControlComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    NgPipesModule
  ],
  providers: [dbService],
  bootstrap: [AppComponent],
})
export class AppModule { }
