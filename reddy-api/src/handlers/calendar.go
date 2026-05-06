package handlers

import (
	"reddy-api/src/helpers"
	"reddy-api/src/types"
	"time"
)

func GetCalendar(token string) (*types.CalendarResponse, error) {
	scraper := helpers.NewCalendarFetcher(time.Now(), token)
	calendar, err := scraper.GetCalendar()

	return calendar, err

}
