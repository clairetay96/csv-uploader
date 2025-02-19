# csv-uploader

## Description

This application allows a user to upload a CSV, then view and search the uploaded CSV's rows in a paginated table in the browser.

## How to run

### Using Docker:

Ensure you have docker installed and docker daemon running. In the root directory of the repo, run this command:

`docker compose up`

The application is accessible through `http://localhost:3000`

### For Development:

Ensure you are running on node 18 and npm 8.

- To run the frontend: cd into `frontend` and run `npm i`, then run `npm run dev`
- To run the backend: cd into `backend` and run `npm i`, then run `npm start`

The frontend runs on `http://localhost:3000` while the backend is on `http://localhost:5001`

## Developer's Notes


