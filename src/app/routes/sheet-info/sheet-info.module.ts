import { NgModule } from '@angular/core'

import { SheetInfoRoutingModule } from './sheet-info-routing.module'
import { SharedModule } from '@shared'
import { SheetInfoComponent } from './sheet-info.component'
import { SheetInfoResolverService } from './sheet-info-resolver.service'

@NgModule({
  declarations: [SheetInfoComponent],
  imports: [SharedModule, SheetInfoRoutingModule],
  providers: [SheetInfoResolverService],
})
export class SheetInfoModule {}
