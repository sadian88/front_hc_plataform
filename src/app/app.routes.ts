import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPageComponent)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shell/auth-shell.component').then((m) => m.AuthShellComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPageComponent)
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/companies/companies.page').then((m) => m.CompaniesPageComponent)
      },
      {
        path: 'leads',
        loadComponent: () =>
          import('./features/leads/leads.page').then((m) => m.LeadsPageComponent)
      },
      {
        path: 'search-results',
        loadComponent: () =>
          import('./features/search-results/search-results.page').then(
            (m) => m.SearchResultsPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
