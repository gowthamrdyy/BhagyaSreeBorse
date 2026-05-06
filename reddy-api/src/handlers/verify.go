package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/valyala/fasthttp"
	"reddy-api/src/globals"
)

// VerifyUserResponse is the response for /verify-user
type VerifyUserResponse struct {
	Data        *VerifyUserData `json:"data,omitempty"`
	Error       string          `json:"error,omitempty"`
	ErrorReason string          `json:"errorReason,omitempty"`
}

type VerifyUserData struct {
	Identifier string `json:"identifier,omitempty"`
	Digest     string `json:"digest,omitempty"`
	StatusCode int    `json:"status_code"`
	Message    string `json:"message,omitempty"`
}

// VerifyPasswordResponse is the response for /verify-password
type VerifyPasswordResponse struct {
	Data            *VerifyPasswordData `json:"data,omitempty"`
	IsAuthenticated bool                `json:"isAuthenticated"`
	Error           string              `json:"error,omitempty"`
	ErrorReason     string              `json:"errorReason,omitempty"`
}

type VerifyPasswordData struct {
	Cookies           string       `json:"cookies,omitempty"`
	StatusCode        int          `json:"statusCode"`
	Message           string       `json:"message,omitempty"`
	Captcha           *CaptchaInfo `json:"captcha,omitempty"`
	IsConcurrentLimit bool         `json:"isConcurrentLimit,omitempty"`
	FlowId            *string      `json:"flowId,omitempty"`
}

type CaptchaInfo struct {
	Required bool    `json:"required"`
	Digest   *string `json:"digest"`
}

// getLoginPageSession visits the SRM login page to obtain fresh cookies
func getLoginPageSession() (cookieStr string, csrfToken string, err error) {
	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)
	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI("https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&servicename=ZohoCreator&service_language=en&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin")
	req.Header.SetMethod("GET")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")

	if err := globals.HTTPClient.DoRedirects(req, resp, 5); err != nil {
		return "", "", fmt.Errorf("failed to fetch login page: %v", err)
	}

	jar := make(map[string]string)
	resp.Header.VisitAllCookie(func(key, value []byte) {
		c := fasthttp.AcquireCookie()
		defer fasthttp.ReleaseCookie(c)
		c.ParseBytes(value)
		cookieName := string(key)
		cookieVal := string(c.Value())
		if cookieVal != "" && cookieVal != "delete" && cookieVal != "null" {
			jar[cookieName] = cookieVal
		}
	})

	var parts []string
	for k, v := range jar {
		parts = append(parts, fmt.Sprintf("%s=%s", k, v))
	}
	cookies := strings.Join(parts, "; ")
	csrf := jar["iamcsr"]

	return cookies, csrf, nil
}

// VerifyUser handles the first step of the 2-step login flow (email validation)
func VerifyUser(username string) (*VerifyUserResponse, error) {
	if !strings.Contains(username, "@") {
		username += "@srmist.edu.in"
	}

	cookies, csrfToken, err := getLoginPageSession()
	if err != nil {
		return &VerifyUserResponse{Error: "Internal Server Error", ErrorReason: err.Error()}, nil
	}

	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)
	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	lookupURL := fmt.Sprintf("https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/lookup/%s", username)
	req.SetRequestURI(lookupURL)
	req.Header.SetMethod("POST")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36")
	req.Header.Set("Origin", "https://academia.srmist.edu.in")
	req.Header.Set("Referer", "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&servicename=ZohoCreator&service_language=en&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin")
	req.Header.Set("Sec-Fetch-Dest", "empty")
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("Sec-Fetch-Site", "same-origin")
	if csrfToken != "" {
		req.Header.Set("X-Zcsrf-Token", fmt.Sprintf("iamcsrcoo=%s", csrfToken))
	}
	req.Header.Set("Cookie", cookies)

	cliTime := time.Now().UnixMilli()
	body := fmt.Sprintf("mode=primary&cli_time=%d&servicename=ZohoCreator&service_language=en&serviceurl=https%%3A%%2F%%2Facademia.srmist.edu.in%%2Fportal%%2Facademia-academic-services%%2FredirectFromLogin", cliTime)
	req.SetBodyString(body)

	if err := globals.HTTPClient.Do(req, resp); err != nil {
		return &VerifyUserResponse{Error: "Internal Server Error", ErrorReason: err.Error()}, nil
	}

	var rawResp map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &rawResp); err != nil {
		return &VerifyUserResponse{Error: "Internal Server Error", ErrorReason: "Failed to parse response from SRM"}, nil
	}

	data := &VerifyUserData{}
	if statusCode, ok := rawResp["status_code"].(float64); ok {
		data.StatusCode = int(statusCode)
	}
	if msg, ok := rawResp["message"].(string); ok {
		data.Message = msg
	}
	if lookup, ok := rawResp["lookup"].(map[string]interface{}); ok {
		if id, ok := lookup["identifier"].(string); ok {
			data.Identifier = id
		}
		if dig, ok := lookup["digest"].(string); ok {
			data.Digest = dig
		}
	}

	return &VerifyUserResponse{Data: data}, nil
}

// VerifyPassword handles the second step — uses the ORIGINAL login flow
// to get proper JSESSIONID cookies that work with data-fetching endpoints.
func VerifyPassword(identifier, digest, password, email string) (*VerifyPasswordResponse, error) {
	// Use the original LoginFetcher which produces JSESSIONID cookies
	// that work with all data endpoints (attendance, marks, timetable, etc.)
	username := email
	if username == "" {
		username = identifier // fallback
	}

	log.Printf("VerifyPassword: attempting login for user=%s", username)

	lf := &LoginFetcher{}
	session, err := lf.Login(username, password, nil, nil)
	if err != nil {
		log.Printf("VerifyPassword: login error: %v", err)
		return &VerifyPasswordResponse{
			Error:       "Internal Server Error",
			ErrorReason: err.Error(),
		}, nil
	}

	log.Printf("VerifyPassword: login result authenticated=%v status=%d", session.Authenticated, session.Status)

	// Map the LoginResponse to the VerifyPasswordResponse format the frontend expects
	if session.Authenticated && session.Cookies != "" {
		return &VerifyPasswordResponse{
			Data: &VerifyPasswordData{
				Cookies:    session.Cookies,
				StatusCode: 201,
			},
			IsAuthenticated: true,
		}, nil
	}

	// Handle captcha
	if session.Captcha != nil && session.Captcha.Cdigest != "" {
		cdigest := session.Captcha.Cdigest
		return &VerifyPasswordResponse{
			Data: &VerifyPasswordData{
				StatusCode: 401,
				Message:    "Captcha required",
				Captcha:    &CaptchaInfo{Required: true, Digest: &cdigest},
			},
			IsAuthenticated: false,
		}, nil
	}

	// Handle concurrent sessions
	msgStr := ""
	if session.Message != nil {
		msgStr = fmt.Sprintf("%v", session.Message)
	}
	lowerMsg := strings.ToLower(msgStr)
	if strings.Contains(lowerMsg, "concurrent") || strings.Contains(lowerMsg, "retry") || strings.Contains(lowerMsg, "too many") {
		return &VerifyPasswordResponse{
			Data: &VerifyPasswordData{
				StatusCode:        435,
				Message:           msgStr,
				Captcha:           &CaptchaInfo{Required: false, Digest: nil},
				IsConcurrentLimit: true,
				FlowId:            nil,
			},
			IsAuthenticated: false,
		}, nil
	}

	// Generic failure
	return &VerifyPasswordResponse{
		Data: &VerifyPasswordData{
			StatusCode: session.Status,
			Message:    msgStr,
			Captcha:    &CaptchaInfo{Required: false, Digest: nil},
		},
		IsAuthenticated: false,
	}, nil
}

// TerminateSessions kills concurrent sessions
func TerminateSessions(flowId, identifier, digest string) (map[string]interface{}, error) {
	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)
	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	// Strategy 1: Block-Sessions POST
	blockURL := "https://academia.srmist.edu.in/accounts/p/40-10002227248/preannouncement/block-sessions"
	req.SetRequestURI(blockURL)
	req.Header.SetMethod("POST")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("User-Agent", "Mozilla/5.0")
	req.Header.Set("Referer", "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&servicename=ZohoCreator&service_language=en&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin")

	args := fasthttp.AcquireArgs()
	defer fasthttp.ReleaseArgs(args)
	args.Add("mode", "terminate")
	args.Add("identifier", identifier)
	args.Add("digest", digest)
	args.Add("cli_time", fmt.Sprint(time.Now().UnixMilli()))
	args.Add("servicename", "ZohoCreator")
	args.Add("service_language", "en")
	args.Add("serviceurl", "https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin")
	if flowId != "" {
		args.Add("flowId", flowId)
	}
	req.SetBody(args.QueryString())

	if err := globals.HTTPClient.Do(req, resp); err == nil {
		sc := resp.StatusCode()
		if sc == 200 || sc == 201 || sc == 302 {
			return map[string]interface{}{
				"success":  true,
				"status":   sc,
				"strategy": "block-sessions",
			}, nil
		}
	}

	// Strategy 2: DELETE session ticket
	if flowId != "" {
		req.Reset()
		resp.Reset()
		deleteURL := fmt.Sprintf("https://academia.srmist.edu.in/accounts/p/40-10002227248/webclient/v1/account/self/user/self/session/%s", flowId)
		req.SetRequestURI(deleteURL)
		req.Header.SetMethod("DELETE")
		req.Header.Set("Accept", "application/json")
		req.Header.Set("User-Agent", "Mozilla/5.0")
		req.Header.Set("Referer", "https://accounts.zoho.in/")

		if err := globals.HTTPClient.Do(req, resp); err == nil {
			sc := resp.StatusCode()
			if sc == 200 || sc == 204 {
				return map[string]interface{}{
					"success":  true,
					"status":   sc,
					"strategy": "webclient-delete",
				}, nil
			}
		}
	}

	return map[string]interface{}{
		"success":  false,
		"error":    "Both termination strategies failed",
		"strategy": "none",
	}, nil
}
