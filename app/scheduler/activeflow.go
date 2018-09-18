package scheduler

import (
	"fmt"
	"github.com/jasonlvhit/gocron"
	"github.com/revel/revel"
)

func ActiveFlowJob() {
	fmt.Println("call ActiveFlowJob")
	time := revel.Config.StringDefault("scheduler.activflow","00:30")

	go func() {
		gocron.Every(1).Day().At(time).Do(runJob)
		<-gocron.Start()
	}()
}

func runJob() {
	revel.AppLog.Debug("call runJob")
}
