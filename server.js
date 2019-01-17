const wssc   = require('websocket').server  //  --> npm i websocket
const static = require('node-static')         //  --> npm i node-static
const file = new static.Server('./dist')
//const cc = require("exam-cc")
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
var ObjectID = require('mongodb').ObjectID
const url = "mongodb://localhost:27017/"
const dbName = 'Torpedo'
var collection=''
var le=[]
var msg
/*
var conf = cc.read('config.txt',0,'')
console.log(conf)
*/
class jatekos {
    constructor (nev,jatekos_id,statusz){
        this.nev=nev
        this.jatekos_id=jatekos_id
        this.statusz=statusz
    }
    setid(jatekos_id){
        this.jatekos_id=jatekos_id
    }
}

class jatek {
    constructor( j_id1, j_id2, tabla1, tabla2, lepesek, ido) {
       this.j_id1=j_id1
       this.j_id2=j_id2
       this.tabla1=tabla1
       this.tabla2=tabla2
       this.lepesek=lepesek
       this.ido=ido
    }
    setj_id1(j_id1){
        this.j_id1 = j_id1
    }
    setj_id2(j_id2){
        this.j_id2 = j_id2
    }
    reset(){
        this.j_id1 = 0
        this.j_id2 = 0
        this.tabla1 = []
        this.tabla2 = []
        this.lepesek = []
        this.ido = Date.now()
    }
}

jatekos1 = new jatekos('jatekos1', 0, 'elérhető')
jatekos2 = new jatekos('jatekos2', 0, 'elérhető')
var jip =  Date.now()
jatek = new jatek ( 0, 0, [], [], [], jip)

MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    assert.equal(null, err)
    console.log("Adatbázis kapcsolódva.")
    const db = client.db(dbName)
    client.close()
})

const insertDocuments = function (jatekos, db, callback) {
    const collection = db.collection('Jatekosok')
    collection.insertOne(
        jatekos
    , function (err, result) {
        assert.equal(err, null)
        console.log("Játékos id beszúrva az adatbázisba.")
        callback(result)
    })
}

const saveDocument = function (db, callback) {

    const collection = db.collection('Jatekok')
    delete jatek._id
    collection.insertOne(
        jatek ,
        function (err, result) {
        assert.equal(err, null)
        console.log("Játék mentve az adatbázisba.")
        callback(result)
    })
}

const findDocuments = function (db, callback) {
    collection = db.collection('Jatekosok');
    collection.find({}).toArray(function (err, docs) {
        assert.equal(err, null);
        if (docs==0){
            console.log('Játékos id-k beszúrása az adatbázisba')            
            insertDocuments(jatekos1,db, function () {
            })
            insertDocuments(jatekos2, db, function () {
            })
        }
        callback(docs)
    })
}

const loadDocument = function (db, callback) {
    collection = db.collection('Jatekok');
    collection.find({}).sort({ ido: -1 }).toArray(function (err, docs) {
        assert.equal(err, null)
        let uzi = docs.map(v => 
            v = [v._id+'|'+v.ido]
            ).join('#')
        msg.msg =('adatok'+';'+uzi) 
        ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))
        callback(docs)
    })
}

const loadJatek = function (db, callback) {
    collection = db.collection('Jatekok')
    var adat = collection.find({ "_id": new ObjectID(jid) }).toArray((err, adat) => {
        console.log(adat)
        let jsa = JSON.stringify(adat)
        let b64a = Buffer.from(jsa).toString('base64')
        msg.msg = ('jatek' + ';' + b64a)
        ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))
        callback(msg)
    })    
}

MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    assert.equal(null, err);
    const db = client.db(dbName)
    findDocuments(db, function () {
        client.close()
    })
})

function ment(){
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName)
        saveDocument(db, function () {
            client.close()
        })
    })
}

function jatekot_Lekerdez() {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName)
        loadDocument(db, function () {
            client.close()
        })
    })
}

function lekerdezid() {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName)
        loadJatek(db, function () {
            client.close()
        })
    })
}

const server = require('http')
    .createServer( (request, response) => {
        request.addListener('end', () => {
            file.serve(request, response);
        }).resume()
    })

wsServer = new wssc( { httpServer: server, autoAcceptConnections: false } )

var ct = []
var id1 = ''
var id2 = ''
var k = false
var jid =0

wsServer.on( 'request', r => {
        ct.push( r.accept('echo-protocol',r.origin) )
        ct[ct.length - 1].on( 'message', m => {
            msg = JSON.parse(m.utf8Data)
            idopont=new Date()
            console.log(m.utf8Data)
            console.log(msg.id, msg.msg)

            var koor = msg.msg.split(';')
            var x = koor[0]
            var y = koor[1]

            if (x=='lekerdez') {
                jid = y
                lekerdezid()
            }

            if (msg.msg=='idt;leker'){
                let n = id_kioszt()
                if (n==false){
                    console.log('sok id')                    
                    msg.msg = '80;80'
                    ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))
                }
            }
            if (msg.msg=='olvas;olvas'){
                console.log('lekérdezés indítása...')                
                jatekot_Lekerdez()
            }
            if (msg.msg == ('20;20')) {
                ment()
                ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))
            }
            if (msg.msg==('30;restart')) {
                msg.id=jatekos1.jatekos_id
                ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))
                msg.id = jatekos2.jatekos_id
                ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))    
                ct = []
                id1 = ''
                id2 = ''
                k = false
                jatek.reset
                jatekos1 = new jatekos('jatekos1', 0, 'elérhető')
                jatekos2 = new jatekos('jatekos2', 0, 'elérhető')
             }
          
             x = Number(x)
             y = Number(y)
            
            if (x==25){
                if (msg.id==jatekos1.jatekos_id){
                    id1='kesz'
                    jatek.tabla1=koor[2]
                    console.log(jatek.tabla1)                    
                    console.log('id1: '+id1)                    
                }
                if (msg.id == jatekos2.jatekos_id) {
                    id2 = 'kesz'
                    jatek.tabla2 = koor[2]
                    console.log('id2: ' + id2)
                }
                ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))
            }
            if ((id1=='kesz' && id2=='kesz') && !k ) {
                let q=Math.round(Math.random())
                k=true
                if (q==0){
                    msg.id= jatekos1.jatekos_id
                    msg.msg = "50;50"
                    ct.forEach( (v,k) => v.sendUTF(msg.id + ':' + msg.msg) )
                    msg.id = jatekos2.jatekos_id
                    msg.msg = "51;51"
                    ct.forEach( (v,k) => v.sendUTF(msg.id + ':' + msg.msg) )
                }
                else{
                    msg.id = jatekos2.jatekos_id
                  msg.msg = "50;50"
                  ct.forEach( (v,k) => v.sendUTF(msg.id + ':' + msg.msg) )
                    msg.id = jatekos1.jatekos_id
                  msg.msg = "51;51"
                  ct.forEach( (v,k) => v.sendUTF(msg.id + ':' + msg.msg) )
                }
            }
            if ( (x >= 0 && x <= 9) && ( y>= 0 && y <= 9) ){
                jatek.lepesek.push(msg.id + ':' + msg.msg)
                console.log('lépés hozzáadva');
                ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))
            }
        })
} )

function  id_kioszt() {
    if (jatekos1.jatekos_id == 0) {
        jatekos1.setid(msg.id)
        jatek.setj_id1(msg.id)
        return true
    }
    else if (jatekos2.jatekos_id == 0) {
        jatekos2.setid(msg.id)
        jatek.setj_id2(msg.id)
        msg.msg = '40' + ';' + jatekos1.jatekos_id
        ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))
        msg.id=jatekos1.jatekos_id
        msg.msg = '40' + ';' + jatekos2.jatekos_id
        ct.forEach((v, k) => v.sendUTF(msg.id + ':' + msg.msg))
        return true
    }
    else return false
}

server.listen(3000, () => {
    console.log(`
        ws server elérhető a 3000-es porton
    `)
})