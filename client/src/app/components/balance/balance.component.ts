import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HyperliquidService, HypeBalance } from '../../services/hyperliquid.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, OnChanges {
  @Input() walletAddress: string = '';
  balance: HypeBalance | null = null;
  loading = false;
  error = '';
  stakingStats: any = null;

  constructor(private hyperliquidService: HyperliquidService) {}

  ngOnInit(): void {
    if (this.walletAddress) {
      this.loadBalance();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['walletAddress'] && this.walletAddress) {
      this.loadBalance();
    }
  }

  loadBalance(): void {
    this.loading = true;
    this.error = '';
    
    // Charger le solde et les stats en parallèle
    this.hyperliquidService.getHypeBalance(this.walletAddress).subscribe({
      next: (balance) => {
        this.balance = balance;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement du solde';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });

    // Charger les statistiques de staking
    this.hyperliquidService.getStakingStats(this.walletAddress).subscribe({
      next: (stats) => {
        this.stakingStats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stats:', error);
      }
    });
  }

  refreshBalance(): void {
    this.loadBalance();
  }

  formatNumber(value: number): string {
    // Pour les très petits montants, utiliser plus de décimales
    if (Math.abs(value) < 0.001) {
      return value.toFixed(8);
    } else if (Math.abs(value) < 0.01) {
      return value.toFixed(6);
    } else if (Math.abs(value) < 1) {
      return value.toFixed(4);
    } else {
      return value.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
  }

  formatUSD(value: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(value);
  }

  getAPY(): string {
    return this.stakingStats?.apy ? `${this.stakingStats.apy}%` : '8.5%';
  }

  getDuration(): string {
    return this.stakingStats?.stakingDuration ? `${this.stakingStats.stakingDuration}j` : '30j';
  }

  getStakedAmount(): string {
    return this.stakingStats?.totalStaked ? this.formatNumber(this.stakingStats.totalStaked) : '0';
  }
} 