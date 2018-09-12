package controllers

import (
	"github.com/revel/revel"
)

type Common struct {
	*revel.Controller
}

func (c Common) Render() revel.Result {
	authKey, ok := c.Session["authKey"]
	if !ok || authKey == "" {
		return c.Redirect(App.Login)
	}

	return c.RenderTemplate("Template.html")
}
