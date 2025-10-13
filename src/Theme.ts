export interface MultichainTheme {
    borderRadius?: string
}

export function getDefaultMultichainTheme(): MultichainTheme {
    return {
        borderRadius: '8px'
    }
}
