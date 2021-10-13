import { NgModule, Type } from '@angular/core';
import { WyPlayerComponent } from './wy-player.component';

const COMPONENTS: Array<Type<any>> = [WyPlayerComponent];

@NgModule({
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class WyPlayerModule {}
