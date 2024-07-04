const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');
const path = require('path');

//Id of google drive's chosen folder to work with.
const folderId = 'folder_id'; 

// Load client secrets from a local file. after creating a project in google drive and giving permission to your gmail account, download the client_secret json and put it in this directory.
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');


if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Client secret file not found at ${CREDENTIALS_PATH}`);
}

// path of json file that will be responsible for keeping refreshed token and credentials.
const TOKEN_PATH = path.join(__dirname,'token.json');

// Scopes required for Google Drive API, for reading, uploading and deleting files in drive. 
const SCOPES = ['https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive'];

// Folder's name inside this directory where files downloaded from google drive will be saved. Change as you wish.
const downloadedFilesDirectory = path.join(__dirname, 'downloaded-files');
if (!fs.existsSync(downloadedFilesDirectory)) {
    fs.mkdirSync(downloadedFilesDirectory);
  }

// Only the contents of this folder can be uploaded to the specified Google Drive folder. Change name as you wish.
const tempFolderPath = path.join(__dirname, 'temp');
  
// Function that returns the authorized client after the user's permission, so we can use it accordingly in upcoming functions.
async function get_google_auth(){
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    let oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    let token;

    if (fs.existsSync(TOKEN_PATH)) {
      token = fs.readFileSync(TOKEN_PATH);
    }
    else{
      oAuth2Client = await getNewToken(oAuth2Client);
      token = fs.readFileSync(TOKEN_PATH);
    }
    
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
} 




// Uploads selected files in drive from specified tempFolderPath.
async function upload_in_drive(files_to_upload=[]) {    
    const oAuth2Client =  await get_google_auth()
    const existing_files = await listDriveFiles();
    uploadFiles(oAuth2Client, existing_files, files_to_upload);
  }



function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
      const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', (code) => {
          rl.close();
          oAuth2Client.getToken(code, (err, token) => {
              if (err) {
                  console.error('Error retrieving access token', err);
                  return reject(err);
              }
              oAuth2Client.setCredentials(token);
              fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
              console.log('Token stored to', TOKEN_PATH);
              resolve(oAuth2Client); // Resolve the promise with the authenticated client
          });
      });
  });
}


  // Function that is used to download a list of files from drive to specified "downloadedFilesDirectory".
  async function download_from_drive(files_to_download=[]) {
    const oAuth2Client =  await get_google_auth() 
    const drive = google.drive({ version: 'v3', oAuth2Client });
    return new Promise(async (resolve, reject) => {
      try {
          const existing_files = await listDriveFiles(true)
            if ( existing_files.length > 0 ) {
            // Read the directory and get the list of files
            const filesList = fs.readdirSync(downloadedFilesDirectory).map(file => path.join(downloadedFilesDirectory, file)).map(filePath => path.basename(filePath));;
            
  
          for (const file of files_to_download) {
            const isFileAlreadyDownloaded = filesList.find(f => f === file) //Check if file is already download in desired download directory.
            if (isFileAlreadyDownloaded){
              console.log(`${file} is already downloaded in downloaded-files directory.`);
            }
            else
            {
            const fileToDownload = existing_files.find(f => f.name === file); //check if file requested by user already exists in google drive.
            if (fileToDownload) {
              await downloadFile(oAuth2Client, fileToDownload.id, fileToDownload.name);
            } else {
              console.log(`No matching file found in drive  for ${file}`);
            }
            }
          }
          resolve();
        } else {
          console.log('No files found in drive.');
          resolve();
        }
      } catch (err) {
        console.log('The API returned an error: ' + err);
        reject(err);
      }
    });
  }
  



  //  function to download files from google drive to a specific directory. auth is oAuth2Client type for google authentication, fileId string, fileName string.
 async function downloadFile(auth, fileId, fileName) {
    const drive = google.drive({ version: 'v3', auth });
    const downloadedFilePath = path.join(downloadedFilesDirectory, fileName);
  
    return new Promise((resolve, reject) => {
      drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' },
        (err, res) => {
          if (err) {
            console.error('Error retrieving file content:', err);
            return reject(err);
          }
  
          const base64Content = Buffer.from(res.data).toString('base64'); //turn response data found in google drive to base64 content
          fs.writeFileSync(downloadedFilePath, base64Content); // write this content to the file and download it
          console.log(`File downloaded to ${downloadedFilePath}`);
          resolve();
        }
      );
    });
  }


 
 
function uploadFiles(auth, existing_files_on_drive, files_to_upload) {
    const drive = google.drive({ version: 'v3', auth });
      for (file of files_to_upload){
        const isFilePresent = existing_files_on_drive.some((f) => f === file)
        if (isFilePresent){
            // Skip the current file and continue with the next one
            console.log(`File ${file} already present in specified folder inside google drive. Check trash if not.`)
            continue;
        }

        const filePath = path.join(tempFolderPath, file);
        //Check if file does exist in tempFolderPath path.
        const fileExists = fs.existsSync(filePath);
        if (!fileExists){
          console.error(`${file} does not exist in specified tempFolderPath.`);
          continue;
        }
        
      
        const fileMetadata = {
          'name': file,
          'parents': [folderId],
        };
        const media = {
          mimeType: 'application/octet-stream', // Change this if you know the correct MIME type
          body: fs.createReadStream(filePath),
        };
        drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id',
        }, (err, file) => {
          if (err) {
            console.error('Error uploading file:', err);
          } else {
            console.log('File uploaded successfully:', file.data.id);
          }
        });
    }

  }


  // Function to delete specified files in the Google Drive directory. Will be used for test files.
async function delete_specified_files(files_to_delete) {
  const auth = await get_google_auth()
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: 'nextPageToken, files(id, name)',
    spaces: 'drive',
    pageToken: null,
  });

  const files_in_drive = res.data.files;

  for (const file_in_drive of files_in_drive) {
      
      try {
        const isFileInDrive = files_to_delete.find( (f) => f === file_in_drive.name)
        if (isFileInDrive){

          await drive.files.delete({ fileId: file_in_drive.id });
          console.log(`Deleted file: ${file_in_drive.name}`);
        
        }

        else{
          continue;
        }
         
      } catch (err) {
          console.error(`Error deleting file: ${file_in_drive.name}`, err);
      }
  }
}


// Function to list all files in a specific directory in google drive. Will be used for test files.
async function listDriveFiles(return_dict=false) {
  const auth = await get_google_auth()
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name)',
      spaces: 'drive',
  });
  if (return_dict){
    return res.data.files
  }

  else {
    return res.data.files.map(file => file.name);
  }
  
}



  module.exports = {upload_in_drive,download_from_drive,delete_specified_files, listDriveFiles}