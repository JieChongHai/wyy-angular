import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ShareParams } from '@shared/interfaces/member'
import { NgChanges } from '@shared/interfaces/utils'
import { ShareInfo } from '@store/reducers/member.reducer'

@Component({
  selector: 'app-wy-layer-share',
  templateUrl: './wy-layer-share.component.html',
  styleUrls: ['./wy-layer-share.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyLayerShareComponent implements OnInit {
  @Input() shareInfo!: ShareInfo
  /** 弹框内容的显隐状态 */
  @Input() visible: boolean = false
  /** 取消操作 */
  @Output() cancel = new EventEmitter<void>()
  /** 分享 */
  @Output() share = new EventEmitter<ShareParams>()

  validateForm: FormGroup = this.fb.group({})

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: NgChanges<WyLayerShareComponent>): void {
    if (changes.visible) {
      if (!this.visible) {
        this.validateForm.reset()
      }
    }
  }

  ngOnInit(): void {
    this.initForm()
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      msg: [null, [Validators.maxLength(140)]],
    })
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.share.emit({
        id: this.shareInfo.id,
        msg: this.validateForm.get('msg')!.value,
        type: this.shareInfo.type,
      })
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty()
          control.updateValueAndValidity({ onlySelf: true })
        }
      })
    }
  }
}
