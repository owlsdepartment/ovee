import { Task } from '@/utils';

import { Queue } from './Queue';
import { Fiber } from './types';

interface FiberUnit {
	task: Task;
	unit: Fiber;
	job: SchedulerJob;
}

export type SchedulerJob = (unit: Fiber) => Fiber | null;

const queue = new Queue<FiberUnit>();
let workId: number | null = null;

const isWorkLoopRunning = () => workId !== null;

function workLoop(deadline?: IdleDeadline) {
	console.log('===> workLoop work', deadline);
	const work = queue.first();

	if (!work) {
		workId = null;

		return;
	}

	let nextUnit: Fiber | null = work.unit;
	let shouldYield = false;

	while (nextUnit && !shouldYield) {
		nextUnit = work.job(nextUnit);

		if (deadline) shouldYield = deadline.timeRemaining() < 1;
	}

	if (nextUnit) {
		// we used all idle time
		work.unit = nextUnit;
	} else {
		work.task.resolve();
		queue.pop();

		if (queue.isEmpty) {
			workId = null;

			return;
		}
	}

	workId = requestCallback(workLoop);
}

export function scheduleJob(unit: Fiber, job: SchedulerJob) {
	const task = new Task();
	console.log('===> schedule job...');

	queue.push({ task, unit, job });
	startWork();

	return task;
}

function startWork() {
	console.log('===> startWork', isWorkLoopRunning());
	if (isWorkLoopRunning()) return;

	workId = requestCallback(workLoop);
}

function requestCallback(cb: typeof workLoop): number {
	console.log('===> requestCallback', !!window.requestIdleCallback);
	if (window.requestIdleCallback) return window.requestIdleCallback(cb);

	Promise.resolve().then(() => cb());

	return -1;
}
