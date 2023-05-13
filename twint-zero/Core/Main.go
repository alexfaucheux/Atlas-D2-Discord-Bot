package Core

import (
	"net/url"
)

var (
	weeks int = 4
	condition bool   = true
	cursor    string = ""
)

func Main(Query *string, Instance *string, Format *string) {
	(*Query) = url.QueryEscape(*Query)
	for i := 0; i < weeks && condition; i++ {
		condition = Scrape(Request(Query, Instance, &cursor), Format, &cursor)
	}
}
