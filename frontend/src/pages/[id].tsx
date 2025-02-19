import { useRouter } from 'next/router'
import {  useEffect, useState, useCallback, ChangeEvent } from "react";
import { useSearchParams, usePathname } from 'next/navigation'
import ClipLoader from "react-spinners/ClipLoader";
import axios from 'axios'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table'
import Link from 'next/link';
 
export default function Page() {
  const [dataRows, setDataRows] = useState()
  const [columns, setColumns] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [filename, setFilename] = useState()
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
              setDataRows(res.data.rows.map(({ data }: { data: Array<object> }) => data))
              setColumns(res.data.headers.map((headerName: string) => columnHelper.accessor(headerName, { header: headerName, cell: info => info.getValue()})))
              setRowCount(res.data.rowCount)
              setFilename(res.data.filename)
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

    const onFirstClick = () => {
      createQueryString('page', '1')
    }

    const onLastClick = () => {
      createQueryString('page', Math.ceil(rowCount / 50).toString())
    }

    const table = useReactTable({
        data: dataRows ?? [],
        columns: columns ?? [],
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
      })

      if (id && !dataRows) {
        return (<div style={{ margin: '50px'}}><ClipLoader loading={true} size={100} color='white'/></div>)
      }

  return (
  <div>
    <div style={{margin: '10px 30px 10px 10px', display: 'flex', justifyContent: 'space-between'}}>
      <h1>{filename}</h1>
      <input type="text" name="search" onChange={onSearchChange} value={searchParams.get('search') ?? ''} placeholder='Enter search text here' style={{ width: '300px', height: '30px', padding: '5px'}}></input>
    </div>
    <div style={{ margin: '15px'}}>
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
      </div>
      <div style={{margin: '10px 15px 10px 10px', display: 'flex', justifyContent: 'space-between',  alignItems: 'center'}}>
        <div>
      <button
            style={{ display: 'inline-flex', width: '50px', height: '30px', fontSize: '30px', margin: '10px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}
            onClick={onFirstClick}
            disabled={searchParams.get('page') === '1'}
          >
            {'<<'}
          </button>
        <button
            style={{ display: 'inline-flex', width: '50px', height: '30px', fontSize: '30px', margin: '10px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}
            onClick={onPrevClick}
            disabled={searchParams.get('page') === '1'}
          >
            {'<'}
          </button>
          <button
            style={{ display: 'inline-flex', width: '50px', height: '30px', fontSize: '30px', margin: '10px', alignItems: 'center', justifyContent: 'center',  cursor: 'pointer'}}
            onClick={onNextClick} 
            disabled={Number(searchParams.get('page')) >= rowCount / 50}
            >
            {'>'}
          </button>
          <button
            style={{ display: 'inline-flex', width: '50px', height: '30px', fontSize: '30px', margin: '10px', alignItems: 'center', justifyContent: 'center',  cursor: 'pointer'}}
            onClick={onLastClick} 
            disabled={Number(searchParams.get('page')) >= rowCount / 50}
            >
            {'>>'}
          </button>
          </div>
          <div> Page {searchParams.get('page')} of {Math.ceil(rowCount / 50)}</div>
        </div>
        <div style={{margin: '15px'}}>
          <Link href='/' style={{ cursor: 'pointer', }}><u>Back to home</u></Link>
        </div>
  </div>)
}