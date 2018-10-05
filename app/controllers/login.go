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
	dbUser := config.DbUser
	dbPass := config.Dbpassword
	dbName := config.Database
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
