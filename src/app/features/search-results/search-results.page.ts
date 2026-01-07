import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule, Table } from 'primeng/table';
import { LucideAngularModule } from 'lucide-angular';
import {
  SearchResultService,
  SearchResult
} from '../../core/services/search-result.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-results-page',
  standalone: true,
  imports: [CommonModule, TableModule, LucideAngularModule],
  templateUrl: './search-results.page.html',
  styleUrl: './search-results.page.scss'
})
export class SearchResultsPageComponent implements OnInit {
  private readonly searchResultService = inject(SearchResultService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('resultsTable') resultsTable?: Table;

  readonly results = this.searchResultService.results;
  readonly loading = this.searchResultService.loading;
  readonly tableRows = computed(() =>
    this.results().map((result) => ({
      ...result,
      sourceScraping: this.formatSourceScraping(result.source_scraping),
      companyLabel: result.company_name
        ? `${result.company_name}`
        : `ID ${result.company_id}`,
      displaySource: result.source || 'Sin origen'
    }))
  );
  readonly searchTerm = signal('');
  readonly companyFilter = signal('');
  readonly sourceFilter = signal('');
  readonly statusMessage = signal('Consulta Company_Prospectos del scraping corporativo.');
  readonly companyOptions = computed(() =>
    Array.from(
      new Set(
        this.tableRows()
          .map((row) => row.sourceScraping)
          .filter((value) => Boolean(value && value.length))
      )
    ).sort((a, b) => a.localeCompare(b))
  );
  readonly sourceOptions = computed(() =>
    Array.from(
      new Set(
        this.tableRows()
          .map((row) => row.displaySource)
          .filter((value) => Boolean(value && value.length))
      )
    ).sort((a, b) => a.localeCompare(b))
  );
  readonly hasActiveFilters = computed(
    () => !!(this.searchTerm() || this.companyFilter() || this.sourceFilter())
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

  refresh(): void {
    const sourceScraping = this.sourceScrapingFilter();
    this.searchResultService
      .loadAll(sourceScraping ? { sourceScraping } : undefined)
      .subscribe({
        next: () =>
          this.statusMessage.set(
            sourceScraping
              ? `Company_Prospectos filtrados por source_scraping ${sourceScraping}.`
              : 'Company_Prospectos actualizados.'
          ),
        error: () => this.statusMessage.set('No fue posible cargar los Company_Prospectos.')
      });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value || '';
    this.searchTerm.set(value);
    this.resultsTable?.filterGlobal(value, 'contains');
  }

  onCompanyFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value || '';
    this.companyFilter.set(value);
    if (value) {
      this.resultsTable?.filter(value, 'sourceScraping', 'equals');
    } else {
      this.resultsTable?.filter(null, 'sourceScraping', 'equals');
    }
  }

  onSourceFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value || '';
    this.sourceFilter.set(value);
    this.resultsTable?.filter(value, 'displaySource', 'equals');
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.companyFilter.set('');
    this.sourceFilter.set('');
    this.resultsTable?.clear();
  }

  startEdit(result: SearchResult & { companyLabel: string; displaySource: string }): void {
    this.router.navigate(['/app/company-prospectos', result.company_id, result.link_key, 'edit']);
  }

  deleteResult(result: SearchResult): void {
    this.searchResultService.remove(result.company_id, result.link_key).subscribe({
      next: () => {
        this.statusMessage.set('Resultado eliminado.');
      },
      error: () => this.statusMessage.set('No se pudo eliminar el resultado.')
    });
  }

  private formatSourceScraping(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim();
  }

  clearSourceScrapingFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sourceScraping: null },
      queryParamsHandling: 'merge'
    });
  }
}
