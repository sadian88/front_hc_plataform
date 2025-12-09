import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TableModule, Table } from 'primeng/table';
import { LeadService, Lead, LeadPayload } from '../../core/services/lead.service';

type LeadRow = Lead & {
  sourceCompany: string;
  prospectCompany: string;
  displayCountry: string;
};

@Component({
  selector: 'app-leads-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule],
  templateUrl: './leads.page.html',
  styleUrl: './leads.page.scss'
})
export class LeadsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leadService = inject(LeadService);
  @ViewChild('leadTable') leadTable?: Table;

  readonly leads = this.leadService.leads;
  readonly loading = this.leadService.loading;
  readonly tableRows = computed<LeadRow[]>(() =>
    this.leads().map((lead) => ({
      ...lead,
      sourceCompany: (lead.company_name || '').trim(),
      prospectCompany: (lead.empresa || '').trim(),
      displayCountry: (lead.pais || '').trim()
    }))
  );
  readonly searchTerm = signal('');
  readonly companyFilter = signal('');
  readonly countryFilter = signal('');
  readonly editingId = signal<string | null>(null);
  readonly statusMessage = signal('Consulta y administra los leads existentes.');
  readonly showForm = signal(false);
  readonly companyOptions = computed(() =>
    Array.from(
      new Set(
        this.tableRows()
          .map((lead) => lead.sourceCompany)
          .filter((value) => Boolean(value && value.length))
      )
    ).sort((a, b) => a.localeCompare(b))
  );
  readonly countryOptions = computed(() =>
    Array.from(
      new Set(
        this.tableRows()
          .map((lead) => lead.displayCountry)
          .filter((value) => Boolean(value && value.length))
      )
    ).sort((a, b) => a.localeCompare(b))
  );
  readonly hasActiveFilters = computed(
    () => !!(this.searchTerm() || this.companyFilter() || this.countryFilter())
  );

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    cargo: [''],
    seniority: [''],
    rolFuncional: [''],
    empresa: [''],
    sectorEmpresa: [''],
    pais: [''],
    ciudad: [''],
    tamanoEmpresaEmpleados: [''],
    headlinePerfil: [''],
    resumenPerfil: [''],
    companyId: [''],
    linkedinUrl: ['', [Validators.required]],
    temasClavePublicaciones: [''],
    ultimasPublicacionesTexto: [''],
    interaccionesRelevantes: [''],
    tagsInternos: ['']
  });

  ngOnInit(): void {
    this.refresh();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value || '';
    this.searchTerm.set(value);
    this.leadTable?.filterGlobal(value, 'contains');
  }

  onCompanyFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value || '';
    this.companyFilter.set(value);
    if (value) {
      this.leadTable?.filter(value, 'sourceCompany', 'equals');
    } else {
      this.leadTable?.filter(null, 'sourceCompany', 'equals');
    }
  }

  onCountryFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value || '';
    this.countryFilter.set(value);
    if (value) {
      this.leadTable?.filter(value, 'displayCountry', 'equals');
    } else {
      this.leadTable?.filter(null, 'displayCountry', 'equals');
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.companyFilter.set('');
    this.countryFilter.set('');
    this.leadTable?.clear();
  }

  refresh(): void {
    this.leadService.loadAll().subscribe({
      next: () => this.statusMessage.set('Leads actualizados.'),
      error: () => this.statusMessage.set('No fue posible cargar los leads.')
    });
  }

  startEdit(lead: Lead): void {
    this.editingId.set(lead.id_lead);
    this.form.patchValue({
      nombre: lead.nombre || '',
      cargo: lead.cargo || '',
      seniority: lead.seniority || '',
      rolFuncional: lead.rol_funcional || '',
      empresa: lead.empresa || '',
      sectorEmpresa: lead.sector_empresa || '',
      pais: lead.pais || '',
      ciudad: lead.ciudad || '',
      tamanoEmpresaEmpleados: lead.tamano_empresa_empleados
        ? String(lead.tamano_empresa_empleados)
        : '',
      headlinePerfil: lead.headline_perfil || '',
      resumenPerfil: lead.resumen_perfil || '',
      companyId: lead.company_id ? String(lead.company_id) : '',
      linkedinUrl: lead.linkedin_url || '',
      temasClavePublicaciones: this.formatArrayField(lead.temas_clave_publicaciones),
      ultimasPublicacionesTexto: this.formatArrayField(lead.ultimas_publicaciones_texto),
      interaccionesRelevantes: this.formatArrayField(lead.interacciones_relevantes),
      tagsInternos: this.formatArrayField(lead.tags_internos)
    });
    this.showForm.set(true);
  }

  onSubmit(): void {
    if (!this.editingId()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.statusMessage.set('Guardando informacion...');
    this.form.disable();

    this.leadService
      .update(this.editingId()!, payload)
      .pipe(finalize(() => this.form.enable()))
      .subscribe({
        next: () => {
          this.statusMessage.set('Lead actualizado correctamente.');
          this.resetForm();
        },
        error: () => this.statusMessage.set('No se pudo actualizar el lead.')
      });
  }

  deleteLead(lead: Lead): void {
    this.leadService.remove(lead.id_lead).subscribe({
      next: () => {
        this.statusMessage.set('Lead eliminado.');
        if (this.editingId() === lead.id_lead) {
          this.resetForm();
        }
      },
      error: () => this.statusMessage.set('No se pudo eliminar el lead.')
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.showForm.set(false);
    this.form.reset({
      nombre: '',
      cargo: '',
      seniority: '',
      rolFuncional: '',
      empresa: '',
      sectorEmpresa: '',
      pais: '',
      ciudad: '',
      tamanoEmpresaEmpleados: '',
      headlinePerfil: '',
      resumenPerfil: '',
      companyId: '',
      linkedinUrl: '',
      temasClavePublicaciones: '',
      ultimasPublicacionesTexto: '',
      interaccionesRelevantes: '',
      tagsInternos: ''
    });
  }

  private buildPayload(): LeadPayload {
    const value = this.form.getRawValue();
    return {
      companyId: this.parseNumberField(value.companyId),
      nombre: value.nombre,
      cargo: this.normalizeString(value.cargo),
      seniority: this.normalizeString(value.seniority),
      rolFuncional: this.normalizeString(value.rolFuncional),
      empresa: this.normalizeString(value.empresa),
      sectorEmpresa: this.normalizeString(value.sectorEmpresa),
      pais: this.normalizeString(value.pais),
      ciudad: this.normalizeString(value.ciudad),
      tamanoEmpresaEmpleados: this.parseNumberField(value.tamanoEmpresaEmpleados),
      headlinePerfil: this.normalizeString(value.headlinePerfil),
      resumenPerfil: this.normalizeString(value.resumenPerfil),
      temasClavePublicaciones: this.parseListField(value.temasClavePublicaciones),
      ultimasPublicacionesTexto: this.parseListField(value.ultimasPublicacionesTexto),
      interaccionesRelevantes: this.parseListField(value.interaccionesRelevantes),
      tagsInternos: this.parseListField(value.tagsInternos),
      linkedinUrl: value.linkedinUrl.trim()
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

  private parseListField(value: string | null | undefined): string[] {
    if (!value) {
      return [];
    }

    return value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => item.length);
  }

  private formatArrayField(value: string[] | null | undefined): string {
    if (!value || !value.length) {
      return '';
    }

    return value.join('\n');
  }
}
