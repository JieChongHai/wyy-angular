import { CommonModule } from '@angular/common'
import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { WyLayerLoginComponent } from './wy-layer-login/wy-layer-login.component'
import { WyLayerDefaultComponent } from './wy-layer-default/wy-layer-default.component'
import { WyLayerModalComponent } from './wy-layer-modal/wy-layer-modal.component'
import { WyLayerLikeComponent } from './wy-layer-like/wy-layer-like.component'
import { WyLayerShareComponent } from './wy-layer-share/wy-layer-share.component'
import { WyLayerRegisterComponent } from './wy-layer-register/wy-layer-register.component'
import { WyCheckCodeComponent } from './wy-check-code/wy-check-code.component'
import { WyOtpComponent } from './wy-otp/wy-otp.component'

const COMPONENTS: Array<Type<any>> = [
  WyLayerModalComponent,
  WyLayerDefaultComponent,
  WyLayerLoginComponent,
  WyLayerLikeComponent,
  WyLayerShareComponent,
  WyLayerRegisterComponent,
  WyCheckCodeComponent,
  WyOtpComponent,
]

const NZ_MODULES = [
  NzButtonModule,
  NzInputModule,
  NzCheckboxModule,
  NzSpinModule,
  NzFormModule,
  NzAlertModule,
  NzListModule,
  NzIconModule,
]
@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule, ...NZ_MODULES],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class WyLayerModule {}
