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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Company, CompanyPayload } from '../../../core/services/company.service';

type FormTab = 'general' | 'icp' | 'buyer';

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
