import { encode } from 'uqr'

export function QrMark({ value }: { value: string }) {
  const qr = encode(value, { border: 2, ecc: 'M' })
  return (
    <svg
      viewBox={`0 0 ${qr.size} ${qr.size}`}
      className="w-full max-w-52 text-ink"
      role="img"
      aria-hidden="true"
    >
      {qr.data.flatMap((row, y) =>
        row.flatMap((on, x) =>
          on ? [<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />] : [],
        ),
      )}
    </svg>
  )
}
