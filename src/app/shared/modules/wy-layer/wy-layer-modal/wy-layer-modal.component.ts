import {
  BlockScrollStrategy,
  Overlay,
  OverlayContainer,
  OverlayKeyboardDispatcher,
  OverlayRef,
} from '@angular/cdk/overlay'
import { ESCAPE } from '@angular/cdk/keycodes'
import { DomPortal } from '@angular/cdk/portal'
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  ChangeDetectorRef,
  PLATFORM_ID,
  Inject,
  AfterViewInit,
  Renderer2,
  ViewChild,
  Input,
  OnChanges,
} from '@angular/core'
import { ModalTypes } from '@store/reducers/member.reducer'
import { OverlayReference } from '@angular/cdk/overlay/overlay-reference'
import { BatchActionsService } from '@store/batch-actions.service'
import { DOCUMENT, isPlatformBrowser } from '@angular/common'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { NgChanges } from '@shared/interfaces/utils'

enum EShowModalState {
  Show = 'show',
  Hide = 'hide',
}

enum EPointerEvent {
  None = 'none',
  Auto = 'auto',
}

interface SizeType {
  w: number
  h: number
}

@UntilDestroy()
@Component({
  selector: 'app-wy-layer-modal',
  templateUrl: './wy-layer-modal.component.html',
  styleUrls: ['./wy-layer-modal.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('showHide', [
      state('show', style({ transform: 'scale(1)', opacity: 1 })),
      state('hide', style({ transform: 'scale(0)', opacity: 0 })),
      transition('show<=>hide', animate('0.1s')),
    ]),
  ],
})
export class WyLayerModalComponent implements OnInit, OnChanges, AfterViewInit {
  ModalTypes = ModalTypes
  ModalTitle = {
    [ModalTypes.Register]: '注册',
    [ModalTypes.LoginByPhone]: '手机登录',
    [ModalTypes.Share]: '分享',
    [ModalTypes.Like]: '收藏',
    [ModalTypes.Default]: '',
  }

  @Input() modalType: ModalTypes = ModalTypes.Default
  @Input() modalVisible: boolean = false
  showModal = EShowModalState.Hide
  private isBrowser?: boolean
  private overlayRef?: OverlayRef
  private scrollStrategy!: BlockScrollStrategy
  private overlayContainerEl?: HTMLElement
  private resizeHandler?: () => void

  @ViewChild('modalContainer', { static: false }) private modalRef?: ElementRef

  constructor(
    @Inject(PLATFORM_ID) private plateformId: object,
    @Inject(DOCUMENT) private doc: Document,
    private cdr: ChangeDetectorRef,
    private overlay: Overlay,
    private overlayKeyboardDispatcher: OverlayKeyboardDispatcher,
    private elementRef: ElementRef,
    private batchActionsServ: BatchActionsService,
    private rd: Renderer2,
    private overlayContainer: OverlayContainer
  ) {}

  ngOnChanges(changes: NgChanges<WyLayerModalComponent>): void {
    const { modalVisible } = changes
    if (modalVisible && !modalVisible.firstChange) {
      this.handleVisibleChange()
    }
  }

  ngAfterViewInit(): void {
    this.overlayContainerEl = this.overlayContainer.getContainerElement()
    this.listenResizeToCenter()
  }

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.plateformId)
    this.scrollStrategy = this.overlay.scrollStrategies.block()
    this.createOverlay()
  }

  createOverlay() {
    this.overlayRef = this.overlay.create()
    this.overlayRef.overlayElement.appendChild(this.elementRef.nativeElement)
    this.overlayRef
      .keydownEvents()
      .pipe(untilDestroyed(this))
      .subscribe((e: KeyboardEvent) => {
        if (e.keyCode === ESCAPE) {
          this.hide()
        }
      })
  }

  hide(): void {
    this.batchActionsServ.controlModal(false)
  }

  private handleVisibleChange(): void {
    if (this.modalVisible) {
      this.scrollStrategy.enable()
      this.showModal = EShowModalState.Show
      this.overlayKeyboardDispatcher.add(this.overlayRef as OverlayReference)

      this.listenResizeToCenter()
      this.changePointerEvents(EPointerEvent.Auto)
    } else {
      this.scrollStrategy.disable()
      this.showModal = EShowModalState.Hide
      this.overlayKeyboardDispatcher.remove(this.overlayRef as OverlayReference)

      this.resizeHandler && this.resizeHandler()
      this.changePointerEvents(EPointerEvent.None)
    }
    this.cdr.markForCheck()
  }

  // 设置弹框背景的可点击性
  private changePointerEvents(type: EPointerEvent) {
    if (this.overlayContainerEl) {
      this.overlayContainerEl.style.pointerEvents = type
    }
  }

  // 监听当前窗口宽高变化
  private listenResizeToCenter() {
    if (this.isBrowser) {
      const modalDom = this.modalRef?.nativeElement as HTMLElement
      const modalSize = {
        w: modalDom.offsetWidth,
        h: modalDom.offsetHeight,
      }
      this.keepCenter(modalDom, modalSize) // 第一次要主动触发一下
      this.resizeHandler = this.rd.listen('window', 'resize', () => this.keepCenter(modalDom, modalSize))
    }
  }

  // 设置弹框的top, left
  private keepCenter(modalDom: HTMLElement, size: SizeType) {
    const { w, h } = this.getWindowSize()
    const left = (w - size.w) / 2
    const top = (h - size.h) / 2
    modalDom.style.left = left + 'px'
    modalDom.style.top = top + 'px'
  }

  // 获取当前窗口宽高
  private getWindowSize(): SizeType {
    const { innerWidth, innerHeight } = window
    const { clientWidth, clientHeight } = this.doc.documentElement
    const { offsetWidth, offsetHeight } = this.doc.body
    return {
      w: innerWidth || clientWidth || offsetWidth,
      h: innerHeight || clientHeight || offsetHeight,
    }
  }
}
