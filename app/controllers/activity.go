package controllers

import (
	"context"
	"encoding/json"
	"math"
	"net/http"

	"github.com/olivere/elastic"
	"github.com/revel/revel"
	"github.com/thxcloud/thxview/app/elasticsearch"
)

type Activity struct {
	*revel.Controller
}

type VisitUser struct {
	Total    int `json:"total"`
	Member   int `json:"member"`
	Customer int `json:"customer"`
	Return   int `json:"return"`
	New      int `json:"new"`
}

//TopPage ...
type TopPage struct {
	Index   int     `json:"index"`
	Page    string  `json:"page"`
	Desc    string  `json:"desc"`
	Count   int     `json:"count"`
	Ratio   float64 `json:"ratio"`
	Content string  `json:"content"`
}

type Purchase struct {
	Item     string  `json:"item"`
	Customer int     `json:"customer"`
	Member   int     `json:"member"`
	Pc       int     `json:"pc"`
	Mobile   int     `json:"mobile"`
	Amount   float64 `json:"amount"`
}

func (a Activity) SummaryVisitUser() revel.Result {
	index := a.Params.Get("trackingId") + "-*"

	result := make(map[string]interface{})
	authKey, ok := a.Session["authKey"]
	if !ok || authKey == "" {
		a.Response.Status = http.StatusUnauthorized
		return a.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	a.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}
	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)

	totalAggs := elastic.NewCardinalityAggregation().Field("thx_id.keyword")
	memberAggs := elastic.NewTermsAggregation().Field("member_yn").SubAggregation("user_count", totalAggs)
	userAggs := elastic.NewTermsAggregation().Field("first_visit").SubAggregation("user_count", totalAggs)
	user, err := elasticsearch.Client.Search().
		Index(index).
		Size(0).
		Aggregation("total_user", totalAggs).
		Aggregation("member", memberAggs).
		Aggregation("user", userAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		a.Response.Status = http.StatusInternalServerError
		return a.RenderJSON(result)
	}
	v := VisitUser{}

	//total user
	t, _ := user.Aggregations.Cardinality("total_user")
	v.Total = int(*t.Value)

	//member
	m, _ := user.Aggregations.Terms("member")
	mBuckets := m.Buckets
	for _, mBucket := range mBuckets {
		if mBucket.Key.(float64) == 1 {
			mUser, _ := mBucket.Aggregations.Cardinality("user_count")
			v.Member = int(*mUser.Value)
		}
	}
	v.Customer = v.Total - v.Member

	//new user
	u, _ := user.Aggregations.Terms("user")
	uBuckets := u.Buckets
	for _, uBucket := range uBuckets {
		if uBucket.Key.(float64) == 1 {
			uUser, _ := uBucket.Aggregations.Cardinality("user_count")
			v.New = int(*uUser.Value)
		}
	}
	v.Return = v.Total - v.New

	return a.RenderJSON(v)
}

func (a Activity) SummaryVisitChange() revel.Result {
	index := a.Params.Get("trackingId") + "-*"

	result := make(map[string]interface{})
	authKey, ok := a.Session["authKey"]
	if !ok || authKey == "" {
		a.Response.Status = http.StatusUnauthorized
		return a.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	a.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}
	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)

	vUserAggs := elastic.NewDateHistogramAggregation().
		Field("@timestamp").
		Interval(requestParams["interval"].(string)).
		TimeZone(requestParams["timeZone"].(string))

	totalAggs := elastic.NewCardinalityAggregation().Field("thx_id.keyword")
	userCountAggs := elastic.NewTermsAggregation().Field("first_visit")
	userCountAggs.SubAggregation("user_count", totalAggs)

	vUserAggs.SubAggregation("total", totalAggs)
	vUserAggs.SubAggregation("visit_count", userCountAggs)

	resultAggs, err := elasticsearch.Client.Search().
		Index(index).
		Size(0).
		Aggregation("visit_user", vUserAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		a.Response.Status = http.StatusInternalServerError
		return a.RenderJSON(result)
	}
	var key []int64
	var total, new, r []int

	vUser, _ := resultAggs.Aggregations.DateHistogram("visit_user")
	vuBuckets := vUser.Buckets
	for index, vuBucket := range vuBuckets {
		new = append(new, 0)
		r = append(r, 0)

		keyValue := int64(vuBucket.Key)
		key = append(key, keyValue)

		vTotal, _ := vuBucket.Cardinality("total")
		totalValue := int(*vTotal.Value)
		total = append(total, totalValue)

		vCount, _ := vuBucket.Aggregations.Terms("visit_count")
		vcBuckets := vCount.Buckets
		for _, vcBucket := range vcBuckets {
			uc, _ := vcBucket.Cardinality("user_count")
			vcReturn, vcNew := 0, 0
			vcKeyValue := vcBucket.Key.(float64)
			if vcKeyValue == 1 {
				vcNew = int(*uc.Value)
				new[index] = vcNew
				r[index] = totalValue - vcNew
			} else {
				vcReturn = int(*uc.Value)
				if vcNew == 0 {
					r[index] = vcReturn
				}
			}
		}
	}
	result["key"] = key
	result["total"] = total
	result["new"] = new
	result["return"] = r

	return a.RenderJSON(result)
}

func (a Activity) SummaryTopPage() revel.Result {
	index := a.Params.Get("trackingId") + "-*"

	result := make(map[string]interface{})
	authKey, ok := a.Session["authKey"]
	if !ok || authKey == "" {
		a.Response.Status = http.StatusUnauthorized
		return a.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	a.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}
	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
	termAggs := elastic.NewTermsAggregation().Field("request.keyword").Size(5)
	resultAggs, err := elasticsearch.Client.Search().
		Index(index).
		Size(0).
		Aggregation("top_page", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		a.Response.Status = http.StatusInternalServerError
		return a.RenderJSON(result)
	}

	var tTotal []TopPage
	totalHits := resultAggs.Hits.TotalHits
	tpAggs, _ := resultAggs.Aggregations.Terms("top_page")
	tpBuckets := tpAggs.Buckets
	for _, tpBucket := range tpBuckets {
		t := TopPage{}
		t.Page = tpBucket.Key.(string)
		t.Count = int(tpBucket.DocCount)
		t.Desc = "-"

		t.Ratio = math.Round(float64(t.Count)/float64(totalHits)*100*100) / 100

		tTotal = append(tTotal, t)
	}

	return a.RenderJSON(tTotal)
}

func (a Activity) SummarySignUp() revel.Result {
	index := a.Params.Get("trackingId") + "-*"

	result := make(map[string]interface{})
	authKey, ok := a.Session["authKey"]
	if !ok || authKey == "" {
		a.Response.Status = http.StatusUnauthorized
		return a.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	a.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}
	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
	termAggs := elastic.NewTermsAggregation().Field("signup_yn").IncludeValues(1)
	fvAggs := elastic.NewTermsAggregation().Field("first_visit")
	termAggs.SubAggregation("visit_user", fvAggs)

	result["first_visit"] = 0
	result["return_visit"] = 0

	resultAggs, err := elasticsearch.Client.Search().
		Index(index).
		Size(0).
		Aggregation("sign_up", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		a.Response.Status = http.StatusInternalServerError
		return a.RenderJSON(result)
	}
	suAggs, _ := resultAggs.Aggregations.Terms("sign_up")
	suBuckets := suAggs.Buckets
	for _, suBucket := range suBuckets {
		vuAggs, _ := suBucket.Terms("visit_user")
		vuBuckets := vuAggs.Buckets
		for _, vuBucket := range vuBuckets {
			if vuBucket.Key.(float64) == 0 {
				result["return_visit"] = vuBucket.DocCount
			} else {
				result["first_visit"] = vuBucket.DocCount
			}
		}
	}

	return a.RenderJSON(result)
}

func (a Activity) SummaryPurchase() revel.Result {
	index := a.Params.Get("trackingId") + "-*"

	result := make(map[string]interface{})
	authKey, ok := a.Session["authKey"]
	if !ok || authKey == "" {
		a.Response.Status = http.StatusUnauthorized
		return a.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	a.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}
	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
	termAggs := elastic.NewTermsAggregation().Field("purchase_yn").IncludeValues(1)
	myAggs := elastic.NewTermsAggregation().Field("member_yn")
	termAggs.SubAggregation("member", myAggs)

	result["customer"] = 0
	result["member"] = 0

	resultAggs, err := elasticsearch.Client.Search().
		Index(index).
		Size(0).
		Aggregation("purchase", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		a.Response.Status = http.StatusInternalServerError
		return a.RenderJSON(result)
	}
	pAggs, _ := resultAggs.Aggregations.Terms("purchase")
	pBuckets := pAggs.Buckets
	for _, pBucket := range pBuckets {
		mAggs, _ := pBucket.Terms("member")
		mBuckets := mAggs.Buckets
		for _, mBucket := range mBuckets {
			if mBucket.Key.(float64) == 0 {
				result["customer"] = mBucket.DocCount
			} else {
				result["member"] = mBucket.DocCount
			}
		}
	}

	return a.RenderJSON(result)
}

//PageView ...
func (a Activity) PageView() revel.Result {
	index := a.Params.Get("trackingId") + "-*"

	result := make(map[string]interface{})
	authKey, ok := a.Session["authKey"]
	if !ok || authKey == "" {
		a.Response.Status = http.StatusUnauthorized
		return a.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	a.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}
	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))

	from := int(requestParams["from"].(float64))
	size := int(requestParams["size"].(float64))

	boolQuery := elastic.NewBoolQuery()
	boolQuery.Filter(rangeQuery)

	//keyword 검색
	keyWord := requestParams["keyword"]
	if keyWord != nil && keyWord != "" {
		matchQuery := elastic.NewMatchQuery("content", keyWord.(string)) //.Fuzziness("2")
		boolQuery.Must(matchQuery)
	}
	termAggs := elastic.NewTermsAggregation().Field("request.keyword").Size(10000)
	// pageName := requestParams["pageName"]
	// if pageName != nil && pageName != "" {
	// 	termAggs.Include(".*" + pageName.(string) + ".*")
	// }

	resultAggs, err := elasticsearch.Client.Search().
		Index(index).
		Size(0).
		Aggregation("page_view", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		a.Response.Status = http.StatusInternalServerError
		return a.RenderJSON(result)
	}

	totalHits := resultAggs.Hits.TotalHits
	pvAggs, _ := resultAggs.Aggregations.Terms("page_view")
	pvBuckets := pvAggs.Buckets
	totalPage := len(pvBuckets)

	var tTotal []TopPage

	result["pages"] = tTotal
	result["total_page"] = totalPage

	if totalPage == 0 {
		return a.RenderJSON(result)
	}

	fetchSourcCtx := elastic.NewFetchSourceContext(true).Include("title", "content")
	for i := from; i < from+size; i++ {
		if i >= totalPage {
			break
		}
		pvBucket := pvBuckets[i]

		t := TopPage{}
		t.Index = i + 1
		t.Page = pvBucket.Key.(string)
		t.Count = int(pvBucket.DocCount)
		t.Desc = "-"
		t.Ratio = math.Round(float64(t.Count)/float64(totalHits)*100*100) / 100
		t.Content = "-"

		//page 중 가장 최신 페이지 Query
		termQuery := elastic.NewTermQuery("request.keyword", t.Page)
		boolQuery := elastic.NewBoolQuery().Filter(termQuery)
		result, err := elasticsearch.Client.Search().
			Index(index).
			Query(boolQuery).
			FetchSourceContext(fetchSourcCtx).
			Sort("@timestamp", false).
			Size(1).
			Do(ctx)
		if err != nil {
			revel.AppLog.Error(err.Error())
			tTotal = append(tTotal, t)
			continue
		}
		if result.Hits.TotalHits == 0 {
			continue
		}
		hitMap := make(map[string]interface{})
		for _, hit := range result.Hits.Hits {
			err := json.Unmarshal(*hit.Source, &hitMap)
			if err != nil {
				tTotal = append(tTotal, t)
				continue
			}
			title := hitMap["title"]
			if title != nil {
				t.Desc = title.(string)
			}
			content := hitMap["content"]
			if content != nil {
				t.Content = content.(string)
				break
			}
		}
		tTotal = append(tTotal, t)
	}

	result["pages"] = tTotal
	return a.RenderJSON(result)
}

func (a Activity) Purchase() revel.Result {
	index := a.Params.Get("trackingId") + "-*"

	result := make(map[string]interface{})
	authKey, ok := a.Session["authKey"]
	if !ok || authKey == "" {
		a.Response.Status = http.StatusUnauthorized
		return a.RenderJSON(result)
	}

	ctx := context.Background()

	requestParams := make(map[string]interface{})
	a.Params.BindJSON(&requestParams)

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(requestParams["format"].(string)).
		TimeZone(requestParams["timeZone"].(string))

	sumAggs := elastic.NewSumAggregation().Field("purchase.total_price")
	memberAggs := elastic.NewTermsAggregation().Field("purchase.member_yn")
	osAggs := elastic.NewTermsAggregation().Field("purchase.os_type")
	termAggs := elastic.NewTermsAggregation().Field("purchase.p_name.keyword").
		SubAggregation("total_price", sumAggs).
		SubAggregation("member", memberAggs).
		SubAggregation("os", osAggs)

	nestedAggs := elastic.NewNestedAggregation().
		Path("purchase").
		SubAggregation("purchase", termAggs)

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
	resultAggs, err := elasticsearch.Client.Search().
		Index(index).
		Size(0).
		Aggregation("purchase_nested", nestedAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		a.Response.Status = http.StatusInternalServerError
		return a.RenderJSON(result)
	}

	var purchases []Purchase
	pnBucket, _ := resultAggs.Aggregations.Nested("purchase_nested")

	pBucketItems, _ := pnBucket.Aggregations.Terms("purchase")
	pBuckets := pBucketItems.Buckets
	for _, pBucket := range pBuckets {
		purchase := Purchase{
			Pc:       0,
			Mobile:   0,
			Customer: 0,
			Member:   0,
		}
		purchase.Item = pBucket.Key.(string)

		//os type
		oBucketItems, _ := pBucket.Terms("os")
		oBuckets := oBucketItems.Buckets
		for _, oBucket := range oBuckets {
			if oBucket.Key.(float64) == 1 {
				purchase.Pc += int(oBucket.DocCount)
			} else {
				purchase.Mobile += int(oBucket.DocCount)
			}
		}

		tPriceValue, _ := pBucket.Sum("total_price")
		purchase.Amount = *tPriceValue.Value

		//member type
		mBucketItems, _ := pBucket.Terms("member")
		mBuckets := mBucketItems.Buckets
		for _, mBucket := range mBuckets {
			if mBucket.Key.(float64) == 0 {
				purchase.Customer += int(mBucket.DocCount)
			} else {
				purchase.Member += int(mBucket.DocCount)
			}
		}

		purchases = append(purchases, purchase)
	}

	return a.RenderJSON(purchases)
}
