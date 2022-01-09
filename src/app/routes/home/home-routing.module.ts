import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomeResolverService } from './home-resolver.service'
import { HomeComponent } from './home.component'

const routes: Routes = [
  {
    path: '',
    data: { title: '发现' },
    component: HomeComponent,
    resolve: {
      data: HomeResolverService,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
