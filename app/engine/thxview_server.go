package engine

import (
	"net"
	"net/http"
	"time"

	"golang.org/x/net/websocket"
	"io"
	"mime/multipart"
	"net/url"
	"strconv"
	"github.com/revel/revel"
)

// Register the GoHttpServer engine

func init() {
	revel.AppLog.Infof("Register engine : %s", THXVIEW_NATIVE_SERVER_ENGINE)
	revel.RegisterServerEngine(THXVIEW_NATIVE_SERVER_ENGINE, func() revel.ServerEngine { return &ThxviewHttpServer{} })
}

type ThxviewHttpServer struct {
	Server               *http.Server
	ServerInit           *revel.EngineInit
	MaxMultipartSize     int64
	goContextStack       *revel.SimpleLockStack
	goMultipartFormStack *revel.SimpleLockStack
}

func (g *ThxviewHttpServer) Init(init *revel.EngineInit) {
	g.MaxMultipartSize = int64(revel.Config.IntDefault("server.request.max.multipart.filesize", 32)) << 20 /* 32 MB */
	g.goContextStack = revel.NewStackLock(revel.Config.IntDefault("server.context.stack", 100),
		revel.Config.IntDefault("server.context.maxstack", 200),
		func() interface{} {
			return NewGoContext(g)
		})
	g.goMultipartFormStack = revel.NewStackLock(revel.Config.IntDefault("server.form.stack", 100),
		revel.Config.IntDefault("server.form.maxstack", 200),
		func() interface{} { return &GoMultipartForm{} })
	g.ServerInit = init
	g.Server = &http.Server{
		Addr: init.Address,
		Handler: http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			g.Handle(writer, request)
		}),
		ReadTimeout:  time.Duration(revel.Config.IntDefault("http.timeout.read", 0)) * time.Second,
		WriteTimeout: time.Duration(revel.Config.IntDefault("http.timeout.write", 0)) * time.Second,
	}
	// Server already initialized

}

// Handler is assigned in the Init
func (g *ThxviewHttpServer) Start() {
	go func() {
		time.Sleep(100 * time.Millisecond)
		revel.AppLog.Debugf("Start: Listening on %s...", g.Server.Addr)
	}()
	if revel.HTTPSsl {
		if g.ServerInit.Network != "tcp" {
			// This limitation is just to reduce complexity, since it is standard
			// to terminate SSL upstream when using unix domain sockets.
			revel.AppLog.Fatal("SSL is only supported for TCP sockets. Specify a port to listen on.")
		}
		revel.AppLog.Fatal("Failed to listen:", "error",
			g.Server.ListenAndServeTLS(revel.HTTPSslCert, revel.HTTPSslKey))
	} else {
		listener, err := net.Listen(g.ServerInit.Network, g.Server.Addr)
		if err != nil {
			revel.AppLog.Fatal("Failed to listen:", "error", err)
		}
		revel.AppLog.Fatal("Failed to serve:", "error", g.Server.Serve(listener))
	}

}

func (g *ThxviewHttpServer) Handle(w http.ResponseWriter, r *http.Request) {
	if maxRequestSize := int64(revel.Config.IntDefault("http.maxrequestsize", 0)); maxRequestSize > 0 {
		r.Body = http.MaxBytesReader(w, r.Body, maxRequestSize)
	}

	if r.TLS == nil && revel.Config.BoolDefault("http.ssl", false) {
		revel.AppLog.Debug("Redirect http to https")
	}

	upgrade := r.Header.Get("Upgrade")
	context := g.goContextStack.Pop().(*GoContext)
	defer func() {
		g.goContextStack.Push(context)
	}()
	context.Request.SetRequest(r)
	context.Response.SetResponse(w)

	if upgrade == "websocket" || upgrade == "Websocket" {
		websocket.Handler(func(ws *websocket.Conn) {
			//Override default Read/Write timeout with sane value for a web socket request
			if err := ws.SetDeadline(time.Now().Add(time.Hour * 24)); err != nil {
				revel.AppLog.Error("SetDeadLine failed:", err)
			}
			r.Method = "WS"
			context.Request.WebSocket = ws
			context.WebSocket = &GoWebSocket{Conn: ws, GoResponse: *context.Response}
			g.ServerInit.Callback(context)
		}).ServeHTTP(w, r)
	} else {
		g.ServerInit.Callback(context)
	}
}

const THXVIEW_NATIVE_SERVER_ENGINE = "thxview"

func (g *ThxviewHttpServer) Name() string {
	return THXVIEW_NATIVE_SERVER_ENGINE
}

func (g *ThxviewHttpServer) Stats() map[string]interface{} {
	return map[string]interface{}{
		"Go Engine Context": g.goContextStack.String(),
		"Go Engine Forms":   g.goMultipartFormStack.String(),
	}
}

func (g *ThxviewHttpServer) Engine() interface{} {
	return g.Server
}

func (g *ThxviewHttpServer) Event(event int, args interface{}) {

}

type (
	GoContext struct {
		Request   *GoRequest
		Response  *GoResponse
		WebSocket *GoWebSocket
	}
	GoRequest struct {
		Original        *http.Request
		FormParsed      bool
		MultiFormParsed bool
		WebSocket       *websocket.Conn
		ParsedForm      *GoMultipartForm
		Goheader        *GoHeader
		Engine          *ThxviewHttpServer
	}

	GoResponse struct {
		Original http.ResponseWriter
		Goheader *GoHeader
		Writer   io.Writer
		Request  *GoRequest
		Engine   *ThxviewHttpServer
	}
	GoMultipartForm struct {
		Form *multipart.Form
	}
	GoHeader struct {
		Source     interface{}
		isResponse bool
	}
	GoWebSocket struct {
		Conn *websocket.Conn
		GoResponse
	}
	GoCookie http.Cookie
)

func NewGoContext(instance *ThxviewHttpServer) *GoContext {
	if instance == nil {
		instance = &ThxviewHttpServer{MaxMultipartSize: 32 << 20}
		instance.goContextStack = revel.NewStackLock(100, 200,
			func() interface{} {
				return NewGoContext(instance)
			})
		instance.goMultipartFormStack = revel.NewStackLock(100, 200,
			func() interface{} { return &GoMultipartForm{} })
	}
	c := &GoContext{Request: &GoRequest{Goheader: &GoHeader{}, Engine: instance}}
	c.Response = &GoResponse{Goheader: &GoHeader{}, Request: c.Request, Engine: instance}
	return c
}
func (c *GoContext) GetRequest() revel.ServerRequest {
	return c.Request
}
func (c *GoContext) GetResponse() revel.ServerResponse {
	if c.WebSocket != nil {
		return c.WebSocket
	}
	return c.Response
}
func (c *GoContext) Destroy() {
	c.Response.Destroy()
	c.Request.Destroy()
	if c.WebSocket != nil {
		c.WebSocket.Destroy()
		c.WebSocket = nil
	}
}
func (r *GoRequest) Get(key int) (value interface{}, err error) {
	switch key {
	case revel.HTTP_SERVER_HEADER:
		value = r.GetHeader()
	case revel.HTTP_MULTIPART_FORM:
		value, err = r.GetMultipartForm()
	case revel.HTTP_QUERY:
		value = r.Original.URL.Query()
	case revel.HTTP_FORM:
		value, err = r.GetForm()
	case revel.HTTP_REQUEST_URI:
		value = r.Original.URL.String()
	case revel.HTTP_REMOTE_ADDR:
		value = r.Original.RemoteAddr
	case revel.HTTP_METHOD:
		value = r.Original.Method
	case revel.HTTP_PATH:
		value = r.Original.URL.Path
	case revel.HTTP_HOST:
		value = r.Original.Host
	case revel.HTTP_URL:
		value = r.Original.URL
	case revel.HTTP_BODY:
		value = r.Original.Body
	default:
		err = revel.ENGINE_UNKNOWN_GET
	}

	return
}
func (r *GoRequest) Set(key int, value interface{}) bool {
	return false
}

func (r *GoRequest) GetForm() (url.Values, error) {
	if !r.FormParsed {
		if e := r.Original.ParseForm(); e != nil {
			return nil, e
		}
		r.FormParsed = true
	}

	return r.Original.Form, nil
}
func (r *GoRequest) GetMultipartForm() (revel.ServerMultipartForm, error) {
	if !r.MultiFormParsed {
		if e := r.Original.ParseMultipartForm(r.Engine.MaxMultipartSize); e != nil {
			return nil, e
		}
		r.ParsedForm = r.Engine.goMultipartFormStack.Pop().(*GoMultipartForm)
		r.ParsedForm.Form = r.Original.MultipartForm
	}

	return r.ParsedForm, nil
}
func (r *GoRequest) GetHeader() revel.ServerHeader {
	return r.Goheader
}
func (r *GoRequest) GetRaw() interface{} {
	return r.Original
}
func (r *GoRequest) SetRequest(req *http.Request) {
	r.Original = req
	r.Goheader.Source = r
	r.Goheader.isResponse = false

}
func (r *GoRequest) Destroy() {
	r.Goheader.Source = nil
	r.Original = nil
	r.FormParsed = false
	r.MultiFormParsed = false
	r.ParsedForm = nil
}
func (r *GoResponse) Get(key int) (value interface{}, err error) {
	switch key {
	case revel.HTTP_SERVER_HEADER:
		value = r.Header()
	case revel.HTTP_STREAM_WRITER:
		value = r
	case revel.HTTP_WRITER:
		value = r.Writer
	default:
		err = revel.ENGINE_UNKNOWN_GET
	}
	return
}
func (r *GoResponse) Set(key int, value interface{}) (set bool) {
	switch key {
	case revel.ENGINE_RESPONSE_STATUS:
		r.Header().SetStatus(value.(int))
		set = true
	case revel.HTTP_WRITER:
		r.SetWriter(value.(io.Writer))
		set = true
	}
	return
}

func (r *GoResponse) Header() revel.ServerHeader {
	return r.Goheader
}
func (r *GoResponse) GetRaw() interface{} {
	return r.Original
}
func (r *GoResponse) SetWriter(writer io.Writer) {
	r.Writer = writer
}
func (r *GoResponse) WriteStream(name string, contentlen int64, modtime time.Time, reader io.Reader) error {
	// Check to see if the output stream is modified, if not send it using the
	// Native writer
	written := false
	if _, ok := r.Writer.(http.ResponseWriter); ok {
		if rs, ok := reader.(io.ReadSeeker); ok {
			http.ServeContent(r.Original, r.Request.Original, name, modtime, rs)
			written = true
		}
	}
	if !written {
		// Else, do a simple io.Copy.
		ius := r.Request.Original.Header.Get("If-Unmodified-Since")
		if t, err := http.ParseTime(ius); err == nil && !modtime.IsZero() {
			// The Date-Modified header truncates sub-second precision, so
			// use mtime < t+1s instead of mtime <= t to check for unmodified.
			if modtime.Before(t.Add(1 * time.Second)) {
				h := r.Original.Header()
				delete(h, "Content-Type")
				delete(h, "Content-Length")
				if h.Get("Etag") != "" {
					delete(h, "Last-Modified")
				}
				r.Original.WriteHeader(http.StatusNotModified)
				return nil
			}
		}

		if contentlen != -1 {
			header := revel.ServerHeader(r.Goheader)
			if writer,found := r.Writer.(*revel.CompressResponseWriter);found {
				header = revel.ServerHeader(writer.Header)
			}
			header.Set("Content-Length", strconv.FormatInt(contentlen, 10))
		}
		if _, err := io.Copy(r.Writer, reader); err != nil {
			r.Original.WriteHeader(http.StatusInternalServerError)
			return err
		} else {
			r.Original.WriteHeader(http.StatusOK)
		}
	}
	return nil
}

func (r *GoResponse) Destroy() {
	if c, ok := r.Writer.(io.Closer); ok {
		c.Close()
	}
	r.Goheader.Source = nil
	r.Original = nil
	r.Writer = nil
}

func (r *GoResponse) SetResponse(w http.ResponseWriter) {
	r.Original = w
	r.Writer = w
	r.Goheader.Source = r
	r.Goheader.isResponse = true

}
func (r *GoHeader) SetCookie(cookie string) {
	if r.isResponse {
		r.Source.(*GoResponse).Original.Header().Add("Set-Cookie", cookie)
	}
}
func (r *GoHeader) GetCookie(key string) (value revel.ServerCookie, err error) {
	if !r.isResponse {
		var cookie *http.Cookie
		if cookie, err = r.Source.(*GoRequest).Original.Cookie(key); err == nil {
			value = GoCookie(*cookie)

		}

	}
	return
}
func (r *GoHeader) Set(key string, value string) {
	if r.isResponse {
		r.Source.(*GoResponse).Original.Header().Set(key, value)
	}
}
func (r *GoHeader) Add(key string, value string) {
	if r.isResponse {
		r.Source.(*GoResponse).Original.Header().Add(key, value)
	}
}
func (r *GoHeader) Del(key string) {
	if r.isResponse {
		r.Source.(*GoResponse).Original.Header().Del(key)
	}
}
func (r *GoHeader) Get(key string) (value []string) {
	if !r.isResponse {
		value = r.Source.(*GoRequest).Original.Header[key]
		if len(value) == 0 {
			if ihead := r.Source.(*GoRequest).Original.Header.Get(key); ihead != "" {
				value = append(value, ihead)
			}
		}
	} else {
		value = r.Source.(*GoResponse).Original.Header()[key]
	}
	return
}
func (r *GoHeader) SetStatus(statusCode int) {
	if r.isResponse {
		r.Source.(*GoResponse).Original.WriteHeader(statusCode)
	}
}
func (r GoCookie) GetValue() string {
	return r.Value
}
func (f *GoMultipartForm) GetFiles() map[string][]*multipart.FileHeader {
	return f.Form.File
}
func (f *GoMultipartForm) GetValues() url.Values {
	return url.Values(f.Form.Value)
}
func (f *GoMultipartForm) RemoveAll() error {
	return f.Form.RemoveAll()
}
func (g *GoWebSocket) MessageSendJSON(v interface{}) error {
	return websocket.JSON.Send(g.Conn, v)
}
func (g *GoWebSocket) MessageReceiveJSON(v interface{}) error {
	return websocket.JSON.Receive(g.Conn, v)
}
