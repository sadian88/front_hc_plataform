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
        path: 'companies/new',
        loadComponent: () =>
          import('./features/companies/company-editor.page').then(
            (m) => m.CompanyEditorPageComponent
          )
      },
      {
        path: 'companies/:id/edit',
        loadComponent: () =>
          import('./features/companies/company-editor.page').then(
            (m) => m.CompanyEditorPageComponent
          )
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/companies/companies.page').then((m) => m.CompaniesPageComponent)
      },
      {
        path: 'user-interactions/:id/edit',
        loadComponent: () =>
          import('./features/leads/lead-editor.page').then((m) => m.LeadEditorPageComponent)
      },
      {
        path: 'user-interactions',
        loadComponent: () =>
          import('./features/leads/leads.page').then((m) => m.LeadsPageComponent)
      },
      {
        path: 'lead-prospecto/:id/edit',
        loadComponent: () =>
          import('./features/prospects/prospect-editor.page').then(
            (m) => m.ProspectEditorPageComponent
          )
      },
      {
        path: 'lead-prospecto',
        loadComponent: () =>
          import('./features/prospects/prospects.page').then((m) => m.ProspectsPageComponent)
      },
      {
        path: 'company-prospectos/:companyId/:linkKey/edit',
        loadComponent: () =>
          import('./features/search-results/search-result-editor.page').then(
            (m) => m.SearchResultEditorPageComponent
          )
      },
      {
        path: 'company-prospectos',
        loadComponent: () =>
          import('./features/search-results/search-results.page').then(
            (m) => m.SearchResultsPageComponent
          )
      },
      {
        path: 'analisis-leads-icp',
        loadComponent: () =>
          import('./features/analisis-leads-icp/analisis-leads-icp.page').then(
            (m) => m.AnalisisLeadsIcpPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
