import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NgChanges } from '@shared/interfaces/utils'
import { ModalTypes } from '@store/reducers/member.reducer'
import { NzMessageService } from 'ng-zorro-antd/message'
import { MemberService } from 'src/app/services/member.service'

@Component({
  selector: 'app-wy-layer-register',
  templateUrl: './wy-layer-register.component.html',
  styleUrls: ['./wy-layer-register.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyLayerRegisterComponent implements OnChanges {
  ModalTypes = ModalTypes
  validateForm!: FormGroup
  showOtp = false;
  /** 弹框内容的显隐状态 */
  @Input() visible: boolean = false
  /** 切换操作 */
  @Output() changeModalType = new EventEmitter<ModalTypes>()
  @Output() register = new EventEmitter<string>();

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log(this.validateForm.value)
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty()
          control.updateValueAndValidity({ onlySelf: true })
        }
      })
    }
  }

  constructor(
    private fb: FormBuilder,
    private memberServ: MemberService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm()
  }

  ngOnChanges(changes: NgChanges<WyLayerRegisterComponent>): void {}

  initForm(): void {
    this.validateForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  }

  changeType() {
    this.changeModalType.emit(ModalTypes.Default)
    this.showOtp = false
    this.validateForm.reset()
  }
}
