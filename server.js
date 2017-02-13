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
fs = require('fs')
var FaceRecognizer = new cv.FaceRecognizer();
var uploadDir = joinPath(__dirname, "/images");
var fileDir = joinPath(__dirname, "/uploads/bruce1.jpg");
var cvImages = [];


fs.readdir(uploadDir, function(err, files){
    if(err){
        throw new Error(err);

    }
    if(files.length > 0){ //There are some user related image folders
        var counter = 0;
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
                                counter += 1;
                                var labelNumber = parseInt(counter); //Create labelnumber; Account-Id starts by 1, labels for openCV start with 0
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
            cv.readImage('bruce1.jpg', function(err, im){

                if(err) {
                    res.send(err);
                }
                var width = im.width();
                var height = im.height();

                if (width < 1 || height < 1) {
                    throw new Error('Image has no size');
                }else{
                    var whoisit = FaceRecognizer.predictSync(im);
                    if(whoisit.id >=0){
                        console.log("Identified image", whoisit);
                    }else{
                        console.log('Image didnot match.');
                    }
                    // im.save('firstoutput.jpg');
                    // console.log(im);
                }
            })
        }else{
            console.log("Not enough images uploaded yet", cvImages);
        }
    }else{
        console.log("There are no images uploaded yet!");
    }
});


