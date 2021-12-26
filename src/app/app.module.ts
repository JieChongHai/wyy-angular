import { APP_INITIALIZER, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { NZ_I18N } from 'ng-zorro-antd/i18n'
import { zh_CN } from 'ng-zorro-antd/i18n'
import { registerLocaleData } from '@angular/common'
import zh from '@angular/common/locales/zh'
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CoreModule } from './core/core.module'
import { RoutesModule } from './routes/routes.module'
import { SharedModule } from './shared'
import { ServicesModule } from './services/services.module'
import { NgxStoreModule } from './store'

registerLocaleData(zh)

// #region Startup Service
import { Observable } from 'rxjs'
import { StartupService } from '@core'
export function StartupServiceFactory(startupService: StartupService): () => Observable<void> {
  return () => startupService.load()
}
const APPINIT_PROVIDES = [
  StartupService,
  {
    provide: APP_INITIALIZER,
    useFactory: StartupServiceFactory,
    deps: [StartupService],
    multi: true,
  },
]
// #endregion

// #region Http Interceptors
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { DefaultInterceptor } from '@core'

const INTERCEPTOR_PROVIDES = [{ provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true }]
// #endregion

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,

    SharedModule,
    CoreModule,
    RoutesModule,
    ServicesModule,
    NgxStoreModule,
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_CN }, APPINIT_PROVIDES, INTERCEPTOR_PROVIDES],
  bootstrap: [AppComponent],
})
export class AppModule {}
