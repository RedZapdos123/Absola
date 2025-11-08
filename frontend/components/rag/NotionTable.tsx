'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

export interface TableRow {
  id: string
  cells: string[]
}

interface NotionTableProps {
  documentId?: string
  onDataChange?: (rows: TableRow[]) => void
}

export function NotionTable({ documentId, onDataChange }: NotionTableProps) {
  const [columns, setColumns] = useState<string[]>(['Topic', 'Summary', 'Key Points', 'References', 'User Prompt'])
  const [rows, setRows] = useState<TableRow[]>([
    { id: '1', cells: ['', '', '', '', ''] },
  ])
  const [editingCell, setEditingCell] = useState<{ rowId: string; colIndex: number } | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const addRow = () => {
    const newRow: TableRow = {
      id: Date.now().toString(),
      cells: new Array(columns.length).fill(''),
    }
    const updatedRows = [...rows, newRow]
    setRows(updatedRows)
    if (onDataChange) onDataChange(updatedRows)
  }

  const deleteRow = (rowId: string) => {
    const updatedRows = rows.filter((row) => row.id !== rowId)
    setRows(updatedRows)
    if (onDataChange) onDataChange(updatedRows)
  }

  const startEditing = (rowId: string, colIndex: number, currentValue: string) => {
    setEditingCell({ rowId, colIndex })
    setEditingValue(currentValue)
  }

  const saveEdit = () => {
    if (!editingCell) return
    const updatedRows = rows.map((row) => {
      if (row.id === editingCell.rowId) {
        const newCells = [...row.cells]
        newCells[editingCell.colIndex] = editingValue
        return { ...row, cells: newCells }
      }
      return row
    })
    setRows(updatedRows)
    setEditingCell(null)
    if (onDataChange) onDataChange(updatedRows)
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditingValue('')
  }

  return (
    <div className="w-full overflow-x-auto bg-amber-50 dark:bg-amber-950 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
      <div className="min-w-full">
        {/* Header */}
        <div className="bg-amber-100 dark:bg-amber-900 border-b-4 border-amber-800 dark:border-amber-700">
          <div className="flex">
            {columns.map((col, index) => (
              <div
                key={index}
                className="flex-1 px-4 py-3 font-black text-amber-900 dark:text-amber-100 text-left border-r-4 border-amber-800 dark:border-amber-700 last:border-r-0"
                style={{ fontFamily: 'Georgia, serif', minWidth: '200px' }}
              >
                {col}
              </div>
            ))}
            <div className="w-20 px-4 py-3 font-black text-amber-900 dark:text-amber-100">
              Actions
            </div>
          </div>
        </div>

        {/* Rows */}
        <div>
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex border-b-2 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 transition"
            >
              {row.cells.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className="flex-1 px-4 py-3 border-r-2 border-amber-300 dark:border-amber-800 last:border-r-0"
                  style={{ minWidth: '200px' }}
                >
                  {editingCell?.rowId === row.id && editingCell?.colIndex === colIndex ? (
                    <div className="flex items-center gap-2">
                      <textarea
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white dark:bg-amber-900 border-2 border-amber-800 dark:border-amber-700 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
                        style={{ fontFamily: 'Georgia, serif' }}
                        rows={3}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditing(row.id, colIndex, cell)}
                      className="cursor-pointer group flex items-center gap-2 text-amber-900 dark:text-amber-100 font-semibold min-h-[3rem]"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      <span className="flex-1 whitespace-pre-wrap">{cell || 'Click to edit...'}</span>
                      <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  )}
                </div>
              ))}
              <div className="w-20 px-2 py-3 flex items-center justify-center">
                <button
                  onClick={() => deleteRow(row.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition border-2 border-amber-800 dark:border-amber-700"
                  title="Delete row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        <div className="bg-amber-100 dark:bg-amber-900 border-t-4 border-amber-800 dark:border-amber-700 p-4">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 font-bold transition border-2 border-amber-800 dark:border-amber-600 shadow-md"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <Plus className="w-5 h-5" />
            Add Row
          </button>
        </div>
      </div>
    </div>
  )
}
