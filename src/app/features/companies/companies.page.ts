import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { TableModule } from 'primeng/table';
import {
  CompanyService,
  Company,
  CompanyPayload
} from '../../core/services/company.service';

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TableModule],
  templateUrl: './companies.page.html',
  styleUrl: './companies.page.scss'
})
export class CompaniesPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);

  readonly companies = this.companyService.companies;
  readonly loading = this.companyService.loading;
  readonly editingId = signal<number | null>(null);
  readonly statusMessage = signal('Consulta y administra perfiles empresariales.');
  readonly showForm = signal(false);

  readonly form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required]],
    companyUrlProfile: ['', [Validators.required]],
    companySegment: [''],
    customerUrlProfile: [''],
    companyIcp: [''],
    creationDate: ['']
  });

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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CompanyPayload = { ...this.form.getRawValue() };
    this.statusMessage.set('Guardando información...');

    const action$ = this.editingId()
      ? this.companyService.update(this.editingId()!, payload)
      : this.companyService.create(payload);

    action$.pipe(finalize(() => this.form.enable())).subscribe({
      next: () => {
        this.statusMessage.set('Registro guardado correctamente.');
        this.resetForm();
      },
      error: () => this.statusMessage.set('No se pudo guardar la compañía.')
    });
  }

  startCreate(): void {
    this.resetForm();
    this.showForm.set(true);
  }

  startEdit(company: Company): void {
    this.editingId.set(company.id);
    this.form.patchValue({
      companyName: company.company_name,
      companyUrlProfile: company.company_url_profile,
      companySegment: company.company_segment || '',
      customerUrlProfile: company.customer_url_profile || '',
      companyIcp: company.company_icp || '',
      creationDate: company.creation_date ? company.creation_date.slice(0, 10) : ''
    });
    this.showForm.set(true);
  }

  deleteCompany(company: Company): void {
    this.companyService.remove(company.id).subscribe({
      next: () => {
        this.statusMessage.set('Registro eliminado.');
        if (this.editingId() === company.id) {
          this.resetForm();
        }
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
    this.editingId.set(null);
    this.showForm.set(false);
    this.form.reset({
      companyName: '',
      companyUrlProfile: '',
      companySegment: '',
      customerUrlProfile: '',
      creationDate: ''
    });
  }

  get submitLabel(): string {
    return this.editingId() ? 'Actualizar' : 'Crear';
  }
}
