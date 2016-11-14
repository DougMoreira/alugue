module.exports = {
   url : 'mongodb://doug:123@ds019796.mlab.com:19796/doug'
   , local : 'mongodb://127.0.0.1:27017/test'
}

module.exports.conexao = function(db) {
    db.on('error', (err) => {console.error(err)});
    db.once('open', () => {
        console.log("Conectado no banco de dados: " + db.name)
        return true;
    });
}