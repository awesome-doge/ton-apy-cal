<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getKTONPool } from './service/kton';
import { getTonStakersPool } from './service/tonstakers';
import { getStakeePool } from './service/stakee';
import StakingTable from './components/StakingTable.vue';
import ComparisonTable from './components/ComparisonTable.vue';
import { getHipoTreasury } from './service/hipo';
import { BigNumber } from 'bignumber.js';
import { getBemoFinancial, getBemoNominatorProxy, getBemoNominatorPool } from './service/bemo';
import { Address } from '@ton/core';
const ktonData = ref({})
const tonStakersData = ref({})
const stakeeData = ref({})
const hipoData = ref({})
const bemoData = ref({})
const loading = ref(true)
const showComparison = ref(true) // Default to showing comparison view

// Aggregated data for comparison
const stakingServices = ref([
  { id: 'kton', name: 'KTON', data: ktonData },
  { id: 'tonstakers', name: 'Ton Stakers', data: tonStakersData },
  { id: 'hipo', name: 'Hipo', data: hipoData },
  { id: 'stakee', name: 'Stakee', data: stakeeData }
])

onMounted(async () => {
  try {
    loading.value = true;
    ktonData.value = await getKTONPool();
    tonStakersData.value = await getTonStakersPool();
    stakeeData.value = await getStakeePool();
    hipoData.value = await getHipoTreasury().then(res => {
      console.log(res.parent.toString())
      const newData = {
        governanceFee: 0,
        currentRound: {
          expected: 0,
          borrowed: 0
        },
        previousRound: {
          expected: res.lastRecovered,
          borrowed: res.lastStaked
        },
        interestRate: '-'
      }
      return newData
    }
    );
    // bemoData.value = await getBemoFinancial();
    // const nominatorProxy = await getBemoNominatorProxy();
    //console.log('nominatorProxy:', nominatorProxy)
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }

});
</script>

<template>
  <div class="container">
    <h1>Round ROI & APY Calculator</h1>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading data...</p>
    </div>

    <div v-else>
      <!-- View toggle buttons -->
      <!-- <div class="view-toggle">
        <button @click="showComparison = true" :class="{ active: showComparison }">
          Comparison View
        </button>
      </div> -->

      <!-- Comparison view -->
      <ComparisonTable :services="stakingServices" />

    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', 'Avenir', Helvetica, Arial, sans-serif;
}

h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #0062cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.view-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.view-toggle button {
  background-color: #f5f7fa;
  border: 1px solid #ddd;
  color: #666;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle button:first-child {
  border-radius: 4px 0 0 4px;
}

.view-toggle button:last-child {
  border-radius: 0 4px 4px 0;
}

.view-toggle button.active {
  background-color: #0062cc;
  color: white;
  border-color: #0062cc;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .view-toggle button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
