package app

import (
	"fmt"

	"github.com/revel/revel"
	"github.com/thxcloud/thxview/app/db"
	"github.com/thxcloud/thxview/app/elasticsearch"
	"github.com/thxcloud/thxview/app/scheduler"
)

var (
	// AppVersion revel app version (ldflags)
	AppVersion string

	// BuildTime revel app build-time (ldflags)
	BuildTime string
)

//InitDB init DB connection
func InitDB() {
	db.Init()

	elasticsearch.Init()
	if elasticsearch.Client != nil {
		version, _ := elasticsearch.Client.ElasticsearchVersion("https://thxlab.com:9200")
		fmt.Println("Elasticsearch version : " + version)
	}
}

//InitScheduler init schedule job
func InitScheduler() {
	scheduler.ActiveFlowJob()
}

func init() {
	// Filters is the default set of global filters.
	revel.Filters = []revel.Filter{
		revel.PanicFilter,             // Recover from panics and display an error page instead.
		revel.RouterFilter,            // Use the routing table to select the right Action
		revel.FilterConfiguringFilter, // A hook for adding or removing per-Action filters.
		revel.ParamsFilter,            // Parse parameters into Controller.Params.
		CustomHeaderFilter,
		revel.SessionFilter,     // Restore and write the session cookie.
		revel.FlashFilter,       // Restore and write the flash cookie.
		revel.ValidationFilter,  // Restore kept validation errors and save new ones from cookie.
		revel.I18nFilter,        // Resolve the requested language
		HeaderFilter,            // Add some security based headers
		revel.InterceptorFilter, // Run interceptors around the action.
		revel.CompressFilter,    // Compress the result.
		revel.ActionInvoker,     // Invoke the action.
	}

	// Register startup functions with OnAppStart
	// revel.DevMode and revel.RunMode only work inside of OnAppStart. See Example Startup Script
	// ( order dependent )
	// revel.OnAppStart(ExampleStartupScript)
	revel.OnAppStart(InitDB)
	revel.OnAppStart(InitScheduler)
	// revel.OnAppStart(FillCache)
}

// HeaderFilter adds common security headers
// There is a full implementation of a CSRF filter in
// https://github.com/revel/modules/tree/master/csrf
var HeaderFilter = func(c *revel.Controller, fc []revel.Filter) {
	c.Response.Out.Header().Add("X-Frame-Options", "SAMEORIGIN")
	c.Response.Out.Header().Add("X-XSS-Protection", "1; mode=block")
	c.Response.Out.Header().Add("X-Content-Type-Options", "nosniff")
	c.Response.Out.Header().Add("Referrer-Policy", "strict-origin-when-cross-origin")

	fc[0](c, fc[1:]) // Execute the next filter stage.
}

var CustomHeaderFilter = func(c *revel.Controller, fc []revel.Filter) {
	trackingId := c.Request.Header.Get("X-THX-INDEX")
	if trackingId == "" {
		trackingId = "logstash"
	}
	c.Params.Add("trackingId", trackingId)

	fc[0](c, fc[1:]) // Execute the next filter stage.
}

//func ExampleStartupScript() {
//	// revel.DevMod and revel.RunMode work here
//	// Use this script to check for dev mode and set dev/prod startup scripts here!
//	if revel.DevMode == true {
//		// Dev mode
//	}
//}
