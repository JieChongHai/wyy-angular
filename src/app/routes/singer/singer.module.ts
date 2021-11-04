import { NgModule } from '@angular/core'

import { SingerRoutingModule } from './singer-routing.module'
import { SharedModule } from '@shared'

@NgModule({
  declarations: [],
  imports: [SharedModule, SingerRoutingModule],
})
export class SingerModule {}
