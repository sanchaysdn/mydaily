var baseUrl = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
//var baseUrl = "http://localhost:6020";

var webservices = {	

	"authenticate" : baseUrl + "/api/adminLogin",
	"forgot_password" : baseUrl + "/api/forgotPassword",
	"uploadImage": baseUrl + "/api/uploadImage",
	
	//user
	"addUser" : baseUrl + "/users/add",
	"userList" : baseUrl + "/users/list",
	"findOneUser" : baseUrl + "/users/userOne",
	"bulkUpdateUser" : baseUrl + "/users/bulkUpdate",
	"update" : baseUrl + "/users/update",

	//School
	"addSchool" : baseUrl + "/schools/add",
	"schoolList" : baseUrl + "/api/getInstituteList",
	"findOneSchool" : baseUrl + "/schools/schoolOne",
	"bulkUpdateSchool" : baseUrl + "/schools/bulkUpdate",
	"update" : baseUrl + "/schools/update"
}
var appConstants = {

	"authorizationKey": "dGF4aTphcHBsaWNhdGlvbg=="	
}

var headerConstants = {
	"json": "application/json"
}