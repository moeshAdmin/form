
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
            run("ping");
        }else if(pageName.match("form")){
            document.getElementById('photo-btn').addEventListener('click', app.takephoto);
            loadData("area");
        }
        
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
            targetWidth: 1000
        };
                    
        navigator.camera.getPicture(app.tk_success, app.tk_fail, opts);
    },
    tk_success: function(imgData){
        document.getElementById('photo').src = "data:image/jpeg;base64,"+imgData;
        document.getElementById('imgArea').style.display = "";
        document.getElementById('photo').style.display = "";
        document.getElementById('formArea').style.display = "none";
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
            tx.executeSql('CREATE TABLE IF NOT EXISTS contact_table (id integer PRIMARY KEY AUTOINCREMENT, name text, tel text,email text,title text,note text,dtime text,strtime text,area text,sales text,image64 blob,isUpdate text,uKey text,lang text,com text)');

            db.executeSql('pragma table_info (contact_table)', [],
                function (res) {
                }
            );
        }else if(type=="config"){
            //建立config db
            var today=new Date();
            var uKey = device.serial+"-"+today.getTime();

            tx.executeSql('CREATE TABLE IF NOT EXISTS config_table (id integer PRIMARY KEY AUTOINCREMENT, vlName text, vl1 text,vl2 text,vl3 text)');
            tx.executeSql('insert into config_table values (?,?,?,?,?)', [0,"areaConfig","","",uKey]);

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
            tx.executeSql("select id,name,isUpdate from contact_table order by id desc", [], 
                function (tx, res) {
                    var strMsg = "目前共有 " + res.rows.length + " 資料\r\n";
                    //利用for迴圈，將所有取得的資料印出
                    for (var i = 0; i < res.rows.length; i++) {
                        strMsg += "ID:" + res.rows.item(i)["id"] + " 姓名：" + res.rows.item(i)["name"] + " 編號：" + res.rows.item(i)["tel"] + res.rows.item(i)["email"] + res.rows.item(i)["isUpdate"] + "\r\n";
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
            tx.executeSql('INSERT INTO contact_table (name,email,tel,title,note,dtime,strtime,area,sales,image64,uKey,isUpdate,lang,com) VALUES ("'+data[0]+'", "'+data[1]+'", "'+data[2]+'", "'+data[3]+'", "'+data[4]+'", "'+data[5]+'", "'+data[6]+'", "'+data[7]+'", "'+data[8]+'", "'+data[9]+'", "'+data[10]+'","N", "'+data[11]+'", "'+data[12]+'")', [], 
                function (tx, res) {
                    window.location = 'done.html?name='+data[0];
            }, function(error) {
                alert('Transaction ERROR: ' + error.message);
            });
        }else if(type=="dumpData"){
            loaderText('dumpData start');
            tx.executeSql('SELECT * FROM contact_table WHERE isUpdate = "N"', [], 
                function (tx, res) {
                    var data = [];
                    //利用for迴圈，將所有取得的資料印出
                    for (var i = 0; i < res.rows.length; i++) {
                        loaderText('dumpData ('+i+')');//輸出dump紀錄
                        data[i] = res.rows.item(i);
                        //strMsg += "vlName:" + res.rows.item(i)["vlName"] + " vl1:" + res.rows.item(i)["vl1"] + " vl2:" + res.rows.item(i)["vl2"]  + "\r\n";
                    }
                    loaderText('dumpData Finish');
                    callBack(data);
            }, function(error) {
                document.getElementById("loader-text").innerHTML += 'dumpData ERROR<br>';
                alert('Transaction ERROR: ' + error.message);
            });
        }else if(type=="uploadSet"){
            
            tx.executeSql('UPDATE contact_table SET isUpdate = "Y" WHERE id = '+data, [], 
                function (tx, res) {
                    //成功更新
                },  
                function(error) {
                    alert('Transaction ERROR: ' + error.message);
                });
        }
    });

}

var field = ['name','email','tel','title','note','time','strtime','area','sales','imgData','uKey','lang','com'];
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
            }else if(field[j]=="imgData"){
                data[j] = document.getElementById('photo').src;
            }else if(field[j]=="lang"){
                var e = document.getElementById("lang");
                data[j] = e.options[e.selectedIndex].value;
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
    }else if(type=="area"){
        query('configRead','',function(data){
            document.getElementById("area").value = data['vl1'];
            document.getElementById("sales").value = data['vl2'];
            document.getElementById("uKey").value = data['vl3'];
        });
    }
}

function run(type,callBack){
    var msg = '';
    if(type=="tool"){
        count++;
        if(count>2){
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
    }else if(type=="ping"){
        //找不到好的方法 暫時先抽掉
        document.getElementById("uploadArea").innerHTML = '<div type="btn" style="width:calc(100%);" onclick="uploadData();"><div class="btn-icon"><img src="css/images/icons-svg/transfer.svg"></div><div class="btn-title">UPLOAD DB</div></div>';

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
    //再次確認在內網環境才執行上傳
            loadScreen("start");
            query('dumpData','', async function(sqlData){
                loaderText('dumpData done');
                if(sqlData.length>0){//如果沒資料上傳
                    for (var i = 0; i < sqlData.length; i++) {
                        await sleep(1000);
                        ajax(sqlData[i]);//一筆一筆資料上傳
                        loaderText('upload..'+(i+2)+'/'+sqlData.length);
                        if(i+1==sqlData.length){
                            loadScreen("end");
                            alert('upload finish');
                        }
                    }
                }else{
                    alert('no data need upload');
                    loadScreen("end");
                    return;
                }
            });
    
    //取出需上傳的資料

            
}

function loadScreen(type){
    if(type=="start"){
        loaderText('fuc start');
        document.getElementById("loading-bg").style.display = "block";
    }else if(type=="end"){
        loaderText('reset');
        document.getElementById("loading-bg").style.display = "none";
    }
}

function ajax(sendData){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://tti-ep.tti.tv/ep/tools/app_receive", true);  
    var json_upload = "json=" + JSON.stringify(sendData);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(json_upload);
      xhttp.onreadystatechange = function() {
        //上傳成功後的後續動作
        if (this.readyState == 4 && this.status == 200) {
          query('uploadSet',sendData['id'],noFuc);//將資料註記為已上傳
        }else if (this.readyState == 4 && this.status != 200) {
          document.getElementById("loading-bg").style.display = "none";
          alert("ERROR:"+this.status);
        }else if(this.readyState > 1 &&this.status != 200){
          document.getElementById("loading-bg").style.display = "none";
          alert("ERROR:"+this.readyState+"-"+this.status);
        }
      };
}

function loaderText(text){
    if(text=="reset"){
        document.getElementById("loader-text").innerHTML = '';
    }else{
        document.getElementById("loader-text").innerHTML = text;
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
