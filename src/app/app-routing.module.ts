import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './components/pagenotfound/page-not-found.component';
import { SignatureComponent } from './components/signature/signature.component';

const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'signature', component: SignatureComponent},
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
