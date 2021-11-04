import { NgModule } from '@angular/core'
import { SheetListRoutingModule } from './sheet-list-routing.module'
import { SharedModule } from '@shared'
import { SheetListComponent } from './sheet-list.component'

@NgModule({
  declarations: [SheetListComponent],
  imports: [SharedModule, SheetListRoutingModule],
})
export class SheetListModule {}
