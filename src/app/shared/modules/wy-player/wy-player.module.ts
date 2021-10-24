import { CommonModule } from '@angular/common'
import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormatTimePipe } from '../../pipes/format-time.pipe'
import { WySliderModule } from '../wy-slider/wy-slider.module'
import { WyPlayerComponent } from './wy-player.component'

const COMPONENTS: Array<Type<any>> = [WyPlayerComponent]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, WySliderModule],
  declarations: [...COMPONENTS, FormatTimePipe],
  exports: [...COMPONENTS],
})
export class WyPlayerModule {}
