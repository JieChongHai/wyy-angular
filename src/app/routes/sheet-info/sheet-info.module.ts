import { NgModule } from '@angular/core'

import { SheetInfoRoutingModule } from './sheet-info-routing.module'
import { SharedModule } from '@shared'
import { SheetInfoComponent } from './sheet-info.component'

@NgModule({
  declarations: [SheetInfoComponent],
  imports: [SharedModule, SheetInfoRoutingModule],
})
export class SheetInfoModule {}
