import { useRouter } from 'next/router'
import {  useEffect, useState } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table'
 
export default function Page() {
  const [dataRows, setDataRows] = useState([])
  const [columns, setColumns] = useState([])
  const [id, setId] = useState<string>()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [pageNumber, setPageNumber] = useState<string>('1')
  
  const router = useRouter()
  useEffect(() => {
    if (typeof router.query.id === 'string') {
        setId(router.query.id)
    }
  }, [router])

  useEffect(() => {
    if (typeof router.query.page === 'string') {
        setPageNumber(router.query.page)
    }
  }, [router])

  useEffect(() => {
    if (typeof router.query.search === 'string') {
        setSearchTerm(router.query.search)
    }
  }, [router])

  const columnHelper = createColumnHelper()

  useEffect(() => {
      fetch(`http://localhost:3001/${id}?page=${pageNumber}&search=${searchTerm}`)
        .then((res) => res.json())
        .then((res) => { 
            setDataRows(res.rows.map(({ data }) => data))
            setColumns(res.headers.map((headerName) => columnHelper.accessor(headerName, { header: headerName, cell: info => info.getValue()})))
        })
    }, [id, searchTerm, pageNumber])


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