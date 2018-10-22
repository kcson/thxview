package controllers

import (
	"context"
	"github.com/olivere/elastic"
	"github.com/revel/revel"
	"github.com/thxcloud/thxview/app/elasticsearch"
	"net/http"
	"strings"
)

type Log struct {
	*revel.Controller
}

func (l Log) SearchLog() revel.Result {
	index := l.Params.Get("trackingId") + "-*"

	//session check
	result := make(map[string]interface{})
	authKey, ok := l.Session["authKey"]
	if !ok || authKey == "" {
		l.Response.Status = http.StatusUnauthorized
		return l.RenderJSON(result)
	}

	ctx := context.Background()
	var reqParam = make(map[string]interface{})

	l.Params.BindJSON(&reqParam)

	searchAfterDate := reqParam["searchAfterDate"]
	searchAfterId := reqParam["searchAfterId"]
	ascending := reqParam["ascending"].(bool)

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(reqParam["fromDate"]).
		Lte(reqParam["toDate"]).
		Format("yyyy-MM-dd").
		TimeZone(reqParam["timeZone"].(string))
	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)

	fetchSourcCtx := elastic.NewFetchSourceContext(true).
		Include(
		"@timestamp",
		"_id",
		"clientip",
		"request",
		"geoip.country_name",
		"geoip.city_name",
		"os",
		"name",
		"member_yn",
		"purchase_yn",
		"referrer")
	searchSource := elastic.NewSearchSource().
		Query(boolQuery).
		FetchSourceContext(fetchSourcCtx).
		Sort("@timestamp", ascending).
		Sort("_id", ascending)

	searchService := elasticsearch.Client.Search().
		Index(index).
		SearchSource(searchSource).
		Size(50)
	if searchAfterDate.(float64) > 0 && strings.Compare(searchAfterId.(string),"") != 0{
		searchService = searchService.SearchAfter(searchAfterDate, searchAfterId)
	}
	results, err := searchService.Do(ctx)
	if err != nil {
		revel.AppLog.Error(err.Error())
		//l.Response.Status = http.StatusInternalServerError
	}

	return l.RenderJSON(results)
}
