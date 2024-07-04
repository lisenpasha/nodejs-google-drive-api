const { upload_in_drive, download_from_drive } = require('../google-drive-services/ google_drive_functions');


const upload_in_drive_controller = async (req,res) => {
    try
    {
        const { files } = req.body;
        console.log("files",files)

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ message: 'No files provided in the request body.' });
        }

        await upload_in_drive(files)
        res.status(200).json({message: 'New Files Uploaded Successfully.'})
    }
    catch(err)
    {
        res.status(404).json({ message: "Something went wrong, couldn't upload files.", error: err});
    }
};

const download_from_drive_controller = async( req, res) => {
    try 
    {
        const {files}= req.body;
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ message: 'No files provided as params.' });
        }
        await download_from_drive(files)
        res.status(200).json({message: 'Files downloaded successfully.'})
    }
    catch(err)
    {
        res.status(404).json({ message: "Something went wrong, couldn't download file.", error: err});
    }
}

module.exports = { upload_in_drive_controller, download_from_drive_controller  };
