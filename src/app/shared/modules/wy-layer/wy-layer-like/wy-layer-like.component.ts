import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { SongSheet } from '@shared/interfaces/common'
import { ICreateSheet, LikeSongParams } from '@shared/interfaces/member'
import { NgChanges } from '@shared/interfaces/utils'

@Component({
  selector: 'app-wy-layer-like',
  templateUrl: './wy-layer-like.component.html',
  styleUrls: ['./wy-layer-like.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyLayerLikeComponent {
  /** 用户歌单 */
  @Input() sheets: SongSheet[] = []
  /** 要收藏的歌曲Id */
  @Input() likeId: string = ''
  /** 弹框内容的显隐状态 */
  @Input() visible: boolean = false
  /** 收藏歌曲 */
  @Output() likeSong = new EventEmitter<LikeSongParams>()
  /** 创建歌单 */
  @Output() createSheet = new EventEmitter<ICreateSheet>()
  // 是否是先创建歌单再收藏歌曲
  creating = false
  validateForm: UntypedFormGroup = this.fb.group({})

  constructor(private fb: UntypedFormBuilder) {
    this.initForm()
  }

  ngOnChanges(changes: NgChanges<WyLayerLikeComponent>): void {
    if (changes.visible) {
      if (!this.visible) {
        this.validateForm.reset();
        this.creating = false;
      }
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      sheetName: ['', [Validators.required]],
    })
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.createSheet.emit(this.validateForm.value)
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty()
          control.updateValueAndValidity({ onlySelf: true })
        }
      })
    }
  }

  onLike(pid: string) {
    this.likeSong.emit({ pid, tracks: this.likeId })
  }
}
