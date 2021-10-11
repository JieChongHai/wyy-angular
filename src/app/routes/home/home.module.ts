import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { WyCarouselComponent } from './components/wy-carousel/wy-carousel.component';
import { MemberCardComponent } from './components/member-card/member-card.component';
import { SingerCardComponent } from './components/singer-card/singer-card.component';


@NgModule({
  declarations: [
    HomeComponent,
    WyCarouselComponent,
    MemberCardComponent,
    SingerCardComponent
  ],
  imports: [
    SharedModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
