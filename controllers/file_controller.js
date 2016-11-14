var shortId      = require('shortid');
var fs           = require('fs'); // File System

// @param {Object} app - express app instance
module.exports = function(gridfs) {
// get the gridfs instance

	return {
		upload: function(req, res, next) {
			//console.log(req.files);
			var is;
			var os;
			//get the extenstion of the file
			var extension = req.files.file.file.split(/[. ]+/).pop();
			is = fs.createReadStream(req.files.file.file);
			var meta = {
				uploader: req.user
			}
			os = gridfs.createWriteStream({ filename: shortId.generate()+'.'+extension, metadata: meta });
			is.pipe(os);

			os.on('close', function (file) {
			//delete file from temp folder
			fs.unlink(req.files.file.file, function() {
				console.log(req.files);
				res.status(200).json(file);
			});
			});
		},
	getFileById: function(req, res, next) {
		var readstream = gridfs.createReadStream({
		_id: req.params.fileId
		});
		req.on('error', function(err) {
		res.send(500, err);
		});
		readstream.on('error', function (err) {
		res.send(500, err);
		});
		readstream.pipe(res);
	} 
	};
};