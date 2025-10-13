import { MultichainTheme } from './Theme'

interface Props {
    theme: MultichainTheme
    value: string
    onChange?: (value: string) => void
    placeholder?: string
    readOnly?: boolean
}

export function TextInput({ theme, value, onChange, placeholder, readOnly }: Props) {
    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange ? e => onChange(e.target.value) : undefined}
            style={{ borderRadius: theme.borderRadius }}
            readOnly={readOnly}
            className="multichain__input"
        />
    )
}
