import { useRouter } from 'next/router'
import {  useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table'
 
export default function Page() {
  const [dataRows, setDataRows] = useState([])
  const [columns, setColumns] = useState([])
  const searchParams = useSearchParams()
  const [id, setId] = useState<string>()
  
  const router = useRouter()
  useEffect(() => {
    if (typeof router.query.id === 'string') {
        setId(router.query.id)
    }
  }, [router])

  const columnHelper = createColumnHelper()

  useEffect(() => {
      fetch(`http://localhost:3001/${id}?page=${searchParams.get('page')}&search=${searchParams.get('search')}`)
        .then((res) => res.json())
        .then((res) => { 
            setDataRows(res.rows.map(({ data }) => data))
            setColumns(res.headers.map((headerName) => columnHelper.accessor(headerName, { header: headerName, cell: info => info.getValue()})))
        })
    }, [id, searchParams])


    const table = useReactTable({
        data: dataRows ?? [],
        columns: columns ?? [],
        getCoreRowModel: getCoreRowModel(),
      })

  return (<div>
    <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
  </div>)
}