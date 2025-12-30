import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStateService } from '../../core/state/auth-state.service';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.scss'
})
export class AuthShellComponent {
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly navItems = [
    { icon: 'layout-dashboard', label: 'Dashboard', path: '/app/dashboard' },
    { icon: 'shield-check', label: 'Compañias', path: '/app/companies' },
    { icon: 'users', label: 'User Interactions', path: '/app/user-interactions' },
    { icon: 'activity', label: 'Lead Prospecto', path: '/app/lead-prospecto' },
    { icon: 'search', label: 'Company_Prospectos', path: '/app/company-prospectos' }
  ];

  readonly user = computed(() => this.authState.session()?.user);
  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((state) => !state);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authState.clearSession();
    this.router.navigateByUrl('/login');
  }
}
