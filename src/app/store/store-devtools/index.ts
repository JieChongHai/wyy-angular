import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const extModules = [
  StoreDevtoolsModule.instrument({ 
    maxAge: 25, // Retains last 25 states
    autoPause: true, // Pauses recording actions and state changes when the extension window is not open
   }),
];