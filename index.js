const express = require('express');
const path = require('path');
const formidable = require('formidable');
const mongoose = require('mongoose');
const fs = require('fs')
const bodyParser = require('body-parser');
const {file} = require('./database/schema')

app = express();

app.set('port', process.env.PORT || process.argv[2] || 8080);
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
mongoose.set("strictQuery", false);
app.use(async (req, res, next) => {

    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/subtitles');
        next();
    } catch (error) {
        res.status(500).json({ message: "internal server error" }).end();
    }
});

app.get('/', async(req, res) => {
    let data = await file.find({}).limit(50);
    let subs = [];
    data.forEach(files => {
        subs.push({ link: files._id.toHexString(), disc: files.name });
    });
    res.render('index',{subs});
});
app.get('/download/:id', async (req, res) => {
    let fileId = req.params.id;
    let downloadFile;
    try {
         downloadFile = await file.findById(fileId, "path");
    } catch (error) {
        res.status(404).render('404');
        return;
    }
    if (!downloadFile) {
        res.status(404).render('404');
        return;
    }
    res.download(downloadFile.path)
});
app.post('/upload', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.status(400).send('bad request');
        } else {
            let oldpath = files.subFile.filepath;
            let newpath = path.resolve(__dirname,'subs',`${fields.fileName}.srt`);
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    console.log(err);
                    res.status(500).send('internal server error');
                    return;
                };
                let newFile = new file({
                    path: newpath,
                    name:fields.fileName
                });
                newFile.save();
                res.redirect('back');
            });
            
        }

    });

});

app.get('/search', async (req, res) => {
    let query = req.query.q;
    let data = await file.find({name:{$regex:`${query}`,$options:"$i"}});
    let subs = [];
    data.forEach(files => {
        subs.push({ link: files._id.toHexString(), disc: files.name });
    });
    res.json(subs).end();
})
app.get('/admin/add', (req, res) => {
    res.render('upload');
});

app.use('*',(req,res)=>{
  res.status(404).render('404');
});

app.listen(app.get('port'),()=>{
  console.log("listening on http://localhost:" + app.get('port'));
});