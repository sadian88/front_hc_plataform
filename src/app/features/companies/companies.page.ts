import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TableModule } from 'primeng/table';
import {
  CompanyService,
  Company
} from '../../core/services/company.service';

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TableModule],
  templateUrl: './companies.page.html',
  styleUrl: './companies.page.scss'
})
export class CompaniesPageComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);

  readonly companies = this.companyService.companies;
  readonly loading = this.companyService.loading;
  readonly statusMessage = signal('Consulta y administra perfiles empresariales.');

  readonly rowData = computed(() => this.companies());

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.companyService.loadAll().subscribe({
      error: () => this.statusMessage.set('No fue posible cargar las compañías.'),
      next: () => this.statusMessage.set('Compañías actualizadas.')
    });
  }

  startCreate(): void {
    this.router.navigate(['/app/companies/new']);
  }

  startEdit(company: Company): void {
    this.router.navigate(['/app/companies', company.id, 'edit']);
  }

  deleteCompany(company: Company): void {
    this.companyService.remove(company.id).subscribe({
      next: () => {
        this.statusMessage.set('Registro eliminado.');
      },
      error: () => this.statusMessage.set('No se pudo eliminar el registro.')
    });
  }

  viewUserInteractions(company: Company): void {
    this.router.navigate(['/app/user-interactions'], {
      queryParams: { sourceScraping: company.id }
    });
  }

  viewCompanyProspectos(company: Company): void {
    this.router.navigate(['/app/company-prospectos'], {
      queryParams: { sourceScraping: company.id }
    });
  }

  resetForm(): void {
    this.router.navigate(['/app/companies']);
  }
}
