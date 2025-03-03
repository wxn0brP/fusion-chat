import { InternalCodeType } from "../../types/code";

const InternalCode: InternalCodeType = {
    Info: {
        General: {},
        Socket: {},
        Express: {}
    },
    Success: {
        General: {},
        Socket: {},
        Express: {}
    },
    RedirectOrWaiting: {
        General: {},
        Socket: {},
        Express: {}
    },
    UserError: {
        General: {},
        Socket: {
            "41.001": "Not Authorized",
            "41.002": "Chat Not Found",
            "41.003": "Channel Not Found",
            "41.004": "No Permission To Write Message",
            "41.005": "DM Blocked",
            "41.006": "DM Not Found",
            "41.007": "DM Create Self",
            "41.008": "DM User Not Found",
            "41.009": "DM Already Exists",
            "41.010": "Realm Join Already Joined",
            "41.011": "Realm Join User Is Banned",
            "41.012": "User Is Not On Realm",
            "41.013": "DM Block Already Blocked",
            "41.014": "Friend Request User Not Found",
            "41.015": "Friend Request Self",
            "41.016": "Friend Request Already Friend",
            "41.017": "Friend Request Already Sent",
            "41.018": "Friend Response Already Friend",
            "41.019": "Friend Remove Friend Not Found",
            "41.020": "User Profile User Not Found",
            "41.021": "Message Edit Message Not Found",
            "41.022": "Message Edit Not Authorized",
            "41.023": "Message Delete Message Not Found",
            "41.024": "Message Delete Not Authorized",
            "41.025": "Messages Delete Message Not Found",
            "41.026": "Messages Delete Not Authorized",
            "41.027": "Message Fetch Channel Not Found",
            "41.028": "Message Fetch Id Channel Not Found",
            "41.029": "Message React Message Not Found",
            "41.030": "Message React Not Authorized",
            "41.031": "Realm Setup Realm Not Found",
            "41.032": "Realm Edit Not Authorized",
            "41.033": "Realm Announcement Subscribe Already Subscribed",
            "41.034": "Thread Delete Not Found",
            "41.035": "Thread Delete Not Authorized",
            "41.036": "Realm Event Join Already Joined",
            "41.037": "Realm Event Get Topic Not Found",
            "41.038": "Realm Webhook Token Get Not Found",
            "41.039": "Realm Settings Set Insufficient Permissions",
            "41.040": "Dev Panel Bot Not Found",
            "41.041": "Get Threads list",
            "41.042": "User Not In Realm",
        },
        Express: {
            "42.001": "IP Banned",
            "42.002": "Auth Error Token Required",
            "42.003": "Auth Error Invalid Token",
            "42.004": "Missing Parameters",
            "42.005": "Delete Account Get Invalid Token",
            "42.006": "Delete Account Get User Not Found",
            "42.007": "Delete Account Confirm Invalid Token",
            "42.008": "Delete Account Confirm User Not Found",
            "42.009": "Delete Account Confirm Invalid Password",
            "42.010": "Delete Account Confirm Already Pending",
            "42.011": "Delete Account Undo Invalid Token",
            "42.012": "Delete Account Undo Pending Not Found",
            "42.013": "Login Invalid Credentials",
            "42.014": "Register Username Taken",
            "42.015": "Register Email Taken",
            "42.016": "Register Invalid Name",
            "42.017": "Register Invalid Password",
            "42.018": "Register Verify Invalid Session",
            "42.019": "Register Verify Too Many Attempts",
            "42.020": "Register Verify Invalid Code",
            "42.021": "Announcement Channel Is Not Open",
            "42.022": "Bot Invite Not Found",
            "42.023": "Fire Token Invalid FC Token",
            "42.024": "Realm Join",
            "42.025": "Realm Profile Upload No Permissions",
            "42.026": "File Upload No File",
            "42.027": "Upload Error",
            "42.028": "Emoji Upload No Permissions",
            "42.029": "Emoji Upload Limit",
            "42.030": "User File Files Limit",
            "42.031": "User File Size Limit",
            "42.032": "User Profile No File",
            "42.033": "Bot Id Bot Not Found",
            "42.034": "Chat Id Not Found",
            "42.035": "Event Id Not Found",
            "42.036": "User Id Not Found",
            "42.037": "Webhook Id Not Found",
            "42.038": "Invite Bot Not Permission"
        }
    },
    ServerError: {
        General: {},
        Socket: {
            "51.001": "OG Embed Error Fetching",
            "51.002": "Realm Settings Set Failed"
        },
        Express: {
            "52.001": "Authorization Error",
            "52.002": "Register Failed To Send Email",
            "52.003": "Register Verify Failed To Register User",
            "52.004": "Upload Error"
        }
    }
};

export default InternalCode;