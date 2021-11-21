import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

@Injectable()
export class WySearchDataService {
  private jump$ = new Subject()

  get handleJump$() {
    return this.jump$.asObservable()
  }

  constructor() {}

  jump() {
    this.jump$.next()
  }
}
