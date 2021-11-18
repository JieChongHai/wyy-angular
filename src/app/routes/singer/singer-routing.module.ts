import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { SingerDetailResolverService } from './singer-detail-resolver.service'
import { SingerDetailComponent } from './singer-detail/singer-detail.component'

const routes: Routes = [
  {
    path: '',
    component: SingerDetailComponent,
    data: { title: '歌手详情' },
    resolve: { singerDetail: SingerDetailResolverService },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SingerRoutingModule {}
