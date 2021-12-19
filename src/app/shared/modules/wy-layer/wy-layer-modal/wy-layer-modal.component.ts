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
} from '@angular/core'
import { select, Store } from '@ngrx/store'
import { NgxStoreModule } from '@store/index'
import { getMember, getModalType, getModalVisible } from '@store/selectors/member.selectors'
import { ModalTypes } from '@store/reducers/member.reducer'
import { OverlayReference } from '@angular/cdk/overlay/overlay-reference'
import { BatchActionsService } from '@store/batch-actions.service'
import { DOCUMENT, isPlatformBrowser } from '@angular/common'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'

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
export class WyLayerModalComponent implements OnInit, AfterViewInit {
  ModalTypes = ModalTypes

  showModal = EShowModalState.Hide
  modalType?: ModalTypes
  modalVisible?: boolean
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
    private store$: Store<NgxStoreModule>,
    private overlay: Overlay,
    private overlayKeyboardDispatcher: OverlayKeyboardDispatcher,
    private elementRef: ElementRef,
    private batchActionsServ: BatchActionsService,
    private rd: Renderer2,
    private overlayContainer: OverlayContainer
  ) {}

  ngAfterViewInit(): void {
    this.overlayContainerEl = this.overlayContainer.getContainerElement()
    this.listenResizeToCenter()
  }

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.plateformId)
    this.scrollStrategy = this.overlay.scrollStrategies.block()
    const appStore$ = this.store$.pipe(select(getMember))
    appStore$.pipe(select(getModalType)).subscribe((type) => {
      this.watchModalType(type)
    })
    appStore$.pipe(select(getModalVisible)).subscribe((visible) => {
      this.watchModalVisible(visible)
    })
    this.createOverlay()
  }

  watchModalType(type: ModalTypes) {
    this.modalType = type
    this.cdr.markForCheck()
  }

  watchModalVisible(visible: boolean) {
    if (this.modalVisible !== visible) {
      this.modalVisible = visible

      if (visible) {
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
