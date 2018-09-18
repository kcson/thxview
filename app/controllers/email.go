package controllers

import (
	"github.com/revel/revel"
	"fmt"
	"context"
	"net/http"
	"github.com/olivere/elastic"
	"github.com/thxcloud/thxview_web/app/elasticsearch"
	"strings"
)

type Email struct {
	*revel.Controller
}

func (e Email) SearchGeneral() revel.Result {
	//session check
	result := make(map[string]interface{})
	authKey, ok := e.Session["authKey"]
	if !ok || authKey == "" {
		e.Response.Status = http.StatusUnauthorized
		return e.RenderJSON(result)
	}

	ctx := context.Background()
	var reqParam = make(map[string]interface{})

	e.Params.BindJSON(&reqParam)

	fmt.Println(reqParam["fromDate"])
	fmt.Println(reqParam["toDate"])

	rangeQuery := elastic.NewRangeQuery("@timestamp").Gte(reqParam["fromDate"]).Lte(reqParam["toDate"]).Format("yyyy-MM-dd").TimeZone(reqParam["timeZone"].(string))
	queryType := elastic.NewMatchQuery("type", "email")
	queryEmailType := elastic.NewMatchQuery("email.type", "General")
	boolQuery := elastic.NewBoolQuery().Must(rangeQuery, queryType, queryEmailType)

	fetchSourcCtx := elastic.NewFetchSourceContext(true).Include("from", "subject", "@timestamp", "message", "contact_info")
	searchSource := elastic.NewSearchSource().Query(boolQuery).FetchSourceContext(fetchSourcCtx).Sort("@timestamp", false)

	results, err := elasticsearch.Client.Search().Index("logstash-2018.05.21").
		SearchSource(searchSource).
		From(int(reqParam["from"].(float64))).Size(10).Do(ctx)

	if err != nil {
		fmt.Println(err.Error())
		e.Response.Status = http.StatusInternalServerError
	}

	return e.RenderJSON(results)
}

func (e Email) SearchMaritime() revel.Result {
	//session check
	result := make(map[string]interface{})
	authKey, ok := e.Session["authKey"]
	if !ok || authKey == "" {
		e.Response.Status = http.StatusUnauthorized
		return e.RenderJSON(result)
	}

	ctx := context.Background()
	var reqParam = make(map[string]interface{})

	e.Params.BindJSON(&reqParam)

	rangeQuery := elastic.NewRangeQuery("@timestamp").Gte(reqParam["fromDate"]).Lte(reqParam["toDate"]).Format("yyyy-MM-dd").TimeZone(reqParam["timeZone"].(string))
	queryType := elastic.NewMatchQuery("type", "email")

	var maritimeType = ""
	maritimeCode := reqParam["maritime"].(string)
	if strings.Compare(maritimeCode, "1") == 0 {
		maritimeType = "tonnage"
	} else if strings.Compare(maritimeCode, "2") == 0 {
		maritimeType = "cargo"
	} else {
		maritimeType = "tc"
	}
	queryEmailType := elastic.NewMatchQuery("email.maritime_type", maritimeType)

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery, queryType, queryEmailType)

	fetchSourcCtx := elastic.NewFetchSourceContext(true).Include("from", "subject", "@timestamp", "email", "message", "contact_info")
	searchSource := elastic.NewSearchSource().Query(boolQuery).FetchSourceContext(fetchSourcCtx).Sort("@timestamp", false)

	results, err := elasticsearch.Client.Search().Index("logstash-2018.05.21").
		SearchSource(searchSource).
		From(int(reqParam["from"].(float64))).Size(10).Do(ctx)

	if err != nil {
		fmt.Println(err.Error())
		e.Response.Status = http.StatusInternalServerError
	}

	return e.RenderJSON(results)
}
