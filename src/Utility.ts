export function prefix(address: string): `0x${string}` {
    if (address.startsWith('0x')) {
        return address as `0x${string}`
    }
    return `0x${address}` as `0x${string}`
}

export function isAddress(address: string): address is `0x${string}` {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}
