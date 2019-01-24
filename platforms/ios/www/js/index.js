
var db = null;
var count = 0;
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        console.log('start!');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

//document.addEventListener("backbutton", onBackKeyDown, false);
function onBackKeyDown() {

}

function createDB(type){
    db.transaction(function (tx) {
        if(type=="contact"){
            //建立contact db
            tx.executeSql('CREATE TABLE IF NOT EXISTS contact_table (id integer PRIMARY KEY AUTOINCREMENT, name text, tel text,email text,title text,note text,dtime text,strtime text,area text)');

            db.executeSql('pragma table_info (contact_table)', [],
                function (res) {
                    var strMsg = JSON.stringify(res);
                    alert("CREATE DB DONE_1:"+strMsg);
                }
            );
        }else if(type=="config"){
            //建立config db
            tx.executeSql('CREATE TABLE IF NOT EXISTS config_table (id integer PRIMARY KEY AUTOINCREMENT, vlName text, vl1 text,vl2 text,vl3 text)');
            tx.executeSql('insert into config_table values (?,?,?,?,?)', [0,"areaConfig","","",""]);

            db.executeSql('pragma table_info (config_table)', [],
                function (res) {
                    var strMsg2 = JSON.stringify(res);
                    alert("CREATE DB DONE_2:"+strMsg2);
                }
            );
        }
    });
}

function query(type,data,callBack){
    if(type=="test"){
        callBack('OK');
    }
    alert('aaa'+type);
    var db = window.sqlitePlugin.openDatabase({ name: "my.db", location: 'default' });
    alert('bbb'+type);
    db.transaction(function (tx) {
        //查詢目前在test_table中共有多少筆資訊
        if(type=="select"){
            tx.executeSql("select * from contact_table order by id desc", [], 
                function (tx, res) {
                    var strMsg = "目前共有 " + res.rows.length + " 資料\r\n";
                    //利用for迴圈，將所有取得的資料印出
                    for (var i = 0; i < res.rows.length; i++) {
                        strMsg += "ID:" + res.rows.item(i)["id"] + " 姓名：" + res.rows.item(i)["name"] + " 編號：" + res.rows.item(i)["tel"] + res.rows.item(i)["email"] + "\r\n";
                    }
                    alert(strMsg);
            }, function(error) {
                alert('Transaction ERROR: ' + error.message);
            });
        }else if(type=="select2"){
            tx.executeSql("select * from config_table order by id desc", [], 
                function (tx, res) {
                    var strMsg = "目前共有 " + res.rows.length + " 資料\r\n";
                    //利用for迴圈，將所有取得的資料印出
                    for (var i = 0; i < res.rows.length; i++) {
                        strMsg += "vlName:" + res.rows.item(i)["vlName"] + " vl1:" + res.rows.item(i)["vl1"] + " vl2:" + res.rows.item(i)["vl2"]  + "\r\n";
                    }
                    alert(strMsg);
            }, function(error) {
                alert('Transaction ERROR: ' + error.message);
            });
        }else if(type=="create"){
            createDB('contact');
            createDB('config');
        }else if(type=="check"){
            tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='contact_table'", [], 
                function (tx, res) {
                    if(res.rows.length==0){
                        alert('DB NOT EXISTS! DO [CREATE DB] FIRST!');
                        callBack('ERROR');
                    }else{
                        callBack('OK');
                    }
                });
            
        }else if(type=="drop"){
            tx.executeSql('DROP TABLE IF EXISTS contact_table');
            tx.executeSql('DROP TABLE IF EXISTS config_table');
            //顯示目前test_table的資訊
            db.executeSql("pragma table_info (contact_table);", [],
                function (result) {
                    var strMsg = JSON.stringify(result);
                    alert(strMsg);
                }
            );
        }else if(type=="configSave"){
            alert("start"+data[0]+data[1]);
            
            tx.executeSql('UPDATE config_table SET vl1 = "'+data[0]+'", vl2 = "'+data[1]+'" WHERE vlName = "areaConfig"', [], 
                function (tx, res) {
                    var strMsg = JSON.stringify(res);
                    alert("SET CONFIG DONE:"+strMsg);
                },  
                function(error) {
                    alert('Transaction ERROR: ' + error.message);
                });
        }else if(type=="configRead"){
            alert('bbb'+'configRead');
            /*
            tx.executeSql("select * from config_table WHERE name = 'areaConfig'", [], 
                function (tx, res) {
                    callBack(res.rows.item(0));
            }, function(error) {
                alert('Transaction ERROR: ' + error.message);
            });*/
        }
    });

}

var field = ['name','email','tel','title','note','time','strtime','area'];
var config = ['area','sales'];
function saveData(type){
    if(type=="form"){
        var today=new Date();
        var strTime = today.getTime();
        var data = [];
        for (var j = 0; j < field.length; j++) {
            if(field[j]=="time"){
                data[j] = today.toString();
            }else if(field[j]=="strtime"){
                data[j] = strTime;
            }else{
                data[j] = document.getElementById(field[j]).value;
            }
        }
        query('dataSave',data,noFuc);
    }else if(type=="config"){
        var data = [];
        for (var j = 0; j < config.length; j++) {
            data[j] = document.getElementById(config[j]).value;
        }
        query('configSave',data,noFuc);
    }
}

function noFuc(){
}

function getData(){
    var str = '';
    for (var j = 0; j < window.localStorage.length; j++) {
        //console.log(window.localStorage.key(j)+": "+localStorage.getItem(window.localStorage.key(j)));
        str += window.localStorage.key(j)+": "+localStorage.getItem(window.localStorage.key(j));
    }
    console.log(str);
}

function run(type){
    var msg = '';
    if(type=="tool"){
        count++;
        if(count>5){
            var text = prompt('Quest?','');
            if (text != null && text == "ttiep") {
                window.location = 'index.html';
                count = 0;
            }else{
                count = 0;
            }
        }
        return;
    }else if(type=="test"){
        query('test','',function(callBack){
            alert(callBack);
        });
    }else{
        query('check','',function(callBack){
            if(callBack=='ERROR'){
                alert('SOMETHING ERROR, TRY AGAIN!');
                return;
            }else if(callBack=='OK'){
                if(type=="form"){
                    window.location = 'form.html';
                }else if(type=="config"){
                    window.location = 'config.html';
                }else if(type=="check"){
                    alert('OK');
                }
            }
            db.close();
        });
    }
    
    
    
}