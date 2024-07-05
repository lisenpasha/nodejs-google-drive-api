# Node.js Google Drive API

### Description
This API provides endpoints to upload and download files from Google Drive. The API offers two routes:

Upload Files: http://localhost:8082/upload

Download Files: http://localhost:8082/download

Both endpoints expect a JSON body with an array named files, containing the full names of the files.

Files will be downloaded to the `downloaded-files` folder inside `google-drive-services`, and only files inside the `temp` folder can be uploaded to Google Drive. You can change these paths accordingly in `google_drive_functions.js`.

### Prerequisites
Before you can use this API, you need to configure it by following these steps:

## Google Drive Setup:

Create a project in the Google Developer Console.
Enable the Google Drive API for your project.
Create OAuth 2.0 credentials and download the client_secret.json file.


## Configuration:

Navigate to the `google-drive-services` folder and open `google_drive_functions.js`.
Make the following changes:

### Configuration Steps
1- Set the Google Drive Folder ID:

## Line 7: Replace 'folder_id' with the ID of the Google Drive folder you want to work with.
```bash
   const folderId = 'your_google_drive_folder_id';
```

2- Set the Path to the Client Secrets File:

#### Upload your client_secret.json inside google-drive-services directory

## Line 10: Update the path to the client_secret.json file with your file's name.

```bash
   const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');
```

## Installation and Usage

#### 1- Clone the Repository:


```bash
   git clone https://github.com/yourusername/nodejs-google-drive-api.git
   cd nodejs-google-drive-api
```

#### 2- Install Dependencies:

```bash
   npm install
```

#### 3- Run the Application:

```bash
   npm run start
```

#### 4- Access the Endpoints:

Upload Files: Send a POST request to `http://localhost:8082/upload` with a JSON body containing the files array.

Download Files: Send a POST request to `http://localhost:8082/download` with a JSON body containing the files array.


#### 5- Testing
To run the tests using Jest, execute the following command:

```bash
   npm run test
```

#### Example JSON Body

For both upload and download routes, the JSON body should look like this:

```bash
   {
     "files": ["dummy-file1.txt", "dummy-file2.txt"]
   }
```



