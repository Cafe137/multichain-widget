interface Props {
    color: string
}

export function StatusIndicator({ color }: Props) {
    return (
        <span
            style={{
                display: 'inline-block',
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                backgroundColor: `${color}55`
            }}
        >
            <span
                style={{
                    display: 'inline-block',
                    width: 20,
                    height: 20,
                    marginTop: 6,
                    marginLeft: 6,
                    borderRadius: 10,
                    backgroundColor: color
                }}
            ></span>
        </span>
    )
}
