package config

import (
	"log"
	"os"

	"github.com/BurntSushi/toml"
)

// Config ...
type Config struct {
	Dbpassword string
	Database   string
	DbUser     string
}

// Reads info from config file
func ReadConfig() Config {
	var configfile = "properties.ini"
	_, err := os.Stat(configfile)
	if err != nil {
		log.Fatal("Config file is missing: ", configfile)
	}

	var config Config
	if _, err := toml.DecodeFile(configfile, &config); err != nil {
		log.Fatal(err)
	}
	//log.Print(config.Index)
	return config
}

//func main() {
//	config := ReadConfig()
//	fmt.Printf("%s: %s: %s\n", config.Dbpassword, config.Database, config.DbUser)
//
//}
