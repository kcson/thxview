package controllers

import (
	_ "fmt"
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

func main() {

}
