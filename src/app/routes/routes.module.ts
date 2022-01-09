import { NgModule } from '@angular/core'
import { SharedModule } from '@shared'
import { HomeModule } from './home/home.module'
import { RouteRoutingModule } from './routes-routing.module'

@NgModule({
  declarations: [],
  imports: [HomeModule, SharedModule, RouteRoutingModule],
})
export class RoutesModule {}
