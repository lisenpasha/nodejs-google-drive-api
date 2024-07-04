const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const app = require('../index');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const {delete_specified_files, listDriveFiles} = require ('../google-drive-api/read-files-in-folder')

const downloadedFilesDir = path.join(__dirname, '../google-drive-api/downloaded-files');

afterAll(() => {
  // Force Jest to exit after all tests to prevent hanging due to open handles
  setTimeout(() => process.exit(), 500);
});


describe('Google Drive Api Test, check upload and download.', () => {

  test('should download specified files from Google Drive', async () => {
    await fs.emptyDir(downloadedFilesDir); //empty downloaded-files for correct comparison..
    const filesToDownload = ['dummy-image.png', 'random.jpg']; 
    const response = await request(app)
      .post('/books/download')
      .send({ files: filesToDownload })
      .expect('Content-Type', /json/)
      .expect(200);

    // Check response message
    expect(response.body.message).toBe('Files downloaded successfully.');

    // Verify that the files are downloaded
    for (const file of filesToDownload) {
      const filePath = path.join(downloadedFilesDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }

    // Verify the number of files in the downloadedFilesDir
    const filesInDirectory = await fs.readdir(downloadedFilesDir);
    expect(filesInDirectory.length).toBe(filesToDownload.length);
  });

  test('should upload specified files to Google Drive', async () => {
    const filesToUpload = ['dummy-file1.txt', 'dummy-file2.txt']; 
    await delete_specified_files(filesToUpload) //delete the files if they already exist to make sure for best approach.
    const response = await request(app)
      .post('/books/upload')
      .send({ files: filesToUpload })
      .expect('Content-Type', /json/)
      .expect(200);
      expect(response.body.message).toBe('New Files Uploaded Successfully.');
    await sleep(2000) 
    const existingDriveFiles = await listDriveFiles()
    await sleep(1000) 
    const isEveryFilePresent = filesToUpload.every(file => existingDriveFiles.includes(file))
    expect(isEveryFilePresent).toBe(true) //expect every file from filesToUpload to be successfully uploaded after they got deleted first.
    
  },10000)

});

