import { MultichainTheme } from './Theme'

interface Props {
    theme: MultichainTheme
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    placeholder?: string
}

export function NumberInput({ theme, value, onChange, min, max, step, placeholder }: Props) {
    return (
        <input
            type="number"
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="multichain__input"
            style={{
                paddingTop: theme.inputVerticalPadding,
                paddingBottom: theme.inputVerticalPadding,
                paddingLeft: theme.inputHorizontalPadding,
                paddingRight: theme.inputHorizontalPadding,
                borderRadius: theme.borderRadius,
                backgroundColor: theme.inputBackgroundColor,
                borderColor: theme.inputBorderColor,
                color: theme.inputTextColor
            }}
        />
    )
}
