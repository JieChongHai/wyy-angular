import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'

type FormControlStatus = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'

@Component({
  selector: 'app-wy-check-code',
  templateUrl: './wy-check-code.component.html',
  styleUrls: ['./wy-check-code.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyCheckCodeComponent implements OnInit, OnChanges {
  private _phone = ''

  validateForm!: UntypedFormGroup
  showRepeatBtn = false
  showErrorTip = false
  /** 验证码是否正确 */
  @Input() codeValid?: Boolean
  /** 倒计时时间 */
  @Input() time!: number
  /** 用户手机号 */
  @Input()
  set phone(phone: string) {
    if (phone) {
      const arr = phone.split('')
      arr.splice(3, 4, '****')
      this._phone = arr.join('')
    }
  }

  get phone() {
    return this._phone
  }
  /** 校验验证码 */
  @Output() checkCode = new EventEmitter<string>()
  /** 重新发送验证码 */
  @Output() reSendCode = new EventEmitter<void>()
  /** 校验手机号是否已注册*/
  @Output() checkExist = new EventEmitter<void>()

  get codeCtrl(): UntypedFormControl {
    return this.validateForm.get('code') as UntypedFormControl
  }

  constructor(private fb: UntypedFormBuilder) {
    this.initForm()
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { time, codeValid } = changes
    if (time) {
      this.showRepeatBtn = this.time <= 0
    }

    if (codeValid && !codeValid.firstChange) {
      this.showErrorTip = !this.codeValid
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/\d{4}/)]],
    })
  }

  ngOnInit(): void {
    this.codeCtrl.statusChanges.subscribe((status: FormControlStatus) => {
      if (status === 'VALID') {
        this.checkCode.emit(this.codeCtrl.value)
      }
    })
  }

  submitForm(): void {
    if (this.validateForm.valid && this.codeValid) {
      this.checkExist.emit()
    }
  }
}
