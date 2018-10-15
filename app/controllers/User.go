package controllers

import (
	_ "database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/revel/revel"
	"log"
	"net/http"
)

type User struct {
	*revel.Controller
}

type userInfo struct {
	Id       string `json:"id"`
	Password string `json:"password"`
	Role     int    `json:"role"`
	Username string `json:"username"`
}

func (u User) SelectUserList() revel.Result {
	//session check
	result := make(map[string]interface{})
	authKey, ok := u.Session["authKey"]
	if !ok || authKey == "" {
		u.Response.Status = http.StatusUnauthorized
		return u.RenderJSON(result)
	}

	var reqParam = make(map[string]interface{})
	u.Params.BindJSON(&reqParam)

	DB := dbConn()
	rows, err := DB.QueryContext(ctx, "SELECT id,password,role,username FROM thx_employee order by ?", "desc")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var items []userInfo

	for rows.Next() {
		item := userInfo{}

		err := rows.Scan(
			&item.Id,
			&item.Password,
			&item.Role,
			&item.Username,
		)
		CheckErr(err)

		items = append(items, item)
	}
	//revel.INFO.Println("items====", items)

	if err != nil {
		revel.INFO.Println("DB Error", err)
	}
	return u.RenderJSON(items)
}

func (u User) LoadUserList() revel.Result {
	//session check
	result := make(map[string]interface{})
	authKey, ok := u.Session["authKey"]
	if !ok || authKey == "" {
		u.Response.Status = http.StatusUnauthorized
		return u.RenderJSON(result)
	}

	var reqParam = make(map[string]interface{})
	u.Params.BindJSON(&reqParam)

	id := reqParam["id"]
	revel.INFO.Println("LoadUserList id...====", id)
	DB := dbConn()
	rows, err := DB.QueryContext(ctx, "SELECT id,password,role,username FROM thx_employee WHERE id= ?", id)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var items []userInfo

	for rows.Next() {
		item := userInfo{}

		err := rows.Scan(
			&item.Id,
			&item.Password,
			&item.Role,
			&item.Username,
		)
		CheckErr(err)

		items = append(items, item)
		return u.RenderJSON(item)
	}
	//revel.INFO.Println("items====", items)

	if err != nil {
		revel.INFO.Println("DB Error", err)
	}
	return u.RenderJSON(items)
}

func (u User) AddUserSave() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := u.Session["authKey"]
	if !ok || authKey == "" {
		u.Response.Status = http.StatusUnauthorized
		return u.RenderJSON(result)
	}

	reqParam := make(map[string]interface{})
	u.Params.BindJSON(&reqParam)

	id := reqParam["id"]
	password := reqParam["password"]
	role := reqParam["role"]
	username := reqParam["username"]
	//revel.INFO.Println("AddUserSave id...====", id)
	//revel.INFO.Println("AddUserSave password...====", password)
	//revel.INFO.Println("AddUserSave role...====", role)
	//revel.INFO.Println("AddUserSave username...====", username)

	if id != nil && username != nil && password != nil && role != nil {
		DB := dbConn()
		// Insert
		stmt, err := DB.Prepare("INSERT thx_employee SET id=?,password=?, role=?, username=?")
		CheckErr(err)

		res, err := stmt.Exec(id, password, role, username)
		CheckErr(err)

		//// sql.Result.RowsAffected() 체크
		n, err := res.RowsAffected()
		if n == 1 {
			revel.INFO.Println("1 row inserted.")
		}
		CheckErr(err)

		if err != nil {
			result["auth"] = "fail"
			revel.INFO.Println("DB Error", err)
		}
		result["auth"] = "success"
	} else {
		result["auth"] = "fail"
	}

	return u.RenderJSON(result)
}

func (u User) DeleteUser() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := u.Session["authKey"]
	if !ok || authKey == "" {
		u.Response.Status = http.StatusUnauthorized
		return u.RenderJSON(result)
	}

	reqParam := make(map[string]interface{})
	u.Params.BindJSON(&reqParam)

	id := reqParam["id"]
	revel.INFO.Println("DeleteUser id...====", id)

	if id != nil {
		DB := dbConn()

		// Modify some data in table.
		rows, err := DB.Exec("DELETE FROM thx_employee WHERE id=?", id)
		CheckErr(err)

		rowCount, err := rows.RowsAffected()
		revel.INFO.Println("Deleted %d row(s) of data.\n", rowCount)
		revel.INFO.Println("Done.")

		if err != nil {
			result["auth"] = "fail"
			revel.INFO.Println("DB Error", err)
		}
		result["auth"] = "success"
	} else {
		result["auth"] = "fail"
	}

	return u.RenderJSON(result)
}

func (u User) UpdateUser() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := u.Session["authKey"]
	if !ok || authKey == "" {
		u.Response.Status = http.StatusUnauthorized
		return u.RenderJSON(result)
	}

	reqParam := make(map[string]interface{})
	u.Params.BindJSON(&reqParam)

	id := reqParam["id"]
	password := reqParam["password"]
	role := reqParam["role"]
	username := reqParam["username"]
	//revel.INFO.Println("UpdateUser id...====", id)
	//revel.INFO.Println("UpdateUser password...====", password)
	//revel.INFO.Println("UpdateUser role...====", role)
	//revel.INFO.Println("UpdateUser username...====", username)

	if id != nil && username != nil && password != nil && role != nil {
		DB := dbConn()

		// Modify some data in table.
		rows, err := DB.Exec("UPDATE thx_employee SET password = ?, role = ?, username = ?  WHERE id = ?", password, role, username, id)
		CheckErr(err)
		rowCount, err := rows.RowsAffected()
		fmt.Printf("Update %d row(s) of data.\n", rowCount)
		fmt.Println("Done.")

		if err != nil {
			result["auth"] = "fail"
			revel.INFO.Println("DB Error", err)
		}
		result["auth"] = "success"
	} else {
		result["auth"] = "fail"
	}

	return u.RenderJSON(result)
}

//func main() {
//
//}
