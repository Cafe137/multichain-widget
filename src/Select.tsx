import { MultichainTheme } from './MultichainTheme'

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
            className="multichain__select"
            style={{
                paddingTop: theme.inputVerticalPadding,
                paddingBottom: theme.inputVerticalPadding,
                paddingLeft: theme.inputHorizontalPadding,
                paddingRight: theme.inputHorizontalPadding,
                borderRadius: theme.borderRadius,
                backgroundColor: theme.inputBackgroundColor,
                borderColor: theme.inputBorderColor,
                color: theme.inputTextColor,
                fontFamily: theme.fontFamily,
                fontSize: theme.fontSize,
                fontWeight: theme.fontWeight
            }}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}
