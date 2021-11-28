import { CommonModule } from '@angular/common'
import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormatTimePipe } from '../../pipes/format-time.pipe'
import { WySliderModule } from '../wy-slider/wy-slider.module'
import { WyPlayerComponent } from './wy-player.component'
import { WyPlayerPanelComponent } from './wy-player-panel/wy-player-panel.component'
import { WyScrollComponent } from './wy-scroll/wy-scroll.component'
import { ClickoutsideDirective } from '../../directives/clickoutside.directive'
import { StopPropagationDirective } from '../../directives/stop-propagation.directive'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

const COMPONENTS: Array<Type<any>> = [WyPlayerComponent]
const DIRECTIVES: Array<Type<any>> = [ClickoutsideDirective, StopPropagationDirective]
const PIPES: Array<Type<any>> = [FormatTimePipe]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, WySliderModule, NzToolTipModule],
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES, WyPlayerPanelComponent, WyScrollComponent],
  exports: [...COMPONENTS, ...PIPES, ...DIRECTIVES],
})
export class WyPlayerModule {}
