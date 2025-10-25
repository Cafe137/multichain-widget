export function shortenHash(hash: string, length: number = 8): string {
    if (hash.length <= length * 2) {
        return hash
    }
    return `${hash.slice(0, length)}...${hash.slice(-length)}`
}
