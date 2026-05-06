package globals

import "github.com/valyala/fasthttp"

var HTTPClient = &fasthttp.Client{
	ReadBufferSize:  1048576,
	WriteBufferSize: 1048576,
	MaxConnsPerHost: 1000,
}
