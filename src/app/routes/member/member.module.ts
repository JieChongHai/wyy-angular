import { NgModule } from '@angular/core'

import { MemberRoutingModule } from './member-routing.module'
import { SharedModule } from '@shared';
import { CenterComponent } from './center/center.component';
import { RecordsComponent } from './components/records/records.component';
import { RecordDetailComponent } from './record-detail/record-detail.component'

@NgModule({
  declarations: [
    CenterComponent,
    RecordsComponent,
    RecordDetailComponent
  ],
  imports: [SharedModule, MemberRoutingModule],
})
export class MemberModule {}
