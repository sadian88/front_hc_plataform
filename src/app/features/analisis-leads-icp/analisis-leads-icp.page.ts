import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule, Table } from 'primeng/table';
import { LucideAngularModule } from 'lucide-angular';
import {
  AnalisisLeadsIcpService,
  AnalisisLeadIcp
} from '../../core/services/analisis-leads-icp.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type AnalisisLeadRow = AnalisisLeadIcp & {
  companyLabel: string;
  sourceScraping: string;
  displayDecision: string;
  decisionStatus: 'si' | 'no' | 'pendiente';
  painPoints: string[];
  painPointsText: string;
  totalScore: number | null;
  scoreRating: number;
};

@Component({
  selector: 'app-analisis-leads-icp-page',
  standalone: true,
  imports: [CommonModule, TableModule, LucideAngularModule],
  templateUrl: './analisis-leads-icp.page.html',
  styleUrl: './analisis-leads-icp.page.scss'
})
export class AnalisisLeadsIcpPageComponent implements OnInit {
  private readonly analisisService = inject(AnalisisLeadsIcpService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('analisisTable') analisisTable?: Table;

  readonly results = this.analisisService.results;
  readonly loading = this.analisisService.loading;
  readonly tableRows = computed<AnalisisLeadRow[]>(() =>
    this.results().map((result) => {
      const decision = this.normalizeDecision(result.decision || '');
      const painPoints = this.toArray(result.puntos_dolor_detectados);
      const totalScore = this.toNumber(result.score_total);
      return {
        ...result,
        companyLabel: result.company_name ? String(result.company_name).trim() : 'Sin origen',
        sourceScraping: this.formatSourceScraping(result.source_scraping),
        displayDecision: decision.label,
        decisionStatus: decision.status,
        painPoints,
        painPointsText: painPoints.join(' '),
        totalScore,
        scoreRating: this.toStarRating(totalScore)
      };
    })
  );
  readonly searchTerm = signal('');
  readonly companyFilter = signal('');
  readonly decisionFilter = signal('');
  readonly statusMessage = signal('Consulta los analisis ICP generados para leads.');
  readonly companyOptions = computed(() =>
    Array.from(
      new Set(
        this.tableRows()
          .map((row) => row.companyLabel)
          .filter((value) => Boolean(value && value.length))
      )
    ).sort((a, b) => a.localeCompare(b))
  );
  readonly decisionOptions = computed(() =>
    Array.from(
      new Set(
        this.tableRows()
          .map((row) => row.displayDecision)
          .filter((value) => Boolean(value && value.length))
      )
    ).sort((a, b) => a.localeCompare(b))
  );
  readonly hasActiveFilters = computed(
    () => !!(this.searchTerm() || this.companyFilter() || this.decisionFilter())
  );
  readonly sourceScrapingFilter = signal<string | null>(null);
  readonly hasServerFilter = computed(() => !!this.sourceScrapingFilter());
  readonly scoreModalOpen = signal(false);
  readonly analisisModalOpen = signal(false);
  readonly selectedScoreRow = signal<AnalisisLeadRow | null>(null);
  readonly selectedAnalisisRow = signal<AnalisisLeadRow | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const value = (params.get('sourceScraping') || '').trim();
      this.sourceScrapingFilter.set(value.length ? value : null);
      this.refresh();
    });
  }

  refresh(): void {
    const sourceScraping = this.sourceScrapingFilter();
    this.analisisService
      .loadAll(sourceScraping ? { sourceScraping } : undefined)
      .subscribe({
        next: () =>
          this.statusMessage.set(
            sourceScraping
              ? `Analisis ICP filtrados por source_scraping ${sourceScraping}.`
              : 'Analisis ICP actualizados.'
          ),
        error: () => this.statusMessage.set('No fue posible cargar los analisis ICP.')
      });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value || '';
    this.searchTerm.set(value);
    this.analisisTable?.filterGlobal(value, 'contains');
  }

  onCompanyFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value || '';
    this.companyFilter.set(value);
    if (value) {
      this.analisisTable?.filter(value, 'companyLabel', 'equals');
    } else {
      this.analisisTable?.filter(null, 'companyLabel', 'equals');
    }
  }

  onDecisionFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value || '';
    this.decisionFilter.set(value);
    if (value) {
      this.analisisTable?.filter(value, 'displayDecision', 'equals');
    } else {
      this.analisisTable?.filter(null, 'displayDecision', 'equals');
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.companyFilter.set('');
    this.decisionFilter.set('');
    this.analisisTable?.clear();
  }

  clearSourceScrapingFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sourceScraping: null },
      queryParamsHandling: 'merge'
    });
  }

  openScoreDetails(row: AnalisisLeadRow): void {
    this.selectedScoreRow.set(row);
    this.scoreModalOpen.set(true);
  }

  closeScoreDetails(): void {
    this.scoreModalOpen.set(false);
    this.selectedScoreRow.set(null);
  }

  openAnalisisDetails(row: AnalisisLeadRow): void {
    this.selectedAnalisisRow.set(row);
    this.analisisModalOpen.set(true);
  }

  closeAnalisisDetails(): void {
    this.analisisModalOpen.set(false);
    this.selectedAnalisisRow.set(null);
  }

  private formatSourceScraping(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim();
  }

  private toArray(value: string[] | string | null | undefined): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map((item) => String(item || '').trim()).filter((item) => item.length);
    }

    return String(value)
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => item.length);
  }

  private toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private toStarRating(value: number | null): number {
    if (value === null) {
      return 1;
    }

    const normalized = Math.round(value / 20);
    return Math.min(5, Math.max(1, normalized));
  }

  private normalizeDecision(value: string): { label: string; status: 'si' | 'no' | 'pendiente' } {
    const trimmed = String(value || '').trim();
    if (!trimmed) {
      return { label: 'Pendiente', status: 'pendiente' };
    }

    const normalized = trimmed.toLowerCase();
    if (normalized.startsWith('si') || normalized.includes('aprob') || normalized.includes('acept')) {
      return { label: trimmed, status: 'si' };
    }

    if (normalized.startsWith('no') || normalized.includes('rech')) {
      return { label: trimmed, status: 'no' };
    }

    return { label: trimmed, status: 'pendiente' };
  }
}
