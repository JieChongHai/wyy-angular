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
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { NgChanges } from '@shared/interfaces/utils'
import { ModalTypes } from '@store/reducers/member.reducer'
import { NzMessageService } from 'ng-zorro-antd/message'
import { interval, Subject } from 'rxjs'
import { take, takeWhile } from 'rxjs/operators'
import { MemberService } from 'src/app/services/member.service'

const COUNT_DOWN_TIME = 10

enum ExistTxt {
  '存在' = 1,
  '不存在' = -1,
}
@Component({
  selector: 'app-wy-layer-register',
  templateUrl: './wy-layer-register.component.html',
  styleUrls: ['./wy-layer-register.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyLayerRegisterComponent implements OnChanges {
  ModalTypes = ModalTypes
  validateForm!: UntypedFormGroup
  // 是否展示验证码页面
  showOtp = false
  // 倒计时
  countDown = COUNT_DOWN_TIME
  // 验证码是否正确
  codeValid?: Boolean
  /** 弹框内容的显隐状态 */
  @Input() visible: boolean = false
  /** 切换操作 */
  @Output() changeModalType = new EventEmitter<ModalTypes>()
  /** 用户注册 */
  @Output() register = new EventEmitter<string>()

  get phoneCtrl(): UntypedFormControl {
    return this.validateForm.get('phone') as UntypedFormControl
  }

  constructor(
    private fb: UntypedFormBuilder,
    private memberServ: MemberService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm()
  }

  ngOnChanges(changes: NgChanges<WyLayerRegisterComponent>): void {
    if (changes.visible && !this.visible) {
      this.showOtp = false
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  }

  changeType(type = ModalTypes.Default) {
    this.changeModalType.emit(ModalTypes.Default)
    this.showOtp = false
    this.validateForm.reset()
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log(this.validateForm.value)
      this.sendCode()
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty()
          control.updateValueAndValidity({ onlySelf: true })
        }
      })
    }
  }

  // 给手机发送验证码
  sendCode() {
    // this.memberServ.sendCode(this.phoneCtrl.value).subscribe(
    //   () => {
    //     this.showOtp = true
    //     this.countDown = COUNT_DOWN_TIME
    //     this.cdr.markForCheck()
    //     interval(1000)
    //       .pipe(
    //         take(COUNT_DOWN_TIME),
    //         // 关闭弹窗后不再计时
    //         takeWhile(() => this.visible)
    //       )
    //       .subscribe(() => {
    //         this.countDown--
    //         console.log(this.countDown)
    //         this.cdr.markForCheck()
    //       })
    //   },
    //   (error) => this.message.error(error.message)
    // )
    this.showOtp = true
    this.countDown = COUNT_DOWN_TIME
    this.cdr.markForCheck()
    interval(1000)
      .pipe(
        take(COUNT_DOWN_TIME),
        // 关闭弹窗后不再计时
        takeWhile(() => this.visible)
      )
      .subscribe(() => {
        this.countDown--
        console.log(this.countDown)
        this.cdr.markForCheck()
      })
  }

  // 校验用户输入的验证码是否正确
  onCheckCode(code: string) {
    // this.memberServ.checkCode(this.phoneCtrl.value, Number(code)).subscribe(
    //   () => (this.codeValid = true),
    //   () => (this.codeValid = false),
    //   () => this.cdr.markForCheck()
    // )
    this.codeValid = code === '1234'
    this.cdr.markForCheck()
  }

  // 校验用户是否已注册
  onCheckExist() {
    // this.memberServ.checkExist(Number(this.phoneCtrl.value)).subscribe((res) => {
    //   if (ExistTxt[res] === '存在') {
    //     this.message.error('账号已注册，可直接登录')
    //     this.changeType(ModalTypes.LoginByPhone)
    //   } else {
    //     this.register.emit(this.phoneCtrl.value)
    //   }
    // })
    this.register.emit(this.phoneCtrl.value)
  }
}
