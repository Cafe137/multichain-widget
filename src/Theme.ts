export interface MultichainTheme {
    borderRadius: string
    backgroundColor: string
    textColor: string
}

export function getDefaultMultichainTheme(): MultichainTheme {
    return {
        borderRadius: '8px',
        backgroundColor: '#121212',
        textColor: '#FFFFFF'
    }
}
