import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HyperliquidService, DelegationInfo, HypePrice, StakingReward } from '../../services/hyperliquid.service';
import { Subscription } from 'rxjs';

interface ChartData {
  date: string;
  amount: number;
}

@Component({
  selector: 'app-staked-balance',
  templateUrl: './staked-balance.component.html',
  styleUrls: ['./staked-balance.component.scss']
})
export class StakedBalanceComponent implements OnInit, OnDestroy {
  @Input() walletAddress: string = '';

  stakingInfo: DelegationInfo | null = null;
  hypePrice: HypePrice | null = null;
  loading = true;
  error = false;
  chartData: ChartData[] = [];
  private priceSubscription: Subscription | null = null;

  constructor(private hyperliquidService: HyperliquidService) {}

  ngOnInit(): void {
    if (this.walletAddress) {
      this.loadStakingInfo();
      this.startPriceUpdates();
    }
  }

  ngOnDestroy(): void {
    if (this.priceSubscription) {
      this.priceSubscription.unsubscribe();
    }
  }

  private loadStakingInfo(): void {
    this.loading = true;
    this.error = false;

    this.hyperliquidService.getStakingInfo(this.walletAddress).subscribe({
      next: (info) => {
        this.stakingInfo = info;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des infos de staking:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private startPriceUpdates(): void {
    // Mettre à jour le prix toutes les 30 secondes
    this.priceSubscription = this.hyperliquidService.getHypePriceWithUpdates(30000).subscribe({
      next: (price) => {
        this.hypePrice = price;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du prix:', error);
      }
    });
  }

  private prepareChartData(): void {
    if (!this.stakingInfo?.rewards.length) {
      this.chartData = [];
      return;
    }

    // Debug: afficher les rewards bruts
    console.log('Raw rewards data:', this.stakingInfo.rewards);

    // Grouper les rewards par jour pour le graphique
    const rewardsByDay = new Map<string, number>();
    
    this.stakingInfo.rewards.forEach(reward => {
      const date = new Date(reward.timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
      
      const current = rewardsByDay.get(date) || 0;
      rewardsByDay.set(date, current + reward.amount);
    });

    // Debug: afficher les données groupées
    console.log('Grouped rewards by day:', Array.from(rewardsByDay.entries()));

    // Convertir en format pour le graphique (derniers 7 jours)
    this.chartData = Array.from(rewardsByDay.entries())
      .map(([date, amount]) => ({
        date,
        amount: parseFloat(amount.toFixed(8))
      }))
      .slice(-7);
      
    // Debug: afficher les données finales
    console.log('Final chart data:', this.chartData);
  }

  getTotalValueUSD(): number {
    if (!this.stakingInfo || !this.hypePrice) return 0;
    return this.stakingInfo.totalStaked * this.hypePrice.usd;
  }

  getPriceChangeClass(): string {
    if (!this.hypePrice) return '';
    return this.hypePrice.usd_24h_change >= 0 ? 'positive' : 'negative';
  }

  getPriceChangeIcon(): string {
    if (!this.hypePrice) return 'trending_flat';
    return this.hypePrice.usd_24h_change >= 0 ? 'trending_up' : 'trending_down';
  }

  formatPrice(price: number): string {
    return price.toFixed(4);
  }

  formatPriceChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }

  formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  getTotalRewards(): number {
    if (!this.stakingInfo?.rewards) return 0;
    return this.stakingInfo.rewards.reduce((total, reward) => total + reward.amount, 0);
  }

  getLockedUntilDate(): string | null {
    if (!this.stakingInfo?.lockedUntil) return null;
    
    // Si lockedUntil est un timestamp en secondes, le convertir en millisecondes
    const lockedUntilMs = this.stakingInfo.lockedUntil > 1000000000000 
      ? this.stakingInfo.lockedUntil 
      : this.stakingInfo.lockedUntil * 1000;
    
    const date = new Date(lockedUntilMs);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    // Debug: afficher les informations de date
    console.log('Lock date calculation:', {
      originalLockedUntil: this.stakingInfo.lockedUntil,
      lockedUntilMs: lockedUntilMs,
      lockedUntilDate: date,
      now: now,
      diffInMs: diffInMs,
      diffInDays: diffInDays
    });
    
    if (diffInDays <= 0) {
      return 'Déverrouillé';
    } else if (diffInDays === 1) {
      return 'Déverrouillage demain';
    } else {
      return `Déverrouillage dans ${diffInDays} jours`;
    }
  }

  isLocked(): boolean {
    if (!this.stakingInfo?.lockedUntil) return false;
    return new Date(this.stakingInfo.lockedUntil) > new Date();
  }

  getChartHeight(): number {
    if (!this.chartData.length) return 0;
    return 150; // Hauteur fixe
  }

  getBarHeight(amount: number): number {
    if (!this.chartData.length) return 0;
    const maxAmount = Math.max(...this.chartData.map(d => d.amount));
    
    // Debug: afficher les valeurs
    console.log('Bar height calculation:', {
      amount,
      maxAmount,
      chartData: this.chartData.map(d => ({ date: d.date, amount: d.amount }))
    });
    
    // Si toutes les valeurs sont 0, afficher une hauteur minimale
    if (maxAmount === 0) {
      return 20; // 20% de hauteur minimale
    }
    
    // Pour les très petites valeurs, utiliser une échelle plus appropriée
    // Si la valeur max est très petite (< 0.001), utiliser une échelle fixe
    let scaleMax;
    if (maxAmount < 0.001) {
      scaleMax = 0.001; // Échelle fixe pour les très petites valeurs
    } else {
      scaleMax = maxAmount * 1.5; // 1.5x la valeur max pour les autres cas
    }
    
    const relativeHeight = (amount / scaleMax) * 100;
    const finalHeight = Math.max(15, Math.min(100, relativeHeight));
    
    console.log('Height calculation:', {
      scaleMax,
      relativeHeight,
      finalHeight
    });
    
    return finalHeight; // Entre 15% et 100%
  }

  getTotalRewardsValueUSD(): number {
    if (!this.hypePrice) return 0;
    return this.getTotalRewards() * this.hypePrice.usd;
  }

  getMaxChartValue(): number {
    if (!this.chartData.length) return 0;
    const maxAmount = Math.max(...this.chartData.map(d => d.amount));
    
    // Utiliser la même logique que getBarHeight
    if (maxAmount < 0.001) {
      return 0.001; // Échelle fixe pour les très petites valeurs
    } else {
      return maxAmount * 1.5; // 1.5x la valeur max pour les autres cas
    }
  }

  getMinChartValue(): number {
    if (!this.chartData.length) return 0;
    return 0; // Toujours commencer à 0
  }

  getMidChartValue(): number {
    const max = this.getMaxChartValue();
    return max * 0.5; // Moitié de l'échelle max
  }

  getLinePoints(): string {
    if (!this.chartData.length) return '';
    
    const points = this.chartData.map((item, index) => {
      const x = (index / (this.chartData.length - 1)) * 100;
      const y = 100 - this.getBarHeight(item.amount); // Inverser Y pour SVG
      return `${x},${y}`;
    });
    
    return points.join(' ');
  }

  formatChartValue(value: number): string {
    // Pour l'affichage de l'axe Y, afficher les vraies valeurs
    if (value < 0.0001) {
      return value.toFixed(8);
    } else if (value < 0.001) {
      return value.toFixed(6);
    } else if (value < 0.01) {
      return value.toFixed(4);
    } else {
      return value.toFixed(2);
    }
  }

  refreshData(): void {
    this.loadStakingInfo();
  }

  refreshStakingInfo(): void {
    this.loadStakingInfo();
  }
} 