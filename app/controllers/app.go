package controllers

import (
	"context"
	"fmt"
	"github.com/revel/revel"
	"github.com/thxcloud/thxview/app/db"
	"log"
	"time"
)

type App struct {
	*revel.Controller
}

type Site struct {
	Id         int       `db:"id" json:"id"`
	Title      string    `db:"title" json:"title"`
	Url        string    `db:"url" json:"url"`
	TrackingId string    `db:"tracking_id" json:"tracking_id"`
	Desc       string    `db:"desc" json:"desc"`
	EntryDate  time.Time `db:"entry_date" json:"entry_date"`
	UpdateDate time.Time `db:"update_date" json:"update_date"`
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

var ctx = context.Background()

func (c App) CreateSession() revel.Result {
	var reqParam = make(map[string]interface{})
	result := make(map[string]interface{})

	c.Params.BindJSON(&reqParam)

	username := reqParam["username"]
	password := reqParam["password"]

	//Login Check start
	if username != nil && password != nil {
		rows, err := db.DB.QueryxContext(ctx, "SELECT id,password,role,username FROM thx_employee WHERE id=?", username)
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

		type userInfo struct {
			Id       string `db:"id"`
			Password string `db:"password"`
			Role     int    `db:"role"`
			Username string `db:"username"`
		}

		var items []userInfo
		for rows.Next() {
			item := userInfo{}

			err := rows.StructScan(&item)
			CheckErr(err)

			revel.AppLog.Infof("Item id : %s", item.Id)
			revel.AppLog.Infof("Item password : %s", item.Password)
			revel.AppLog.Infof("Item role : %d", item.Role)
			revel.AppLog.Infof("Item username : %s", item.Username)

			items = append(items, item)
		}

		if err != nil {
			revel.INFO.Println("DB Error", err)
		}

		if len(items) == 0 {
			return c.Redirect(App.Index)
		}

		var sites []Site
		if len(items) > 0 && password == items[0].Password {
			c.Session["authKey"] = "authKey"
			c.Session["userName"] = username.(string)
			result["auth"] = "success"
			result["role"] = items[0].Role
			result["user_id"] = items[0].Id
			result["user_name"] = items[0].Username

			//관리 사이트
			rows, err := db.DB.Queryx("SELECT "+
				"b.id,"+
				"b.title,"+
				"b.url,"+
				"b.tracking_id,"+
				"b.desc,"+
				"b.entry_date,"+
				"b.update_date"+
				" FROM "+
				"user_site a INNER JOIN site b ON a.site_id = b.id "+
				" WHERE "+
				"a.user_id=?", username)
			if err != nil {
				revel.AppLog.Error(err.Error())
				result["sites"] = sites
				return c.RenderJSON(result)
			}

			for rows.Next() {
				site := Site{}
				err := rows.StructScan(&site)
				if err != nil {
					revel.AppLog.Error(err.Error())
					break
				}
				sites = append(sites, site)
			}
			result["sites"] = sites
			return c.RenderJSON(result)
			//return c.Redirect(App.Dashboard)
		} else {
			result["auth"] = "fail"
			result["message"] = "Password is wrong!"

			return c.RenderJSON(result)
		}
	} else {
		c.Validation.Required(username).Message("Your name is required!")
		result["auth"] = "fail"
		result["message"] = "Your name is required!"
		return c.Redirect(App.Index)
	}
	//Login Check end

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
