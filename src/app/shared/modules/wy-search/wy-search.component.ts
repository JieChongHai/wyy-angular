import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  ElementRef,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core'
import { SearchResult } from '@shared/interfaces/common'
import { isEmptyObject } from '@shared/untils'
import { fromEvent } from 'rxjs'
import { debounceTime, distinctUntilChanged, pluck } from 'rxjs/operators'
import { WySearchDataService } from './wy-search-data.service'
import { WySearchPanelComponent } from './wy-search-panel/wy-search-panel.component'

@Component({
  selector: 'app-wy-search',
  templateUrl: './wy-search.component.html',
  styleUrls: ['./wy-search.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WySearchComponent implements OnInit, OnChanges, AfterViewInit {
  // 外部自定义的search template
  @Input() customView?: TemplateRef<any>
  @Input() connectedRef?: ElementRef

  @Input() searchData?: SearchResult
  @Output() keywordChange = new EventEmitter<string>()

  @ViewChild('search', { static: false }) private defaultRef?: ElementRef
  @ViewChild('nzInput', { static: false }) private inputRef?: ElementRef

  private overlayRef?: OverlayRef

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private dataServ: WySearchDataService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { searchData } = changes
    if (searchData && !searchData.firstChange) {
      !isEmptyObject(searchData.currentValue) ? this.showPanel() : this.hidePanel()
    }
  }

  ngOnInit(): void {
    this.dataServ.handleJump$.subscribe(() => {
      this.hidePanel()
    })
  }

  ngAfterViewInit(): void {
    fromEvent(this.inputRef?.nativeElement, 'input')
      .pipe(debounceTime(300), distinctUntilChanged(), pluck('target', 'value'))
      .subscribe((value) => {
        this.keywordChange.emit(value as string)
      })
  }

  onFocus(): void {
    if (this.searchData && !isEmptyObject(this.searchData)) {
      this.showPanel();
    }
  }

  private showPanel() {
    this.hidePanel()
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.connectedRef || this.defaultRef!)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
      ])
      .withLockedPosition(true)
    const scrollStrategy = this.overlay.scrollStrategies.reposition()
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      scrollStrategy,
    })

    const panelPortal = new ComponentPortal(WySearchPanelComponent)
    const panelRef = this.overlayRef.attach(panelPortal)
    panelRef.instance.searchData = this.searchData
    this.overlayRef.backdropClick().subscribe(() => {
      this.hidePanel()
    })
  }

  private hidePanel() {
    if (this.overlayRef?.hasAttached) {
      this.overlayRef.dispose()
    }
  }
}
