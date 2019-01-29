package db

import (
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/revel/revel"
	"time"
)

var DB *sqlx.DB

func Init() {
	dbDriver := revel.Config.StringDefault("dbType", "mysql")
	dbUserstr := revel.Config.StringDefault("dbuser", "thxview")
	dbPassstr := revel.Config.StringDefault("dbpassword", "Thxview0913!")
	dbNamestr := revel.Config.StringDefault("database", "tcp(thxlab.com:3306)/thxview?parseTime=true")
	// key := revel.Config.StringDefault("key", "LKHlhb899Y09olUi")

	//dbUser, _ := util.Decrypt([]byte(key), dbUserstr)
	//dbPass, _ := util.Decrypt([]byte(key), dbPassstr)
	//dbName, _ := util.Decrypt([]byte(key), dbNamestr)

	var err error
	DB, err = sqlx.Open(dbDriver, dbUserstr+":"+dbPassstr+"@"+dbNamestr+"?parseTime=true")
	if err != nil {
		panic(err.Error())
	}

	go func() {
		time.Sleep(time.Minute * 5)
		err := DB.Ping()
		if err != nil {
			revel.AppLog.Error(err.Error())
		}
	}()
}
