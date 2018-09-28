package controllers

import (
	"github.com/revel/revel"
	"net/http"
	"github.com/thxcloud/thxview/app/elasticsearch"
	"github.com/olivere/elastic"
	"context"
	"fmt"
	"strings"
	"sync"
	"math"
)

type Dashboard struct {
	*revel.Controller
}

type ActiveLocation struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Count     int64   `json:"count"`
}

func (d Dashboard) ActiveUser() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := d.Session["authKey"]
	if !ok || authKey == "" {
		d.Response.Status = http.StatusUnauthorized
		return d.RenderJSON(result)
	}

	ctx := context.Background()

	requestParams := make(map[string]interface{})
	d.Params.BindJSON(&requestParams)

	fmt.Println(requestParams["fromDate"])
	fmt.Println(requestParams["toDate"])
	fmt.Println(requestParams["timeZone"])

	rangeQuery := elastic.NewRangeQuery("session_timeout").Gte(requestParams["fromDate"]).Format("yyyy-MM-dd HH:mm:ss").TimeZone(requestParams["timeZone"].(string))
	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)

	//활성 사용자
	valueCountAggs := elastic.NewValueCountAggregation().Field("_id")
	userCountResults, err := elasticsearch.Client.Search().Index("thx_view").Type("visitors").
		Size(0).
		Aggregation("activeuser_count", valueCountAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		d.Response.Status = http.StatusInternalServerError
		return d.RenderJSON(result)
	}

	valueCount, _ := userCountResults.Aggregations.ValueCount("activeuser_count")
	activeUserCount := *valueCount.Value
	result["activeuser_count"] = activeUserCount

	//회원 여부 및 디바이스 종류
	userCountAggs := elastic.NewCardinalityAggregation().Field("thx_id.keyword")
	memberTypeAggs := elastic.NewTermsAggregation().Field("member_yn").SubAggregation("user_count", userCountAggs)
	deviceTypeAggs := elastic.NewTermsAggregation().Field("os.keyword").SubAggregation("user_count", userCountAggs)

	memberResults, err := elasticsearch.Client.Search().
		Index("logstash-*").Size(0).
		Aggregation("member_yn", memberTypeAggs).
		Aggregation("device_type", deviceTypeAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		d.Response.Status = http.StatusInternalServerError
		return d.RenderJSON(result)
	}

	result["visitor_count"] = 0
	result["member_count"] = 0
	bucketItems, _ := memberResults.Aggregations.Terms("member_yn")
	buckets := bucketItems.Buckets
	for _, bucket := range buckets {
		aggs, _ := bucket.Aggregations.Cardinality("user_count")
		count := *aggs.Value

		userType := bucket.Key.(float64)
		if userType == 0 {
			result["visitor_count"] = count
		} else {
			result["member_count"] = count
		}
	}

	pc := []string{"windows", "mac", "linux"}
	mobile := []string{"ios", "android"}
	result["pc_count"] = 0
	result["mobile_count"] = 0
	bucketItems, _ = memberResults.Aggregations.Terms("device_type")
	buckets = bucketItems.Buckets
	for _, bucket := range buckets {
		aggs, _ := bucket.Aggregations.Cardinality("user_count")
		count := *aggs.Value
		osName := strings.ToLower(bucket.Key.(string))

		//pc 여부
		for _, pcType := range pc {
			if strings.Contains(osName, pcType) {
				fmt.Println(osName + " : " + pcType)
				result["pc_count"] = result["pc_count"].(int) + int(count)
				break
			}
		}
		//mobile 여부
		for _, mobileType := range mobile {
			if strings.Contains(osName, mobileType) {
				fmt.Println(osName + " : " + mobileType)
				result["mobile_count"] = result["mobile_count"].(int) + int(count)
			}
		}
	}

	return d.RenderJSON(result)
}

func (d Dashboard) PageView() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := d.Session["authKey"]
	if !ok || authKey == "" {
		d.Response.Status = http.StatusUnauthorized
		return d.RenderJSON(result)
	}

	ctx := context.Background()

	requestParams := make(map[string]interface{})
	d.Params.BindJSON(&requestParams)

	fmt.Println(requestParams["fromDate"])
	fmt.Println(requestParams["toDate"])
	fmt.Println(requestParams["format"])
	fmt.Println(requestParams["interval"])
	fmt.Println(requestParams["timeZone"])

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(requestParams["format"].(string)).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)

	dateHistoGramAggs := elastic.NewDateHistogramAggregation().
		Field("@timestamp").
		Interval(requestParams["interval"].(string)).
		TimeZone(requestParams["timeZone"].(string))

	results, err := elasticsearch.Client.Search().Index("logstash-*").Size(0).Aggregation("page_view", dateHistoGramAggs).Query(boolQuery).Do(ctx)
	if err != nil {
		d.Response.Status = http.StatusInternalServerError
	}
	return d.RenderJSON(results)
}

func (d Dashboard) Conversion() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := d.Session["authKey"]
	if !ok || authKey == "" {
		d.Response.Status = http.StatusUnauthorized
		return d.RenderJSON(result)
	}

	ctx := context.Background()
	var wg sync.WaitGroup
	wg.Add(2)

	requestParams := make(map[string]interface{})
	d.Params.BindJSON(&requestParams)

	fmt.Println(requestParams["fromDate"])
	fmt.Println(requestParams["toDate"])
	fmt.Println(requestParams["format"])
	fmt.Println(requestParams["interval"])
	fmt.Println(requestParams["timeZone"])

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(requestParams["format"].(string)).
		TimeZone(requestParams["timeZone"].(string))

	vistitUserCountAggs := elastic.NewCardinalityAggregation().Field("thx_id.keyword")

	totalCount := 0
	signupCount := 0
	go func() {
		defer wg.Done()
		//전체 방문 사용자
		boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
		visitUsers, err := elasticsearch.Client.Search().
			Index("logstash-*").
			Size(0).
			Aggregation("visit_user", vistitUserCountAggs).
			Query(boolQuery).
			Do(ctx)
		if err != nil {
			d.Response.Status = http.StatusInternalServerError
			return
			//return d.RenderJSON(result)
		}
		aggsValue, _ := visitUsers.Aggregations.Cardinality("visit_user")
		totalCount = int(*aggsValue.Value)
		//result["visit_user"] = totalCount
	}()

	go func() {
		defer wg.Done()
		//회원 가입 한 사용자
		termQuery := elastic.NewTermQuery("signup_yn", "1")
		boolQuery := elastic.NewBoolQuery().Must(rangeQuery, termQuery)
		signUpUsers, err := elasticsearch.Client.Search().
			Index("logstash-*").
			Size(0).
			Aggregation("signup_user", vistitUserCountAggs).
			Query(boolQuery).
			Do(ctx)
		if err != nil {
			d.Response.Status = http.StatusInternalServerError
			return
			//return d.RenderJSON(result)
		}
		aggsValue, _ := signUpUsers.Aggregations.Cardinality("signup_user")
		signupCount = int(*aggsValue.Value)
	}()

	wg.Wait()

	result["visit_user"] = totalCount
	result["signup_user"] = signupCount

	if totalCount == 0 {
		result["signup_ratio"] = 0
	} else {
		result["signup_ratio"] = (math.Round(float64(signupCount)/float64(totalCount)*100) / 100) * 100
	}

	return d.RenderJSON(result)
}

func (d Dashboard) Purchase() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := d.Session["authKey"]
	if !ok || authKey == "" {
		d.Response.Status = http.StatusUnauthorized
		return d.RenderJSON(result)
	}

	ctx := context.Background()

	requestParams := make(map[string]interface{})
	d.Params.BindJSON(&requestParams)

	fmt.Println(requestParams["fromDate"])
	fmt.Println(requestParams["toDate"])
	fmt.Println(requestParams["format"])
	fmt.Println(requestParams["interval"])
	fmt.Println(requestParams["timeZone"])

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(requestParams["format"].(string)).
		TimeZone(requestParams["timeZone"].(string))

	purchaseCount := 0
	purchasePrice := 0

	var purchase []map[string]interface{}

	quantityAggs := elastic.NewSumAggregation().Field("purchase.quantity")
	priceAggs := elastic.NewSumAggregation().Field("purchase.total_price")
	termAggs := elastic.NewTermsAggregation().Field("purchase.p_id").
		SubAggregation("quantity", quantityAggs).
		SubAggregation("total_price", priceAggs)

	nestedAggs := elastic.NewNestedAggregation().
		Path("purchase").
		SubAggregation("purchase", termAggs)

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
	resultAggs, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("purchase_nested", nestedAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		d.Response.Status = http.StatusInternalServerError
		return d.RenderJSON(result)
	}

	pnBucket, _ := resultAggs.Aggregations.Nested("purchase_nested")

	pBucketItems, _ := pnBucket.Aggregations.Terms("purchase")
	if pBucketItems == nil {
		result["purchase"] = purchase
		result["purchase_count"] = purchaseCount
		result["purchase_price"] = purchasePrice

		return d.RenderJSON(result)
	}

	pBuckets := pBucketItems.Buckets
	for _, pBucket := range pBuckets {
		purchaseMap := make(map[string]interface{})
		purchaseMap["product_id"] = pBucket.Key.(float64)

		pQuantity, _ := pBucket.Aggregations.Sum("quantity")
		purchaseMap["quantity"] = *pQuantity.Value
		purchaseCount += int(*pQuantity.Value)

		pPrice, _ := pBucket.Aggregations.Sum("total_price")
		purchaseMap["price"] = *pPrice.Value
		purchasePrice += int(*pPrice.Value)

		purchase = append(purchase, purchaseMap)
	}

	result["purchase"] = purchase
	result["purchase_count"] = purchaseCount
	result["purchase_price"] = purchasePrice

	return d.RenderJSON(result)
}

func (d Dashboard) TopPage() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := d.Session["authKey"]
	if !ok || authKey == "" {
		d.Response.Status = http.StatusUnauthorized
		return d.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	d.Params.BindJSON(&requestParams)

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(requestParams["format"].(string)).
		TimeZone(requestParams["timeZone"].(string))

	//회원이 보고 있는 top page
	termQuery := elastic.NewTermQuery("member_yn", "1")
	boolQuery := elastic.NewBoolQuery().Must(rangeQuery, termQuery)
	termAggs := elastic.NewTermsAggregation().Field("request.keyword").Size(5)
	memberTopPage, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("member_top", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		d.Response.Status = http.StatusInternalServerError
		return d.RenderJSON(result)
	}
	result["member_top"] = memberTopPage

	//비회원이 보고 있는 top page
	termQuery = elastic.NewTermQuery("member_yn", "0")
	boolQuery = elastic.NewBoolQuery().Must(rangeQuery, termQuery)
	visitorTopPage, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("visitor_top", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		d.Response.Status = http.StatusInternalServerError
		return d.RenderJSON(result)
	}
	result["visitor_top"] = visitorTopPage

	return d.RenderJSON(result)
}

func (d Dashboard) Inflow() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := d.Session["authKey"]
	if !ok || authKey == "" {
		d.Response.Status = http.StatusUnauthorized
		return d.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	d.Params.BindJSON(&requestParams)

	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(requestParams["format"].(string)).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
	termAggs := elastic.NewTermsAggregation().Field("referrer.keyword").
		Exclude(".*" + requestParams["exclude"].(string) + ".*").
		Size(5)
	inflowTopPage, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("inflow_top", termAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		d.Response.Status = http.StatusInternalServerError
		return d.RenderJSON(result)
	}

	return d.RenderJSON(inflowTopPage)
}

func (d Dashboard) Location() revel.Result {
	result := make(map[string]interface{})
	authKey, ok := d.Session["authKey"]
	if !ok || authKey == "" {
		d.Response.Status = http.StatusUnauthorized
		return d.RenderJSON(result)
	}
	ctx := context.Background()

	requestParams := make(map[string]interface{})
	d.Params.BindJSON(&requestParams)

	format := "yyyy-MM-dd HH:mm:ss"
	if requestParams["format"] != nil {
		format = requestParams["format"].(string)
	}
	rangeQuery := elastic.NewRangeQuery("@timestamp").
		Gte(requestParams["fromDate"]).
		Lte(requestParams["toDate"]).
		Format(format).
		TimeZone(requestParams["timeZone"].(string))

	boolQuery := elastic.NewBoolQuery().Must(rangeQuery)
	lngTermAggs := elastic.NewTermsAggregation().Field("geoip.longitude")
	termAggs := elastic.NewTermsAggregation().Field("geoip.latitude").
		SubAggregation("longitude", lngTermAggs).
		Size(100)
	centerAggs := elastic.NewGeoCentroidAggregation().Field("geoip.location")

	var locations []ActiveLocation
	resultAggs, err := elasticsearch.Client.Search().
		Index("logstash-*").
		Size(0).
		Aggregation("location", termAggs).
		Aggregation("center", centerAggs).
		Query(boolQuery).
		Do(ctx)
	if err != nil {
		d.Response.Status = http.StatusInternalServerError
		return d.RenderJSON(result)
	}

	lBucketItems, _ := resultAggs.Aggregations.Terms("location")
	lBuckets := lBucketItems.Buckets
	for _, lBucket := range lBuckets {
		location := ActiveLocation{}
		location.Latitude = lBucket.Key.(float64)

		lngBucketItems, _ := lBucket.Aggregations.Terms("longitude")
		lngBuckets := lngBucketItems.Buckets
		for _, lngBucket := range lngBuckets {
			location.Longitude = lngBucket.Key.(float64)
			location.Count = lngBucket.DocCount
		}
		locations = append(locations, location)
	}
	result["locations"] = locations
	geoCentroid, _ := resultAggs.Aggregations.GeoCentroid("center")
	if geoCentroid.Count > 0 {
		result["center"] = geoCentroid.Location
	}
	return d.RenderJSON(result)
}
