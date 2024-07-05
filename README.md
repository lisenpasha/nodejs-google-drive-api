# Node.js Google Drive API

Description
This API provides endpoints to upload and download files from Google Drive. The API offers two routes:

Upload Files: http://localhost:8082/upload

Download Files: http://localhost:8082/download

Both endpoints expect a JSON body with an array named files, containing the full names of the files.

Prerequisites
Before you can use this API, you need to configure it by following these steps:

Google Drive Setup:

Create a project in the Google Developer Console.
Enable the Google Drive API for your project.
Create OAuth 2.0 credentials and download the client_secret.json file.
Configuration:

Navigate to the google-drive-services folder and open google_drive_functions.js.
Make the following changes:
Configuration Steps
Set the Google Drive Folder ID:

Line 7: Replace 'folder_id' with the ID of the Google Drive folder you want to work with.
const folderId = 'your_google_drive_folder_id';
