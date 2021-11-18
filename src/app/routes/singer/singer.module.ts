import { NgModule } from '@angular/core'

import { SingerRoutingModule } from './singer-routing.module'
import { SharedModule } from '@shared'
import { SingerDetailComponent } from './singer-detail/singer-detail.component'
import { SingerDetailResolverService } from './singer-detail-resolver.service'

@NgModule({
  declarations: [SingerDetailComponent],
  imports: [SharedModule, SingerRoutingModule],
  providers: [SingerDetailResolverService],
})
export class SingerModule {}
