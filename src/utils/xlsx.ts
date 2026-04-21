import * as XLSX from "xlsx"
import type { Table } from "@tanstack/react-table"


// respects pagination
export function exportCurrentPageToXlsx<T>(
    table: Table<T>,
    fileName = "export.xlsx"
) {

    const rows = table.getRowModel().rows

    const data = rows.map(row => row.getVisibleCells().reduce((acc, cell) => {
        acc[cell.column.id] = cell.getValue()
        return acc
    }, {} as Record<string, unknown>))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.writeFile(workbook, fileName)
}


export function exportFilteredRowsToXlsx<T>(
    table: Table<T>,
    fileName = "export.xlsx"
) {

    const rows = table.getFilteredSelectedRowModel().rows


    const data = rows.map(row => row.getVisibleCells().reduce((acc, cell) => {
        acc[cell.column.id] = cell.getValue()
        return acc
    }, {} as Record<string, unknown>))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.writeFile(workbook, fileName)
}

// ignoring pagination
export function exportAllToXlsx<T>(
    table: Table<T>,
    fileName = "export.xlsx"
) {

    const rows = table.getFilteredRowModel()
        .rows

    const data = rows.map(row => row.getVisibleCells().reduce((acc, cell) => {
        acc[cell.column.id] = cell.getValue()
        return acc
    }, {} as Record<string, unknown>))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.writeFile(workbook, fileName)
}
