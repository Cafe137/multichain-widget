import { MultichainTheme } from '../MultichainTheme'

interface Props {
    theme: MultichainTheme
    value: number
    onChange?: (value: number) => void
    min?: number
    max?: number
    step?: number
    placeholder?: string
    readOnly?: boolean
}

export function NumberInput({ theme, value, onChange, min, max, step, placeholder, readOnly }: Props) {
    return (
        <input
            type="number"
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            value={value}
            onChange={onChange ? e => onChange(Number(e.target.value)) : undefined}
            readOnly={readOnly}
            className="multichain__input"
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
        />
    )
}
