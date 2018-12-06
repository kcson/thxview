package mapper

import (
	"time"

	"github.com/thxcloud/thxview/app/db"
)

// Site ...
type Site struct {
	Id         int       `db:"id" json:"id"`
	Title      string    `db:"title" json:"title"`
	Url        string    `db:"url" json:"url"`
	TrackingId string    `db:"tracking_id" json:"tracking_id"`
	Desc       string    `db:"desc" json:"desc"`
	EntryDate  time.Time `db:"entry_date" json:"entry_date"`
	UpdateDate time.Time `db:"update_date" json:"update_date"`
}

//UserInfo ...
type UserInfo struct {
	Id       string `db:"id"`
	Password string `db:"password"`
	Role     int    `db:"role"`
	Username string `db:"username"`
}

//SelectUserMenuByUserID ...
func SelectUserMenuByUserID(username string) ([]string, error) {
	var menus []string
	err := db.DB.Select(&menus, "SELECT menu_id FROM user_menu WHERE user_id = ?", username)
	if err != nil {
		return nil, err
	}

	return menus, nil
}

//SelectUserSiteByUserID ...
func SelectUserSiteByUserID(username string) ([]Site, error) {
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

//SelectUserInfoByID ...
func SelectUserInfoByID(username string) ([]UserInfo, error) {
	var userInfos []UserInfo
	err := db.DB.Select(&userInfos, "SELECT id,password,role,username FROM thx_employee WHERE id=?", username)
	if err != nil {
		return nil, err
	}

	return userInfos, nil
}
