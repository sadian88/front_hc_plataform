import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Table, TableModule } from 'primeng/table';
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

  @ViewChild('dt') dt: Table | undefined;

  readonly companies = this.companyService.companies;
  readonly loading = this.companyService.loading;
  readonly statusMessage = signal('Consulta y administra perfiles empresariales.');

  readonly rowData = computed(() => this.companies());

  ngOnInit(): void {
    this.refresh();
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(value, 'contains');
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

  viewAnalisisLeadsIcp(company: Company): void {
    this.router.navigate(['/app/analisis-leads-icp'], {
      queryParams: { sourceScraping: company.id }
    });
  }

  startScraping(company: Company): void {
    const label = company.company_name || `ID ${company.id}`;
    this.statusMessage.set(`Iniciando scraping para ${label}...`);
    this.companyService
      .startScraping(company.id)
      .subscribe({
        next: () => this.statusMessage.set(`Scraping iniciado para ${label}.`),
        error: () => this.statusMessage.set(`No se pudo iniciar el scraping para ${label}.`)
      });
  }

  resetForm(): void {
    this.router.navigate(['/app/companies']);
  }
}
