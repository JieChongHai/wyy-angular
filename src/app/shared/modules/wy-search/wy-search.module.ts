import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { OverlayModule } from '@angular/cdk/overlay'
import { WySearchComponent } from './wy-search.component'
import { WySearchPanelComponent } from './wy-search-panel/wy-search-panel.component'
import { WySearchDataService } from './wy-search-data.service'

@NgModule({
  imports: [CommonModule, NzIconModule, NzInputModule, OverlayModule],
  declarations: [WySearchComponent, WySearchPanelComponent],
  exports: [WySearchComponent],
  providers: [WySearchDataService]
})
export class WySearchModule {}
