import { NgModule } from '@angular/core'
import { StoreModule } from '@ngrx/store'
import { extModules } from './store-devtools';
import { playerReducer } from './reducers/player.reducer';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({ player: playerReducer }, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
      }
    }),
    // Instrumentation must be imported after importing StoreModule (config is optional)
    extModules,
  ],
})
export class NgxStoreModule {}
