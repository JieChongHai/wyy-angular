import { CommonModule } from '@angular/common'
import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormatTimePipe } from '../../pipes/format-time.pipe'
import { WySliderModule } from '../wy-slider/wy-slider.module'
import { WyPlayerComponent } from './wy-player.component'
import { WyPlayerPanelComponent } from './wy-player-panel/wy-player-panel.component'

const COMPONENTS: Array<Type<any>> = [WyPlayerComponent]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, WySliderModule],
  declarations: [...COMPONENTS, FormatTimePipe, WyPlayerPanelComponent],
  exports: [...COMPONENTS],
})
export class WyPlayerModule {}
