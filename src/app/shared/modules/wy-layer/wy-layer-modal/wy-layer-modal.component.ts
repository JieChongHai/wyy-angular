import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { DomPortal } from '@angular/cdk/portal'
import { Component, OnInit, ChangeDetectionStrategy, ElementRef } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { NgxStoreModule } from '@store/index'
import { getMember, getModalType, getModalVisible } from '@store/selectors/member.selectors'

@Component({
  selector: 'app-wy-layer-modal',
  templateUrl: './wy-layer-modal.component.html',
  styleUrls: ['./wy-layer-modal.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyLayerModalComponent implements OnInit {
  private overlayRef?: DomPortal
  constructor(private store$: Store<NgxStoreModule>, private overlay: Overlay, private elementRef: ElementRef) {}

  ngOnInit(): void {
    const appStore$ = this.store$.pipe(select(getMember))
    appStore$.pipe(select(getModalType)).subscribe((type) => {
      console.log(type)
    })
    appStore$.pipe(select(getModalVisible)).subscribe((visible) => {
      console.log(visible)
    })
    this.createOverlay()
  }

  createOverlay() {
    // this.overlayRef = this.overlay.create()
    // this.overlayRef.overlayElement.appendChild(this.elementRef.nativeElement)
    // this.overlayRef.keydownEvents().subscribe((e: KeyboardEvent) => {
    //   if (e.keyCode === ESCAPE) {
    //     this.hide();
    //   }
    // })
    // this.overlayRef = new DomPortal(this.elementRef);
  }

  hide(): void {}
}
