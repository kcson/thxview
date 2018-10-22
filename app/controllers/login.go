package controllers

import (
	"github.com/revel/revel"
	"github.com/thxcloud/thxview/app/routes"
)

type Login struct {
	*revel.Controller
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
