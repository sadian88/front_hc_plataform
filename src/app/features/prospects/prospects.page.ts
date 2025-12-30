import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ProspectService,
  Prospect,
  ProspectPayload
} from '../../core/services/prospect.service';

type ProspectRow = Prospect & {
  assignedCompanyLabel: string;
  originCompanyLabel: string;
  displayEstado: string;
  displayLocation: string;
};

@Component({
  selector: 'app-prospects-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule],
  templateUrl: './prospects.page.html',
  styleUrl: './prospects.page.scss'
})
export class ProspectsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly prospectService = inject(ProspectService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('prospectsTable') prospectsTable?: Table;

  readonly prospects = this.prospectService.prospects;
  readonly loading = this.prospectService.loading;
  readonly tableRows = computed<ProspectRow[]>(() =>
    this.prospects().map((prospect) => ({
      ...prospect,
      assignedCompanyLabel: this.buildCompanyLabel(prospect.company_id, prospect.company_name),
      originCompanyLabel: this.buildCompanyLabel(
        prospect.company_origen_lead,
        prospect.origen_company_name
      ),
      displayEstado: prospect.estado?.trim() || 'Sin estado',
      displayLocation: prospect.location?.trim() || 'Ubicacion no disponible'
    }))
  );
  readonly statusMessage = signal('Consulta y gestiona Lead Prospecto sincronizados.');
  readonly searchTerm = signal('');
  readonly companyFilter = signal('');
  readonly estadoFilter = signal('');
  readonly editingId = signal<string | null>(null);
  readonly selectedIdExterno = signal('');
  readonly showForm = signal(false);
  readonly sourceScrapingFilter = signal<string | null>(null);
  readonly hasServerFilter = computed(() => !!this.sourceScrapingFilter());
  readonly companyOptions = computed(() =>
    Array.from(
      new Set(
        this.tableRows()
          .map((row) => row.assignedCompanyLabel)
          .filter((value) => Boolean(value && value.length))
      )
    ).sort((a, b) => a.localeCompare(b))
  );
  readonly estadoOptions = computed(() =>
    Array.from(
      new Set(
        this.tableRows()
          .map((row) => row.displayEstado)
          .filter((value) => Boolean(value && value.length))
      )
    ).sort((a, b) => a.localeCompare(b))
  );
  readonly hasActiveFilters = computed(
    () => !!(this.searchTerm() || this.companyFilter() || this.estadoFilter())
  );

  readonly form = this.fb.nonNullable.group({
    nombreCompleto: ['', [Validators.required]],
    email: [''],
    perfilLinkedin: [''],
    cargo: [''],
    about: [''],
    location: [''],
    estado: [''],
    fechaCreacionOrigen: [''],
    companyId: [''],
    companyOrigenLead: ['']
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const value = (params.get('sourceScraping') || '').trim();
      this.sourceScrapingFilter.set(value.length ? value : null);
      this.refresh();
    });
  }

  refresh(): void {
    const companyFilter = this.sourceScrapingFilter();
    this.prospectService
      .loadAll(companyFilter ? { sourceScraping: companyFilter } : undefined)
      .subscribe({
        next: () =>
          this.statusMessage.set(
            companyFilter
              ? `Lead Prospecto filtrados por company_id ${companyFilter}.`
              : 'Lead Prospecto actualizados.'
          ),
        error: () => this.statusMessage.set('No fue posible cargar los Lead Prospecto.')
      });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value || '';
    this.searchTerm.set(value);
    this.prospectsTable?.filterGlobal(value, 'contains');
  }

  onCompanyFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value || '';
    this.companyFilter.set(value);
    if (value) {
      this.prospectsTable?.filter(value, 'assignedCompanyLabel', 'equals');
    } else {
      this.prospectsTable?.filter(null, 'assignedCompanyLabel', 'equals');
    }
  }

  onEstadoFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value || '';
    this.estadoFilter.set(value);
    if (value) {
      this.prospectsTable?.filter(value, 'displayEstado', 'equals');
    } else {
      this.prospectsTable?.filter(null, 'displayEstado', 'equals');
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.companyFilter.set('');
    this.estadoFilter.set('');
    this.prospectsTable?.clear();
  }

  startEdit(prospect: Prospect): void {
    this.editingId.set(prospect.id);
    this.selectedIdExterno.set(prospect.id_externo);
    this.form.patchValue({
      nombreCompleto: prospect.nombre_completo || '',
      email: prospect.email || '',
      perfilLinkedin: prospect.perfil_linkedin || '',
      cargo: prospect.cargo || '',
      about: prospect.about || '',
      location: prospect.location || '',
      estado: prospect.estado || '',
      fechaCreacionOrigen: this.formatDateInput(prospect.fecha_creacion_origen),
      companyId: prospect.company_id ? String(prospect.company_id) : '',
      companyOrigenLead: prospect.company_origen_lead || ''
    });
    this.showForm.set(true);
  }

  onSubmit(): void {
    const id = this.editingId();
    if (!id) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.statusMessage.set('Guardando Lead Prospecto...');
    this.form.disable();

    this.prospectService
      .update(id, payload)
      .pipe(finalize(() => this.form.enable()))
      .subscribe({
        next: () => {
          this.statusMessage.set('Lead Prospecto actualizado correctamente.');
          this.resetForm();
        },
        error: () => this.statusMessage.set('No se pudo actualizar el Lead Prospecto.')
      });
  }

  deleteProspect(prospect: Prospect): void {
    this.prospectService.remove(prospect.id).subscribe({
      next: () => {
        this.statusMessage.set('Lead Prospecto eliminado.');
        if (this.editingId() === prospect.id) {
          this.resetForm();
        }
      },
      error: () => this.statusMessage.set('No se pudo eliminar el Lead Prospecto.')
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.selectedIdExterno.set('');
    this.showForm.set(false);
    this.form.reset({
      nombreCompleto: '',
      email: '',
      perfilLinkedin: '',
      cargo: '',
      about: '',
      location: '',
      estado: '',
      fechaCreacionOrigen: '',
      companyId: '',
      companyOrigenLead: ''
    });
  }

  clearSourceScrapingFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sourceScraping: null },
      queryParamsHandling: 'merge'
    });
  }

  private buildPayload(): ProspectPayload {
    const value = this.form.getRawValue();
    return {
      nombreCompleto: value.nombreCompleto.trim(),
      email: this.normalizeString(value.email),
      perfilLinkedin: this.normalizeString(value.perfilLinkedin),
      cargo: this.normalizeString(value.cargo),
      about: this.normalizeString(value.about),
      location: this.normalizeString(value.location),
      estado: this.normalizeString(value.estado),
      fechaCreacionOrigen: this.normalizeDateTime(value.fechaCreacionOrigen),
      companyId: this.parseNumberField(value.companyId),
      companyOrigenLead: this.normalizeString(value.companyOrigenLead)
    };
  }

  private parseNumberField(value: string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private normalizeString(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const text = value.trim();
    return text.length ? text : null;
  }

  private normalizeDateTime(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? null : date.toISOString();
  }

  private buildCompanyLabel(id?: number | string | null, name?: string | null): string {
    if (name && name.trim().length) {
      return name.trim();
    }

    if (id === null || id === undefined) {
      return '';
    }

    if (typeof id === 'string') {
      const trimmed = id.trim();
      if (!trimmed.length) {
        return '';
      }
      const parsed = Number(trimmed);
      return Number.isNaN(parsed) ? trimmed : `ID ${parsed}`;
    }

    return `ID ${id}`;
  }

  private formatDateInput(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      return '';
    }

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }
}
