package scheduler

import (
	"fmt"
	"github.com/jasonlvhit/gocron"
	"github.com/revel/revel"
)

func ActiveFlowJob() {
	fmt.Println("call ActiveFlowJob")

	go func() {
		gocron.Every(10).Seconds().Do(runJob)
		<-gocron.Start()
	}()
}

func runJob() {
	revel.AppLog.Debug("call runJob")
}
