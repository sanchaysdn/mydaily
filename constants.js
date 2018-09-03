//Constant variables are declared here.
const config = {
    "cryptoAlgorithm": "aes-256-ctr",
    "cryptoPassword": 'd6F3Efeq',
    "secret": "myDaily"
}
const messages = {
    "loginSuccess": "Logged in successfully",
     "verificationFailed":"This account is not active. Please contact us at info@getmydaily.com.",
                        
    "jobinvitesuccess":"Job Shared Successfully",
    "jobAcceptSuccess":'Job Accepted successfully',   
    "jobrejectSuccess":'Job invitation has been rejected sucessfully', 
    "jobAlreadyAssign":'Job already assign  to supervisor',
    "subscritionAlreadyExist":'Subscription already exist',
    "supervisorAssignJob":'Job assign successfully to supervisor',
    "jobAddedSuccess":'Job Created!',
    "jobGeneralInfoAddesSuccess":'Job General Info added successfully',
    "billingInfoAddedSuccess":'Job Billing Info added successfully',
    "dailyPathAddedSuccess":'Job Daily Path added successfully',
    "billableItemAddedSuccess":'Billable Item added successfully',
    "dailyUpdatedSuccess" : 'Daily updated successfully',


    "signupSuccess": "Signup successfully, please check you email to activate your account",
    "subscribeSucess": "Thank you for your interest!",
    "dataRetrievedSuccess": "Data retrieved successfully",
    "dailySavedSuccess" : "your daily has been submitted",
    "draftSavedSuccess" : "your draft has been saved",
    "errorRetreivingData": "Error in retrieving data",
    "noDataFound": "No Data Found",
    "logoutSuccess": "Successfully logout",
    "successInChangePassword": "Password changed successfully",
    "instituteSuccess": "Institute added successfully",
    "instituteUpdatedSuccess": "Institute updated successfully",
    "forgotPasswordSuccess": "Your password has been sent to the email you used to sign up.",
    "userDeleteSuccess": "User deleted successfully",
    "itemDeleteSuccess": "Item deleted successfully",
    "jobDeleteSuccess": "Job deleted successfully",
    "userAddedSuccess": "User added successfully",
    "userUpdatedSuccess": "User updated successfully",
    
    "contractorAddedSuccess": "Contractor added successfully",
    "contractorUpdatedSuccess": "Contractor updated successfully",
    "contractorDeleteSuccess": "Contractor deleted successfully",

    "myDailiesItemAddedSuccess": "My Dailies Item added successfully",
    "myDailiesItemUpdatedSuccess": "My Dailies Item updated successfully",
    "myDailiesItemDeleteSuccess": "My Dailies Item deleted successfully",
    "dailiesdraftmessage": "Your dailies has been saved",

    "incidentAddedSuccess": "your incident has been submitted",
    "incidentUpdatedSuccess": "your incident has been updated",
    "incidentDraftAddedSuccess": "your incident draft has been submitted",
    "incidentDraftUpdatedSuccess": "your incident draft has been updated",
    "incidentDeleteSuccess": "your incident has been deleted",
    "incidentdraftmessage": "Your incident has been saved",

    "subscriptionAddedSuccess": "Subscription added successfully",
    "subscriptionUpdatedSuccess": "Subscription updated successfully",
    "subscriptionDeleteSuccess": "Subscription deleted successfully",

    "subcontractorAddedSuccess": "Sub Contractor added successfully",
    "subcontractorUpdatedSuccess": "Sub Contractor updated successfully",
    "subcontractorDeleteSuccess": "Sub Contractor deleted successfully",

    "supervisorAddedSuccess": "Supervisor added successfully",
    "supervisorUpdatedSuccess": "Supervisor updated successfully",
    "supervisorDeleteSuccess": "Supervisor deleted successfully",
   
    "foremanAddedSuccess": "Foreman added successfully",
    "foremanUpdatedSuccess":"Foreman updated successfully",
    "foremanDeleteSuccess": "Foreman deleted successfully",

    "myDailiesPDF" : "Please check your email with myDailies PDF link.",
  
    "crewAddedSuccess": "Crew added successfully",
    "crewUpdatedSuccess":"Crew updated successfully",
    "crewDeleteSuccess": "Crew deleted successfully",

    "errorCardToken" : "Some problem are there to validate your card detail,can you please check again card detail",

    "newMyDailies" : "New Dailies Submitted Sucessfully",
    "dailiesUpdatedSuccess":"New Dailies updated successfully",
    "dailiesDeleteSuccess": "Dailies deleted successfully",

    "authenticationFailed": "Authentication failed!",
    "productAddedSuccess": "Product added successfully",
    "productImageAddedSuccess": "Product image added successfully",
    "logoutSuccess": "Logout successfully",
    "productStatusChangeSuccess": "Product status changed successfully",
    "productDeleteSuccess": "Product deleted successfully",
    "imageDeleteSuccess": "Image deleted successfully",
    "wishlistAddSuccess": "Added to wishlist successfully",
    "wishlistRemoveSuccess": "Item removed from wishlist successfully",
    "chatCreatedSuccess": "Chat created successfully",
    "pageUpdatedSuccess": "Page updated successfully",
    "productUpdatedSuccess": "Product updated successfully",
    "paymentSuccess": "Payment successful.",
    "transactionCancelSuccess": "Transaction canceled successfully",
    "cardDeletedSuccess": "Card deleted successfully",
    "invalidAuthoriseAccess" : "Access denid for this account",
    "invitationsent" : "Invitaion sent sucessfully"
}
const validationMessages = {
    "emailAlreadyExist": "Email ID already exists, please try again with another.",
    "jobAlreadyExist": "Job already exists, please try again with another.",
    "MyDailiesItemAlreadyExist": "My dailies item already exists, please try again with another.",
    "incidentAlreadyExist":"Incident already exist",
    "dailiesAlreadyExist":"Dailies already exist",
    "subscriptionActivation":"user can not activate plan more than one",
    "JobAlreadyExist":"This user have already job assign",
    "subscriptionAlreadyExist":"Subscription already exist",
    "titleAlreadyExist": "Title already exist, try with another",
    "usernameAlreadyExist": "Username already exist, try with another",
    "emailRequired": "Email is required",
    "firstnameRequired": "First name is required",
    "passwordRequired": "Password is required",
    "deviceTypeRequired": "Device type is required",
    "deviceIdRequired": "Device id is required",
    "deviceTokenRequired": "Device token is required",
    "invalidEmail": "Invalid Email Given",
    "invalidEmailOrPassword": "Invalid email or password",
    "internalError": "Internal error",
    "requiredFieldsMissing": "Required fields missing",
    "emailNotExist": "Email doesn't exist",
    "instituteNotFound": "Institute not found",
    "userNotFound": "User not found",
    "JobNotFound": "Job not found",
    "passwordNotMatch" : "New password should not be same as old password",
    "productNotFound": "Product not found",
    "productIdUsed": "Product id has been taken already, please use another",
    "invalidDeviceType": "Invalid device type, It should be Android or iOS",
    "eduNotContain": "Email should contain .edu example - example@example.edu",
    "bidAccepted": "Your offer has been accepted already",
    "offerPending": " Your previous offer was not accepted or rejected by the seller yet. Please wait for the seller to respond to your original bid",
    "productDeleted": "Product deleted, you can not bid on this product",
    "productInactive": "Product is inactive not for sell",
    "productSoldOut": "Product has been sold out",
    "invalidBid" : "You can not bid on your own product",
    "unauthorizedToAddProduct": "You are not authorize to add product",
    "unauthorizedToRemoveWishlist": "You are not authorize to remove this item",
    "productImageNotFound": "Product image not found",
    "booksAvailable": "Books are available for this ISBN number",
    "alreadyAddedTowishlist": "This ISBN number has been added already to the wishlist",
    "noRecordFound": "No record found",
    "notAuthorizeToRate": "You are not authorize to rate this product",
    "paymentNotComplete": "Product payment not completed yet",
    "unableToUpdateProduct": "Unable to update product, to update please reject pending offers",
    "chatAlreadyCreated": "You have already initiated the transaction for this product. It can be found in be NeoChat section.",
    "transactionInitiatedAlready": "Other buyer already initiated purchase for this item, its no more available now.",
    "pageNotFound": "Page not found",
    "notAuthorizeToMakePayment": "You are not authorize to make payment",
    "chatNotFound": "Invalid chat id, Chat not found",
    "unauthorizeToDeleteChat": "You are not authorize to cancel this transaction",
    "transactionCompletedAlready": "You can not cancel this transaction already completed",
    "documentNotFound": "Please upload identifying document, such as a passport or driver’s license",
    "documentInvalid": "Document should be jpeg, png or jpg",
    "canNotUpdateAfterVerification": "Account already verified, You can not update after account verification",
    "invalidDOB": "Date of birth should be in MM/DD/YYYY format",
    "stripeAccountNotCreated": "Seller's Stripe account not created or verified yet",
    "transactionFailed": "Transaction failed, Please try again",
    "cardLimit": "You can't save more than 3 card",
    "cardTokenNotFound": "Card token not found",
    "cardOrTokenNotFound": "Please provide customer id or card token",
    "cardNotFound": "Card not found"
}

const emailSubjects = {
    "verify_email": "Welcome to myDaily - Verify your email address ",
    "facebookLogin": "Welcome to myDaily",
    "forgotPassword": "myDaily - Forgot password",
    "sendSubscription" : "Welcome to MyDaily",
    "sendFeddback":"Welcome to MyDaily - Send your feedback"
}
var obj = {
    config: config,
    messages: messages,
    validationMessages: validationMessages,
    emailSubjects: emailSubjects
};
module.exports = obj;