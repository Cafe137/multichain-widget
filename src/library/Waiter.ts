import { Dates, System } from 'cafe-utility'
import { getGnosisBzzBalance } from './GnosisBzzBalance'
import { getGnosisNativeBalance } from './GnosisNativeBalance'

export async function waitForGnosisBzzBalanceToIncrease(address: string, initialBalance: bigint): Promise<void> {
    await System.waitFor(
        async () => {
            try {
                const balance = await getGnosisBzzBalance(address)
                return balance.value > initialBalance
            } catch (error) {
                console.error(`Error fetching ${address} wallet BZZ balance:`, error)
                return false
            }
        },
        { attempts: 20, waitMillis: Dates.seconds(15) }
    )
}

export async function waitForGnosisNativeBalanceToDecrease(
    address: `0x${string}`,
    initialBalance: bigint
): Promise<void> {
    await System.waitFor(
        async () => {
            try {
                const balance = await getGnosisNativeBalance(address)
                return balance.value < initialBalance
            } catch (error) {
                console.error(`Error fetching ${address} wallet native balance:`, error)
                return false
            }
        },
        { attempts: 20, waitMillis: Dates.seconds(15) }
    )
}

export async function waitForGnosisNativeBalanceToIncrease(
    address: `0x${string}`,
    initialBalance: bigint
): Promise<void> {
    await System.waitFor(
        async () => {
            try {
                const balance = await getGnosisNativeBalance(address)
                return balance.value > initialBalance
            } catch (error) {
                console.error(`Error fetching ${address} wallet native balance:`, error)
                return false
            }
        },
        { attempts: 20, waitMillis: Dates.seconds(15) }
    )
}
