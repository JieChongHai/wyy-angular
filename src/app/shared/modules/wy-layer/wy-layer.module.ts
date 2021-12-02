import { CommonModule } from '@angular/common'
import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { WyLayerModalComponent } from './wy-layer-modal/wy-layer-modal.component'
import { WyLayerDefaultComponent } from './wy-layer-default/wy-layer-default.component'
import { NzButtonModule } from 'ng-zorro-antd/button'

const COMPONENTS: Array<Type<any>> = [WyLayerModalComponent, WyLayerDefaultComponent]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NzButtonModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class WyLayerModule {}
