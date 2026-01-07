import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  SearchResult,
  SearchResultPayload
} from '../../../core/services/search-result.service';

type FormTab = 'general' | 'icp' | 'buyer';

@Component({
  selector: 'app-search-result-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-result-form.component.html',
  styleUrl: './search-result-form.component.scss'
})
export class SearchResultFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() result: SearchResult | null = null;
  @Input() submitLabel = 'Guardar';
  @Output() save = new EventEmitter<SearchResultPayload>();
  @Output() cancel = new EventEmitter<void>();

  readonly activeTab = signal<FormTab>('general');
  readonly originalLink = signal('');
  readonly industryOptions = [
    'Tecnologia',
    'Software',
    'Marketing Digital',
    'SaaS',
    'Fintech',
    'E-commerce',
    'Consultoria'
  ];
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
  readonly buyerChannelOptions = ['LinkedIn', 'Email', 'Telefono', 'WhatsApp', 'Webinars'];
  readonly companySizeIndex = signal(this.defaultCompanySizeIndex);

  readonly form = this.fb.nonNullable.group({
    title: [''],
    displayedLink: [''],
    redirectLink: [''],
    source: [''],
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
    buyerPersonaChannels: [[] as string[]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['result']) {
      return;
    }

    if (!this.result) {
      this.resetForm();
      return;
    }

    this.originalLink.set(this.result.link || '');
    this.form.patchValue({
      title: this.result.title || '',
      displayedLink: this.result.displayed_link || '',
      redirectLink: this.result.redirect_link || '',
      source: this.result.source || '',
      icpIndustries: this.result.icp_industries || [],
      icpCompanySize: this.result.icp_company_size || '',
      icpTargetCountry: this.result.icp_target_country || '',
      icpTargetCity: this.result.icp_target_city || '',
      icpIndustryPain: this.result.icp_industry_pain || '',
      icpCompetitors: this.result.icp_competitors || [],
      icpCurrentCustomers: this.result.icp_current_customers || [],
      buyerPersonaName: this.result.buyer_persona_name || '',
      buyerPersonaAge:
        this.result.buyer_persona_age === null || this.result.buyer_persona_age === undefined
          ? ''
          : String(this.result.buyer_persona_age),
      buyerPersonaRole: this.result.buyer_persona_role || '',
      buyerPersonaCompanyType: this.result.buyer_persona_company_type || '',
      buyerPersonaLocation: this.result.buyer_persona_location || '',
      buyerPersonaGoals: this.result.buyer_persona_goals || '',
      buyerPersonaPainPoints: this.result.buyer_persona_pain_points || '',
      buyerPersonaBuyingBehavior: this.result.buyer_persona_buying_behavior || '',
      buyerPersonaChannels: this.result.buyer_persona_channels || []
    });
    this.setCompanySizeFromValue(this.result.icp_company_size);
  }

  setTab(tab: FormTab): void {
    this.activeTab.set(tab);
  }

  onSubmit(): void {
    this.save.emit(this.form.getRawValue());
  }

  onCompanySizeChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.setCompanySizeByIndex(value);
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
      return `${location} - ${ageValue} anos`;
    }

    return location || `${ageValue} anos`;
  }

  resetForm(): void {
    this.form.reset({
      title: '',
      displayedLink: '',
      redirectLink: '',
      source: '',
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
      buyerPersonaChannels: []
    });
    this.originalLink.set('');
    this.setCompanySizeByIndex(this.defaultCompanySizeIndex);
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
