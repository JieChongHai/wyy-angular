import { Observable } from 'rxjs';

export interface WySliderStyle {
  width?: string;
  height?: string;
  left?: string;
  bottom?: string;
}

export interface SliderEventObserverConfig {
  start: 'mousedown' | 'touchstart'; // 点击事件
  move: 'mousemove' | 'touchmove'; // 移动事件
  end: 'mouseup' | 'touchend'; // 释放事件
  filterEvent: (e: any) => boolean; // 过滤出鼠标事件
  pluckKey: string[];
  startPlucked$?: Observable<number>;
  moveResolved$?: Observable<number>;
  end$?: Observable<Event>;
}

/**
 * 去除默认事件/停止冒泡事件
 * @param e Event
 */
export function sliderEvent(e: Event) {
  e.stopPropagation();
  e.preventDefault();
}

export function getElementOffset(el: HTMLElement): {
  top: number;
  left: number;
} {
  if (!el.getClientRects().length) {
    return {
      top: 0,
      left: 0,
    };
  }

  const rect = el.getBoundingClientRect();
  const win = el.ownerDocument.defaultView;

  return {
    top: rect.top + (win ? win.pageYOffset : 0),
    left: rect.left + (win ? win.pageXOffset : 0),
  };
}
