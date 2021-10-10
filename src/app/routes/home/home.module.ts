import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { WyCarouselComponent } from './components/wy-carousel/wy-carousel.component';


@NgModule({
  declarations: [
    HomeComponent,
    WyCarouselComponent
  ],
  imports: [
    SharedModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
