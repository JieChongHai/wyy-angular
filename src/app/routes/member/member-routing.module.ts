import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CenterComponent } from './center/center.component'
import { memberResolverService } from './member-resolver.service'
import { RecordDetailComponent } from './record-detail/record-detail.component'
import { RecordResolverService } from './record-resolve.service'

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CenterComponent,
        data: { title: '个人中心' },
        resolve: { data: memberResolverService },
      },
      {
        path: 'records',
        component: RecordDetailComponent,
        data: { title: '听歌记录' },
        resolve: { data: RecordResolverService },
      },
      // { path: '', redirectTo: '/:id', pathMatch: 'full' },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberRoutingModule {}
