import { useMemo } from 'react'
import { linkifyText } from '../lib/linkify'

/** Marker prefix used to distinguish CSV content from URLs or plain text. */
export const CSV_PREFIX = 'csv:'

/** Check if a bomStructure value contains CSV data. */
export function isCsvBom(value: string): boolean {
    return value.startsWith(CSV_PREFIX)
}

/** Extract raw CSV text from the prefixed bomStructure value. */
export function extractCsvText(value: string): string {
    return value.slice(CSV_PREFIX.length)
}

/** Parse a raw CSV string into a 2D array. Handles quoted fields with commas. */
function parseCsv(raw: string): string[][] {
    const rows: string[][] = []
    const lines = raw.split(/\r?\n/).filter(line => line.trim())

    for (const line of lines) {
        const cells: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const ch = line[i]
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"'
                    i++
                } else {
                    inQuotes = !inQuotes
                }
            } else if (ch === ',' && !inQuotes) {
                cells.push(current.trim())
                current = ''
            } else {
                current += ch
            }
        }
        cells.push(current.trim())
        rows.push(cells)
    }

    return rows
}

interface CsvTableProps {
    /** Raw CSV text (without the csv: prefix). */
    csv: string
    /** Maximum rows to display before truncating. 0 = show all. */
    maxRows?: number
    /** Additional className for the wrapper. */
    className?: string
}

export default function CsvTable({ csv, maxRows = 0, className = '' }: CsvTableProps) {
    const rows = useMemo(() => parseCsv(csv), [csv])

    if (rows.length === 0) {
        return <p className="text-sm text-muted-foreground italic">Empty CSV</p>
    }

    const [header, ...body] = rows
    const displayBody = maxRows > 0 ? body.slice(0, maxRows) : body
    const truncated = maxRows > 0 && body.length > maxRows

    // Identify which column has "cost" or "price"
    const costColIndices = new Set<number>()
    header.forEach((h, i) => {
        const text = h.toLowerCase()
        if (text.includes('cost') || text.includes('price')) {
            costColIndices.add(i)
        }
    })

    const renderCell = (cellContent: string, colIdx: number) => {
        let text = cellContent.trim()
        
        // Add $ prefix if it's a cost column and doesn't already have one
        if (costColIndices.has(colIdx) && text) {
            if (!text.startsWith('$')) {
                text = `$${text}`
            }
        }
        
        // Linkify and truncate URLs
        return linkifyText(text, true)
    }

    return (
        <div className={`overflow-x-auto rounded-xl border border-border ${className}`}>
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                        {header.map((cell, i) => (
                            <th
                                key={i}
                                className="px-4 py-3 font-semibold text-foreground whitespace-nowrap"
                            >
                                {cell}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {displayBody.map((row, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className="hover:bg-muted/20 transition-colors"
                        >
                            {row.map((cell, colIdx) => (
                                <td
                                    key={colIdx}
                                    className="px-4 py-2.5 text-foreground/80 whitespace-nowrap"
                                >
                                    {renderCell(cell, colIdx)}
                                </td>
                            ))}
                            {/* Pad short rows */}
                            {row.length < header.length &&
                                Array.from({ length: header.length - row.length }).map((_, k) => (
                                    <td key={`pad-${k}`} className="px-4 py-2.5" />
                                ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {truncated && (
                <p className="text-xs text-muted-foreground text-center py-2 bg-muted/20 border-t border-border">
                    Showing {maxRows} of {body.length} rows
                </p>
            )}
        </div>
    )
}
