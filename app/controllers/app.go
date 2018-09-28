package controllers

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/revel/revel"
	"log"
	"strings"
)

type App struct {
	*revel.Controller
}

func (c App) Index() revel.Result {
	authKey, ok := c.Session["authKey"]
	if !ok || authKey == "" {
		return c.Redirect(App.Login)
	}
	fmt.Println(authKey)

	return c.Render()
}

func (c App) Login() revel.Result {
	return c.Render()
}

func Conn() (db *sql.DB) {
	dbDriver := "mysql"
	dbUser := "thxview"
	dbPass := "Thxview0913!"
	dbName := "tcp(13.124.41.61:3306)/thxview"
	db, err := sql.Open(dbDriver, dbUser+":"+dbPass+"@"+dbName)
	if err != nil {
		panic(err.Error())
	}
	return db
}

var ctx = context.Background()

func (c App) CreateSession() revel.Result {
	//revel.INFO.Println("CreateSession.logincheck ========")
	var reqParam = make(map[string]interface{})
	result := make(map[string]interface{})

	c.Params.BindJSON(&reqParam)

	username := reqParam["username"]
	password := reqParam["password"]
	//revel.INFO.Println("username==================", username)
	//revel.INFO.Println("password==================", password)

	//Login Check start
	if username != nil && password != nil {

		DB := Conn()
		//DB := Login.dbConn()
		revel.INFO.Println("CreateSession.logincheck : DB Connected......")

		rows, err := DB.QueryContext(ctx, "SELECT id,password,role FROM thx_employee WHERE id=?", username)
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

		type userInfo struct {
			id       string
			password string
			role     int
		}

		var items []userInfo
		for rows.Next() {
			item := userInfo{}

			err := rows.Scan(
				&item.id,
				&item.password,
				&item.role,
			)
			CheckErr(err)

			revel.INFO.Println("Item id :", item.id)
			revel.INFO.Println("Item password :", item.password)
			revel.INFO.Println("Item role :", item.role)

			items = append(items, item)
		}
		//revel.INFO.Println("Item num :", len(items))
		//revel.INFO.Println("items[0].password:", items[0].password)

		if err != nil {
			revel.INFO.Println("DB Error", err)
		}

		if len(items) == 0 {
			revel.INFO.Println("CreateSession.logincheck : There is no user.....")
			return c.Redirect(App.Index)
		}

		if len(items) > 0 && password == items[0].password {
			revel.INFO.Println("CreateSession.logincheck : Password matching.....")
			result["auth"] = "success"
			//return c.Redirect(App.Dashboard)
		} else {
			revel.INFO.Println("CreateSession.logincheck : Password is wrong.....")
			result["auth"] = "fail"
			c.Message("Password is wrong!!!")
			return c.Redirect(App.Index)
		}
		//return c.Redirect(App.Dashboard)
	} else {
		revel.INFO.Println("CreateSession.logincheck : Missing value.....")
		c.Validation.Required(username).Message("Your name is required!")
		result["auth"] = "fail"
		return c.Redirect(App.Index)
	}

	//Login Check end

	if username != nil {
		c.Session["authKey"] = "authKey"
		c.Session["userName"] = username.(string)
		result["auth"] = "success"
		if strings.Compare(username.(string), "admin") == 0 {
			result["role"] = 1
		} else {
			result["role"] = 2
		}
		//return c.Redirect(App.Index)
	} else {
		result["auth"] = "fail"
	}
	return c.RenderJSON(result)
}

func (c App) DeleteSession() revel.Result {
	authKey, ok := c.Session["authKey"]
	if ok && authKey != "" {
		delete(c.Session, "authKey")
	}

	return c.RenderText("logout")
}

func (c App) Dashboard() revel.Result {
	authKey, ok := c.Session["authKey"]
	if !ok || authKey == "" {
		return c.Redirect(App.Login)
	}

	return c.Render()
}
