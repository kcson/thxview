package mapper

import (
	"github.com/thxcloud/thxview/app/db"
	"time"
)

type Site struct {
	Id         int       `db:"id" json:"id"`
	Title      string    `db:"title" json:"title"`
	Url        string    `db:"url" json:"url"`
	TrackingId string    `db:"tracking_id" json:"tracking_id"`
	Desc       string    `db:"desc" json:"desc"`
	EntryDate  time.Time `db:"entry_date" json:"entry_date"`
	UpdateDate time.Time `db:"update_date" json:"update_date"`
}

func SelectUserMenuByUserId(username string) ([]string, error) {
	var menus []string
	err := db.DB.Select(&menus, "SELECT menu_id FROM user_menu WHERE user_id = ?", username)
	if err != nil {
		return nil, err
	}

	return menus, nil
}

func SelectUserSiteByUserId(username string) ([]Site, error) {
	var sites []Site
	err := db.DB.Select(&sites, "SELECT "+
		"b.id,"+
		"b.title,"+
		"b.url,"+
		"b.tracking_id,"+
		"b.desc,"+
		"b.entry_date,"+
		"b.update_date"+
		" FROM "+
		"user_site a INNER JOIN site b ON a.site_id = b.id "+
		" WHERE "+
		"a.user_id=?", username)
	if err != nil {
		return nil, err
	}
	return sites, nil
}
