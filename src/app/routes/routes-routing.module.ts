import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { environment } from '@env/environment'

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'sheet',
    loadChildren: () => import('./sheet-list/sheet-list.module').then((m) => m.SheetListModule),
  },
  {
    path: 'sheetInfo/:id',
    loadChildren: () => import('./sheet-info/sheet-info.module').then((m) => m.SheetInfoModule),
  },
  {
    path: 'songInfo/:id',
    loadChildren: () => import('./song-info/song-info.module').then((m) => m.SongInfoModule),
  },
  {
    path: 'member/:id',
    loadChildren: () => import('./member/member.module').then((m) => m.MemberModule),
  },
  {
    path: 'singer/:id',
    loadChildren: () => import('./singer/singer.module').then((m) => m.SingerModule),
  },
  { path: '**', redirectTo: '/home' },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class RouteRoutingModule {}
