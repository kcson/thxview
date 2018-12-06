package controllers

import (
	"context"
	"fmt"

	"github.com/revel/revel"
	"github.com/thxcloud/thxview/app/mapper"
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

var ctx = context.Background()

func (c App) CreateSession() revel.Result {
	var reqParam = make(map[string]interface{})
	result := make(map[string]interface{})

	c.Params.BindJSON(&reqParam)

	username := reqParam["username"]
	password := reqParam["password"]

	//Login Check start
	if username != nil && password != nil {
		items, err := mapper.SelectUserInfoByID(username.(string))
		if err != nil {
			result["auth"] = "fail"
			result["message"] = "Your name is required!"
			return c.Redirect(App.Index)
		}
		if len(items) == 0 {
			return c.Redirect(App.Index)
		}

		if len(items) > 0 && password == items[0].Password {
			c.Session["authKey"] = "authKey"
			c.Session["userName"] = username.(string)
			result["auth"] = "success"
			result["role"] = items[0].Role
			result["user_id"] = items[0].Id
			result["user_name"] = items[0].Username

			//관리 사이트
			sites, err := mapper.SelectUserSiteByUserID(username.(string))
			if err != nil {
				revel.AppLog.Error(err.Error())
				return c.RenderJSON(result)
			}
			result["sites"] = sites

			//권한이 있는 메뉴
			menus, err := mapper.SelectUserMenuByUserID(username.(string))
			if err != nil {
				revel.AppLog.Error(err.Error())
				return c.RenderJSON(result)
			}
			result["menus"] = menus

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
