package controllers

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/revel/revel"
	"github.com/thxcloud/thxview/app/config"
	"github.com/thxcloud/thxview/app/routes"
)

type Login struct {
	*revel.Controller
}

func dbConn() (db *sql.DB) {
	config := config.ReadConfig()
	//fmt.Printf("%s: %s: %s\n", config.Dbpassword, config.Database, config.DbUser)

	dbDriver := "mysql"
	dbUserstr := config.DbUser
	dbPassstr := config.Dbpassword
	dbNamestr := config.Database
	key := config.Key

	revel.INFO.Println("dbUserstr ============== :", dbUserstr)
	revel.INFO.Println("dbPassstr ============== :", dbPassstr)
	revel.INFO.Println("dbNamestr ============== :", dbNamestr)
	revel.INFO.Println("key ============== :", key)

	dbUser, _ := decrypt([]byte(key), dbUserstr)
	dbPass, _ := decrypt([]byte(key), dbPassstr)
	dbName, _ := decrypt([]byte(key), dbNamestr)
	revel.INFO.Println("dbUser ============== :", dbUser)
	revel.INFO.Println("dbPass ============== :", dbPass)
	revel.INFO.Println("dbName ============== :", dbName)

	db, err := sql.Open(dbDriver, dbUser+":"+dbPass+"@"+dbName)
	if err != nil {
		panic(err.Error())
	}
	return db
}

//CheckErr
func CheckErr(err error) {
	if err != nil {
		panic(err)
	}
}

func (c App) Logout() revel.Result {
	for k := range c.Session {
		delete(c.Session, k)
	}
	return c.Redirect(routes.App.Index())
}
