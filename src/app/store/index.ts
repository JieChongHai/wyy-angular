import { NgModule } from '@angular/core'
import { StoreModule } from '@ngrx/store'
import { extModules } from './store-devtools';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({}, {}),
    // Instrumentation must be imported after importing StoreModule (config is optional)
    extModules,
  ],
})
export class NgxStoreModule {}
