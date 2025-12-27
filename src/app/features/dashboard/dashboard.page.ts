import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, computed } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ChartModule } from 'primeng/chart';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ChartModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly data = this.dashboardService.data;
  readonly loading = this.dashboardService.loading;
  readonly leadChartData = computed(() => {
    const summary = this.data()?.summary;
    if (!summary) {
      return null;
    }

    return {
      labels: ['User Interactions', 'Scrapings'],
      datasets: [
        {
          data: [summary.leads, summary.searchResults],
          backgroundColor: ['#16a34a', '#0ea5e9'],
          hoverBackgroundColor: ['#22c55e', '#38bdf8']
        }
      ]
    };
  });

  ngOnInit(): void {
    this.dashboardService.load().subscribe();
  }

  get cards() {
    const summary = this.data()?.summary;
    return [
      {
        label: 'Compañías registradas',
        value: summary ? summary.companies.toString() : '--',
        change: summary?.latestSearchUpdate
          ? `Último scraping ${new Date(summary.latestSearchUpdate).toLocaleDateString()}`
          : 'Sin registros'
      },
      {
        label: 'User Interactions activas',
        value: summary ? summary.leads.toString() : '--',
        change: summary?.latestLeadUpdate
          ? `Actualizado ${new Date(summary.latestLeadUpdate).toLocaleDateString()}`
          : 'Sin registros'
      },
      {
        label: 'Resultados de búsqueda',
        value: summary ? summary.searchResults.toString() : '--',
        change: summary?.latestSearchUpdate
          ? `Última fuente ${new Date(summary.latestSearchUpdate).toLocaleDateString()}`
          : 'Sin registros'
      }
    ];
  }

  recentLeads() {
    return this.data()?.recentLeads || [];
  }

  topCompanies() {
    return this.data()?.topCompanies || [];
  }

  trackLead(index: number, item: any) {
    return item?.id_lead || index;
  }

  trackCompany(index: number, item: any) {
    return item?.id || index;
  }
}
