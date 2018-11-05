package elasticsearch

import (
	"github.com/olivere/elastic"
	"fmt"
	"net/http"
	"crypto/tls"
)

var Client *elastic.Client

func Init() {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	httpClient := &http.Client{Transport: tr}

	elasticClient, err := elastic.NewClient(
		elastic.SetHttpClient(httpClient),
		elastic.SetURL("https://thxlab.com:9200"),
		elastic.SetBasicAuth("kibanauser", "Thx0913!"),
		elastic.SetScheme("https"),
		elastic.SetSniff(false))
	if err != nil {
		fmt.Println("Elasticsearch connect fail !!")
		fmt.Println(err.Error())
		return
	}
	Client = elasticClient
	fmt.Println("Elasticsearch connect success !!")
}
