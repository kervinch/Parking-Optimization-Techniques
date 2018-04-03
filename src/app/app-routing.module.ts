import { NgModule } from "@angular/core";
import { Routes } from '@angular/router'; 
import { OrderComponent } from "./order/order.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { CancelComponent } from "./cancel/cancel.component";
import { RouterModule } from "@angular/router";
import { SimulatorComponent } from "./simulator/simulator.component";
import { ControlComponent } from "./control/control.component";

const appRoutes: Routes = [
    { path: '', redirectTo: '/control', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'order', component: OrderComponent },
    { path: 'cancel', component: CancelComponent },
    { path: 'simulator', component: SimulatorComponent},
    { path: 'control', component: ControlComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}