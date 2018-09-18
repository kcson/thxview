package scheduler

import (
	"fmt"
	"github.com/jasonlvhit/gocron"
)

func ActiveFlowJob () {
	fmt.Println("call ActiveFlowJob")

	go func() {
		gocron.Every(10).Seconds().Do(runJob)
		<- gocron.Start()
	}()
}

func runJob() {
	fmt.Println("call runJob")
}