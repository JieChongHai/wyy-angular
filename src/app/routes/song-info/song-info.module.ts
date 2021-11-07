import { NgModule } from '@angular/core'

import { SongInfoRoutingModule } from './song-info-routing.module'
import { SharedModule } from '@shared'
import { SongInfoComponent } from './song-info.component'
import { SongInfoResolverService } from './song-info-resolver.service'

@NgModule({
  declarations: [SongInfoComponent],
  imports: [SharedModule, SongInfoRoutingModule],
  providers: [SongInfoResolverService],
})
export class SongInfoModule {}
