import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TableModule, Table } from 'primeng/table';
import { LucideAngularModule } from 'lucide-angular';
import { LeadService, Lead, LeadPayload } from '../../core/services/lead.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type LeadRow = Lead & {
  sourceCompany: string;
  prospectCompany: string;
  displayCountry: string;
  sourceScraping: string;
  score: number;
  conversionStatus: 'si' | 'no' | 'pendiente';
  interactionType: 'reaction' | 'comment' | 'view';
};

@Component({
  selector: 'app-leads-page',
  standalone: true,
  imports: [CommonModule, TableModule, LucideAngularModule],
  templateUrl: './leads.page.html',
  styleUrl: './leads.page.scss'
})
export class LeadsPageComponent implements OnInit {
  private readonly leadService = inject(LeadService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('leadTable') leadTable?: Table;

  readonly leads = this.leadService.leads;
  readonly loading = this.leadService.loading;
  readonly tableRows = computed<LeadRow[]>(() =>
    this.leads().map((lead, index) => ({
      ...lead,
      sourceCompany: (lead.company_name || '').trim(),
      prospectCompany: (lead.empresa || '').trim(),
      displayCountry: (lead.pais || '').trim(),
      sourceScraping: this.formatSourceScraping(lead.source_scraping),
      score: Math.floor(Math.random() * 40) + 60, // Mock score 60-100
      conversionStatus: (['si', 'no', 'pendiente'] as const)[index % 3],
      interactionType: (['reaction', 'comment', 'view'] as const)[index % 3]
    }))
  );
  readonly searchTerm = signal('');
  readonly companyFilter = signal('');
  readonly countryFilter = signal('');
  readonly statusMessage = signal('Consulta y administra las User Interactions existentes.');
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
  readonly sourceScrapingFilter = signal<string | null>(null);
  readonly hasServerFilter = computed(() => !!this.sourceScrapingFilter());

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const value = (params.get('sourceScraping') || '').trim();
      this.sourceScrapingFilter.set(value.length ? value : null);
      this.refresh();
    });
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
    const serverFilter = this.sourceScrapingFilter();
    this.leadService
      .loadAll(serverFilter ? { sourceScraping: serverFilter } : undefined)
      .subscribe({
        next: () =>
          this.statusMessage.set(
            serverFilter
              ? `User Interactions filtradas por source_scraping ${serverFilter}.`
              : 'User Interactions actualizadas.'
          ),
        error: () => this.statusMessage.set('No fue posible cargar las User Interactions.')
      });
  }

  startEdit(lead: Lead): void {
    this.router.navigate(['/app/user-interactions', lead.id_lead, 'edit']);
  }

  clearSourceScrapingFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sourceScraping: null },
      queryParamsHandling: 'merge'
    });
  }

  deleteLead(lead: Lead): void {
    this.leadService.remove(lead.id_lead).subscribe({
      next: () => {
        this.statusMessage.set('User Interaction eliminada.');
      },
      error: () => this.statusMessage.set('No se pudo eliminar la User Interaction.')
    });
  }

  private formatSourceScraping(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim();
  }
}
