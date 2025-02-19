# csv-uploader

## Description

This application allows a user to upload a CSV, then view and search the uploaded CSV's rows in a paginated table in the browser.

## How to run

### Configure Mongo and .env variables

Set the following .env variables in the root `.env` file.

```
MONGODB_USER = <YOUR_MONGO_USERNAME>
MONGODB_PASSWORD = <YOUR_MONGO_PASSWORD>
MONGODB_DATABASE = <YOUR_TARGET_DB>
MONGODB_DOCKER_PORT = 27017
```

Set the following .env variables in the frontend `.env.local` file:

```
NEXT_PUBLIC_BACKEND_URL='http://localhost:5001/'
NEXT_PUBLIC_BACKEND_WS_URL='ws://localhost:5001/'
```

Set the following .env variables in the backend `.env` file.

```
MONGO_URI=<YOUR_MONGO_CONNECTION_URI>
PORT='5001'
FRONTEND_URL='http://localhost:3000'
```

### Using Docker:

Ensure you have docker installed and docker daemon running. In the root directory of the repo, run this command:

`docker compose up`

The application is accessible through `http://localhost:3000`

### For Development:

Ensure you are running on node 18 and npm 8.

- To run the frontend: cd into `frontend` and run `npm i`, then run `npm run dev`
- To run the backend: cd into `backend` and run `npm i`, then run `npm start`

The frontend runs on `http://localhost:3000` while the backend is on `http://localhost:5001`

## Troubleshooting

If you run into issues when starting up the services, try deleting the `node_modules` folder and/or the `package-lock.json` file.
Otherwise, check that the .env variables are correctly configured.

If `docker compose up` does not work, try `docker compose -f 'docker-compose.yml' up -d --build`
