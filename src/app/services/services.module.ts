import { InjectionToken, NgModule } from '@angular/core';
import { environment } from '@env/environment';

export const API_CONFIG = new InjectionToken('ApiConfigToken');

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    { provide: API_CONFIG, useValue: environment.production ? '' : '/api' },
  ]
})
export class ServicesModule { }
