package controllers

import (
	"github.com/revel/revel"
	"fmt"
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

func (c App) CreateSession() revel.Result {
	var reqParam = make(map[string]interface{})
	result := make(map[string]interface{})

	c.Params.BindJSON(&reqParam)

	username := reqParam["username"]
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
