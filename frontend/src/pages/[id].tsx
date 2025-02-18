import { useRouter } from 'next/router'
import {  useEffect, useState, useCallback, ChangeEvent } from "react";
import { useSearchParams, usePathname } from 'next/navigation'
import axios from 'axios'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table'
 
export default function Page() {
  const [dataRows, setDataRows] = useState([])
  const [columns, setColumns] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [id, setId] = useState<string>()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const router = useRouter()
  

  useEffect(() => {
    if (typeof router.query.id === 'string') {
      setId(router.query.id)
    }
  }, [router])
  
  const columnHelper = createColumnHelper()

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      router.push(pathname + '?' + params.toString())
    },
    [searchParams]
  )

  useEffect(() => {
      const searchString = searchParams.get('search') ?? ''
      const page = searchParams.get('page') ?? 1
      if (id) {
        if (!searchParams.get('page')) {
          createQueryString('page', '1')
        }
        axios.get(`http://localhost:3001/${id}?page=${page}&search=${searchString}`)
          .then((res) => { 
              setDataRows(res.data.rows.map(({ data }: { data: Array<any> }) => data))
              setColumns(res.data.headers.map((headerName: string) => columnHelper.accessor(headerName, { header: headerName, cell: info => info.getValue()})))
              setRowCount(res.data.rowCount)
          })
      }
    }, [id, searchParams])

    const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
      createQueryString('search', e.target.value)
    }

    const onNextClick = () => {
      const page = Number(searchParams.get('page')) ?? 1
      const nextPage = page + 1
      createQueryString('page', nextPage.toString())
    }

    const onPrevClick = () => {
      const page = Number(searchParams.get('page')) ?? 1
      const prevPage = page - 1
      createQueryString('page', prevPage.toString())

    }

    const table = useReactTable({
        data: dataRows ?? [],
        columns: columns ?? [],
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
      })

  return (
  <div>
    <div style={{margin: '10px'}}>
      <h2>Search</h2>
      <input type="text" name="search" onChange={onSearchChange} value={searchParams.get('search') ?? ''}></input>
    </div>
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
      <div style={{margin: '10px'}}>
        <button
            onClick={onPrevClick}
            disabled={searchParams.get('page') === '1'}
          >
            {'<'}
          </button>
          <button
            onClick={onNextClick} 
            disabled={Number(searchParams.get('page')) > rowCount / 50}
            >
            {'>'}
          </button>
        </div>
  </div>)
}