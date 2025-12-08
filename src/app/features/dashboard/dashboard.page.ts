import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

interface CardMetric {
  label: string;
  value: string;
  change: string;
}

interface ActivityItem {
  title: string;
  time: string;
  status: 'ok' | 'warn';
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPageComponent {
  readonly cards: CardMetric[] = [
    { label: 'Bots activos', value: '32', change: '+4 desde ayer' },
    { label: 'Automatizaciones hoy', value: '184', change: '+8% semanal' },
    { label: 'Incidentes abiertos', value: '3', change: '2 críticos' }
  ];

  readonly activities: ActivityItem[] = [
    {
      title: 'Sincronización ERP finalizada',
      time: 'Hace 8 min',
      status: 'ok'
    },
    {
      title: 'Cola de documentos pendiente',
      time: 'Hace 16 min',
      status: 'warn'
    },
    {
      title: 'Bot de facturación reiniciado',
      time: 'Hace 1 h',
      status: 'ok'
    }
  ];

  readonly highlights = [
    {
      title: 'Eficiencia semanal',
      value: '92%',
      detail: 'Meta alcanzada 4/5 días'
    },
    {
      title: 'Tickets resueltos',
      value: '48',
      detail: 'Promedio 3m por ticket'
    }
  ];

}
