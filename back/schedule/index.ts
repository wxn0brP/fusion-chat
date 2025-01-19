import schedule from "node-schedule";
import actions, { Actions } from "./actions/index";
import db from "../dataBase";
import { Id } from "../types/base";
import Db_System from "../types/db/system";

export const activeTasks = new Map<Id, schedule.Job>();

function performTask(actionType: Actions, data: any, taskId: Id){
	const action = actions[actionType];
	if(!action) return console.log(`Unknown action type: ${actionType}`);
	action(data, taskId);
}

function scheduleOneTimeTask(task: Db_System.task){
	const { _id, type, sTime, data } = task;

	let scheduledDate = new Date();
	if(typeof sTime == "string") scheduledDate = new Date(sTime);
	else if(typeof sTime == "number") scheduledDate = new Date(sTime * 1000);

	const currentTime = new Date();
	const timeDiff = scheduledDate.getTime() - currentTime.getTime();

	if(timeDiff <= 10000){ // if < 10s or space the time run now
		performTask(type, data, _id);
	}else{
		const job = schedule.scheduleJob(_id, scheduledDate, () => {
			if(!activeTasks.has(_id)) return;

			performTask(type, data, _id);
			activeTasks.delete(_id);
		});

		activeTasks.set(_id, job);
	}
}

function processTask(task: Db_System.task){
	if(task.sType === "one-time")
		scheduleOneTimeTask(task);
}

db.system.find<Db_System.task>("tasks", {}).then(tasks => {
	tasks.forEach(task => processTask(task));
});

export function cancelTask(taskId: Id){
	if(!activeTasks.has(taskId)) return;
	activeTasks.delete(taskId);
	const task = activeTasks.get(taskId)
	task.cancel();
}

export async function addTask(taskReq: Omit<Db_System.task, "_id">) {
	const task = await db.system.add<Db_System.task>("tasks", taskReq);
	processTask(task);
}