import { useState } from 'react'
import { MultichainTheme } from '../MultichainTheme'
import { Typography } from './Typography'

interface Props {
    theme: MultichainTheme
    value: string
    label?: string
    onChange: (value: string) => void
    onChangeGuard?: (value: string) => Promise<boolean>
    options: { image?: string | null; label: string; value: string }[]
}

export function AdvancedSelect({ theme, value, label, onChange, onChangeGuard, options }: Props) {
    const [open, setOpen] = useState(false)

    const current = options.find(o => o.value === value)

    return (
        <div className="select-container">
            <button
                className="select-trigger"
                onClick={() => setOpen(x => !x)}
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
                    fontWeight: theme.fontWeight,
                    border: 'none'
                }}
            >
                <div className="select-left">
                    {current && current.image ? (
                        <img src={current.image} alt={current.label} className="select-img" />
                    ) : undefined}
                    <Typography theme={theme}>{current ? current.label : 'Loading...'}</Typography>
                </div>
                <div className="multichain__row">
                    {label !== undefined ? (
                        <Typography theme={theme} small secondary>
                            {label}
                        </Typography>
                    ) : null}
                    <svg
                        className={`select-arrow ${open ? 'open' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </button>

            {open && (
                <ul
                    className="select-menu"
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
                        <li
                            key={option.value}
                            className="select-option"
                            style={{
                                paddingTop: theme.inputVerticalPadding,
                                paddingBottom: theme.inputVerticalPadding
                            }}
                            onClick={async () => {
                                if (onChangeGuard) {
                                    await onChangeGuard(option.value).then(allowed => {
                                        if (allowed) {
                                            onChange(option.value)
                                        }
                                    })
                                } else {
                                    onChange(option.value)
                                }
                                setOpen(false)
                            }}
                        >
                            {option.image ? (
                                <img src={option.image} alt={option.label} className="select-img" />
                            ) : undefined}
                            <Typography theme={theme}>{option.label}</Typography>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
