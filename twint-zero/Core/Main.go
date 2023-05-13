package Core

import (
	"net/url"
)

var (
	weeks int = 5
	condition bool   = true
	cursor    string = ""
)

func Main(Query *string, Instance *string, Format *string) {
	(*Query) = url.QueryEscape(*Query)
	for i := 0; i < weeks; i++ {
		condition = Scrape(Request(Query, Instance, &cursor), Format, &cursor)
	}
}
