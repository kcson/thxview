package controllers

import (
	"github.com/revel/revel"
	"net/http"
	"github.com/kcson/thxview_web/app/elasticsearch"
	"github.com/olivere/elastic"
	"context"
	"strings"
)

type Information struct {
	*revel.Controller `json:"-"`
	Name     string   `json:"name"`
	PageView int      `json:"page_view"`
	NewUser  int      `json:"new_user"`
	User     int      `json:"user"`
	Customer int      `json:"customer"`
	Member   int      `json:"member"`
}

type Location struct {
	Information
	CountryCode string `json:"country_code"`
}

type OS struct {
	Name   string `json:"name"`
	Count  int    `json:"count"`
	Detail []OS   `json:"detail"`
}

type Browser struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

func (i Information) SummaryOS() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := i.Session["authKey"]
	if !ok || authKey == "" {
		i.Response.Status = http.StatusUnauthorized
		return i.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	i.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}
	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
	termAggs := elastic.NewTermsAggregation().Field("os_name.keyword").Size(10)
	os, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("os", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		i.Response.Status = http.StatusInternalServerError
		return i.RenderJSON(result)
	}
	var osTotal []OS
	windows := OS{Name: "Windows", Count: 0, Detail: []OS{},}
	mac := OS{Name: "Mac", Count: 0, Detail: []OS{},}
	linux := OS{Name: "Linux", Count: 0, Detail: []OS{},}
	ios := OS{Name: "iOS", Count: 0, Detail: []OS{},}
	android := OS{Name: "Android", Count: 0, Detail: []OS{},}
	other := OS{Name: "other", Count: 0, Detail: []OS{},}

	bucketItems, _ := os.Aggregations.Terms("os")
	buckets := bucketItems.Buckets
	for _, bucket := range buckets {
		osName := strings.ToLower(bucket.Key.(string))
		docCount := bucket.DocCount
		if strings.HasPrefix(osName, "window") {
			windows.Count += int(docCount)
			o := OS{Name: osName, Count: int(docCount)}
			windows.Detail = append(windows.Detail, o)
		} else if strings.HasPrefix(osName, "mac") {
			mac.Count += int(docCount)
			o := OS{Name: osName, Count: int(docCount)}
			mac.Detail = append(mac.Detail, o)
		} else if strings.HasPrefix(osName, "linux") {
			linux.Count += int(docCount)
			o := OS{Name: osName, Count: int(docCount)}
			linux.Detail = append(linux.Detail, o)
		} else if strings.HasPrefix(osName, "ios") {
			ios.Count += int(docCount)
			o := OS{Name: osName, Count: int(docCount)}
			ios.Detail = append(ios.Detail, o)
		} else if strings.HasPrefix(osName, "android") {
			android.Count += int(docCount)
			o := OS{Name: osName, Count: int(docCount)}
			android.Detail = append(android.Detail, o)
		} else {
			other.Count += int(docCount)
			o := OS{Name: osName, Count: int(docCount)}
			other.Detail = append(other.Detail, o)
		}
	}
	osTotal = append(osTotal, windows)
	osTotal = append(osTotal, mac)
	osTotal = append(osTotal, linux)
	osTotal = append(osTotal, ios)
	osTotal = append(osTotal, android)
	osTotal = append(osTotal, other)

	return i.RenderJSON(osTotal)
}

func (i Information) SummaryBrowser() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := i.Session["authKey"]
	if !ok || authKey == "" {
		i.Response.Status = http.StatusUnauthorized
		return i.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	i.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}
	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
	termAggs := elastic.NewTermsAggregation().Field("name.keyword").Size(10)
	os, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("browser", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		i.Response.Status = http.StatusInternalServerError
		return i.RenderJSON(result)
	}
	var browserTotal []Browser

	bucketItems, _ := os.Aggregations.Terms("browser")
	buckets := bucketItems.Buckets
	for _, bucket := range buckets {
		browserName := strings.ToLower(bucket.Key.(string))
		docCount := bucket.DocCount

		browserTotal = append(browserTotal, Browser{browserName, int(docCount)})
	}

	return i.RenderJSON(browserTotal)
}

func (i Information) TrafficSource() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := i.Session["authKey"]
	if !ok || authKey == "" {
		i.Response.Status = http.StatusUnauthorized
		return i.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	i.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}

	boolQuery := elastic.NewBoolQuery()

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))
	boolQuery.Must(rangeQuery)

	visitAggs := elastic.NewTermsAggregation().Field("first_visit")
	memberAggs := elastic.NewTermsAggregation().Field("member_yn")
	termAggs := elastic.NewTermsAggregation().
		Field("referrer.keyword").
		Size(50).
		Exclude(".*" + requestParams["exclude"].(string) + ".*").
		SubAggregation("visit", visitAggs).
		SubAggregation("member", memberAggs)
	path := requestParams["path"]
	if path != nil && path != "" {
		termAggs.Include(".*" + path.(string) + ".*")
	}

	source, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("traffic_source", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		i.Response.Status = http.StatusInternalServerError
		return i.RenderJSON(result)
	}
	var sourceTotal []Information

	bucketItems, _ := source.Aggregations.Terms("traffic_source")
	buckets := bucketItems.Buckets
	for _, bucket := range buckets {
		t := Information{}

		t.Name = strings.Trim(bucket.Key.(string), "\"")
		t.PageView = int(bucket.DocCount)

		//member type
		mBucketItems, _ := bucket.Terms("member")
		mBuckets := mBucketItems.Buckets
		for _, mBucket := range mBuckets {
			if mBucket.Key.(float64) == 0 {
				t.Customer = int(mBucket.DocCount)
			} else {
				t.Member = int(mBucket.DocCount)
			}
		}

		//visit type
		vBucketItems, _ := bucket.Terms("visit")
		vBuckets := vBucketItems.Buckets
		for _, vBucket := range vBuckets {
			if vBucket.Key.(float64) == 0 {
				t.User = int(vBucket.DocCount)
			} else {
				t.NewUser = int(vBucket.DocCount)
			}
		}
		sourceTotal = append(sourceTotal, t)
	}

	return i.RenderJSON(sourceTotal)
}

func (i Information) OS() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := i.Session["authKey"]
	if !ok || authKey == "" {
		i.Response.Status = http.StatusUnauthorized
		return i.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	i.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}

	boolQuery := elastic.NewBoolQuery()

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))
	boolQuery.Must(rangeQuery)

	visitAggs := elastic.NewTermsAggregation().Field("first_visit")
	memberAggs := elastic.NewTermsAggregation().Field("member_yn")
	termAggs := elastic.NewTermsAggregation().
		Field("os_name.keyword").
		Size(50).
		SubAggregation("visit", visitAggs).
		SubAggregation("member", memberAggs)
	osName := requestParams["osName"]
	if osName != nil && osName != "" {
		termAggs.Include(".*" + osName.(string) + ".*")
	}

	source, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("os", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		i.Response.Status = http.StatusInternalServerError
		return i.RenderJSON(result)
	}
	var osTotal []Information

	bucketItems, _ := source.Aggregations.Terms("os")
	buckets := bucketItems.Buckets
	for _, bucket := range buckets {
		o := Information{}

		o.Name = bucket.Key.(string)
		o.PageView = int(bucket.DocCount)

		//member type
		mBucketItems, _ := bucket.Terms("member")
		mBuckets := mBucketItems.Buckets
		for _, mBucket := range mBuckets {
			if mBucket.Key.(float64) == 0 {
				o.Customer = int(mBucket.DocCount)
			} else {
				o.Member = int(mBucket.DocCount)
			}
		}

		//visit type
		vBucketItems, _ := bucket.Terms("visit")
		vBuckets := vBucketItems.Buckets
		for _, vBucket := range vBuckets {
			if vBucket.Key.(float64) == 0 {
				o.User = int(vBucket.DocCount)
			} else {
				o.NewUser = int(vBucket.DocCount)
			}
		}
		osTotal = append(osTotal, o)
	}

	return i.RenderJSON(osTotal)
}

func (i Information) Browser() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := i.Session["authKey"]
	if !ok || authKey == "" {
		i.Response.Status = http.StatusUnauthorized
		return i.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	i.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}

	boolQuery := elastic.NewBoolQuery()

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))
	boolQuery.Must(rangeQuery)

	visitAggs := elastic.NewTermsAggregation().Field("first_visit")
	memberAggs := elastic.NewTermsAggregation().Field("member_yn")
	termAggs := elastic.NewTermsAggregation().
		Field("name.keyword").
		Size(50).
		SubAggregation("visit", visitAggs).
		SubAggregation("member", memberAggs)
	browserName := requestParams["browserName"]
	if browserName != nil && browserName != "" {
		termAggs.Include(".*" + browserName.(string) + ".*")
	}

	source, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("browser", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		i.Response.Status = http.StatusInternalServerError
		return i.RenderJSON(result)
	}
	var bTotal []Information

	bucketItems, _ := source.Aggregations.Terms("browser")
	buckets := bucketItems.Buckets
	for _, bucket := range buckets {
		b := Information{}

		b.Name = bucket.Key.(string)
		b.PageView = int(bucket.DocCount)

		//member type
		mBucketItems, _ := bucket.Terms("member")
		mBuckets := mBucketItems.Buckets
		for _, mBucket := range mBuckets {
			if mBucket.Key.(float64) == 0 {
				b.Customer = int(mBucket.DocCount)
			} else {
				b.Member = int(mBucket.DocCount)
			}
		}

		//visit type
		vBucketItems, _ := bucket.Terms("visit")
		vBuckets := vBucketItems.Buckets
		for _, vBucket := range vBuckets {
			if vBucket.Key.(float64) == 0 {
				b.User = int(vBucket.DocCount)
			} else {
				b.NewUser = int(vBucket.DocCount)
			}
		}
		bTotal = append(bTotal, b)
	}

	return i.RenderJSON(bTotal)
}

func (i Information) Location() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := i.Session["authKey"]
	if !ok || authKey == "" {
		i.Response.Status = http.StatusUnauthorized
		return i.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	i.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}

	boolQuery := elastic.NewBoolQuery()

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))
	boolQuery.Must(rangeQuery)

	groupbyField := "geoip.country_name.keyword"
	countryCode := requestParams["countryCode"]
	if countryCode != nil && countryCode != "" {
		groupbyField = "geoip.region_name.keyword"
		countryTerm := elastic.NewTermQuery("geoip.country_code2.keyword", strings.ToUpper(countryCode.(string)))
		boolQuery.Must(countryTerm)
	}

	visitAggs := elastic.NewTermsAggregation().Field("first_visit")
	memberAggs := elastic.NewTermsAggregation().Field("member_yn")
	cCodeAggs := elastic.NewTermsAggregation().Field("geoip.country_code2.keyword").
		SubAggregation("visit", visitAggs).
		SubAggregation("member", memberAggs)
	termAggs := elastic.NewTermsAggregation().
		Field(groupbyField).
		Size(50).
		SubAggregation("country_code", cCodeAggs)

	countryName := requestParams["countryName"]
	if countryName != nil && countryName != "" {
		termAggs.Include(".*" + countryName.(string) + ".*")
	}

	source, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("location", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		i.Response.Status = http.StatusInternalServerError
		return i.RenderJSON(result)
	}
	var lTotal []Location

	bucketItems, _ := source.Aggregations.Terms("location")
	buckets := bucketItems.Buckets
	for _, bucket := range buckets {
		l := Location{}

		l.Name = bucket.Key.(string)
		l.PageView = int(bucket.DocCount)

		//country code
		cBucketItems, _ := bucket.Terms("country_code")
		cBuckets := cBucketItems.Buckets
		for _, cBucket := range cBuckets {
			l.CountryCode = strings.ToLower(cBucket.Key.(string))

			//member type
			mBucketItems, _ := cBucket.Terms("member")
			mBuckets := mBucketItems.Buckets
			for _, mBucket := range mBuckets {
				if mBucket.Key.(float64) == 0 {
					l.Customer = int(mBucket.DocCount)
				} else {
					l.Member = int(mBucket.DocCount)
				}
			}

			//visit type
			vBucketItems, _ := cBucket.Terms("visit")
			vBuckets := vBucketItems.Buckets
			for _, vBucket := range vBuckets {
				if vBucket.Key.(float64) == 0 {
					l.User = int(vBucket.DocCount)
				} else {
					l.NewUser = int(vBucket.DocCount)
				}
			}
		}

		lTotal = append(lTotal, l)
	}

	return i.RenderJSON(lTotal)
}
