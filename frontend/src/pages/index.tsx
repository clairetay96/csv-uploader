import Head from "next/head";
import Form from 'next/form'
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from 'axios';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [uploadProgress, setUploadProgress] = useState<number>()
  const [hideProgress, setHideProgress] = useState<boolean>(true)
  useEffect(() => {
    axios.get("http://localhost:3001/")
      .then((res) => {
        console.log(res)
      })
  }, [])

  const router = useRouter()

  const submitForm = (event: FormEvent) => {
    event.preventDefault()

    if (typeof selectedFile === 'undefined') {
      alert("Please upload a CSV file")
      return
    } 
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("filename", selectedFile.name)
  
    axios.post('http://localhost:3001/upload-csv', formData, { 
      onUploadProgress: (progressEvent) => {
        setHideProgress(false)
        console.log(progressEvent.loaded, progressEvent.total)
        setUploadProgress(progressEvent.loaded/progressEvent.total!)
      },
      headers: {"Content-Type": "multipart/form-data"}
    })
      .then((res) => { 
        router.push(`/${res.data.csvId}`)
      })
      .catch(() => alert("File Upload Error"));
  };
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.main}>
          <h1>View and Search your CSV files here</h1>
          <Form action="/upload" onSubmit={submitForm}>
            <input name='csv' type='file' onChange={(e) => setSelectedFile(e.target?.files?.[0])} multiple={false} accept='.csv'/>
            <button type="submit">Submit</button>
          </Form>
          <progress value={uploadProgress} hidden={hideProgress}/>
          <div className={styles.ctas}>
          </div>
        </main>
        <footer className={styles.footer}>
        </footer>
      </div>
    </>
  );
}
