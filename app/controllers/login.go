package controllers

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/revel/revel"
	"log"
	"github.com/thxcloud/thxview/app/routes"
)

type Login struct {
	*revel.Controller
}

func (c Login) dbConn() (db *sql.DB) {
	dbDriver := "mysql"
	dbUser := "express2"
	dbPass := "imsi00"
	dbName := "tcp(127.0.0.1:3306)/exseoul"
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

func (c Login) LoginUser() revel.Result {
	revel.INFO.Println("LoginUser...................................................")
	var reqParam = make(map[string]interface{})
	result := make(map[string]interface{})

	c.Params.BindJSON(&reqParam)

	username := reqParam["username"]
	password := reqParam["password"]
	revel.INFO.Println("username==================", username)
	revel.INFO.Println("password==================", password)

	if username != "" {

		DB := Conn()

		revel.INFO.Println("InitSqlDB Connected......")

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
		revel.INFO.Println("Item num :", len(items))
		revel.INFO.Println("items[0].password:", items[0].password)

		if err != nil {
			revel.INFO.Println("DB Error", err)
		}
		revel.INFO.Println("InitSqlDB Connected")

		if len(items) == 0 {
			revel.INFO.Println("해당 아이디의 사용자가 없습니다............................")
			return c.Redirect(App.Index)
		}

		if len(items) > 0 && password == items[0].password {
			revel.INFO.Println("패스워드가 일치한다...........................")
			result["auth"] = "success"
			//return c.Redirect(App.Dashboard)
		} else {
			revel.INFO.Println("패스워드가 일치하지 않는다...........................")
			result["auth"] = "fail"
			c.Message("패스워드가 틀리다!!!")
			return c.Redirect(App.Index)
		}
		//return c.Redirect(App.Dashboard)
	} else {
		c.Validation.Required(username).Message("Your name is required!")
		result["auth"] = "fail"
		return c.Redirect(routes.App.Index())
	}

	return c.Render()

	//username := reqParam["username"]
	//if username != nil {
	//	c.Session["authKey"] = "authKey"
	//	c.Session["userName"] = username.(string)
	//	result["auth"] = "success"
	//	if strings.Compare(username.(string), "admin") == 0 {
	//		result["role"] = 1
	//	} else {
	//		result["role"] = 2
	//	}
	//	//return c.Redirect(App.Index)
	//} else {
	//	c.Validation.Required(username).Message("Your name is required!")
	//	result["auth"] = "fail"
	//}

	//user := c.getUser(username)
	//if user != nil {
	//	err := bcrypt.CompareHashAndPassword(user.HashedPassword, []byte(password))
	//	if err == nil {
	//		c.Session["user"] = username
	//		c.Flash.Success("" + username)
	//		return c.Redirect(routes.App.Dashboard())
	//	}
	//}
	//c.Flash.Out["username"] = username
	//c.Flash.Error("로그인 실패했습니다")
	//return c.Redirect(routes.App.Index())
}

func (c App) Logout() revel.Result {
	for k := range c.Session {
		delete(c.Session, k)
	}
	return c.Redirect(routes.App.Index())
}
