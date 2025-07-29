import { Component, OnInit, Input } from '@angular/core';
import { HyperliquidService, StakingReward } from '../../services/hyperliquid.service';

@Component({
  selector: 'app-staking-history',
  templateUrl: './staking-history.component.html',
  styleUrls: ['./staking-history.component.scss']
})
export class StakingHistoryComponent implements OnInit {
  @Input() walletAddress: string = '';
  
  stakingHistory: StakingReward[] = [];
  loading = false;
  error = '';
  selectedFilter: 'all' | 'staking_reward' | 'unstaking' | 'claim' = 'all';

  constructor(private hyperliquidService: HyperliquidService) {}

  ngOnInit(): void {
    if (this.walletAddress) {
      this.loadStakingHistory();
    }
  }

  ngOnChanges(): void {
    if (this.walletAddress) {
      this.loadStakingHistory();
    }
  }

  loadStakingHistory(): void {
    this.loading = true;
    this.error = '';
    
    this.hyperliquidService.getStakingHistory(this.walletAddress).subscribe({
      next: (history) => {
        this.stakingHistory = history;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement de l\'historique';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  refreshHistory(): void {
    this.loadStakingHistory();
  }

  getFilteredHistory(): StakingReward[] {
    if (this.selectedFilter === 'all') {
      return this.stakingHistory;
    }
    return this.stakingHistory.filter(item => item.type === this.selectedFilter);
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'staking_reward':
        return 'trending_up';
      case 'unstaking':
        return 'trending_down';
      case 'claim':
        return 'account_balance_wallet';
      default:
        return 'swap_horiz';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'staking_reward':
        return 'primary';
      case 'unstaking':
        return 'warn';
      case 'claim':
        return 'accent';
      default:
        return '';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'staking_reward':
        return 'Reward de Staking';
      case 'unstaking':
        return 'Unstaking';
      case 'claim':
        return 'Claim';
      default:
        return type;
    }
  }

  formatAmount(amount: number): string {
    const sign = amount >= 0 ? '+' : '';
    
    // Pour les très petits montants, utiliser plus de décimales
    if (Math.abs(amount) < 0.001) {
      return `${sign}${amount.toFixed(8)} HYPE`;
    } else if (Math.abs(amount) < 0.01) {
      return `${sign}${amount.toFixed(6)} HYPE`;
    } else if (Math.abs(amount) < 1) {
      return `${sign}${amount.toFixed(4)} HYPE`;
    } else {
      return `${sign}${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HYPE`;
    }
  }

  formatAmountOnly(amount: number): string {
    // Pour les très petits montants, utiliser plus de décimales
    if (Math.abs(amount) < 0.001) {
      return amount.toFixed(8);
    } else if (Math.abs(amount) < 0.01) {
      return amount.toFixed(6);
    } else if (Math.abs(amount) < 1) {
      return amount.toFixed(4);
    } else {
      return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  getTotalRewards(): number {
    return this.stakingHistory
      .filter(item => item.type === 'staking_reward')
      .reduce((total, item) => total + item.amount, 0);
  }

  getTotalUnstaking(): number {
    return this.stakingHistory
      .filter(item => item.type === 'unstaking')
      .reduce((total, item) => total + Math.abs(item.amount), 0);
  }
} 