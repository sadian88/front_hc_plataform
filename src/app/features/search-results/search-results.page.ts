import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TableModule, Table } from 'primeng/table';
import {
  SearchResultService,
  SearchResult,
  SearchResultPayload
} from '../../core/services/search-result.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface EditingKey {
  companyId: number;
  linkKey: string;
}

@Component({
  selector: 'app-search-results-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule],
  templateUrl: './search-results.page.html',
  styleUrl: './search-results.page.scss'
})
export class SearchResultsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
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
  readonly editingKey = signal<EditingKey | null>(null);
  readonly selectedLink = signal('');
  readonly showForm = signal(false);
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

  readonly form = this.fb.nonNullable.group({
    title: [''],
    redirectLink: [''],
    displayedLink: [''],
    source: ['']
  });

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
    this.editingKey.set({ companyId: result.company_id, linkKey: result.link_key });
    this.selectedLink.set(result.link);
    this.form.patchValue({
      title: result.title || '',
      redirectLink: result.redirect_link || '',
      displayedLink: result.displayed_link || '',
      source: result.source || ''
    });
    this.showForm.set(true);
  }

  onSubmit(): void {
    const key = this.editingKey();
    if (!key) {
      return;
    }

    const payload = this.buildPayload();
    this.statusMessage.set('Guardando cambios...');
    this.form.disable();

    this.searchResultService
      .update(key.companyId, key.linkKey, payload)
      .pipe(finalize(() => this.form.enable()))
      .subscribe({
        next: () => {
          this.statusMessage.set('Resultado actualizado.');
          this.resetForm();
        },
        error: () => this.statusMessage.set('No se pudo actualizar el resultado.')
      });
  }

  deleteResult(result: SearchResult): void {
    this.searchResultService.remove(result.company_id, result.link_key).subscribe({
      next: () => {
        this.statusMessage.set('Resultado eliminado.');
        if (this.editingKey()?.linkKey === result.link_key) {
          this.resetForm();
        }
      },
      error: () => this.statusMessage.set('No se pudo eliminar el resultado.')
    });
  }

  resetForm(): void {
    this.editingKey.set(null);
    this.selectedLink.set('');
    this.showForm.set(false);
    this.form.reset({
      title: '',
      redirectLink: '',
      displayedLink: '',
      source: ''
    });
  }

  private buildPayload(): SearchResultPayload {
    const value = this.form.getRawValue();
    return {
      title: this.normalizeString(value.title),
      redirectLink: this.normalizeString(value.redirectLink),
      displayedLink: this.normalizeString(value.displayedLink),
      source: this.normalizeString(value.source)
    };
  }

  private normalizeString(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const text = value.trim();
    return text.length ? text : null;
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
