import { CommonModule } from '@angular/common'
import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { SingleSheetComponent } from './components/single-sheet/single-sheet.component'
import { WyPlayerModule } from './modules/wy-player/wy-player.module'
import { WySearchModule } from './modules/wy-search/wy-search.module'
import { PlayCountPipe } from './pipes/play-count.pipe'

import { SHARED_ZORRO_MODULES } from './shared-zorro.module'

// #region third libs
// import { NgxTinymceModule } from 'ngx-tinymce';
// import { UEditorModule } from 'ngx-ueditor';
const THIRD_MODULES: Array<Type<any>> = [WyPlayerModule, WySearchModule]
// #endregion

// #region your componets & directives & pipes
const COMPONENTS: Array<Type<any>> = [SingleSheetComponent]
const DIRECTIVES: Array<Type<any>> = []
const PIPES: Array<Type<any>> = [PlayCountPipe]
// #endregion

const COMMON_MODULES = [CommonModule, RouterModule, FormsModule, ReactiveFormsModule]

@NgModule({
  imports: [...COMMON_MODULES, ...SHARED_ZORRO_MODULES, ...THIRD_MODULES],
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  exports: [...COMMON_MODULES, ...SHARED_ZORRO_MODULES, ...THIRD_MODULES, ...COMPONENTS, ...DIRECTIVES, ...PIPES],
})
export class SharedModule {}
