import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'formatTime',
})
export class FormatTimePipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
      return `00:00`
    }
    const time = Math.trunc(value)
    const minute = String(Math.trunc(time / 60)).padStart(2, '0')
    const second = String(time % 60).padStart(2, '0')
    return `${minute}:${second}`
  }
}
