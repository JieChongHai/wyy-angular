import { CommonModule } from '@angular/common'
import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormatTimePipe } from '../../pipes/format-time.pipe'
import { WySliderModule } from '../wy-slider/wy-slider.module'
import { WyPlayerComponent } from './wy-player.component'
import { WyPlayerPanelComponent } from './wy-player-panel/wy-player-panel.component'
import { WyScrollComponent } from './wy-scroll/wy-scroll.component'
import { ClickoutsideDirective } from '../../directives/clickoutside.directive'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

const COMPONENTS: Array<Type<any>> = [WyPlayerComponent]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, WySliderModule, NzToolTipModule],
  declarations: [...COMPONENTS, FormatTimePipe, ClickoutsideDirective, WyPlayerPanelComponent, WyScrollComponent],
  exports: [...COMPONENTS, FormatTimePipe, ClickoutsideDirective],
})
export class WyPlayerModule {}
