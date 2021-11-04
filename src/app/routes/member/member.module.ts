import { NgModule } from '@angular/core'

import { MemberRoutingModule } from './member-routing.module'
import { SharedModule } from '@shared'

@NgModule({
  declarations: [],
  imports: [SharedModule, MemberRoutingModule],
})
export class MemberModule {}
