import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  inject,
  signal,
  computed
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Company, CompanyPayload } from '../../../core/services/company.service';

type FormTab = 'general' | 'icp' | 'buyer';
type IndustryOption = {
  sector: string;
  industry: string;
  trend: string;
  value: string;
};

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.scss'
})
export class CompanyFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() company: Company | null = null;
  @Input() submitLabel = 'Guardar';
  @Output() save = new EventEmitter<CompanyPayload>();
  @Output() cancel = new EventEmitter<void>();

  readonly activeTab = signal<FormTab>('general');
  readonly industrySearch = signal('');
  readonly generalIndustrySearch = signal('');
  readonly industryOptions: IndustryOption[] = [
    {
      sector: 'Servicios Financieros',
      industry: 'Banca Tradicional',
      trend: 'Consolidacion Digital',
      value: 'Servicios Financieros - Banca Tradicional'
    },
    {
      sector: 'Servicios Financieros',
      industry: 'FinTech (Pagos y Billeteras)',
      trend: 'Crecimiento Masivo',
      value: 'Servicios Financieros - FinTech (Pagos y Billeteras)'
    },
    {
      sector: 'Servicios Financieros',
      industry: 'Seguros (InsurTech)',
      trend: 'Automatizacion',
      value: 'Servicios Financieros - Seguros (InsurTech)'
    },
    {
      sector: 'Servicios Financieros',
      industry: 'Inversiones y Corretaje',
      trend: 'Trading Minorista',
      value: 'Servicios Financieros - Inversiones y Corretaje'
    },
    {
      sector: 'Servicios Financieros',
      industry: 'Prestamos P2P y Microcreditos',
      trend: 'Inclusion Financiera',
      value: 'Servicios Financieros - Prestamos P2P y Microcreditos'
    },
    {
      sector: 'Consumo y Retail',
      industry: 'E-commerce',
      trend: 'Logistica propia',
      value: 'Consumo y Retail - E-commerce'
    },
    {
      sector: 'Consumo y Retail',
      industry: 'Supermercados y Retail Alimentario',
      trend: 'Omnicanalidad',
      value: 'Consumo y Retail - Supermercados y Retail Alimentario'
    },
    {
      sector: 'Consumo y Retail',
      industry: 'Bebidas (Alcoholicas y Refrescos)',
      trend: 'Sostenibilidad',
      value: 'Consumo y Retail - Bebidas (Alcoholicas y Refrescos)'
    },
    {
      sector: 'Consumo y Retail',
      industry: 'Alimentos Procesados',
      trend: 'Etiquetado Saludable',
      value: 'Consumo y Retail - Alimentos Procesados'
    },
    {
      sector: 'Consumo y Retail',
      industry: 'Moda y Textil',
      trend: 'Fast-Fashion Local',
      value: 'Consumo y Retail - Moda y Textil'
    },
    {
      sector: 'Consumo y Retail',
      industry: 'Cosmetica y Cuidado Personal',
      trend: 'Venta Directa Digital',
      value: 'Consumo y Retail - Cosmetica y Cuidado Personal'
    },
    {
      sector: 'Extractivas y Energia',
      industry: 'Petroleo y Gas',
      trend: 'Optimizacion Operativa',
      value: 'Extractivas y Energia - Petroleo y Gas'
    },
    {
      sector: 'Extractivas y Energia',
      industry: 'Mineria de Litio',
      trend: 'Transicion Energetica',
      value: 'Extractivas y Energia - Mineria de Litio'
    },
    {
      sector: 'Extractivas y Energia',
      industry: 'Mineria de Cobre y Hierro',
      trend: 'Exportacion Global',
      value: 'Extractivas y Energia - Mineria de Cobre y Hierro'
    },
    {
      sector: 'Extractivas y Energia',
      industry: 'Energias Renovables (Solar/Eolica)',
      trend: 'Inversion ESG',
      value: 'Extractivas y Energia - Energias Renovables (Solar/Eolica)'
    },
    {
      sector: 'Extractivas y Energia',
      industry: 'Biocombustibles',
      trend: 'Mercado Carbono',
      value: 'Extractivas y Energia - Biocombustibles'
    },
    {
      sector: 'Manufactura',
      industry: 'Automotriz',
      trend: 'Vehiculos Electricos',
      value: 'Manufactura - Automotriz'
    },
    {
      sector: 'Manufactura',
      industry: 'Aeroespacial',
      trend: 'Manufactura Avanzada',
      value: 'Manufactura - Aeroespacial'
    },
    {
      sector: 'Manufactura',
      industry: 'Siderurgia y Metalurgia',
      trend: 'Demanda Construccion',
      value: 'Manufactura - Siderurgia y Metalurgia'
    },
    {
      sector: 'Manufactura',
      industry: 'Cemento y Materiales',
      trend: 'Infraestructura',
      value: 'Manufactura - Cemento y Materiales'
    },
    {
      sector: 'Manufactura',
      industry: 'Quimica y Petroquimica',
      trend: 'Insumos Industriales',
      value: 'Manufactura - Quimica y Petroquimica'
    },
    {
      sector: 'Manufactura',
      industry: 'Linea Blanca y Electrodomesticos',
      trend: 'Nearshoring',
      value: 'Manufactura - Linea Blanca y Electrodomesticos'
    },
    {
      sector: 'Tecnologia',
      industry: 'Desarrollo de Software (SaaS)',
      trend: 'Exportacion Servicios',
      value: 'Tecnologia - Desarrollo de Software (SaaS)'
    },
    {
      sector: 'Tecnologia',
      industry: 'Ciberseguridad',
      trend: 'Proteccion de Datos',
      value: 'Tecnologia - Ciberseguridad'
    },
    {
      sector: 'Tecnologia',
      industry: 'Inteligencia Artificial Aplicada',
      trend: 'Eficiencia de Procesos',
      value: 'Tecnologia - Inteligencia Artificial Aplicada'
    },
    {
      sector: 'Tecnologia',
      industry: 'EdTech (Educacion Digital)',
      trend: 'Reskilling',
      value: 'Tecnologia - EdTech (Educacion Digital)'
    },
    {
      sector: 'Tecnologia',
      industry: 'Centros de Datos (Data Centers)',
      trend: 'Cloud Computing',
      value: 'Tecnologia - Centros de Datos (Data Centers)'
    },
    {
      sector: 'Tecnologia',
      industry: 'HRTech',
      trend: 'Reclutamiento basado en \"Habilidades\"',
      value: 'Tecnologia - HRTech'
    },
    {
      sector: 'Tecnologia',
      industry: 'Telecomunicaciones',
      trend: 'Despliegue 5G',
      value: 'Tecnologia - Telecomunicaciones'
    },
    {
      sector: 'Agroindustria',
      industry: 'Agrotech',
      trend: 'Agricultura de Precision',
      value: 'Agroindustria - Agrotech'
    },
    {
      sector: 'Agroindustria',
      industry: 'Ganaderia y Carnes',
      trend: 'Trazabilidad',
      value: 'Agroindustria - Ganaderia y Carnes'
    },
    {
      sector: 'Agroindustria',
      industry: 'Cultivos de Exportacion (Cafe/Flores)',
      trend: 'Comercio Justo',
      value: 'Agroindustria - Cultivos de Exportacion (Cafe/Flores)'
    },
    {
      sector: 'Agroindustria',
      industry: 'Granos (Soja/Maiz)',
      trend: 'Commodities',
      value: 'Agroindustria - Granos (Soja/Maiz)'
    },
    {
      sector: 'Agroindustria',
      industry: 'Acuicultura y Pesca',
      trend: 'Economia Azul',
      value: 'Agroindustria - Acuicultura y Pesca'
    },
    {
      sector: 'Salud',
      industry: 'HealthTech',
      trend: 'Telemedicina',
      value: 'Salud - HealthTech'
    },
    {
      sector: 'Salud',
      industry: 'Farmaceutica',
      trend: 'Genericos y Biotecnologia',
      value: 'Salud - Farmaceutica'
    },
    {
      sector: 'Salud',
      industry: 'Servicios Hospitalarios',
      trend: 'Modernizacion Medica',
      value: 'Salud - Servicios Hospitalarios'
    },
    {
      sector: 'Salud',
      industry: 'Dispositivos Medicos',
      trend: 'Exportacion (Hubs)',
      value: 'Salud - Dispositivos Medicos'
    },
    {
      sector: 'Logistica',
      industry: 'Logistica de Ultima Milla',
      trend: 'Delivery Urbano',
      value: 'Logistica - Logistica de Ultima Milla'
    },
    {
      sector: 'Logistica',
      industry: 'Transporte Maritimo y Puertos',
      trend: 'Comercio Exterior',
      value: 'Logistica - Transporte Maritimo y Puertos'
    },
    {
      sector: 'Logistica',
      industry: 'Aerolineas y Transporte Aereo',
      trend: 'Conectividad Regional',
      value: 'Logistica - Aerolineas y Transporte Aereo'
    },
    {
      sector: 'Logistica',
      industry: 'Gestion de Almacenes',
      trend: 'Centros de Distribucion',
      value: 'Logistica - Gestion de Almacenes'
    },
    {
      sector: 'Inmobiliario',
      industry: 'Real Estate Residencial',
      trend: 'Urbanizacion',
      value: 'Inmobiliario - Real Estate Residencial'
    },
    {
      sector: 'Inmobiliario',
      industry: 'Real Estate Industrial',
      trend: 'Parques Logisticos',
      value: 'Inmobiliario - Real Estate Industrial'
    },
    {
      sector: 'Turismo',
      industry: 'Hoteleria y Turismo',
      trend: 'Turismo Sostenible',
      value: 'Turismo - Hoteleria y Turismo'
    },
    {
      sector: 'Entretenimiento',
      industry: 'Streaming y Medios',
      trend: 'Contenido Local',
      value: 'Entretenimiento - Streaming y Medios'
    },
    {
      sector: 'Entretenimiento',
      industry: 'Gaming y E-sports',
      trend: 'Monetizacion Audiencia',
      value: 'Entretenimiento - Gaming y E-sports'
    },
    {
      sector: 'Servicios',
      industry: 'BPO (Outsourcing de Procesos)',
      trend: 'Soporte Global',
      value: 'Servicios - BPO (Outsourcing de Procesos)'
    },
    {
      sector: 'Servicios',
      industry: 'Consultoria',
      trend: 'Marketing de Influencia',
      value: 'Servicios - Consultoria'
    },
    {
      sector: 'Servicios',
      industry: 'Publicidad Digital',
      trend: 'Marketing de Influencia',
      value: 'Servicios - Publicidad Digital'
    },
    {
      sector: 'Construccion',
      industry: 'Infraestructura y Obra Publica',
      trend: 'Alianzas Publico-Privadas',
      value: 'Construccion - Infraestructura y Obra Publica'
    },
    {
      sector: 'Medio Ambiente',
      industry: 'Economia Circular y Reciclaje',
      trend: 'Gestion de Residuos',
      value: 'Medio Ambiente - Economia Circular y Reciclaje'
    },
    {
      sector: 'Otra',
      industry: 'Otra',
      trend: 'Otra',
      value: 'Otra - Otra'
    }
  ];
  readonly filteredIndustries = computed(() => {
    const term = this.industrySearch().trim().toLowerCase();
    if (!term) {
      return this.industryOptions;
    }

    return this.industryOptions.filter((option) => {
      const haystack = `${option.sector} ${option.industry} ${option.trend}`.toLowerCase();
      return haystack.includes(term);
    });
  });
  readonly filteredGeneralIndustries = computed(() => {
    const term = this.generalIndustrySearch().trim().toLowerCase();
    if (!term) {
      return this.industryOptions;
    }

    return this.industryOptions.filter((option) => {
      const haystack = `${option.sector} ${option.industry} ${option.trend}`.toLowerCase();
      return haystack.includes(term);
    });
  });
  readonly defaultCompanySizeIndex = 2;
  readonly companySizeOptions = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1001-5000',
    '5001-10000',
    '10000+'
  ];
  readonly companyTypeOptions = [
    'Privada',
    'Publica',
    'Mixta',
    'Microempresa',
    'Pequena',
    'Mediana (Pyme)',
    'Grande',
    'Local / Regional',
    'Nacional',
    'Multinacional',
    'Transnacional',
    'Startup',
    'Scaleup',
    'Unicornio',
    'Empresa B (Sistema B)',
    'ONG / Sin Animo de Lucro'
  ];
  readonly buyerChannelOptions = ['LinkedIn', 'Email', 'Telefono', 'WhatsApp', 'Webinars'];
  readonly companySizeIndex = signal(this.defaultCompanySizeIndex);

  readonly form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required]],
    companyUrlProfile: ['', [Validators.required]],
    companySegment: [''],
    customerUrlProfile: [''],
    companyIcp: [''],
    icpIndustries: [[] as string[]],
    icpCompanySize: [this.companySizeOptions[this.defaultCompanySizeIndex]],
    icpTargetCountry: [''],
    icpTargetCity: [''],
    icpIndustryPain: [''],
    icpCompetitors: [[] as string[]],
    icpCurrentCustomers: [[] as string[]],
    buyerPersonaName: [''],
    buyerPersonaAge: [''],
    buyerPersonaRole: [''],
    buyerPersonaCompanyType: [''],
    buyerPersonaLocation: [''],
    buyerPersonaGoals: [''],
    buyerPersonaPainPoints: [''],
    buyerPersonaBuyingBehavior: [''],
    buyerPersonaChannels: [[] as string[]],
    creationDate: ['']
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['company']) {
      return;
    }

    if (!this.company) {
      this.resetForm();
      return;
    }

    this.form.patchValue({
      companyName: this.company.company_name,
      companyUrlProfile: this.company.company_url_profile,
      companySegment: this.company.company_segment || '',
      customerUrlProfile: this.company.customer_url_profile || '',
      companyIcp: this.company.company_icp || '',
      icpIndustries: this.company.icp_industries || [],
      icpCompanySize: this.company.icp_company_size || '',
      icpTargetCountry: this.company.icp_target_country || '',
      icpTargetCity: this.company.icp_target_city || '',
      icpIndustryPain: this.company.icp_industry_pain || '',
      icpCompetitors: this.company.icp_competitors || [],
      icpCurrentCustomers: this.company.icp_current_customers || [],
      buyerPersonaName: this.company.buyer_persona_name || '',
      buyerPersonaAge:
        this.company.buyer_persona_age === null || this.company.buyer_persona_age === undefined
          ? ''
          : String(this.company.buyer_persona_age),
      buyerPersonaRole: this.company.buyer_persona_role || '',
      buyerPersonaCompanyType: this.company.buyer_persona_company_type || '',
      buyerPersonaLocation: this.company.buyer_persona_location || '',
      buyerPersonaGoals: this.company.buyer_persona_goals || '',
      buyerPersonaPainPoints: this.company.buyer_persona_pain_points || '',
      buyerPersonaBuyingBehavior: this.company.buyer_persona_buying_behavior || '',
      buyerPersonaChannels: this.company.buyer_persona_channels || [],
      creationDate: this.company.creation_date ? this.company.creation_date.slice(0, 10) : ''
    });
    this.setCompanySizeFromValue(this.company.icp_company_size);
  }

  setTab(tab: FormTab): void {
    this.activeTab.set(tab);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.getRawValue());
  }

  onCompanySizeChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.setCompanySizeByIndex(value);
  }

  onIndustrySearch(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value || '';
    this.industrySearch.set(value);
  }

  onGeneralIndustrySearch(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value || '';
    this.generalIndustrySearch.set(value);
  }

  selectCompanyIndustry(option: IndustryOption): void {
    this.form.patchValue({ companySegment: option.value });
  }

  isCompanyIndustrySelected(option: IndustryOption): boolean {
    return this.form.get('companySegment')?.value === option.value;
  }

  clearCompanyIndustry(): void {
    this.form.patchValue({ companySegment: '' });
  }

  getCompanyIndustryLabel(): string {
    const value = String(this.form.get('companySegment')?.value || '').trim();
    if (!value) {
      return 'Sin seleccion';
    }

    const match = this.industryOptions.find((option) => option.value === value);
    return match ? `${match.sector} - ${match.industry}` : value;
  }

  toggleIndustry(option: IndustryOption, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const value = option.value;
    const current = this.getSelectedIndustries();
    const updated = checked
      ? Array.from(new Set([...current, value]))
      : current.filter((item) => item !== value);
    this.form.patchValue({ icpIndustries: updated });
  }

  isIndustrySelected(option: IndustryOption): boolean {
    return this.getSelectedIndustries().includes(option.value);
  }

  getSelectedIndustries(): string[] {
    const control = this.form.get('icpIndustries');
    return (control?.value || []) as string[];
  }

  removeIndustry(value: string): void {
    const updated = this.getSelectedIndustries().filter((item) => item !== value);
    this.form.patchValue({ icpIndustries: updated });
  }

  getIndustryLabel(value: string): string {
    const match = this.industryOptions.find((option) => option.value === value);
    return match ? `${match.sector} - ${match.industry}` : value;
  }

  getCompanySizeLabel(): string {
    return this.form.get('icpCompanySize')?.value || 'Sin definir';
  }

  addTag(controlName: 'icpCompetitors' | 'icpCurrentCustomers', input: HTMLInputElement): void {
    const value = input.value.trim();
    if (!value) {
      return;
    }

    const current = this.getTags(controlName);
    if (!current.includes(value)) {
      this.form.patchValue({ [controlName]: [...current, value] });
    }

    input.value = '';
  }

  removeTag(controlName: 'icpCompetitors' | 'icpCurrentCustomers', value: string): void {
    const updated = this.getTags(controlName).filter((item) => item !== value);
    this.form.patchValue({ [controlName]: updated });
  }

  getTags(controlName: 'icpCompetitors' | 'icpCurrentCustomers'): string[] {
    const control = this.form.get(controlName);
    return (control?.value || []) as string[];
  }

  toggleBuyerChannel(channel: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.getBuyerChannels();
    const updated = checked
      ? Array.from(new Set([...current, channel]))
      : current.filter((item) => item !== channel);
    this.form.patchValue({ buyerPersonaChannels: updated });
  }

  isBuyerChannelSelected(channel: string): boolean {
    return this.getBuyerChannels().includes(channel);
  }

  getBuyerChannels(): string[] {
    const control = this.form.get('buyerPersonaChannels');
    return (control?.value || []) as string[];
  }

  getBuyerInitials(): string {
    const name = String(this.form.get('buyerPersonaName')?.value || '').trim();
    if (!name) {
      return 'BP';
    }

    const parts = name.split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase());
    return initials.join('') || 'BP';
  }

  getBuyerSubtitle(): string {
    const role = String(this.form.get('buyerPersonaRole')?.value || '').trim();
    const companyType = String(this.form.get('buyerPersonaCompanyType')?.value || '').trim();
    if (!role && !companyType) {
      return 'Rol y tipo de empresa';
    }

    if (role && companyType) {
      return `${role} en ${companyType}`;
    }

    return role || companyType;
  }

  getBuyerMeta(): string {
    const location = String(this.form.get('buyerPersonaLocation')?.value || '').trim();
    const ageValue = String(this.form.get('buyerPersonaAge')?.value || '').trim();
    if (!location && !ageValue) {
      return 'Ubicacion y edad';
    }

    if (location && ageValue) {
      return `${location} · ${ageValue} anos`;
    }

    return location || `${ageValue} anos`;
  }

  resetForm(): void {
    this.form.reset({
      companyName: '',
      companyUrlProfile: '',
      companySegment: '',
      customerUrlProfile: '',
      companyIcp: '',
      icpIndustries: [],
      icpCompanySize: this.companySizeOptions[this.defaultCompanySizeIndex],
      icpTargetCountry: '',
      icpTargetCity: '',
      icpIndustryPain: '',
      icpCompetitors: [],
      icpCurrentCustomers: [],
      buyerPersonaName: '',
      buyerPersonaAge: '',
      buyerPersonaRole: '',
      buyerPersonaCompanyType: '',
      buyerPersonaLocation: '',
      buyerPersonaGoals: '',
      buyerPersonaPainPoints: '',
      buyerPersonaBuyingBehavior: '',
      buyerPersonaChannels: [],
      creationDate: ''
    });
    this.setCompanySizeByIndex(this.defaultCompanySizeIndex);
    this.industrySearch.set('');
    this.generalIndustrySearch.set('');
    this.activeTab.set('general');
  }

  private setCompanySizeFromValue(value?: string | null): void {
    if (!value) {
      this.setCompanySizeByIndex(this.defaultCompanySizeIndex);
      return;
    }

    const index = this.companySizeOptions.findIndex((item) => item === value);
    this.setCompanySizeByIndex(index >= 0 ? index : this.defaultCompanySizeIndex);
  }

  private setCompanySizeByIndex(index: number): void {
    const safeIndex = Math.min(Math.max(index, 0), this.companySizeOptions.length - 1);
    this.companySizeIndex.set(safeIndex);
    this.form.patchValue({ icpCompanySize: this.companySizeOptions[safeIndex] });
  }
}
