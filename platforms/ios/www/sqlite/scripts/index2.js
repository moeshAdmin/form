/*
*****************************************************************************************************************************
*******                                         軟體版權宣告                                                          *******
*****************************************************************************************************************************
*******                            程式名稱：使用Cordova - SQLite - Storage外掛存取手機內部資料                       *******
*******                            開發軟體：Visual Studio 2017 (Cordova)                                             *******
*******                            套件外掛：jQuery mobile 1.4.5、Cordova-sqlite-storage 2.3.0                        *******
*******                            完成時間：2018-04-02                                                               *******
*******                            軟體來源：爆肝工程師的備忘錄 http://www.bggcs.com                                  *******
*******                            軟體備註：轉載時，請勿刪除軟體宣告                                                 *******
*****************************************************************************************************************************
*****************************************************************************************************************************
*/
// 如需空白範本的簡介，請參閱下列文件:
// http://go.microsoft.com/fwlink/?LinkID=397704
// 若要對 cordova-simulate 中頁面載入上或 Android 裝置/模擬器上的程式碼偵錯: 啟動應用程式、設定中斷點、
// 然後在 JavaScript 主控台中執行 "window.location.reload()"。
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    //宣告儲存資料庫變數
    var db = null;

    function onDeviceReady() {
        //利用cordova sqlite storage外掛建立my.db資料庫
        db = window.sqlitePlugin.openDatabase({ name: "my.db", location: 'default' });
    };

    //當按下建立儲存資料表按鈕時，建立一張test_table資料表，有id、name、number三個欄位
    $(document).on("click", "#btn_add_db", function () {
        //利用Cordova SQLite Storage外掛建立資料表
        db.transaction(
            function (tx) {
                tx.executeSql('create table if not exists test_table (id integer primary key, name text, number integer)');
                //預設新增3筆資料，其中每個?號代表一個欄位的值，?的內容由後面的陣列決定 [1,"xxx",1000]
                tx.executeSql('insert into test_table values (?,?,?)', [1, '我是王大明', 1001]);
                tx.executeSql('insert into test_table values (?,?,?)', [2, '我是王二明', 1002]);
                tx.executeSql('insert into test_table values (?,?,?)', [3, '我是王三明', 1003]);

                //顯示目前test_table的資訊
                db.executeSql('pragma table_info (test_table)', [],
                    function (res) {
                        var strMsg = JSON.stringify(res);
                        alert(strMsg);
                    }
                );
            }
        );
    });

    //當按下刪除儲存資料表按鈕時，刪除test_table
    $(document).on("click", "#btn_del_db", function () {
        db.transaction(function (tx) {
            //刪除test_table資料表
            tx.executeSql('DROP TABLE IF EXISTS test_table');

            //顯示目前test_table的資訊
            db.executeSql("pragma table_info (test_table);", [],
                function (result) {
                    var strMsg = JSON.stringify(result);
                    alert(strMsg);
                }
            );
        });
    })

    //當按下查詢資料總筆數按鈕時，查詢目前test_table中共有多少筆資訊
    $(document).on("click", "#btn_count", function () {
        db.transaction(function (tx) {
            //查詢目前在test_table中共有多少筆資訊
            tx.executeSql("select count(*) as cnt from test_table;", [], function (tx, res) {

                //顯示查詢的資訊，其中res.rows.item(0).cnt為SQL查詢的結果
                var strMsg = "目前共儲存了 " + res.rows.item(0).cnt + " 資料";
                alert(strMsg);
            });
        });
    });

    //當按下查詢所有資料按鈕時，顯示目前test_table所有資料的詳細訊息
    $(document).on("click", "#btn_select", function () {
        db.transaction(function (tx) {
            //查詢test_table所有資料的詳細資訊
            tx.executeSql("select * from test_table order by id desc", [], function (tx, res) {

                //res.rows.length為取得資料的數量
                var strMsg = "目前共有 " + res.rows.length + " 資料\r\n";

                //利用for迴圈，將所有取得的資料印出
                for (var i = 0; i < res.rows.length; i++) {
                    strMsg += "ID:" + res.rows.item(i)["id"] + " 姓名：" + res.rows.item(i)["name"] + " 編號：" + res.rows.item(i)["number"] + "\r\n";
                }
                alert(strMsg);
            });
        });
    });

    //當按下新增資料按鈕時，新增一筆名為爆肝工程師的資料
    $(document).on("click", "#btn_add", function () {
        db.transaction(function (tx) {
            //在sql語法中，?為要新增的值，[]內的值對應前面?的值
            tx.executeSql("insert into test_table (name,number) values (?,?)", ["爆肝工程師", 1004], function (tx, res) {
                alert("新增資料成功！");
            });
        });
    });

    //當按下刪除資料按鈕時，刪除id為4的資料
    $("#btn_del").on("click", function () {
        db.transaction(function (tx) {
            tx.executeSql("delete from test_table where id=?", [4], function (tx, res) {
                alert("刪除資料成功！");
            });
        });
    });

})();