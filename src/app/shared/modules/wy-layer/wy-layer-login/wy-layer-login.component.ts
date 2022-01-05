import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input, OnChanges, OnInit, ChangeDetectorRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LoginParams } from '@shared/interfaces/member'
import { NgChanges } from '@shared/interfaces/utils'
import { ModalTypes } from '@store/reducers/member.reducer'
import { StorageCacheService } from 'src/app/services/storage-cache.service'
import { codeJson } from 'src/app/shared/untils/base64'

@Component({
  selector: 'app-wy-layer-login',
  templateUrl: './wy-layer-login.component.html',
  styleUrls: ['./wy-layer-login.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyLayerLoginComponent implements OnChanges {
  ModalTypes = ModalTypes
  validateForm!: FormGroup
  /** 弹框内容的显隐状态 */
  @Input() visible: boolean = false
  /** 初始化表单需要的参数 */
  @Input() wyRememberLogin?: LoginParams
  /** 切换操作 */
  @Output() changeModalType = new EventEmitter<ModalTypes>()
  /** 登录操作 */
  @Output() login = new EventEmitter<LoginParams>()

  submitForm(): void {
    if (this.validateForm.valid) {
      this.login.emit(this.validateForm.value)
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty()
          control.updateValueAndValidity({ onlySelf: true })
        }
      })
    }
  }

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.initForm()
  }

  ngOnChanges(changes: NgChanges<WyLayerLoginComponent>): void {
    const { wyRememberLogin, visible } = changes
    if (wyRememberLogin) {
      const data = codeJson(this.wyRememberLogin || {}, 'decode')
      const { phone = '', password = '', remember = false } = data
      if (wyRememberLogin.currentValue) {
        this.validateForm.patchValue({ phone, password, remember })
      }
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      phone: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: [false],
    })
  }
}
