const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require("fs")
const crypto = require("crypto")
const path = require("path")

// upload file path
const UPLOAD_DIR = 'uploads/';
const UPLOAD_DIR_PATH = path.join(__dirname, UPLOAD_DIR)

// create express app
const app = express();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${UPLOAD_DIR}`)
    },
    filename: function (req, file, cb) {
      cb(null, crypto.randomBytes(4).toString("hex") + path.extname(file.originalname))
    }
  })

// configure multer
const upload = multer({
    storage: storage,
    limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024 // 10 MB (max file size)
    }
});

// enable CORS
app.use(cors());

// add other middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(__dirname + "/public"))


app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const avatar = req.file;

        // make sure file is available
        if (!avatar) {
            res.status(200).send({
                status: false,
                data: 'No file selected'
            });
        } else {
            // send response
            res.send({
                status: true,
                message: 'File uploaded successfully',
                data: {
                    name: avatar.originalname,
                    mimetype: avatar.mimetype,
                    size: avatar.size,
                    id: path.basename(avatar.filename, path.extname(avatar.filename)),
                }
            });
        }

    } catch (err) {
        res.status(500).send(err);
    }
});

app.post("/download", upload.none(), async (req, res) => {
    try {
        const id = req.body.id
 
        if (!id) {
            res.status(200).send({
                status: false,
                data: 'ID required'
            });
        } else {
            fs.readdir(UPLOAD_DIR_PATH, (err, files) => {
                if (err) return console.log(err)
                if (files.length == 0) {
                    console.log("ID:", id)
                    res.status(200).send({
                        status: false,
                        data: 'Invalid ID'
                    });
                    return
                } else {
                    files.forEach((file) => {
                        console.log(id + "===" + path.basename(file, path.extname(file)))
                        if (id === path.basename(file, path.extname(file))) {
                            res.setHeader('Content-Disposition', 'attachment; filename='+`download${path.extname(file)}`);
                            res.download(path.join(UPLOAD_DIR_PATH,file), `download${path.extname(file)}`)
                            return
                        } else {
                            console.log("ID:", id)
                            res.status(200).send({
                                status: false,
                                data: 'Invalid ID'
                            });
                            return
                        }
                    })
                }
            })
        }
    } catch (err) {
        res.status(500).send(err);
    }
});


/**
 * Serve the basic index.html with forms
 */
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "index.html"))
});

// start the app 
const port = process.env.PORT || 3000;

app.listen(port, () =>
    console.log(`App is listening on port ${port}.`)
);