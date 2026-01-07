import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
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
  imports: [CommonModule, TableModule, LucideAngularModule],
  templateUrl: './prospects.page.html',
  styleUrl: './prospects.page.scss'
})
export class ProspectsPageComponent implements OnInit {
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
    this.router.navigate(['/app/lead-prospecto', prospect.id, 'edit']);
  }

  deleteProspect(prospect: Prospect): void {
    this.prospectService.remove(prospect.id).subscribe({
      next: () => {
        this.statusMessage.set('Lead Prospecto eliminado.');
      },
      error: () => this.statusMessage.set('No se pudo eliminar el Lead Prospecto.')
    });
  }

  clearSourceScrapingFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sourceScraping: null },
      queryParamsHandling: 'merge'
    });
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
}
