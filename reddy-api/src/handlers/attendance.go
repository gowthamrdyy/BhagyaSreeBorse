package handlers

import (
	"reddy-api/src/helpers"
	"reddy-api/src/types"
)

func GetAttendance(token string) (*types.AttendanceResponse, error) {
	scraper := helpers.NewAcademicsFetch(token)
	attendance, err := scraper.GetAttendance()

	return attendance, err

}
