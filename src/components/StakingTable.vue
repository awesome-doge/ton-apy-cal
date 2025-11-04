<script setup lang="ts">
import { BigNumber } from 'bignumber.js';
import { adaptData, formatTON, PoolConfig } from './DataAdapter';
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  data: any;
  config?: PoolConfig;
  rounds?: number;
}>();

// Use adapter to transform data
const standardizedData = computed(() => {
  return adaptData(props.data, props.config || {});
});

// Calculate previous round interest
const prevRoundInterest = computed(() => {
  if (!standardizedData.value.previousRound?.expected || !standardizedData.value.previousRound?.borrowed) {
    return '-';
  }
  const interest = BigNumber(standardizedData.value.previousRound.expected)
    .minus(standardizedData.value.previousRound.borrowed);
  return formatTON(interest);
});

// Calculate current round interest
const currentRoundInterest = computed(() => {
  if (!standardizedData.value.currentRound?.expected || !standardizedData.value.currentRound?.borrowed) {
    return '-';
  }
  const interest = BigNumber(standardizedData.value.currentRound.expected)
    .minus(standardizedData.value.currentRound.borrowed);
  return formatTON(interest);
});
</script>

<template>
  <div class="table-container">
    <h2>{{ title }}</h2>
    <table class="data-table">
      <tbody>
        <tr>
          <td class="label">Governance Fee</td>
          <td class="value">{{ standardizedData.governanceFee || '-' }}</td>
        </tr>
        <tr>
          <td class="label">Interest Rate</td>
          <td class="value">{{ standardizedData.interestRate || '-' }}</td>
        </tr>
        <tr>
          <td class="label">Previous Round Borrowed (TON)</td>
          <td class="value">{{ standardizedData.previousRound?.borrowed ?
            formatTON(standardizedData.previousRound.borrowed) : '-' }}</td>
        </tr>
        <tr>
          <td class="label">Previous Round Expected (TON)</td>
          <td class="value">{{ standardizedData.previousRound?.expected ?
            formatTON(standardizedData.previousRound.expected) : '-' }}</td>
        </tr>
        <tr>
          <td class="label">Previous Round Interest (TON)</td>
          <td class="value">{{ prevRoundInterest }}</td>
        </tr>
        <tr>
          <td class="label">Current Round Borrowed (TON)</td>
          <td class="value">{{ standardizedData.currentRound?.borrowed ?
            formatTON(standardizedData.currentRound.borrowed) : '-' }}</td>
        </tr>
        <tr>
          <td class="label">Current Round Expected (TON)</td>
          <td class="value">{{ standardizedData.currentRound?.expected ?
            formatTON(standardizedData.currentRound.expected) : '-' }}</td>
        </tr>
        <tr>
          <td class="label">Current Round Interest (TON)</td>
          <td class="value">{{ currentRoundInterest }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s;
}

.table-container:hover {
  transform: translateY(-5px);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table tr {
  border-bottom: 1px solid #eaeaea;
}

.data-table tr:last-child {
  border-bottom: none;
}

.data-table td {
  padding: 0.75rem 0;
}

.label {
  color: #666;
  font-weight: 500;
  width: 40%;
}

.value {
  color: #333;
  font-weight: 600;
  text-align: right;
}

h2 {
  font-size: 1.5rem;
  color: #0062cc;
  margin-bottom: 1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .table-container {
    padding: 1rem;
  }

  h2 {
    font-size: 1.2rem;
  }
}
</style>