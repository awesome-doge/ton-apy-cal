import { Address } from "@ton/core";
import { getTonClient } from "../utils/getTonClient";
import { Treasury } from "../wrappers/hipo/Treasury";


export async function getHipoTreasury() {
    const client = getTonClient();
    const pool = await client.open(new Treasury(Address.parse(import.meta.env.VITE_HIPO_CONTRACT_ADDRESS!)));

    // Get main state
    const data = await pool.getTreasuryState();
    console.log('Hipo Treasury State:', data);

    // Get timing information
    try {
        const times = await pool.getTimes();
        console.log('Hipo Times:', times);
        data.times = times;
    } catch (error) {
        console.error('Error fetching Hipo times:', error);
        data.times = null;
    }

    // Get surplus
    try {
        const surplus = await pool.getSurplus();
        console.log('Hipo Surplus:', surplus);
        data.surplus = surplus;
    } catch (error) {
        console.error('Error fetching Hipo surplus:', error);
        data.surplus = null;
    }

    return data;
}