import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { SongInfoResolverService } from './song-info-resolver.service'
import { SongInfoComponent } from './song-info.component'

const routes: Routes = [
  {
    path: '',
    component: SongInfoComponent,
    data: { title: '歌曲详情' },
    resolve: { songInfo: SongInfoResolverService },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SongInfoRoutingModule {}
