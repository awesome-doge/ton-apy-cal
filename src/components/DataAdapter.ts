import { BigNumber } from 'bignumber.js';

export interface StandardizedData {
    governanceFee: string | number;
    interestRate: string | number;
    currentRound: {
        borrowed: number;
        expected: number;
    };
    previousRound: {
        borrowed: number;
        expected: number;
    };
}

export interface PoolConfig {
    // Data mapping configuration
    governanceFeeField?: string;
    interestRateField?: string;
    currentRoundBorrowedField?: string;
    currentRoundExpectedField?: string;
    previousRoundBorrowedField?: string;
    previousRoundExpectedField?: string;
    // Transform functions
    governanceFeeTransform?: (value: any) => any;
    interestRateTransform?: (value: any) => any;
    currentRoundBorrowedTransform?: (value: any) => any;
    currentRoundExpectedTransform?: (value: any) => any;
    previousRoundBorrowedTransform?: (value: any) => any;
    previousRoundExpectedTransform?: (value: any) => any;
}

/**
 * Convert arbitrary data structure to standard format
 * @param data Raw data
 * @param config Configuration options
 * @returns Standardized data
 */
export function adaptData(data: any, config: PoolConfig = {}): StandardizedData {
    const defaultValue = (value: any, defaultVal: any = 0) => {
        return value !== undefined && value !== null ? value : defaultVal;
    };

    // Extract data via configuration or use default path
    const getValue = (obj: any, path: string | undefined, defaultPath: string, transform?: (v: any) => any) => {
        const actualPath = path || defaultPath;
        const parts = actualPath.split('.');
        let current = obj;

        for (const part of parts) {
            if (current === undefined || current === null) return defaultValue(null);
            current = current[part];
        }

        return transform ? transform(current) : defaultValue(current);
    };

    // Build standardized data structure
    return {
        governanceFee: getValue(
            data,
            config.governanceFeeField,
            'governanceFee',
            config.governanceFeeTransform
        ),
        interestRate: getValue(
            data,
            config.interestRateField,
            'interestRate',
            config.interestRateTransform
        ),
        currentRound: {
            borrowed: getValue(
                data,
                config.currentRoundBorrowedField,
                'currentRound.borrowed',
                config.currentRoundBorrowedTransform
            ) as number,
            expected: getValue(
                data,
                config.currentRoundExpectedField,
                'currentRound.expected',
                config.currentRoundExpectedTransform
            ) as number
        },
        previousRound: {
            borrowed: getValue(
                data,
                config.previousRoundBorrowedField,
                'previousRound.borrowed',
                config.previousRoundBorrowedTransform
            ) as number,
            expected: getValue(
                data,
                config.previousRoundExpectedField,
                'previousRound.expected',
                config.previousRoundExpectedTransform
            ) as number
        }
    };
}

/**
 * Calculate single round ROI
 */
export function calculateROI(data: StandardizedData): BigNumber | string {
    try {
        const totalExpected = BigNumber(data?.currentRound?.expected || 0).plus(data?.previousRound?.expected || 0);
        const totalBorrowed = BigNumber(data?.currentRound?.borrowed || 0).plus(data?.previousRound?.borrowed || 0);

        // Avoid division by zero
        if (totalBorrowed.isZero()) {
            return '-';
        }

        const totalProfit = totalExpected.minus(totalBorrowed);
        const govFeeFactor = BigNumber(1).minus(BigNumber(data?.governanceFee || 0).div(16777216));

        const roi = totalProfit.times(govFeeFactor).div(totalBorrowed);

        // Check if calculation result is valid
        if (roi.isNaN() || !roi.isFinite()) {
            return '-';
        }

        return roi;
    } catch (error) {
        console.error('ROI calculation error:', error);
        return '-';
    }
}

/**
 * Calculate annualized APY
 */
export function calculateAPY(data: StandardizedData, rounds: number = 240): string {
    try {
        const roi = calculateROI(data);

        // If ROI is not a valid number, return '-'
        if (roi === '-' || !roi) {
            return '-';
        }

        // APY = (1 + ROI)^rounds - 1
        const result = BigNumber(1).plus(roi).pow(BigNumber(rounds)).minus(1).times(100);

        // Check if result is valid
        if (result.isNaN() || !result.isFinite()) {
            return '-';
        }

        return result.toFixed(5);
    } catch (error) {
        console.error('APY calculation error:', error);
        return '-';
    }
}

/**
 * Format TON value
 */
export function formatTON(value: any): string {
    if (!value) return '-';
    return BigNumber(value).div(1e9).toFixed(5);
}

/**
 * Create an adapter factory for specific data source
 */
export function createAdapter(config: PoolConfig) {
    return (data: any) => adaptData(data, config);
}

// Default adapter configuration examples
export const adapterConfigs = {
    // KTON adapter configuration
    kton: {},

    // Example: Hipo adapter configuration
    hipo: {
        governanceFeeField: 'governanceFee',
        previousRoundBorrowedField: 'lastStaked',
        previousRoundExpectedField: 'lastRecovered',
        currentRoundBorrowedField: 'currentRound.borrowed',
        currentRoundExpectedField: 'currentRound.expected',
        interestRateField: 'interestRate'
    },

    // Example: Custom adapter configuration
    custom: {
        governanceFeeField: 'fees.governance',
        interestRateField: 'rates.interest',
        currentRoundBorrowedField: 'rounds.current.staked',
        currentRoundExpectedField: 'rounds.current.recovered',
        previousRoundBorrowedField: 'rounds.previous.staked',
        previousRoundExpectedField: 'rounds.previous.recovered',
        // Example: Custom transform function
        governanceFeeTransform: (value: any) => value ? value / 100 : 0
    }
}; 