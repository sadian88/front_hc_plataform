import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CompanyFormComponent } from './company-form/company-form.component';
import {
  Company,
  CompanyPayload,
  CompanyService
} from '../../core/services/company.service';

@Component({
  selector: 'app-company-editor-page',
  standalone: true,
  imports: [CommonModule, CompanyFormComponent],
  templateUrl: './company-editor.page.html',
  styleUrl: './company-editor.page.scss'
})
export class CompanyEditorPageComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly statusMessage = signal('Completa la informacion de la compania.');
  readonly editId = signal<number | null>(null);
  readonly company = signal<Company | null>(null);
  readonly submitLabel = computed(() => (this.editId() ? 'Actualizar' : 'Crear'));

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.editId.set(null);
      this.company.set(null);
      return;
    }

    const parsed = Number(idParam);
    if (Number.isNaN(parsed)) {
      this.statusMessage.set('ID de compania invalido.');
      return;
    }

    this.editId.set(parsed);
    this.loadCompany(parsed);
  }

  handleSave(payload: CompanyPayload): void {
    this.loading.set(true);
    this.statusMessage.set('Guardando informacion...');

    const action$ = this.editId()
      ? this.companyService.update(this.editId()!, payload)
      : this.companyService.create(payload);

    action$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.statusMessage.set('Registro guardado correctamente.');
        this.router.navigate(['/app/companies']);
      },
      error: () => this.statusMessage.set('No se pudo guardar la compania.')
    });
  }

  goBack(): void {
    this.router.navigate(['/app/companies']);
  }

  private loadCompany(id: number): void {
    this.loading.set(true);
    this.companyService
      .loadAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          const found = this.companyService.companies().find((item) => item.id === id) || null;
          if (!found) {
            this.statusMessage.set('No se encontro la compania solicitada.');
          }
          this.company.set(found);
        },
        error: () => this.statusMessage.set('No fue posible cargar la compania.')
      });
  }
}
