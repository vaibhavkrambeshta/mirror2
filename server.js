var express     =   require( 'express' )
    , http      =    require( 'http' )
    , async     =    require( 'async' )
    , multer    =   require( 'multer' )
    , exphbs    =      require('express-handlebars')
    , upload    =    multer( { dest: 'uploads/' } ).single('file')
    , easyimg   =    require( 'easyimage' )
    , _         =    require( 'lodash' )
    , cv        =   require( 'opencv' )
    , temp      =   require( 'temp' )
    , fs        =   require( 'fs' )
    , exec      =    require('child_process').exec
    , path      =    require('path')
    , joinPath  =     require('path.join')
    , q         =    require('q')
var port = process.env.PORT || process.env.NODE_PORT || 8080;

var app = express();

http.createServer(
    app
).listen( port, function( server ) {
    console.log( 'Listening on port %d', port );
});
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + "/index.html"));
});
var imagearray = [];

fs = require('fs')
// fs.readFile('images/ab.jpg', 'utf8', function (err,data) {
//     if (err) {
//         return console.log(err);
//     }
//
//     imagearray.push(data);
// });
// fs.readFile('images/test1.jpg', 'utf8', function (err,image) {
//     if (err) {
//         return console.log(err);
//     }
//
//     imagearray.push(image);
// });

// cv.readImage("images/test1.jpg", function(err, im){
//     im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
//         for (var i=0;i<faces.length; i++){
//             var x = faces[i]
//             im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
//         }
//         im.save('./out.jpg');
//     });
// })
//app.use(express.static(__dirname + '/images'))
var FaceRecognizer = new cv.FaceRecognizer();
var uploadDir = joinPath(__dirname, "/images");
var fileDir = joinPath(__dirname, "/uploads");
var cvImages = [];


fs.readdir(uploadDir, function(err, files){
    if(err){
        throw new Error(err);

    }
    if(files.length > 0){ //There are some user related image folders
        files.forEach(function(subfolder, index, array){
            if(subfolder != ".DS_Store" ){ //Issue with Mac, test on Linux-VM
                //We are now iterating over each subfolder
                var subFolderDir = joinPath(uploadDir, "/"+"subfolder");
                var images = fs.readdirSync(subFolderDir);
                images.forEach(function(image, index, array){//Get Matrix Objekt for each image to train OpenCV
                    if(image != ".DS_Store"){
                        var imageDir = joinPath(subFolderDir, "/"+image);

                        cv.readImage(imageDir, function(err, im){
                            var channels = im.channels();
                            if(channels >=3){

                                var labelNumber = parseInt(Math.floor((Math.random()* 10)+1)); //Create labelnumber; Account-Id starts by 1, labels for openCV start with 0
                                cvImages.push(new Array(labelNumber,im));  //Add image to Array
                            }
                        });
                    }
                });
            }
        });
        if(cvImages.length > 3){
            console.log("Training images (we have at least 3 images)", cvImages);
            FaceRecognizer.trainSync(cvImages);
            cv.readImage(fileDir, function(err, im){

                if(err) res.send(err);
                var whoisit = FaceRecognizer.predictSync(im);
                console.log("Identified image", whoisit);
            })
        }else{
            console.log("Not enough images uploaded yet", cvImages);
        }
    }else{
        console.log("There are no images uploaded yet!");
    }
});


