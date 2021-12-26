import { CommonModule } from '@angular/common'
import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { WyLayerModalComponent } from './wy-layer-modal/wy-layer-modal.component'
import { WyLayerDefaultComponent } from './wy-layer-default/wy-layer-default.component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { WyLayerLoginComponent } from './wy-layer-login/wy-layer-login.component'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzListModule } from 'ng-zorro-antd/list';

const COMPONENTS: Array<Type<any>> = [WyLayerModalComponent, WyLayerDefaultComponent, WyLayerLoginComponent]

const NZ_MODULES = [
  NzButtonModule,
  NzInputModule,
  NzCheckboxModule,
  NzSpinModule,
  NzFormModule,
  NzAlertModule,
  NzListModule
]
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    ...NZ_MODULES
  ],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class WyLayerModule {}
