import { MultichainTheme } from './Theme'

interface Option {
    label: string
    value: string
}

interface Props {
    theme: MultichainTheme
    options: Option[]
    value: string
    onChange: (value: string) => void
}

export function Select({ theme, options, value, onChange }: Props) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ borderRadius: theme.borderRadius }}
            className="multichain__select"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}
