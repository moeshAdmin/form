
var db = null;
var count = 0;
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {        
        db = window.sqlitePlugin.openDatabase({ name: "my.db", location: 'default' });
        
        this.receivedEvent('deviceready');        
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {

        var pageName = location.pathname;
        if(pageName.match("config")){
            loadData("config");
        }else if(pageName.match("done")){
            loadData("done");
        }else if(pageName.match("index")){
            run("chkDB");
        }else if(pageName.match("form")){
            document.getElementById('photo-btn').addEventListener('click', app.takephoto);
        }
        /*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');*/
        
    },
    takephoto: function(){
        let opts = {
            quality: 80,
            destinationType: Camera.DestinationType.DATA_URL,
            allowEdit:true,
            sourceType: Camera.PictureSourceType.CAMERA,
            mediaType: Camera.MediaType.PICTURE,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation:true,
            cameraDirection: Camera.Direction.BACK,
            popoverOptions: CameraPopoverOptions,
            targetWidth: 500
        };
                    
        navigator.camera.getPicture(app.tk_success, app.tk_fail, opts);
    },
    tk_success: function(imgData){
        document.getElementById('imgData').value = imgData;
        document.getElementById('photo').src = "data:image/jpeg;base64,"+imgData;
                    
    },
    tk_fail: function(msg){
        document.getElementById('imgData').value = msg;
    }
};

app.initialize();
document.addEventListener("backbutton", onBackKeyDown, false);
function onBackKeyDown() {

}



function createDB(type){
    db.transaction(function (tx) {
        if(type=="contact"){
            //建立contact db
            tx.executeSql('CREATE TABLE IF NOT EXISTS contact_table (id integer PRIMARY KEY AUTOINCREMENT, name text, tel text,email text,title text,note text,dtime text,strtime text,area text)');

            db.executeSql('pragma table_info (contact_table)', [],
                function (res) {
                }
            );
        }else if(type=="config"){
            //建立config db
            tx.executeSql('CREATE TABLE IF NOT EXISTS config_table (id integer PRIMARY KEY AUTOINCREMENT, vlName text, vl1 text,vl2 text,vl3 text)');
            tx.executeSql('insert into config_table values (?,?,?,?,?)', [0,"areaConfig","","",""]);

            db.executeSql('pragma table_info (config_table)', [],
                function (res) {
                }
            );
        }
    });
}

function query(type,data,callBack){
    if(type=="test"){
        callBack('OK');
    }
    
    cslog('query start:'+type)
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
            alert("DB CREATE DONE!");
            run("chkDB");
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
            var txt;
            var r = confirm("DROP DB WILL LOST EVERY DATA! CONFIRM?");
            if (r == true) {
                var pt = prompt('TYPE "DROP" TO DROP DB','');
                if (pt != null && pt == "DROP") {
                    tx.executeSql('DROP TABLE IF EXISTS contact_table');
                    tx.executeSql('DROP TABLE IF EXISTS config_table');
                    //顯示目前test_table的資訊
                    db.executeSql("pragma table_info (contact_table);", [],
                        function (result) {
                            alert('DB DROPED!');
                            run("chkDB");
                        }
                    );
                }else{
                    alert('DROP CANCEL');
                }
            } else {
              txt = "You pressed Cancel!";
            }
            
        }else if(type=="configSave"){
            
            tx.executeSql('UPDATE config_table SET vl1 = "'+data[0]+'", vl2 = "'+data[1]+'" WHERE vlName = "areaConfig"', [], 
                function (tx, res) {
                    var strMsg = JSON.stringify(res);
                    alert("SET CONFIG DONE!");
                    window.location = 'index.html';
                },  
                function(error) {
                    alert('Transaction ERROR: ' + error.message);
                });
        }else if(type=="configRead"){
            tx.executeSql("select * from config_table WHERE vlName = 'areaConfig'", [], 
                function (tx, res) {
                    callBack(res.rows.item(0));
            }, function(error) {
                alert('Transaction ERROR: ' + error.message);
            });
        }else if(type=="formSave"){
            tx.executeSql('INSERT INTO contact_table (name,email,tel) VALUES ("'+data[0]+'", "'+data[1]+'", "'+data[2]+'")', [], 
                function (tx, res) {
                    window.location = 'done.html?name='+data[0];
            }, function(error) {
                alert('Transaction ERROR: ' + error.message);
            });
        }else if(type=="dumpData"){
            loaderText('dumpData start');
            tx.executeSql("select * from contact_table order by id desc", [], 
                function (tx, res) {
                    var data = [];
                    //利用for迴圈，將所有取得的資料印出
                    for (var i = 0; i < res.rows.length; i++) {
                        loaderText('dumpData ('+i+')');
                        data[i] = res.rows.item(i);
                        //strMsg += "vlName:" + res.rows.item(i)["vlName"] + " vl1:" + res.rows.item(i)["vl1"] + " vl2:" + res.rows.item(i)["vl2"]  + "\r\n";
                    }
                    loaderText('dumpData Finish');
                    callBack(data);
            }, function(error) {
                document.getElementById("loader-text").innerHTML += 'dumpData ERROR<br>';
                alert('Transaction ERROR: ' + error.message);
            });
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
        query('formSave',data,noFuc);
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

function loadData(type){
    if(type=="config"){
        query('configRead','',function(data){
            document.getElementById("area").value = data['vl1'];
            document.getElementById("sales").value = data['vl2'];
        });
    }else if(type=="done"){
        var name = getQueryVariable("name");
        document.getElementById("user").innerHTML = name;
    }
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
            cslog(callBack);
            if(callBack=='ERROR'){
                document.getElementById("area1").style.display = "block";
                document.getElementById("area2").style.display = "none";
                return;
            }else if(callBack=='OK'){
                document.getElementById("area1").style.display = "none";
                document.getElementById("area2").style.display = "block";
                if(type=="form"){
                    window.location = 'form.html';
                }else if(type=="config"){
                    window.location = 'config.html';
                }else if(type=="check"){
                    alert('OK');
                }
            }
            //db.close();
        });
    }
}

function cslog(msg){
    console.log("ttiep-msg: "+msg);
}



function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  } 
}

function uploadData() {
  var xhttp = new XMLHttpRequest();
  loaderText('fuc start');
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("loading-bg").style.display = "none";
      alert(this.responseText);
      loaderText('reset');
    }else if (this.readyState == 4 && this.status != 200) {
      document.getElementById("loading-bg").style.display = "none";
      alert("ERROR:"+this.status);
      loaderText('reset');
    }else if(this.readyState > 1 &&this.status != 200){
      document.getElementById("loading-bg").style.display = "none";
      alert("ERROR:"+this.readyState+"-"+this.status);
      loaderText('reset');
    }
  };
  document.getElementById("loading-bg").style.display = "block";

  query('dumpData','',function(sqlData){
        loaderText('dumpData done');
        xhttp.open("POST", "https://tti-ep.tti.tv/ep/tools/app_receive", true);  
        //var json_upload = "json=" + JSON.stringify({name:"John Rambo", time:"2pm"});
        var json_upload = "json=" + JSON.stringify(sqlData);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.send(json_upload);
    });
  
}

function loaderText(text){
    if(text=="reset"){
        document.getElementById("loader-text").innerHTML = '';
    }else{
        document.getElementById("loader-text").innerHTML += text+'<br>';
    }
}

