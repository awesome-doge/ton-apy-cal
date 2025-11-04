<script setup lang="ts">
import { BigNumber } from 'bignumber.js';
import { computed } from 'vue';

defineProps<{
  services: Array<{
    id: string;
    name: string;
    data: any;
  }>;
}>()

// Helper function to format TON values
const formatTON = (value: any) => {
  if (!value) return '-';
  return BigNumber(value).div(1e9).toFixed(5);
}

// Helper function to calculate ROI
const calculateROI = (data: any) => {
  // if (!data?.currentRound?.expected || !data?.currentRound?.borrowed ||
  //   !data?.previousRound?.expected || !data?.previousRound?.borrowed) {
  //   return '-';
  // }

  // const totalExpected = BigNumber(data?.currentRound?.expected || 0).plus(data?.previousRound?.expected || 0);
  // const totalBorrowed = BigNumber(data?.currentRound?.borrowed || 0).plus(data?.previousRound?.borrowed || 0);
  // const totalProfit = totalExpected.minus(totalBorrowed);
  // const govFeeFactor = BigNumber(1).minus(BigNumber(data?.governanceFee || 0).div(16777216));
  // console.log('totalBorrowed:', totalBorrowed.toString())
  // console.log('totalProfit:', totalProfit.toString())
  // console.log('govFeeFactor:', govFeeFactor.toString())
  // return totalBorrowed.plus(totalProfit.times(govFeeFactor)).div(totalBorrowed)

  const AtotalExpected = BigNumber(data?.currentRound?.expected || 0)
  const AtotalBorrowed = BigNumber(data?.currentRound?.borrowed || 0)
  const AtotalProfit = AtotalExpected.minus(AtotalBorrowed);
  const BtotalExpected = BigNumber(data?.previousRound?.expected || 0)
  const BtotalBorrowed = BigNumber(data?.previousRound?.borrowed || 0)
  const BtotalProfit = BtotalExpected.minus(BtotalBorrowed);
  const govFeeFactor = BigNumber(1).minus(BigNumber(data?.governanceFee || 0).div(16777216));
  console.log(govFeeFactor.toString(), BigNumber(data?.governanceFee || 0).div(16777216).toString())
  return AtotalBorrowed.plus(BtotalBorrowed).plus(AtotalProfit.plus(BtotalProfit).times(govFeeFactor)).div(AtotalBorrowed.plus(BtotalBorrowed))

}

// Helper function to calculate APY
const calculateAPY = (data: any) => {
  const rounds = 481 / 2
  const roi = calculateROI(data);
  if (roi === '-') return '-';

  // APY = (ROI)^(rounds per year) - 1
  // Split 240.6 into integer and decimal parts
  const integerPart = Math.floor(rounds); // 240
  const decimalPart = rounds - integerPart; // 0.6

  try {
    // Calculate roi^240
    let result = roi.pow(integerPart);

    // Calculate roi^0.6, using formula: x^y = e^(y * ln(x))
    // Convert to: roi^0.6 = Math.exp(0.6 * Math.log(roi))
    // We need to convert to regular JavaScript number for calculation
    const roiNum = parseFloat(roi.toString());
    if (roiNum <= 0) {
      return '-'; // Handle negative or zero case
    }

    const decimalPower = Math.exp(decimalPart * Math.log(roiNum));

    // Final result = roi^240 * roi^0.6
    result = result.times(decimalPower);

    // Calculate APY = (result - 1) * 100
    return result.minus(1).times(100).toFixed(8)
  } catch (error) {
    console.error('APY calculation error:', error);
    return '-';
  }
}

// Helper function to calculate TVL (Total Value Locked)
const calculateTVL = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.totalBalance) {
    return formatTON(data.totalBalance);
  }

  // For Hipo
  if (data.totalCoins) {
    return formatTON(data.totalCoins);
  }

  // For Bemo - tonTotalSupply is already in TON (not nanoTON)
  if (data.tonTotalSupply) {
    return BigNumber(data.tonTotalSupply).toFixed(2);
  }

  return '-';
}

// Helper function to calculate Token Exchange Rate
const calculateExchangeRate = (data: any) => {
  if (!data) return '-';

  try {
    // KTON/TonStakers/Stakee
    if (data.totalBalance && data.poolJettonSupply) {
      return BigNumber(data.totalBalance)
        .div(data.poolJettonSupply)
        .toFixed(6);
    }

    // Hipo
    if (data.totalCoins && data.totalTokens) {
      return BigNumber(data.totalCoins)
        .div(data.totalTokens)
        .toFixed(6);
    }

    // Bemo
    if (data.tonTotalSupply && data.jettonTotalSupply) {
      return BigNumber(data.tonTotalSupply)
        .div(data.jettonTotalSupply)
        .toFixed(6);
    }
  } catch (error) {
    console.error('Exchange rate calculation error:', error);
  }

  return '-';
}

// Helper function to get Actual Round Profit
const getActualProfit = (data: any, roundType: 'current' | 'previous') => {
  if (!data) return '-';

  const round = roundType === 'current' ? data.currentRound : data.previousRound;

  // For KTON/TonStakers/Stakee - use profit field if available
  if (round?.profit !== undefined && round?.profit !== null) {
    return formatTON(round.profit);
  }

  // Fallback to calculated interest
  if (round?.expected && round?.borrowed) {
    return formatTON(BigNumber(round.expected).minus(round.borrowed));
  }

  return '-';
}

// Helper function to get Active Borrowers Count
const getActiveBorrowers = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.currentRound?.activeBorrowers !== undefined) {
    return data.currentRound.activeBorrowers.toString();
  }

  // For Hipo - we don't have this data directly
  return '-';
}

// Helper function to calculate Pool Utilization Rate
const calculateUtilizationRate = (data: any) => {
  if (!data) return '-';

  try {
    let totalBorrowed = BigNumber(0);
    let totalBalance = BigNumber(0);

    // KTON/TonStakers/Stakee
    if (data.totalBalance) {
      totalBalance = BigNumber(data.totalBalance);
      totalBorrowed = BigNumber(data.currentRound?.borrowed || 0)
        .plus(data.previousRound?.borrowed || 0);
    }
    // Hipo
    else if (data.totalCoins) {
      totalBalance = BigNumber(data.totalCoins);
      totalBorrowed = BigNumber(data.previousRound?.borrowed || 0);
    }

    if (totalBalance.isZero()) return '-';

    return totalBorrowed.div(totalBalance).times(100).toFixed(2) + '%';
  } catch (error) {
    console.error('Utilization rate calculation error:', error);
    return '-';
  }
}

// Helper function to get Instant Withdrawal Fee
const getInstantWithdrawalFee = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.instantWithdrawalFee !== undefined && data.instantWithdrawalFee !== null) {
    const feePercent = (data.instantWithdrawalFee / 16777216 * 100).toFixed(2);
    return feePercent + '%';
  }

  return '-';
}

// Helper function to get Accrued Governance Fee
const getAccruedFees = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.accruedGovernanceFee) {
    return formatTON(data.accruedGovernanceFee);
  }

  // For Bemo - commission total supply
  if (data.commissionTotalSupply) {
    return BigNumber(data.commissionTotalSupply).toFixed(5);
  }

  return '-';
}

// Helper function to get Pending Deposits
const getPendingDeposits = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.requestedForDeposit) {
    return formatTON(data.requestedForDeposit);
  }

  return '-';
}

// Helper function to get Pending Withdrawals
const getPendingWithdrawals = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.requestedForWithdrawal) {
    return formatTON(data.requestedForWithdrawal);
  }

  return '-';
}

// Helper function to get Min Loan
const getMinLoan = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.minLoan) {
    return formatTON(data.minLoan);
  }

  return '-';
}

// Helper function to get Max Loan
const getMaxLoan = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.maxLoan) {
    return formatTON(data.maxLoan);
  }

  return '-';
}

// Helper function to get Pool Status
const getPoolStatus = (data: any) => {
  if (!data) return { text: '-', class: '' };

  // For KTON/TonStakers/Stakee
  if (data.halted !== undefined) {
    if (data.halted) {
      return { text: '🔴 Halted', class: 'status-error' };
    }
    return { text: '🟢 Active', class: 'status-success' };
  }

  // For Hipo
  if (data.stopped !== undefined) {
    if (data.stopped) {
      return { text: '🔴 Stopped', class: 'status-error' };
    }
    return { text: '🟢 Active', class: 'status-success' };
  }

  return { text: '🟢 Active', class: 'status-success' };
}

// Helper function to get Deposits Status
const getDepositsStatus = (data: any) => {
  if (!data) return { text: '-', class: '' };

  // For KTON/TonStakers/Stakee
  if (data.depositsOpen !== undefined) {
    if (data.depositsOpen) {
      return { text: '✓ Open', class: 'status-success' };
    }
    return { text: '✗ Closed', class: 'status-warning' };
  }

  // Default for Hipo (usually open)
  return { text: '✓ Open', class: 'status-success' };
}

// Helper function to get Pool Jetton Supply
const getPoolJettonSupply = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.poolJettonSupply) {
    return formatTON(data.poolJettonSupply);
  }

  // For Hipo
  if (data.totalTokens) {
    return formatTON(data.totalTokens);
  }

  // For Bemo
  if (data.jettonTotalSupply) {
    return BigNumber(data.jettonTotalSupply).toFixed(5);
  }

  return '-';
}

// Helper function to get Projected Balance
const getProjectedBalance = (data: any) => {
  if (!data) return '-';

  // For KTON/TonStakers/Stakee
  if (data.projectedTotalBalance) {
    return formatTON(data.projectedTotalBalance);
  }

  return '-';
}

// Helper function to get Total Staking/Unstaking (Hipo)
const getTotalStaking = (data: any) => {
  if (!data) return '-';

  if (data.totalStaking) {
    return formatTON(data.totalStaking);
  }

  return '-';
}

const getTotalUnstaking = (data: any) => {
  if (!data) return '-';

  if (data.totalUnstaking) {
    return formatTON(data.totalUnstaking);
  }

  return '-';
}

// Helper function to get Bemo Lockup Info
const getBemoCurrentLockup = (data: any) => {
  if (!data) return '-';

  if (data.lockupSupply) {
    return BigNumber(data.lockupSupply).toFixed(5);
  }

  return '-';
}

const getBemoNextLockup = (data: any) => {
  if (!data) return '-';

  if (data.nextLockupSupply) {
    return BigNumber(data.nextLockupSupply).toFixed(5);
  }

  return '-';
}

const getBemoLaterLockup = (data: any) => {
  if (!data) return '-';

  if (data.laterLockupSupply) {
    return BigNumber(data.laterLockupSupply).toFixed(5);
  }

  return '-';
}

// Helper function to get Risk Metrics
const getDisbalanceTolerance = (data: any) => {
  if (!data) return '-';

  if (data.disbalanceTolerance !== undefined) {
    return data.disbalanceTolerance.toString() + '%';
  }

  return '-';
}

const getSurplus = (data: any) => {
  if (!data) return '-';

  if (data.surplus) {
    return formatTON(data.surplus);
  }

  return '-';
}

// Helper function to format timing data
const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return '-';

  try {
    const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    const date = new Date(ts * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '-';
  }
}

const getCurrentRoundSince = (data: any) => {
  if (!data?.times?.currentRoundSince) return '-';
  return formatTimestamp(data.times.currentRoundSince);
}

const getParticipateUntil = (data: any) => {
  if (!data?.times?.participateSince) return '-';
  return formatTimestamp(data.times.participateSince);
}

const getNextRoundSince = (data: any) => {
  if (!data?.times?.nextRoundSince) return '-';
  return formatTimestamp(data.times.nextRoundSince);
}
</script>

<template>
  <div class="comparison-container">
    <h2>APY Comparison</h2>

    <div class="comparison-table-wrapper">
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="metric-name">Metrics</th>
            <th v-for="service in services" :key="service.id">{{ service.name }}</th>
          </tr>
        </thead>
        <tbody>
          <!-- Pool Status -->
          <tr>
            <td class="metric-name">Pool Status</td>
            <td v-for="service in services" :key="service.id">
              <span :class="['status-badge', getPoolStatus(service.data).class]">
                {{ getPoolStatus(service.data).text }}
              </span>
            </td>
          </tr>

          <!-- Deposits Status -->
          <tr>
            <td class="metric-name">Deposits Status</td>
            <td v-for="service in services" :key="service.id">
              <span :class="['status-badge', getDepositsStatus(service.data).class]">
                {{ getDepositsStatus(service.data).text }}
              </span>
            </td>
          </tr>

          <!-- Governance Fee -->
          <tr>
            <td class="metric-name">Governance Fee</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data.governanceFee || '-' }}
            </td>
          </tr>

          <!-- Accrued Governance Fees -->
          <tr>
            <td class="metric-name">Accrued Fees (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ getAccruedFees(service.data) }}
            </td>
          </tr>

          <!-- Instant Withdrawal Fee -->
          <tr>
            <td class="metric-name">Instant Withdrawal Fee</td>
            <td v-for="service in services" :key="service.id">
              {{ getInstantWithdrawalFee(service.data) }}
            </td>
          </tr>

          <!-- Interest Rate -->
          <tr>
            <td class="metric-name">Interest Rate</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data.interestRate || '-' }}
            </td>
          </tr>

          <!-- TVL (Total Value Locked) -->
          <tr>
            <td class="metric-name">Total Value Locked (TON)</td>
            <td v-for="service in services" :key="service.id" class="highlight-cell">
              {{ calculateTVL(service.data) }}
            </td>
          </tr>

          <!-- Pool Jetton Supply -->
          <tr>
            <td class="metric-name">Pool Jetton Supply</td>
            <td v-for="service in services" :key="service.id">
              {{ getPoolJettonSupply(service.data) }}
            </td>
          </tr>

          <!-- Projected Balance -->
          <tr>
            <td class="metric-name">Projected Balance (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ getProjectedBalance(service.data) }}
            </td>
          </tr>

          <!-- Token Exchange Rate -->
          <tr>
            <td class="metric-name">Exchange Rate (1 stTON)</td>
            <td v-for="service in services" :key="service.id">
              {{ calculateExchangeRate(service.data) }} TON
            </td>
          </tr>

          <!-- Pool Utilization Rate -->
          <tr>
            <td class="metric-name">Pool Utilization Rate</td>
            <td v-for="service in services" :key="service.id">
              {{ calculateUtilizationRate(service.data) }}
            </td>
          </tr>

          <!-- Active Borrowers -->
          <tr>
            <td class="metric-name">Active Borrowers</td>
            <td v-for="service in services" :key="service.id">
              {{ getActiveBorrowers(service.data) }}
            </td>
          </tr>

          <!-- Validator Loan Limits -->
          <tr>
            <td class="metric-name">Min Loan per Validator (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ getMinLoan(service.data) }}
            </td>
          </tr>

          <tr>
            <td class="metric-name">Max Loan per Validator (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ getMaxLoan(service.data) }}
            </td>
          </tr>

          <!-- Pending Deposits/Withdrawals -->
          <tr>
            <td class="metric-name">Pending Deposits (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ getPendingDeposits(service.data) }}
            </td>
          </tr>

          <tr>
            <td class="metric-name">Pending Withdrawals (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ getPendingWithdrawals(service.data) }}
            </td>
          </tr>

          <!-- Hipo Staking/Unstaking Flow -->
          <tr>
            <td class="metric-name">Total Staking (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ getTotalStaking(service.data) }}
            </td>
          </tr>

          <tr>
            <td class="metric-name">Total Unstaking (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ getTotalUnstaking(service.data) }}
            </td>
          </tr>

          <!-- Bemo Lockup Information -->
          <tr>
            <td class="metric-name">Current Epoch Locked</td>
            <td v-for="service in services" :key="service.id">
              {{ getBemoCurrentLockup(service.data) }}
            </td>
          </tr>

          <tr>
            <td class="metric-name">Next Epoch Locked</td>
            <td v-for="service in services" :key="service.id">
              {{ getBemoNextLockup(service.data) }}
            </td>
          </tr>

          <tr>
            <td class="metric-name">Future Locked</td>
            <td v-for="service in services" :key="service.id">
              {{ getBemoLaterLockup(service.data) }}
            </td>
          </tr>

          <!-- Risk Indicators -->
          <tr>
            <td class="metric-name">Disbalance Tolerance</td>
            <td v-for="service in services" :key="service.id">
              {{ getDisbalanceTolerance(service.data) }}
            </td>
          </tr>

          <tr>
            <td class="metric-name">Contract Surplus (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ getSurplus(service.data) }}
            </td>
          </tr>

          <!-- Hipo Timing Information -->
          <tr>
            <td class="metric-name">Current Round Since</td>
            <td v-for="service in services" :key="service.id">
              {{ getCurrentRoundSince(service.data) }}
            </td>
          </tr>

          <tr>
            <td class="metric-name">Participate Until</td>
            <td v-for="service in services" :key="service.id">
              {{ getParticipateUntil(service.data) }}
            </td>
          </tr>

          <tr>
            <td class="metric-name">Next Round Since</td>
            <td v-for="service in services" :key="service.id">
              {{ getNextRoundSince(service.data) }}
            </td>
          </tr>

          <!-- Previous Round Borrowed -->
          <tr>
            <td class="metric-name">Previous Round Borrowed (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.previousRound?.borrowed ? formatTON(service.data.previousRound.borrowed) : '-' }}
            </td>
          </tr>

          <!-- Previous Round Expected -->
          <tr>
            <td class="metric-name">Previous Round Expected (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.previousRound?.expected ? formatTON(service.data.previousRound.expected) : '-' }}
            </td>
          </tr>
          <tr>
            <td class="metric-name">Previous Round Interest (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.previousRound?.expected && service.data?.previousRound?.borrowed ?
                formatTON(BigNumber(service.data.previousRound.expected).minus(service.data.previousRound.borrowed)) : '-'
              }}
            </td>
          </tr>

          <!-- Previous Round Actual Profit -->
          <tr>
            <td class="metric-name">Previous Round Profit (TON)</td>
            <td v-for="service in services" :key="service.id" class="profit-cell">
              {{ getActualProfit(service.data, 'previous') }}
            </td>
          </tr>
          <!-- Current Round Borrowed -->
          <tr>
            <td class="metric-name">Current Round Borrowed (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.currentRound?.borrowed ? formatTON(service.data.currentRound.borrowed) : '-' }}
            </td>
          </tr>

          <!-- Current Round Expected -->
          <tr>
            <td class="metric-name">Current Round Expected (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.currentRound?.expected ? formatTON(service.data.currentRound.expected) : '-' }}
            </td>
          </tr>
          <tr>
            <td class="metric-name">Current Round Interest (TON)</td>
            <td v-for="service in services" :key="service.id">
              {{ service.data?.currentRound?.expected && service.data?.currentRound?.borrowed ?
                formatTON(BigNumber(service.data.currentRound.expected).minus(service.data.currentRound.borrowed)) : '-'
              }}
            </td>
          </tr>

          <!-- Current Round Actual Profit -->
          <tr>
            <td class="metric-name">Current Round Profit (TON)</td>
            <td v-for="service in services" :key="service.id" class="profit-cell">
              {{ getActualProfit(service.data, 'current') }}
            </td>
          </tr>

          <tr>
            <td class="metric-name">Round ROI</td>
            <td v-for="service in services" :key="service.id">
              {{ calculateROI(service.data) }}
            </td>
          </tr>
          <tr>
            <td class="metric-name">APY (%)</td>
            <td v-for="service in services" :key="service.id" class="apy-cell">
              {{ calculateAPY(service.data) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.comparison-container {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  color: #0062cc;
  margin-bottom: 1rem;
  font-weight: 500;
  text-align: center;
}

.comparison-table-wrapper {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.comparison-table th,
.comparison-table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid #eaeaea;
  color: #333;
}

.comparison-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #333;
}

.comparison-table tbody tr:hover {
  background-color: #f9fafc;
}

.metric-name {
  text-align: left;
  font-weight: 500;
  color: #666;
}

.apy-cell {
  font-weight: 700;
  color: #0062cc;
}

.highlight-cell {
  font-weight: 600;
  color: #28a745;
  background-color: #f0f9ff;
}

.profit-cell {
  font-weight: 600;
  color: #17a2b8;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-success {
  background-color: #d4edda;
  color: #155724;
}

.status-error {
  background-color: #f8d7da;
  color: #721c24;
}

.status-warning {
  background-color: #fff3cd;
  color: #856404;
}

@media (max-width: 768px) {
  .comparison-container {
    padding: 1rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 0.5rem;
  }
}
</style>