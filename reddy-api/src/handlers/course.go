package handlers

import (
	"reddy-api/src/helpers"
	"reddy-api/src/types"
)

func GetCourses(token string) (*types.CourseResponse, error) {
	scraper := helpers.NewCoursePage(token)
	course, err := scraper.GetCourses()

	return course, err
}
