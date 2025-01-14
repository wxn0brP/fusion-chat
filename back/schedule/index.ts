import schedule from "node-schedule";
import actions from "./actions/index.js";
import db from "../dataBase.js";

function performTask(actionType, data, taskId){
	const action = actions[actionType];
	if(!action) return console.log(`Unknown action type: ${actionType}`);
	action(data, taskId);
}

function scheduleOneTimeTask(task){
	const { _id, type, sTime, data } = task;

	let scheduledDate = new Date();
	if(typeof sTime == "string") scheduledDate = new Date(sTime);
	else if(typeof sTime == "number") scheduledDate = new Date(sTime * 1000);

	const currentTime = new Date();
	const timeDiff = scheduledDate.getTime() - currentTime.getTime();

	if(timeDiff <= 10000){ // if < 10s or space the time run now
		performTask(type, data, _id);
	}else{
		schedule.scheduleJob(_id, scheduledDate, () => {
			performTask(type, data, _id);
		});
	}
}

function processTask(task){
	if(task.sType === "one-time")
		scheduleOneTimeTask(task);
}

db.system.find("tasks", {}).then(tasks => {
	tasks.forEach(task => processTask(task));
})